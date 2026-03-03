import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Users, Play, Shield, TrendingUp, AlertTriangle, CheckCircle, Clock, ArrowRight, Plus } from "lucide-react";
import { agentsApi, teamsApi, executionsApi, metricsApi } from "../lib/api";

interface Stats {
  totalAgents: number;
  activeAgents: number;
  totalTeams: number;
  totalExecutions: number;
  avgConfidence: number;
  escalations: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats>({ totalAgents: 0, activeAgents: 0, totalTeams: 0, totalExecutions: 0, avgConfidence: 0, escalations: 0 });
  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [agentsRes, teamsRes, execRes, metricsRes] = await Promise.all([
          agentsApi.list(),
          teamsApi.list(),
          executionsApi.list({ limit: 5 }),
          metricsApi.dashboard(),
        ]);
        const agents = agentsRes.data?.agents || [];
        setStats({
          totalAgents: agents.length,
          activeAgents: agents.filter((a: any) => a.status === "active").length,
          totalTeams: teamsRes.data?.teams?.length || 0,
          totalExecutions: execRes.data?.total || 0,
          avgConfidence: metricsRes.data?.avgConfidence || 0,
          escalations: metricsRes.data?.escalations || 0,
        });
        setRecentExecutions(execRes.data?.executions || []);
      } catch (_) {}
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { label: "Total Agents", value: stats.totalAgents, sub: `${stats.activeAgents} active`, icon: Bot, color: "blue" },
    { label: "Agent Teams", value: stats.totalTeams, sub: "Multi-agent workflows", icon: Users, color: "purple" },
    { label: "Executions", value: stats.totalExecutions, sub: "All time", icon: Play, color: "green" },
    { label: "Avg Confidence", value: `${Math.round(stats.avgConfidence)}%`, sub: "Across all agents", icon: TrendingUp, color: "yellow" },
    { label: "Escalations", value: stats.escalations, sub: "Pending review", icon: AlertTriangle, color: "orange" },
    { label: "Audit Coverage", value: "100%", sub: "Immutable logs", icon: Shield, color: "teal" },
  ];

  const statusColor: Record<string, string> = {
    completed: "text-green-400 bg-green-950/50",
    running: "text-blue-400 bg-blue-950/50",
    failed: "text-red-400 bg-red-950/50",
    escalated: "text-orange-400 bg-orange-950/50",
    pending: "text-gray-400 bg-gray-800",
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Dashboard</h1>
          <p className="text-gray-400 text-sm mt-1">Your AI workforce at a glance</p>
        </div>
        <Link to="/agents/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      {/* Stats Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-4 animate-pulse h-24" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {statCards.map((card) => (
            <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4 hover:border-gray-700 transition-colors">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-gray-400">{card.label}</span>
                <card.icon className={`w-4 h-4 text-${card.color}-400`} />
              </div>
              <div className="text-2xl font-bold text-white">{card.value}</div>
              <div className="text-xs text-gray-500 mt-1">{card.sub}</div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link to="/agents/new" className="bg-gray-900 border border-gray-800 hover:border-blue-700 rounded-xl p-5 group transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
              <Bot className="w-5 h-5 text-blue-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-blue-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">Build an Agent</h3>
          <p className="text-sm text-gray-400">Convert a job description into an AI agent</p>
        </Link>
        <Link to="/teams/new" className="bg-gray-900 border border-gray-800 hover:border-purple-700 rounded-xl p-5 group transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-purple-500/10 border border-purple-500/20 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-purple-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">Create a Team</h3>
          <p className="text-sm text-gray-400">Build multi-agent workflow teams</p>
        </Link>
        <Link to="/audit" className="bg-gray-900 border border-gray-800 hover:border-green-700 rounded-xl p-5 group transition-colors">
          <div className="flex items-center justify-between mb-3">
            <div className="w-10 h-10 bg-green-500/10 border border-green-500/20 rounded-lg flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-400" />
            </div>
            <ArrowRight className="w-4 h-4 text-gray-600 group-hover:text-green-400 transition-colors" />
          </div>
          <h3 className="font-semibold text-white mb-1">View Audit Logs</h3>
          <p className="text-sm text-gray-400">Review compliance and execution history</p>
        </Link>
      </div>

      {/* Recent Executions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Recent Executions</h2>
          <Link to="/executions" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1">
            View all <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        {recentExecutions.length === 0 ? (
          <div className="px-6 py-12 text-center">
            <Play className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No executions yet</p>
            <p className="text-gray-500 text-xs mt-1">Run an agent to see results here</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {recentExecutions.map((exec) => (
              <div key={exec.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-800/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-gray-800 rounded-lg flex items-center justify-center">
                    <Bot className="w-4 h-4 text-gray-400" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-white">{exec.agentName || `Agent #${exec.agentId}`}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3" />
                      {new Date(exec.createdAt).toLocaleString()}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {exec.confidenceScore != null && (
                    <div className="text-sm text-gray-400">
                      <span className={exec.confidenceScore >= 80 ? "text-green-400" : exec.confidenceScore >= 60 ? "text-yellow-400" : "text-red-400"}>
                        {Math.round(exec.confidenceScore)}%
                      </span>
                      <span className="text-gray-600 ml-1">confidence</span>
                    </div>
                  )}
                  <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColor[exec.status] || statusColor.pending}`}>
                    {exec.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
