import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Data ────────────────────────────────────────────────────────────────────

const NAV_LINKS = ["Product", "Security", "Pricing", "Docs"];

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
    desc: "Finance, HR, legal, sales, customer support, IT — if there's a process, we can automate it.",
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
  {
    emoji: "📐",
    title: "Agent Skill Templates",
    desc: "Start instantly with pre-built agent templates: Invoice Reviewer, Contract Analyst, Support Ticket Classifier, Lead Scorer, HR Application Screener, Compliance Checker, Code Reviewer, and more. Customize or build from scratch.",
  },
  {
    emoji: "📊",
    title: "KPI Builder",
    desc: "Define custom KPIs with formulas, data sources, target values, and warning/critical thresholds. Track agent performance against your actual business metrics.",
  },
  {
    emoji: "🛡️",
    title: "Governance Controls",
    desc: "Set organization-wide confidence thresholds, escalation policies, and approval rules. Define exactly how much autonomy each agent has — and where humans must stay in the loop.",
  },
  {
    emoji: "✅",
    title: "Review Queue",
    desc: "Role-based approval workflow for manager and admin review. Approve or reject agent actions individually or in bulk. Full audit trail of every decision.",
  },
  {
    emoji: "🗓️",
    title: "Scheduled Executions",
    desc: "Set any agent or team to run automatically on a schedule — daily, weekly, or custom. Agents execute on time without any manual trigger.",
  },
  {
    emoji: "📄",
    title: "Reports & Exports",
    desc: "Generate PDF execution reports, export audit logs and escalation records as CSV, and schedule automatic report delivery to any email address.",
  },
  {
    emoji: "📡",
    title: "Confidence Monitor",
    desc: "Real-time visibility into every agent's confidence score across all executions. Spot underperforming agents before they cause problems.",
  },
  {
    emoji: "🔗",
    title: "Integrations Manager",
    desc: "Connect external systems — APIs, databases, webhooks, SaaS tools — and assign specific integrations to specific agents. Agents only access what you authorize.",
  },
  {
    emoji: "📚",
    title: "Immutable Audit Log",
    desc: "Every agent action is recorded permanently. Filter, search, and export the full history of what every agent did, when, and why. Built for compliance and enterprise audits.",
  },
  {
    emoji: "💳",
    title: "Billing & Subscription",
    desc: "Stripe-powered plan management. Upgrade, downgrade, or cancel at any time. Full billing history available in your account dashboard.",
  },
];

const USE_CASES = [
  { dept: "Finance", emoji: "💰", task: "Review invoices, flag overdue payments, generate variance reports" },
  { dept: "HR", emoji: "👥", task: "Screen job applications, track onboarding tasks, monitor policy compliance" },
  { dept: "Legal", emoji: "⚖️", task: "Review contracts for missing clauses, track regulatory deadlines" },
  { dept: "Customer Support", emoji: "🎧", task: "Classify tickets, draft responses, escalate urgent issues" },
  { dept: "Sales", emoji: "📣", task: "Score leads, flag at-risk deals, update CRM records" },
  { dept: "IT & Security", emoji: "🖥️", task: "Monitor systems, detect anomalies, generate incident reports" },
];

const EXECUTION_STEPS = [
  { num: "1", title: "You Define the Process", desc: "Paste a job description, process document, or configure manually. The platform converts it into a structured agent with defined inputs, outputs, and rules." },
  { num: "2", title: "The Agent Connects to Your Systems", desc: "Assign integrations — APIs, databases, SaaS tools. The agent reads and writes only what you authorize. No credentials stored in GitHub. Least-privilege by default." },
  { num: "3", title: "It Executes and Scores Every Action", desc: "Every action gets a confidence score. High-confidence actions are completed automatically. Low-confidence or high-risk actions are escalated to a human reviewer." },
  { num: "4", title: "You Review, Approve, or Override", desc: "The Review Queue shows every escalated action. Approve or reject individually or in bulk. Every decision is logged permanently in the audit trail." },
];

