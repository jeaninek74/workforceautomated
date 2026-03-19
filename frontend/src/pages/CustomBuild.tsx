import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildConfig {
  companySize: string;
  departments: string[];
  agentCount: string;
  primaryUseCase: string;
  integrations: string[];
  compliance: string[];
  budget: string;
  timeline: string;
}

interface PlanOption {
  id: string;
  name: string;
  badge: string;
  badgeColor: string;
  price: string;
  priceNote: string;
  description: string;
  agents: string;
  executions: string;
  features: string[];
  highlight: boolean;
  cta: string;
}

// ─── Options ─────────────────────────────────────────────────────────────────

const COMPANY_SIZES = ["1–10 employees", "11–50 employees", "51–200 employees", "201–500 employees", "500+ employees"];
const DEPARTMENTS = ["Finance", "Human Resources", "Legal", "Customer Support", "Sales", "IT & Security", "Operations", "Marketing", "Compliance", "Executive"];
const AGENT_COUNTS = ["1–5 agents", "6–15 agents", "16–30 agents", "31–50 agents", "50+ agents"];
const USE_CASES = ["Invoice & payment processing", "Contract review & compliance", "HR screening & onboarding", "Customer support automation", "Lead scoring & CRM updates", "IT monitoring & incident response", "Executive reporting & analytics", "Custom workflow automation"];
const INTEGRATIONS = ["Slack", "HubSpot", "Salesforce", "QuickBooks", "Jira", "GitHub", "Google Workspace", "Microsoft 365", "Zapier", "Custom API"];
const COMPLIANCE_REQS = ["GDPR", "HIPAA", "SOC 2", "ISO 27001", "PCI DSS", "CCPA", "None required"];
const BUDGETS = ["Under $500/mo", "$500–$1,500/mo", "$1,500–$5,000/mo", "$5,000–$15,000/mo", "$15,000+/mo"];
const TIMELINES = ["Immediate (this week)", "Within 1 month", "1–3 months", "3–6 months", "Flexible"];

// ─── Plan Generator ───────────────────────────────────────────────────────────

function generatePlans(config: BuildConfig): PlanOption[] {
  const isEnterprise = config.companySize === "500+ employees" || config.agentCount === "50+ agents" || config.budget === "$15,000+/mo";
  const isMid = config.companySize === "201–500 employees" || config.agentCount === "31–50 agents";
  const needsCompliance = config.compliance.some((c) => ["HIPAA", "SOC 2", "ISO 27001"].includes(c));
  const manyDepts = config.departments.length >= 4;

  const plans: PlanOption[] = [
    {
      id: "starter",
      name: "Starter Build",
      badge: "Best for getting started",
      badgeColor: "#6b7280",
      price: "$49",
      priceNote: "/month",
      description: "Deploy your first AI agents quickly. Perfect for a single department or use case.",
      agents: "Up to 5 agents",
      executions: "10,000 executions/month",
      features: [
        `${config.departments[0] || "Finance"} department automation`,
        "1 primary use case configured",
        "Basic integrations (up to 2)",
        "Email escalation alerts",
        "Standard audit logging",
        "Email support",
      ],
      highlight: false,
      cta: "Start with Starter",
    },
    {
      id: "professional",
      name: "Professional Build",
      badge: manyDepts ? "Recommended for your setup" : "Most popular",
      badgeColor: "#0d9488",
      price: "$149",
      priceNote: "/month",
      description: `Designed for ${config.departments.length > 1 ? `${config.departments.length} departments` : "growing organizations"} with ${config.agentCount || "multiple agents"} and ${config.integrations.length > 0 ? config.integrations.slice(0, 2).join(" + ") + " integrations" : "standard integrations"}.`,
      agents: "Up to 25 agents",
      executions: "100,000 executions/month",
      features: [
        `All ${config.departments.length || 3} selected departments`,
        `${config.primaryUseCase || "Primary use case"} fully configured`,
        `${config.integrations.slice(0, 4).join(", ") || "All standard integrations"}`,
        "Review queue with bulk approval",
        "Scheduled executions",
        "Advanced analytics & KPI builder",
        needsCompliance ? `${config.compliance.join(" + ")} compliance ready` : "Standard compliance logging",
        "Priority support",
      ],
      highlight: true,
      cta: "Build Professional",
    },
    {
      id: "enterprise",
      name: "Enterprise Build",
      badge: isEnterprise ? "Best match for your requirements" : "For large-scale deployment",
      badgeColor: "#7c3aed",
      price: "Custom",
      priceNote: "contact sales",
      description: `Full-scale deployment for ${config.companySize || "enterprise"} with unlimited agents, custom integrations, and dedicated support.`,
      agents: "Unlimited agents",
      executions: "Unlimited executions",
      features: [
        "All departments & use cases",
        "Custom integration development",
        "Dedicated implementation engineer",
        "SLA guarantee (99.9% uptime)",
        "On-premise deployment option",
        needsCompliance ? `Full ${config.compliance.join(" + ")} audit package` : "Full compliance package",
        "Custom KPI & dashboard build",
        "24/7 dedicated support",
        "White-label option available",
      ],
      highlight: false,
      cta: "Contact Sales",
    },
  ];

  // Reorder based on config — put best match first
  if (isEnterprise) return [plans[2], plans[1], plans[0]];
  if (isMid || manyDepts || needsCompliance) return [plans[1], plans[2], plans[0]];
  return plans;
}

