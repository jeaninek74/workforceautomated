import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Dashboard Overview",
    subtitle: "Your command center for all workforce automation",
    description:
      "The Dashboard gives you a real-time view of every agent running across your organization. See active executions, pending reviews, KPI performance, and audit events — all in one place.",
    visual: "dashboard",
  },
  {
    id: 2,
    title: "Build an Agent in 3 Minutes",
    subtitle: "No code. No engineers. Just describe the task.",
    description:
      "Select a department, choose a skill template (Invoice Review, Contract Analysis, HR Screening, etc.), connect your data source, and set the confidence threshold. Your agent is live.",
    visual: "builder",
  },
  {
    id: 3,
    title: "Connect Your Backend",
    subtitle: "REST API, database, or webhook — connected in seconds",
    description:
      "Assign real integrations to your agent. The agent queries your API, reads your database, or fires your webhook during execution — in real time, within the exact permissions you set. Every data access is logged.",
    visual: "integration",
  },
  {
    id: 4,
    title: "Agents Execute Work",
    subtitle: "Watch automation happen in real time",
    description:
      "Agents process tasks continuously. Every action is scored for confidence. High-confidence tasks complete automatically. Low-confidence tasks are routed to your Review Queue for human sign-off.",
    visual: "execution",
  },
  {
    id: 5,
    title: "Review Queue",
    subtitle: "Humans stay in control — always",
    description:
      "Any task below your confidence threshold lands here. Approve or override. Every decision is logged permanently to the immutable audit trail.",
    visual: "review",
  },
  {
    id: 6,
    title: "Security & Audit Log",
    subtitle: "Zero-knowledge encryption. Full compliance.",
    description:
      "Every agent action, every human override, every data access is recorded with AES-256-GCM encryption. Export audit logs for SOC2, HIPAA, or GDPR compliance reviews in one click.",
    visual: "audit",
  },
  {
    id: 7,
    title: "Ready to Automate?",
    subtitle: "Set up your first agent in under 5 minutes",
    description:
      "Start with one department. Connect your data. Let your agents handle the repetitive work while your team focuses on decisions that matter.",
    visual: "cta",
  },
];

