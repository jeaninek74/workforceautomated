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
