import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Product", "Security", "Pricing"];
const NAV_ACTIONS = [
  { label: "Live Demo", href: "/demo" },
  { label: "Watch Demo", href: "/watch" },
  { label: "Custom Build", href: "/custom-build" },
];

const WHY_IT_WORKS = [
  {
    emoji: "⚡",
    title: "Works Without Hiring Anyone",
    desc: "Your AI agent handles repetitive tasks 24/7. No sick days, no overtime, no training time.",
  },
  {
    emoji: "📈",
    title: "Turns Slow Work Into Fast Revenue",
    desc: "Processes that used to take days now finish in minutes. Faster work means faster revenue.",
  },
  {
    emoji: "🧑‍💼",
    title: "Humans Stay in Charge",
    desc: "The agent only acts when it's confident. Anything uncertain gets sent to a real person first.",
  },
  {
    emoji: "🏢",
    title: "Works for Any Department",
    desc: "Finance, HR, Legal, Sales, Support, IT, Cybersecurity, Payroll, Healthcare, Manufacturing, Real Estate, Consulting, C-Level Executive — if there is a process, we automate it.",
  },
  {
    emoji: "📋",
    title: "Every Action is Recorded",
    desc: "A permanent, tamper-proof log of everything the agent did. Perfect for audits and compliance.",
  },
  {
    emoji: "🚀",
    title: "Ready in Minutes, Not Months",
    desc: "Paste your process document. A team of AI agents is configured and ready to run in under 5 minutes.",
  },
];

const PLATFORM_FEATURES = [
  { emoji: "📐", title: "Agent Skill Templates", desc: "Start instantly with pre-built agent templates: Invoice Reviewer, Contract Analyst, Support Ticket Classifier, Lead Scorer, HR Application Screener, Compliance Checker, Code Reviewer, and more. Customize or build from scratch." },
  { emoji: "📊", title: "KPI Builder", desc: "Define custom KPIs with formulas, data sources, target values, and warning/critical thresholds. Track agent performance against your actual business metrics." },
  { emoji: "🛡️", title: "Governance Controls", desc: "Set organization-wide confidence thresholds, escalation policies, and approval rules. Define exactly how much autonomy each agent has — and where humans must stay in the loop." },
  { emoji: "✅", title: "Review Queue", desc: "Role-based approval workflow for manager and admin review. Approve or reject agent actions individually or in bulk. Full audit trail of every decision." },
  { emoji: "🗓️", title: "Scheduled Executions", desc: "Set any agent or team to run automatically on a schedule — daily, weekly, or custom. Agents execute on time without any manual trigger." },
  { emoji: "📄", title: "Reports & Exports", desc: "Generate PDF execution reports, export audit logs and escalation records as CSV, and schedule automatic report delivery to any email address." },
  { emoji: "📡", title: "Confidence Monitor", desc: "Real-time visibility into every agent's confidence score across all executions. Spot underperforming agents before they cause problems." },
  { emoji: "🔗", title: "Integrations Manager", desc: "Connect external systems — APIs, databases, webhooks, SaaS tools — and assign specific integrations to specific agents. Agents only access what you authorize." },
  { emoji: "📚", title: "Immutable Audit Log", desc: "Every agent action is recorded permanently. Filter, search, and export the full history of what every agent did, when, and why. Built for compliance and enterprise audits." },
  { emoji: "💳", title: "Billing & Subscription", desc: "Stripe-powered plan management. Upgrade, downgrade, or cancel at any time. Full billing history available in your account dashboard." },
];

