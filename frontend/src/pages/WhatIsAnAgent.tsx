import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const STEPS = [
  {
    num: "1",
    emoji: "📝",
    title: "You describe the job",
    simple: "Like giving instructions to a new employee.",
    detail:
      "You paste a job description or a process document — for example, \"Review all incoming invoices and flag any over $10,000 for manager approval.\" The platform reads it and builds the agent automatically. No coding required.",
    example: "\"Review all incoming invoices and flag any over $10,000 for manager approval.\"",
  },
  {
    num: "2",
    emoji: "🔌",
    title: "The agent connects to your tools",
    simple: "Like giving a new hire their login credentials — but only to what they need.",
    detail:
      "You tell the agent which systems it is allowed to use — your accounting software, your database, your email. It can only touch what you say it can. If you say it cannot send payments, it cannot send payments. Period.",
    example: "\"You can read from our invoice system, but you cannot send payments.\"",
  },
  {
    num: "3",
    emoji: "⚡",
    title: "It does the work automatically",
    simple: "Like an employee who works 24/7 and never takes a break.",
    detail:
      "Once set up, the agent runs on its own. It checks for new invoices, reviews them, and either approves or flags them — without you having to click a single button. It works while you sleep.",
    example: "Invoice for $8,500 → auto-approved. Invoice for $14,000 → sent to manager.",
  },
  {
    num: "4",
    emoji: "🙋",
    title: "It asks a human when it is not sure",
    simple: "Like a good employee who checks before making a big decision.",
    detail:
      "Every action gets a confidence score. If the agent is not confident enough about something, it stops and sends it to a real person for review. You stay in control of every important decision.",
    example: "\"I found an invoice with missing details. I am sending it to you to review.\"",
  },
  {
    num: "5",
    emoji: "📋",
    title: "Everything is written down",
    simple: "Like a permanent record book that cannot be erased.",
    detail:
      "Every single action the agent takes is saved in a permanent log. You can see exactly what it did, when it did it, and why. This is great for audits, compliance, and just making sure everything is running correctly.",
    example: "\"Reviewed 47 invoices today. Approved 44. Flagged 3 for manager review.\"",
  },
];

const ANALOGIES = [
  {
    emoji: "🏦",
    title: "Think of it like a bank teller",
    desc: "A bank teller follows strict rules: they can process deposits, but they cannot approve a $1 million loan on their own. They escalate big decisions. WorkforceAutomated agents work the same way — they handle routine tasks automatically, but escalate anything above their confidence threshold.",
  },
  {
    emoji: "✈️",
    title: "Think of it like autopilot on a plane",
    desc: "Autopilot handles the routine flying — keeping altitude, staying on course. But when something unusual happens, it alerts the pilot. Our agents handle routine business tasks automatically, and alert a human when something needs attention.",
  },
  {
    emoji: "🏥",
    title: "Think of it like a medical triage nurse",
    desc: "A triage nurse sorts patients by urgency — routine cases get handled quickly, serious cases go straight to the doctor. Our agents sort your business tasks the same way: routine items get processed automatically, complex items go to the right person.",
  },
];

const NOT_CHATBOT = [
  { label: "Chatbot", items: ["Answers questions", "Waits for you to ask it something", "Cannot take actions in your systems", "Has no memory between conversations", "Cannot file a report or send an email"] },
  { label: "WorkforceAutomated Agent", items: ["Does the actual work", "Runs automatically on a schedule", "Connects to your real systems and takes actions", "Remembers everything it has ever done", "Files reports, sends alerts, updates records"] },
];

