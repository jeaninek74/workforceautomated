import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const ENTERPRISE_FEATURES = [
  {
    emoji: "🏢",
    title: "Unlimited agents across your whole company",
    simple: "No cap on how many AI workers you can have.",
    detail:
      "On the Enterprise plan, you can build as many agents as you need — one for every department, every process, every workflow. Finance, HR, Legal, Operations, Sales, IT — all covered. There is no limit.",
    example: "A company with 500 employees might run 40 agents at the same time, each handling a different job.",
  },
  {
    emoji: "👥",
    title: "Role-based access for your whole company",
    simple: "Different people see different things — based on their job.",
    detail:
      "Your CEO can see everything. Your finance manager can only see finance agents. Your HR team can only see HR agents. You decide who can see what, who can approve what, and who can change what. Nobody accidentally touches something they should not.",
    example: "A finance analyst can see invoice reports but cannot change agent settings. A manager can approve flagged items. An admin can do everything.",
  },
  {
    emoji: "🔗",
    title: "Connect to any system your company uses",
    simple: "Like giving your AI workers access to every tool in your office.",
    detail:
      "Enterprise accounts can connect to any system — your ERP, your CRM, your HR platform, your databases, your internal APIs, your document storage. If your company uses it, your agents can connect to it. Our team helps you set up every integration.",
    example: "Connect to SAP, Salesforce, Workday, SharePoint, Oracle, Microsoft 365, Google Workspace, and more.",
  },
  {
    emoji: "🛡️",
    title: "Your own private environment",
    simple: "Like having your own private office building instead of a shared co-working space.",
    detail:
      "Enterprise customers get a dedicated, isolated environment. Your data never shares infrastructure with other companies. Your agents run on servers that are exclusively yours. This is required by many compliance frameworks.",
    example: "Healthcare companies that need HIPAA compliance, or financial firms that need strict data isolation.",
  },
  {
    emoji: "📋",
    title: "Full compliance and audit support",
    simple: "We help you prove to auditors that everything is being done correctly.",
    detail:
      "Enterprise includes Business Associate Agreements (BAA) for HIPAA, Data Processing Agreements (DPA) for GDPR, and full audit log exports in any format. When your compliance team or external auditors ask for records, you can produce them in seconds.",
    example: "\"Show me every action taken by any AI agent in the past 90 days.\" — Done in one click.",
  },
  {
    emoji: "🤝",
    title: "Dedicated support and onboarding",
    simple: "Like having a personal trainer who helps you get started and is always available.",
    detail:
      "Enterprise customers get a dedicated customer success manager, a personalized onboarding session, priority support with a 4-hour response time, and access to our enterprise Slack channel. We help you build your first agents and make sure everything works perfectly.",
    example: "Your dedicated manager helps you map your existing processes to agents, connects your systems, and trains your staff.",
  },
  {
    emoji: "📊",
    title: "Advanced reporting and analytics",
    simple: "Like a dashboard that shows you exactly how much time and money your AI workers are saving.",
    detail:
      "Enterprise includes detailed analytics: how many tasks each agent processed, how much time was saved, how many items were escalated to humans, accuracy rates, cost savings estimates, and trend reports. You can show your leadership team exactly what the ROI is.",
    example: "\"Our invoice agent processed 2,847 invoices this month, saved 340 hours of manual work, and flagged 23 items for human review.\"",
  },
  {
    emoji: "⚙️",
    title: "Custom agent templates for your industry",
    simple: "Like getting a starter kit that is already set up for your specific type of business.",
    detail:
      "Enterprise customers get access to industry-specific agent templates built for their sector — healthcare, finance, legal, manufacturing, retail, and more. These templates are pre-configured with the right rules, compliance settings, and integrations for your industry.",
    example: "A hospital gets a pre-built patient intake agent, a claims processing agent, and a compliance reporting agent — all ready to customize.",
  },
];