const USE_CASES = [
  { dept: "Finance & Accounting", emoji: "💰", task: "Review invoices, flag overdue payments, generate variance reports, reconcile accounts, and produce executive financial summaries — automatically.", agents: ["Invoice Reviewer", "Variance Analyst", "AP/AR Monitor"] },
  { dept: "Supply Chain", emoji: "🚚", task: "Monitor supplier performance, track inventory levels, flag delivery delays, analyze procurement costs, and generate supply chain risk reports in real time.", agents: ["Supplier Monitor", "Inventory Tracker", "Risk Analyst"] },
  { dept: "Contracts & Legal", emoji: "⚖️", task: "Review contracts for missing clauses, flag non-standard terms, track regulatory deadlines, manage NDAs, and generate compliance summaries — powered by Claude 3.5 Sonnet.", agents: ["Contract Analyst", "Compliance Checker", "NDA Reviewer"] },
  { dept: "Analytics & Data", emoji: "📊", task: "Ingest raw data, generate executive dashboards, produce trend analyses, build KPI reports, and surface actionable insights across any business unit.", agents: ["KPI Reporter", "Trend Analyst", "Data Summarizer"] },
  { dept: "Marketing", emoji: "📣", task: "Draft campaign briefs, analyze performance metrics, generate SEO content, score leads, monitor brand mentions, and produce competitive intelligence reports.", agents: ["Campaign Analyst", "Content Generator", "Lead Scorer"] },
  { dept: "Project Management", emoji: "📋", task: "Track milestones, flag at-risk tasks, generate status reports, manage resource allocation, and produce stakeholder updates — automatically, on schedule.", agents: ["Status Reporter", "Risk Monitor", "Resource Tracker"] },
  { dept: "Program Management", emoji: "🗂️", task: "Coordinate cross-functional programs, track dependencies, produce executive program health reports, manage escalations, and maintain program governance documentation.", agents: ["Program Health Monitor", "Dependency Tracker", "Governance Reporter"] },
  { dept: "Human Resources", emoji: "👥", task: "Screen job applications, track onboarding tasks, monitor policy compliance, generate headcount reports, and flag employee engagement risks.", agents: ["Application Screener", "Onboarding Tracker", "Compliance Monitor"] },
  { dept: "Sales & Revenue", emoji: "📈", task: "Score leads, flag at-risk deals, update CRM records, generate pipeline reports, and produce win/loss analyses with recommended next actions.", agents: ["Lead Scorer", "Deal Monitor", "Pipeline Reporter"] },
  { dept: "Customer Support", emoji: "🎧", task: "Classify tickets, draft responses, escalate urgent issues, track SLA compliance, and generate CSAT trend reports with root-cause analysis.", agents: ["Ticket Classifier", "Response Drafter", "SLA Monitor"] },
  { dept: "IT Tasks & Helpdesk", emoji: "🖥️", task: "Triage IT tickets, automate user provisioning, manage asset inventories, generate SLA reports, write runbooks, and execute routine IT operations — freeing your IT staff for high-value work.", agents: ["Helpdesk Tier 1 Agent", "IT Operations Specialist", "IT Documentation Writer"] },
  { dept: "Cybersecurity", emoji: "🔐", task: "Triage SIEM alerts, analyze vulnerabilities, produce SOC 2 gap assessments, write incident response playbooks, review cloud IAM policies, and generate board-level security reports.", agents: ["SOC Analyst", "Vulnerability Analyst", "Compliance Specialist"] },
  { dept: "Networking & Infrastructure", emoji: "🌐", task: "Monitor network performance, analyze firewall rules, generate capacity reports, produce change request documentation, troubleshoot connectivity, and document network topology.", agents: ["NOC Analyst", "Network Engineer Advisor", "Cloud Network Architect"] },
  { dept: "Payroll & Compensation", emoji: "💵", task: "Audit payroll registers, generate labor cost reports, produce pay equity analyses, create tax compliance checklists, analyze overtime trends, and build total compensation benchmarks.", agents: ["Payroll Processor", "Payroll Compliance Specialist", "Compensation Analyst"] },
  { dept: "Healthcare & Clinical", emoji: "🏥", task: "Generate clinical quality reports, analyze denial patterns, produce HIPAA risk assessments, create patient communications, analyze readmission rates, and manage revenue cycle performance.", agents: ["Clinical Documentation Specialist", "Revenue Cycle Analyst", "Healthcare Compliance Officer"] },
  { dept: "Real Estate", emoji: "🏢", task: "Build DCF models, abstract commercial leases, generate market research reports, produce investor reports, create due diligence checklists, and analyze portfolio performance.", agents: ["Investment Analyst", "Lease Administrator", "Market Research Analyst"] },
  { dept: "Manufacturing & Operations", emoji: "🏭", task: "Calculate OEE, conduct FMEAs, generate quality performance reports, create value stream maps, produce predictive maintenance schedules, and analyze production variance.", agents: ["Production Analyst", "Quality Engineer", "Lean/CI Specialist"] },
  { dept: "Procurement & Sourcing", emoji: "📦", task: "Analyze category spend, create RFPs, evaluate supplier bids, review contracts for non-standard terms, generate supplier risk assessments, and produce procurement savings reports.", agents: ["Strategic Sourcing Analyst", "Spend Analyst", "Contract Analyst"] },
  { dept: "Education & Training", emoji: "🎓", task: "Design onboarding curricula, create compliance training programs, analyze LMS completion data, develop leadership frameworks, write learning objectives, and measure training ROI.", agents: ["Instructional Designer", "L&D Program Manager", "Learning Analyst"] },
  { dept: "Insurance", emoji: "🛡️", task: "Review underwriting submissions, analyze claims data for fraud, generate loss development reports, create compliance checklists, produce renewal analyses, and draft policyholder communications.", agents: ["Underwriting Analyst", "Claims Specialist", "Compliance Analyst"] },
  { dept: "Consulting & Professional Services", emoji: "💼", task: "Build strategic options analyses, create business cases, design operating models, produce stakeholder plans, develop 100-day plans, and generate client-ready executive presentations.", agents: ["Strategy Consultant", "Operations Consultant", "Financial Modeler"] },
  { dept: "C-Level & Executive", emoji: "🏆", task: "Produce board presentations, build investor reports, create OKR frameworks, generate competitive analyses, draft executive communications, and build digital transformation roadmaps — at McKinsey quality.", agents: ["Chief of Staff Agent", "Board Reporting Specialist", "Strategic Intelligence Advisor"] },
];

