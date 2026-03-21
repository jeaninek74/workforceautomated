# WorkforceAutomated

WorkforceAutomated is an Enterprise AI Workforce Operating System that allows organizations to build, deploy, and manage autonomous AI agents. The platform enables users to create agents by simply pasting a job description, connect those agents to existing systems, and orchestrate them into teams that work together to automate complex business processes.

## Core Capabilities

- **Agent Builder**: Create specialized AI agents by defining their role, system prompt, capabilities, and confidence thresholds.
- **Team Orchestration**: Group agents into teams that execute sequentially, in parallel, or conditionally based on branching rules.
- **Execution Engine**: Run tasks through agents with full context awareness, file attachment support, and structured output formatting.
- **Integrations Manager**: Connect agents to external systems including Google Drive, Slack, REST APIs, and Webhooks.
- **Governance & Escalation**: Enforce confidence thresholds. If an agent is unsure (low confidence) or a task is high-risk, it automatically escalates to a human for review.
- **Immutable Audit Log**: Every action taken by every agent is permanently recorded for compliance and security auditing.
- **Analytics & KPI**: Track automation rates, execution success, escalation frequency, and agent performance over time.
- **Automated Scheduling**: Set up cron-based schedules for agents to run recurring tasks automatically.

## Technology Stack

### Frontend
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Routing**: React Router DOM
- **Styling**: Tailwind CSS
- **State Management**: React Context + Hooks
- **Data Fetching**: Axios & TanStack React Query
- **Charts**: Recharts
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js with Express
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Drizzle ORM
- **Authentication**: JWT (JSON Web Tokens) + bcryptjs
- **AI Integration**: OpenAI API (GPT-4o) & Anthropic API (Claude 3.5 Sonnet)
- **File Processing**: Multer, PDFKit, Mammoth (Word), xlsx, csv-parser
- **Payments**: Stripe API

### Infrastructure & Deployment
- **Hosting**: Railway
- **Build System**: Nixpacks
- **Database Hosting**: Railway PostgreSQL
- **Domain & DNS**: Cloudflare (workforceautomated.com)

## Project Structure

The repository is structured as a monorepo containing both frontend and backend code:

```
workforceautomated/
├── backend/                # Node.js Express API server
│   ├── src/
│   │   ├── api/            # Route handlers (agents, executions, auth, etc.)
│   │   ├── data/           # Static data (templates, industry intelligence)
│   │   ├── db/             # Database schema and connection
│   │   ├── middleware/     # Express middleware (auth, error handling)
│   │   └── services/       # Core business logic (LLM, executor, integrations)
│   ├── package.json
│   └── tsconfig.json
├── frontend/               # React SPA
│   ├── public/             # Static assets (icons, service worker)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (AuthContext)
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and API client
│   │   └── pages/          # Route components (Dashboard, AgentBuilder, etc.)
│   ├── package.json
│   ├── tailwind.config.js
│   └── vite.config.ts
├── docs/                   # Technical documentation
├── package.json            # Root package.json for monorepo scripts
├── railway.toml            # Railway deployment configuration
└── nixpacks.toml           # Nixpacks build configuration
```

## Local Development Setup

### Prerequisites
- Node.js (v20+)
- PostgreSQL database
- API Keys: OpenAI, Anthropic (optional), Stripe (optional)

### Environment Variables
Create a `.env` file in the `backend` directory:

```env
# Server
PORT=3001
NODE_ENV=development
FRONTEND_URL=http://localhost:5173

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/workforceautomated

# Authentication
APP_SECRET=development_secret_key_do_not_use_in_production
JWT_EXPIRES_IN=30d

# AI Providers
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...

# Stripe (Optional for local dev)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_PRICE_ID=price_...
STRIPE_PRO_PRICE_ID=price_...
STRIPE_ENTERPRISE_PRICE_ID=price_...
```

### Installation & Running

1. Install dependencies for both frontend and backend:
   ```bash
   npm run install:all
   ```

2. Run database migrations:
   ```bash
   cd backend
   npx drizzle-kit push:pg
   ```

3. Start the development servers:
   - **Backend**: `cd backend && npm run dev` (runs on port 3001)
   - **Frontend**: `cd frontend && npm run dev` (runs on port 5173)

## Deployment Architecture

The application is deployed on Railway as a single service that serves both the API and the static frontend files.

1. **Build Phase**: Nixpacks builds both the frontend and backend. The frontend `dist` folder is copied into the backend's `dist/public` directory.
2. **Run Phase**: The Node.js Express server starts. It handles all `/api/*` routes and serves the static frontend files for all other routes, enabling the React SPA to handle client-side routing.
3. **Database**: Connects to a private Railway PostgreSQL instance via the internal network.

## Security & Compliance Features

- **Zero-Knowledge Architecture**: Implementation of client-side encryption for sensitive data using TweetNaCl (libsodium).
- **DRASS (Disaster Recovery & System Security)**: Encrypted backup system with offline recovery keys.
- **Role-Based Access Control**: Strict permission boundaries for agents and users.
- **Data Retention**: Configurable audit log retention policies.
- **Secure Headers**: Helmet.js implementation for CSP, HSTS, and frame options.

## Key Workflows

### 1. Agent Execution Flow
When a user submits a task to an agent:
1. The `executor` service gathers the agent's system prompt, capabilities, and any connected integration data.
2. The task is sent to the primary LLM (Claude 3.5 Sonnet) or fallback (GPT-4o).
3. The LLM processes the task and returns an output along with a self-assessed **Confidence Score**.
4. If the confidence score is below the agent's threshold, the execution is marked as `escalated` and sent to the Review Queue.
5. If the confidence score is high, the execution is marked as `success`.
6. The entire process is recorded in the immutable `audit_logs` table.

### 2. Team Execution Flow
When a task is submitted to a team:
1. The system checks the team's `executionMode` (sequential, parallel, or conditional).
2. **Sequential**: Agents run one after another, passing output from one to the next.
3. **Parallel**: All agents run simultaneously on the same input, and results are aggregated.
4. **Conditional**: Agents run based on branching rules (e.g., "If output contains X, route to Agent B").
5. The final output is compiled and saved to the execution record.
