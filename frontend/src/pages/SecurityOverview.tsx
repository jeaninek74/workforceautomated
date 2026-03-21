import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const SECURITY_LAYERS = [
  {
    emoji: "🔐",
    title: "AES-256-GCM Encryption at Rest",
    category: "Encryption",
    desc: "All stored data — agent configurations, execution outputs, audit logs, and user credentials — is encrypted using AES-256-GCM, the same standard used by financial institutions and government agencies.",
    technical: "Implementation: AES-256-GCM with authenticated encryption. Keys are derived using PBKDF2 with 100,000 iterations. Each record uses a unique initialization vector (IV). Implemented in Node.js crypto module.",
    status: "Active",
  },
  {
    emoji: "🔒",
    title: "NaCl Authenticated Encryption",
    category: "Encryption",
    desc: "Sensitive fields use NaCl (libsodium) authenticated encryption — an additional layer of cryptographic protection that verifies data integrity alongside confidentiality.",
    technical: "Implementation: libsodium secretbox using XSalsa20-Poly1305. Provides both encryption and authentication in a single operation. Prevents tampering even if the database is accessed directly.",
    status: "Active",
  },
  {
    emoji: "🌐",
    title: "TLS 1.3 in Transit",
    category: "Transport",
    desc: "All data transmitted between your browser and our servers uses TLS 1.3 — the latest and most secure transport layer protocol. Older, weaker protocols are explicitly disabled.",
    technical: "Enforced via Cloudflare with HSTS headers and minimum TLS 1.2 (1.3 preferred). Certificate pinning is applied for API endpoints. All HTTP traffic is redirected to HTTPS.",
    status: "Active",
  },
  {
    emoji: "🛡️",
    title: "Zero-Trust Access Model",
    category: "Access Control",
    desc: "Every API request is authenticated and authorized independently. There are no implicit trust relationships between services. Every action requires a valid JWT token and passes role-based access checks.",
    technical: "JWT tokens signed with HS256, 30-day expiry, validated on every request. Role-based access control (RBAC) with user, manager, and admin roles. No service-to-service trust without explicit token.",
    status: "Active",
  },
  {
    emoji: "📚",
    title: "Immutable Audit Log",
    category: "Compliance",
    desc: "Every agent action, user decision, login event, and configuration change is recorded in an append-only audit log. Records cannot be modified or deleted — by anyone, including administrators.",
    technical: "Audit records are written to a separate database table with no UPDATE or DELETE permissions granted to the application user. Each record includes: timestamp, user ID, action type, entity type, entity ID, IP address, and user agent.",
    status: "Active",
  },
  {
    emoji: "💾",
    title: "DRASS Encrypted Backups",
    category: "Resilience",
    desc: "Daily encrypted backups using the DRASS (Distributed Redundant Automated Secure Storage) protocol. Backups are encrypted before transmission and stored in geographically separate locations.",
    technical: "Backup encryption uses the same AES-256-GCM standard as at-rest encryption. Backups are scheduled daily and retained for 30 days. Restoration is tested monthly. Recovery time objective (RTO): 4 hours.",
    status: "Active",
  },
  {
    emoji: "🔑",
    title: "Bcrypt Password Hashing",
    category: "Authentication",
    desc: "User passwords are never stored in plaintext or reversible format. All passwords are hashed using bcrypt with a cost factor of 12 — computationally expensive to crack even with dedicated hardware.",
    technical: "bcrypt with cost factor 12 (approximately 250ms per hash on modern hardware). Salt is generated automatically per password. Passwords are hashed before database storage and never logged.",
    status: "Active",
  },
  {
    emoji: "🚫",
    title: "Least-Privilege Integration Access",
    category: "Access Control",
    desc: "Each agent integration is scoped to only the permissions it needs. An invoice agent can read from your accounting system but cannot write to your CRM. You define every permission boundary.",
    technical: "Integration credentials are stored encrypted per-agent. Permission scopes are defined at integration creation time. Cross-agent credential sharing is not permitted. Credentials are never exposed in API responses.",
    status: "Active",
  },
];

const COMPLIANCE = [
  {
    standard: "GDPR",
    status: "Compliant",
    desc: "Data processing agreements available. Right to erasure supported. Data residency options available on Enterprise plan. No personal data sold or shared with third parties.",
  },
  {
    standard: "HIPAA",
    status: "Ready",
    desc: "Business Associate Agreements (BAA) available on Enterprise plan. PHI handling follows HIPAA technical safeguard requirements. Audit controls, access controls, and transmission security implemented.",
  },
  {
    standard: "SOC 2 Type II",
    status: "In Progress",
    desc: "SOC 2 audit in progress. Security, availability, and confidentiality trust service criteria are implemented. Audit report expected Q3 2026. Current controls are aligned with SOC 2 requirements.",
  },
  {
    standard: "ISO 27001",
    status: "Aligned",
    desc: "Information security management practices are aligned with ISO 27001 Annex A controls. Formal certification is planned for 2026.",
  },
  {
    standard: "PCI DSS",
    status: "Not Applicable",
    desc: "WorkforceAutomated does not store, process, or transmit cardholder data. Payment processing is handled exclusively by Stripe, which is PCI DSS Level 1 certified.",
  },
];