// ─── Mock visuals ─────────────────────────────────────────────────────────────
function DashboardVisual() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 16 }}>WorkforceAutomated</span>
        <span style={{ fontSize: 11, background: "#f0fdfa", color: "#0d9488", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>● Live</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active Agents", value: "12", delta: "+3 today", color: "#0d9488" },
          { label: "Tasks Completed", value: "1,847", delta: "this week", color: "#2563eb" },
          { label: "Pending Review", value: "4", delta: "needs attention", color: "#d97706" },
          { label: "Audit Coverage", value: "100%", delta: "fully compliant", color: "#16a34a" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#f9fafb", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, marginTop: 2 }}>{stat.delta}</div>
          </div>
        ))}
      </div>
      <div>
        {[
          { agent: "Invoice Reviewer", dept: "Finance", status: "Running", tasks: 23 },
          { agent: "Contract Analyst", dept: "Legal", status: "Running", tasks: 8 },
          { agent: "HR Screener", dept: "Human Resources", status: "Review", tasks: 2 },
        ].map((row) => (
          <div key={row.agent} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{row.agent}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{row.dept}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{row.tasks} tasks</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, fontWeight: 600, background: row.status === "Running" ? "#f0fdfa" : "#fffbeb", color: row.status === "Running" ? "#0d9488" : "#d97706" }}>{row.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuilderVisual() {
  const [step, setStep] = useState(0);
  const steps = ["Choose Department", "Select Template", "Set Threshold", "Agent Live ✓"];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ fontWeight: 700, color: "#111827", fontSize: 15, marginBottom: 16 }}>New Agent Setup</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div onClick={() => setStep(i)} style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, cursor: "pointer", background: i <= step ? "#0d9488" : "#e5e7eb", color: i <= step ? "#fff" : "#9ca3af", flexShrink: 0 }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "#0d9488" : "#e5e7eb", margin: "0 4px" }} />}
          </div>
        ))}
      </div>
      {step === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {["Finance", "Legal", "HR", "Sales", "IT", "Support"].map((dept) => (
            <button key={dept} onClick={() => setStep(1)} style={{ padding: "10px 8px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>{dept}</button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Invoice Reviewer", "AP Reconciliation", "Expense Auditor", "Budget Variance Analyzer"].map((tmpl) => (
            <button key={tmpl} onClick={() => setStep(2)} style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", cursor: "pointer", textAlign: "left" }}>{tmpl}</button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Auto-complete tasks above this confidence score:</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[70, 80, 90, 95].map((val) => (
              <button key={val} onClick={() => setStep(3)} style={{ flex: 1, padding: "12px 8px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#374151", background: "#fff", cursor: "pointer" }}>{val}%</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Tasks below threshold go to Review Queue for human approval.</p>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>✓</div>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 16, marginBottom: 4 }}>Invoice Reviewer is Live</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Your agent is processing invoices now.</div>
          <button onClick={() => setStep(0)} style={{ fontSize: 12, color: "#0d9488", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Start over</button>
        </div>
      )}
    </div>
  );
}

function ExecutionVisual() {
  const tasks = [
    { id: "INV-2041", desc: "ACME Corp invoice $12,450", confidence: 94, status: "auto-approved" },
    { id: "INV-2042", desc: "GlobalTech invoice $8,200", confidence: 88, status: "auto-approved" },
    { id: "INV-2043", desc: "Vendor X invoice $67,000 — missing PO", confidence: 42, status: "review-queue" },
    { id: "INV-2044", desc: "Office Supplies $340", confidence: 97, status: "auto-approved" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Invoice Reviewer — Live Execution</span>
        <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>● Processing</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af" }}>{task.id}</div>
              <div style={{ fontSize: 13, color: "#374151" }}>{task.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: task.confidence >= 80 ? "#0d9488" : "#d97706" }}>{task.confidence}%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>confidence</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, fontWeight: 600, whiteSpace: "nowrap", background: task.status === "auto-approved" ? "#f0fdfa" : "#fffbeb", color: task.status === "auto-approved" ? "#0d9488" : "#d97706" }}>
                {task.status === "auto-approved" ? "Auto-approved" : "→ Review Queue"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewVisual() {
  const [approved, setApproved] = useState<string[]>([]);
  const items = [
    { id: "INV-2043", desc: "Vendor X invoice $67,000 — missing PO number", agent: "Invoice Reviewer", reason: "Amount exceeds $50K threshold + missing PO" },
    { id: "CTR-0891", desc: "Software license renewal — auto-renew clause", agent: "Contract Analyst", reason: "Auto-renew clause detected, requires human sign-off" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Review Queue</span>
        <span style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{items.length - approved.length} pending</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={{ padding: 14, border: `1px solid ${approved.includes(item.id) ? "#a7f3d0" : "#fde68a"}`, borderRadius: 10, background: approved.includes(item.id) ? "#f0fdf4" : "#fffbeb", opacity: approved.includes(item.id) ? 0.7 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af", marginBottom: 4 }}>{item.id} · {item.agent}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{item.desc}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>⚠ {item.reason}</div>
              </div>
              {!approved.includes(item.id) ? (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setApproved([...approved, item.id])} style={{ fontSize: 12, padding: "6px 12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                  <button style={{ fontSize: 12, padding: "6px 12px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Override</button>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 600, flexShrink: 0 }}>✓ Approved</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditVisual() {
  const events = [
    { time: "14:32:01", event: "Invoice INV-2041 auto-approved", actor: "Invoice Reviewer", hash: "a3f9c2..." },
    { time: "14:32:04", event: "Invoice INV-2043 sent to Review Queue", actor: "Invoice Reviewer", hash: "b7d1e8..." },
    { time: "14:33:17", event: "Human approved INV-2043", actor: "Sarah M.", hash: "c2a4f1..." },
    { time: "14:35:02", event: "Contract CTR-0891 flagged for review", actor: "Contract Analyst", hash: "d9b3c7..." },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Immutable Audit Log</span>
        <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>🔒 Encrypted</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#f9fafb", borderRadius: 6, fontFamily: "monospace", fontSize: 11 }}>
            <span style={{ color: "#9ca3af", flexShrink: 0 }}>{ev.time}</span>
            <span style={{ color: "#374151", flex: 1 }}>{ev.event}</span>
            <span style={{ color: "#0d9488", flexShrink: 0 }}>{ev.actor}</span>
            <span style={{ color: "#d1d5db", flexShrink: 0 }}>{ev.hash}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 6, color: "#374151", background: "#fff", cursor: "pointer" }}>Export CSV</button>
        <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 6, color: "#374151", background: "#fff", cursor: "pointer" }}>Export PDF</button>
        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto", alignSelf: "center" }}>SOC2 · HIPAA · GDPR ready</span>
      </div>
    </div>
  );
}

function CTAVisual() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 40, width: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>You've seen what's possible.</h3>
      <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>Set up your first agent in under 5 minutes.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
        <Link to="/register">
          <a style={{ display: "block", padding: "12px 0", background: "#0d9488", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Start Free Trial
          </a>
        </Link>
        <Link to="/custom-build">
          <a style={{ display: "block", padding: "12px 0", border: "1px solid #0d9488", color: "#0d9488", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Build Your Custom Plan
          </a>
        </Link>
      </div>
    </div>
  );
}

function IntegrationVisual() {
  const [stage, setStage] = useState(0);
  const [selectedIntegration, setSelectedIntegration] = useState<string | null>(null);
  const [assigned, setAssigned] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [done, setDone] = useState(false);

  const integrations = [
    { id: "ap-api", label: "Accounts Payable REST API", type: "REST API", url: "https://erp.acme.com/api/invoices", color: "#2563eb" },
    { id: "db", label: "Finance Database (PostgreSQL)", type: "Database", url: "postgres://finance-db.acme.com:5432/erp", color: "#7c3aed" },
    { id: "webhook", label: "Approval Webhook", type: "Webhook", url: "https://hooks.acme.com/invoice-approved", color: "#d97706" },
  ];

  const handleAssign = () => {
    setAssigned(true);
    setStage(2);
  };

  const handleExecute = () => {
    setExecuting(true);
    setTimeout(() => { setExecuting(false); setDone(true); setStage(3); }, 2200);
  };

  const reset = () => { setStage(0); setSelectedIntegration(null); setAssigned(false); setExecuting(false); setDone(false); };

  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      {/* Stage indicator */}
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        {["Connect", "Assign", "Execute", "Done"].map((s, i) => (
          <div key={s} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div style={{ width: 24, height: 24, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, background: i <= stage ? "#0d9488" : "#e5e7eb", color: i <= stage ? "#fff" : "#9ca3af" }}>
              {i < stage ? "\u2713" : i + 1}
            </div>
            <div style={{ fontSize: 10, color: i <= stage ? "#0d9488" : "#9ca3af", fontWeight: 600, marginLeft: 4, flex: 1 }}>{s}</div>
            {i < 3 && <div style={{ width: 16, height: 2, background: i < stage ? "#0d9488" : "#e5e7eb", marginRight: 4 }} />}
          </div>
        ))}
      </div>

      {/* Stage 0: Choose integration */}
      {stage === 0 && (
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 12 }}>Select a system to connect:</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {integrations.map((intg) => (
              <button key={intg.id} onClick={() => { setSelectedIntegration(intg.id); setStage(1); }} style={{ padding: "12px 14px", border: `1px solid ${selectedIntegration === intg.id ? "#0d9488" : "#e5e7eb"}`, borderRadius: 8, background: "#f9fafb", cursor: "pointer", textAlign: "left", display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 12, background: intg.color + "18", color: intg.color }}>{intg.type}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{intg.label}</div>
                  <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>{intg.url}</div>
                </div>
                <span style={{ fontSize: 13, color: "#0d9488" }}>→</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stage 1: Assign to agent */}
      {stage === 1 && selectedIntegration && (() => {
        const intg = integrations.find(i => i.id === selectedIntegration)!;
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Connection added: <span style={{ color: "#0d9488" }}>{intg.label}</span></div>
            <div style={{ fontSize: 12, color: "#9ca3af", fontFamily: "monospace", marginBottom: 16 }}>{intg.url}</div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 10 }}>Assign to agent:</div>
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
              {["Invoice Reviewer", "Contract Analyst", "AP Reconciliation Agent"].map((agent, i) => (
                <div key={agent} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderBottom: i < 2 ? "1px solid #f3f4f6" : "none", background: i === 0 ? "#f0fdfa" : "#fff" }}>
                  <div style={{ fontSize: 13, fontWeight: i === 0 ? 600 : 400, color: i === 0 ? "#111827" : "#6b7280" }}>{agent}</div>
                  {i === 0 ? (
                    <button onClick={handleAssign} style={{ fontSize: 12, padding: "5px 12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Assign</button>
                  ) : (
                    <span style={{ fontSize: 11, color: "#d1d5db" }}>Select</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Stage 2: Execute */}
      {stage === 2 && selectedIntegration && (() => {
        const intg = integrations.find(i => i.id === selectedIntegration)!;
        return (
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>Invoice Reviewer now has access to:</div>
            <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: "#0d9488", fontFamily: "monospace" }}>✓ {intg.label}</div>
              <div style={{ fontSize: 11, color: "#9ca3af", fontFamily: "monospace", marginTop: 2 }}>{intg.url}</div>
            </div>
            <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 16 }}>The agent will query this system during task execution. Ready to run?</div>
            <button onClick={handleExecute} disabled={executing} style={{ width: "100%", padding: "12px 0", background: executing ? "#99f6e4" : "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: executing ? "default" : "pointer" }}>
              {executing ? "Agent executing..." : "Run Invoice Reviewer"}
            </button>
            {executing && (
              <div style={{ marginTop: 14, fontFamily: "monospace", fontSize: 11, display: "flex", flexDirection: "column", gap: 4 }}>
                <div style={{ color: "#9ca3af" }}>14:32:01 — GET {intg.url}/INV-2041...</div>
                <div style={{ color: "#0d9488" }}>→ 200 OK · $12,450 · ACME Corp</div>
                <div style={{ color: "#9ca3af" }}>Scoring confidence...</div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Stage 3: Done */}
      {stage === 3 && (
        <div>
          <div style={{ textAlign: "center", padding: "8px 0 16px" }}>
            <div style={{ width: 48, height: 48, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 10px", fontSize: 22 }}>✓</div>
            <div style={{ fontSize: 15, fontWeight: 700, color: "#111827", marginBottom: 4 }}>Execution complete</div>
            <div style={{ fontSize: 13, color: "#6b7280" }}>Agent used live data from your backend</div>
          </div>
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: "12px 14px", fontFamily: "monospace", fontSize: 11, marginBottom: 14 }}>
            <div style={{ color: "#9ca3af", marginBottom: 3 }}>14:32:01 — Fetched INV-2041 from API</div>
            <div style={{ color: "#0d9488", marginBottom: 3 }}>→ $12,450 · ACME Corp · Confidence: 94%</div>
            <div style={{ color: "#9ca3af", marginBottom: 3 }}>14:32:02 — Auto-approved (above threshold)</div>
            <div style={{ color: "#374151" }}>14:32:02 — Audit log entry written ✓</div>
          </div>
          <button onClick={reset} style={{ fontSize: 12, color: "#0d9488", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Try again</button>
        </div>
      )}
    </div>
  );
}

const VISUALS: Record<string, JSX.Element> = {
  dashboard: <DashboardVisual />,
  builder: <BuilderVisual />,
  integration: <IntegrationVisual />,
  execution: <ExecutionVisual />,
  review: <ReviewVisual />,
  audit: <AuditVisual />,
  cta: <CTAVisual />,
};

// Loom video IDs — v4 uploads
const LOOM_VIDEOS = [
  {
    id: "94cb25f1e6f949a79f81bfc0c675c55d",
    title: "Short Demo — See It in 2 Minutes",
    desc: "Watch an AI agent get built, run, and reviewed in under 2 minutes.",
    duration: "2 min 4 sec",
    badge: "Quick Overview",
    badgeColor: "#0d9488",
  },
  {
    id: "8358185aba5f45dab808f7277fd42182",
    title: "Full Walkthrough — Every Feature Explained",
    desc: "A complete tour: agent builder, execution console, governance, integrations, audit log, and more.",
    duration: "4 min 2 sec",
    badge: "Full Tour",
    badgeColor: "#7c3aed",
  },
];

const TESTIMONIALS = [
  {
    quote: "We used to spend 3 days every month manually reviewing invoices. Now our agent does it overnight. I just check the flagged ones in the morning.",
    name: "Sarah M.",
    role: "Finance Director",
    company: "Mid-size Manufacturing Company",
    initials: "SM",
    color: "#0d9488",
  },
  {
    quote: "I was skeptical at first. But I had my first agent running in literally 4 minutes. It was easier than setting up a new email account.",
    name: "James T.",
    role: "Operations Manager",
    company: "Regional Healthcare Group",
    initials: "JT",
    color: "#7c3aed",
  },
  {
    quote: "The audit log feature alone was worth it for us. Our compliance team can now pull a full record of every AI action in seconds.",
    name: "Rachel K.",
    role: "Chief Compliance Officer",
    company: "Financial Services Firm",
    initials: "RK",
    color: "#2563eb",
  },
  {
    quote: "We process about 500 job applications a month. Our screening agent handles the first pass and puts the top 20 in a folder for our HR team. We have cut our time-to-interview by 60%.",
    name: "David L.",
    role: "VP of Human Resources",
    company: "Technology Company",
    initials: "DL",
    color: "#d97706",
  },
  {
    quote: "The confidence scoring system is brilliant. The agent knows when to stop and ask a human. That is the feature that made our legal team comfortable with it.",
    name: "Priya S.",
    role: "General Counsel",
    company: "Professional Services Firm",
    initials: "PS",
    color: "#059669",
  },
  {
    quote: "We are a small business — 12 people. WorkforceAutomated lets us punch way above our weight. Our agents handle reporting, compliance checks, and customer follow-ups.",
    name: "Marcus W.",
    role: "CEO",
    company: "Boutique Consulting Firm",
    initials: "MW",
    color: "#dc2626",
  },
];

// ─── Main Demo Page ───────────────────────────────────────────────────────────
export default function Demo() {
  const [activeStep, setActiveStep] = useState(0);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);
  const step = STEPS[activeStep];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: "#0d9488", borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: "#111827" }}>WorkforceAutomated</span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link to="/what-is-an-agent" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>What is an Agent?</Link>
          <Link to="/why-it-works" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Why It Works</Link>
          <Link to="/platform" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Platform</Link>
          <Link to="/security-overview" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <Link to="/enterprise" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Enterprise</Link>
          <Link to="/demo" style={{ color: "#0d9488", fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Demo</Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          <Link to="/register" style={{ background: "#0d9488", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "56px 48px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdfa", color: "#0d9488", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 14, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          See It in Action
        </div>
        <h1 style={{ fontSize: 40, fontWeight: 800, color: "#111827", margin: "0 0 12px", letterSpacing: "-0.02em" }}>Watch WorkforceAutomated do the work</h1>
        <p style={{ fontSize: 16, color: "#6b7280", margin: "0 auto", maxWidth: 560, lineHeight: 1.65 }}>Press play on either video to see real AI agents being built, running, and reviewed. Then try the interactive walkthrough below.</p>
      </div>

      {/* Videos */}
      <div style={{ background: "#fff", padding: "48px", borderBottom: "1px solid #e5e7eb" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          {LOOM_VIDEOS.map((v) => (
            <div key={v.id} style={{ border: "1px solid #e5e7eb", borderRadius: 16, overflow: "hidden" }}>
              {activeVideo === v.id ? (
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "#000" }}>
                  <iframe
                    src={`https://www.loom.com/embed/${v.id}?autoplay=1`}
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: "none" }}
                    allowFullScreen
                    allow="autoplay; fullscreen"
                    title={v.title}
                  />
                </div>
              ) : (
                <div
                  onClick={() => setActiveVideo(v.id)}
                  style={{ position: "relative", paddingBottom: "56.25%", height: 0, background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)", cursor: "pointer" }}
                >
                  <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: 68, height: 68, background: "#0d9488", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 14, boxShadow: "0 0 0 8px rgba(13,148,136,0.2)" }}>
                      <div style={{ width: 0, height: 0, borderTop: "14px solid transparent", borderBottom: "14px solid transparent", borderLeft: "24px solid #fff", marginLeft: 5 }} />
                    </div>
                    <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>Press Play</span>
                    <span style={{ color: "#94a3b8", fontSize: 13, marginTop: 4 }}>{v.duration}</span>
                  </div>
                </div>
              )}
              <div style={{ padding: "18px 22px", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 7 }}>
                  <span style={{ fontSize: 11, fontWeight: 700, color: "#fff", background: v.badgeColor, padding: "3px 10px", borderRadius: 20 }}>{v.badge}</span>
                  <span style={{ fontSize: 12, color: "#6b7280" }}>{v.duration}</span>
                </div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{v.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.6, margin: 0 }}>{v.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div style={{ background: "#f8fafc", borderBottom: "1px solid #f3f4f6", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdfa", color: "#0d9488", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Interactive Product Tour
        </div>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Step-by-step: how it all works</h2>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Click through each step to explore the real product. No sign-up required.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
        {/* Step sidebar */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: "none",
                  background: i === activeStep ? "#0d9488" : "transparent",
                  color: i === activeStep ? "#fff" : "#374151",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, background: i === activeStep ? "#fff" : i < activeStep ? "#f0fdfa" : "#e5e7eb", color: i === activeStep ? "#0d9488" : i < activeStep ? "#0d9488" : "#9ca3af" }}>
                    {i < activeStep ? "✓" : i + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 20, padding: "0 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
              <span>Progress</span>
              <span>{Math.round(((activeStep + 1) / STEPS.length) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#0d9488", borderRadius: 4, transition: "width 0.4s", width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#0d9488", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Step {step.id} of {STEPS.length}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{step.title}</h2>
            <p style={{ fontSize: 14, color: "#0d9488", fontWeight: 600, margin: "0 0 10px" }}>{step.subtitle}</p>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>{step.description}</p>
          </div>

          {/* Visual */}
          <div style={{ marginBottom: 20 }}>
            {VISUALS[step.visual]}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              style={{ fontSize: 13, padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, color: "#374151", background: "#fff", cursor: activeStep === 0 ? "not-allowed" : "pointer", opacity: activeStep === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{ width: i === activeStep ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: i === activeStep ? "#0d9488" : "#d1d5db", cursor: "pointer", transition: "all 0.2s" }}
                />
              ))}
            </div>
            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                style={{ fontSize: 13, padding: "8px 16px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                Next →
              </button>
            ) : (
              <Link to="/register">
                <a style={{ fontSize: 13, padding: "8px 16px", background: "#0d9488", color: "#fff", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>
                  Start Free Trial →
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div style={{ background: "#fff", borderTop: "1px solid #e5e7eb", padding: "72px 48px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 10 }}>What People Are Saying</div>
          <p style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 40px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>Real results from real users</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{ border: "1px solid #e5e7eb", borderRadius: 14, padding: "24px 28px", display: "flex", flexDirection: "column", gap: 16 }}>
                <div style={{ fontSize: 24, color: t.color }}>&ldquo;</div>
                <p style={{ fontSize: 14, color: "#111827", lineHeight: 1.75, margin: 0, flex: 1 }}>{t.quote}</p>
                <div style={{ display: "flex", alignItems: "center", gap: 12, borderTop: "1px solid #e5e7eb", paddingTop: 16 }}>
                  <div style={{ width: 36, height: 36, background: t.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", flexShrink: 0 }}>{t.initials}</div>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#111827" }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: "#6b7280" }}>{t.role}, {t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      <div style={{ background: "#0d9488", padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to build your first agent?</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>It takes less than 5 minutes. No coding required.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{ background: "#fff", color: "#0d9488", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>Start free trial</Link>
          <Link to="/custom-build" style={{ background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", border: "2px solid rgba(255,255,255,0.5)" }}>Build a custom plan</Link>
        </div>
      </div>
    </div>
  );
}
