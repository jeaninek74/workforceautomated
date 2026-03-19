import { useState } from "react";
import { Link } from "wouter";

// ─── Step definitions ─────────────────────────────────────────────────────────
const STEPS = [
  {
    id: 1,
    title: "Dashboard Overview",
    subtitle: "Your command center for all workforce automation",
    description:
      "The Dashboard gives you a real-time view of every agent running across your organization. See active executions, pending reviews, KPI performance, and audit events — all in one place.",
    visual: "dashboard",
  },
  {
    id: 2,
    title: "Build an Agent in 3 Minutes",
    subtitle: "No code. No engineers. Just describe the task.",
    description:
      "Select a department, choose a skill template (Invoice Review, Contract Analysis, HR Screening, etc.), connect your data source, and set the confidence threshold. Your agent is live.",
    visual: "builder",
  },
  {
    id: 3,
    title: "Agents Execute Work",
    subtitle: "Watch automation happen in real time",
    description:
      "Agents process tasks continuously. Every action is scored for confidence. High-confidence tasks complete automatically. Low-confidence tasks are routed to your Review Queue for human sign-off.",
    visual: "execution",
  },
  {
    id: 4,
    title: "Review Queue",
    subtitle: "Humans stay in control — always",
    description:
      "Any task below your confidence threshold lands here. Your team reviews, approves, or overrides. Every decision is logged permanently to the immutable audit trail.",
    visual: "review",
  },
  {
    id: 5,
    title: "Security & Audit Log",
    subtitle: "Zero-knowledge encryption. Full compliance.",
    description:
      "Every agent action, every human override, every data access is recorded with AES-256-GCM encryption. Export audit logs for SOC2, HIPAA, or GDPR compliance reviews in one click.",
    visual: "audit",
  },
  {
    id: 6,
    title: "Ready to Automate?",
    subtitle: "Set up your first agent in under 5 minutes",
    description:
      "Start with one department. Connect your data. Let your agents handle the repetitive work while your team focuses on decisions that matter.",
    visual: "cta",
  },
];

