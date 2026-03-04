import { useState } from "react";
import { Link } from "react-router-dom";

const DEMO_STEPS = [
  {
    label: "Step 1: Paste Your Process",
    content: "You paste in any work document — a job description, a checklist, a step-by-step process. It can be from any department: finance, HR, legal, customer support, IT.",
    example: `"Review all invoices over $10,000. Flag any that are more than 30 days overdue. Send a weekly summary to the finance manager. Escalate anything over $50,000 to the CFO immediately."`
  },
  {
    label: "Step 2: AI Builds the Agent",
    content: "WorkforceAutomated reads your document and automatically builds an AI agent. It figures out what the agent should do, what data it can access, and when it needs to ask a human for help.",
    example: `Agent created: "Invoice Review Agent"\n✓ Can read: invoice database\n✓ Can write: weekly summary reports\n✓ Will escalate: anything over $50,000\n✓ Confidence required: 85% before acting`
  },
  {
    label: "Step 3: Set Your Rules",
    content: "You decide how much the agent can do on its own. Set a confidence score — if the agent isn't sure enough, it stops and asks a human. You stay in control at all times.",
    example: `Confidence threshold: 85%\nIf below 85% → pause and ask human\nIf above 85% → proceed automatically\nAll actions logged forever`
  },
  {
    label: "Step 4: It Works. You Watch.",
    content: "The agent runs your process automatically. Every action is recorded. You get a live dashboard showing what it did, how confident it was, and anything it flagged for your attention.",
    example: `Today's activity:\n✓ 47 invoices reviewed\n✓ 3 flagged as overdue\n⚡ 1 escalated to CFO ($78,000)\n📊 Weekly report sent to finance manager`
  }
];

const FEATURES = [
  { icon: "⚡", title: "Works Without Hiring Anyone", desc: "Your AI agent handles repetitive tasks 24/7. No sick days, no overtime, no training time." },
  { icon: "💰", title: "Turns Slow Work Into Fast Revenue", desc: "Processes that used to take days now finish in minutes. Faster work means faster revenue." },
  { icon: "🛡️", title: "Humans Stay in Charge", desc: "The agent only acts when it's confident. Anything uncertain gets sent to a real person first." },
  { icon: "📋", title: "Works for Any Department", desc: "Finance, HR, legal, sales, customer support, IT — if there's a process, we can automate it." },
  { icon: "🔍", title: "Every Action is Recorded", desc: "A permanent, tamper-proof log of everything the agent did. Perfect for audits and compliance." },
  { icon: "🚀", title: "Ready in Minutes, Not Months", desc: "Paste your process document. Agent is configured and ready to run in under 5 minutes." }
];

const USE_CASES = [
  { dept: "Finance", task: "Review invoices, flag overdue payments, generate variance reports" },
  { dept: "HR", task: "Screen job applications, track onboarding tasks, monitor policy compliance" },
  { dept: "Legal", task: "Review contracts for missing clauses, track regulatory deadlines" },
  { dept: "Customer Support", task: "Classify tickets, draft responses, escalate urgent issues" },
  { dept: "Sales", task: "Score leads, flag at-risk deals, update CRM records" },
  { dept: "IT & Security", task: "Monitor systems, detect anomalies, generate incident reports" }
];

const TESTIMONIALS = [
  {
    quote: "We used to spend 3 days every month reviewing invoices manually. Now it takes 20 minutes. The agent catches things we used to miss.",
    name: "Sarah K.",
    title: "Finance Director",
    result: "3 days → 20 minutes"
  },
  {
    quote: "I was skeptical about AI replacing our compliance process. But the agent escalates anything it's not sure about, so we never lost control.",
    name: "Marcus T.",
    title: "Chief Compliance Officer",
    result: "Zero compliance violations in 8 months"
  },
  {
    quote: "We scaled from 200 to 800 customers without hiring a single extra support person. The agent handles the routine stuff, our team handles the hard stuff.",
    name: "Priya M.",
    title: "VP of Customer Success",
    result: "4x customers, same team size"
  }
];

