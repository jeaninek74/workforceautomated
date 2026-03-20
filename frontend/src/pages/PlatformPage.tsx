import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const FEATURES = [
  {
    emoji: "📐",
    title: "Agent Skill Templates",
    category: "Getting Started",
    desc: "Start instantly with pre-built agent templates: Invoice Reviewer, Contract Analyst, Support Ticket Classifier, Lead Scorer, HR Application Screener, Compliance Checker, Code Reviewer, and more.",
    detail: "Each template includes a pre-configured system prompt, input/output schema, confidence thresholds, and escalation rules — tuned for the specific domain. Customize any template or build from scratch using the Agent Builder.",
    link: "/agents/new",
    linkLabel: "Open Agent Builder →",
  },
  {
    emoji: "📊",
    title: "KPI Builder",
    category: "Analytics",
    desc: "Define custom KPIs with formulas, data sources, target values, and warning/critical thresholds. Track agent performance against your actual business metrics.",
    detail: "KPIs are calculated from real execution data — confidence scores, escalation rates, output volume, and processing time. Set thresholds and receive alerts when agents fall below targets.",
    link: "/kpi",
    linkLabel: "Open KPI Builder →",
  },
  {
    emoji: "🛡️",
    title: "Governance Controls",
    category: "Compliance",
    desc: "Set organization-wide confidence thresholds, escalation policies, and approval rules. Define exactly how much autonomy each agent has — and where humans must stay in the loop.",
    detail: "Governance settings apply globally across all agents. Set a minimum confidence threshold (e.g., 0.80) below which all actions are escalated. Configure which roles can approve which action types.",
    link: "/governance",
    linkLabel: "Open Governance →",
  },
  {
    emoji: "✅",
    title: "Review Queue",
    category: "Human Oversight",
    desc: "Role-based approval workflow for manager and admin review. Approve or reject agent actions individually or in bulk. Full audit trail of every decision.",
    detail: "Every escalated action appears in the Review Queue with full context: the agent's input, output, confidence score, and reasoning. Reviewers can approve, reject, or request revision with notes.",
    link: "/reviews",
    linkLabel: "Open Review Queue →",
  },
  {
    emoji: "🗓️",
    title: "Scheduled Executions",
    category: "Automation",
    desc: "Set any agent to run automatically on a schedule — daily, weekly, monthly, or custom cron. Agents execute on time without any manual trigger.",
    detail: "Schedules are configured per-agent with cron expressions. A payroll audit agent can run every Friday at 5pm. A weekly executive report agent runs every Monday at 7am. No manual intervention required.",
    link: "/schedules",
    linkLabel: "Open Schedules →",
  },
  {
    emoji: "📄",
    title: "Reports & Exports",
    category: "Reporting",
    desc: "Generate PDF execution reports, export audit logs and escalation records as CSV, and schedule automatic report delivery to any email address.",
    detail: "Reports include full execution history, confidence score trends, escalation summaries, and KPI performance. Schedule weekly or monthly reports to be automatically emailed to stakeholders.",
    link: "/reports",
    linkLabel: "Open Reports →",
  },
  {
    emoji: "📡",
    title: "Confidence Monitor",
    category: "Analytics",
    desc: "Real-time visibility into every agent's confidence score across all executions. Spot underperforming agents before they cause problems.",
    detail: "The Confidence Monitor shows confidence score trends over time for each agent, with alerts when scores drop below thresholds. Identify which inputs cause low confidence and refine agent prompts accordingly.",
    link: "/confidence",
    linkLabel: "Open Confidence Monitor →",
  },
  {
    emoji: "🔗",
    title: "Integrations Manager",
    category: "Connectivity",
    desc: "Connect external systems — APIs, databases, webhooks, SaaS tools — and assign specific integrations to specific agents. Agents only access what you authorize.",
    detail: "Supported integrations include Google Drive, Slack, REST APIs, and custom webhooks. Each integration is scoped to specific agents — an HR agent cannot access finance data unless explicitly authorized.",
    link: "/integrations",
    linkLabel: "Open Integrations →",
  },
  {
    emoji: "📚",
    title: "Immutable Audit Log",
    category: "Compliance",
    desc: "Every agent action is recorded permanently. Filter, search, and export the full history of what every agent did, when, and why. Built for compliance and enterprise audits.",
    detail: "The audit log records: timestamp, agent ID, action type, input hash, output summary, confidence score, risk level, and reviewer decision. Logs cannot be modified or deleted — they are append-only by design.",
    link: "/audit",
    linkLabel: "Open Audit Log →",
  },
  {
    emoji: "💳",
    title: "Billing & Subscription",
    category: "Account",
    desc: "Stripe-powered plan management. Upgrade, downgrade, or cancel at any time. Full billing history available in your account dashboard.",
    detail: "All billing is handled through Stripe. Upgrade to Starter ($49/mo), Professional ($149/mo), or Enterprise ($499/mo) at any time from the Billing page.",
    link: "/billing",
    linkLabel: "Open Billing →",
  },
];