export default function WhatIsAnAgent() {
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
          <Link to="/what-is-an-agent" style={{ color: TEAL, fontSize: 14, fontWeight: 700, textDecoration: "none" }}>What is an Agent?</Link>
          <Link to="/why-it-works" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Why It Works</Link>
          <Link to="/platform" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Platform</Link>
          <Link to="/industries" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <Link to="/enterprise" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Enterprise</Link>
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
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Explained Simply</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          What is an AI Agent?
        </h1>
        <p style={{ fontSize: 20, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 12px", maxWidth: 680 }}>
          An AI agent is like hiring a really smart employee who works 24 hours a day, never forgets anything, and costs a fraction of a full-time salary.
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 32px", maxWidth: 680 }}>
          You tell it what job to do. It does that job automatically. When it is not sure about something, it asks a real person. And it writes down everything it does so you always know what happened.
        </p>
        <div style={{ display: "flex", gap: 10 }}>
          <Link to="/demo" style={{ background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>
            See it in action
          </Link>
          <Link to="/register" style={{ color: TEAL, fontWeight: 600, fontSize: 15, padding: "12px 20px", borderRadius: 8, textDecoration: "none", border: `1px solid ${TEAL_BORDER}` }}>
            Start free trial
          </Link>
        </div>
      </section>

      {/* Chatbot vs Agent */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Chatbot vs. Agent</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            This is not a chatbot. Here is the difference.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            {NOT_CHATBOT.map((col, i) => (
              <div key={col.label} style={{ border: i === 1 ? `2px solid ${TEAL}` : DIVIDER, borderRadius: 12, padding: 28, background: i === 1 ? TEAL_LIGHT : "#fff" }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: i === 1 ? TEAL : GRAY_TEXT, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>{col.label}</div>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {col.items.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: i === 1 ? TEAL : "#ef4444", fontWeight: 700, flexShrink: 0, fontSize: 14 }}>{i === 1 ? "✓" : "✗"}</span>
                      <span style={{ fontSize: 14, color: DARK, lineHeight: 1.5 }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works step by step */}
      <section style={{ padding: "72px 48px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>How It Works</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          5 simple steps — from setup to running
        </p>
        <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 48px", maxWidth: 580, lineHeight: 1.6 }}>
          Setting up your first agent takes less than 5 minutes. Here is exactly what happens.
        </p>
        <div>
          {STEPS.map((s) => (
            <div key={s.num} style={{ display: "grid", gridTemplateColumns: "48px 1fr", gap: 24, padding: "28px 0", borderTop: DIVIDER }}>
              <div style={{ width: 40, height: 40, background: TEAL, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, fontWeight: 800, color: "#fff", flexShrink: 0 }}>{s.num}</div>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                  <span style={{ fontSize: 22 }}>{s.emoji}</span>
                  <h3 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{s.title}</h3>
                </div>
                <p style={{ fontSize: 13, color: TEAL, fontWeight: 600, margin: "0 0 8px" }}>{s.simple}</p>
                <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: "0 0 12px" }}>{s.detail}</p>
                <div style={{ background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 8, padding: "10px 14px" }}>
                  <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>Example: </span>
                  <span style={{ fontSize: 12, color: "#374151" }}>{s.example}</span>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* Real-world analogies */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "72px 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Real-World Comparisons</h2>
          <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
            Still not sure? Think of it this way.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 24 }}>
            {ANALOGIES.map((a) => (
              <div key={a.title} style={{ border: DIVIDER, borderRadius: 12, padding: 28, background: "#fff" }}>
                <div style={{ fontSize: 36, marginBottom: 14 }}>{a.emoji}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: DARK, margin: "0 0 10px" }}>{a.title}</h3>
                <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: 0 }}>{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Employee comparison */}
      <section style={{ padding: "72px 48px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>The Simple Version</h2>
        <p style={{ fontSize: 30, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.2, letterSpacing: "-0.01em" }}>
          It is like hiring a really good employee — but better.
        </p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>An AI agent:</div>
            {[
              "Never forgets to do its job",
              "Works 24 hours a day, 7 days a week",
              "Writes down everything it does",
              "Asks for help when it is not sure",
              "Only touches what you give it permission to touch",
              "Gets set up in under 5 minutes",
              "Costs a fraction of a full-time hire",
            ].map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: TEAL, fontWeight: 700, flexShrink: 0 }}>✓</span>
                <span style={{ fontSize: 14, color: DARK, lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 700, color: "#ef4444", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 16 }}>Unlike a human employee:</div>
            {[
              "No salary, no benefits, no sick days",
              "Can handle hundreds of tasks at the same time",
              "Never makes a typo or forgets a step",
              "Does not need to be trained for weeks",
              "Does not need a desk, a computer, or office space",
              "Available instantly — no hiring process",
              "Scales up or down in seconds",
            ].map((point) => (
              <div key={point} style={{ display: "flex", gap: 10, alignItems: "flex-start", padding: "7px 0", borderBottom: "1px solid #f3f4f6" }}>
                <span style={{ color: "#ef4444", fontWeight: 700, flexShrink: 0 }}>✗</span>
                <span style={{ fontSize: 14, color: DARK, lineHeight: 1.5 }}>{point}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Ready to build your first agent?</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>It takes less than 5 minutes. No coding required. No credit card needed to start.</p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none" }}>Start free trial</Link>
          <Link to="/demo" style={{ background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", border: "2px solid rgba(255,255,255,0.5)" }}>See a live demo first</Link>
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
