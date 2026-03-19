import { useState } from "react";
import { Link } from "react-router-dom";

const NAV_LINKS = ["Product", "Security", "Pricing", "Docs"];

const FEATURES = [
  {
    icon: "🤖",
    title: "AI Agent Orchestration",
    desc: "Build and deploy intelligent agents that handle complex workflows — from data processing to customer interactions — without writing a single line of code.",
  },
  {
    icon: "🔐",
    title: "Zero-Knowledge Encryption",
    desc: "Your data is encrypted on your device before it ever reaches our servers. AES-256-GCM encryption means only you can read your data — not even us.",
  },
  {
    icon: "🛡️",
    title: "DRASS Disaster Recovery",
    desc: "Automated encrypted backups with 90-day retention. Recovery keys give you a secondary access method if your primary credentials are ever compromised.",
  },
  {
    icon: "⚡",
    title: "Real-Time Execution",
    desc: "Watch your agents work in real time. Full execution logs, confidence monitoring, and audit trails give you complete visibility into every automated action.",
  },
  {
    icon: "🔗",
    title: "50+ Integrations",
    desc: "Connect to Slack, Salesforce, HubSpot, Jira, GitHub, and more. Trigger agents from any event — a new form submission, a payment, a calendar invite.",
  },
  {
    icon: "📊",
    title: "Security Audit Dashboard",
    desc: "Immutable audit logs, encryption key rotation history, and backup restoration records — everything you need for SOC 2, HIPAA, and GDPR compliance.",
  },
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
    color: "#0d9488",
  },
  {
    title: "DRASS: Disaster Recovery",
    subtitle: "Encrypted backups + Recovery keys",
    points: ["Encrypted backups with 90-day retention", "Recovery keys for account recovery", "Separate backup storage location", "Integrity verification via checksums"],
    color: "#0d9488",
  },
  {
    title: "Enterprise Compliance",
    subtitle: "SOC 2 · GDPR · HIPAA",
    points: ["SOC 2 Type II ready", "GDPR & HIPAA compliant", "Immutable audit logs", "Zero-trust access model"],
    color: "#0d9488",
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
    features: ["Up to 25 active AI agents", "5 agent teams", "100,000 executions/month", "All integrations", "Priority support", "Advanced analytics"],
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

export default function Landing() {
  const [securityTab, setSecurityTab] = useState<"simple" | "technical">("simple");

  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#f9fafb", color: "#111827", minHeight: "100vh" }}>

      {/* Nav */}
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

      {/* Hero */}
      <section style={{ background: "#fff", padding: "80px 40px 60px", maxWidth: 1100, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "6px 14px", marginBottom: 24 }}>
            <span style={{ width: 8, height: 8, background: "#0d9488", borderRadius: "50%", display: "inline-block" }}></span>
            <span style={{ fontSize: 13, color: "#0d9488", fontWeight: 600 }}>Enterprise-grade AI automation</span>
          </div>
          <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.15, color: "#111827", margin: "0 0 20px" }}>
            Automate your workforce.<br />
            <span style={{ color: "#0d9488" }}>Securely.</span>
          </h1>
          <p style={{ fontSize: 18, color: "#6b7280", lineHeight: 1.7, margin: "0 0 32px", maxWidth: 480 }}>
            Build AI agents that handle complex business workflows — with zero-knowledge encryption, automated disaster recovery, and full audit trails built in from day one.
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
            {[
              { label: "AES-256-GCM Encrypted" },
              { label: "SOC 2 Ready" },
              { label: "GDPR Compliant" },
            ].map((b) => (
              <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ color: "#0d9488", fontSize: 14 }}>✓</span>
                <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>{b.label}</span>
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

      {/* Features */}
      <section id="product" style={{ padding: "80px 40px", maxWidth: 1100, margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: 56 }}>
          <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>Everything you need to automate at scale</h2>
          <p style={{ fontSize: 17, color: "#6b7280", maxWidth: 560, margin: "0 auto" }}>From AI agent orchestration to enterprise-grade security — all in one platform.</p>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 24 }}>
          {FEATURES.map((f) => (
            <div key={f.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
              <div style={{ fontSize: 28, marginBottom: 14 }}>{f.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>{f.title}</h3>
              <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security Section */}
      <section id="security" style={{ background: "#fff", padding: "80px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 40 }}>
            <h2 style={{ fontSize: 36, fontWeight: 800, color: "#111827", margin: "0 0 12px" }}>How we keep your data safe</h2>
            <p style={{ fontSize: 16, color: "#6b7280", maxWidth: 520, margin: "0 auto 28px" }}>Choose how you want to understand our security — plain English or full technical details.</p>
            <div style={{ display: "inline-flex", background: "#f3f4f6", borderRadius: 10, padding: 4, gap: 4 }}>
              {[
                { id: "simple", label: "🔐 Security Made Simple" },
                { id: "technical", label: "🛡️ Technical Details" },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSecurityTab(t.id as "simple" | "technical")}
                  style={{
                    padding: "10px 22px",
                    borderRadius: 8,
                    border: "none",
                    background: securityTab === t.id ? "#fff" : "transparent",
                    color: securityTab === t.id ? "#0d9488" : "#6b7280",
                    fontWeight: securityTab === t.id ? 700 : 500,
                    fontSize: 14,
                    cursor: "pointer",
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 32 }}>
                {SECURITY_SIMPLE.map((s) => (
                  <div key={s.title} style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 12, padding: 24 }}>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{s.emoji}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0d9488", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>{s.subtitle}</div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 10px", lineHeight: 1.4 }}>{s.title}</h3>
                    <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.7, margin: 0 }}>{s.desc}</p>
                  </div>
                ))}
              </div>
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 28 }}>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#111827", margin: "0 0 6px", textAlign: "center" }}>6 Ways We Protect You</h3>
                <p style={{ fontSize: 14, color: "#9ca3af", textAlign: "center", margin: "0 0 24px" }}>Every protection method explained simply.</p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 16 }}>
                  {SECURITY_ICONS.map((ic) => (
                    <div key={ic.title} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: 18, textAlign: "center" }}>
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
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, marginBottom: 28 }}>
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
              <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 12, padding: 24 }}>
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
                    <div key={item.n} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: 14 }}>
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

      {/* Pricing */}
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

      {/* CTA */}
      <section style={{ background: "#0d9488", padding: "80px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to automate your workforce?</h2>
        <p style={{ fontSize: 17, color: "#ccfbf1", margin: "0 0 32px" }}>Join hundreds of teams using WorkforceAutomated to save time, reduce errors, and scale operations.</p>
        <Link to="/register" style={{ background: "#fff", color: "#0d9488", fontWeight: 700, fontSize: 16, padding: "14px 32px", borderRadius: 10, textDecoration: "none", display: "inline-block" }}>
          Get started for free
        </Link>
      </section>

      {/* Footer */}
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
