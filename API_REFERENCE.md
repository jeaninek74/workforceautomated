# WorkforceAutomated API Reference

This document outlines the core REST API endpoints available in the WorkforceAutomated platform. All API endpoints are prefixed with `/api` and require authentication via a Bearer token in the `Authorization` header, except for public routes like `/auth/login` and `/demo/*`.

## Authentication

### `POST /api/auth/register`
Register a new user account.
- **Body**: `{ "email": "user@example.com", "password": "securepassword", "name": "John Doe" }`
- **Response**: `201 Created` with `{ "token": "jwt...", "user": { ... } }`

### `POST /api/auth/login`
Authenticate an existing user.
- **Body**: `{ "email": "user@example.com", "password": "securepassword" }`
- **Response**: `200 OK` with `{ "token": "jwt...", "user": { ... } }`

### `GET /api/auth/me`
Get the currently authenticated user's profile.
- **Response**: `200 OK` with `{ "user": { ... } }`

---

## Agents

### `GET /api/agents`
List all agents belonging to the authenticated user.
- **Response**: `200 OK` with `{ "agents": [ ... ] }`

### `POST /api/agents`
Create a new AI agent.
- **Body**: 
  ```json
  {
    "name": "Invoice Reviewer",
    "role": "Accounts Payable Analyst",
    "description": "Reviews invoices for accuracy",
    "systemPrompt": "You are an AP analyst...",
    "capabilities": ["invoice_review"],
    "confidenceThreshold": 0.85,
    "escalationThreshold": 0.60,
    "connectorType": "readonly",
    "riskLevel": "medium",
    "escalationEnabled": true
  }
  ```
- **Response**: `201 Created` with `{ "agent": { ... } }`

### `GET /api/agents/:id`
Get details for a specific agent.
- **Response**: `200 OK` with `{ "agent": { ... } }`

### `PUT /api/agents/:id`
Update an existing agent.
- **Body**: Partial agent object.
- **Response**: `200 OK` with `{ "agent": { ... } }`

### `DELETE /api/agents/:id`
Delete an agent.
- **Response**: `200 OK` with `{ "success": true }`

---

## Teams

### `GET /api/teams`
List all agent teams.
- **Response**: `200 OK` with `{ "teams": [ ... ] }`

### `POST /api/teams`
Create a new team of agents.
- **Body**:
  ```json
  {
    "name": "Finance Automation",
    "description": "Invoice processing pipeline",
    "memberAgentIds": [1, 2, 3],
    "executionOrder": [1, 2, 3],
    "executionMode": "sequential",
    "confidenceThreshold": 0.75
  }
  ```
- **Response**: `201 Created` with `{ "team": { ... } }`

---

## Executions

### `POST /api/executions`
Submit a task to an agent or team for execution.
- **Body**:
  ```json
  {
    "agentId": 1,          // OR "teamId": 1
    "input": "Review this invoice data...",
    "outputFormat": "bullet_points"
  }
  ```
- **Response**: `201 Created` with `{ "execution": { "id": 123, "status": "pending", ... } }`
- **Note**: This endpoint processes the task synchronously and returns the completed execution.

### `GET /api/executions`
List execution history, optionally filtered by agent or team.
- **Query Params**: `?agentId=1`, `?teamId=1`, `?limit=50`
- **Response**: `200 OK` with `{ "executions": [ ... ], "total": 100 }`

### `GET /api/executions/:id`
Get details of a specific execution, including the AI's output, confidence score, and risk level.
- **Response**: `200 OK` with `{ "execution": { ... } }`

---

## Integrations

### `GET /api/integrations`
List all connected external systems.
- **Response**: `200 OK` with `{ "integrations": [ ... ] }`

### `POST /api/integrations`
Create a new integration connection.
- **Body**:
  ```json
  {
    "name": "Production Database",
    "type": "database",
    "credentials": { "url": "postgres://..." },
    "config": { "schema": "public" }
  }
  ```
- **Response**: `201 Created` with `{ "integration": { ... } }`

### `POST /api/integrations/:id/test`
Test an integration connection to verify credentials.
- **Response**: `200 OK` with `{ "success": true, "message": "Connection successful" }`

---

## Governance & Audit

### `GET /api/governance/settings`
Get the user's global governance and escalation settings.
- **Response**: `200 OK` with `{ "settings": { ... } }`

### `PUT /api/governance/settings`
Update governance settings.
- **Body**: `{ "globalConfidenceThreshold": 0.80, "autoEscalateHighRisk": true }`
- **Response**: `200 OK` with `{ "settings": { ... } }`

### `GET /api/audit`
Retrieve the immutable audit log of all system actions.
- **Query Params**: `?limit=100`, `?action=execution.escalated`
- **Response**: `200 OK` with `{ "logs": [ ... ] }`

### `GET /api/reviews`
Get the queue of escalated executions requiring human review.
- **Response**: `200 OK` with `{ "reviews": [ ... ] }`

---

## Metrics & Reporting

### `GET /api/metrics/dashboard`
Get high-level statistics for the dashboard.
- **Response**: `200 OK` with `{ "total": 150, "successful": 140, "escalations": 10, "automationRate": 93.3, ... }`

### `GET /api/reports/executions.csv`
Download execution history as a CSV file.
- **Response**: `200 OK` with `Content-Type: text/csv`

### `GET /api/reports/executions.pdf`
Download a formatted PDF summary report of system activity.
- **Response**: `200 OK` with `Content-Type: application/pdf`

---

## Demo (Public)

### `POST /api/demo/chat`
Interact with the live AI demo on the landing page.
- **Body**: `{ "message": "Hello", "industry": "finance", "model": "auto", "history": [] }`
- **Response**: `200 OK` with `{ "reply": "...", "model": "claude", "confidence": 92 }`