const CATEGORIES = [...new Set(FEATURES.map((f) => f.category))];

export default function PlatformPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: DARK, minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: DIVIDER, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: TEAL, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: DARK }}>WorkforceAutomated</span>
        </Link>
        <div style={{ display: "flex", gap: 24, alignItems: "center" }}>
          <Link to="/what-is-an-agent" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>What is an Agent?</Link>
          <Link to="/why-it-works" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Why It Works</Link>
          <Link to="/platform" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Platform</Link>
          <Link to="/industries" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <Link to="/enterprise" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Enterprise</Link>
          <Link to="/#pricing" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 48px 56px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 20, padding: "5px 13px", marginBottom: 22 }}>
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Platform</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Everything included.<br />
          <span style={{ color: TEAL }}>Nothing held back.</span>
        </h1>
        <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 12px", maxWidth: 620 }}>
          Every feature you need to deploy, govern, monitor, and scale AI agents across your organization — included in every plan.
        </p>
        <p style={{ fontSize: 14, color: TEAL, fontWeight: 600, margin: "0 0 32px" }}>
          10 core modules. All accessible from your dashboard the moment you sign up.
        </p>
        <Link to="/register" style={{ background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
          Start free trial
        </Link>
      </section>

      {/* Category nav */}
      <div style={{ borderTop: DIVIDER, borderBottom: DIVIDER, padding: "0 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 32, overflowX: "auto", padding: "12px 0" }}>
          {[
            { label: "Getting Started", href: "/agents/new" },
            { label: "Analytics", href: "/kpi" },
            { label: "Compliance", href: "/audit" },
            { label: "Human Oversight", href: "/reviews" },
            { label: "Automation", href: "/schedules" },
            { label: "Reporting", href: "/reports" },
            { label: "Connectivity", href: "/integrations" },
            { label: "Account", href: "/billing" },
          ].map((cat) => (
            <Link key={cat.label} to={cat.href} style={{ fontSize: 13, fontWeight: 600, color: TEAL, whiteSpace: "nowrap", textDecoration: "none", padding: "4px 0", borderBottom: `2px solid transparent` }}
              onMouseEnter={(e) => (e.currentTarget.style.borderBottomColor = TEAL)}
              onMouseLeave={(e) => (e.currentTarget.style.borderBottomColor = "transparent")}
            >{cat.label}</Link>
          ))}
        </div>
      </div>

      {/* Features */}
      <section style={{ padding: "48px 48px 72px", maxWidth: 900, margin: "0 auto" }}>
        <div>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ padding: "32px 0", borderTop: DIVIDER }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 20 }}>
                <span style={{ fontSize: 22, paddingTop: 2 }}>{f.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{f.title}</h2>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEAL, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, padding: "2px 8px", borderRadius: 20 }}>{f.category}</span>
                  </div>
                  <p style={{ fontSize: 15, color: GRAY_TEXT, margin: "0 0 12px", lineHeight: 1.65 }}>{f.desc}</p>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: "0 0 12px" }}>{f.detail}</p>
                  <Link to={f.link} style={{ fontSize: 13, color: TEAL, fontWeight: 600, textDecoration: "none" }}>{f.linkLabel}</Link>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>All 10 modules. Every plan.</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>Access the full platform from day one. Your first AI agent is live in under 5 minutes.</p>
        <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>Start free trial</Link>
      </section>

      {/* Footer */}
      <footer style={{ background: DARK, padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>WorkforceAutomated © 2026</span>
        <div style={{ display: "flex", gap: 24 }}>
          <Link to="/privacy" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          <Link to="/terms" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Terms</Link>
          <Link to="/security-overview" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Security</Link>
        </div>
      </footer>
    </div>
  );
}
