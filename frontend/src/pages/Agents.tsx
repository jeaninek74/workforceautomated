import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bot, Plus, Search, Play, Edit, Trash2, MoreHorizontal, CheckCircle, XCircle, Clock, AlertCircle } from "lucide-react";
import { agentsApi } from "../lib/api";

const statusIcon: Record<string, any> = {
  active: CheckCircle,
  inactive: XCircle,
  draft: Clock,
  error: AlertCircle,
};
const statusColor: Record<string, string> = {
  active: "text-green-400",
  inactive: "text-gray-500",
  draft: "text-yellow-400",
  error: "text-red-400",
};

export default function Agents() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await agentsApi.list({ search });
      setAgents(res.data?.agents || []);
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">AI Agents</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your AI workforce agents</p>
        </div>
        <Link to="/agents/new" className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <Plus className="w-4 h-4" />
          New Agent
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search agents..."
          className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
        />
      </div>

      {/* Agents Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-40" />
          ))}
        </div>
      ) : agents.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl py-20 text-center">
          <Bot className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No agents yet</h3>
          <p className="text-gray-400 text-sm mb-6">Create your first AI agent from a job description</p>
          <Link to="/agents/new" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" />
            Build First Agent
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent) => {
            const SIcon = statusIcon[agent.status] || Clock;
            return (
              <div key={agent.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors group">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <Bot className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white text-sm">{agent.name}</h3>
                      <p className="text-xs text-gray-500">{agent.role}</p>
                    </div>
                  </div>
                  <div className={`flex items-center gap-1 text-xs ${statusColor[agent.status] || "text-gray-400"}`}>
                    <SIcon className="w-3 h-3" />
                    {agent.status}
                  </div>
                </div>
                {agent.description && (
                  <p className="text-xs text-gray-400 mb-4 line-clamp-2">{agent.description}</p>
                )}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-800">
                  <Link
                    to={`/agents/${agent.id}/run`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Play className="w-3 h-3" />
                    Run
                  </Link>
                  <Link
                    to={`/agents/${agent.id}/edit`}
                    className="flex-1 flex items-center justify-center gap-1.5 bg-gray-800 hover:bg-gray-700 text-gray-300 text-xs font-medium py-2 rounded-lg transition-colors"
                  >
                    <Edit className="w-3 h-3" />
                    Edit
                  </Link>
                  <button
                    onClick={() => handleDelete(agent.id)}
                    disabled={deleting === agent.id}
                    className="flex items-center justify-center w-8 h-8 bg-gray-800 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
