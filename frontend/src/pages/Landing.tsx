import { useState } from "react";
import { Link } from "react-router-dom";
import { Zap, TrendingUp, Shield, Building2, ClipboardList, Rocket, Database, Plug, Mail, FileText, Globe, Webhook, Target, AlertTriangle, FileCheck, Lock, KeyRound, Building, BadgeCheck, Ban, MapPin, Bot, BarChart3, Settings2, CheckSquare, Calendar, Download, Activity, Link2, CreditCard, BookOpen, LayoutTemplate } from "lucide-react";

const DEMO_STEPS = [
  {
    label: "Step 1: Paste Your Process",
    content: "You paste in any work document — a job description, a checklist, a step-by-step process. It can be from any department: finance, HR, legal, customer support, IT.",
    example: `"Review all invoices over $10,000. Flag any that are more than 30 days overdue. Send a weekly summary to the finance manager. Escalate anything over $50,000 to the CFO immediately."`
  },
  {
    label: "Step 2: AI Builds the Agent",
    content: "WorkforceAutomated reads your document and automatically builds an AI agent. It figures out what the agent should do, what data it can access, and when it needs to ask a human for help.",
    example: `Agent created: "Invoice Review Agent"\n- Can read: invoice database\n- Can write: weekly summary reports\n- Will escalate: anything over $50,000\n- Confidence required: 85% before acting`
  },
  {
    label: "Step 3: Set Your Rules",
    content: "You decide how much the agent can do on its own. Set a confidence score — if the agent isn't sure enough, it stops and asks a human. You stay in control at all times.",
    example: `Confidence threshold: 85%\nIf below 85% → pause and ask human\nIf above 85% → proceed automatically\nAll actions logged forever`
  },
  {
    label: "Step 4: It Works. You Watch.",
    content: "The agent runs your process automatically. Every action is recorded. You get a live dashboard showing what it did, how confident it was, and anything it flagged for your attention.",
    example: `Today's activity:\n- 47 invoices reviewed\n- 3 flagged as overdue\n- 1 escalated to CFO ($78,000)\n- Weekly report sent to finance manager`
  }
];

const FEATURES = [
  { icon: Zap, title: "Works Without Hiring Anyone", desc: "Your AI agent handles repetitive tasks 24/7. No sick days, no overtime, no training time." },
  { icon: TrendingUp, title: "Turns Slow Work Into Fast Revenue", desc: "Processes that used to take days now finish in minutes. Faster work means faster revenue." },
  { icon: Shield, title: "Humans Stay in Charge", desc: "The agent only acts when it's confident. Anything uncertain gets sent to a real person first." },
  { icon: Building2, title: "Works for Any Department", desc: "Finance, HR, legal, sales, customer support, IT — if there's a process, we can automate it." },
  { icon: ClipboardList, title: "Every Action is Recorded", desc: "A permanent, tamper-proof log of everything the agent did. Perfect for audits and compliance." },
  { icon: Rocket, title: "Ready in Minutes, Not Months", desc: "Paste your process document. A team of AI agents is configured and ready to run in under 5 minutes." }
];

const PLATFORM_FEATURES = [
  { icon: LayoutTemplate, title: "Agent Skill Templates", desc: "Start instantly with 9 pre-built agent templates: Invoice Reviewer, Contract Analyst, Support Ticket Classifier, Lead Scorer, HR Application Screener, Compliance Checker, Code Reviewer, and more. Customize or build from scratch." },
  { icon: BarChart3, title: "KPI Builder", desc: "Define custom KPIs with formulas, data sources, target values, and warning/critical thresholds. Track agent performance against your actual business metrics." },
  { icon: Settings2, title: "Governance Controls", desc: "Set organization-wide confidence thresholds, escalation policies, and approval rules. Define exactly how much autonomy each agent has — and where humans must stay in the loop." },
  { icon: CheckSquare, title: "Review Queue", desc: "Role-based approval workflow for manager and admin review. Approve or reject agent actions individually or in bulk with Mark All Reviewed. Full audit trail of every decision." },
  { icon: Calendar, title: "Scheduled Executions", desc: "Set any agent or team to run automatically on a schedule — daily, weekly, or custom. Agents execute on time without any manual trigger." },
  { icon: Download, title: "Reports & Exports", desc: "Generate PDF execution reports, export audit logs and escalation records as CSV, and schedule automatic report delivery to any email address via SMTP." },
  { icon: Activity, title: "Confidence Monitor", desc: "Real-time visibility into every agent's confidence score across all executions. Spot underperforming agents before they cause problems." },
  { icon: Link2, title: "Integrations Manager", desc: "Connect external systems — APIs, databases, webhooks, SaaS tools — and assign specific integrations to specific agents. Agents only access what you authorize." },
  { icon: BookOpen, title: "Immutable Audit Log", desc: "Every agent action is recorded permanently. Filter, search, and export the full history of what every agent did, when, and why. Built for compliance and enterprise audits." },
  { icon: CreditCard, title: "Billing & Subscription", desc: "Stripe-powered plan management. Upgrade, downgrade, or cancel at any time. Full billing history available in your account dashboard." },
];

