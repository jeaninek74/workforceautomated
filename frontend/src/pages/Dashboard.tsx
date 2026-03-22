import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import OnboardingBanner from "@/components/onboarding/OnboardingBanner";
import {
  Bot, Users, Play, Shield, TrendingUp, AlertTriangle,
  CheckCircle, Clock, ArrowRight, Plus, Zap, Activity, Settings2, Save
} from "lucide-react";
import { agentsApi, teamsApi, executionsApi, metricsApi, api } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalTeams: number;
  totalExecutions: number;
  avgConfidence: number;
  escalations: number;
}

function timeAgo(dateStr: string): string {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return days < 30 ? `${days}d ago` : new Date(dateStr).toLocaleDateString();
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    totalAgents: 0, activeAgents: 0, totalTeams: 0,
    totalExecutions: 0, avgConfidence: 0, escalations: 0,
  });
  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [monthlyUsage, setMonthlyUsage] = useState<{ count: number; limit: number | null; percentUsed: number; remaining: number | null; plan: string } | null>(null);
  const [outputPreferences, setOutputPreferences] = useState("");
  const [prefSaving, setPrefSaving] = useState(false);
  const [prefSaved, setPrefSaved] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [agentsRes, teamsRes, execRes, metricsRes, usageRes] = await Promise.all([
          agentsApi.list(),
          teamsApi.list(),
          executionsApi.list({ limit: 8 }),
          metricsApi.dashboard(),
          executionsApi.monthlyUsage(),
        ]);
        const agentList = agentsRes.data?.agents || [];
        setAgents(agentList);
        setStats({
          totalAgents: agentList.length,
          activeAgents: agentList.filter((a: any) => a.status === "active").length,
          totalTeams: teamsRes.data?.teams?.length || 0,
          totalExecutions: execRes.data?.total || 0,
          avgConfidence: metricsRes.data?.avgConfidence || 0,
          escalations: metricsRes.data?.escalations || 0,
        });
        setRecentExecutions(execRes.data?.executions || []);
        // Real monthly count from dedicated backend endpoint
        if (usageRes.data) {
          setMonthlyUsage(usageRes.data);
        }
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  // Load output preferences
  useEffect(() => {
    api.get("/output-preferences")
      .then((r) => setOutputPreferences(r.data?.outputPreferences || ""))
      .catch(() => {});
  }, []);

  const saveOutputPreferences = useCallback(async () => {
    setPrefSaving(true);
    try {
      await api.put("/output-preferences", { outputPreferences });
      setPrefSaved(true);
      setTimeout(() => setPrefSaved(false), 2500);
    } catch (_) {}
    setPrefSaving(false);
  }, [outputPreferences]);

  const statusColor: Record<string, string> = {
    completed: "text-emerald-400 bg-emerald-950/50",
    success: "text-emerald-400 bg-emerald-950/50",
    running: "text-blue-400 bg-blue-950/50",
    failed: "text-red-400 bg-red-950/50",
    escalated: "text-orange-400 bg-orange-950/50",
    pending: "text-gray-400 bg-gray-800",
  };

  // Parse agent name for display
  const agentFirstName = (name: string) => name?.split(" — ")[0] || name;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your AI workforce at a glance</p>
        </div>
        <Link
          to="/agents/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      <OnboardingBanner />

      {/* Stats Row */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-20" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: "Total Agents", value: stats.totalAgents, sub: `${stats.activeAgents} active`, icon: Bot, color: "blue" },
            { label: "Teams", value: stats.totalTeams, sub: "Multi-agent", icon: Users, color: "purple" },
            { label: "Executions", value: stats.totalExecutions, sub: "All time", icon: Play, color: "green" },
            { label: "Avg Confidence", value: `${Math.round(stats.avgConfidence)}%`, sub: "All agents", icon: TrendingUp, color: "yellow" },
            { label: "Escalations", value: stats.escalations, sub: "Pending review", icon: AlertTriangle, color: "orange" },
            { label: "Audit Coverage", value: "100%", sub: "Immutable logs", icon: Shield, color: "teal" },
          ].map((card) => (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-gray-500">{card.label}</span>
                <card.icon className={`w-3.5 h-3.5 text-${card.color}-400`} />
              </div>
              <div className="text-xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-600 mt-0.5">{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* ── Monthly Execution Usage Meter (real live count from backend) ── */}
      {!loading && (() => {
        const usage = monthlyUsage;
        const count = usage?.count ?? 0;
        const limit = usage?.limit ?? null;
        const pct = usage?.percentUsed ?? 0;
        const remaining = usage?.remaining ?? null;
        const planLabel = usage?.plan === "enterprise" ? "Enterprise" : usage?.plan === "professional" ? "Professional" : "Starter";
        const barColor = pct >= 90 ? "bg-red-500" : pct >= 70 ? "bg-yellow-500" : "bg-emerald-500";
        return (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Play className="w-4 h-4 text-green-400" />
                <h2 className="font-semibold text-white text-sm">Executions This Month</h2>
                <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Live</span>
              </div>
              <Link to="/billing" className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                {planLabel} plan <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="flex items-end justify-between mb-2">
              <span className="text-3xl font-bold text-white">{count.toLocaleString()}</span>
              <span className="text-sm text-gray-500">{limit ? `of ${limit.toLocaleString()} included` : "Unlimited"}</span>
            </div>
            {limit ? (
              <>
                <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${barColor}`} style={{ width: `${pct}%` }} />
                </div>
                <div className="flex justify-between mt-1">
                  <span className="text-xs text-gray-600">{pct.toFixed(1)}% used</span>
                  <span className="text-xs text-gray-600">{(remaining ?? 0).toLocaleString()} remaining</span>
                </div>
                {pct >= 80 && (
                  <div className="mt-2 text-xs text-yellow-400 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Approaching your monthly limit — <Link to="/billing" className="underline hover:text-yellow-300">upgrade your plan</Link>
                  </div>
                )}
              </>
            ) : (
              <div className="text-xs text-emerald-400 mt-1">No execution limits on Enterprise</div>
            )}
          </div>
        );
      })()}

      {/* ── Operational Health ── */}
      {!loading && stats.totalExecutions > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <h2 className="font-semibold text-white text-sm">Operational Health</h2>
              <span className="text-xs text-gray-500 bg-gray-800 px-2 py-0.5 rounded-full">Live</span>
            </div>
            <Link to="/metrics" className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
              Full analytics <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Success Rate</div>
              <div className="text-2xl font-bold text-emerald-400">
                {`${Math.round(((stats.totalExecutions - stats.escalations) / stats.totalExecutions) * 100)}%`}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">Tasks without escalation</div>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${Math.round(((stats.totalExecutions - stats.escalations) / stats.totalExecutions) * 100)}%` }} />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Avg AI Confidence</div>
              <div className={`text-2xl font-bold ${stats.avgConfidence >= 80 ? "text-emerald-400" : stats.avgConfidence >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                {`${Math.round(stats.avgConfidence)}%`}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">Across all executions</div>
              <div className="mt-2 h-1.5 bg-gray-700 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${stats.avgConfidence >= 80 ? "bg-emerald-500" : stats.avgConfidence >= 60 ? "bg-yellow-500" : "bg-red-500"}`} style={{ width: `${Math.min(stats.avgConfidence, 100)}%` }} />
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Escalation Rate</div>
              <div className={`text-2xl font-bold ${(stats.escalations / stats.totalExecutions) < 0.1 ? "text-emerald-400" : (stats.escalations / stats.totalExecutions) < 0.25 ? "text-yellow-400" : "text-red-400"}`}>
                {`${Math.round((stats.escalations / stats.totalExecutions) * 100)}%`}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">{stats.escalations} tasks need review</div>
              <div className="mt-2">
                {stats.escalations === 0 ? (
                  <span className="text-xs text-emerald-400 flex items-center gap-1"><CheckCircle className="w-3 h-3" /> All clear</span>
                ) : (
                  <Link to="/governance" className="text-xs text-orange-400 hover:text-orange-300 flex items-center gap-1 transition-colors">
                    <AlertTriangle className="w-3 h-3" /> Review now
                  </Link>
                )}
              </div>
            </div>
            <div className="bg-gray-800/50 rounded-lg p-3">
              <div className="text-xs text-gray-500 mb-1">Est. Hours Saved</div>
              <div className="text-2xl font-bold text-blue-400">
                {`${(stats.totalExecutions * 0.25).toFixed(0)}h`}
              </div>
              <div className="text-xs text-gray-600 mt-0.5">~15 min saved per task</div>
              <div className="mt-2">
                <span className="text-xs text-gray-500">≈ ${(stats.totalExecutions * 0.25 * 35).toFixed(0)} labor cost saved</span>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Run Panel */}
        <div className="lg:col-span-1">
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gray-900/50 border-b border-gray-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-yellow-400" />
                Quick Run
              </h2>
              <Link to="/agents" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                All agents
              </Link>
            </div>

            {loading ? (
              <div className="p-4 space-y-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-12 bg-gray-900 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : agents.length === 0 ? (
              <div className="p-8 text-center">
                <Bot className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-400 mb-1">No agents yet</p>
                <p className="text-xs text-gray-600 mb-4">Build your first AI agent to get started</p>
                <Link
                  to="/agents/new"
                  className="inline-flex items-center gap-1.5 text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Build Agent
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {agents.slice(0, 6).map((agent) => (
                  <div key={agent.id} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900/40 transition-colors group">
                    <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">{agentFirstName(agent.name)}</div>
                      <div className="text-xs text-gray-500 truncate">{agent.role}</div>
                    </div>
                    <Link
                      to={`/agents/${agent.id}/run`}
                      className="flex items-center gap-1 text-xs text-blue-400 hover:text-white bg-blue-600/10 hover:bg-blue-600 px-2.5 py-1.5 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </Link>
                  </div>
                ))}
                {agents.length > 6 && (
                  <div className="px-4 py-3">
                    <Link to="/agents" className="text-xs text-gray-500 hover:text-blue-400 transition-colors">
                      +{agents.length - 6} more agents →
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Quick Actions */}
            <div className="border-t border-gray-800 divide-y divide-gray-800/60">
              <Link to="/agents/new" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900/40 transition-colors group">
                <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Plus className="w-3.5 h-3.5 text-blue-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Build New Agent</div>
                  <div className="text-xs text-gray-500">From job description or template</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors" />
              </Link>
              <Link to="/teams/new" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-900/40 transition-colors group">
                <div className="w-8 h-8 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-3.5 h-3.5 text-purple-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-medium text-white">Create Team</div>
                  <div className="text-xs text-gray-500">Multi-agent workflows</div>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-purple-400 transition-colors" />
              </Link>
            </div>
          </div>
        </div>

        {/* Recent Executions */}
        <div className="lg:col-span-2">
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gray-900/50 border-b border-gray-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Recent Executions
              </h2>
              <Link to="/executions" className="text-xs text-gray-500 hover:text-blue-400 flex items-center gap-1 transition-colors">
                View all <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            {loading ? (
              <div className="divide-y divide-gray-800">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="px-5 py-4 animate-pulse">
                    <div className="h-4 bg-gray-800 rounded w-1/3 mb-2" />
                    <div className="h-3 bg-gray-800 rounded w-1/2" />
                  </div>
                ))}
              </div>
            ) : recentExecutions.length === 0 ? (
              <div className="px-5 py-14 text-center">
                <Play className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No executions yet</p>
                <p className="text-gray-600 text-xs mt-1">Run an agent to see results here</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {recentExecutions.map((exec) => (
                  <div key={exec.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-gray-900/30 transition-colors">
                    <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Bot className="w-3.5 h-3.5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-white truncate">
                        {agentFirstName(exec.agentName) || `Agent #${exec.agentId}`}
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-0.5">
                        {exec.input ? exec.input.slice(0, 60) + (exec.input.length > 60 ? "…" : "") : "No task description"}
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      {exec.confidenceScore != null && (
                        <span className={`text-xs font-medium ${
                          (exec.confidenceScore <= 1 ? exec.confidenceScore * 100 : exec.confidenceScore) >= 80
                            ? "text-emerald-400"
                            : (exec.confidenceScore <= 1 ? exec.confidenceScore * 100 : exec.confidenceScore) >= 60
                            ? "text-yellow-400"
                            : "text-red-400"
                        }`}>
                          {Math.round(exec.confidenceScore <= 1 ? exec.confidenceScore * 100 : exec.confidenceScore)}%
                        </span>
                      )}
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusColor[exec.status] || statusColor.pending}`}>
                        {exec.status}
                      </span>
                      <span className="text-xs text-gray-600 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {timeAgo(exec.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Compliance & Security quick links */}
          <div className="grid grid-cols-2 gap-3 mt-3">
            <Link to="/audit" className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-green-700 rounded-xl p-4 group transition-colors">
              <div className="w-9 h-9 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <Shield className="w-4 h-4 text-green-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Audit Logs</div>
                <div className="text-xs text-gray-500">Compliance history</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-green-400 transition-colors ml-auto" />
            </Link>
            <Link to="/governance" className="flex items-center gap-3 bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-xl p-4 group transition-colors">
              <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-4 h-4 text-blue-400" />
              </div>
              <div>
                <div className="text-sm font-medium text-white">Governance</div>
                <div className="text-xs text-gray-500">Review queue</div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-blue-400 transition-colors ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Output Preferences ── */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Settings2 className="w-4 h-4 text-purple-400" />
            <h2 className="font-semibold text-white text-sm">Output Preferences</h2>
          </div>
          <button
            onClick={saveOutputPreferences}
            disabled={prefSaving}
            className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white disabled:opacity-50"
          >
            <Save className="w-3.5 h-3.5" />
            {prefSaving ? "Saving…" : prefSaved ? "Saved!" : "Save"}
          </button>
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Describe exactly how you want your agent outputs formatted. This preference is applied to every execution automatically — no character limit.
        </p>
        <textarea
          value={outputPreferences}
          onChange={(e) => setOutputPreferences(e.target.value)}
          placeholder={`Examples:\n• Always respond in bullet points with a 1-sentence executive summary at the top\n• Use a formal business tone, avoid jargon, and include a recommended next action at the end\n• Format all outputs as a structured report with sections: Summary, Key Findings, Risks, Recommendations\n• Keep responses concise — no more than 300 words unless the task requires detail`}
          rows={7}
          className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-purple-500 resize-y leading-relaxed"
        />
        {prefSaved && (
          <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
            <CheckCircle className="w-3.5 h-3.5" /> Preferences saved — all future executions will follow these instructions.
          </p>
        )}
      </div>
    </div>
  );
}
