import { useState } from "react";
import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";

const INDUSTRIES = [
  {
    emoji: "💰",
    dept: "Finance & Accounting",
    category: "Finance",
    task: "Automate invoice reconciliation, variance analysis, month-end close reporting, budget forecasting, expense flagging, and cash flow monitoring. Agents process financial data and produce structured reports with full audit trails.",
    agents: ["Invoice Reviewer", "Variance Analyst", "Budget Forecaster"],
    useCases: ["Invoice reconciliation in under 20 minutes", "Automated variance reports with anomaly flags", "Month-end close checklist automation", "Budget vs. actual analysis with drill-down"],
  },
  {
    emoji: "🚚",
    dept: "Supply Chain & Logistics",
    category: "Operations",
    task: "Monitor inventory levels, flag supply disruptions, generate procurement recommendations, track vendor performance, and produce logistics exception reports automatically.",
    agents: ["Inventory Monitor", "Vendor Performance Analyst", "Procurement Advisor"],
    useCases: ["Real-time inventory level alerts", "Vendor scorecard generation", "Procurement recommendation reports", "Disruption impact analysis"],
  },
  {
    emoji: "📜",
    dept: "Contracts & Legal",
    category: "Legal",
    task: "Review contracts for missing clauses, flag compliance risks, track renewal deadlines, summarize legal documents, and generate redline recommendations — without replacing legal counsel.",
    agents: ["Contract Reviewer", "Compliance Checker", "Deadline Tracker"],
    useCases: ["Contract risk flagging in minutes", "Clause-by-clause compliance review", "Renewal deadline alerts", "Legal document summarization"],
  },
  {
    emoji: "📊",
    dept: "Analytics & Data",
    category: "Analytics",
    task: "Generate data quality reports, produce executive dashboards, identify statistical anomalies, summarize dataset trends, and translate raw data into structured business insights.",
    agents: ["Data Quality Auditor", "Trend Analyst", "Dashboard Generator"],
    useCases: ["Automated data quality scoring", "Weekly trend summary reports", "Anomaly detection with context", "Executive dashboard narrative generation"],
  },
  {
    emoji: "📣",
    dept: "Marketing",
    category: "Marketing",
    task: "Produce campaign performance reports, generate content briefs, analyze competitor positioning, score leads by engagement, and draft marketing copy for review.",
    agents: ["Campaign Analyst", "Content Strategist", "Lead Scorer"],
    useCases: ["Weekly campaign performance summaries", "Content brief generation from briefs", "Competitor analysis reports", "Lead scoring and prioritization"],
  },
  {
    emoji: "🗂️",
    dept: "Project Management",
    category: "Operations",
    task: "Generate status reports, flag at-risk milestones, produce stakeholder updates, track action item completion, and summarize project health across multiple workstreams.",
    agents: ["Status Report Generator", "Risk Flagging Agent", "Stakeholder Update Writer"],
    useCases: ["Automated weekly status reports", "At-risk milestone alerts", "Action item tracking summaries", "Multi-project health dashboards"],
  },
  {
    emoji: "🎯",
    dept: "Program Management",
    category: "Operations",
    task: "Coordinate across multiple projects, produce portfolio-level reporting, track interdependencies, flag resource conflicts, and generate executive program summaries.",
    agents: ["Portfolio Analyst", "Dependency Tracker", "Executive Summary Writer"],
    useCases: ["Portfolio-level status reporting", "Cross-project dependency mapping", "Resource conflict identification", "Executive program briefings"],
  },
  {
    emoji: "👥",
    dept: "Human Resources",
    category: "HR",
    task: "Screen job applications against role criteria, generate onboarding checklists, produce HR compliance reports, analyze engagement survey data, and draft policy documents.",
    agents: ["Application Screener", "Onboarding Coordinator", "Engagement Analyst"],
    useCases: ["Resume screening against job criteria", "Automated onboarding checklists", "Engagement survey analysis", "HR policy document drafting"],
  },
  {
    emoji: "💼",
    dept: "Sales & Revenue",
    category: "Sales",
    task: "Score and prioritize leads, generate account research briefs, produce pipeline health reports, draft follow-up emails for review, and analyze win/loss patterns.",
    agents: ["Lead Scorer", "Account Researcher", "Pipeline Analyst"],
    useCases: ["Lead scoring and prioritization", "Account research briefs before calls", "Pipeline health reporting", "Win/loss analysis"],
  },
  {
    emoji: "🎧",
    dept: "Customer Support",
    category: "Support",
    task: "Classify and route support tickets, draft response suggestions for agent review, identify escalation patterns, generate CSAT analysis reports, and produce knowledge base articles.",
    agents: ["Ticket Classifier", "Response Drafter", "CSAT Analyst"],
    useCases: ["Ticket classification and routing", "Response draft suggestions", "Escalation pattern analysis", "Knowledge base article generation"],
  },
  {
    emoji: "💻",
    dept: "IT Tasks & Helpdesk",
    category: "IT",
    task: "Triage IT helpdesk tickets, generate incident reports, produce system health summaries, draft runbooks, analyze error logs, and create change management documentation.",
    agents: ["Helpdesk Triage Agent", "Incident Reporter", "Runbook Generator"],
    useCases: ["Helpdesk ticket triage and routing", "Incident report generation", "System health summaries", "Change management documentation"],
  },
  {
    emoji: "🔐",
    dept: "Cybersecurity",
    category: "IT",
    task: "Triage SIEM alerts, analyze vulnerabilities, produce SOC 2 gap assessments, write incident response playbooks, review cloud IAM policies, and generate board-level security reports.",
    agents: ["SOC Analyst", "Vulnerability Analyst", "Compliance Specialist"],
    useCases: ["SIEM alert triage and prioritization", "Vulnerability assessment reports", "SOC 2 gap analysis", "Incident response playbook generation"],
  },
  {
    emoji: "🌐",
    dept: "Networking & Infrastructure",
    category: "IT",
    task: "Monitor network health, generate NOC reports, analyze bandwidth utilization, produce infrastructure change documentation, and create cloud architecture review summaries.",
    agents: ["NOC Analyst", "Network Engineer Advisor", "Cloud Network Architect"],
    useCases: ["Network health monitoring reports", "Bandwidth utilization analysis", "Infrastructure change documentation", "Cloud architecture review summaries"],
  },
  {
    emoji: "💵",
    dept: "Payroll & Compensation",
    category: "Finance",
    task: "Audit payroll runs for anomalies, generate compensation benchmarking reports, produce payroll compliance summaries, flag discrepancies, and create pay equity analysis reports.",
    agents: ["Payroll Processor", "Payroll Compliance Specialist", "Compensation Analyst"],
    useCases: ["Payroll anomaly detection", "Compensation benchmarking reports", "Pay equity analysis", "Payroll compliance summaries"],
  },
  {
    emoji: "🏥",
    dept: "Healthcare & Clinical",
    category: "Healthcare",
    task: "Generate clinical quality reports, analyze denial patterns, produce HIPAA risk assessments, create patient communication drafts, analyze readmission rates, and manage revenue cycle performance.",
    agents: ["Clinical Documentation Specialist", "Revenue Cycle Analyst", "Healthcare Compliance Officer"],
    useCases: ["Clinical quality reporting", "Denial pattern analysis", "HIPAA risk assessments", "Revenue cycle performance monitoring"],
  },
  {
    emoji: "🏠",
    dept: "Real Estate",
    category: "Real Estate",
    task: "Generate property analysis reports, produce lease review summaries, track portfolio performance, analyze market comparables, and create due diligence checklists.",
    agents: ["Property Analyst", "Lease Reviewer", "Portfolio Monitor"],
    useCases: ["Property analysis reports", "Lease review and risk flagging", "Portfolio performance tracking", "Market comparable analysis"],
  },
  {
    emoji: "🏭",
    dept: "Manufacturing & Operations",
    category: "Operations",
    task: "Monitor production KPIs, generate quality control reports, analyze equipment downtime patterns, produce shift handover summaries, and create maintenance scheduling recommendations.",
    agents: ["Production Monitor", "Quality Control Analyst", "Maintenance Scheduler"],
    useCases: ["Production KPI monitoring", "Quality control reporting", "Equipment downtime analysis", "Maintenance scheduling recommendations"],
  },
  {
    emoji: "🛒",
    dept: "Procurement & Sourcing",
    category: "Operations",
    task: "Analyze vendor bids, generate RFP response summaries, produce spend analysis reports, track contract compliance, and create supplier risk assessments.",
    agents: ["Vendor Bid Analyst", "Spend Analyst", "Supplier Risk Assessor"],
    useCases: ["Vendor bid analysis and comparison", "Spend analysis reports", "Contract compliance tracking", "Supplier risk assessments"],
  },
  {
    emoji: "🎓",
    dept: "Education & Training",
    category: "Education",
    task: "Generate course content outlines, produce learner performance reports, create assessment rubrics, analyze training completion data, and draft learning objective documentation.",
    agents: ["Curriculum Designer", "Performance Analyst", "Assessment Creator"],
    useCases: ["Course content outline generation", "Learner performance reporting", "Assessment rubric creation", "Training completion analysis"],
  },
  {
    emoji: "🛡️",
    dept: "Insurance",
    category: "Insurance",
    task: "Process claims documentation, generate underwriting summaries, produce risk assessment reports, analyze claims patterns, and create policy compliance checklists.",
    agents: ["Claims Processor", "Underwriting Analyst", "Risk Assessor"],
    useCases: ["Claims documentation processing", "Underwriting summary generation", "Risk assessment reports", "Claims pattern analysis"],
  },
  {
    emoji: "🤝",
    dept: "Consulting & Professional Services",
    category: "Consulting",
    task: "Generate client deliverable drafts, produce engagement status reports, create methodology documentation, analyze project profitability, and draft proposal sections.",
    agents: ["Deliverable Drafter", "Engagement Analyst", "Proposal Writer"],
    useCases: ["Client deliverable drafting", "Engagement status reporting", "Methodology documentation", "Proposal section generation"],
  },
  {
    emoji: "👔",
    dept: "C-Level & Executive",
    category: "Executive",
    task: "Produce board-ready reports, generate strategic intelligence briefings, create executive summaries from operational data, draft investor communications, and synthesize cross-departmental performance.",
    agents: ["Chief of Staff Agent", "Board Reporting Specialist", "Strategic Intelligence Advisor"],
    useCases: ["Board report generation", "Strategic intelligence briefings", "Cross-departmental performance synthesis", "Investor communication drafting"],
  },
];