const EXECUTION_STEPS = [
  { num: "1", title: "You Define the Process", desc: "Paste a job description, process document, or configure manually. The platform converts it into a structured agent with defined inputs, outputs, and rules." },
  { num: "2", title: "The Agent Connects to Your Systems", desc: "Assign integrations — APIs, databases, SaaS tools. The agent reads and writes only what you authorize. No credentials stored in GitHub. Least-privilege by default." },
  { num: "3", title: "It Executes and Scores Every Action", desc: "Every action gets a confidence score. High-confidence actions are completed automatically. Low-confidence or high-risk actions are escalated to a human reviewer." },
  { num: "4", title: "You Review, Approve, or Override", desc: "The Review Queue shows every escalated action. Approve or reject individually or in bulk. Every decision is logged permanently in the audit trail." },
];

const SECURITY_SIMPLE = [
  { emoji: "🔐", title: "Your Data is Like a Secret in a Locked Box", subtitle: "Zero-Knowledge Encryption", desc: "Imagine writing your diary and locking it with a key only you have. Even if someone found the box, they could not read it. That is exactly what we do with your data — we lock it with your personal key before it ever leaves your device. Not even our team can read it." },
  { emoji: "💾", title: "We Always Have a Backup Plan", subtitle: "DRASS Disaster Recovery", desc: "Remember saving your homework in two places — on your computer AND a USB drive — just in case? We do the same with your data. Every day, we make an encrypted copy stored somewhere completely separate. If anything ever goes wrong, we can restore everything." },
  { emoji: "✅", title: "We Follow All the Rules", subtitle: "Enterprise Compliance", desc: "Just like how schools follow rules to keep students safe, we follow the strictest security rules in the world — GDPR, HIPAA, and SOC 2. These are not just checkboxes. They are promises that your data is handled with the highest level of care." },
];

const SECURITY_ICONS = [
  { emoji: "🔒", title: "Secret in a Locked Box", desc: "Your data is scrambled into unreadable code before storage. Only your key can unscramble it." },
  { emoji: "📚", title: "Homework Saved Twice", desc: "Daily encrypted backups stored separately. If one copy is lost, we restore from the other automatically." },
  { emoji: "🗝️", title: "Spare Key Under the Mat", desc: "Recovery keys let you regain access even if you forget your password. Stored securely, only by you." },
  { emoji: "🚪", title: "Proving Who You Are", desc: "Every login is verified with GitHub OAuth and JWT tokens. No one gets in without proving they are really you." },
  { emoji: "📋", title: "A Permanent Record Book", desc: "Every action is written forever in our audit log — like a school attendance record that cannot be erased." },
  { emoji: "🏰", title: "A Castle With Many Gates", desc: "Zero-trust security means every request is checked at every door — even inside our own systems." },
];

