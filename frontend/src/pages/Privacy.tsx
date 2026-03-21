import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

export default function Privacy() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: DARK, minHeight: "100vh" }}>
      <nav style={{ background: "#fff", borderBottom: DIVIDER, padding: "0 48px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 60 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 30, height: 30, background: TEAL, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ color: "#fff", fontSize: 15, fontWeight: 700 }}>W</span>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: DARK }}>WorkforceAutomated</span>
        </Link>
        <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, textDecoration: "none" }}>Sign in</Link>
      </nav>

      <div style={{ maxWidth: 720, margin: "0 auto", padding: "64px 48px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, color: DARK, margin: "0 0 8px" }}>Privacy Policy</h1>
        <p style={{ fontSize: 14, color: GRAY_TEXT, margin: "0 0 48px" }}>Last updated: March 19, 2026</p>

        <div style={{ borderTop: DIVIDER }}>
          {[
            {
              title: "1. What We Collect",
              body: "We collect information you provide directly: your name, email address, and password when you register. We collect usage data: which agents you create, when they execute, and their outputs. We collect technical data: IP addresses, browser type, and session tokens for security and debugging purposes. We do not collect payment card information — all payments are processed by Stripe.",
            },
            {
              title: "2. How We Use Your Data",
              body: "We use your data to provide and improve the WorkforceAutomated platform, to authenticate your identity, to process your subscription, and to send you service-related communications. We do not sell your personal data to third parties. We do not use your data to train AI models without explicit consent.",
            },
            {
              title: "3. Data Storage and Security",
              body: "All data is encrypted at rest using AES-256-GCM. All data is encrypted in transit using TLS 1.3. Passwords are hashed using bcrypt with a cost factor of 12 and are never stored in plaintext. Audit logs are append-only and cannot be modified or deleted.",
            },
            {
              title: "4. Data Retention",
              body: "Account data is retained for the duration of your subscription plus 90 days after cancellation. Audit logs are retained for 12 months. You may request deletion of your account and associated data at any time by contacting support@workforceautomated.com.",
            },
            {
              title: "5. Third-Party Services",
              body: "We use Stripe for payment processing (PCI DSS Level 1 certified). We use OpenAI for AI model inference — your inputs are processed according to OpenAI's data processing agreement. We use Railway for infrastructure hosting. We use Cloudflare for CDN and DDoS protection.",
            },
            {
              title: "6. Your Rights (GDPR)",
              body: "If you are in the European Economic Area, you have the right to access, correct, or delete your personal data. You have the right to data portability. You have the right to object to processing. To exercise these rights, contact privacy@workforceautomated.com.",
            },
            {
              title: "7. Cookies",
              body: "We use session cookies for authentication only. We do not use tracking cookies or advertising cookies. You can disable cookies in your browser settings, but this will prevent you from logging in.",
            },
            {
              title: "8. Contact",
              body: "For privacy-related questions or requests, contact: privacy@workforceautomated.com",
            },
          ].map((section) => (
            <div key={section.title} style={{ padding: "28px 0", borderBottom: DIVIDER }}>
              <h2 style={{ fontSize: 16, fontWeight: 700, color: DARK, margin: "0 0 10px" }}>{section.title}</h2>
              <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.75, margin: 0 }}>{section.body}</p>
            </div>
          ))}
        </div>
      </div>

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
