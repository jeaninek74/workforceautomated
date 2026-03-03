import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getLoginUrl } from "@/const";
import { Link } from "wouter";
import {
  Bot, Shield, Zap, BarChart3, FileText, Users, CheckCircle,
  ArrowRight, ChevronRight, Lock, Activity, AlertTriangle,
  Cpu, Network, GitBranch, Eye, Star
} from "lucide-react";

const FEATURES = [
  { icon: Bot, title: "Job Description to Agent", description: "Paste any job description and our AI instantly translates it into a fully configured, governed AI agent ready for deployment.", color: "text-violet-400", bg: "bg-violet-400/10" },
  { icon: Network, title: "Multi-Agent Workflows", description: "Orchestrate complex business processes with structured agent workflows. Define execution order, data flow, and inter-agent communication.", color: "text-cyan-400", bg: "bg-cyan-400/10" },
  { icon: Shield, title: "Enterprise Governance", description: "Every agent action is governed by configurable confidence thresholds, risk classifications, and escalation policies.", color: "text-emerald-400", bg: "bg-emerald-400/10" },
  { icon: Activity, title: "Confidence Scoring", description: "Real-time confidence scoring and risk classification on every execution. Automatically escalate to human review when thresholds are exceeded.", color: "text-amber-400", bg: "bg-amber-400/10" },
  { icon: FileText, title: "Immutable Audit Logs", description: "Every agent action, execution, and escalation is permanently logged with full traceability for compliance and regulatory requirements.", color: "text-blue-400", bg: "bg-blue-400/10" },
  { icon: Lock, title: "Permission Controls", description: "Granular permission controls at the agent, workflow, and organization level. Enforce least-privilege access across your AI workforce.", color: "text-rose-400", bg: "bg-rose-400/10" },
];

const STATS = [
  { value: "99.9%", label: "Uptime SLA" },
  { value: "< 200ms", label: "Avg. Response Time" },
  { value: "SOC 2", label: "Compliance Ready" },
  { value: "10x", label: "Faster Deployment" },
];