// ─── Step Components ──────────────────────────────────────────────────────────

function MultiSelect({ options, selected, onChange, label }: { options: string[]; selected: string[]; onChange: (v: string[]) => void; label: string }) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding: "8px 14px", borderRadius: 8, border: `1px solid ${selected.includes(opt) ? "#0d9488" : "#e5e7eb"}`,
              background: selected.includes(opt) ? "#f0fdfa" : "#fff",
              color: selected.includes(opt) ? "#0d9488" : "#374151",
              fontSize: 13, fontWeight: selected.includes(opt) ? 600 : 400, cursor: "pointer",
            }}
          >
            {selected.includes(opt) ? "✓ " : ""}{opt}
          </button>
        ))}
      </div>
    </div>
  );
}

function SingleSelect({ options, selected, onChange, label }: { options: string[]; selected: string; onChange: (v: string) => void; label: string }) {
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "8px 14px", borderRadius: 8, border: `1px solid ${selected === opt ? "#0d9488" : "#e5e7eb"}`,
              background: selected === opt ? "#f0fdfa" : "#fff",
              color: selected === opt ? "#0d9488" : "#374151",
              fontSize: 13, fontWeight: selected === opt ? 600 : 400, cursor: "pointer",
            }}
          >
            {selected === opt ? "✓ " : ""}{opt}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomBuild() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BuildConfig>({
    companySize: "",
    departments: [],
    agentCount: "",
    primaryUseCase: "",
    integrations: [],
    compliance: [],
    budget: "",
    timeline: "",
  });
  const [showPlans, setShowPlans] = useState(false);

  const totalSteps = 4;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return config.companySize && config.departments.length > 0;
    if (step === 2) return config.agentCount && config.primaryUseCase;
    if (step === 3) return config.budget;
    return true;
  };

  const handleGenerate = () => setShowPlans(true);

  const plans = generatePlans(config);

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Custom Build Configurator</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Tell us about your organization and we will generate the right automation plan for you — with multiple options to choose from.
          </p>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 40px" }}>
        {!showPlans ? (
          <>
            {/* Progress Bar */}
            <div style={{ marginBottom: 32 }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                <span style={{ fontSize: 13, color: "#6b7280" }}>Step {step} of {totalSteps}</span>
                <span style={{ fontSize: 13, color: "#0d9488", fontWeight: 600 }}>{Math.round(progress)}% complete</span>
              </div>
              <div style={{ background: "#e5e7eb", borderRadius: 10, height: 8 }}>
                <div style={{ background: "#0d9488", borderRadius: 10, height: 8, width: `${progress}%`, transition: "width 0.3s" }}></div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}>
                {["Organization", "Automation Needs", "Integrations & Compliance", "Budget & Timeline"].map((label, i) => (
                  <span key={label} style={{ fontSize: 11, color: step > i + 1 ? "#0d9488" : step === i + 1 ? "#111827" : "#9ca3af", fontWeight: step === i + 1 ? 700 : 400 }}>
                    {label}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 32 }}>
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Tell us about your organization</h2>
                  <SingleSelect options={COMPANY_SIZES} selected={config.companySize} onChange={(v) => setConfig({ ...config, companySize: v })} label="Company size" />
                  <MultiSelect options={DEPARTMENTS} selected={config.departments} onChange={(v) => setConfig({ ...config, departments: v })} label="Which departments need automation? (select all that apply)" />
                </div>
              )}

              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>What do you want to automate?</h2>
                  <SingleSelect options={AGENT_COUNTS} selected={config.agentCount} onChange={(v) => setConfig({ ...config, agentCount: v })} label="How many AI agents do you need?" />
                  <SingleSelect options={USE_CASES} selected={config.primaryUseCase} onChange={(v) => setConfig({ ...config, primaryUseCase: v })} label="Primary use case" />
                </div>
              )}

              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Integrations & compliance requirements</h2>
                  <MultiSelect options={INTEGRATIONS} selected={config.integrations} onChange={(v) => setConfig({ ...config, integrations: v })} label="Which tools do you need to connect? (optional)" />
                  <MultiSelect options={COMPLIANCE_REQS} selected={config.compliance} onChange={(v) => setConfig({ ...config, compliance: v })} label="Compliance requirements" />
                </div>
              )}

              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Budget & timeline</h2>
                  <SingleSelect options={BUDGETS} selected={config.budget} onChange={(v) => setConfig({ ...config, budget: v })} label="Monthly budget range" />
                  <SingleSelect options={TIMELINES} selected={config.timeline} onChange={(v) => setConfig({ ...config, timeline: v })} label="When do you want to go live?" />

                  {/* Summary */}
                  {config.budget && (
                    <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: 20 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d9488", margin: "0 0 12px" }}>Your Configuration Summary</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          ["Company size", config.companySize],
                          ["Departments", config.departments.join(", ") || "—"],
                          ["Agents needed", config.agentCount],
                          ["Primary use case", config.primaryUseCase],
                          ["Integrations", config.integrations.join(", ") || "None selected"],
                          ["Compliance", config.compliance.join(", ") || "None"],
                          ["Budget", config.budget],
                          ["Timeline", config.timeline || "Flexible"],
                        ].map(([label, value]) => (
                          <div key={label}>
                            <span style={{ fontSize: 12, color: "#6b7280" }}>{label}: </span>
                            <span style={{ fontSize: 12, fontWeight: 600, color: "#111827" }}>{value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Navigation */}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 20 }}>
              <button
                onClick={() => setStep((s) => Math.max(1, s - 1))}
                disabled={step === 1}
                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: step === 1 ? "not-allowed" : "pointer", opacity: step === 1 ? 0.4 : 1 }}
              >
                ← Back
              </button>
              {step < totalSteps ? (
                <button
                  onClick={() => setStep((s) => s + 1)}
                  disabled={!canProceed()}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: canProceed() ? "#0d9488" : "#e5e7eb", color: canProceed() ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 700, cursor: canProceed() ? "pointer" : "not-allowed" }}
                >
                  Continue →
                </button>
              ) : (
                <button
                  onClick={handleGenerate}
                  disabled={!canProceed()}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: canProceed() ? "#0d9488" : "#e5e7eb", color: canProceed() ? "#fff" : "#9ca3af", fontSize: 14, fontWeight: 700, cursor: canProceed() ? "pointer" : "not-allowed" }}
                >
                  Generate My Plans →
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Plans Output */}
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 20, padding: "6px 16px", marginBottom: 16 }}>
                <span style={{ color: "#0d9488", fontSize: 13, fontWeight: 600 }}>✓ 3 plans generated based on your requirements</span>
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, color: "#111827", margin: "0 0 8px" }}>Your Custom Plans</h2>
              <p style={{ fontSize: 15, color: "#6b7280", margin: 0 }}>
                Based on your {config.companySize} organization, {config.departments.length} department{config.departments.length !== 1 ? "s" : ""}, and {config.agentCount} — here are your best options.
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20, marginBottom: 24 }}>
              {plans.map((plan) => (
                <div key={plan.id} style={{ background: plan.highlight ? "#0d9488" : "#fff", border: plan.highlight ? "none" : "1px solid #e5e7eb", borderRadius: 14, padding: 28, position: "relative" }}>
                  <div style={{ display: "inline-flex", background: plan.highlight ? "rgba(255,255,255,0.2)" : "#f9fafb", border: `1px solid ${plan.highlight ? "rgba(255,255,255,0.3)" : "#e5e7eb"}`, borderRadius: 20, padding: "4px 12px", marginBottom: 16 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: plan.highlight ? "#fff" : plan.badgeColor }}>{plan.badge}</span>
                  </div>
                  <h3 style={{ fontSize: 20, fontWeight: 800, color: plan.highlight ? "#fff" : "#111827", margin: "0 0 6px" }}>{plan.name}</h3>
                  <p style={{ fontSize: 13, color: plan.highlight ? "#ccfbf1" : "#6b7280", margin: "0 0 16px", lineHeight: 1.5 }}>{plan.description}</p>
                  <div style={{ marginBottom: 16 }}>
                    <span style={{ fontSize: 32, fontWeight: 800, color: plan.highlight ? "#fff" : "#111827" }}>{plan.price}</span>
                    <span style={{ fontSize: 14, color: plan.highlight ? "#ccfbf1" : "#9ca3af" }}> {plan.priceNote}</span>
                  </div>
                  <div style={{ background: plan.highlight ? "rgba(255,255,255,0.1)" : "#f9fafb", borderRadius: 8, padding: "10px 14px", marginBottom: 16 }}>
                    <div style={{ fontSize: 12, color: plan.highlight ? "#ccfbf1" : "#6b7280" }}>
                      <span style={{ fontWeight: 600, color: plan.highlight ? "#fff" : "#111827" }}>{plan.agents}</span> · {plan.executions}
                    </div>
                  </div>
                  <ul style={{ listStyle: "none", padding: 0, margin: "0 0 20px" }}>
                    {plan.features.map((f) => (
                      <li key={f} style={{ fontSize: 13, color: plan.highlight ? "#ccfbf1" : "#6b7280", padding: "5px 0", display: "flex", gap: 8, lineHeight: 1.5 }}>
                        <span style={{ color: plan.highlight ? "#fff" : "#0d9488", flexShrink: 0 }}>✓</span> {f}
                      </li>
                    ))}
                  </ul>
                  <Link
                    to="/register"
                    style={{ display: "block", textAlign: "center", background: plan.highlight ? "#fff" : "#0d9488", color: plan.highlight ? "#0d9488" : "#fff", fontWeight: 700, fontSize: 14, padding: "12px 0", borderRadius: 8, textDecoration: "none" }}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "center", gap: 12 }}>
              <button
                onClick={() => { setShowPlans(false); setStep(1); }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                ← Start Over
              </button>
              <button
                onClick={() => { setShowPlans(false); setStep(4); }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #0d9488", background: "#f0fdfa", color: "#0d9488", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Adjust Requirements
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