export default function SecurityOverview() {
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
          <Link to="/why-it-works" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Why It Works</Link>
          <Link to="/platform" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Platform</Link>
          <Link to="/industries" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Security</Link>
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
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Security</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Security is not a feature.<br />
          <span style={{ color: TEAL }}>It is the foundation.</span>
        </h1>
        <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 12px", maxWidth: 640 }}>
          Every account — including the free tier — gets the same encryption, audit logging, and access controls as Enterprise. Security is never an add-on.
        </p>
        <p style={{ fontSize: 14, color: "#374151", margin: "0 0 32px", maxWidth: 640, lineHeight: 1.65 }}>
          This page describes the actual technical implementation of security controls in WorkforceAutomated. Every claim on this page corresponds to code that is deployed and running in production.
        </p>
      </section>

      {/* Visual Demo — Security Made Simple */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: "#fef3c7", border: "1px solid #fde68a", borderRadius: 20, padding: "5px 13px", marginBottom: 22 }}>
            <span style={{ fontSize: 12, color: "#d97706", fontWeight: 600 }}>Security Made Simple</span>
          </div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            How does security actually work here?
          </h2>
          <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px", maxWidth: 620, lineHeight: 1.6 }}>
            Imagine your data is a secret diary. Here is exactly how we protect it — explained so simply that a 12-year-old could understand it.
          </p>

          {/* Step-by-step visual flow */}
          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              {
                step: "1",
                emoji: "✏️",
                title: "You type something into the app",
                simple: "Like writing in your diary.",
                what: "You add an agent, upload a file, or run a task.",
                color: "#3b82f6",
                bgColor: "#eff6ff",
                borderColor: "#bfdbfe",
              },
              {
                step: "2",
                emoji: "🔐",
                title: "We scramble it before saving it",
                simple: "Like writing in a secret code only you can read.",
                what: "Before your data is saved anywhere, we scramble it using AES-256 encryption — the same code used by banks and governments. Even if someone broke into our database, they would see random gibberish.",
                color: TEAL,
                bgColor: TEAL_LIGHT,
                borderColor: TEAL_BORDER,
              },
              {
                step: "3",
                emoji: "🚀",
                title: "It travels safely to our servers",
                simple: "Like sending a letter in a locked box that only we can open.",
                what: "When your data travels from your browser to our servers, it goes through a secure tunnel called TLS 1.3. Nobody can intercept it or read it on the way.",
                color: "#7c3aed",
                bgColor: "#f5f3ff",
                borderColor: "#ddd6fe",
              },
              {
                step: "4",
                emoji: "💾",
                title: "We save a backup copy every day",
                simple: "Like saving your homework on two USB drives, just in case.",
                what: "Every day, we make an encrypted copy of all your data and store it in a completely separate location. If anything ever goes wrong, we can restore everything. Your data is never lost.",
                color: "#059669",
                bgColor: "#ecfdf5",
                borderColor: "#a7f3d0",
              },
              {
                step: "5",
                emoji: "📋",
                title: "We write down every single action",
                simple: "Like a school attendance record that cannot be erased.",
                what: "Every time an agent does something — reads a file, sends an alert, approves a task — we write it down in a permanent log. Nobody can delete or change these records. This is how we prove what happened if anyone ever asks.",
                color: "#d97706",
                bgColor: "#fffbeb",
                borderColor: "#fde68a",
              },
              {
                step: "6",
                emoji: "🚪",
                title: "We check who you are at every door",
                simple: "Like a school that checks your ID every time you enter a new building.",
                what: "Every single request to our system has to prove it is really you. We use secure login tokens that expire automatically. Even inside our own systems, nothing is trusted without proof.",
                color: "#dc2626",
                bgColor: "#fef2f2",
                borderColor: "#fecaca",
              },
            ].map((s, i) => (
              <div key={s.step} style={{ display: "grid", gridTemplateColumns: "60px 1fr", gap: 0, position: "relative" }}>
                {/* Connector line */}
                {i < 5 && (
                  <div style={{ position: "absolute", left: 29, top: 60, width: 2, height: "calc(100% - 20px)", background: "#e5e7eb", zIndex: 0 }} />
                )}
                {/* Step circle */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: 20, zIndex: 1 }}>
                  <div style={{ width: 40, height: 40, background: s.color, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0, border: `3px solid #fff`, boxShadow: `0 0 0 2px ${s.color}` }}>{s.step}</div>
                </div>
                {/* Content */}
                <div style={{ padding: "20px 0 32px 16px" }}>
                  <div style={{ background: s.bgColor, border: `1px solid ${s.borderColor}`, borderRadius: 12, padding: "20px 24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 24 }}>{s.emoji}</span>
                      <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>{s.title}</h3>
                    </div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: s.color, margin: "0 0 8px" }}>{s.simple}</p>
                    <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: 0 }}>{s.what}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Summary box */}
          <div style={{ background: TEAL, borderRadius: 12, padding: "28px 32px", marginTop: 16 }}>
            <h3 style={{ fontSize: 18, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>The short version:</h3>
            <p style={{ fontSize: 15, color: "#ccfbf1", lineHeight: 1.7, margin: 0 }}>
              Your data is scrambled before it is saved. It travels in a locked tunnel. We back it up every day. We write down every action. And we check who you are every single time. Even if someone broke into our servers, they would not be able to read your data.
            </p>
          </div>
        </div>
      </section>

      {/* Security Layers */}
      <section style={{ padding: "0 48px 72px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 32px" }}>Security Layers</h2>
        <div>
          {SECURITY_LAYERS.map((layer) => (
            <div key={layer.title} style={{ padding: "28px 0", borderTop: DIVIDER }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 20 }}>
                <span style={{ fontSize: 20, paddingTop: 2 }}>{layer.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: 0 }}>{layer.title}</h3>
                    <span style={{ fontSize: 11, fontWeight: 600, color: "#059669", background: "#ecfdf5", border: "1px solid #a7f3d0", padding: "2px 8px", borderRadius: 20 }}>● {layer.status}</span>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEAL, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, padding: "2px 8px", borderRadius: 20 }}>{layer.category}</span>
                  </div>
                  <p style={{ fontSize: 14, color: GRAY_TEXT, margin: "0 0 10px", lineHeight: 1.65 }}>{layer.desc}</p>
                  <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.7, background: "#f8fafc", padding: "12px 16px", borderLeft: `3px solid ${TEAL}`, margin: 0, fontFamily: "monospace" }}>{layer.technical}</p>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* Compliance */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Compliance</h2>
          <p style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.2 }}>Regulatory standards</p>
          <p style={{ fontSize: 14, color: GRAY_TEXT, margin: "0 0 40px", lineHeight: 1.65 }}>
            Compliance statuses are accurately reported below. "In Progress" means the controls are implemented but formal third-party certification has not yet been completed. We do not claim certifications we do not hold.
          </p>
          <div style={{ borderTop: DIVIDER }}>
            {COMPLIANCE.map((c) => (
              <div key={c.standard} style={{ padding: "20px 0", borderBottom: DIVIDER, display: "grid", gridTemplateColumns: "120px 100px 1fr", gap: 24, alignItems: "start" }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: DARK }}>{c.standard}</span>
                <span style={{
                  fontSize: 12, fontWeight: 600, padding: "3px 10px", borderRadius: 20, display: "inline-block", width: "fit-content",
                  background: c.status === "Compliant" ? "#ecfdf5" : c.status === "Ready" ? "#eff6ff" : c.status === "In Progress" ? "#fffbeb" : "#f3f4f6",
                  color: c.status === "Compliant" ? "#059669" : c.status === "Ready" ? "#2563eb" : c.status === "In Progress" ? "#d97706" : GRAY_TEXT,
                  border: c.status === "Compliant" ? "1px solid #a7f3d0" : c.status === "Ready" ? "1px solid #bfdbfe" : c.status === "In Progress" ? "1px solid #fde68a" : "1px solid #e5e7eb",
                }}>{c.status}</span>
                <span style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.65 }}>{c.desc}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Responsible Disclosure */}
      <section style={{ padding: "72px 48px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Responsible Disclosure</h2>
        <p style={{ fontSize: 22, fontWeight: 700, color: DARK, margin: "0 0 12px" }}>Found a vulnerability?</p>
        <p style={{ fontSize: 15, color: GRAY_TEXT, lineHeight: 1.7, margin: "0 0 16px", maxWidth: 600 }}>
          We take security reports seriously. If you discover a potential security issue, please report it to our security team. We commit to acknowledging your report within 48 hours and resolving confirmed vulnerabilities within 30 days.
        </p>
        <p style={{ fontSize: 14, color: DARK, fontWeight: 600 }}>
          Report to: <a href="mailto:security@workforceautomated.com" style={{ color: TEAL, textDecoration: "none" }}>security@workforceautomated.com</a>
        </p>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Enterprise-grade security. Every plan.</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>Start a free trial — your data is protected from the first login.</p>
        <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>Start free trial</Link>
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
