import { useState } from "react";
import { Link } from "react-router-dom";

const STEPS = [
  {
    number: "01",
    label: "Describe the Work",
    body: "Paste any process document — a job description, a checklist, a standard operating procedure. Finance, HR, legal, sales, IT. Any department, any language.",
    example: `"Review all invoices over $10,000. Flag any that are more than 30 days overdue. Send a weekly summary to the finance manager. Escalate anything over $50,000 to the CFO immediately."`
  },
  {
    number: "02",
    label: "The Agent is Built",
    body: "WorkforceAutomated reads your document and configures an AI agent — its role, its rules, what data it can access, and when it must defer to a human.",
    example: `Agent: Invoice Review Agent\n— Reads: invoice database\n— Writes: weekly summary reports\n— Escalates: amounts over $50,000\n— Confidence required: 85%`
  },
  {
    number: "03",
    label: "Set Your Governance Rules",
    body: "You set the confidence threshold. Below it, the agent pauses and asks a human. Above it, it acts. Every decision is logged permanently.",
    example: `Threshold: 85%\nBelow → pause, request human review\nAbove → execute automatically\nAll actions: immutable audit log`
  },
  {
    number: "04",
    label: "It Works. You Oversee.",
    body: "The agent runs your process around the clock. You get a live dashboard, a full audit trail, and escalation alerts when anything needs your attention.",
    example: `Today:\n47 invoices reviewed\n3 flagged overdue\n1 escalated to CFO ($78,000)\nWeekly report sent`
  }
];

const METRICS = [
  { value: "3 days → 20 min", label: "Invoice processing" },
  { value: "4×", label: "Scale without new hires" },
  { value: "100%", label: "Audit coverage" },
  { value: "< 5 min", label: "Agent setup" },
];

const USE_CASES = [
  { dept: "Finance", task: "Review invoices, flag overdue payments, generate variance reports" },
  { dept: "Human Resources", task: "Screen applications, track onboarding tasks, monitor policy compliance" },
  { dept: "Legal", task: "Review contracts for missing clauses, track regulatory deadlines" },
  { dept: "Customer Support", task: "Classify tickets, draft responses, escalate urgent issues" },
  { dept: "Sales", task: "Score leads, flag at-risk deals, update CRM records" },
  { dept: "IT & Security", task: "Monitor systems, detect anomalies, generate incident reports" },
];

const TESTIMONIALS = [
  {
    quote: "We used to spend three days every month reviewing invoices manually. Now it takes twenty minutes. The agent catches things we used to miss.",
    name: "Sarah K.",
    title: "Finance Director",
    result: "3 days → 20 minutes"
  },
  {
    quote: "I was skeptical about AI replacing our compliance process. But the agent escalates anything it is not sure about, so we never lost control.",
    name: "Marcus T.",
    title: "Chief Compliance Officer",
    result: "Zero compliance violations in 8 months"
  },
  {
    quote: "We scaled from 200 to 800 customers without hiring a single extra support person. The agent handles the routine work. Our team handles the hard work.",
    name: "Priya M.",
    title: "VP of Customer Success",
    result: "4× customers, same team size"
  }
];

const PLANS = [
  {
    name: "Starter",
    price: "$49",
    period: "/month",
    tagline: "For individuals and small teams getting started with AI automation.",
    agents: "Up to 5 agents",
    teams: "1 team",
    features: ["File upload execution", "CSV & PDF reports", "Email escalation alerts", "30-day audit log", "Community support"],
    cta: "Start Free Trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$199",
    period: "/month",
    tagline: "For growing organizations running multiple automated workflows.",
    agents: "Up to 25 agents",
    teams: "Unlimited teams",
    features: ["Everything in Starter", "Parallel & conditional execution", "REST API & Slack connectors", "Scheduled report delivery", "Role-based review queue", "Priority support"],
    cta: "Start Free Trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Custom",
    period: "",
    tagline: "For enterprises requiring custom integrations and dedicated support.",
    agents: "Unlimited agents",
    teams: "Unlimited teams",
    features: ["Everything in Professional", "Custom system integrations", "SSO & SAML", "Dedicated success manager", "SLA guarantee", "On-premise deployment option"],
    cta: "Contact Sales",
    highlight: false,
  }
];

const CONNECTORS = [
  { name: "File Upload", desc: "PDF, CSV, Excel, Word, plain text", live: true },
  { name: "REST API", desc: "Any authenticated API endpoint", live: true },
  { name: "Google Drive", desc: "Read documents and spreadsheets", live: true },
  { name: "Slack", desc: "Post notifications and alerts", live: true },
  { name: "Webhook", desc: "Receive and process inbound events", live: true },
  { name: "Database", desc: "Direct SQL query execution", live: false },
  { name: "Salesforce", desc: "CRM records and pipeline data", live: false },
  { name: "HubSpot", desc: "Contacts, deals, and activity", live: false },
];