const SECURITY_TECHNICAL = [
  { title: "Zero-Knowledge Encryption", subtitle: "AES-256-GCM + NaCl libsodium", points: ["Client-side AES-256-GCM encryption", "NaCl authenticated encryption", "Server stores only encrypted data", "Your key, your control"] },
  { title: "DRASS: Disaster Recovery", subtitle: "Encrypted backups + Recovery keys", points: ["Encrypted backups with 90-day retention", "Recovery keys for account recovery", "Separate backup storage location", "Integrity verification via checksums"] },
  { title: "Enterprise Compliance", subtitle: "SOC 2 · GDPR · HIPAA", points: ["SOC 2 Type II ready", "GDPR & HIPAA compliant", "Immutable audit logs", "Zero-trust access model"] },
];

const PLANS = [
  { name: "Starter", price: "$49", period: "/mo", tagline: "For a single team or department", features: ["Up to 5 active AI agents", "1 agent team", "10,000 executions/month", "Basic integrations", "Email support"], cta: "Start Free Trial", highlight: false },
  { name: "Professional", price: "$149", period: "/mo", tagline: "For growing organizations", features: ["Up to 25 active AI agents", "Unlimited agent teams", "100,000 executions/month", "All integrations", "Priority support", "Advanced analytics"], cta: "Start Free Trial", highlight: true },
  { name: "Enterprise", price: "Custom", period: "", tagline: "For large-scale deployments", features: ["Unlimited agents & teams", "Unlimited executions", "Custom integrations", "Dedicated support", "SLA guarantee", "On-premise option"], cta: "Contact Sales", highlight: false },
];

