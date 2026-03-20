import { Link } from "react-router-dom";

const VIDEO_CHAPTERS = [
  { time: "0:00", title: "Introduction & Platform Overview", desc: "What WorkforceAutomated is and how it works" },
  { time: "1:30", title: "Creating Your First AI Agent", desc: "Paste a job description and watch it become an agent in under 2 minutes" },
  { time: "3:45", title: "Live Agent Execution", desc: "Watch the Invoice Reviewer agent process a real invoice" },
  { time: "5:20", title: "Review Queue & Escalation", desc: "How humans stay in control — approving and rejecting agent actions" },
  { time: "7:10", title: "KPI Builder & Analytics", desc: "Building custom KPIs and viewing the executive dashboard" },
  { time: "9:00", title: "Security & Audit Log", desc: "Zero-knowledge encryption, DRASS backups, and the immutable audit trail" },
  { time: "11:15", title: "Custom Build Configurator", desc: "Using the plan builder to configure your organization's setup" },
  { time: "13:00", title: "Pricing & Getting Started", desc: "Choosing the right plan and launching your first automation" },
];

const HIGHLIGHTS = [
  { emoji: "⚡", stat: "< 2 min", label: "Agent setup time" },
  { emoji: "📊", stat: "100%", label: "Audit coverage" },
  { emoji: "🔐", stat: "AES-256", label: "Encryption standard" },
  { emoji: "🚀", stat: "22", label: "Industry configurations" },
];

export default function VideoDemo() {
  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Product Demonstration</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            A full walkthrough of WorkforceAutomated — from setup to live agent execution.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 1000, margin: "0 auto", padding: "32px 40px" }}>
        {/* Video Player */}
        <div style={{ background: "#111827", borderRadius: 16, overflow: "hidden", marginBottom: 24, position: "relative" }}>
          <div style={{ position: "relative", paddingBottom: "56.25%", height: 0 }}>
            <div
              style={{
                position: "absolute", top: 0, left: 0, width: "100%", height: "100%",
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
              }}
            >
              <div style={{ width: 80, height: 80, background: "#0d9488", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 20 }}>
                <div style={{ width: 0, height: 0, borderTop: "18px solid transparent", borderBottom: "18px solid transparent", borderLeft: "30px solid #fff", marginLeft: 6 }}></div>
              </div>
              <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 8px", textAlign: "center" }}>
                Product Demo — Coming Soon
              </h2>
              <p style={{ fontSize: 14, color: "#94a3b8", margin: "0 0 20px", textAlign: "center", maxWidth: 440 }}>
                A full walkthrough video is being recorded. In the meantime, try the live interactive demo below — it uses real AI agents, not a recording.
              </p>
              <a href="/demo" style={{ background: "#0d9488", color: "#fff", fontSize: 14, fontWeight: 700, padding: "10px 24px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>
                Try live demo instead →
              </a>
            </div>
          </div>
        </div>

        {/* Stats Row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12, marginBottom: 28 }}>
          {HIGHLIGHTS.map((h) => (
            <div key={h.label} style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 10, padding: "16px", textAlign: "center" }}>
              <div style={{ fontSize: 22, marginBottom: 4 }}>{h.emoji}</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "#0d9488" }}>{h.stat}</div>
              <div style={{ fontSize: 12, color: "#9ca3af" }}>{h.label}</div>
            </div>
          ))}
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 20 }}>
          {/* Chapters */}
          <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, color: "#111827", margin: "0 0 16px" }}>Video Chapters</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {VIDEO_CHAPTERS.map((ch, i) => (
                <div
                  key={ch.time}
                  style={{
                    display: "flex", gap: 14, padding: "12px 14px", borderRadius: 8, cursor: "pointer",
                    background: i === 0 ? "#f0fdfa" : "transparent",
                    border: `1px solid ${i === 0 ? "#99f6e4" : "transparent"}`,
                  }}
                >
                  <span style={{ fontSize: 12, fontWeight: 700, color: "#0d9488", minWidth: 36, flexShrink: 0, paddingTop: 2 }}>{ch.time}</span>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>{ch.title}</div>
                    <div style={{ fontSize: 12, color: "#9ca3af", marginTop: 2 }}>{ch.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* CTA */}
            <div style={{ background: "#0d9488", borderRadius: 14, padding: 24, textAlign: "center" }}>
              <h3 style={{ fontSize: 17, fontWeight: 800, color: "#fff", margin: "0 0 8px" }}>Ready to get started?</h3>
              <p style={{ fontSize: 13, color: "#ccfbf1", margin: "0 0 16px" }}>
                Your first AI agent can be live in under 5 minutes. No coding required.
              </p>
              <Link to="/register" style={{ display: "block", background: "#fff", color: "#0d9488", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 8, textDecoration: "none", textAlign: "center" }}>
                Start Free Trial
              </Link>
              <Link to="/demo" style={{ display: "block", color: "#ccfbf1", fontWeight: 600, fontSize: 13, padding: "10px 0 0", textDecoration: "none", textAlign: "center" }}>
                Try the live demo →
              </Link>
            </div>

            {/* Custom Build */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Not sure which plan?</h3>
              <p style={{ fontSize: 13, color: "#6b7280", margin: "0 0 14px", lineHeight: 1.6 }}>
                Use our Custom Build Configurator to get a personalized recommendation based on your organization's needs.
              </p>
              <Link to="/build" style={{ display: "block", background: "#f0fdfa", color: "#0d9488", fontWeight: 700, fontSize: 13, padding: "10px 0", borderRadius: 8, textDecoration: "none", textAlign: "center", border: "1px solid #99f6e4" }}>
                Build My Custom Plan →
              </Link>
            </div>

            {/* What you'll see */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 24 }}>
              <h3 style={{ fontSize: 14, fontWeight: 700, color: "#111827", margin: "0 0 12px" }}>What you'll see in this demo</h3>
              {["Real agent executing a Finance task", "Human review queue in action", "Live confidence scoring", "Encrypted audit log", "KPI dashboard walkthrough", "Custom plan configurator"].map((item) => (
                <div key={item} style={{ display: "flex", gap: 8, padding: "5px 0", fontSize: 13, color: "#6b7280" }}>
                  <span style={{ color: "#0d9488", flexShrink: 0 }}>✓</span> {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