const PLANS = [
  { name: "Starter", price: "$49", period: "/month", description: "For individuals exploring AI workforce automation", features: ["Up to 5 AI agents", "500 executions per month", "Single agent execution", "Confidence scoring", "Basic audit logging (30 days)", "Email support"], cta: "Start Free Trial", highlighted: false },
  { name: "Professional", price: "$149", period: "/month", description: "For teams needing advanced workflows and governance", features: ["Up to 25 AI agents", "5,000 executions per month", "Multi-agent team workflows", "Advanced risk monitoring", "Governance threshold controls", "Escalation management", "Audit logging (90 days)", "Priority support"], cta: "Start Free Trial", highlighted: true },
  { name: "Enterprise", price: "$499", period: "/month", description: "For organizations requiring unlimited scale and compliance", features: ["Unlimited AI agents", "Unlimited executions", "Full governance suite", "Immutable audit logs (365 days)", "SSO & access controls", "Exportable compliance reports", "Dedicated account manager", "SLA guarantee"], cta: "Contact Sales", highlighted: false },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Define Your Agent", description: "Upload a job description or manually configure your AI agent with specific roles, capabilities, and permission boundaries." },
  { step: "02", title: "Set Governance Rules", description: "Configure confidence thresholds, risk classifications, and escalation policies to ensure every action meets your standards." },
  { step: "03", title: "Execute & Monitor", description: "Run agents individually or in coordinated workflows. Monitor real-time confidence scores and intervene when needed." },
  { step: "04", title: "Audit & Comply", description: "Access immutable audit logs for every action. Export compliance reports for regulatory requirements." },
];

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="container flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Cpu className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-lg tracking-tight">WorkforceAutomated</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-foreground transition-colors">How It Works</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm">Go to Dashboard <ArrowRight className="w-4 h-4 ml-1" /></Button>
              </Link>
            ) : (
              <>
                <a href={getLoginUrl()}><Button variant="ghost" size="sm">Sign In</Button></a>
                <a href={getLoginUrl()}><Button size="sm" className="glow-primary">Get Started <ArrowRight className="w-4 h-4 ml-1" /></Button></a>
              </>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-24 overflow-hidden animated-gradient">
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: "linear-gradient(oklch(0.96 0.005 240) 1px, transparent 1px), linear-gradient(90deg, oklch(0.96 0.005 240) 1px, transparent 1px)", backgroundSize: "60px 60px" }} />
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: "oklch(0.62 0.22 264)" }} />
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 rounded-full opacity-8 blur-3xl" style={{ background: "oklch(0.70 0.18 180)" }} />
        <div className="container relative text-center">
          <Badge variant="secondary" className="mb-6 px-4 py-1.5 text-xs font-medium border border-primary/30 bg-primary/10 text-primary">
            <Zap className="w-3 h-3 mr-1.5" />Enterprise AI Workforce Operating System
          </Badge>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.05]">
            Your AI Workforce,{" "}<span className="gradient-text">Governed & Ready</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed">
            Convert job descriptions into governed AI agents in seconds. Run individual agents or coordinated multi-agent workflows with enterprise-grade confidence scoring, risk classification, and immutable audit logging.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <a href={getLoginUrl()}><Button size="lg" className="px-8 h-12 text-base glow-primary">Start Building Agents <ArrowRight className="w-5 h-5 ml-2" /></Button></a>
            <a href="#how-it-works"><Button size="lg" variant="outline" className="px-8 h-12 text-base">See How It Works</Button></a>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {STATS.map((stat) => (
              <div key={stat.label} className="glass-card p-4 text-center">
                <div className="text-2xl font-bold text-primary mb-1">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-border bg-secondary text-secondary-foreground">Platform Capabilities</Badge>
            <h2 className="text-4xl font-bold mb-4">Everything you need to govern AI at scale</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A complete operating system for your AI workforce — from agent creation to compliance reporting.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className="bg-card border-border/50 hover:border-primary/30 transition-all duration-300 hover:-translate-y-1">
                  <CardHeader className="pb-3">
                    <div className={`w-10 h-10 rounded-lg ${feature.bg} flex items-center justify-center mb-3`}>
                      <Icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <CardTitle className="text-base font-semibold">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent><p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p></CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-24 border-t border-border/50 bg-secondary/20">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-border bg-secondary text-secondary-foreground">Workflow</Badge>
            <h2 className="text-4xl font-bold mb-4">From job description to governed agent in minutes</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">A streamlined four-step process to deploy, govern, and audit your AI workforce.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="relative">
                {i < HOW_IT_WORKS.length - 1 && <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-gradient-to-r from-border to-transparent z-0" />}
                <Card className="bg-card border-border/50 relative z-10">
                  <CardContent className="pt-6">
                    <div className="text-4xl font-bold text-primary/20 mb-3 font-mono">{step.step}</div>
                    <h3 className="font-semibold mb-2">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 border-t border-border/50">
        <div className="container">
          <div className="text-center mb-16">
            <Badge variant="secondary" className="mb-4 border border-border bg-secondary text-secondary-foreground">Pricing</Badge>
            <h2 className="text-4xl font-bold mb-4">Simple, transparent pricing</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">Start free, scale as your AI workforce grows. No hidden fees, no per-seat surprises.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {PLANS.map((plan) => (
              <Card key={plan.name} className={`relative flex flex-col ${plan.highlighted ? "border-primary/60 bg-primary/5 glow-primary" : "border-border/50 bg-card"}`}>
                {plan.highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-3 py-1"><Star className="w-3 h-3 mr-1" /> Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="pb-4">
                  <CardTitle className="text-xl">{plan.name}</CardTitle>
                  <p className="text-sm text-muted-foreground">{plan.description}</p>
                  <div className="flex items-baseline gap-1 mt-2">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground text-sm">{plan.period}</span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col flex-1">
                  <ul className="space-y-3 mb-6 flex-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <a href={getLoginUrl()}>
                    <Button className="w-full" variant={plan.highlighted ? "default" : "outline"}>{plan.cta} <ChevronRight className="w-4 h-4 ml-1" /></Button>
                  </a>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 border-t border-border/50">
        <div className="container">
          <div className="relative rounded-2xl overflow-hidden border border-primary/20 bg-primary/5 p-12 text-center">
            <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "linear-gradient(oklch(0.62 0.22 264) 1px, transparent 1px), linear-gradient(90deg, oklch(0.62 0.22 264) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
            <div className="relative">
              <h2 className="text-4xl font-bold mb-4">Ready to automate your workforce?</h2>
              <p className="text-muted-foreground mb-8 max-w-lg mx-auto">Join forward-thinking enterprises deploying governed AI agents at scale. Start your free trial today.</p>
              <a href={getLoginUrl()}><Button size="lg" className="px-10 h-12 text-base glow-primary">Start Free Trial <ArrowRight className="w-5 h-5 ml-2" /></Button></a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 py-8">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-primary flex items-center justify-center"><Cpu className="w-3.5 h-3.5 text-primary-foreground" /></div>
            <span className="font-medium text-foreground">WorkforceAutomated</span>
            <span>— Enterprise AI Workforce Operating System</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <span>© 2026 WorkforceAutomated.com</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