const ENTERPRISE_VS_STANDARD = [
  { feature: "Number of agents", standard: "Up to 10", enterprise: "Unlimited" },
  { feature: "Users", standard: "Up to 5", enterprise: "Unlimited" },
  { feature: "Integrations", standard: "Standard connectors", enterprise: "Any system + custom APIs" },
  { feature: "Infrastructure", standard: "Shared (secure)", enterprise: "Dedicated private environment" },
  { feature: "Compliance documents", standard: "Not included", enterprise: "BAA, DPA, custom agreements" },
  { feature: "Audit log export", standard: "CSV only", enterprise: "CSV, PDF, JSON, API" },
  { feature: "Support", standard: "Email (48hr response)", enterprise: "Dedicated manager (4hr response)" },
  { feature: "Onboarding", standard: "Self-service", enterprise: "Personalized onboarding session" },
  { feature: "Analytics", standard: "Basic dashboard", enterprise: "Full ROI reporting + trends" },
  { feature: "Industry templates", standard: "General templates", enterprise: "Industry-specific templates" },
  { feature: "SLA guarantee", standard: "Best effort", enterprise: "99.9% uptime SLA" },
  { feature: "Custom branding", standard: "Not available", enterprise: "White-label option available" },
];

const USE_CASES = [
  {
    emoji: "🏥",
    industry: "Healthcare",
    title: "Patient intake, claims processing, compliance reporting",
    desc: "Hospitals and clinics use WorkforceAutomated to handle patient intake forms, process insurance claims, flag billing errors, and generate HIPAA-compliant audit reports — all automatically.",
    agents: ["Patient Intake Agent", "Claims Processing Agent", "HIPAA Compliance Reporter", "Billing Audit Agent"],
  },
  {
    emoji: "🏦",
    industry: "Financial Services",
    title: "Transaction monitoring, compliance, reporting",
    desc: "Banks and financial firms use agents to monitor transactions for unusual activity, generate regulatory reports, review loan applications, and maintain audit trails for every action.",
    agents: ["Transaction Monitor", "Regulatory Report Generator", "Loan Application Screener", "AML Compliance Agent"],
  },
  {
    emoji: "⚖️",
    industry: "Legal",
    title: "Contract review, due diligence, document processing",
    desc: "Law firms and legal departments use agents to review contracts for risky clauses, process due diligence documents, track deadlines, and generate compliance summaries.",
    agents: ["Contract Review Agent", "Due Diligence Processor", "Deadline Tracker", "Compliance Summary Generator"],
  },
  {
    emoji: "🏭",
    industry: "Manufacturing",
    title: "Supply chain, quality control, vendor management",
    desc: "Manufacturers use agents to monitor supply chain disruptions, flag quality control issues, process vendor invoices, and generate production reports.",
    agents: ["Supply Chain Monitor", "Quality Control Agent", "Vendor Invoice Processor", "Production Report Generator"],
  },
];