const SECURITY_SIMPLE = [
  {
    emoji: "🔐",
    title: "Your Data is Like a Secret in a Locked Box",
    subtitle: "Zero-Knowledge Encryption",
    desc: "Imagine writing your diary and locking it with a key only you have. Even if someone found the box, they could not read it. That is exactly what we do with your data — we lock it with your personal key before it ever leaves your device. Not even our team can read it.",
  },
  {
    emoji: "💾",
    title: "We Always Have a Backup Plan",
    subtitle: "DRASS Disaster Recovery",
    desc: "Remember saving your homework in two places — on your computer AND a USB drive — just in case? We do the same with your data. Every day, we make an encrypted copy stored somewhere completely separate. If anything ever goes wrong, we can restore everything.",
  },
  {
    emoji: "✅",
    title: "We Follow All the Rules",
    subtitle: "Enterprise Compliance",
    desc: "Just like how schools follow rules to keep students safe, we follow the strictest security rules in the world — GDPR, HIPAA, and SOC 2. These are not just checkboxes. They are promises that your data is handled with the highest level of care.",
  },
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
  {
    title: "Zero-Knowledge Encryption",
    subtitle: "AES-256-GCM + NaCl libsodium",
    points: ["Client-side AES-256-GCM encryption", "NaCl authenticated encryption", "Server stores only encrypted data", "Your key, your control"],
  },
  {
    title: "DRASS: Disaster Recovery",
    subtitle: "Encrypted backups + Recovery keys",
    points: ["Encrypted backups with 90-day retention", "Recovery keys for account recovery", "Separate backup storage location", "Integrity verification via checksums"],
  },
  {
    title: "Enterprise Compliance",
    subtitle: "SOC 2 · GDPR · HIPAA",
    points: ["SOC 2 Type II ready", "GDPR & HIPAA compliant", "Immutable audit logs", "Zero-trust access model"],
  },
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    tagline: "For a single team or department",
    features: ["Up to 5 active AI agents", "1 agent team", "10,000 executions/month", "Basic integrations", "Email support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$149",
    period: "/mo",
    tagline: "For growing organizations",
    features: ["Up to 25 active AI agents", "Unlimited agent teams", "100,000 executions/month", "All integrations", "Priority support", "Advanced analytics"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For large-scale deployments",
    features: ["Unlimited agents & teams", "Unlimited executions", "Custom integrations", "Dedicated support", "SLA guarantee", "On-premise option"],
    cta: "Contact Sales",
    highlight: false,
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const [securityTab, setSecurityTab] = useState<"simple" | "technical">("simple");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f9fafb", color: "#111827", minHeight: "100vh" }}>

      {/* ── Nav ── */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "0 40px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64, position: "sticky", top: 0, zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 32, height: 32, background: "#0d9488", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 16, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 16, color: "#111827" }}>WorkforceAutomated</span>
        </div>
        <div style={{ display: "flex", gap: 32 }}>
          {NAV_LINKS.map((l) => (
            <a key={l} href={`#${l.toLowerCase()}`} style={{ color: "#6b7280", fontSize: 14, fontWeight: 500, textDecoration: "none" }}>{l}</a>
          ))}
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ color: "#374151", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>Sign in</Link>
          <Link to="/register" style={{ background: "#0d9488", color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "8px 20px", borderRadius: 8 }}>Get started</Link>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section style={{ background: "#fff", padding: "80px 40px 60px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: "#0d9488", borderRadius: "50%", display: "inline-block" }}></span>
            <span style={{ fontSize: 13, color: "#0d9488", fontWeight: 600 }}>Enterprise AI Workforce Operating System</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, color: "#111827", margin: "0 0 20px" }}>
            Automate your workforce.<br />
            <span style={{ color: "#0d9488" }}>Securely.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 480 }}>
            Convert job descriptions into governed AI agents that execute work independently or in structured teams — with full audit trails, confidence scoring, and human escalation built in.
          </p>
          <div style={{ display: "flex", gap: 12, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: "#0d9488", color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 28px", borderRadius: 10, textDecoration: "none" }}>
              Start free trial
            </Link>
            <a href="#product" style={{ color: "#374151", fontWeight: 600, fontSize: 15, textDecoration: "none", display: "flex", alignItems: "center", gap: 6 }}>
              See how it works →
            </a>
          </div>
          <div style={{ display: "flex", gap: 24, marginTop: 32 }}>
            {["AES-256-GCM Encrypted", "SOC 2 Ready", "GDPR Compliant"].map((b) => (
              <div key={b} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#0d9488", fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{b}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ background: "#f0fdfa", borderRadius: 16, padding: 32, border: "1px solid #ccfbf1" }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 20, marginBottom: 16, border: "1px solid #e5e7eb" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
              <div style={{ width: 8, height: 8, background: "#10b981", borderRadius: "50%" }}></div>
              <span style={{ fontSize: 13, color: "#374151", fontWeight: 600 }}>Agent: Customer Onboarding</span>
            </div>
            <div style={{ fontSize: 12, color: "#9ca3af", lineHeight: 1.8 }}>
              <div>✓ New user registered — Slack notified</div>
              <div>✓ CRM record created — HubSpot synced</div>
              <div>✓ Welcome email sent — SendGrid delivered</div>
              <div style={{ color: "#0d9488" }}>⟳ Scheduling onboarding call — Calendly...</div>
            </div>
          </div>
          <div style={{ background: "#fff", borderRadius: 12, padding: 16, border: "1px solid #e5e7eb" }}>
            <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 8, fontWeight: 600 }}>Security Status</div>
            <div style={{ display: "flex", gap: 8 }}>
              {["Encrypted", "Backed up", "Audit logged"].map((s) => (
                <span key={s} style={{ background: "#f0fdfa", color: "#0d9488", fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, border: "1px solid #99f6e4" }}>{s}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ── */}
      <section style={{ background: "#0d9488", padding: "28px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, textAlign: "center" }}>
          {[
            { stat: "3 days → 20 min", label: "Invoice processing" },
            { stat: "4×", label: "Scale without new hires" },
            { stat: "100%", label: "Audit coverage" },
            { stat: "< 5 min", label: "Agent setup time" },
          ].map(({ stat, label }) => (
            <div key={label}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fff" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#ccfbf1", marginTop: 2 }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why It Works ── */}
      <section id="product" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>Why it works</h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 560, margin: "0 auto" }}>
            WorkforceAutomated is not a chatbot. It is an enterprise AI Workforce Operating System — built for real business processes, real compliance requirements, and real human oversight.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 20 }}>
          {WHY_IT_WORKS.map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24, display: "flex", gap: 16 }}>
              <div style={{ fontSize: 28, flexShrink: 0 }}>{f.emoji}</div>
              <div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 6px" }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How Agents Execute Work ── */}
      <section style={{ background: "#fff", padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>How agents actually do the work</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 600, margin: "0 auto" }}>
              An agent is not just a chatbot. It is an active worker that connects to your real systems, reads and writes real data, and takes real actions — all within the boundaries you set.
            </p>
            <p style={{ fontSize: 14, color: "#9ca3af", maxWidth: 600, margin: "12px auto 0" }}>
              You grant access once. The agent uses only what you have authorized. Every action is logged.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20 }}>
            {EXECUTION_STEPS.map((s) => (
              <div key={s.num} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
                <div style={{ width: 36, height: 36, background: "#0d9488", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", marginBottom: 14 }}>{s.num}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 24, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {[
              { emoji: "🎯", title: "Confidence Score", desc: "Every action gets a confidence score. If the AI is not sure enough, it stops and asks you." },
              { emoji: "🚨", title: "Auto-Escalation", desc: "High-risk or low-confidence tasks are automatically sent to the right human for review." },
              { emoji: "📋", title: "Permanent Audit Log", desc: "Every single action is recorded forever. You can see exactly what the AI did and when." },
              { emoji: "🔒", title: "Permission Boundaries", desc: "You define exactly what the agent can and cannot do. It cannot go outside those limits." },
            ].map((g) => (
              <div key={g.title} style={{ textAlign: "center", padding: "8px 0" }}>
                <div style={{ fontSize: 24, marginBottom: 8 }}>{g.emoji}</div>
                <h4 style={{ fontSize: 13, fontWeight: 700, color: "#0d9488", margin: "0 0 4px" }}>{g.title}</h4>
                <p style={{ fontSize: 12, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Platform Features ── */}
      <section style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>Everything included in the platform</h2>
          <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 560, margin: "0 auto" }}>
            Every feature you need to deploy, govern, monitor, and scale AI agents across your organization.
          </p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 16 }}>
          {PLATFORM_FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 22, display: "flex", gap: 14 }}>
              <div style={{ fontSize: 24, flexShrink: 0 }}>{f.emoji}</div>
              <div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 5px" }}>{f.title}</h3>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Use Cases by Department ── */}
      <section style={{ background: "#fff", padding: "80px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>Works for any department</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520, margin: "0 auto" }}>
              Finance, HR, Legal, Sales, Support, IT — if there is a process, WorkforceAutomated can automate it.
            </p>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16 }}>
            {USE_CASES.map((u) => (
              <div key={u.dept} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 20 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                  <span style={{ fontSize: 22 }}>{u.emoji}</span>
                  <span style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{u.dept}</span>
                </div>
                <p style={{ fontSize: 13, color: "#6b7280", lineHeight: 1.65, margin: 0 }}>{u.task}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Security ── */}
      <section id="security" style={{ background: "#f9fafb", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>How we keep your data safe</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520, margin: "0 auto 28px" }}>
              Choose how you want to understand our security — plain English or full technical details.
            </p>
            <div style={{ display: "inline-flex", background: "#e5e7eb", borderRadius: 10, padding: 4, gap: 4 }}>
              {[
                { id: "simple", label: "🔐 Security Made Simple" },
                { id: "technical", label: "🛡️ Technical Details" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSecurityTab(t.id as "simple" | "technical")}
                  style={{
                    padding: "10px 22px", borderRadius: 8, border: "none",
                    background: securityTab === t.id ? "#fff" : "transparent",
                    color: securityTab === t.id ? "#0d9488" : "#6b7280",
                    fontWeight: securityTab === t.id ? 700 : 500,
                    fontSize: 14, cursor: "pointer",
                    boxShadow: securityTab === t.id ? "0 1px 4px rgba(0,0,0,0.1)" : "none",
                    transition: "all 0.15s",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {securityTab === "simple" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
                {SECURITY_SIMPLE.map((s) => (
                  <div key={s.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{s.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.subtitle}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 10px", lineHeight: 1.4 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 6px", textAlign: "center" }}>6 Ways We Protect You</h3>
                <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", margin: "0 0 24px" }}>Every protection method explained simply.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                  {SECURITY_ICONS.map((ic) => (
                    <div key={ic.title} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18, textAlign: "center" }}>
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{ic.emoji}</div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 6px", lineHeight: 1.4 }}>{ic.title}</h4>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0, lineHeight: 1.6 }}>{ic.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {securityTab === "technical" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 24 }}>
                {SECURITY_TECHNICAL.map((s) => (
                  <div key={s.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{s.title}</h3>
                    <div style={{ fontSize: 12, color: "#0d9488", fontWeight: 600, marginBottom: 14 }}>{s.subtitle}</div>
                    <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
                      {s.points.map((p) => (
                        <li key={p} style={{ fontSize: 13, color: "#6b7280", padding: "5px 0", display: "flex", gap: 8 }}>
                          <span style={{ color: "#0d9488", flexShrink: 0 }}>✓</span> {p}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
              <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px", textAlign: "center" }}>Data Protection Layers</h3>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12 }}>
                  {[
                    { n: "1", t: "Encryption at Rest", d: "AES-256 for all stored data" },
                    { n: "2", t: "Encryption in Transit", d: "TLS 1.3 for all transmission" },
                    { n: "3", t: "Encrypted Backups", d: "Separate backup storage" },
                    { n: "4", t: "Recovery Keys", d: "Secondary account access" },
                    { n: "5", t: "Audit Logging", d: "Immutable access logs" },
                    { n: "6", t: "Zero Trust", d: "Every access verified" },
                  ].map((item) => (
                    <div key={item.n} style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14 }}>
                      <div style={{ width: 28, height: 28, background: "#0d9488", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 10 }}>{item.n}</div>
                      <h4 style={{ fontSize: 13, fontWeight: 700, color: "#111827", margin: "0 0 4px" }}>{item.t}</h4>
                      <p style={{ fontSize: 12, color: "#9ca3af", margin: 0 }}>{item.d}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* ── Pricing ── */}
      <section id="pricing" style={{ padding: "80px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>Simple, transparent pricing</h2>
          <p style={{ fontSize: 16, color: "#6b7280" }}>Start free. Upgrade when you are ready.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
          {PLANS.map((p) => (
            <div key={p.name} style={{ background: p.highlight ? "#0d9488" : "#fff", border: p.highlight ? "none" : "1px solid #e5e7eb", borderRadius: 14, padding: 28 }}>
              <h3 style={{ fontSize: 18, fontWeight: 700, color: p.highlight ? "#fff" : "#111827", margin: "0 0 4px" }}>{p.name}</h3>
              <p style={{ fontSize: 13, color: p.highlight ? "#ccfbf1" : "#9ca3af", margin: "0 0 20px" }}>{p.tagline}</p>
              <div style={{ marginBottom: 20 }}>
                <span style={{ fontSize: 36, fontWeight: 800, color: p.highlight ? "#fff" : "#111827" }}>{p.price}</span>
                <span style={{ fontSize: 14, color: p.highlight ? "#ccfbf1" : "#9ca3af" }}>{p.period}</span>
              </div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                {p.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: p.highlight ? "#ccfbf1" : "#6b7280", padding: "5px 0", display: "flex", gap: 8 }}>
                    <span style={{ color: p.highlight ? "#fff" : "#0d9488", flexShrink: 0 }}>✓</span> {f}
                  </li>
                ))}
              </ul>
              <Link to="/register" style={{ display: "block", textAlign: "center", background: p.highlight ? "#fff" : "#0d9488", color: p.highlight ? "#0d9488" : "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 8, textDecoration: "none" }}>
                {p.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section style={{ background: "#0d9488", padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to automate your workforce?</h2>
        <p style={{ fontSize: 17, color: "#ccfbf1", margin: "0 0 32px" }}>
          Join hundreds of teams using WorkforceAutomated to save time, reduce errors, and scale operations.
        </p>
        <Link to="/register" style={{ background: "#fff", color: "#0d9488", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
          Get started for free
        </Link>
      </section>

      {/* ── Footer ── */}
      <footer style={{ background: "#111827", padding: "40px 40px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 28, height: 28, background: "#0d9488", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 14, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ color: "#9ca3af", fontSize: 14 }}>WorkforceAutomated © 2026</span>
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