export default function Landing() {
  const [activeStep, setActiveStep] = useState(0);

  return (
    <div style={{
      background: "#080808",
      color: "#fff",
      fontFamily: "'Inter', 'Helvetica Neue', Arial, sans-serif",
      minHeight: "100vh",
    }}>

      {/* ── UNDER CONSTRUCTION BANNER ── */}
      <div style={{
        position: "fixed", top: 0, left: 0, right: 0, zIndex: 200,
        background: "#f59e0b",
        color: "#000",
        textAlign: "center",
        padding: "10px 24px",
        fontSize: 13,
        fontWeight: 700,
        letterSpacing: "0.08em",
        textTransform: "uppercase",
      }}>
        Under Construction — Not For Use
      </div>

      {/* ── NAV ── */}
      <nav style={{
        position: "fixed", top: 38, left: 0, right: 0, zIndex: 100,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "20px 48px",
        background: "rgba(8,8,8,0.88)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      }}>
        <a href="/" style={{
          fontSize: 14, fontWeight: 700, letterSpacing: "0.08em",
          color: "#fff", textDecoration: "none", textTransform: "uppercase",
        }}>WorkforceAutomated</a>

        <div style={{ display: "flex", gap: 36 }}>
          {[["#how-it-works", "How It Works"], ["#integrations", "Integrations"], ["#pricing", "Pricing"]].map(([href, label]) => (
            <a key={label} href={href} style={{
              fontSize: 12, letterSpacing: "0.1em", textTransform: "uppercase",
              color: "#666", textDecoration: "none",
            }}>{label}</a>
          ))}
        </div>

        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <Link to="/login" style={{ fontSize: 12, color: "#555", textDecoration: "none", letterSpacing: "0.06em" }}>Sign In</Link>
          <Link to="/register" style={{
            fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
            color: "#fff", textDecoration: "none",
            border: "1px solid rgba(255,255,255,0.25)",
            padding: "9px 22px", borderRadius: 3,
          }}>Get Started</Link>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section style={{
        minHeight: "100vh",
        display: "flex", flexDirection: "column", justifyContent: "flex-end",
        padding: "0 48px 88px",
        position: "relative", overflow: "hidden",
        background: "#080808",
      }}>
        {/* subtle grid */}
        <div style={{
          position: "absolute", inset: 0, pointerEvents: "none",
          backgroundImage: "linear-gradient(rgba(255,255,255,0.022) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.022) 1px, transparent 1px)",
          backgroundSize: "72px 72px",
          maskImage: "radial-gradient(ellipse 90% 80% at 40% 60%, black 30%, transparent 100%)",
        }} />
        {/* top-right accent */}
        <div style={{
          position: "absolute", top: "15%", right: "8%", width: 480, height: 480,
          borderRadius: "50%", pointerEvents: "none",
          background: "radial-gradient(circle, rgba(255,255,255,0.025) 0%, transparent 70%)",
        }} />

        <div style={{ position: "relative", zIndex: 1, maxWidth: 1200, width: "100%" }}>
          <p style={{
            fontSize: 11, letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#444", marginBottom: 28, fontWeight: 500,
          }}>Enterprise AI Workforce Operating System</p>

          <h1 style={{
            fontSize: "clamp(44px, 7vw, 88px)",
            fontWeight: 800, lineHeight: 1.02, letterSpacing: "-0.03em",
            color: "#fff", margin: "0 0 32px", maxWidth: 820,
          }}>
            Your processes,<br />
            run by AI.<br />
            <span style={{ color: "#444" }}>Governed by you.</span>
          </h1>

          <p style={{
            fontSize: 18, color: "#555", lineHeight: 1.75,
            maxWidth: 480, marginBottom: 44,
          }}>
            Describe any business process. WorkforceAutomated builds the AI agent that executes it — automatically, accurately, with a human always in control.
          </p>

          <div style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{
              padding: "14px 32px", background: "#fff", color: "#000",
              fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", borderRadius: 3, display: "inline-block",
            }}>Start Free Trial</Link>
            <a href="#how-it-works" style={{
              padding: "14px 32px", background: "transparent", color: "#666",
              fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
              textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 3, display: "inline-block",
            }}>See How It Works</a>
          </div>
        </div>
      </section>

      {/* ── METRICS BAR ── */}
      <div style={{
        borderTop: "1px solid rgba(255,255,255,0.07)",
        borderBottom: "1px solid rgba(255,255,255,0.07)",
        background: "#0c0c0c",
        display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
      }}>
        {METRICS.map((m, i) => (
          <div key={m.label} style={{
            padding: "40px 48px",
            borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
          }}>
            <div style={{ fontSize: 30, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em", marginBottom: 6 }}>{m.value}</div>
            <div style={{ fontSize: 11, color: "#444", letterSpacing: "0.1em", textTransform: "uppercase" }}>{m.label}</div>
          </div>
        ))}
      </div>

      {/* ── WHAT IS IT ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)", background: "#0c0c0c" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>The Platform</p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: 0 }}>
              A workforce that never sleeps, never misses a deadline, never loses a record.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.85, marginBottom: 20 }}>
              WorkforceAutomated turns your existing process documents into AI agents that execute work autonomously. Each agent knows its role, its rules, and exactly when to stop and ask a human.
            </p>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.85 }}>
              Every action is logged permanently. Nothing is ever lost or disputed. Works for any department — finance, HR, legal, sales, customer support, IT.
            </p>
          </div>
        </div>
      </div>

      {/* ── HOW IT WORKS ── */}
      <div id="how-it-works" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>How It Works</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 64px", maxWidth: 560 }}>
            From process document to working AI agent in minutes.
          </h2>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 3 }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {STEPS.map((step, i) => (
                <button
                  key={step.number}
                  onClick={() => setActiveStep(i)}
                  style={{
                    background: activeStep === i ? "#111" : "transparent",
                    border: "1px solid",
                    borderColor: activeStep === i ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.05)",
                    padding: "28px 32px",
                    textAlign: "left", cursor: "pointer", borderRadius: 4,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", gap: 20 }}>
                    <span style={{
                      fontSize: 11, letterSpacing: "0.12em",
                      color: activeStep === i ? "#888" : "#333",
                      fontWeight: 600, paddingTop: 3, minWidth: 22,
                    }}>{step.number}</span>
                    <div>
                      <div style={{
                        fontSize: 15, fontWeight: 700, letterSpacing: "-0.01em",
                        color: activeStep === i ? "#fff" : "#444", marginBottom: activeStep === i ? 10 : 0,
                      }}>{step.label}</div>
                      {activeStep === i && (
                        <div style={{ fontSize: 13, color: "#555", lineHeight: 1.75 }}>{step.body}</div>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div style={{
              background: "#0c0c0c",
              border: "1px solid rgba(255,255,255,0.07)",
              borderRadius: 4, padding: 44,
              display: "flex", flexDirection: "column", justifyContent: "center",
            }}>
              <div style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#333", marginBottom: 20 }}>Example</div>
              <pre style={{
                fontFamily: "'SF Mono', 'Fira Code', 'Courier New', monospace",
                fontSize: 13, color: "#888", lineHeight: 1.9,
                whiteSpace: "pre-wrap", margin: 0, background: "transparent",
              }}>{STEPS[activeStep].example}</pre>
            </div>
          </div>
        </div>
      </div>

      {/* ── USE CASES ── */}
      <div style={{ background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Use Cases</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 48px" }}>
            Built for every department.
          </h2>
          <div style={{
            display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
            gap: 1, background: "rgba(255,255,255,0.06)", borderRadius: 4, overflow: "hidden",
          }}>
            {USE_CASES.map((uc) => (
              <div key={uc.dept} style={{ background: "#0c0c0c", padding: "32px 28px" }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#444", marginBottom: 12, fontWeight: 600 }}>{uc.dept}</div>
                <div style={{ fontSize: 14, color: "#666", lineHeight: 1.7 }}>{uc.task}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── AGENT ARCHITECTURE ── */}
      <div id="agent-model" style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Agent Architecture</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>
            One agent or a coordinated team.
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, maxWidth: 560, marginBottom: 56 }}>
            Deploy a single specialist agent for a focused task, or build a multi-agent pipeline where each agent hands off to the next — with parallel execution, conditional branching, and full inter-agent messaging.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 40 }}>
            {[
              {
                label: "Single Agent",
                desc: "One agent owns a process end-to-end. Ideal for focused, repeatable tasks within a single domain.",
                items: ["Runs 24/7 without supervision", "Escalates when confidence is low", "Full audit trail on every action", "Connects to your systems directly"],
              },
              {
                label: "Agent Team",
                desc: "Multiple specialist agents work in sequence or parallel. Each agent builds on the previous agent's output.",
                items: ["Sequential, parallel, or conditional execution", "Agent-to-agent handoff messaging", "Per-agent confidence scoring", "Unified team execution log"],
              }
            ].map((card) => (
              <div key={card.label} style={{
                background: "#0c0c0c", border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: 4, padding: 36,
              }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#444", marginBottom: 16, fontWeight: 600 }}>{card.label}</div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, marginBottom: 24 }}>{card.desc}</p>
                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {card.items.map((item) => (
                    <div key={item} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                      <span style={{ color: "#333", fontSize: 13, paddingTop: 2, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 13, color: "#666" }}>{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Comparison table */}
          <div style={{ border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", background: "#0c0c0c" }}>
              {["", "Starter", "Professional", "Enterprise"].map((h, i) => (
                <div key={i} style={{
                  padding: "16px 24px",
                  fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444", fontWeight: 600,
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  borderRight: i < 3 ? "1px solid rgba(255,255,255,0.07)" : "none",
                }}>{h}</div>
              ))}
            </div>
            {[
              ["Agents", "5", "25", "Unlimited"],
              ["Teams", "1", "Unlimited", "Unlimited"],
              ["Execution modes", "Sequential", "All modes", "All modes"],
              ["Integrations", "File upload", "API + Drive + Slack", "Custom"],
            ].map((row) => (
              <div key={row[0]} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr", borderBottom: "1px solid rgba(255,255,255,0.04)" }}>
                {row.map((cell, i) => (
                  <div key={i} style={{
                    padding: "14px 24px", fontSize: 13,
                    color: i === 0 ? "#666" : "#444",
                    borderRight: i < 3 ? "1px solid rgba(255,255,255,0.04)" : "none",
                  }}>{cell}</div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── EXECUTION MODEL / INTEGRATIONS ── */}
      <div style={{ background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Execution Model</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>
            How agents actually do the work.
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, maxWidth: 560, marginBottom: 56 }}>
            Agents need data to act on. WorkforceAutomated supports two approaches — bring the data to the agent, or connect the agent to your live systems.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 56 }}>
            {[
              {
                label: "Option A — Upload",
                desc: "Upload files directly to the execution console. PDFs, CSVs, Excel spreadsheets, Word documents. The agent reads the content and reasons over it immediately.",
                note: "Best for: ad-hoc analysis, document review, one-time processing tasks.",
              },
              {
                label: "Option B — Connect",
                desc: "Connect your systems once via API key, OAuth, or database credentials. The agent pulls live data at execution time — no manual uploads required.",
                note: "Best for: scheduled automations, recurring workflows, live system monitoring.",
              }
            ].map((opt) => (
              <div key={opt.label} style={{
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: 36,
              }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#444", marginBottom: 16, fontWeight: 600 }}>{opt.label}</div>
                <p style={{ fontSize: 14, color: "#555", lineHeight: 1.75, marginBottom: 16 }}>{opt.desc}</p>
                <p style={{ fontSize: 12, color: "#333" }}>{opt.note}</p>
              </div>
            ))}
          </div>

          {/* Connectors */}
          <div id="integrations" style={{
            display: "grid", gridTemplateColumns: "repeat(4, 1fr)",
            gap: 1, background: "rgba(255,255,255,0.05)", borderRadius: 4, overflow: "hidden",
          }}>
            {CONNECTORS.map((c) => (
              <div key={c.name} style={{ background: "#0c0c0c", padding: "22px 24px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: "#bbb" }}>{c.name}</span>
                  <span style={{
                    fontSize: 9, letterSpacing: "0.1em", textTransform: "uppercase",
                    padding: "3px 7px", borderRadius: 2,
                    background: c.live ? "rgba(255,255,255,0.05)" : "transparent",
                    color: c.live ? "#555" : "#2a2a2a",
                    border: c.live ? "none" : "1px solid #1e1e1e",
                  }}>{c.live ? "Live" : "Roadmap"}</span>
                </div>
                <div style={{ fontSize: 11, color: "#3a3a3a" }}>{c.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TESTIMONIALS ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Results</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 56px" }}>
            What teams are saying.
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {TESTIMONIALS.map((t) => (
              <div key={t.name} style={{
                border: "1px solid rgba(255,255,255,0.07)", borderRadius: 4, padding: 36,
              }}>
                <div style={{ fontSize: 10, letterSpacing: "0.14em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 600 }}>{t.result}</div>
                <p style={{ fontSize: 15, color: "#666", lineHeight: 1.85, marginBottom: 28, fontStyle: "italic" }}>"{t.quote}"</p>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: "#bbb" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#3a3a3a", marginTop: 3 }}>{t.title}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── PRICING ── */}
      <div id="pricing" style={{ background: "#0c0c0c", borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px" }}>
          <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Pricing</p>
          <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: "0 0 16px" }}>
            Simple, transparent pricing.
          </h2>
          <p style={{ fontSize: 16, color: "#555", lineHeight: 1.8, marginBottom: 56 }}>
            All plans include a 14-day free trial. No credit card required to start.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {PLANS.map((plan) => (
              <div key={plan.name} style={{
                border: plan.highlight ? "1px solid rgba(255,255,255,0.18)" : "1px solid rgba(255,255,255,0.07)",
                borderRadius: 4, padding: 36,
                background: plan.highlight ? "#111" : "#0c0c0c",
                display: "flex", flexDirection: "column",
              }}>
                <div style={{ fontSize: 10, letterSpacing: "0.18em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 600 }}>{plan.name}</div>
                <div style={{ display: "flex", alignItems: "baseline", gap: 4, marginBottom: 8 }}>
                  <span style={{ fontSize: 38, fontWeight: 800, color: "#fff", letterSpacing: "-0.03em" }}>{plan.price}</span>
                  {plan.period && <span style={{ fontSize: 13, color: "#444" }}>{plan.period}</span>}
                </div>
                <p style={{ fontSize: 13, color: "#444", lineHeight: 1.65, marginBottom: 20 }}>{plan.tagline}</p>
                <div style={{ fontSize: 12, color: "#333", marginBottom: 3 }}>{plan.agents}</div>
                <div style={{ fontSize: 12, color: "#333", marginBottom: 24 }}>{plan.teams}</div>
                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                      <span style={{ color: "#333", fontSize: 13, paddingTop: 2, flexShrink: 0 }}>—</span>
                      <span style={{ fontSize: 13, color: "#555" }}>{f}</span>
                    </div>
                  ))}
                </div>
                <Link
                  to={plan.cta === "Contact Sales" ? "/contact" : "/register"}
                  style={{
                    display: "block", textAlign: "center",
                    padding: "12px 24px",
                    background: plan.highlight ? "#fff" : "transparent",
                    color: plan.highlight ? "#000" : "#666",
                    border: plan.highlight ? "none" : "1px solid rgba(255,255,255,0.12)",
                    borderRadius: 3,
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase",
                    textDecoration: "none",
                  }}
                >{plan.cta}</Link>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── FINAL CTA ── */}
      <div style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", padding: "100px 48px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 80, alignItems: "center" }}>
          <div>
            <p style={{ fontSize: 11, letterSpacing: "0.2em", textTransform: "uppercase", color: "#444", marginBottom: 20, fontWeight: 500 }}>Get Started</p>
            <h2 style={{ fontSize: "clamp(28px, 3.5vw, 48px)", fontWeight: 800, letterSpacing: "-0.025em", color: "#fff", lineHeight: 1.1, margin: 0 }}>
              Your first agent is five minutes away.
            </h2>
          </div>
          <div>
            <p style={{ fontSize: 16, color: "#555", lineHeight: 1.85, marginBottom: 36 }}>
              Paste your first process document. WorkforceAutomated builds the agent, sets the governance rules, and has it ready to run — no engineering required.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
              <Link to="/register" style={{
                padding: "14px 32px", background: "#fff", color: "#000",
                fontSize: 12, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase",
                textDecoration: "none", borderRadius: 3, display: "inline-block",
              }}>Start Free Trial</Link>
              <a href="mailto:hello@workforceautomated.com" style={{
                padding: "14px 32px", background: "transparent", color: "#666",
                fontSize: 12, fontWeight: 500, letterSpacing: "0.08em", textTransform: "uppercase",
                textDecoration: "none", border: "1px solid rgba(255,255,255,0.12)",
                borderRadius: 3, display: "inline-block",
              }}>Talk to Sales</a>
            </div>
          </div>
        </div>
      </div>

      {/* ── FOOTER ── */}
      <footer style={{ padding: "44px 48px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 11, letterSpacing: "0.12em", textTransform: "uppercase", color: "#2a2a2a", fontWeight: 700 }}>WorkforceAutomated</span>
          <div style={{ display: "flex", gap: 28 }}>
            {["Privacy", "Terms", "Security", "Contact"].map((link) => (
              <a key={link} href="#" style={{ fontSize: 11, color: "#2a2a2a", textDecoration: "none", letterSpacing: "0.08em" }}>{link}</a>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "#1e1e1e" }}>© 2026 WorkforceAutomated</span>
        </div>
      </footer>
    </div>
  );
}