export default function Landing() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#0a0a0f", color: "#e8e8f0", minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #1e1e2e", position: "sticky", top: 0, background: "#0a0a0f", zIndex: 100 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 32, height: 32, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
          <span style={{ fontWeight: 700, fontSize: 18, color: "#fff" }}>WorkforceAutomated</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link to="/login" style={{ padding: "8px 20px", background: "transparent", border: "1px solid #3f3f5a", borderRadius: 8, color: "#c0c0d8", cursor: "pointer", fontSize: 14, textDecoration: "none", display: "inline-block" }}>
            Sign In
          </Link>
          <Link to="/register" style={{ padding: "8px 20px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 8, color: "#fff", cursor: "pointer", fontSize: 14, fontWeight: 600, textDecoration: "none", display: "inline-block" }}>
            Start Free
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "80px 40px 60px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-block", background: "#1a1a2e", border: "1px solid #6366f1", borderRadius: 20, padding: "6px 16px", fontSize: 13, color: "#a5b4fc", marginBottom: 24 }}>
          AI Workforce Platform
        </div>
        <h1 style={{ fontSize: "clamp(36px, 6vw, 60px)", fontWeight: 800, lineHeight: 1.15, margin: "0 0 24px", color: "#fff" }}>
          Turn Any Work Process<br />
          <span style={{ background: "linear-gradient(135deg, #6366f1, #a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            Into an AI That Does It
          </span>
        </h1>
        <p style={{ fontSize: 20, color: "#9090b0", lineHeight: 1.7, marginBottom: 16 }}>
          You describe the job. We build the AI agent that does it — automatically, accurately, and with a human always in control.
        </p>
        <p style={{ fontSize: 16, color: "#6060a0", marginBottom: 40 }}>
          Works for finance, HR, legal, sales, customer support, IT, and more. No coding required.
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
          <Link to="/register" style={{ padding: "14px 32px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 16, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
            Start Free — No Credit Card
          </Link>
          <a href="#how-it-works" style={{ padding: "14px 32px", background: "transparent", border: "1px solid #3f3f5a", borderRadius: 10, color: "#c0c0d8", cursor: "pointer", fontSize: 16, textDecoration: "none", display: "inline-block" }}>
            See How It Works
          </a>
        </div>
        <div style={{ display: "flex", gap: 32, justifyContent: "center", marginTop: 48, flexWrap: "wrap" }}>
          {[["3 days → 20 min", "Invoice processing"], ["4x scale", "Without new hires"], ["100%", "Audit coverage"], ["< 5 min", "Agent setup time"]].map(([stat, label]) => (
            <div key={label} style={{ textAlign: "center" }}>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#a78bfa" }}>{stat}</div>
              <div style={{ fontSize: 13, color: "#6060a0" }}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* What Is It */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px", textAlign: "center" }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 20 }}>What Does It Actually Do?</h2>
          <p style={{ fontSize: 18, color: "#9090b0", lineHeight: 1.8 }}>
            Think of it like hiring a very fast, very reliable worker who never sleeps. You give them a list of tasks. They do those tasks, keep a record of everything they did, and come to you whenever they're not sure what to do next.
          </p>
          <p style={{ fontSize: 18, color: "#9090b0", lineHeight: 1.8, marginTop: 16 }}>
            The difference: this worker is an AI, costs a fraction of a full-time hire, and can handle hundreds of tasks at once.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>How It Works</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Four simple steps. No technical knowledge needed.</p>
        <div style={{ display: "flex", gap: 12, marginBottom: 32, flexWrap: "wrap", justifyContent: "center" }}>
          {DEMO_STEPS.map((step, i) => (
            <button key={i} onClick={() => setActiveStep(i)} style={{ padding: "10px 20px", background: activeStep === i ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "#1a1a2e", border: activeStep === i ? "none" : "1px solid #2a2a3e", borderRadius: 8, color: activeStep === i ? "#fff" : "#8080a0", cursor: "pointer", fontSize: 14, fontWeight: activeStep === i ? 600 : 400 }}>
              {step.label}
            </button>
          ))}
        </div>
        <div style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 12, padding: 32 }}>
          <p style={{ fontSize: 18, color: "#c0c0d8", lineHeight: 1.8, marginBottom: 24 }}>{DEMO_STEPS[activeStep].content}</p>
          <div style={{ background: "#0a0a0f", border: "1px solid #3f3f5a", borderRadius: 8, padding: 20 }}>
            <div style={{ fontSize: 12, color: "#6060a0", marginBottom: 8, fontFamily: "monospace" }}>EXAMPLE</div>
            <pre style={{ fontFamily: "monospace", fontSize: 14, color: "#a5b4fc", whiteSpace: "pre-wrap", margin: 0 }}>{DEMO_STEPS[activeStep].example}</pre>
          </div>
        </div>
      </section>

      {/* Why Use It */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Why Companies Use It</h2>
          <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Real business results, not just technology for its own sake.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
            {FEATURES.map((f) => (
              <div key={f.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24 }}>
                <div style={{ fontSize: 28, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontSize: 17, fontWeight: 700, color: "#fff", marginBottom: 8 }}>{f.title}</h3>
                <p style={{ fontSize: 14, color: "#7070a0", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Works in Every Department</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>If there's a repeatable process, we can automate it.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
          {USE_CASES.map((uc) => (
            <div key={uc.dept} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20, display: "flex", gap: 16, alignItems: "flex-start" }}>
              <div style={{ background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 8, padding: "6px 10px", fontSize: 13, fontWeight: 700, color: "#fff", whiteSpace: "nowrap" }}>{uc.dept}</div>
              <p style={{ fontSize: 14, color: "#8080a0", margin: 0, lineHeight: 1.6 }}>{uc.task}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Guardrails */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>You're Always in Control</h2>
          <p style={{ color: "#6060a0", marginBottom: 40, fontSize: 16 }}>The AI never acts alone on anything important. Here's how we keep humans in charge.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
            {[
              { icon: "🎯", title: "Confidence Score", desc: "Every action gets a confidence score. If the AI isn't sure enough, it stops and asks you." },
              { icon: "⚠️", title: "Auto-Escalation", desc: "High-risk or low-confidence tasks are automatically sent to the right human for review." },
              { icon: "📝", title: "Permanent Audit Log", desc: "Every single action is recorded forever. You can see exactly what the AI did and when." },
              { icon: "🔒", title: "Permission Boundaries", desc: "You define exactly what the agent can and cannot do. It cannot go outside those limits." }
            ].map((g) => (
              <div key={g.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 24, marginBottom: 10 }}>{g.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{g.title}</h3>
                <p style={{ fontSize: 13, color: "#6060a0", margin: 0, lineHeight: 1.6 }}>{g.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section style={{ padding: "60px 40px", maxWidth: 1000, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>What Customers Say</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Real results from real companies.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {TESTIMONIALS.map((t) => (
            <div key={t.name} style={{ background: "#0f0f1a", border: "1px solid #1e1e2e", borderRadius: 12, padding: 24 }}>
              <div style={{ background: "#1a1a2e", border: "1px solid #6366f1", borderRadius: 6, padding: "4px 12px", fontSize: 13, color: "#a5b4fc", display: "inline-block", marginBottom: 16, fontWeight: 700 }}>{t.result}</div>
              <p style={{ fontSize: 15, color: "#c0c0d8", lineHeight: 1.7, marginBottom: 20 }}>"{t.quote}"</p>
              <div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>{t.name}</div>
                <div style={{ fontSize: 13, color: "#6060a0" }}>{t.title}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Data Protection */}
      <section style={{ background: "#0f0f1a", padding: "60px 40px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8 }}>Your Data is Safe</h2>
          <p style={{ color: "#6060a0", marginBottom: 40, fontSize: 16 }}>We take security seriously. Here's exactly what we do to protect your data.</p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, textAlign: "left" }}>
            {[
              { icon: "🔐", title: "Encrypted Everywhere", desc: "All data is encrypted when stored and when moving between systems." },
              { icon: "🏢", title: "Your Data Stays Yours", desc: "We never sell or share your data with third parties. Ever." },
              { icon: "✅", title: "SOC 2 Compliant", desc: "We meet the security standards required by enterprise companies." },
              { icon: "🌍", title: "GDPR & HIPAA Ready", desc: "Built to meet the strictest global privacy and healthcare regulations." },
              { icon: "🚫", title: "Zero Trust Access", desc: "Every access request is verified. No one gets in without permission." },
              { icon: "📍", title: "Data Residency Options", desc: "Choose where your data is stored to meet local regulations." }
            ].map((s) => (
              <div key={s.title} style={{ background: "#0a0a0f", border: "1px solid #1e1e2e", borderRadius: 10, padding: 20 }}>
                <div style={{ fontSize: 22, marginBottom: 8 }}>{s.icon}</div>
                <h3 style={{ fontSize: 14, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{s.title}</h3>
                <p style={{ fontSize: 13, color: "#6060a0", margin: 0, lineHeight: 1.6 }}>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section style={{ padding: "60px 40px", maxWidth: 900, margin: "0 auto" }}>
        <h2 style={{ fontSize: 32, fontWeight: 700, color: "#fff", marginBottom: 8, textAlign: "center" }}>Simple Pricing</h2>
        <p style={{ color: "#6060a0", textAlign: "center", marginBottom: 40 }}>Start free. Upgrade when you're ready.</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
          {[
            { name: "Starter", price: "$49/mo", features: ["Up to 5 AI agents", "Basic audit logs", "Email support", "1 department"], highlight: false },
            { name: "Professional", price: "$149/mo", features: ["Up to 25 AI agents", "Full audit logs", "Priority support", "All departments", "Advanced governance"], highlight: true },
            { name: "Enterprise", price: "$499/mo", features: ["Unlimited agents", "Custom integrations", "Dedicated support", "SLA guarantee", "Custom data residency"], highlight: false }
          ].map((plan) => (
            <div key={plan.name} style={{ background: plan.highlight ? "linear-gradient(135deg, #1a1a3e, #2a1a4e)" : "#0f0f1a", border: plan.highlight ? "2px solid #6366f1" : "1px solid #1e1e2e", borderRadius: 12, padding: 28, position: "relative" }}>
              {plan.highlight && (
                <div style={{ position: "absolute", top: -12, left: "50%", transform: "translateX(-50%)", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 12, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: "#fff" }}>Most Popular</div>
              )}
              <h3 style={{ fontSize: 20, fontWeight: 700, color: "#fff", marginBottom: 4 }}>{plan.name}</h3>
              <div style={{ fontSize: 28, fontWeight: 800, color: plan.highlight ? "#a78bfa" : "#fff", marginBottom: 20 }}>{plan.price}</div>
              <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px" }}>
                {plan.features.map((f) => (
                  <li key={f} style={{ fontSize: 14, color: "#9090b0", padding: "6px 0", borderBottom: "1px solid #1e1e2e" }}>✓ {f}</li>
                ))}
              </ul>
              <Link to="/register" style={{ display: "block", width: "100%", padding: "12px", borderRadius: 8, cursor: "pointer", fontSize: 15, fontWeight: 600, background: plan.highlight ? "linear-gradient(135deg, #6366f1, #8b5cf6)" : "transparent", border: plan.highlight ? "none" : "1px solid #3f3f5a", color: "#fff", textDecoration: "none", textAlign: "center", boxSizing: "border-box" }}>
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "linear-gradient(135deg, #1a1a3e, #0f0f2e)", padding: "60px 40px", textAlign: "center" }}>
        <h2 style={{ fontSize: 36, fontWeight: 800, color: "#fff", marginBottom: 16 }}>Ready to Stop Doing It Manually?</h2>
        <p style={{ fontSize: 18, color: "#9090b0", marginBottom: 32, maxWidth: 500, margin: "0 auto 32px" }}>
          Set up your first AI agent in under 5 minutes. No credit card required.
        </p>
        <Link to="/register" style={{ padding: "16px 40px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: 10, color: "#fff", cursor: "pointer", fontSize: 18, fontWeight: 700, textDecoration: "none", display: "inline-block" }}>
          Start Free Today
        </Link>
      </section>

      {/* Footer */}
      <footer style={{ background: "#050508", padding: "32px 40px", textAlign: "center", borderTop: "1px solid #1e1e2e" }}>
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 10, marginBottom: 16 }}>
          <div style={{ width: 28, height: 28, background: "linear-gradient(135deg, #6366f1, #8b5cf6)", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>🤖</div>
          <span style={{ fontWeight: 700, color: "#fff" }}>WorkforceAutomated</span>
        </div>
        <p style={{ color: "#404060", fontSize: 13, margin: 0 }}>© 2026 WorkforceAutomated. All rights reserved.</p>
      </footer>

    </div>
  );
}