const USE_CASES = [
  { dept: "Finance", task: "Review invoices, flag overdue payments, generate variance reports" },
  { dept: "HR", task: "Screen job applications, track onboarding tasks, monitor policy compliance" },
  { dept: "Legal", task: "Review contracts for missing clauses, track regulatory deadlines" },
  { dept: "Customer Support", task: "Classify tickets, draft responses, escalate urgent issues" },
  { dept: "Sales", task: "Score leads, flag at-risk deals, update CRM records" },
  { dept: "IT & Security", task: "Monitor systems, detect anomalies, generate incident reports" }
];

const TESTIMONIALS = [
  {
    quote: "We used to spend 3 days every month reviewing invoices manually. Now it takes 20 minutes. The agent catches things we used to miss.",
    name: "Sarah K.",
    title: "Finance Director",
    result: "3 days → 20 minutes"
  },
  {
    quote: "I was skeptical about AI replacing our compliance process. But the agent escalates anything it's not sure about, so we never lost control.",
    name: "Marcus T.",
    title: "Chief Compliance Officer",
    result: "Zero compliance violations in 8 months"
  },
  {
    quote: "We scaled from 200 to 800 customers without hiring a single extra support person. The agent handles the routine stuff, our team handles the hard stuff.",
    name: "Priya M.",
    title: "VP of Customer Success",
    result: "4x customers, same team size"
  }
];

const EXECUTION_TOOLS = [
  {
    icon: Database,
    title: "Databases & Spreadsheets",
    desc: "Agents read from and write to your databases, spreadsheets, and data warehouses. They can query records, update fields, and generate reports — just like a human analyst would."
  },
  {
    icon: Plug,
    title: "APIs & Web Services",
    desc: "Agents connect to any REST API or web service you authorize. Salesforce, HubSpot, QuickBooks, Slack, Jira, ServiceNow — if it has an API, the agent can use it."
  },
  {
    icon: Mail,
    title: "Email & Messaging",
    desc: "Agents can read incoming emails, send notifications, post to Slack channels, and trigger alerts — all within the permission boundaries you define."
  },
  {
    icon: FileText,
    title: "Files & Documents",
    desc: "Agents read PDFs, Word docs, CSVs, and other files from your connected storage (Google Drive, SharePoint, S3). They extract data, summarize content, and generate new documents."
  },
  {
    icon: Globe,
    title: "Web & Public Data",
    desc: "Agents can retrieve publicly available information — pricing data, regulatory updates, news feeds — and incorporate it into their analysis and reports."
  },
  {
    icon: Webhook,
    title: "Webhooks & Triggers",
    desc: "Agents can be triggered by external events — a new form submission, a calendar event, a payment received — and respond automatically according to your defined rules."
  }
];