// ─── Shared styles ────────────────────────────────────────────────────────────
const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const [securityTab, setSecurityTab] = useState<"simple" | "technical">("simple");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: DARK, minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "#fff", borderBottom: DIVIDER, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 30, height: 30, background: TEAL, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: DARK }}>WorkforceAutomated</span>
        </div>
        <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
          <div style={{ width: 1, height: 18, background: "#e5e7eb" }} />
          {NAV_ACTIONS.map((a) => (
            <Link key={a.label} to={a.href} style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>{a.label}</Link>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }}>Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#fff", padding: "72px 48px 56px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 420px", gap: 64, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 20, padding: "5px 13px", marginBottom: 22 }}>
            <span style={{ width: 7, height: 7, background: TEAL, borderRadius: "50%", display: "inline-block" }}></span>
            <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Enterprise AI Workforce Operating System</span>
          </div>
          <h1 style={{ fontSize: 52, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
            Automate your workforce.<br />
            <span style={{ color: TEAL }}>Securely.</span>
          </h1>
          <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 28px", maxWidth: 460 }}>
            Convert job descriptions into governed AI agents that execute work independently or in structured teams — with full audit trails, confidence scoring, and human escalation built in.
          </p>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>
              Start free trial
            </Link>
            <Link to="/demo" style={{ color: TEAL, fontWeight: 600, fontSize: 15, padding: "12px 20px", borderRadius: 8, textDecoration: "none", border: `1px solid ${TEAL_BORDER}`, display: "flex", alignItems: "center", gap: 6 }}>
              <span style={{ width: 6, height: 6, background: TEAL, borderRadius: "50%", display: "inline-block" }}></span>
              Try live demo
            </Link>
          </div>
          <div style={{ marginTop: 10 }}>
            <Link to="/build" style={{ color: GRAY_TEXT, fontWeight: 500, fontSize: 13, textDecoration: "none" }}>
              Not sure which plan? Build a custom one →
            </Link>
          </div>
          <div style={{ display: "flex", gap: 20, marginTop: 28 }}>
            {["AES-256-GCM Encrypted", "SOC 2 Ready", "GDPR Compliant"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <span style={{ color: TEAL, fontSize: 13 }}>✓</span>
                <span style={{ fontSize: 12, color: GRAY_TEXT, fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero live preview — no card border, just subtle background */}
        <div style={{ background: "#f8fafc", borderRadius: 14, padding: 28, border: DIVIDER }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 14 }}>Agent: Customer Onboarding</div>
          <div style={{ fontSize: 13, color: "#374151", lineHeight: 2.1 }}>
            <div>✓ New user registered — Slack notified</div>
            <div>✓ CRM record created — HubSpot synced</div>
            <div>✓ Welcome email sent — SendGrid delivered</div>
            <div style={{ color: TEAL }}>⟳ Scheduling onboarding call — Calendly...</div>
          </div>
          <div style={{ borderTop: DIVIDER, marginTop: 18, paddingTop: 14 }}>
            <div style={{ fontSize: 11, color: GRAY_TEXT, marginBottom: 8, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.06em" }}>Security Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Encrypted", "Backed up", "Audit logged"].map((s) => (
                <span key={s} style={{ background: TEAL_LIGHT, color: TEAL, fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, border: `1px solid ${TEAL_BORDER}` }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <div style={{ borderTop: DIVIDER, borderBottom: DIVIDER, background: "#f8fafc" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto", padding: "20px 48px", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0 }}>
          {[
            { stat: "3 days → 20 min", label: "Invoice processing" },
            { stat: "4×", label: "Scale without new hires" },
            { stat: "100%", label: "Audit coverage" },
            { stat: "< 5 min", label: "Agent setup time" },
          ].map(({ stat, label }, i) => (
            <div key={label} style={{ textAlign: "center", borderLeft: i > 0 ? DIVIDER : "none", padding: "4px 0" }}>
              <div style={{ fontSize: 20, fontWeight: 800, color: DARK }}>{stat}</div>
              <div style={{ fontSize: 12, color: GRAY_TEXT, marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Why It Works ── */}
      <section id="product" style={{ padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Why it works</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          Not a chatbot. An enterprise AI Workforce Operating System.
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px", maxWidth: 580, lineHeight: 1.6 }}>
          Built for real business processes, real compliance requirements, and real human oversight.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0" }}>
          {WHY_IT_WORKS.map((f, i) => (
            <div key={f.title} style={{
              padding: "28px 32px 28px 0",
              borderTop: DIVIDER,
              borderRight: (i % 3 !== 2) ? DIVIDER : "none",
              paddingRight: (i % 3 !== 2) ? 32 : 0,
              paddingLeft: (i % 3 !== 0) ? 32 : 0,
            }}>
              <div style={{ fontSize: 22, marginBottom: 10 }}>{f.emoji}</div>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How Agents Execute Work ── */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>How it works</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            How agents actually do the work
          </p>
          <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 8px", maxWidth: 580, lineHeight: 1.6 }}>
            An agent is not just a chatbot. It is an active worker that connects to your real systems, reads and writes real data, and takes real actions — all within the boundaries you set.
          </p>
          <p style={{ fontSize: 14, color: "#9ca3af", margin: "0 0 48px" }}>
            You grant access once. The agent uses only what you have authorized. Every action is logged.
          </p>

          {/* Steps as numbered rows */}
          <div>
            {EXECUTION_STEPS.map((s, i) => (
              <div key={s.num} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 24, padding: "24px 0", borderTop: DIVIDER }}>
                <div style={{ width: 36, height: 36, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 15, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.num}</div>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 5px" }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.65, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: DIVIDER }} />
          </div>

          {/* Governance pillars — inline row, no cards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0, marginTop: 40, paddingTop: 32, borderTop: DIVIDER }}>
            {[
              { emoji: "🎯", title: "Confidence Score", desc: "Every action gets a confidence score. If the AI is not sure enough, it stops and asks you." },
              { emoji: "🚨", title: "Auto-Escalation", desc: "High-risk or low-confidence tasks are automatically sent to the right human for review." },
              { emoji: "📋", title: "Permanent Audit Log", desc: "Every single action is recorded forever. You can see exactly what the AI did and when." },
              { emoji: "🔒", title: "Permission Boundaries", desc: "You define exactly what the agent can and cannot do. It cannot go outside those limits." },
            ].map((g, i) => (
              <div key={g.title} style={{ padding: "0 28px 0 0", borderRight: i < 3 ? DIVIDER : "none", paddingLeft: i > 0 ? 28 : 0 }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>{g.emoji}</div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: TEAL, margin: "0 0 5px" }}>{g.title}</h4>
                <p style={{ fontSize: 13, color: GRAY_TEXT, margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section style={{ padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Platform</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          Everything included in the platform
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px", maxWidth: 520, lineHeight: 1.6 }}>
          Every feature you need to deploy, govern, monitor, and scale AI agents across your organization.
        </p>
        <div>
          {PLATFORM_FEATURES.map((f, i) => (
            <div key={f.title} style={{ display: "grid", gridTemplateColumns: "28px 180px 1fr", gap: 20, padding: "18px 0", borderTop: DIVIDER, alignItems: "start" }}>
              <span style={{ fontSize: 18 }}>{f.emoji}</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: DARK, paddingTop: 1 }}>{f.title}</span>
              <span style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.65 }}>{f.desc}</span>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* ── Use Cases by Industry ── */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Industries</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            Works for any industry or department
          </p>
          <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 4px", maxWidth: 680, lineHeight: 1.6 }}>
            Finance, Supply Chain, Contracts, Analytics, Marketing, Project Management, Program Management, HR, Sales, Customer Support, IT, Cybersecurity, Networking, Payroll, Healthcare, Real Estate, Manufacturing, Procurement, Education, Insurance, Consulting, and C-Level Executive work.
          </p>
          <p style={{ fontSize: 14, color: TEAL, fontWeight: 600, margin: "0 0 40px" }}>If there is a process, WorkforceAutomated can automate it.</p>

          <div>
            {USE_CASES.map((u) => (
              <div key={u.dept} style={{ display: "grid", gridTemplateColumns: "32px 220px 1fr auto", gap: 20, padding: "18px 0", borderTop: DIVIDER, alignItems: "start" }}>
                <span style={{ fontSize: 18, paddingTop: 1 }}>{u.emoji}</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: DARK, paddingTop: 1 }}>{u.dept}</span>
                <span style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.65 }}>{u.task}</span>
                <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                  {(u as any).agents?.map((a: string) => (
                    <span key={a} style={{ background: TEAL_LIGHT, color: TEAL, fontSize: 11, fontWeight: 600, padding: "2px 9px", borderRadius: 20, border: `1px solid ${TEAL_BORDER}`, whiteSpace: "nowrap" }}>{a}</span>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: DIVIDER }} />
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" style={{ padding: "72px 48px", maxWidth: 1100, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Security</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          How we keep your data safe
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 28px", maxWidth: 520, lineHeight: 1.6 }}>
          Choose how you want to understand our security — plain English or full technical details.
        </p>

        {/* Tab toggle */}
        <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 8, padding: 3, gap: 2, marginBottom: 40 }}>
          {[{ id: "simple", label: "🔐 Security Made Simple" }, { id: "technical", label: "🛡️ Technical Details" }].map((t) => (
            <button key={t.id} onClick={() => setSecurityTab(t.id as "simple" | "technical")} style={{ padding: "8px 20px", borderRadius: 6, border: "none", background: securityTab === t.id ? "#fff" : "transparent", color: securityTab === t.id ? TEAL : GRAY_TEXT, fontWeight: securityTab === t.id ? 700 : 500, fontSize: 13, cursor: "pointer", boxShadow: securityTab === t.id ? "0 1px 3px rgba(0,0,0,0.08)" : "none", transition: "all 0.15s" }}>
              {t.label}
            </button>
          ))}
        </div>

        {securityTab === "simple" && (
          <div>
            {SECURITY_SIMPLE.map((s, i) => (
              <div key={s.title} style={{ display: "grid", gridTemplateColumns: "40px 1fr", gap: 20, padding: "24px 0", borderTop: DIVIDER }}>
                <span style={{ fontSize: 24 }}>{s.emoji}</span>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>{s.subtitle}</div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 8px", lineHeight: 1.3 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                </div>
              </div>
            ))}
            <div style={{ borderTop: DIVIDER, paddingTop: 32, marginTop: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 24px" }}>6 Ways We Protect You</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0 }}>
                {SECURITY_ICONS.map((ic, i) => (
                  <div key={ic.title} style={{ padding: "20px 28px 20px 0", borderTop: i >= 3 ? DIVIDER : "none", borderRight: (i % 3 !== 2) ? DIVIDER : "none", paddingRight: (i % 3 !== 2) ? 28 : 0, paddingLeft: (i % 3 !== 0) ? 28 : 0 }}>
                    <span style={{ fontSize: 20, display: "block", marginBottom: 8 }}>{ic.emoji}</span>
                    <h4 style={{ fontSize: 13, fontWeight: 700, color: DARK, margin: "0 0 5px" }}>{ic.title}</h4>
                    <p style={{ fontSize: 13, color: GRAY_TEXT, margin: 0, lineHeight: 1.6 }}>{ic.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {securityTab === "technical" && (
          <div>
            {SECURITY_TECHNICAL.map((s) => (
              <div key={s.title} style={{ display: "grid", gridTemplateColumns: "220px 1fr", gap: 32, padding: "24px 0", borderTop: DIVIDER }}>
                <div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 3px" }}>{s.title}</h3>
                  <div style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>{s.subtitle}</div>
                </div>
                <div style={{ display: "flex", gap: 32, flexWrap: "wrap" }}>
                  {s.points.map((p) => (
                    <div key={p} style={{ fontSize: 14, color: GRAY_TEXT, display: "flex", gap: 7 }}>
                      <span style={{ color: TEAL, flexShrink: 0 }}>✓</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            ))}
            <div style={{ borderTop: DIVIDER, paddingTop: 32, marginTop: 8 }}>
              <p style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 24px" }}>Data Protection Layers</p>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 0 }}>
                {[
                  { n: "1", t: "Encryption at Rest", d: "AES-256 for all stored data" },
                  { n: "2", t: "Encryption in Transit", d: "TLS 1.3 for all transmission" },
                  { n: "3", t: "Encrypted Backups", d: "Separate backup storage" },
                  { n: "4", t: "Recovery Keys", d: "Secondary account access" },
                  { n: "5", t: "Audit Logging", d: "Immutable access logs" },
                  { n: "6", t: "Zero Trust", d: "Every access verified" },
                ].map((item, i) => (
                  <div key={item.n} style={{ padding: "0 20px 0 0", borderRight: i < 5 ? DIVIDER : "none", paddingLeft: i > 0 ? 20 : 0 }}>
                    <div style={{ width: 26, height: 26, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{item.n}</div>
                    <h4 style={{ fontSize: 12, fontWeight: 700, color: DARK, margin: "0 0 3px", lineHeight: 1.3 }}>{item.t}</h4>
                    <p style={{ fontSize: 12, color: GRAY_TEXT, margin: 0, lineHeight: 1.5 }}>{item.d}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ background: "#f8fafc", borderTop: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Pricing</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 6px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            Simple, transparent pricing
          </p>
          <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px" }}>Start free. Upgrade when you are ready.</p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 0, borderTop: DIVIDER }}>
            {PLANS.map((p, i) => (
              <div key={p.name} style={{ padding: "32px 36px 32px 0", borderRight: i < 2 ? DIVIDER : "none", paddingLeft: i > 0 ? 36 : 0 }}>
                <h3 style={{ fontSize: 18, fontWeight: 700, color: p.highlight ? TEAL : DARK, margin: "0 0 3px" }}>{p.name}</h3>
                <p style={{ fontSize: 13, color: GRAY_TEXT, margin: "0 0 16px" }}>{p.tagline}</p>
                <div style={{ marginBottom: 20 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: DARK, letterSpacing: "-0.02em" }}>{p.price}</span>
                  <span style={{ fontSize: 14, color: GRAY_TEXT }}>{p.period}</span>
                </div>
                <div style={{ marginBottom: 24 }}>
                  {p.features.map((f) => (
                    <div key={f} style={{ fontSize: 14, color: GRAY_TEXT, padding: "5px 0", display: "flex", gap: 8, borderBottom: "1px solid #f3f4f6" }}>
                      <span style={{ color: TEAL, flexShrink: 0 }}>✓</span> {f}
                    </div>
                  ))}
                </div>
                <Link to="/register" style={{ display: "inline-block", background: p.highlight ? TEAL : "transparent", color: p.highlight ? "#fff" : TEAL, fontWeight: 700, fontSize: 14, padding: "10px 22px", borderRadius: 7, textDecoration: "none", border: `1px solid ${p.highlight ? TEAL : TEAL_BORDER}` }}>
                  {p.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 34, fontWeight: 800, color: "#fff", margin: "0 0 12px", letterSpacing: "-0.01em" }}>Ready to automate your workforce?</h2>
        <p style={{ fontSize: 17, color: "#ccfbf1", margin: "0 0 28px" }}>
          Join hundreds of teams using WorkforceAutomated to save time, reduce errors, and scale operations.
        </p>
        <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "13px 30px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
          Get started for free
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: DARK, padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 26, height: 26, background: TEAL, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 13, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 13 }}>WorkforceAutomated © 2026</span>
        </div>
        <div style={{ display: "flex", gap: 24 }}>
          {["Privacy", "Terms", "Security", "Docs"].map((l) => (
            <a key={l} href="#" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
      </footer>

    </div>
  );
}
