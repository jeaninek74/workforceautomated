# WorkforceAutomated TODO

- [x] Core platform: agents, teams, executions, audit log, KPI builder, governance
- [x] JWT-based authentication (register/login)
- [x] Dashboard with stats
- [x] Agent Builder (job description to AI agent)
- [x] LLM-powered agent execution with confidence scoring
- [x] Risk classification and escalation
- [x] Audit logging
- [x] Stripe billing integration
- [x] Deploy to Railway at workforceautomated.com
- [x] Landing page: clarify single agent vs. team of agents, show agent limits per plan
- [x] Landing page: explain how agents execute work and what systems/tools they connect to

## Phase 2: Real Execution Engine
- [x] Replace keyword-matching LLM stub with real OpenAI API calls
- [x] File upload support: PDF, CSV, Excel, Word, plain text
- [x] Extract text content from uploaded files for agent context
- [x] User-defined output format control (bullet points, table, formal report, etc.)
- [x] Update execution API to accept files and output format

## Phase 3: System Integration Connectors
- [x] Integration connector framework (credential storage, connector types)
- [x] Google Drive connector (read files from Drive folders)
- [x] Slack connector (send notifications/results to channels)
- [x] Generic REST API connector (call any API with stored credentials)
- [x] Webhook connector
- [x] Integration management UI (add/edit/delete/test connectors)
- [x] At execution time: pull live data from connected systems
- [x] Integrations table created in database

## Phase 4: Frontend Updates
- [x] Execution console: file upload UI (PDF, CSV, Excel, Word, TXT)
- [x] Execution console: output format selector (8 format options)
- [x] Execution console: show connected integrations for agent
- [x] Execution console: copy output button
- [x] Integrations page: manage connectors (add/test/delete/expand)
- [x] Sidebar nav: Integrations link added
- [x] App.tsx: /integrations route registered

## Phase 5: Landing Page
- [x] Rewrite EXECUTION_TOOLS to reflect real capabilities (Live/Roadmap badges)
- [x] Update "How Access Works" to explain Option 1 (file upload) and Option 2 (live integrations)
- [x] Honest messaging: what is live vs. coming soon

## Upcoming
- [ ] Agent builder: assign integrations to specific agents from the builder UI
- [ ] S3 file storage for uploaded files (currently in-memory during execution)
- [ ] Database connector (PostgreSQL/MySQL)
- [ ] Email/messaging connector
- [ ] Outbound webhook actions

## Phase 6: Advanced Multi-Agent Execution
- [ ] Parallel execution: run multiple agents simultaneously and merge their outputs
- [ ] Conditional branching: define rules (if Agent 1 flags high risk, route to Agent 3)
- [ ] Agent-to-agent messaging: agents send structured questions/responses mid-execution
- [ ] Schema update: executionMode (sequential/parallel/conditional), branchingRules, agentMessages
- [ ] Teams UI: execution mode selector (sequential / parallel / conditional)
- [ ] Teams UI: branching rules builder (condition + target agent)
- [ ] Teams UI: agent message log showing inter-agent communication
- [ ] Teams UI: visual pipeline diagram showing agent flow
- [ ] Teams UI: full redesign — step-by-step team builder wizard, drag-and-drop agent ordering, clear execution mode explanation

## Phase 7: UX Improvements
- [x] Execution Console: Agent Communications panel showing handoff notes and branch decisions
- [x] Team Builder: "Test with sample data" button in wizard to run a quick test execution
- [x] Team Builder: Agent performance badges (avg confidence, total runs) in agent selection step

## Phase 8: Integration Assignment, Team History & Escalation Notifications
- [ ] Agent Builder: integration assignment step — connect integrations to agents from the creation form
- [ ] Backend: store agent-integration assignments in DB, pass to executor at runtime
- [ ] Team execution history page: per-agent breakdowns, confidence scores, branch paths taken
- [ ] Escalation notifications: email (SendGrid) + Slack webhook when agent escalates a task
- [ ] Notification settings page: configure email and Slack webhook per user

## Phase 9: Review & Approve, Scheduling, Reports

- [ ] Review & Approve workflow: escalation_reviews DB table, review page, approve/reject with comments
- [ ] Escalation review queue in sidebar nav with badge count
- [ ] Execution scheduling: schedules DB table, cron engine, schedule builder UI
- [ ] Scheduled runs management page
- [ ] Report generation: PDF and CSV export of executions, team history, audit logs
- [ ] Reports page in dashboard with date range filters and download buttons

## Phase 10: Badge, PDF Report, SMTP Setup
- [ ] Sidebar: pending review count badge on Review Queue nav item
- [ ] Reports: PDF download with summary stats and risk breakdown chart
- [ ] Settings Notifications: SMTP credential fields (host, user, pass, from) with test connection button

## Phase 11: Workflow Features + Landing Page Redesign + Agent Skills
- [ ] Review Queue: Mark All Reviewed button to clear badge in one click
- [ ] Reports: Scheduled report delivery — weekly PDF emailed to stakeholders via SMTP
- [ ] Review Queue: Role-based access — restrict approve/reject to reviewer/admin roles only
- [ ] Landing page: Full premium redesign inspired by mbusa.com — custom typography, real visual hierarchy, no AI-generated look
- [ ] Agent skill library: Add web developer, design critique, and code review system prompt templates

## Phase 12: Agent Skill Templates + E2E Testing
- [ ] Agent skill templates: pre-built system prompt library (Invoice Reviewer, Contract Analyst, Support Classifier, Lead Scorer, HR Screener, Compliance Checker, Web Developer, Design Critic, Code Reviewer)
- [ ] Agent Builder: template picker UI — browse and select a template to pre-fill the form
- [ ] Backend: /api/agent-templates endpoint serving the template library
- [ ] E2E test: user registration and login
- [ ] E2E test: create agent from scratch
- [ ] E2E test: create agent from template
- [ ] E2E test: create team, add agents, configure execution mode
- [ ] E2E test: run execution with file upload
- [ ] E2E test: review queue approve/reject
- [ ] E2E test: generate and download PDF/CSV report
- [ ] E2E test: schedule creation and run-now
- [ ] E2E test: integration add and test connection
- [ ] E2E test: notification settings save and test

## Phase 13: Under Construction + Production Deployment Fix
- [ ] Landing page: add "Under Construction — Not For Use" banner at top
- [ ] Identify correct GitHub repo connected to Railway web service
- [ ] Push all built features to the correct GitHub repo for Railway deployment
- [ ] Run E2E tests against production after correct deployment


## Phase 14: Landing Page Redesign + Data Security + DRASS System
- [ ] Redesign landing page with clean minimal style (inspired by Intradiem but with custom professional color scheme)
- [ ] Replace dark theme with light/airy background
- [ ] Simplify layout (remove excessive cards and grids)
- [ ] Add real person images to hero section
- [ ] Reduce icon usage and use them sparingly
- [ ] Simplify CTA buttons (remove gradients)
- [ ] Implement zero-knowledge end-to-end encryption for user data
- [ ] Encrypt data on client side before sending to server
- [ ] Ensure server cannot access or decrypt user data
- [ ] Add encryption key management UI for users
- [ ] Implement DRASS system with encrypted backups stored separately from main database
- [ ] Generate recovery keys for users
- [ ] Create secondary access method for compromised scenarios
- [ ] Build recovery key management UI
- [ ] Implement backup restoration process
- [ ] Create documentation for recovery procedures
- [ ] Test all new security features end-to-end
- [ ] Verify encryption works correctly
- [ ] Test recovery key generation and usage
- [ ] Test backup restoration