export default function Landing() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0a0a0f", color: "#e8e8f0", minHeight: "100vh" }}>

      {/* Under Construction Banner */}
      <div style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 200, background: "#f59e0b", color: "#000", textAlign: "center", padding: "10px 24px", fontSize: 12, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        Under Construction — Not For Use
      </div>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1e1e2e", position: "sticky", top: 38, background: "#0a0a0f", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={18} color="#fff" /></div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>WorkforceAutomated</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ padding: "8px 20px", background: "transparent", border: "1px solid #3f3f5a", borderRadius: 8, color: "#c0c0d8", cursor: "pointer", fontSize: 14, textDecoration: "none", display: "inline-block" }}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 40px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "#1a1a2e", border: "1px solid #6366f1", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a5b4fc", marginBottom: 24 }}>
          AI Workforce Platform
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 24px", color: "#fff" }}>
          Automate Any Work Process.<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Govern Every Action. Grow Without Limits.
          </span>
        </h1>
        <p style={{ fontSize: 20, color: "#9090b0", lineHeight: 1.7, marginBottom: 16 }}>
          You describe the job. We build the AI team that does it — automatically, accurately, and with a human always in control.
        </p>
        <p style={{ fontSize: 16, color: "#6060a0", marginBottom: 40 }}>
          Works for finance, HR, legal, sales, customer support, IT, and more. No coding required.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{ padding: "14px 32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Start Free — No Credit Card
          </Link>
          <a href="#how-it-works" style={{ padding: "14px 32px", background: "transparent", border: "1px solid #3f3f5a", borderRadius: 10, color: "#c0c0d8", cursor: "pointer", fontSize: 16, textDecoration: "none", display: "inline-block" }}>
            See How It Works
          </a>
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
          {[["3 days → 20 min", "Invoice processing"], ["4x scale", "Without new hires"], ["100%", "Audit coverage"], ["< 5 min", "Agent setup time"]].map(([stat, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#6060a0" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What Is It */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 20 }}>What Does It Actually Do?</h2>
          <p style={{ fontSize: 18, color: "#9090b0", lineHeight: 1.8 }}>
            Think of it like hiring a very fast, very reliable worker who never sleeps. You give them a list of tasks. They do those tasks, keep a record of everything they did, and come to you whenever they are not sure what to do next.
          </p>
          <p style={{ fontSize: 18, color: "#9090b0", lineHeight: 1.8, marginTop: 16 }}>
            The difference: this worker is an AI, costs a fraction of a full-time hire, and can handle hundreds of tasks at once.
          </p>
        </div>
      </section>

      {/* Single Agent vs Team Section */}
      <section id="agent-model" style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>
          One Agent or a Whole Team — You Decide
        </h2>
        <p style={{ color: "#6060a0", textAlign: "center", fontSize: 16, maxWidth: 640, margin: "0 auto 48px" }}>
          Some tasks need a single focused agent. Others need a coordinated team. WorkforceAutomated supports both — and you can mix them freely within the same account.
        </p>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24, marginBottom: 48 }}>
          <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 14, padding: 32 }}>
            <div style={{ marginBottom: 16 }}><Bot size={36} color="#6366f1" /></div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Single AI Agent</h3>
            <p style={{ fontSize: 15, color: "#8080a0", lineHeight: 1.7, marginBottom: 20 }}>
              Deploy one dedicated agent to own a specific process end-to-end. Ideal for focused, repeatable tasks that belong to a single domain — invoice review, lead scoring, ticket triage, or contract checking.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "One agent, one process, full ownership",
                "Runs 24/7 without supervision",
                "Escalates to a human when uncertain",
                "Every action logged and auditable"
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "#9090b0", padding: "6px 0", borderBottom: "1px solid #1e1e2e", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#6366f1", flexShrink: 0 }}>-</span> {item}
                </li>
              ))}
            </ul>
          </div>

          <div style={{ background: "linear-gradient(135deg, #1a1a3e, #2a1a4e)", border: "2px solid #6366f1", borderRadius: 14, padding: 32, position: "relative" }}>
            <div style={{ position: "absolute", top: -12, left: 24, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 12, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#fff" }}>Most Powerful</div>
            <div style={{ marginBottom: 16 }}><Bot size={36} color="#a78bfa" /></div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Team of AI Agents</h3>
            <p style={{ fontSize: 15, color: "#8080a0", lineHeight: 1.7, marginBottom: 20 }}>
              Deploy a coordinated team of specialized agents that work together on a complex workflow. Each agent handles its own domain — one reads data, one analyzes it, one writes the report, one sends the alert.
            </p>
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {[
                "Multiple agents, each with a defined role",
                "Agents hand off work to each other automatically",
                "Team-level governance and confidence thresholds",
                "Parallel execution — faster results at scale",
                "One dashboard for the entire team's activity"
              ].map((item) => (
                <li key={item} style={{ fontSize: 14, color: "#9090b0", padding: "6px 0", borderBottom: "1px solid #2a2a4e", display: "flex", gap: 8, alignItems: "flex-start" }}>
                  <span style={{ color: "#a78bfa", flexShrink: 0 }}>-</span> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "20px 28px", borderBottom: "1px solid #2a2a3e" }}>
            <h3 style={{ fontSize: 18, fontWeight: 700, color: "#fff", margin: 0 }}>How Many Agents Can I Deploy?</h3>
            <p style={{ fontSize: 14, color: "#6060a0", margin: "6px 0 0" }}>Agent limits apply to the total number of active agents across all your teams and solo deployments.</p>
          </div>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#0a0a0f" }}>
                  {["Plan", "Active Agents", "Teams", "Agents per Team", "Best For"].map((h) => (
                    <th key={h} style={{ padding: "14px 20px", textAlign: "left", fontSize: 13, fontWeight: 600, color: "#6060a0", borderBottom: "1px solid #1e1e2e" }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  { plan: "Starter", agents: "Up to 5", teams: "1 team", perTeam: "Up to 5", best: "Small teams, single department", highlight: false },
                  { plan: "Professional", agents: "Up to 25", teams: "Unlimited teams", perTeam: "Up to 10", best: "Multi-department automation", highlight: true },
                  { plan: "Enterprise", agents: "Unlimited", teams: "Unlimited teams", perTeam: "Unlimited", best: "Org-wide AI workforce at scale", highlight: false }
                ].map((row) => (
                  <tr key={row.plan} style={{ background: row.highlight ? "rgba(99,102,241,0.06)" : "transparent", borderBottom: "1px solid #1e1e2e" }}>
                    <td style={{ padding: "14px 20px", fontSize: 14, fontWeight: 700, color: row.highlight ? "#a78bfa" : "#fff" }}>{row.plan}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "#c0c0d8" }}>{row.agents}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "#c0c0d8" }}>{row.teams}</td>
                    <td style={{ padding: "14px 20px", fontSize: 14, color: "#c0c0d8" }}>{row.perTeam}</td>
                    <td style={{ padding: "14px 20px", fontSize: 13, color: "#7070a0" }}>{row.best}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* How Agents Execute Work Section */}
      <section id="execution-model" style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>
            How Agents Actually Do the Work
          </h2>
          <p style={{ color: "#6060a0", textAlign: "center", fontSize: 16, maxWidth: 680, margin: "0 auto 12px" }}>
            An agent is not just a chatbot. It is an active worker that connects to your real systems, reads and writes real data, and takes real actions — all within the boundaries you set.
          </p>
          <p style={{ color: "#5050a0", textAlign: "center", fontSize: 14, maxWidth: 680, margin: "0 auto 48px" }}>
            You grant access once. The agent uses only what you have authorized. Every action is logged.
          </p>

          <div style={{ background: "#0a0a0f", border: "1px solid #2a2a3e", borderRadius: 12, padding: 32, marginBottom: 40 }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#a5b4fc", marginBottom: 24, textAlign: "center" }}>What Happens When an Agent Runs a Task</h3>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 0, alignItems: "stretch", justifyContent: "center" }}>
              {[
                { step: "1", label: "Receives Task", detail: "A job description or trigger event starts the agent" },
                { step: "arr", label: "", detail: "" },
                { step: "2", label: "Reads Data", detail: "Pulls records from your connected databases, files, or APIs" },
                { step: "arr", label: "", detail: "" },
                { step: "3", label: "Reasons & Decides", detail: "AI analyzes the data and determines the right action with a confidence score" },
                { step: "arr", label: "", detail: "" },
                { step: "4", label: "Acts or Escalates", detail: "If confident: takes the action. If not: pauses and asks a human." },
                { step: "arr", label: "", detail: "" },
                { step: "5", label: "Logs Everything", detail: "Every step recorded in the immutable audit log" }
              ].map((item, i) => (
                item.step === "arr" ? (
                  <div key={i} style={{ display: "flex", alignItems: "center", padding: "0 8px", color: "#3f3f5a", fontSize: 20, flexShrink: 0 }}>→</div>
                ) : (
                  <div key={i} style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 10, padding: "16px 20px", flex: "1 1 140px", minWidth: 120, maxWidth: 180 }}>
                    <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{item.step}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{item.label}</div>
                    <div style={{ fontSize: 12, color: "#6060a0", lineHeight: 1.5 }}>{item.detail}</div>
                  </div>
                )
              ))}
            </div>
          </div>

          <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>What Systems Can Agents Connect To?</h3>
          <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 32, fontSize: 14 }}>
            You grant access to the systems you choose. The agent only uses what you have explicitly authorized.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
            {EXECUTION_TOOLS.map((tool) => (
              <div key={tool.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, padding: 22 }}>
                <div style={{ marginBottom: 10 }}><tool.icon size={28} color="#6366f1" /></div>
                <h4 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{tool.title}</h4>
                <p style={{ fontSize: 13, color: "#6060a0", lineHeight: 1.7, margin: 0 }}>{tool.desc}</p>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 32, background: "linear-gradient(135deg, #1a1a3e, #0f0f2e)", border: "1px solid #3f3f6a", borderRadius: 12, padding: 28, display: "flex", gap: 20, alignItems: "flex-start", flexWrap: "wrap" }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: "#6366f1", flexShrink: 0 }}>KEY</div>
            <div>
              <h4 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>How Access Works</h4>
              <p style={{ fontSize: 14, color: "#8080a0", lineHeight: 1.8, margin: 0 }}>
                You connect your systems once through the WorkforceAutomated dashboard — using API keys, OAuth, or database credentials. Each agent is then assigned only the permissions it needs for its specific job. An invoice review agent can read the invoice database but cannot touch payroll. A lead scoring agent can update CRM records but cannot send emails. You define the boundaries. The agent stays within them. Every action is recorded in a tamper-proof audit log.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>How It Works</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Four simple steps. No technical knowledge needed.</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {DEMO_STEPS.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(i)} style={{ padding: "10px 20px", background: activeStep === i ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1a1a2e", border: activeStep === i ? "none" : "1px solid #2a2a3e", borderRadius: 8, color: activeStep === i ? "#fff" : "#8080a0", cursor: "pointer", fontSize: 14, fontWeight: activeStep === i ? 600 : 400 }}>
              {step.label}
            </button>
          ))}
        </div>
        <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 12, padding: 32 }}>
          <p style={{ fontSize: 18, color: "#c0c0d8", lineHeight: 1.8, marginBottom: 24 }}>{DEMO_STEPS[activeStep].content}</p>
          <div style={{ background: "#0a0a0f", border: "1px solid #3f3f5a", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#6060a0", marginBottom: 8, fontFamily: "monospace" }}>EXAMPLE</div>
            <pre style={{ fontFamily: "monospace", fontSize: 14, color: "#a5b4fc", whiteSpace: "pre-wrap", margin: 0 }}>{DEMO_STEPS[activeStep].example}</pre>
          </div>
        </div>
      </section>

      {/* Why Use It */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Why Companies Use It</h2>
          <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Real business results, not just technology for its own sake.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24 }}>
                <div style={{ marginBottom: 12 }}><f.icon size={28} color="#6366f1" /></div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#7070a0", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section id="features" style={{ padding: "60px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Everything the Platform Can Do</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40, fontSize: 16 }}>Every feature you need to run, govern, and scale an AI workforce — included in every plan.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {PLATFORM_FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24 }}>
              <div style={{ marginBottom: 12 }}><f.icon size={26} color="#6366f1" /></div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
              <p style={{ fontSize: 13, color: "#7070a0", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Works in Every Department</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>If there is a repeatable process, we can build a team of AI agents to do it.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {USE_CASES.map((uc) => (
            <div key={uc.dept} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{uc.dept}</div>
              <p style={{ fontSize: 14, color: "#8080a0", margin: 0, lineHeight: 1.6 }}>{uc.task}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guardrails */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>You are Always in Control</h2>
          <p style={{ color: "#6060a0", marginBottom: 40, fontSize: 16 }}>The AI never acts alone on anything important. Here is how we keep humans in charge.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
            {[
              { icon: Target, title: "Confidence Score", desc: "Every action gets a confidence score. If the AI is not sure enough, it stops and asks you." },
              { icon: AlertTriangle, title: "Auto-Escalation", desc: "High-risk or low-confidence tasks are automatically sent to the right human for review." },
              { icon: FileCheck, title: "Permanent Audit Log", desc: "Every single action is recorded forever. You can see exactly what the AI did and when." },
              { icon: Lock, title: "Permission Boundaries", desc: "You define exactly what the agent can and cannot do. It cannot go outside those limits." }
            ].map((g) => (
              <div key={g.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                <div style={{ marginBottom: 10 }}><g.icon size={24} color="#6366f1" /></div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{g.title}</h3>
                <p style={{ fontSize: 13, color: "#6060a0", margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>What Customers Say</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Real results from real companies.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24 }}>
              <div style={{ background: "#1a1a2e", border: "1px solid #6366f1", borderRadius: 6, padding: "4px 12px", fontSize: 13, color: "#a5b4fc", display: "inline-block", marginBottom: 16, fontWeight: 700 }}>{t.result}</div>
              <p style={{ fontSize: 15, color: "#c0c0d8", lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "#6060a0" }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Protection */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Your Data is Safe</h2>
          <p style={{ color: "#6060a0", marginBottom: 40, fontSize: 16 }}>We take security seriously. Here is exactly what we do to protect your data.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
            {[
              { icon: KeyRound, title: "Encrypted Everywhere", desc: "All data is encrypted when stored and when moving between systems." },
              { icon: Building, title: "Your Data Stays Yours", desc: "We never sell or share your data with third parties. Ever." },
              { icon: BadgeCheck, title: "SOC 2 Compliant", desc: "We meet the security standards required by enterprise companies." },
              { icon: Globe, title: "GDPR & HIPAA Ready", desc: "Built to meet the strictest global privacy and healthcare regulations." },
              { icon: Ban, title: "Zero Trust Access", desc: "Every access request is verified. No one gets in without permission." },
              { icon: MapPin, title: "Data Residency Options", desc: "Choose where your data is stored to meet local regulations." }
            ].map((s) => (
              <div key={s.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                <div style={{ marginBottom: 8 }}><s.icon size={22} color="#6366f1" /></div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#6060a0", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ padding: "60px 40px", maxWidth: 960, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Simple Pricing</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Start free. Upgrade when you are ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {[
            {
              name: "Starter",
              price: "$49/mo",
              tagline: "Perfect for a single team or department",
              features: [
                "Up to 5 active AI agents",
                "1 agent team",
                "Up to 5 agents per team",
                "Basic audit logs",
                "Email support",
                "1 department"
              ],
              highlight: false
            },
            {
              name: "Professional",
              price: "$149/mo",
              tagline: "For multi-department automation",
              features: [
                "Up to 25 active AI agents",
                "Unlimited agent teams",
                "Up to 10 agents per team",
                "Full audit logs + CSV export",
                "Priority support",
                "All departments",
                "Advanced governance controls"
              ],
              highlight: true
            },
            {
              name: "Enterprise",
              price: "$499/mo",
              tagline: "Org-wide AI workforce at scale",
              features: [
                "Unlimited active AI agents",
                "Unlimited agent teams",
                "Unlimited agents per team",
                "Custom integrations",
                "Dedicated support + SLA",
                "Custom data residency",
                "SSO & advanced security"
              ],
              highlight: false
            }
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? "linear-gradient(135deg, #1a1a3e, #2a1a4e)" : "#0f0f1a", border: plan.highlight ? "2px solid #6366f1" : "1px solid #1e1e2e", borderRadius: 12, padding: 28, position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 12, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>Most Popular</div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{plan.name}</h3>
              <p style={{ fontSize: 13, color: "#6060a0", marginBottom: 12 }}>{plan.tagline}</p>
              <div style={{ fontSize: 28, fontWeight: 800, color: plan.highlight ? "#a78bfa" : "#fff", marginBottom: 20 }}>{plan.price}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: "#9090b0", padding: "7px 0", borderBottom: "1px solid #1e1e2e", display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: plan.highlight ? "#a78bfa" : "#6366f1", flexShrink: 0 }}>-</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{ display: "block", width: "100%", padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600, background: plan.highlight ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", border: plan.highlight ? "none" : "1px solid #3f3f5a", color: "#fff", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #1a1a3e, #0f0f2e)", padding: "60px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Ready to Stop Doing It Manually?</h2>
        <p style={{ fontSize: 18, color: "#9090b0", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
          Set up your first AI agent in under 5 minutes. No credit card required.
        </p>
        <Link to="/register" style={{ padding: "16px 40px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#050508", padding: "32px 40px", textAlign: "center", borderTop: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}><Bot size={16} color="#fff" /></div>
          <span style={{ fontWeight: 700, color: "#fff" }}>WorkforceAutomated</span>
        </div>
        <p style={{ color: "#404060", fontSize: 13, margin: 0 }}>© 2026 WorkforceAutomated. All rights reserved.</p>
      </footer>

    </div>
  );
}
