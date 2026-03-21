import { useState } from "react";
import { Link } from "react-router-dom";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BuildConfig {
  companySize: string;
  departments: string[];
  customDepartment: string;
  agentCount: string;
  primaryUseCase: string;
  customUseCase: string;
  integrations: string[];
  customIntegration: string;
  compliance: string[];
  customCompliance: string;
  budget: string;
  customBudget: string;
  timeline: string;
  customTimeline: string;
  freeText: string;
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
const DEPARTMENTS = ["Finance", "Human Resources", "Legal", "Customer Support", "Sales", "IT & Security", "Operations", "Marketing", "Compliance", "Executive", "Other (describe below)"];
const AGENT_COUNTS = ["1–5 agents", "6–15 agents", "16–30 agents", "31–50 agents", "50+ agents"];
const USE_CASES = [
  "Invoice & payment processing",
  "Contract review & compliance",
  "HR screening & onboarding",
  "Customer support automation",
  "Lead scoring & CRM updates",
  "IT monitoring & incident response",
  "Executive reporting & analytics",
  "Supply chain & logistics",
  "Data extraction & enrichment",
  "Other (describe below)",
];
const INTEGRATIONS = ["Slack", "HubSpot", "Salesforce", "QuickBooks", "Jira", "GitHub", "Google Workspace", "Microsoft 365", "Zapier", "SAP", "ServiceNow", "Workday", "Zendesk", "Custom API", "Other (describe below)"];
const COMPLIANCE_REQS = ["GDPR", "HIPAA", "SOC 2", "ISO 27001", "PCI DSS", "CCPA", "FedRAMP", "FINRA", "None required", "Other (describe below)"];
const BUDGETS = ["Under $500/mo", "$500–$1,500/mo", "$1,500–$5,000/mo", "$5,000–$15,000/mo", "$15,000+/mo", "Other (specify below)"];
const TIMELINES = ["Immediate (this week)", "Within 1 month", "1–3 months", "3–6 months", "Flexible", "Other (specify below)"];

// ─── Plan Generator ───────────────────────────────────────────────────────────

function generatePlans(config: BuildConfig): PlanOption[] {
  const isEnterprise = config.companySize === "500+ employees" || config.agentCount === "50+ agents" || config.budget === "$15,000+/mo";
  const isMid = config.companySize === "201–500 employees" || config.agentCount === "31–50 agents";
  const needsCompliance = config.compliance.some((c) => ["HIPAA", "SOC 2", "ISO 27001", "FedRAMP", "FINRA"].includes(c));
  const manyDepts = config.departments.length >= 4;
  const hasCustomNeeds = config.freeText.trim().length > 20 || config.customDepartment || config.customUseCase || config.customIntegration;

  // Effective department list (including custom)
  const deptList = [
    ...config.departments.filter((d) => d !== "Other (describe below)"),
    ...(config.customDepartment ? [config.customDepartment] : []),
  ];

  // Effective integration list (including custom)
  const integList = [
    ...config.integrations.filter((i) => i !== "Other (describe below)"),
    ...(config.customIntegration ? [config.customIntegration] : []),
  ];

  // Effective use case
  const useCase = config.primaryUseCase === "Other (describe below)" && config.customUseCase
    ? config.customUseCase
    : config.primaryUseCase;

  // Effective compliance
  const complianceList = [
    ...config.compliance.filter((c) => c !== "Other (describe below)"),
    ...(config.customCompliance ? [config.customCompliance] : []),
  ];

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
        `${deptList[0] || "Primary"} department automation`,
        `${useCase || "1 primary use case"} configured`,
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
      badge: manyDepts || hasCustomNeeds ? "Recommended for your setup" : "Most popular",
      badgeColor: "#0d9488",
      price: "$149",
      priceNote: "/month",
      description: `Designed for ${deptList.length > 1 ? `${deptList.length} departments` : "growing organizations"} with ${config.agentCount || "multiple agents"} and ${integList.length > 0 ? integList.slice(0, 2).join(" + ") + " integrations" : "standard integrations"}.`,
      agents: "Up to 25 agents",
      executions: "100,000 executions/month",
      features: [
        `All ${deptList.length || 3} selected departments`,
        `${useCase || "Primary use case"} fully configured`,
        integList.length > 0 ? `${integList.slice(0, 4).join(", ")} connected` : "All standard integrations",
        "Review queue with bulk approval",
        "Scheduled executions",
        "Advanced analytics & KPI builder",
        needsCompliance ? `${complianceList.join(" + ")} compliance ready` : "Standard compliance logging",
        "Priority support",
      ],
      highlight: true,
      cta: "Build Professional",
    },
    {
      id: "enterprise",
      name: "Enterprise Build",
      badge: isEnterprise || hasCustomNeeds ? "Best match for your requirements" : "For large-scale deployment",
      badgeColor: "#7c3aed",
      price: "Custom",
      priceNote: "contact sales",
      description: hasCustomNeeds
        ? `Fully custom deployment built around your specific requirements — ${config.freeText.slice(0, 80)}${config.freeText.length > 80 ? "..." : ""}`
        : `Full-scale deployment for ${config.companySize || "enterprise"} with unlimited agents, custom integrations, and dedicated support.`,
      agents: "Unlimited agents",
      executions: "Unlimited executions",
      features: [
        "All departments & use cases",
        hasCustomNeeds ? "Custom integration development for your stack" : "Custom integration development",
        "Dedicated implementation engineer",
        "SLA guarantee (99.9% uptime)",
        "On-premise deployment option",
        needsCompliance ? `Full ${complianceList.join(" + ")} audit package` : "Full compliance package",
        "Custom KPI & dashboard build",
        "24/7 dedicated support",
        "White-label option available",
      ],
      highlight: false,
      cta: "Contact Sales",
    },
  ];

  // Reorder based on config — put best match first
  if (isEnterprise || (hasCustomNeeds && config.freeText.length > 50)) return [plans[2], plans[1], plans[0]];
  if (isMid || manyDepts || needsCompliance || hasCustomNeeds) return [plans[1], plans[2], plans[0]];
  return plans;
}

