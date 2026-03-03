import { Link } from "react-router-dom";
import { Bot, Shield, BarChart3, Users, Zap, Lock, CheckCircle, ArrowRight, Star } from "lucide-react";

export default function Landing() {
  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Nav */}
      <nav className="border-b border-gray-800 bg-gray-950/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WorkforceAutomated</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#security" className="hover:text-white transition-colors">Security</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm text-gray-400 hover:text-white transition-colors px-4 py-2">
              Sign In
            </Link>
            <Link to="/register" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
              Get Started Free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden pt-20 pb-32">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-950/30 via-gray-950 to-purple-950/20" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-blue-600/10 rounded-full blur-3xl" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-blue-950/60 border border-blue-800/50 rounded-full px-4 py-1.5 text-sm text-blue-300 mb-8">
            <Zap className="w-3.5 h-3.5" />
            Enterprise AI Workforce Operating System
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-tight mb-6">
            Turn Job Descriptions<br />
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Into Governed AI Agents
            </span>
          </h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            WorkforceAutomated converts your existing job descriptions into intelligent AI agents with built-in confidence scoring, risk classification, escalation protocols, and immutable audit logs — all governed by your compliance rules.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-center gap-2">
              Start Building Agents
              <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#features" className="w-full sm:w-auto border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-medium px-8 py-4 rounded-xl text-lg transition-colors text-center">
              See How It Works
            </a>
          </div>
          <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500">
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> No credit card required</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> SOC 2 compliant</div>
            <div className="flex items-center gap-1.5"><CheckCircle className="w-4 h-4 text-green-500" /> GDPR ready</div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-y border-gray-800 bg-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "10x", label: "Faster Task Execution" },
            { value: "99.9%", label: "Uptime SLA" },
            { value: "<2s", label: "Avg Response Time" },
            { value: "100%", label: "Audit Coverage" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
              <div className="text-sm text-gray-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Everything You Need to Run an AI Workforce</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">From agent creation to governance, every feature is built for enterprise compliance and scale.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Bot, title: "AI Agent Builder", desc: "Paste a job description and our LLM converts it into a fully configured AI agent with capabilities, permissions, and escalation rules.", color: "blue" },
              { icon: Users, title: "Multi-Agent Teams", desc: "Compose agents into structured workflows. Define execution order, data flow, and team-level governance rules for complex business processes.", color: "purple" },
              { icon: Shield, title: "Confidence Scoring", desc: "Every agent action is scored for confidence. Low-confidence outputs are automatically flagged for human review before execution.", color: "green" },
              { icon: BarChart3, title: "Risk Classification", desc: "Real-time risk classification (Low/Medium/High/Critical) with configurable thresholds and automatic escalation to human supervisors.", color: "orange" },
              { icon: Lock, title: "Immutable Audit Logs", desc: "Every agent action, decision, and escalation is cryptographically logged. Export compliance reports for SOC 2, GDPR, and HIPAA audits.", color: "red" },
              { icon: Zap, title: "KPI & Analytics", desc: "Custom KPI dashboards, predictive analytics, and executive reporting. Track agent performance, cost savings, and ROI in real time.", color: "yellow" },
            ].map((f) => (
              <div key={f.title} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-600 transition-colors group">
                <div className={`w-12 h-12 rounded-xl bg-${f.color}-500/10 border border-${f.color}-500/20 flex items-center justify-center mb-4`}>
                  <f.icon className={`w-6 h-6 text-${f.color}-400`} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{f.title}</h3>
                <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 bg-gray-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Simple, Transparent Pricing</h2>
            <p className="text-gray-400 text-lg">Start free. Scale as your AI workforce grows.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                name: "Starter", price: "$49", period: "/mo", desc: "For individuals and small teams",
                features: ["5 AI Agents", "Single agent execution", "Basic confidence scoring", "7-day audit logs", "Email support"],
                cta: "Start Free Trial", highlight: false,
              },
              {
                name: "Professional", price: "$149", period: "/mo", desc: "For growing teams with complex workflows",
                features: ["25 AI Agents", "Multi-agent team workflows", "Advanced risk classification", "90-day audit logs", "Custom KPI dashboards", "Priority support"],
                cta: "Start Free Trial", highlight: true,
              },
              {
                name: "Enterprise", price: "Custom", period: "", desc: "For large organizations requiring full governance",
                features: ["Unlimited AI Agents", "Unlimited team workflows", "Full governance controls", "Unlimited audit logs", "SSO / SAML", "Dedicated support", "Custom SLA"],
                cta: "Contact Sales", highlight: false,
              },
            ].map((plan) => (
              <div key={plan.name} className={`rounded-2xl p-8 border ${plan.highlight ? "bg-blue-600 border-blue-500 shadow-xl shadow-blue-500/20" : "bg-gray-900 border-gray-800"}`}>
                {plan.highlight && (
                  <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-full mb-4">
                    <Star className="w-3 h-3" /> Most Popular
                  </div>
                )}
                <div className={`text-sm font-medium mb-1 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.name}</div>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold text-white">{plan.price}</span>
                  <span className={plan.highlight ? "text-blue-200" : "text-gray-500"}>{plan.period}</span>
                </div>
                <p className={`text-sm mb-6 ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>{plan.desc}</p>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                      <span className={plan.highlight ? "text-blue-50" : "text-gray-300"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link to="/register" className={`block text-center font-semibold py-3 rounded-xl transition-colors ${plan.highlight ? "bg-white text-blue-600 hover:bg-blue-50" : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section id="security" className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 border border-gray-700 rounded-3xl p-12 text-center">
            <Lock className="w-12 h-12 text-blue-400 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-4">Enterprise-Grade Security & Compliance</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto mb-8">
              Every deployment is SOC 2 Type II compliant, GDPR ready, and HIPAA capable. All data is encrypted at rest and in transit. Immutable audit logs ensure complete accountability.
            </p>
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-400">
              {["SOC 2 Type II", "GDPR Compliant", "HIPAA Ready", "ISO 27001", "AES-256 Encryption", "Zero Trust Architecture"].map((badge) => (
                <div key={badge} className="flex items-center gap-2 bg-gray-800 border border-gray-700 rounded-full px-4 py-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {badge}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-gradient-to-r from-blue-950/50 to-purple-950/50">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">Ready to Build Your AI Workforce?</h2>
          <p className="text-gray-400 text-lg mb-8">Join forward-thinking enterprises automating their operations with governed AI agents.</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-all hover:shadow-lg hover:shadow-blue-500/25">
            Get Started Free
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-blue-600 rounded flex items-center justify-center">
              <Bot className="w-4 h-4 text-white" />
            </div>
            <span className="font-medium text-gray-400">WorkforceAutomated</span>
          </div>
          <div>© {new Date().getFullYear()} WorkforceAutomated. All rights reserved.</div>
          <div className="flex gap-6">
            <a href="#" className="hover:text-gray-300 transition-colors">Privacy</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Terms</a>
            <a href="#" className="hover:text-gray-300 transition-colors">Security</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