const CATEGORIES = ["All", ...new Set(INDUSTRIES.map((i) => i.category))];

export default function IndustriesPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const filtered = activeCategory === "All" ? INDUSTRIES : INDUSTRIES.filter((i) => i.category === activeCategory);

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
          <Link to="/industries" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }}>Industries</Link>
          <Link to="/security-overview" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Security</Link>
          <Link to="/#pricing" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Pricing</Link>
        </div>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }}>Sign in</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: "72px 48px 48px", maxWidth: 900, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 7, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, borderRadius: 20, padding: "5px 13px", marginBottom: 22 }}>
          <span style={{ fontSize: 12, color: TEAL, fontWeight: 600 }}>22 Industries</span>
        </div>
        <h1 style={{ fontSize: 48, fontWeight: 800, lineHeight: 1.12, color: DARK, margin: "0 0 18px", letterSpacing: "-0.02em" }}>
          Built for your department.<br />
          <span style={{ color: TEAL }}>Ready on day one.</span>
        </h1>
        <p style={{ fontSize: 18, color: GRAY_TEXT, lineHeight: 1.65, margin: "0 0 12px", maxWidth: 620 }}>
          Every industry configuration includes pre-built agent templates, domain-specific system prompts, and output formats tuned for real workflows — not generic demos.
        </p>
      </section>

      {/* Category filter */}
      <div style={{ borderTop: DIVIDER, borderBottom: DIVIDER, padding: "0 48px" }}>
        <div style={{ maxWidth: 900, margin: "0 auto", display: "flex", gap: 8, overflowX: "auto", padding: "12px 0", flexWrap: "wrap" }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                fontSize: 13, fontWeight: 600, padding: "5px 14px", borderRadius: 20, cursor: "pointer", border: "none",
                background: activeCategory === cat ? TEAL : "#f3f4f6",
                color: activeCategory === cat ? "#fff" : GRAY_TEXT,
                whiteSpace: "nowrap",
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Industries list */}
      <section style={{ padding: "32px 48px 72px", maxWidth: 900, margin: "0 auto" }}>
        <div>
          {filtered.map((ind) => (
            <div key={ind.dept} style={{ padding: "32px 0", borderTop: DIVIDER }}>
              <div style={{ display: "grid", gridTemplateColumns: "32px 1fr", gap: 20 }}>
                <span style={{ fontSize: 22, paddingTop: 2 }}>{ind.emoji}</span>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
                    <h2 style={{ fontSize: 17, fontWeight: 700, color: DARK, margin: 0 }}>{ind.dept}</h2>
                    <span style={{ fontSize: 11, fontWeight: 600, color: TEAL, background: TEAL_LIGHT, border: `1px solid ${TEAL_BORDER}`, padding: "2px 8px", borderRadius: 20 }}>{ind.category}</span>
                  </div>
                  <p style={{ fontSize: 15, color: GRAY_TEXT, margin: "0 0 16px", lineHeight: 1.65 }}>{ind.task}</p>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 12 }}>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Pre-built agents</p>
                      {ind.agents.map((a) => (
                        <div key={a} style={{ fontSize: 13, color: "#374151", padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>{a}</div>
                      ))}
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 700, color: DARK, textTransform: "uppercase", letterSpacing: "0.05em", margin: "0 0 8px" }}>Common use cases</p>
                      {ind.useCases.map((u) => (
                        <div key={u} style={{ fontSize: 13, color: "#374151", padding: "3px 0", borderBottom: "1px solid #f3f4f6" }}>✓ {u}</div>
                      ))}
                    </div>
                  </div>
                  <Link to="/register" style={{ fontSize: 13, color: TEAL, fontWeight: 600, textDecoration: "none" }}>Deploy {ind.dept} agent →</Link>
                </div>
              </div>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: TEAL, padding: "72px 48px", textAlign: "center" }}>
        <h2 style={{ fontSize: 32, fontWeight: 800, color: "#fff", margin: "0 0 12px" }}>Your industry is already configured.</h2>
        <p style={{ fontSize: 16, color: "#ccfbf1", margin: "0 0 28px" }}>Start a free trial — your first agent is running in under 5 minutes.</p>
        <Link to="/register" style={{ background: "#fff", color: TEAL, fontWeight: 700, fontSize: 15, padding: "12px 26px", borderRadius: 8, textDecoration: "none", display: "inline-block" }}>Start free trial</Link>
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