// ─── Step Components ──────────────────────────────────────────────────────────

function MultiSelect({
  options, selected, onChange, label, customValue, onCustomChange, customPlaceholder,
}: {
  options: string[];
  selected: string[];
  onChange: (v: string[]) => void;
  label: string;
  customValue?: string;
  onCustomChange?: (v: string) => void;
  customPlaceholder?: string;
}) {
  const toggle = (opt: string) => {
    onChange(selected.includes(opt) ? selected.filter((s) => s !== opt) : [...selected, opt]);
  };
  const showCustom = selected.includes("Other (describe below)");
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => toggle(opt)}
            style={{
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${selected.includes(opt) ? (opt.startsWith("Other") ? "#7c3aed" : "#0d9488") : "#e5e7eb"}`,
              background: selected.includes(opt) ? (opt.startsWith("Other") ? "#f5f3ff" : "#f0fdfa") : "#fff",
              color: selected.includes(opt) ? (opt.startsWith("Other") ? "#7c3aed" : "#0d9488") : "#374151",
              fontSize: 13, fontWeight: selected.includes(opt) ? 600 : 400, cursor: "pointer",
            }}
          >
            {selected.includes(opt) ? "✓ " : ""}{opt}
          </button>
        ))}
      </div>
      {showCustom && onCustomChange && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={customValue || ""}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={customPlaceholder || "Describe your custom option..."}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #7c3aed",
              fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box",
              background: "#faf5ff",
            }}
          />
        </div>
      )}
    </div>
  );
}

function SingleSelect({
  options, selected, onChange, label, customValue, onCustomChange, customPlaceholder,
}: {
  options: string[];
  selected: string;
  onChange: (v: string) => void;
  label: string;
  customValue?: string;
  onCustomChange?: (v: string) => void;
  customPlaceholder?: string;
}) {
  const showCustom = selected.startsWith("Other");
  return (
    <div>
      <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 10 }}>{label}</label>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {options.map((opt) => (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: "8px 14px", borderRadius: 8,
              border: `1px solid ${selected === opt ? (opt.startsWith("Other") ? "#7c3aed" : "#0d9488") : "#e5e7eb"}`,
              background: selected === opt ? (opt.startsWith("Other") ? "#f5f3ff" : "#f0fdfa") : "#fff",
              color: selected === opt ? (opt.startsWith("Other") ? "#7c3aed" : "#0d9488") : "#374151",
              fontSize: 13, fontWeight: selected === opt ? 600 : 400, cursor: "pointer",
            }}
          >
            {selected === opt ? "✓ " : ""}{opt}
          </button>
        ))}
      </div>
      {showCustom && onCustomChange && (
        <div style={{ marginTop: 12 }}>
          <input
            type="text"
            value={customValue || ""}
            onChange={(e) => onCustomChange(e.target.value)}
            placeholder={customPlaceholder || "Specify your custom option..."}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #7c3aed",
              fontSize: 13, color: "#111827", outline: "none", boxSizing: "border-box",
              background: "#faf5ff",
            }}
          />
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function CustomBuild() {
  const [step, setStep] = useState(1);
  const [config, setConfig] = useState<BuildConfig>({
    companySize: "",
    departments: [],
    customDepartment: "",
    agentCount: "",
    primaryUseCase: "",
    customUseCase: "",
    integrations: [],
    customIntegration: "",
    compliance: [],
    customCompliance: "",
    budget: "",
    customBudget: "",
    timeline: "",
    customTimeline: "",
    freeText: "",
  });
  const [showPlans, setShowPlans] = useState(false);
  const [generating, setGenerating] = useState(false);

  const totalSteps = 5;
  const progress = (step / totalSteps) * 100;

  const canProceed = () => {
    if (step === 1) return config.companySize && config.departments.length > 0;
    if (step === 2) return config.agentCount && (config.primaryUseCase && (config.primaryUseCase !== "Other (describe below)" || config.customUseCase));
    if (step === 3) return true; // integrations & compliance are optional
    if (step === 4) return config.budget && (config.budget !== "Other (specify below)" || config.customBudget);
    if (step === 5) return true; // free text is optional
    return true;
  };

  const handleGenerate = () => {
    setGenerating(true);
    // Simulate AI processing time for better UX
    setTimeout(() => {
      setGenerating(false);
      setShowPlans(true);
    }, 1800);
  };

  const plans = generatePlans(config);

  const stepLabels = ["Organization", "Automation Needs", "Integrations & Compliance", "Budget & Timeline", "Custom Requirements"];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 40px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Custom Build Configurator</h1>
          <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
            Tell us about your organization — including anything not on the list — and we will generate the right automation plan for you.
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
              <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8, flexWrap: "wrap", gap: 4 }}>
                {stepLabels.map((label, i) => (
                  <span key={label} style={{ fontSize: 11, color: step > i + 1 ? "#0d9488" : step === i + 1 ? "#111827" : "#9ca3af", fontWeight: step === i + 1 ? 700 : 400 }}>
                    {step > i + 1 ? "✓ " : ""}{label}
                  </span>
                ))}
              </div>
            </div>

            {/* Step Content */}
            <div style={{ background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, padding: 32 }}>

              {/* ── Step 1: Organization ── */}
              {step === 1 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Tell us about your organization</h2>
                  <SingleSelect
                    options={COMPANY_SIZES}
                    selected={config.companySize}
                    onChange={(v) => setConfig({ ...config, companySize: v })}
                    label="Company size"
                  />
                  <MultiSelect
                    options={DEPARTMENTS}
                    selected={config.departments}
                    onChange={(v) => setConfig({ ...config, departments: v })}
                    label="Which departments need automation? (select all that apply)"
                    customValue={config.customDepartment}
                    onCustomChange={(v) => setConfig({ ...config, customDepartment: v })}
                    customPlaceholder="e.g., R&D, Procurement, Field Operations, Franchise Management..."
                  />
                </div>
              )}

              {/* ── Step 2: Automation Needs ── */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>What do you want to automate?</h2>
                  <SingleSelect
                    options={AGENT_COUNTS}
                    selected={config.agentCount}
                    onChange={(v) => setConfig({ ...config, agentCount: v })}
                    label="How many AI agents do you need?"
                  />
                  <SingleSelect
                    options={USE_CASES}
                    selected={config.primaryUseCase}
                    onChange={(v) => setConfig({ ...config, primaryUseCase: v })}
                    label="Primary use case"
                    customValue={config.customUseCase}
                    onCustomChange={(v) => setConfig({ ...config, customUseCase: v })}
                    customPlaceholder="e.g., Automated compliance reporting, multi-step approval workflows, AI-driven forecasting..."
                  />
                </div>
              )}

              {/* ── Step 3: Integrations & Compliance ── */}
              {step === 3 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Integrations & compliance requirements</h2>
                  <MultiSelect
                    options={INTEGRATIONS}
                    selected={config.integrations}
                    onChange={(v) => setConfig({ ...config, integrations: v })}
                    label="Which tools do you need to connect? (optional)"
                    customValue={config.customIntegration}
                    onCustomChange={(v) => setConfig({ ...config, customIntegration: v })}
                    customPlaceholder="e.g., Oracle ERP, Netsuite, custom internal API, legacy system..."
                  />
                  <MultiSelect
                    options={COMPLIANCE_REQS}
                    selected={config.compliance}
                    onChange={(v) => setConfig({ ...config, compliance: v })}
                    label="Compliance requirements"
                    customValue={config.customCompliance}
                    onCustomChange={(v) => setConfig({ ...config, customCompliance: v })}
                    customPlaceholder="e.g., NIST 800-53, ITAR, state-specific regulations, internal audit requirements..."
                  />
                </div>
              )}

              {/* ── Step 4: Budget & Timeline ── */}
              {step === 4 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
                  <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: 0 }}>Budget & timeline</h2>
                  <SingleSelect
                    options={BUDGETS}
                    selected={config.budget}
                    onChange={(v) => setConfig({ ...config, budget: v })}
                    label="Monthly budget range"
                    customValue={config.customBudget}
                    onCustomChange={(v) => setConfig({ ...config, customBudget: v })}
                    customPlaceholder="e.g., $8,000/mo, annual contract preferred, project-based pricing..."
                  />
                  <SingleSelect
                    options={TIMELINES}
                    selected={config.timeline}
                    onChange={(v) => setConfig({ ...config, timeline: v })}
                    label="When do you want to go live?"
                    customValue={config.customTimeline}
                    onCustomChange={(v) => setConfig({ ...config, customTimeline: v })}
                    customPlaceholder="e.g., Before Q3 board review, after current system migration, phased over 6 months..."
                  />

                  {/* Summary */}
                  {config.budget && (
                    <div style={{ background: "#f0fdfa", border: "1px solid #99f6e4", borderRadius: 10, padding: 20 }}>
                      <h3 style={{ fontSize: 14, fontWeight: 700, color: "#0d9488", margin: "0 0 12px" }}>Your Configuration So Far</h3>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {[
                          ["Company size", config.companySize],
                          ["Departments", [...config.departments.filter(d => !d.startsWith("Other")), ...(config.customDepartment ? [config.customDepartment] : [])].join(", ") || "—"],
                          ["Agents needed", config.agentCount],
                          ["Primary use case", config.primaryUseCase === "Other (describe below)" ? config.customUseCase : config.primaryUseCase],
                          ["Integrations", [...config.integrations.filter(i => !i.startsWith("Other")), ...(config.customIntegration ? [config.customIntegration] : [])].join(", ") || "None selected"],
                          ["Compliance", [...config.compliance.filter(c => !c.startsWith("Other")), ...(config.customCompliance ? [config.customCompliance] : [])].join(", ") || "None"],
                          ["Budget", config.budget.startsWith("Other") ? config.customBudget : config.budget],
                          ["Timeline", config.timeline.startsWith("Other") ? config.customTimeline : config.timeline || "Flexible"],
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

              {/* ── Step 5: Custom Requirements (Free Text) ── */}
              {step === 5 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                  <div>
                    <h2 style={{ fontSize: 20, fontWeight: 700, color: "#111827", margin: "0 0 8px" }}>Anything else we should know?</h2>
                    <p style={{ fontSize: 14, color: "#6b7280", margin: 0, lineHeight: 1.6 }}>
                      This is your space to describe anything that doesn't fit the options above — unique workflows, specific technical constraints, industry nuances, regulatory edge cases, or exactly how you envision your AI workforce operating.
                      The more detail you provide, the more precisely we can tailor your build recommendation.
                    </p>
                  </div>

                  <div>
                    <label style={{ fontSize: 14, fontWeight: 600, color: "#374151", display: "block", marginBottom: 8 }}>
                      Describe your specific requirements <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional but recommended)</span>
                    </label>
                    <textarea
                      value={config.freeText}
                      onChange={(e) => setConfig({ ...config, freeText: e.target.value })}
                      rows={8}
                      placeholder={`Examples of what to include:
• "We need agents that can read incoming emails, extract invoice data, cross-reference our ERP, and flag discrepancies over $500 for human review"
• "Our compliance team requires every AI action to produce a timestamped audit trail exportable to PDF for our annual SOC 2 audit"
• "We're a franchise with 40 locations — each location needs its own agent but a central dashboard for the corporate team"
• "We want the AI to draft responses but never send without a human approving — especially for anything customer-facing"
• "Our current stack is Oracle + Salesforce + a custom Python data pipeline — we need all three connected"`}
                      style={{
                        width: "100%", padding: "14px 16px", borderRadius: 10, border: "1px solid #e5e7eb",
                        fontSize: 13, color: "#111827", lineHeight: 1.7, resize: "vertical",
                        outline: "none", boxSizing: "border-box", fontFamily: "inherit",
                        background: config.freeText ? "#fafffe" : "#fff",
                      }}
                      onFocus={(e) => { e.target.style.borderColor = "#0d9488"; }}
                      onBlur={(e) => { e.target.style.borderColor = "#e5e7eb"; }}
                    />
                    {config.freeText.length > 0 && (
                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: 6 }}>
                        <span style={{ fontSize: 12, color: "#0d9488" }}>
                          ✓ {config.freeText.split(/\s+/).filter(Boolean).length} words — your requirements will be factored into the plan
                        </span>
                        <span style={{ fontSize: 12, color: "#9ca3af" }}>{config.freeText.length} characters</span>
                      </div>
                    )}
                  </div>

                  {/* What the AI will do with this */}
                  <div style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, padding: 16 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>How your input shapes your plan:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                      {[
                        ["🏗️", "Custom department or team structure", "→ We configure agents specifically for your org chart"],
                        ["⚙️", "Unique automation workflow", "→ Your use case becomes the primary agent configuration"],
                        ["🔌", "Unlisted integration or legacy system", "→ Flagged for custom API development in Enterprise tier"],
                        ["📋", "Specific compliance or regulatory requirement", "→ Included in your compliance audit package"],
                        ["💰", "Specific budget or contract preference", "→ Matched to the closest plan or custom pricing"],
                      ].map(([icon, label, desc]) => (
                        <div key={label} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                          <span style={{ fontSize: 16 }}>{icon}</span>
                          <div>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>{label} </span>
                            <span style={{ fontSize: 13, color: "#6b7280" }}>{desc}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
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
                  disabled={generating}
                  style={{ padding: "12px 28px", borderRadius: 10, border: "none", background: generating ? "#99f6e4" : "#0d9488", color: "#fff", fontSize: 14, fontWeight: 700, cursor: generating ? "not-allowed" : "pointer", display: "flex", alignItems: "center", gap: 8 }}
                >
                  {generating ? (
                    <>
                      <span style={{ display: "inline-block", width: 14, height: 14, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", animation: "spin 0.8s linear infinite" }}></span>
                      Analyzing your requirements...
                    </>
                  ) : (
                    "Generate My Custom Plan →"
                  )}
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
                Based on your {config.companySize} organization
                {config.departments.length > 0 && `, ${[...config.departments.filter(d => !d.startsWith("Other")), ...(config.customDepartment ? [config.customDepartment] : [])].length} department${config.departments.length !== 1 ? "s" : ""}`}
                {config.freeText && ", and your custom requirements"} — here are your best options.
              </p>
              {config.freeText && (
                <div style={{ maxWidth: 600, margin: "16px auto 0", background: "#f5f3ff", border: "1px solid #ddd6fe", borderRadius: 10, padding: "12px 16px", textAlign: "left" }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#7c3aed", marginBottom: 4 }}>Your custom requirements were factored in:</div>
                  <div style={{ fontSize: 13, color: "#374151", lineHeight: 1.5 }}>"{config.freeText.slice(0, 200)}{config.freeText.length > 200 ? "..." : ""}"</div>
                </div>
              )}
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
                onClick={() => { setShowPlans(false); setStep(1); setConfig({ companySize: "", departments: [], customDepartment: "", agentCount: "", primaryUseCase: "", customUseCase: "", integrations: [], customIntegration: "", compliance: [], customCompliance: "", budget: "", customBudget: "", timeline: "", customTimeline: "", freeText: "" }); }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #e5e7eb", background: "#fff", color: "#374151", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                ← Start Over
              </button>
              <button
                onClick={() => { setShowPlans(false); setStep(5); }}
                style={{ padding: "12px 24px", borderRadius: 10, border: "1px solid #0d9488", background: "#f0fdfa", color: "#0d9488", fontSize: 14, fontWeight: 600, cursor: "pointer" }}
              >
                Adjust Requirements
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (max-width: 640px) {
          div[style*="padding: 32px 40px"] { padding: 20px 16px !important; }
          div[style*="padding: 20px 40px"] { padding: 16px !important; }
        }
      `}</style>
    </div>
  );
}
