# WorkforceAutomated — Project TODO

## Database & Infrastructure
- [x] Database schema: agents, teams, executions, audit_logs, subscriptions, governance_settings
- [x] Stripe integration (subscription billing)
- [x] tRPC routers for all features

## Landing Page & Auth
- [x] Landing page with hero, features, pricing, CTA
- [x] Global navigation (public + authenticated)
- [x] Auth flow (login/signup via Manus OAuth)

## Agent Builder
- [x] Job description → agent translation via LLM
- [x] Manual agent configuration (name, role, capabilities, permissions)
- [x] Agent edit/update functionality

## Agent Management Dashboard
- [x] Agent list with status, last execution, confidence scores
- [x] Quick actions: edit, execute, delete
- [x] Agent detail view

## Single Agent Execution Console
- [x] Run individual agent with real-time progress
- [x] Confidence scoring display
- [x] Risk classification (low/medium/high/critical)
- [x] Escalation to human review when threshold exceeded
- [x] Execution result display

## Team Workflow Builder
- [x] Create team workflows with multiple agents
- [x] Define execution order and data flow
- [x] Team-level governance rules

## Team Execution Console
- [x] Real-time team workflow progress
- [x] Individual agent status within team
- [x] Overall team confidence metrics

## Confidence & Risk Monitor
- [x] Confidence score visualization (charts)
- [x] Risk classification trends
- [x] Escalation history
- [x] Governance threshold settings

## Audit Log Viewer
- [x] Filterable execution history
- [x] Agent actions and user interactions log
- [x] Confidence scores and escalations in log
- [x] Exportable compliance reports (CSV)

## Billing & Subscriptions
- [x] Stripe subscription tiers (Starter, Professional, Enterprise)
- [x] Payment management UI
- [x] Upgrade/downgrade flow

## Testing
- [x] Vitest tests for core procedures (16 tests passing)
- [x] Auth flow tests

## Production Deployment & Railway CLI
- [x] Railway CLI installed (v4.30.5)
- [x] railway.json deployment configuration created
- [x] Log capture script: scripts/capture-railway-logs.sh
- [x] Baseline dev server log stored in railway-logs/
- [x] RAILWAY_DEPLOYMENT.md guide written
- [ ] Railway token needs refresh (current token unauthorized — get new one at https://railway.app/account/tokens)
- [ ] Run `RAILWAY_TOKEN=<new-token> railway up` to deploy to Railway production
- [ ] Configure Stripe webhook URL after Railway deployment
