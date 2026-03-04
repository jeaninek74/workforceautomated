import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Bot, Shield, BarChart3, Users, Zap, Lock, CheckCircle, ArrowRight,
  ChevronRight, Play, AlertTriangle, FileText, Eye, Database, Key,
  TrendingUp, Clock, Award, Quote
} from "lucide-react";

const HOW_IT_WORKS = [
  {
    step: "01",
    title: "Paste a Job Description",
    desc: "Upload or paste any existing job description. Our LLM parses roles, responsibilities, permissions, and risk levels automatically.",
    icon: FileText,
  },
  {
    step: "02",
    title: "Agent is Configured",
    desc: "WorkforceAutomated generates a fully configured AI agent: capabilities, confidence thresholds, escalation rules, and audit settings — ready in seconds.",
    icon: Bot,
  },
  {
    step: "03",
    title: "Set Governance Rules",
    desc: "Define what the agent can and cannot do. Set confidence floors, risk ceilings, human-in-the-loop triggers, and compliance policies.",
    icon: Shield,
  },
  {
    step: "04",
    title: "Deploy & Monitor",
    desc: "Agents execute tasks in real time. Every action is scored, classified, and logged. Dashboards surface performance, anomalies, and ROI instantly.",
    icon: BarChart3,
  },
];

const GUARDRAILS = [
  {
    title: "Confidence Scoring",
    desc: "Every agent output carries a confidence score (0–100). Outputs below your threshold are held for human review before any action is taken.",
    icon: TrendingUp,
    color: "blue",
  },
  {
    title: "Risk Classification",
    desc: "Actions are classified Low / Medium / High / Critical in real time. High-risk actions trigger automatic escalation to a human supervisor.",
    icon: AlertTriangle,
    color: "orange",
  },
  {
    title: "Escalation Protocols",
    desc: "Define exactly who gets notified, when, and through which channel. Agents never exceed their authority without explicit human approval.",
    icon: Users,
    color: "purple",
  },
  {
    title: "Immutable Audit Logs",
    desc: "Every decision, action, and escalation is cryptographically signed and stored. Tamper-proof logs are exportable for SOC 2, GDPR, and HIPAA audits.",
    icon: Lock,
    color: "green",
  },
];

const DEMO_STEPS = [
  { id: "input", label: "Job Description Input", content: "Paste JD" },
  { id: "agent", label: "Agent Generated", content: "Agent Config" },
  { id: "run", label: "Task Execution", content: "Live Run" },
  { id: "audit", label: "Audit Log", content: "Log Entry" },
];

const DEMO_CONTENT: Record<string, { title: string; body: string; badge: string; badgeColor: string }> = {
  input: {
    title: "Job Description → Agent",
    badge: "Input",
    badgeColor: "bg-gray-700 text-gray-300",
    body: `Role: Senior Financial Analyst\n\nResponsibilities:\n• Analyze quarterly revenue data\n• Generate variance reports\n• Flag anomalies > 5% deviation\n• Escalate critical findings to CFO\n\nAccess: Read-only to financial DB\nApprovals required: Any write action`,
  },
  agent: {
    title: "Agent Configuration",
    badge: "Generated",
    badgeColor: "bg-blue-900 text-blue-300",
    body: `Agent: FinancialAnalystAgent_v1\n\nCapabilities:\n  ✓ read_financial_db\n  ✓ generate_variance_report\n  ✗ write_financial_db (blocked)\n\nConfidence threshold: 85%\nRisk ceiling: HIGH → escalate\nEscalation target: CFO role\nAudit: ALL actions logged`,
  },
  run: {
    title: "Live Task Execution",
    badge: "Running",
    badgeColor: "bg-green-900 text-green-300",
    body: `[09:14:02] Task: Q3 Revenue Analysis\n[09:14:03] Reading financial_db... ✓\n[09:14:05] Confidence: 94% — proceeding\n[09:14:07] Variance detected: -7.2% (FLAGGED)\n[09:14:07] Risk: HIGH — escalating to CFO\n[09:14:08] Escalation sent → sarah.chen@corp.com\n[09:14:08] Action held pending approval\n[09:14:08] Audit entry written ✓`,
  },
  audit: {
    title: "Audit Log Entry",
    badge: "Logged",
    badgeColor: "bg-purple-900 text-purple-300",
    body: `{\n  "agent": "FinancialAnalystAgent_v1",\n  "task": "Q3 Revenue Analysis",\n  "timestamp": "2026-03-04T09:14:08Z",\n  "confidence": 0.94,\n  "risk_level": "HIGH",\n  "action": "ESCALATED",\n  "escalated_to": "CFO",\n  "outcome": "PENDING_APPROVAL",\n  "hash": "a3f9c2...d81e"\n}`,
  },
};

