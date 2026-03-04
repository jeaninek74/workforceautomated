import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot, Shield, BarChart3, Users, Zap, Lock, CheckCircle, ArrowRight,
  ChevronRight, Play, AlertTriangle, FileText, Eye, Database, Key,
  TrendingUp, Clock, Award, Quote, DollarSign, Cpu, Target
} from "lucide-react";

// ─── Data ────────────────────────────────────────────────────────────────────

const WHY_USE_IT = [
  {
    icon: DollarSign,
    color: "green",
    title: "Recover Revenue Lost to Manual Bottlenecks",
    desc: "Every hour your team spends on repetitive, rules-based work is an hour not spent on revenue-generating activity. WorkforceAutomated automates those processes end-to-end — so your people focus on decisions that move the business forward.",
  },
  {
    icon: TrendingUp,
    color: "blue",
    title: "Scale Operations Without Scaling Headcount",
    desc: "Handle 10x the workload with the same team. AI agents execute tasks in parallel, around the clock, without fatigue or error drift. Growth no longer requires proportional hiring.",
  },
  {
    icon: Target,
    color: "purple",
    title: "Eliminate Costly Compliance Failures",
    desc: "One compliance breach can cost millions. Every agent action is governed, logged, and auditable. Your risk exposure drops while your audit readiness goes up — automatically.",
  },
  {
    icon: Cpu,
    color: "orange",
    title: "Deploy AI Across Any Business Process",
    desc: "Not just job descriptions. Any documented work process — SOPs, runbooks, compliance checklists, workflows — becomes an AI agent. Finance, HR, operations, legal, customer success: every function can be automated.",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Document Your Process",
    desc: "Upload a job description, SOP, runbook, workflow doc, or compliance checklist. Any structured process works.",
    icon: FileText,
  },
  {
    step: "02",
    title: "AI Builds the Agent",
    desc: "Our LLM parses the document and generates a fully configured AI agent: capabilities, permissions, confidence thresholds, and escalation rules — in seconds.",
    icon: Bot,
  },
  {
    step: "03",
    title: "You Set the Guardrails",
    desc: "Define what the agent can do autonomously, what requires human approval, and what is permanently blocked. You stay in control.",
    icon: Shield,
  },
  {
    step: "04",
    title: "Agents Work. You Measure.",
    desc: "Agents execute tasks 24/7. Real-time dashboards surface performance, cost savings, risk events, and ROI. Every action is auditable.",
    icon: BarChart3,
  },
];

const GUARDRAILS = [
  {
    title: "Confidence Scoring",
    desc: "Every agent output carries a confidence score. Outputs below your threshold are held for human review — agents never act on uncertain data.",
    icon: TrendingUp,
    color: "blue",
  },
  {
    title: "Risk Classification",
    desc: "Actions are classified Low / Medium / High / Critical in real time. High-risk actions trigger automatic escalation before execution.",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    title: "Escalation Protocols",
    desc: "Define who gets notified, when, and how. Agents never exceed their authority without explicit human approval.",
    icon: Users,
    color: "purple",
  },
  {
    title: "Immutable Audit Logs",
    desc: "Every decision is cryptographically signed and stored. Tamper-proof logs are exportable for SOC 2, GDPR, and HIPAA audits.",
    icon: Lock,
    color: "green",
  },
];

const DEMO_STEPS = [
  { id: "input", label: "Process Document Input" },
  { id: "agent", label: "Agent Generated" },
  { id: "run", label: "Task Execution" },
  { id: "audit", label: "Audit Log" },
];

