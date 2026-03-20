import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const REASONS = [
  {
    emoji: "⚡",
    title: "Works Without Hiring Anyone",
    desc: "Your AI agent handles repetitive tasks 24/7. No sick days, no overtime, no training time. You define the process once — the agent runs it indefinitely, at any scale.",
    detail: "Traditional automation requires developers to write scripts, maintain integrations, and handle edge cases. WorkforceAutomated agents are configured in plain language and adapt to new inputs automatically.",
  },
  {
    emoji: "📈",
    title: "Turns Slow Work Into Fast Revenue",
    desc: "Processes that used to take days now finish in minutes. Invoice review, contract analysis, lead scoring, report generation — all completed automatically, on schedule.",
    detail: "A finance team that previously spent 3 days per month reconciling invoices can configure an Invoice Reviewer agent that processes the same workload in under 20 minutes — with a full audit trail.",
  },
  {
    emoji: "🧑‍💼",
    title: "Humans Stay in Charge",
    desc: "Every agent has a configurable confidence threshold. When the agent is uncertain, it escalates to a human reviewer — it never acts unilaterally on low-confidence decisions.",
    detail: "The Review Queue shows every escalated action. Managers approve or reject individually or in bulk. Every decision is logged permanently. You set the rules; the agent follows them.",
  },
  {
    emoji: "🏢",
    title: "Works for Any Department",
    desc: "Finance, HR, Legal, Sales, Support, IT, Cybersecurity, Payroll, Healthcare, Manufacturing, Real Estate, Consulting, C-Level Executive — if there is a process, we automate it.",
    detail: "Over 22 pre-built industry configurations are available, each with domain-specific agent templates, system prompts, and output formats tuned for that department's actual workflows.",
  },
  {
    emoji: "📋",
    title: "Every Action is Recorded",
    desc: "A permanent, tamper-proof log of everything the agent did — what input it received, what it produced, what confidence score it assigned, and what a human decided.",
    detail: "The immutable audit log is built for enterprise compliance. Every entry includes timestamp, agent ID, action type, input hash, output summary, confidence score, and user review decision.",
  },
  {
    emoji: "🚀",
    title: "Ready in Minutes, Not Months",
    desc: "Paste a job description or process document. The platform converts it into a structured agent with defined inputs, outputs, and rules — ready to run in under 5 minutes.",
    detail: "No code. No API configuration. No IT tickets. Any manager can configure an agent from a process document, a job description, or a plain-language description of the task.",
  },
  {
    emoji: "🔐",
    title: "Enterprise-Grade Security Built In",
    desc: "AES-256-GCM encryption at rest, TLS 1.3 in transit, zero-trust access model, and daily encrypted backups — all included in every plan, not sold as an add-on.",
    detail: "Security is not a tier feature. Every account — including Starter — gets the same encryption, audit logging, and access controls as the Enterprise plan. Your data is always protected.",
  },
  {
    emoji: "🔗",
    title: "Connects to Your Existing Systems",
    desc: "Agents connect to your APIs, databases, SaaS tools, and webhooks. They read and write only what you authorize — with least-privilege access by default.",
    detail: "The Integrations Manager lets you assign specific connections to specific agents. An invoice agent can read from QuickBooks but cannot write to Salesforce. You control every permission.",
  },
];

const COMPARISON = [
  { aspect: "Setup time", traditional: "Weeks to months of development", wa: "Under 5 minutes" },
  { aspect: "Maintenance", traditional: "Ongoing developer time required", wa: "Self-maintaining; adapts to input changes" },
  { aspect: "Audit trail", traditional: "Manual logging or none", wa: "Automatic, immutable, tamper-proof" },
  { aspect: "Human oversight", traditional: "All-or-nothing automation", wa: "Configurable confidence thresholds" },
  { aspect: "Scalability", traditional: "Linear cost increase with volume", wa: "Fixed cost regardless of execution volume" },
  { aspect: "Security", traditional: "Varies by implementation", wa: "AES-256-GCM, zero-trust, built in" },
];

export default function WhyItWorks() {
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
          <Link to="/why-it-works" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Why It Works</Link>
          <Link to="/platform" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Platform</Link>
          <Link to="/industries" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
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
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Why It Works</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Not a chatbot.<br />
          <span style={{ color: TEAL }}>An enterprise AI Workforce Operating System.</span>
        </h1>
        <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 32px", maxWidth: 620 }}>
          WorkforceAutomated is built for real business processes, real compliance requirements, and real human oversight — not demos and experiments.
        </p>
        <Link to="/register" style={{ background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
          Start free trial
        </Link>
      </section>

      {/* Reasons */}
      <section style={{ padding: "0 48px 72px", maxWidth: 900, margin: "0 auto" }}>
        <div>
          {REASONS.map((r) => (
            <div key={r.title} style={{ padding: "32px 0", borderTop: DIVIDER }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 20, marginBottom: 12 }}>
                <span style={{ fontSize: 22 }}>{r.emoji}</span>
                <div>
                  <h2 style={{ fontSize: 18, fontWeight: 700, color: DARK, margin: "0 0 6px" }}>{r.title}</h2>
                  <p style={{ fontSize: 15, color: GRAY_TEXT, margin: "0 0 12px", lineHeight: 1.65 }}>{r.desc}</p>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, background: "#f8fafc", padding: "14px 18px", borderLeft: `3px solid ${TEAL}`, margin: 0 }}>{r.detail}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* Comparison Table */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Comparison</h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 40px", lineHeight: 1.2 }}>
            WorkforceAutomated vs. traditional automation
          </p>
          <div style={{ borderTop: DIVIDER }}>
            <div style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 0, padding: "10px 0", borderBottom: DIVIDER }}>
              <span style={{ fontSize: 12, fontWeight: 700, color: GRAY_TEXT, textTransform: "uppercase", letterSpacing: "0.05em" }}></span>
              <span style={{ fontSize: 12, fontWeight: 700, color: GRAY_TEXT, textTransform: "uppercase", letterSpacing: "0.05em" }}>Traditional Automation</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.05em" }}>WorkforceAutomated</span>
            </div>
            {COMPARISON.map((row) => (
              <div key={row.aspect} style={{ display: "grid", gridTemplateColumns: "200px 1fr 1fr", gap: 0, padding: "16px 0", borderBottom: DIVIDER, alignItems: "start" }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{row.aspect}</span>
                <span style={{ fontSize: 13, color: GRAY_TEXT, paddingRight: 24, lineHeight: 1.5 }}>{row.traditional}</span>
                <span style={{ fontSize: 13, color: TEAL, fontWeight: 600, lineHeight: 1.5 }}>✓ {row.wa}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to see it in action?</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>Start a free trial — no credit card required. Your first agent is running in under 5 minutes.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
          <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>Start free trial</Link>
          <Link to="/demo" style={{ background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", border: "1px solid rgba(255,255,255,0.4)" }}>Try live demo</Link>
        </div>
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