// ─── Mock visuals ─────────────────────────────────────────────────────────────
function DashboardVisual() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 16 }}>WorkforceAutomated</span>
        <span style={{ fontSize: 11, background: "#f0fdfa", color: "#0d9488", padding: "3px 10px", borderRadius: 20, fontWeight: 600 }}>● Live</span>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
        {[
          { label: "Active Agents", value: "12", delta: "+3 today", color: "#0d9488" },
          { label: "Tasks Completed", value: "1,847", delta: "this week", color: "#2563eb" },
          { label: "Pending Review", value: "4", delta: "needs attention", color: "#d97706" },
          { label: "Audit Coverage", value: "100%", delta: "fully compliant", color: "#16a34a" },
        ].map((stat) => (
          <div key={stat.label} style={{ background: "#f9fafb", borderRadius: 8, padding: 14 }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#111827" }}>{stat.value}</div>
            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{stat.label}</div>
            <div style={{ fontSize: 11, color: stat.color, fontWeight: 600, marginTop: 2 }}>{stat.delta}</div>
          </div>
        ))}
      </div>
      <div>
        {[
          { agent: "Invoice Reviewer", dept: "Finance", status: "Running", tasks: 23 },
          { agent: "Contract Analyst", dept: "Legal", status: "Running", tasks: 8 },
          { agent: "HR Screener", dept: "Human Resources", status: "Review", tasks: 2 },
        ].map((row) => (
          <div key={row.agent} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 0", borderBottom: "1px solid #f3f4f6" }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{row.agent}</div>
              <div style={{ fontSize: 11, color: "#9ca3af" }}>{row.dept}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 12, color: "#6b7280" }}>{row.tasks} tasks</span>
              <span style={{ fontSize: 11, padding: "2px 8px", borderRadius: 12, fontWeight: 600, background: row.status === "Running" ? "#f0fdfa" : "#fffbeb", color: row.status === "Running" ? "#0d9488" : "#d97706" }}>{row.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function BuilderVisual() {
  const [step, setStep] = useState(0);
  const steps = ["Choose Department", "Select Template", "Set Threshold", "Agent Live ✓"];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ fontWeight: 700, color: "#111827", fontSize: 15, marginBottom: 16 }}>New Agent Setup</div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, marginBottom: 20 }}>
        {steps.map((s, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", flex: 1 }}>
            <div onClick={() => setStep(i)} style={{ width: 26, height: 26, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 700, cursor: "pointer", background: i <= step ? "#0d9488" : "#e5e7eb", color: i <= step ? "#fff" : "#9ca3af", flexShrink: 0 }}>
              {i < step ? "✓" : i + 1}
            </div>
            {i < steps.length - 1 && <div style={{ flex: 1, height: 2, background: i < step ? "#0d9488" : "#e5e7eb", margin: "0 4px" }} />}
          </div>
        ))}
      </div>
      {step === 0 && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
          {["Finance", "Legal", "HR", "Sales", "IT", "Support"].map((dept) => (
            <button key={dept} onClick={() => setStep(1)} style={{ padding: "10px 8px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 600, color: "#374151", background: "#fff", cursor: "pointer" }}>{dept}</button>
          ))}
        </div>
      )}
      {step === 1 && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {["Invoice Reviewer", "AP Reconciliation", "Expense Auditor", "Budget Variance Analyzer"].map((tmpl) => (
            <button key={tmpl} onClick={() => setStep(2)} style={{ padding: "10px 14px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13, fontWeight: 500, color: "#374151", background: "#fff", cursor: "pointer", textAlign: "left" }}>{tmpl}</button>
          ))}
        </div>
      )}
      {step === 2 && (
        <div>
          <p style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Auto-complete tasks above this confidence score:</p>
          <div style={{ display: "flex", gap: 8 }}>
            {[70, 80, 90, 95].map((val) => (
              <button key={val} onClick={() => setStep(3)} style={{ flex: 1, padding: "12px 8px", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 14, fontWeight: 700, color: "#374151", background: "#fff", cursor: "pointer" }}>{val}%</button>
            ))}
          </div>
          <p style={{ fontSize: 11, color: "#9ca3af", marginTop: 8 }}>Tasks below threshold go to Review Queue for human approval.</p>
        </div>
      )}
      {step === 3 && (
        <div style={{ textAlign: "center", padding: "20px 0" }}>
          <div style={{ width: 56, height: 56, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", fontSize: 24 }}>✓</div>
          <div style={{ fontWeight: 700, color: "#111827", fontSize: 16, marginBottom: 4 }}>Invoice Reviewer is Live</div>
          <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 12 }}>Your agent is processing invoices now.</div>
          <button onClick={() => setStep(0)} style={{ fontSize: 12, color: "#0d9488", background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>Start over</button>
        </div>
      )}
    </div>
  );
}

function ExecutionVisual() {
  const tasks = [
    { id: "INV-2041", desc: "ACME Corp invoice $12,450", confidence: 94, status: "auto-approved" },
    { id: "INV-2042", desc: "GlobalTech invoice $8,200", confidence: 88, status: "auto-approved" },
    { id: "INV-2043", desc: "Vendor X invoice $67,000 — missing PO", confidence: 42, status: "review-queue" },
    { id: "INV-2044", desc: "Office Supplies $340", confidence: 97, status: "auto-approved" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Invoice Reviewer — Live Execution</span>
        <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 600 }}>● Processing</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {tasks.map((task) => (
          <div key={task.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 12px", background: "#f9fafb", borderRadius: 8 }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af" }}>{task.id}</div>
              <div style={{ fontSize: 13, color: "#374151" }}>{task.desc}</div>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginLeft: 12 }}>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: task.confidence >= 80 ? "#0d9488" : "#d97706" }}>{task.confidence}%</div>
                <div style={{ fontSize: 10, color: "#9ca3af" }}>confidence</div>
              </div>
              <span style={{ fontSize: 11, padding: "3px 8px", borderRadius: 12, fontWeight: 600, whiteSpace: "nowrap", background: task.status === "auto-approved" ? "#f0fdfa" : "#fffbeb", color: task.status === "auto-approved" ? "#0d9488" : "#d97706" }}>
                {task.status === "auto-approved" ? "Auto-approved" : "→ Review Queue"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ReviewVisual() {
  const [approved, setApproved] = useState<string[]>([]);
  const items = [
    { id: "INV-2043", desc: "Vendor X invoice $67,000 — missing PO number", agent: "Invoice Reviewer", reason: "Amount exceeds $50K threshold + missing PO" },
    { id: "CTR-0891", desc: "Software license renewal — auto-renew clause", agent: "Contract Analyst", reason: "Auto-renew clause detected, requires human sign-off" },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Review Queue</span>
        <span style={{ fontSize: 11, background: "#fffbeb", color: "#d97706", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>{items.length - approved.length} pending</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {items.map((item) => (
          <div key={item.id} style={{ padding: 14, border: `1px solid ${approved.includes(item.id) ? "#a7f3d0" : "#fde68a"}`, borderRadius: 10, background: approved.includes(item.id) ? "#f0fdf4" : "#fffbeb", opacity: approved.includes(item.id) ? 0.7 : 1 }}>
            <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 12 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 10, fontFamily: "monospace", color: "#9ca3af", marginBottom: 4 }}>{item.id} · {item.agent}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#111827", marginBottom: 4 }}>{item.desc}</div>
                <div style={{ fontSize: 11, color: "#6b7280" }}>⚠ {item.reason}</div>
              </div>
              {!approved.includes(item.id) ? (
                <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                  <button onClick={() => setApproved([...approved, item.id])} style={{ fontSize: 12, padding: "6px 12px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Approve</button>
                  <button style={{ fontSize: 12, padding: "6px 12px", background: "#fff", color: "#374151", border: "1px solid #d1d5db", borderRadius: 6, fontWeight: 600, cursor: "pointer" }}>Override</button>
                </div>
              ) : (
                <span style={{ fontSize: 12, color: "#0d9488", fontWeight: 600, flexShrink: 0 }}>✓ Approved</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AuditVisual() {
  const events = [
    { time: "14:32:01", event: "Invoice INV-2041 auto-approved", actor: "Invoice Reviewer", hash: "a3f9c2..." },
    { time: "14:32:04", event: "Invoice INV-2043 sent to Review Queue", actor: "Invoice Reviewer", hash: "b7d1e8..." },
    { time: "14:33:17", event: "Human approved INV-2043", actor: "Sarah M.", hash: "c2a4f1..." },
    { time: "14:35:02", event: "Contract CTR-0891 flagged for review", actor: "Contract Analyst", hash: "d9b3c7..." },
  ];
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 24, width: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <span style={{ fontWeight: 700, color: "#111827", fontSize: 15 }}>Immutable Audit Log</span>
        <span style={{ fontSize: 11, background: "#f0fdf4", color: "#16a34a", padding: "3px 10px", borderRadius: 12, fontWeight: 600 }}>🔒 Encrypted</span>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {events.map((ev, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 10px", background: "#f9fafb", borderRadius: 6, fontFamily: "monospace", fontSize: 11 }}>
            <span style={{ color: "#9ca3af", flexShrink: 0 }}>{ev.time}</span>
            <span style={{ color: "#374151", flex: 1 }}>{ev.event}</span>
            <span style={{ color: "#0d9488", flexShrink: 0 }}>{ev.actor}</span>
            <span style={{ color: "#d1d5db", flexShrink: 0 }}>{ev.hash}</span>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 6, color: "#374151", background: "#fff", cursor: "pointer" }}>Export CSV</button>
        <button style={{ fontSize: 12, padding: "6px 12px", border: "1px solid #e5e7eb", borderRadius: 6, color: "#374151", background: "#fff", cursor: "pointer" }}>Export PDF</button>
        <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: "auto", alignSelf: "center" }}>SOC2 · HIPAA · GDPR ready</span>
      </div>
    </div>
  );
}

function CTAVisual() {
  return (
    <div style={{ background: "#fff", borderRadius: 12, border: "1px solid #e5e7eb", padding: 40, width: "100%", textAlign: "center" }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>🚀</div>
      <h3 style={{ fontSize: 20, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>You've seen what's possible.</h3>
      <p style={{ fontSize: 14, color: "#6b7280", margin: "0 0 24px" }}>Set up your first agent in under 5 minutes. No credit card required.</p>
      <div style={{ display: "flex", flexDirection: "column", gap: 10, maxWidth: 280, margin: "0 auto" }}>
        <Link href="/register">
          <a style={{ display: "block", padding: "12px 0", background: "#0d9488", color: "#fff", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Start Free Trial
          </a>
        </Link>
        <Link href="/custom-build">
          <a style={{ display: "block", padding: "12px 0", border: "1px solid #0d9488", color: "#0d9488", borderRadius: 8, fontWeight: 700, fontSize: 14, textDecoration: "none" }}>
            Build Your Custom Plan
          </a>
        </Link>
      </div>
    </div>
  );
}

const VISUALS: Record<string, JSX.Element> = {
  dashboard: <DashboardVisual />,
  builder: <BuilderVisual />,
  execution: <ExecutionVisual />,
  review: <ReviewVisual />,
  audit: <AuditVisual />,
  cta: <CTAVisual />,
};

// ─── Main Demo Page ───────────────────────────────────────────────────────────
export default function Demo() {
  const [activeStep, setActiveStep] = useState(0);
  const step = STEPS[activeStep];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "16px 40px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <Link href="/"><a style={{ fontSize: 18, fontWeight: 800, color: "#0f766e", textDecoration: "none" }}>WorkforceAutomated</a></Link>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Link href="/watch"><a style={{ fontSize: 13, color: "#6b7280", textDecoration: "none" }}>Watch Demo Video</a></Link>
          <Link href="/register"><a style={{ fontSize: 13, background: "#0d9488", color: "#fff", padding: "8px 16px", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>Get Started Free</a></Link>
        </div>
      </nav>

      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #f3f4f6", padding: "32px 40px", textAlign: "center" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "#f0fdfa", color: "#0d9488", fontSize: 11, fontWeight: 700, padding: "4px 12px", borderRadius: 20, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.06em" }}>
          Interactive Product Tour
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>See WorkforceAutomated in Action</h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>Click through each step to explore the real product. No sign-up required.</p>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 40px", display: "grid", gridTemplateColumns: "260px 1fr", gap: 24 }}>
        {/* Step sidebar */}
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {STEPS.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setActiveStep(i)}
                style={{
                  width: "100%", textAlign: "left", padding: "10px 14px", borderRadius: 8, border: "none",
                  background: i === activeStep ? "#0d9488" : "transparent",
                  color: i === activeStep ? "#fff" : "#374151",
                  cursor: "pointer", transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ width: 22, height: 22, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10, fontWeight: 700, flexShrink: 0, background: i === activeStep ? "#fff" : i < activeStep ? "#f0fdfa" : "#e5e7eb", color: i === activeStep ? "#0d9488" : i < activeStep ? "#0d9488" : "#9ca3af" }}>
                    {i < activeStep ? "✓" : i + 1}
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 600, lineHeight: 1.3 }}>{s.title}</span>
                </div>
              </button>
            ))}
          </div>

          {/* Progress */}
          <div style={{ marginTop: 20, padding: "0 14px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "#9ca3af", marginBottom: 4 }}>
              <span>Progress</span>
              <span>{Math.round(((activeStep + 1) / STEPS.length) * 100)}%</span>
            </div>
            <div style={{ height: 4, background: "#e5e7eb", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", background: "#0d9488", borderRadius: 4, transition: "width 0.4s", width: `${((activeStep + 1) / STEPS.length) * 100}%` }} />
            </div>
          </div>
        </div>

        {/* Main content */}
        <div>
          <div style={{ marginBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#0d9488", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>
              Step {step.id} of {STEPS.length}
            </div>
            <h2 style={{ fontSize: 22, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>{step.title}</h2>
            <p style={{ fontSize: 14, color: "#0d9488", fontWeight: 600, margin: "0 0 10px" }}>{step.subtitle}</p>
            <p style={{ fontSize: 14, color: "#6b7280", lineHeight: 1.6, margin: 0, maxWidth: 520 }}>{step.description}</p>
          </div>

          {/* Visual */}
          <div style={{ marginBottom: 20 }}>
            {VISUALS[step.visual]}
          </div>

          {/* Navigation */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <button
              onClick={() => setActiveStep(Math.max(0, activeStep - 1))}
              disabled={activeStep === 0}
              style={{ fontSize: 13, padding: "8px 16px", border: "1px solid #e5e7eb", borderRadius: 8, color: "#374151", background: "#fff", cursor: activeStep === 0 ? "not-allowed" : "pointer", opacity: activeStep === 0 ? 0.4 : 1 }}
            >
              ← Previous
            </button>
            <div style={{ display: "flex", gap: 6 }}>
              {STEPS.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveStep(i)}
                  style={{ width: i === activeStep ? 20 : 8, height: 8, borderRadius: 4, border: "none", background: i === activeStep ? "#0d9488" : "#d1d5db", cursor: "pointer", transition: "all 0.2s" }}
                />
              ))}
            </div>
            {activeStep < STEPS.length - 1 ? (
              <button
                onClick={() => setActiveStep(activeStep + 1)}
                style={{ fontSize: 13, padding: "8px 16px", background: "#0d9488", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}
              >
                Next →
              </button>
            ) : (
              <Link href="/register">
                <a style={{ fontSize: 13, padding: "8px 16px", background: "#0d9488", color: "#fff", borderRadius: 8, fontWeight: 600, textDecoration: "none" }}>
                  Start Free Trial →
                </a>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