const DEMO_CONTENT: Record<string, { title: string; body: string; badge: string; badgeColor: string }> = {
  input: {
    title: "Process Document → Agent",
    badge: "Input",
    badgeColor: "bg-gray-700 text-gray-300",
    body: `Process: Quarterly Revenue Variance Analysis\nType: Financial SOP\n\nSteps:\n1. Pull Q3 revenue data from financial DB\n2. Compare against Q2 actuals and Q3 forecast\n3. Flag variances > 5% for review\n4. Escalate critical findings (>15%) to CFO\n5. Generate variance report for board pack\n\nAccess level: Read-only financial DB\nApprovals required: Any write or send action\nEscalation contact: CFO role`,
  },
  agent: {
    title: "Agent Configuration",
    badge: "Generated",
    badgeColor: "bg-blue-900 text-blue-300",
    body: `Agent: RevenueAnalysisAgent_v1\nProcess: Q3 Variance Analysis SOP\n\nCapabilities granted:\n  ✓ read_financial_db\n  ✓ generate_variance_report\n  ✓ send_escalation_alert\n  ✗ write_financial_db  [BLOCKED]\n  ✗ send_board_report   [REQUIRES APPROVAL]\n\nConfidence threshold: 85%\nRisk ceiling: HIGH → auto-escalate\nEscalation target: CFO role\nAudit: ALL actions logged + signed`,
  },
  run: {
    title: "Live Task Execution",
    badge: "Running",
    badgeColor: "bg-green-900 text-green-300",
    body: `[09:14:02] Task started: Q3 Revenue Analysis\n[09:14:03] Reading financial_db... ✓\n[09:14:05] Confidence: 94% — proceeding\n[09:14:06] Q3 Revenue: $4.2M | Forecast: $4.5M\n[09:14:07] Variance: -7.2%  → FLAGGED (>5%)\n[09:14:07] Risk level: HIGH\n[09:14:07] Escalating to CFO role...\n[09:14:08] Alert sent → sarah.chen@corp.com ✓\n[09:14:08] Report generation: PENDING APPROVAL\n[09:14:08] Audit entry written + signed ✓\n\nTime elapsed: 6 seconds\nHuman hours saved: ~3.5 hours`,
  },
  audit: {
    title: "Audit Log Entry",
    badge: "Logged",
    badgeColor: "bg-purple-900 text-purple-300",
    body: `{\n  "agent": "RevenueAnalysisAgent_v1",\n  "process": "Q3 Variance Analysis SOP",\n  "timestamp": "2026-03-04T09:14:08Z",\n  "confidence": 0.94,\n  "risk_level": "HIGH",\n  "action": "ESCALATED",\n  "escalated_to": "CFO",\n  "outcome": "PENDING_APPROVAL",\n  "human_hours_saved": 3.5,\n  "hash": "a3f9c2...d81e",\n  "tamper_proof": true\n}`,
  },
};

const USE_CASES = [
  { dept: "Finance", example: "Automate variance analysis, invoice processing, and financial close checklists." },
  { dept: "HR & People Ops", example: "Onboarding workflows, compliance training tracking, performance review cycles." },
  { dept: "Legal & Compliance", example: "Contract review checklists, regulatory filing workflows, audit preparation." },
  { dept: "Customer Success", example: "Escalation routing, renewal workflows, health score monitoring and alerts." },
  { dept: "Operations", example: "Supply chain exception handling, vendor SLA monitoring, incident response runbooks." },
  { dept: "IT & Security", example: "Access provisioning workflows, security incident response, change management SOPs." },
];

const TESTIMONIALS = [
  {
    quote: "We replaced three manual review processes with WorkforceAutomated agents. Audit prep that used to take two weeks now takes an afternoon. That's real money back in the business.",
    name: "Sarah Chen",
    title: "Chief Compliance Officer",
    company: "Meridian Financial",
    metric: "2 weeks → 1 afternoon",
  },
  {
    quote: "Our agents handle 80% of operational tasks autonomously. The other 20% go to the right human every time. We scaled from 50 to 200 clients without adding ops headcount.",
    name: "Marcus Webb",
    title: "VP of Operations",
    company: "Apex Logistics",
    metric: "4x client scale, same team",
  },
  {
    quote: "We passed our SOC 2 audit in record time. The immutable logs gave our auditors everything they needed. WorkforceAutomated paid for itself in the first audit cycle.",
    name: "Priya Nair",
    title: "Head of Engineering",
    company: "Vantage Health",
    metric: "SOC 2 audit cost cut by 60%",
  },
];