const TESTIMONIALS = [
  {
    quote: "We replaced three manual review processes with WorkforceAutomated agents. Audit prep that used to take two weeks now takes an afternoon.",
    name: "Sarah Chen",
    title: "Chief Compliance Officer",
    company: "Meridian Financial",
  },
  {
    quote: "The confidence scoring and escalation system is exactly what we needed. Our agents handle 80% of tasks autonomously — the other 20% go to the right human every time.",
    name: "Marcus Webb",
    title: "VP of Operations",
    company: "Apex Logistics",
  },
  {
    quote: "We passed our SOC 2 audit in record time. The immutable logs gave our auditors everything they needed without us lifting a finger.",
    name: "Priya Nair",
    title: "Head of Engineering",
    company: "Vantage Health",
  },
];

const DATA_PROTECTION = [
  { icon: Key, title: "AES-256 Encryption", desc: "All data encrypted at rest and in transit. Keys are rotated automatically on a 90-day cycle." },
  { icon: Eye, title: "Zero Trust Access", desc: "Every request is authenticated and authorized. No implicit trust — agents only access what they're explicitly permitted to." },
  { icon: Database, title: "Data Residency", desc: "Choose your data region: US, EU, or APAC. Data never leaves your selected region without explicit consent." },
  { icon: Shield, title: "SOC 2 Type II", desc: "Independently audited annually. Full report available to enterprise customers under NDA." },
  { icon: FileText, title: "GDPR & HIPAA Ready", desc: "Built-in data subject request handling, retention policies, and PHI isolation for healthcare customers." },
  { icon: Clock, title: "99.9% Uptime SLA", desc: "Enterprise SLA with financial penalties. Status page and incident history publicly available." },
];

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
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#guardrails" className="hover:text-white transition-colors">Guardrails</a>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white px-3 py-1.5 transition-colors">
              Sign In
            </Link>
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
              Turn Job Descriptions Into<br />
              <span className="text-blue-400">Governed AI Agents</span>
            </h1>
            <p className="text-lg text-gray-400 mb-8 leading-relaxed max-w-2xl">
              Paste a job description. Get a fully configured AI agent with confidence scoring, risk controls, escalation rules, and tamper-proof audit logs — all governed by your compliance policies.
            </p>
            <div className="flex items-center gap-3">
              <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white font-semibold px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                Start Building Agents <ArrowRight className="w-4 h-4" />
              </Link>
              <a href="#demo" className="border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-6 py-3 rounded-lg text-sm transition-colors flex items-center gap-2">
                <Play className="w-4 h-4" /> See a Live Demo
              </a>
            </div>
            <div className="mt-8 flex items-center gap-6 text-xs text-gray-500">
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> No credit card required</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> SOC 2 Type II</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> GDPR compliant</span>
              <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-green-500" /> HIPAA ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section className="border-b border-gray-800 bg-gray-900/40">
        <div className="max-w-6xl mx-auto px-6 py-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "10x", label: "Faster task execution" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "<2s", label: "Avg agent response" },
            { value: "100%", label: "Audit coverage" },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <div className="text-2xl font-bold text-white">{s.value}</div>
              <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">How It Works</h2>
            <p className="text-gray-400">From job description to governed AI agent in four steps.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && (
                  <div className="hidden lg:block absolute top-6 left-full w-full h-px bg-gray-800 z-0" style={{ width: "calc(100% - 3rem)", left: "calc(100% - 0.5rem)" }} />
                )}
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-mono text-gray-600">{step.step}</span>
                    <step.icon className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-sm font-semibold text-white mb-2">{step.title}</h3>
                  <p className="text-xs text-gray-400 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guardrails */}
      <section id="guardrails" className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-white mb-2">Built-In Guardrails</h2>
            <p className="text-gray-400 max-w-xl">AI agents are powerful — and that power requires control. Every agent runs inside a governance framework you define.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
          <div className="mt-8 bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0">
                <Award className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-white mb-1">Human-in-the-Loop by Default</h3>
                <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
                  WorkforceAutomated is not a "set it and forget it" system. Every agent has configurable human checkpoints. You decide which actions require approval, which are fully autonomous, and which are permanently blocked. Agents operate within the authority you grant — nothing more.
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
            <p className="text-gray-400">Walk through a real agent lifecycle — from job description to audit log.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Step selector */}
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
            </div>
            {/* Content pane */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800 bg-gray-950">
                <span className="text-sm font-medium text-white">{DEMO_CONTENT[activeDemo].title}</span>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DEMO_CONTENT[activeDemo].badgeColor}`}>
                  {DEMO_CONTENT[activeDemo].badge}
                </span>
              </div>
              <pre className="p-5 text-xs text-gray-300 font-mono leading-relaxed overflow-auto whitespace-pre-wrap">
                {DEMO_CONTENT[activeDemo].body}
              </pre>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link to="/register" className="inline-flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 transition-colors">
              Try it with your own job description <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 border-b border-gray-800 bg-gray-900/30">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">What Teams Are Saying</h2>
            <p className="text-gray-400">From compliance teams to operations leaders — real results from real deployments.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t) => (
              <div key={t.name} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <Quote className="w-5 h-5 text-blue-500 mb-3" />
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

      {/* Features grid */}
      <section id="features" className="py-20 border-b border-gray-800">
        <div className="max-w-6xl mx-auto px-6">
          <div className="mb-10">
            <h2 className="text-3xl font-bold text-white mb-2">Everything You Need</h2>
            <p className="text-gray-400">From agent creation to governance — built for enterprise scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "AI Agent Builder", desc: "Convert any job description into a configured agent with capabilities, permissions, and escalation rules." },
              { icon: Users, title: "Multi-Agent Teams", desc: "Compose agents into structured workflows with defined execution order and team-level governance." },
              { icon: BarChart3, title: "KPI Dashboards", desc: "Custom KPI tracking, predictive analytics, and executive reporting. Measure ROI in real time." },
              { icon: Lock, title: "Compliance Export", desc: "One-click export of audit reports formatted for SOC 2, GDPR, and HIPAA reviewers." },
              { icon: Zap, title: "Real-Time Execution", desc: "Agents execute tasks with sub-2-second response times. Monitor live in the execution console." },
              { icon: Shield, title: "Role-Based Access", desc: "Fine-grained permissions for every team member. Agents only see what they're authorized to access." },
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
            <p className="text-gray-400 max-w-xl">Your data is yours. We built the security model around that principle from day one.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            {DATA_PROTECTION.map((d) => (
              <div key={d.title} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
                <d.icon className="w-5 h-5 text-green-400 mb-3" />
                <h3 className="text-sm font-semibold text-white mb-1">{d.title}</h3>
                <p className="text-xs text-gray-400 leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-white mb-3">What We Never Do</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-gray-400">
              <div className="flex items-start gap-2">
                <span className="text-red-400 font-bold mt-0.5">✗</span>
                <span>We never train AI models on your data or job descriptions.</span>
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
            <p className="text-gray-400">Start free. No credit card required.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl">
            {[
              {
                name: "Starter", price: "$49", period: "/mo",
                desc: "For individuals and small teams",
                features: ["5 AI Agents", "Single agent execution", "Confidence scoring", "7-day audit logs", "Email support"],
                cta: "Start Free Trial", highlight: false,
              },
              {
                name: "Professional", price: "$149", period: "/mo",
                desc: "For teams with complex workflows",
                features: ["25 AI Agents", "Multi-agent workflows", "Risk classification", "90-day audit logs", "Custom KPI dashboards", "Priority support"],
                cta: "Start Free Trial", highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "",
                desc: "Full governance for large orgs",
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
            <h2 className="text-3xl font-bold text-white mb-3">Ready to Build Your AI Workforce?</h2>
            <p className="text-gray-400 mb-6 max-w-xl mx-auto text-sm">
              Join enterprises automating operations with governed AI agents. Start free — no credit card, no commitment.
            </p>
            <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-3 rounded-lg text-sm transition-colors">
              Get Started Free <ArrowRight className="w-4 h-4" />
            </Link>
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
