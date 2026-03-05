#!/usr/bin/env python3
"""
WorkforceAutomated End-to-End Test Suite
Tests all major platform features against the production API.
"""
import requests
import json
import sys
import time
from datetime import datetime

BASE_URL = "https://workforceautomated.com/api"
RESULTS = []
TOKEN = None

def log(status, test_name, detail=""):
    icon = "✅" if status == "PASS" else "❌" if status == "FAIL" else "⚠️"
    msg = f"{icon} [{status}] {test_name}"
    if detail:
        msg += f" — {detail}"
    print(msg)
    RESULTS.append({"status": status, "test": test_name, "detail": detail})

def api(method, path, **kwargs):
    headers = kwargs.pop("headers", {})
    if TOKEN:
        headers["Authorization"] = f"Bearer {TOKEN}"
    url = f"{BASE_URL}{path}"
    try:
        resp = getattr(requests, method)(url, headers=headers, timeout=30, **kwargs)
        return resp
    except Exception as e:
        return None

# ─────────────────────────────────────────────
# 1. Health Check
# ─────────────────────────────────────────────
def test_health():
    r = api("get", "/health")
    if r and r.status_code == 200 and r.json().get("status") == "ok":
        log("PASS", "Health check", f"version={r.json().get('version')}")
    else:
        log("FAIL", "Health check", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 2. Authentication
# ─────────────────────────────────────────────
def test_auth():
    global TOKEN
    # Register a test user
    email = f"e2e_test_{int(time.time())}@workforceautomated.test"
    password = "E2eTest123!"
    r = api("post", "/auth/register", json={"email": email, "password": password, "name": "E2E Test User"})
    if r and r.status_code in (200, 201):
        TOKEN = r.json().get("token")
        log("PASS", "User registration", f"email={email}")
    else:
        log("FAIL", "User registration", f"status={r.status_code if r else 'no response'}, body={r.text[:200] if r else ''}")
        # Try login with existing test user
        r2 = api("post", "/auth/login", json={"email": "e2e@workforceautomated.test", "password": "E2eTest123!"})
        if r2 and r2.status_code == 200:
            TOKEN = r2.json().get("token")
            log("PASS", "User login (fallback)", "Used existing test account")
        else:
            log("FAIL", "User login (fallback)", "Cannot authenticate — subsequent tests may fail")
        return

    # Test login
    r = api("post", "/auth/login", json={"email": email, "password": password})
    if r and r.status_code == 200 and r.json().get("token"):
        TOKEN = r.json().get("token")
        log("PASS", "User login")
    else:
        log("FAIL", "User login", f"status={r.status_code if r else 'no response'}")

    # Test /me endpoint
    r = api("get", "/auth/me")
    if r and r.status_code == 200 and r.json().get("email"):
        log("PASS", "Auth /me endpoint", f"user={r.json().get('email')}")
    else:
        log("FAIL", "Auth /me endpoint", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 3. Agent Templates
# ─────────────────────────────────────────────
def test_agent_templates():
    r = api("get", "/agent-templates")
    if r and r.status_code == 200:
        data = r.json()
        count = data.get("total", 0)
        cats = data.get("categories", [])
        log("PASS", "Agent templates list", f"{count} templates, categories: {', '.join(cats)}")
    else:
        log("FAIL", "Agent templates list", f"status={r.status_code if r else 'no response'}")
        return

    # Test single template
    r2 = api("get", "/agent-templates/invoice-reviewer")
    if r2 and r2.status_code == 200 and r2.json().get("systemPrompt"):
        log("PASS", "Agent template by ID", "invoice-reviewer template loaded")
    else:
        log("FAIL", "Agent template by ID", f"status={r2.status_code if r2 else 'no response'}")

    # Test category filter
    r3 = api("get", "/agent-templates/category/Finance")
    if r3 and r3.status_code == 200:
        templates = r3.json().get("templates", [])
        log("PASS", "Agent templates by category", f"Finance: {len(templates)} templates")
    else:
        log("FAIL", "Agent templates by category", f"status={r3.status_code if r3 else 'no response'}")

# ─────────────────────────────────────────────
# 4. Agents CRUD
# ─────────────────────────────────────────────
AGENT_ID = None

def test_agents():
    global AGENT_ID
    # Create agent
    payload = {
        "name": "E2E Test Invoice Reviewer",
        "role": "Senior Accounts Payable Analyst",
        "description": "E2E test agent for invoice review",
        "capabilities": ["financial_analysis", "document_processing"],
        "confidenceThreshold": 80,
        "riskLevel": "medium",
        "escalationEnabled": True,
        "systemPrompt": "You are a test invoice reviewer agent. Review invoices and flag any over $10,000.",
    }
    r = api("post", "/agents", json=payload)
    if r and r.status_code in (200, 201):
        AGENT_ID = r.json().get("agent", {}).get("id")
        log("PASS", "Create agent", f"id={AGENT_ID}")
    else:
        log("FAIL", "Create agent", f"status={r.status_code if r else 'no response'}, body={r.text[:200] if r else ''}")
        return

    # List agents
    r = api("get", "/agents")
    if r and r.status_code == 200:
        agents = r.json().get("agents", [])
        log("PASS", "List agents", f"{len(agents)} agents found")
    else:
        log("FAIL", "List agents", f"status={r.status_code if r else 'no response'}")

    # Get single agent
    r = api("get", f"/agents/{AGENT_ID}")
    if r and r.status_code == 200 and r.json().get("agent"):
        log("PASS", "Get agent by ID", f"name={r.json()['agent'].get('name')}")
    else:
        log("FAIL", "Get agent by ID", f"status={r.status_code if r else 'no response'}")

    # Update agent
    r = api("put", f"/agents/{AGENT_ID}", json={"description": "Updated by E2E test"})
    if r and r.status_code == 200:
        log("PASS", "Update agent")
    else:
        log("FAIL", "Update agent", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 5. Teams CRUD
# ─────────────────────────────────────────────
TEAM_ID = None

def test_teams():
    global TEAM_ID
    if not AGENT_ID:
        log("SKIP", "Teams tests", "No agent ID available")
        return

    # Create team
    payload = {
        "name": "E2E Test Team",
        "description": "E2E test team",
        "executionMode": "sequential",
        "confidenceThreshold": 75,
        "memberAgentIds": [AGENT_ID],
    }
    r = api("post", "/teams", json=payload)
    if r and r.status_code in (200, 201):
        TEAM_ID = r.json().get("team", {}).get("id")
        log("PASS", "Create team", f"id={TEAM_ID}")
    else:
        log("FAIL", "Create team", f"status={r.status_code if r else 'no response'}, body={r.text[:200] if r else ''}")
        return

    # List teams
    r = api("get", "/teams")
    if r and r.status_code == 200:
        teams = r.json().get("teams", [])
        log("PASS", "List teams", f"{len(teams)} teams found")
    else:
        log("FAIL", "List teams", f"status={r.status_code if r else 'no response'}")

    # Get single team
    r = api("get", f"/teams/{TEAM_ID}")
    if r and r.status_code == 200:
        log("PASS", "Get team by ID")
    else:
        log("FAIL", "Get team by ID", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 6. Executions
# ─────────────────────────────────────────────
EXECUTION_ID = None

def test_executions():
    global EXECUTION_ID
    if not AGENT_ID:
        log("SKIP", "Execution tests", "No agent ID available")
        return

    # Run a basic execution (text input, no file)
    payload = {
        "agentId": AGENT_ID,
        "input": "Please review this invoice: Vendor: Acme Corp, Invoice #INV-2024-001, Amount: $15,000, Due: 2024-01-15. Line items: Software licenses $12,000, Support $3,000.",
        "outputFormat": "bullet_points",
    }
    r = api("post", "/executions", json=payload)
    if r and r.status_code in (200, 201):
        data = r.json()
        EXECUTION_ID = data.get("execution", {}).get("id")
        confidence = data.get("execution", {}).get("confidenceScore")
        log("PASS", "Run execution (text input)", f"id={EXECUTION_ID}, confidence={confidence}")
    else:
        log("FAIL", "Run execution (text input)", f"status={r.status_code if r else 'no response'}, body={r.text[:300] if r else ''}")
        return

    # List executions
    r = api("get", "/executions")
    if r and r.status_code == 200:
        execs = r.json().get("executions", [])
        log("PASS", "List executions", f"{len(execs)} executions found")
    else:
        log("FAIL", "List executions", f"status={r.status_code if r else 'no response'}")

    # Get single execution
    r = api("get", f"/executions/{EXECUTION_ID}")
    if r and r.status_code == 200 and r.json().get("execution"):
        exec_data = r.json()["execution"]
        log("PASS", "Get execution by ID", f"status={exec_data.get('status')}, risk={exec_data.get('riskLevel')}")
    else:
        log("FAIL", "Get execution by ID", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 7. Review Queue
# ─────────────────────────────────────────────
def test_reviews():
    # List reviews
    r = api("get", "/reviews")
    if r and r.status_code == 200:
        reviews = r.json().get("reviews", [])
        pending = r.json().get("pendingCount", 0)
        log("PASS", "List reviews", f"{len(reviews)} reviews, {pending} pending")
    else:
        log("FAIL", "List reviews", f"status={r.status_code if r else 'no response'}")

    # Pending count
    r = api("get", "/reviews/pending-count")
    if r and r.status_code == 200:
        count = r.json().get("count", 0)
        log("PASS", "Pending review count", f"count={count}")
    else:
        log("FAIL", "Pending review count", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 8. Schedules
# ─────────────────────────────────────────────
SCHEDULE_ID = None

def test_schedules():
    global SCHEDULE_ID
    if not AGENT_ID:
        log("SKIP", "Schedule tests", "No agent ID available")
        return

    # Create schedule
    payload = {
        "name": "E2E Test Schedule",
        "agentId": AGENT_ID,
        "frequency": "weekly",
        "taskInput": "Run weekly invoice review",
        "outputFormat": "formal_report",
        "isActive": False,
    }
    r = api("post", "/schedules", json=payload)
    if r and r.status_code in (200, 201):
        SCHEDULE_ID = r.json().get("schedule", {}).get("id")
        log("PASS", "Create schedule", f"id={SCHEDULE_ID}")
    else:
        log("FAIL", "Create schedule", f"status={r.status_code if r else 'no response'}, body={r.text[:200] if r else ''}")
        return

    # List schedules
    r = api("get", "/schedules")
    if r and r.status_code == 200:
        schedules = r.json().get("schedules", [])
        log("PASS", "List schedules", f"{len(schedules)} schedules found")
    else:
        log("FAIL", "List schedules", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 9. Reports
# ─────────────────────────────────────────────
def test_reports():
    # Summary stats
    r = api("get", "/reports/summary")
    if r and r.status_code == 200:
        data = r.json()
        log("PASS", "Reports summary", f"total={data.get('totalExecutions')}, escalation_rate={data.get('escalationRate')}")
    else:
        log("FAIL", "Reports summary", f"status={r.status_code if r else 'no response'}")

    # CSV export
    r = api("get", "/reports/export/csv")
    if r and r.status_code == 200 and "text/csv" in r.headers.get("Content-Type", ""):
        log("PASS", "CSV export", f"size={len(r.content)} bytes")
    else:
        log("FAIL", "CSV export", f"status={r.status_code if r else 'no response'}, content-type={r.headers.get('Content-Type') if r else 'none'}")

    # PDF export
    r = api("get", "/reports/export/pdf")
    if r and r.status_code == 200 and "application/pdf" in r.headers.get("Content-Type", ""):
        log("PASS", "PDF export", f"size={len(r.content)} bytes")
    else:
        log("FAIL", "PDF export", f"status={r.status_code if r else 'no response'}, content-type={r.headers.get('Content-Type') if r else 'none'}")

# ─────────────────────────────────────────────
# 10. Integrations
# ─────────────────────────────────────────────
INTEGRATION_ID = None

def test_integrations():
    global INTEGRATION_ID
    # Create integration
    payload = {
        "name": "E2E Test REST API",
        "type": "rest_api",
        "config": {"baseUrl": "https://httpbin.org", "authType": "none"},
    }
    r = api("post", "/integrations", json=payload)
    if r and r.status_code in (200, 201):
        INTEGRATION_ID = r.json().get("integration", {}).get("id")
        log("PASS", "Create integration", f"id={INTEGRATION_ID}")
    else:
        log("FAIL", "Create integration", f"status={r.status_code if r else 'no response'}, body={r.text[:200] if r else ''}")
        return

    # List integrations
    r = api("get", "/integrations")
    if r and r.status_code == 200:
        integrations = r.json().get("integrations", [])
        log("PASS", "List integrations", f"{len(integrations)} integrations found")
    else:
        log("FAIL", "List integrations", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 11. Notifications
# ─────────────────────────────────────────────
def test_notifications():
    # Get notification settings
    r = api("get", "/notifications/settings")
    if r and r.status_code == 200:
        log("PASS", "Get notification settings")
    else:
        log("FAIL", "Get notification settings", f"status={r.status_code if r else 'no response'}")

    # Update notification settings
    payload = {
        "emailEnabled": False,
        "slackEnabled": False,
        "notifyOnCritical": True,
        "notifyOnHigh": True,
        "notifyOnLowConfidence": False,
    }
    r = api("put", "/notifications/settings", json=payload)
    if r and r.status_code == 200:
        log("PASS", "Update notification settings")
    else:
        log("FAIL", "Update notification settings", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 12. Audit Log
# ─────────────────────────────────────────────
def test_audit():
    r = api("get", "/audit")
    if r and r.status_code == 200:
        logs = r.json().get("logs", [])
        log("PASS", "Audit log", f"{len(logs)} entries")
    else:
        log("FAIL", "Audit log", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# 13. Cleanup
# ─────────────────────────────────────────────
def test_cleanup():
    if SCHEDULE_ID:
        r = api("delete", f"/schedules/{SCHEDULE_ID}")
        if r and r.status_code in (200, 204):
            log("PASS", "Cleanup: delete schedule")
        else:
            log("WARN", "Cleanup: delete schedule", f"status={r.status_code if r else 'no response'}")

    if INTEGRATION_ID:
        r = api("delete", f"/integrations/{INTEGRATION_ID}")
        if r and r.status_code in (200, 204):
            log("PASS", "Cleanup: delete integration")
        else:
            log("WARN", "Cleanup: delete integration", f"status={r.status_code if r else 'no response'}")

    if AGENT_ID:
        r = api("delete", f"/agents/{AGENT_ID}")
        if r and r.status_code in (200, 204):
            log("PASS", "Cleanup: delete agent")
        else:
            log("WARN", "Cleanup: delete agent", f"status={r.status_code if r else 'no response'}")

# ─────────────────────────────────────────────
# Run all tests
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print(f"\n{'='*60}")
    print(f"WorkforceAutomated E2E Test Suite")
    print(f"Target: {BASE_URL}")
    print(f"Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"{'='*60}\n")

    test_health()
    test_auth()
    test_agent_templates()
    test_agents()
    test_teams()
    test_executions()
    test_reviews()
    test_schedules()
    test_reports()
    test_integrations()
    test_notifications()
    test_audit()
    test_cleanup()

    # Summary
    passed = sum(1 for r in RESULTS if r["status"] == "PASS")
    failed = sum(1 for r in RESULTS if r["status"] == "FAIL")
    warned = sum(1 for r in RESULTS if r["status"] in ("WARN", "SKIP"))
    total = len(RESULTS)

    print(f"\n{'='*60}")
    print(f"RESULTS: {passed}/{total} passed | {failed} failed | {warned} warnings/skips")
    print(f"{'='*60}")

    if failed > 0:
        print("\nFailed tests:")
        for r in RESULTS:
            if r["status"] == "FAIL":
                print(f"  ❌ {r['test']}: {r['detail']}")
        sys.exit(1)
    else:
        print("\n✅ All tests passed.")
        sys.exit(0)