const DATA_PROTECTION = [
  { icon: Key, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit. Keys rotate automatically every 90 days." },
  { icon: Eye, title: "Zero Trust Access", desc: "Every request is authenticated and authorized. Agents only access what they're explicitly permitted to." },
  { icon: Database, title: "Data Residency", desc: "Choose your region: US, EU, or APAC. Data never leaves your selected region without written consent." },
  { icon: Shield, title: "SOC 2 Type II", desc: "Independently audited annually. Full report available to enterprise customers under NDA." },
  { icon: FileText, title: "GDPR & HIPAA Ready", desc: "Built-in data subject request handling, retention policies, and PHI isolation for healthcare." },
  { icon: Clock, title: "99.9% Uptime SLA", desc: "Enterprise SLA with financial penalties. Public status page and full incident history." },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Landing() {
  const [activeDemo, setActiveDemo] = useState<string>("input");

  return (
    <div className="min-h-screen bg-gray-950 text-white">

      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/90 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between h-14">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-blue-600 rounded-md flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-white">WorkforceAutomated</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-gray-400">
            <a href="#why" className="hover:text-white transition-colors">Why It Works</a>
            <a href="#how" className="hover:text-white transition-colors">How It Works</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors">Sign In</Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-1.5 rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-16 pb-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 rounded-full px-3 py-1 text-xs text-blue-300 mb-6">
              <Zap className="w-3 h-3" />
              Enterprise AI Workforce Operating System
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-5">
              Automate Any Work Process.<br />
              <span className="text-blue-400">Govern Every Action.</span><br />
              <span className="text-gray-300">Grow Without Limits.</span>
            </h1>
            <p className="text-lg text-gray-400 mb-4 leading-relaxed max-w-2xl">
              WorkforceAutomated turns your existing processes — job descriptions, SOPs, runbooks, compliance checklists, workflows — into governed AI agents that execute tasks, enforce rules, escalate intelligently, and log everything.
            </p>
            <p className="text-base text-gray-500 mb-8 max-w-2xl">
              The result: your team handles more work, your costs go down, your compliance risk drops, and your business scales without proportional headcount growth.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                Start Automating Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#demo" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" /> See a Live Demo
              </a>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-5 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> SOC 2 Type II certified</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> GDPR & HIPAA compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> Works with any documented process</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "10x", label: "More work, same team size" },
            { value: "70%", label: "Reduction in process costs" },
            { value: "<2s", label: "Agent response time" },
            { value: "100%", label: "Audit coverage on every action" },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Why Use It */}
      <section id="why" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Why Teams Choose WorkforceAutomated</h2>
            <p className="text-gray-400 max-w-xl">The business case is straightforward: more output, lower cost, less risk.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {WHY_USE_IT.map((w) => (
              <div key={w.title} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className={`w-10 h-10 rounded-lg bg-${w.color}-500/10 border border-${w.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <w.icon className={`w-5 h-5 text-${w.color}-400`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{w.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{w.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Use Cases */}
      <section className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Works Across Every Department</h2>
            <p className="text-gray-400">If it's a documented process, it can be an agent. Here's where teams are deploying today.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {USE_CASES.map((u) => (
              <div key={u.dept} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-blue-400 mb-1 uppercase tracking-wide">{u.dept}</div>
                <p className="text-xs text-gray-400 leading-relaxed">{u.example}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-gray-400">From any documented process to a governed AI agent — in four steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step) => (
              <div key={step.step} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xs font-mono text-gray-600">{step.step}</span>
                  <step.icon className="w-5 h-5 text-blue-400" />
                </div>
                <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardrails */}
      <section id="guardrails" className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Guardrails Built Into Every Agent</h2>
            <p className="text-gray-400 max-w-xl">AI that acts without oversight is a liability. Every WorkforceAutomated agent runs inside a governance framework you control.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
            {GUARDRAILS.map((g) => (
              <div key={g.title} className="flex gap-4 bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className={`w-10 h-10 rounded-lg bg-${g.color}-500/10 border border-${g.color}-500/20 flex items-center justify-center flex-shrink-0`}>
                  <g.icon className={`w-5 h-5 text-${g.color}-400`} />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">{g.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{g.desc}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Human-in-the-Loop by Design</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                  WorkforceAutomated is not a "set it and forget it" system. You define which actions agents handle autonomously, which require human approval, and which are permanently blocked. Agents operate within the authority you grant — nothing more, nothing less. This is how you get the efficiency of AI without the risk of unchecked automation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Demo */}
      <section id="demo" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">See It in Action</h2>
            <p className="text-gray-400">A financial SOP becomes a governed AI agent. Watch the full lifecycle.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
            <div className="flex flex-col gap-2">
              {DEMO_STEPS.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveDemo(step.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-colors text-sm ${
                    activeDemo === step.id
                      ? "bg-blue-600 text-white"
                      : "bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-gray-600"
                  }`}
                >
                  <ChevronRight className={`w-4 h-4 flex-shrink-0 transition-transform ${activeDemo === step.id ? "rotate-90" : ""}`} />
                  {step.label}
                </button>
              ))}
              <div className="mt-3 p-3 bg-gray-900 border border-gray-800 rounded-lg">
                <p className="text-xs text-gray-500 leading-relaxed">This example uses a financial variance analysis SOP. Any process document — HR onboarding, legal checklist, ops runbook — works the same way.</p>
              </div>
            </div>
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
                <span className="text-sm font-medium text-white">{DEMO_CONTENT[activeDemo].title}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEMO_CONTENT[activeDemo].badgeColor}`}>
                  {DEMO_CONTENT[activeDemo].badge}
                </span>
              </div>
              <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed overflow-auto whitespace-pre-wrap min-h-48">
                {DEMO_CONTENT[activeDemo].body}
              </pre>
            </div>
          </div>
          <div className="mt-5 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Try it with your own process document <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Real Results from Real Teams</h2>
            <p className="text-gray-400">Efficiency gains, cost savings, and compliance wins — measured and verified.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <div className="inline-block bg-blue-950/60 border border-blue-800/40 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {t.metric}
                </div>
                <Quote className="w-4 h-4 text-gray-600 mb-2" />
                <p className="text-sm text-gray-300 leading-relaxed mb-4">"{t.quote}"</p>
                <div>
                  <div className="text-sm font-semibold text-white">{t.name}</div>
                  <div className="text-xs text-gray-500">{t.title}, {t.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">The Full Platform</h2>
            <p className="text-gray-400">Everything from agent creation to governance, analytics, and compliance — in one system.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "Agent Builder", desc: "Convert any process document into a configured AI agent with capabilities, permissions, and escalation rules." },
              { icon: Users, title: "Multi-Agent Workflows", desc: "Compose agents into structured teams. Define execution order, data flow, and team-level governance." },
              { icon: BarChart3, title: "KPI & ROI Dashboards", desc: "Track agent performance, hours saved, cost reduction, and revenue impact in real time." },
              { icon: Lock, title: "Compliance Export", desc: "One-click audit reports formatted for SOC 2, GDPR, and HIPAA reviewers." },
              { icon: Zap, title: "Real-Time Execution Console", desc: "Monitor every agent action live. Intervene, pause, or override at any point." },
              { icon: Shield, title: "Governance Controls", desc: "Global and per-agent policies. Role-based access. Confidence floors. Risk ceilings. All configurable." },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <f.icon className="w-5 h-5 text-blue-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{f.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Protection */}
      <section id="security" className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Data Protection</h2>
            <p className="text-gray-400 max-w-xl">Your processes, your data, your control. Security is not an add-on — it's the foundation.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
            {DATA_PROTECTION.map((d) => (
              <div key={d.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <d.icon className="w-5 h-5 text-green-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{d.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">Our Commitments</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>We never train AI models on your process documents or business data.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>We never share your agent configurations or audit logs with third parties.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>We never move your data outside your selected region without written consent.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Pricing</h2>
            <p className="text-gray-400">Start free. Scale as your AI workforce grows. No credit card required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {[
              {
                name: "Starter", price: "$49", period: "/mo",
                desc: "For individuals and small teams getting started with process automation.",
                features: ["5 AI Agents", "Single agent execution", "Confidence scoring", "7-day audit logs", "Email support"],
                cta: "Start Free Trial", highlight: false,
              },
              {
                name: "Professional", price: "$149", period: "/mo",
                desc: "For teams running complex, multi-step workflows across departments.",
                features: ["25 AI Agents", "Multi-agent workflows", "Risk classification", "90-day audit logs", "Custom KPI dashboards", "Priority support"],
                cta: "Start Free Trial", highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "",
                desc: "For large organizations requiring full governance, compliance, and scale.",
                features: ["Unlimited agents", "Unlimited workflows", "Full governance controls", "Unlimited audit logs", "SSO / SAML", "Dedicated support", "Custom SLA"],
                cta: "Contact Sales", highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-xl p-6 border ${plan.highlight ? "bg-blue-600 border-blue-500" : "bg-gray-900 border-gray-800"}`}>
                {plan.highlight && (
                  <div className="text-xs font-medium bg-white/20 text-white px-2 py-0.5 rounded-full inline-block mb-3">Most Popular</div>
                )}
                <div className={`text-xs font-medium mb-1 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white">{plan.price}</span>
                  <span className={`text-sm ${plan.highlight ? "text-blue-200" : "text-gray-500"}`}>{plan.period}</span>
                </div>
                <p className={`text-xs mb-5 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.desc}</p>
                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-xs">
                      <CheckCircle className={`w-3.5 h-3.5 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                      <span className={plan.highlight ? "text-blue-50" : "text-gray-300"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to="/register"
                  className={`block text-center text-sm font-semibold py-2.5 rounded-lg transition-colors ${
                    plan.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-10 text-center">
            <h2 className="text-3xl font-bold text-white mb-3">Start Automating Your Workforce Today</h2>
            <p className="text-gray-400 mb-2 max-w-xl mx-auto text-sm">
              Every day you delay is another day of manual work, missed efficiency, and uncaptured revenue.
            </p>
            <p className="text-gray-500 mb-6 max-w-xl mx-auto text-sm">
              Set up your first agent in minutes. No credit card. No commitment.
            </p>
            <div className="flex items-center justify-center gap-3">
              <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors">
                Get Started Free <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="mailto:sales@workforceautomated.com" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors">
                Talk to Sales
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-blue-600 rounded flex items-center justify-center">
              <Bot className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-gray-400">WorkforceAutomated</span>
          </div>
          <div>© {new Date().getFullYear()} WorkforceAutomated. All rights reserved.</div>
          <div className="flex gap-5">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
