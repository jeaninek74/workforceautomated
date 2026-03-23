import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Plus, Search, Play, Edit, Trash2, CheckCircle, XCircle, Clock, AlertCircle, Zap } from "lucide-react";
import { agentsApi } from "../lib/api";

const statusIcon: Record<string, any> = {
  active: CheckCircle,
  inactive: XCircle,
  draft: Clock,
  error: AlertCircle,
};
const statusColor: Record<string, string> = {
  active: "text-emerald-400",
  inactive: "text-gray-500",
  draft: "text-yellow-400",
  error: "text-red-400",
};
const statusBg: Record<string, string> = {
  active: "bg-emerald-400/10",
  inactive: "bg-gray-800",
  draft: "bg-yellow-400/10",
  error: "bg-red-400/10",
};

function timeAgo(dateStr: string): string {
  if (!dateStr) return "Never";
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);
  const [usage, setUsage] = useState<{ current: number; limit: number | null; plan: string; percentUsed: number } | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [listRes, usageRes] = await Promise.all([
        agentsApi.list({ search }),
        agentsApi.getUsage(),
      ]);
      setAgents(listRes.data?.agents || []);
      setUsage(usageRes.data || null);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    setDeleting(id);
    try {
      await agentsApi.delete(id);
      setAgents((prev) => prev.filter((a) => a.id !== id));
    } catch (_) {}
    setDeleting(null);
  };

  // Parse agent name: "Aria — Accounts Payable Specialist" → { firstName: "Aria", role: "Accounts Payable Specialist" }
  const parseAgentName = (name: string, role: string) => {
    const parts = name.split(" — ");
    if (parts.length === 2) {
      return { firstName: parts[0].trim(), displayRole: parts[1].trim() };
    }
    return { firstName: null, displayRole: role || name };
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-gray-400 text-sm mt-1">
            {agents.length > 0 ? `${agents.length} agent${agents.length !== 1 ? "s" : ""} in your workforce` : "Build and manage your AI workforce"}
          </p>
        </div>
        <Link
          to="/agents/new"
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      {/* Usage Bar */}
      {usage && usage.limit !== null && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">
              Agent Usage — <span className="capitalize text-white font-medium">{usage.plan}</span> plan
            </span>
            <span className={`text-sm font-semibold ${
              usage.percentUsed >= 100 ? "text-red-400" :
              usage.percentUsed >= 80 ? "text-yellow-400" : "text-green-400"
            }`}>
              {usage.current} / {usage.limit} agents
            </span>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all ${
                usage.percentUsed >= 100 ? "bg-red-500" :
                usage.percentUsed >= 80 ? "bg-yellow-500" : "bg-blue-500"
              }`}
              style={{ width: `${Math.min(usage.percentUsed, 100)}%` }}
            />
          </div>
          {usage.percentUsed >= 80 && (
            <p className="text-xs text-yellow-400 mt-2">
              {usage.percentUsed >= 100
                ? "Agent limit reached. Upgrade your plan to create more agents."
                : `${usage.limit! - usage.current} agent slot${usage.limit! - usage.current !== 1 ? "s" : ""} remaining.`}
            </p>
          )}
        </div>
      )}

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents..."
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Agents Table */}
      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 bg-gray-900 border border-gray-800 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="border border-gray-800 rounded-xl py-20 text-center">
          <Bot className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No agents yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first AI agent from a job description</p>
          <Link
            to="/agents/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
            Build First Agent
          </Link>
        </div>
      ) : (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-3 bg-gray-900/50 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wide">
            <span>Agent</span>
            <span>Capabilities</span>
            <span>Status</span>
            <span>Last Active</span>
            <span>Actions</span>
          </div>

          {/* Table rows */}
          <div className="divide-y divide-gray-800/60">
            {agents.map((agent) => {
              const SIcon = statusIcon[agent.status] || Clock;
              const { firstName, displayRole } = parseAgentName(agent.name, agent.role);
              const caps: string[] = Array.isArray(agent.capabilities) ? agent.capabilities.slice(0, 3) : [];
              const lastActive = agent.updatedAt || agent.createdAt;

              return (
                <div
                  key={agent.id}
                  className="grid grid-cols-[2fr_1.5fr_1fr_1fr_auto] gap-4 px-5 py-4 hover:bg-gray-900/40 transition-colors items-center"
                >
                  {/* Agent name + role */}
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 flex-shrink-0 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        {firstName && (
                          <span className="text-sm font-semibold text-white">{firstName}</span>
                        )}
                        {!firstName && (
                          <span className="text-sm font-semibold text-white truncate">{agent.name}</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 truncate">{displayRole}</p>
                    </div>
                  </div>

                  {/* Capabilities */}
                  <div className="flex flex-wrap gap-1">
                    {caps.length > 0 ? caps.map((cap) => (
                      <span key={cap} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-full">
                        {cap.replace(/_/g, " ")}
                      </span>
                    )) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                    {Array.isArray(agent.capabilities) && agent.capabilities.length > 3 && (
                      <span className="text-xs text-gray-600">+{agent.capabilities.length - 3}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-full w-fit ${statusBg[agent.status] || "bg-gray-800"} ${statusColor[agent.status] || "text-gray-400"}`}>
                    <SIcon className="w-3 h-3" />
                    {agent.status || "draft"}
                  </div>

                  {/* Last active */}
                  <div className="text-xs text-gray-500">
                    {timeAgo(lastActive)}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/agents/${agent.id}/run`}
                      className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
                      title="Run this agent"
                    >
                      <Play className="w-3 h-3" />
                      Run
                    </Link>
                    <Link
                      to={`/agents/${agent.id}/edit`}
                      className="flex items-center justify-center w-7 h-7 bg-gray-800 hover:bg-gray-700 text-gray-400 rounded-lg transition-colors"
                      title="Edit agent"
                    >
                      <Edit className="w-3.5 h-3.5" />
                    </Link>
                    <button
                      onClick={() => handleDelete(agent.id)}
                      disabled={deleting === agent.id}
                      className="flex items-center justify-center w-7 h-7 bg-gray-800 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                      title="Delete agent"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Quick tip */}
      {agents.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-gray-600 border-t border-gray-800/50 pt-4">
          <Zap className="w-3.5 h-3.5 text-blue-500/50" />
          Click <strong className="text-gray-500">Run</strong> on any agent to give it a new task. Agents remember their configuration and are ready to work immediately.
        </div>
      )}
    </div>
  );
}
