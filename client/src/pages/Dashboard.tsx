import { useAuth } from "@/_core/hooks/useAuth";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Bot, Users, Play, AlertTriangle, TrendingUp, Shield, Plus, ArrowRight, Activity, CheckCircle, XCircle, Clock } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

function RiskBadge({ level }: { level?: string | null }) {
  const colors: Record<string, string> = { low: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30", medium: "bg-amber-500/20 text-amber-400 border-amber-500/30", high: "bg-orange-500/20 text-orange-400 border-orange-500/30", critical: "bg-red-500/20 text-red-400 border-red-500/30" };
  const c = colors[level ?? "low"] ?? colors.low;
  return <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${c}`}>{level ?? "low"}</span>;
}

function StatusIcon({ status }: { status?: string | null }) {
  if (status === "completed") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
  if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
  if (status === "escalated") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
  return <Clock className="w-4 h-4 text-blue-400" />;
}

export default function Dashboard() {
  const { data: stats, isLoading } = trpc.dashboard.stats.useQuery();

  const statCards = [
    { label: "Total Agents", value: stats?.totalAgents ?? 0, sub: `${stats?.activeAgents ?? 0} active`, icon: Bot, color: "text-violet-400", bg: "bg-violet-400/10" },
    { label: "Agent Teams", value: stats?.totalTeams ?? 0, sub: "Multi-agent workflows", icon: Users, color: "text-cyan-400", bg: "bg-cyan-400/10" },
    { label: "Total Executions", value: stats?.totalExecutions ?? 0, sub: `${stats?.completedExecutions ?? 0} completed`, icon: Play, color: "text-emerald-400", bg: "bg-emerald-400/10" },
    { label: "Escalations", value: stats?.escalatedExecutions ?? 0, sub: "Require human review", icon: AlertTriangle, color: "text-amber-400", bg: "bg-amber-400/10" },
    { label: "Avg Confidence", value: `${((stats?.avgConfidenceScore ?? 0) * 100).toFixed(1)}%`, sub: "Across all executions", icon: TrendingUp, color: "text-blue-400", bg: "bg-blue-400/10" },
    { label: "Governance", value: "Active", sub: "All policies enforced", icon: Shield, color: "text-emerald-400", bg: "bg-emerald-400/10" },
  ];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground text-sm mt-1">AI Workforce Overview</p>
          </div>
          <div className="flex gap-3">
            <Link href="/agents/new"><Button size="sm"><Plus className="w-4 h-4 mr-1" />New Agent</Button></Link>
            <Link href="/teams/new"><Button size="sm" variant="outline"><Plus className="w-4 h-4 mr-1" />New Team</Button></Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {statCards.map((card) => {
            const Icon = card.icon;
            return (
              <Card key={card.label} className="bg-card border-border/50">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">{card.label}</p>
                      <p className="text-2xl font-bold">{isLoading ? "—" : card.value}</p>
                      <p className="text-xs text-muted-foreground mt-1">{card.sub}</p>
                    </div>
                    <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${card.color}`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Risk Breakdown */}
        {stats?.riskBreakdown && (
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Risk Distribution</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-3">
                {[
                  { label: "Low", value: stats.riskBreakdown.low, color: "text-emerald-400", bar: "bg-emerald-400" },
                  { label: "Medium", value: stats.riskBreakdown.medium, color: "text-amber-400", bar: "bg-amber-400" },
                  { label: "High", value: stats.riskBreakdown.high, color: "text-orange-400", bar: "bg-orange-400" },
                  { label: "Critical", value: stats.riskBreakdown.critical, color: "text-red-400", bar: "bg-red-400" },
                ].map((r) => (
                  <div key={r.label} className="text-center">
                    <div className={`text-xl font-bold ${r.color}`}>{r.value}</div>
                    <div className="text-xs text-muted-foreground">{r.label}</div>
                    <div className="mt-1 h-1 rounded-full bg-secondary overflow-hidden">
                      <div className={`h-full ${r.bar} rounded-full`} style={{ width: `${Math.min(100, (r.value / Math.max(1, stats.totalExecutions)) * 100)}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent Executions */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Executions</CardTitle>
              <Link href="/executions"><Button variant="ghost" size="sm" className="text-xs h-7">View all <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {!stats?.recentExecutions?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">No executions yet. <Link href="/agents" className="text-primary">Run an agent</Link></p>
              ) : (
                <div className="space-y-2">
                  {stats.recentExecutions.map((exec: any) => (
                    <div key={exec.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <StatusIcon status={exec.status} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{exec.type === "team" ? "Team Workflow" : "Agent Execution"}</p>
                        <p className="text-xs text-muted-foreground">{new Date(exec.createdAt).toLocaleString()}</p>
                      </div>
                      {exec.riskLevel && <RiskBadge level={exec.riskLevel} />}
                      {exec.confidenceScore != null && <span className="text-xs text-muted-foreground">{(exec.confidenceScore * 100).toFixed(0)}%</span>}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Audit Logs */}
          <Card className="bg-card border-border/50">
            <CardHeader className="pb-3 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Recent Audit Activity</CardTitle>
              <Link href="/audit"><Button variant="ghost" size="sm" className="text-xs h-7">View all <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
            </CardHeader>
            <CardContent>
              {!stats?.recentAuditLogs?.length ? (
                <p className="text-sm text-muted-foreground text-center py-4">No audit events yet.</p>
              ) : (
                <div className="space-y-2">
                  {stats.recentAuditLogs.map((log: any) => (
                    <div key={log.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/50 transition-colors">
                      <Activity className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate">{log.action}</p>
                        <p className="text-xs text-muted-foreground">{new Date(log.createdAt).toLocaleString()}</p>
                      </div>
                      <Badge variant="secondary" className="text-xs shrink-0">{log.category}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="bg-card border-border/50">
          <CardHeader className="pb-3"><CardTitle className="text-sm font-medium">Quick Actions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Build Agent from JD", href: "/agents/new", icon: Bot, desc: "AI-powered setup" },
                { label: "Create Team Workflow", href: "/teams/new", icon: Users, desc: "Multi-agent flow" },
                { label: "View Risk Monitor", href: "/monitor", icon: Activity, desc: "Confidence trends" },
                { label: "Export Audit Report", href: "/audit", icon: Shield, desc: "Compliance logs" },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link key={action.label} href={action.href}>
                    <div className="p-3 rounded-lg border border-border/50 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                      <Icon className="w-5 h-5 text-primary mb-2" />
                      <p className="text-sm font-medium">{action.label}</p>
                      <p className="text-xs text-muted-foreground">{action.desc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