export default function Enterprise() {
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
          <Link to="/platform" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Platform</Link>
          <Link to="/industries" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <Link to="/enterprise" style={{ color: TEAL, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>Enterprise</Link>
          <Link to="/#pricing" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/demo" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Demo</Link>
          <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 48px 56px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 20, padding: "5px 13px", marginBottom: 22 }}>
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Enterprise Plan</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Built for companies that need<br />
          <span style={{ color: TEAL }}>more power and more control.</span>
        </h1>
        <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 12px", maxWidth: 680 }}>
          The Enterprise plan is for companies that need AI agents running across their whole organization — with dedicated infrastructure, unlimited users, full compliance support, and a team that helps you every step of the way.
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 32px", maxWidth: 680 }}>
          Think of it as the difference between renting a desk in a shared office and owning your own building. Same great technology — but everything is yours, private, and built to your exact needs.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <a href="mailto:enterprise@workforceautomated.com" style={{ background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>
            Contact sales
          </a>
          <Link to="/demo" style={{ color: TEAL, fontWeight: 600, fontSize: 15, padding: "12px 20px", borderRadius: 8, textDecoration: "none", border: `1px solid ${TEAL_BORDER}` }}>
            See a demo first
          </Link>
        </div>
      </section>

      {/* Enterprise vs Standard */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Plan Comparison</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            What do you get with Enterprise?
          </p>
          <div style={{ background: "#fff", border: DIVIDER, borderRadius: 12, overflow: "hidden" }}>
            {/* Header */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 160px 200px", background: DARK, padding: "14px 24px" }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Feature</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: "#9ca3af", textTransform: "uppercase", letterSpacing: "0.06em" }}>Standard</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.06em" }}>Enterprise</span>
            </div>
            {ENTERPRISE_VS_STANDARD.map((row, i) => (
              <div key={row.feature} style={{ display: "grid", gridTemplateColumns: "1fr 160px 200px", padding: "14px 24px", borderBottom: i < ENTERPRISE_VS_STANDARD.length - 1 ? DIVIDER : "none", background: i % 2 === 0 ? "#fff" : "#f9fafb" }}>
                <span style={{ fontSize: 14, color: DARK, fontWeight: 500 }}>{row.feature}</span>
                <span style={{ fontSize: 13, color: GRAY_TEXT }}>{row.standard}</span>
                <span style={{ fontSize: 13, color: TEAL, fontWeight: 600 }}>{row.enterprise}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enterprise features */}
      <section style={{ padding: "72px 48px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Enterprise Features</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          Everything your company needs — explained simply
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px", maxWidth: 580, lineHeight: 1.6 }}>
          Each feature is explained in plain language so anyone at your company can understand what they are getting.
        </p>
        <div>
          {ENTERPRISE_FEATURES.map((f) => (
            <div key={f.title} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 24, padding: "28px 0", borderTop: DIVIDER }}>
              <div style={{ fontSize: 28, paddingTop: 4 }}>{f.emoji}</div>
              <div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: "0 0 4px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, fontWeight: 600, color: TEAL, margin: "0 0 8px" }}>{f.simple}</p>
                <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: "0 0 12px" }}>{f.detail}</p>
                <div style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
                  <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Example: </span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{f.example}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* Industry use cases */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Industry Use Cases</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            How companies like yours are using it
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {USE_CASES.map((uc) => (
              <div key={uc.industry} style={{ border: DIVIDER, borderRadius: 14, padding: "28px", background: "#fff" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <span style={{ fontSize: 32 }}>{uc.emoji}</span>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 3 }}>{uc.industry}</div>
                    <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: 0 }}>{uc.title}</h3>
                  </div>
                </div>
                <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: "0 0 16px" }}>{uc.desc}</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {uc.agents.map((a) => (
                    <span key={a} style={{ fontSize: 11, fontWeight: 600, color: TEAL, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, padding: "3px 10px", borderRadius: 20 }}>{a}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to get started */}
      <section style={{ padding: "72px 48px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Getting Started</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          How does Enterprise onboarding work?
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {[
            { num: "1", title: "Contact our sales team", desc: "Email us or fill out the form below. We will get back to you within one business day.", icon: "📧" },
            { num: "2", title: "Discovery call", desc: "We spend 30 minutes learning about your company, your processes, and what you want to automate.", icon: "📞" },
            { num: "3", title: "Custom setup", desc: "We set up your private environment, connect your systems, and build your first agents together.", icon: "⚙️" },
            { num: "4", title: "You are live", desc: "Your agents start working. Your dedicated manager checks in weekly to help you expand.", icon: "🚀" },
          ].map((s) => (
            <div key={s.num} style={{ textAlign: "center" }}>
              <div style={{ width: 48, height: 48, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, margin: "0 auto 12px" }}>{s.icon}</div>
              <div style={{ fontSize: 11, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>Step {s.num}</div>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: DARK, margin: "0 0 8px" }}>{s.title}</h3>
              <p style={{ fontSize: 13, color: GRAY_TEXT, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to talk to our sales team?</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>No pressure. We will listen to what you need and tell you honestly if Enterprise is the right fit.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <a href="mailto:enterprise@workforceautomated.com" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>
            Email enterprise@workforceautomated.com
          </a>
          <Link to="/demo" style={{ background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", border: "2px solid rgba(255,255,255,0.5)" }}>
            See a demo first
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: DARK, padding: "32px 48px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <span style={{ color: "#9ca3af", fontSize: 13 }}>WorkforceAutomated © 2026</span>
        <div style={{ display: "flex", gap: 24 }}>
          <a href="mailto:contact@workforceautomated.com" style={{ color: "#9ca3af", fontSize: 12, textDecoration: "none" }}>contact@workforceautomated.com</a>
          <Link to="/privacy" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Privacy</Link>
          <Link to="/terms" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Terms</Link>
          <Link to="/security-overview" style={{ color: "#9ca3af", fontSize: 13, textDecoration: "none" }}>Security</Link>
        </div>
      </footer>
    </div>
  );
}
