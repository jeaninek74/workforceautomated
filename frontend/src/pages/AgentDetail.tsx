import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Bot, Play, Edit, Trash2, ArrowLeft, Loader2, CheckCircle,
  AlertTriangle, Clock, Shield, Zap, Activity
} from "lucide-react";
import { agentsApi, executionsApi } from "../lib/api";

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

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      agentsApi.get(Number(id)),
      executionsApi.list({ agentId: Number(id), limit: 10 }),
    ]).then(([aRes, eRes]) => {
      setAgent(aRes.data?.agent || aRes.data);
      setExecutions(eRes.data?.executions || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!confirm("Delete this agent? This cannot be undone.")) return;
    await agentsApi.delete(Number(id));
    navigate("/agents");
  };

  if (loading) return (
    <div className="p-6 flex items-center justify-center h-64">
      <Loader2 className="w-8 h-8 animate-spin text-blue-400" />
    </div>
  );

  if (!agent) return (
    <div className="p-6 text-center text-gray-400">Agent not found</div>
  );

  // Parse agent display name
  const nameParts = agent.name?.split(" — ");
  const firstName = nameParts?.[0] || agent.name;
  const roleTitle = nameParts?.[1] || agent.role;

  const caps: string[] = Array.isArray(agent.capabilities) ? agent.capabilities : [];

  const statusColor: Record<string, string> = {
    completed: "text-emerald-400 bg-emerald-950/50 border-emerald-800",
    success: "text-emerald-400 bg-emerald-950/50 border-emerald-800",
    failed: "text-red-400 bg-red-950/50 border-red-800",
    escalated: "text-orange-400 bg-orange-950/50 border-orange-800",
    pending: "text-gray-400 bg-gray-800 border-gray-700",
    running: "text-blue-400 bg-blue-950/50 border-blue-800",
  };

  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to="/agents"
          className="w-9 h-9 flex items-center justify-center bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-white">{firstName}</h1>
          <p className="text-gray-400 text-sm">{roleTitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to={`/agents/${id}/run`}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            <Play className="w-4 h-4" />
            Run Agent
          </Link>
          <Link
            to={`/agents/${id}/edit`}
            className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-3 py-2 rounded-lg transition-colors border border-gray-700"
          >
            <Edit className="w-4 h-4" />
            Edit
          </Link>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center w-9 h-9 bg-gray-800 hover:bg-red-950/50 hover:text-red-400 text-gray-400 rounded-lg transition-colors border border-gray-700"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left column: agent info */}
        <div className="lg:col-span-1 space-y-4">
          {/* Identity card */}
          <div className="border border-gray-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
                <Bot className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <div className="font-semibold text-white">{firstName}</div>
                <div className="text-sm text-gray-400">{roleTitle}</div>
              </div>
            </div>

            {agent.description && (
              <p className="text-sm text-gray-400 leading-relaxed">{agent.description}</p>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-800">
              <div>
                <div className="text-xs text-gray-500 mb-1">Status</div>
                <div className={`text-sm font-medium capitalize ${agent.status === "active" ? "text-emerald-400" : "text-gray-400"}`}>
                  {agent.status || "draft"}
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Risk Level</div>
                <div className="text-sm font-medium text-white capitalize">{agent.riskLevel || "medium"}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Confidence Threshold</div>
                <div className="text-sm font-bold text-blue-400">
                  {Math.round((agent.confidenceThreshold || 0.75) * 100)}%
                </div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Executions</div>
                <div className="text-sm font-medium text-white">{agent.executionCount || executions.length}</div>
              </div>
            </div>
          </div>

          {/* Capabilities */}
          {caps.length > 0 && (
            <div className="border border-gray-800 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-3.5 h-3.5 text-yellow-400" />
                <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Capabilities</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {caps.map((cap) => (
                  <span key={cap} className="text-xs bg-gray-800 text-gray-300 px-2.5 py-1 rounded-full border border-gray-700">
                    {cap.replace(/_/g, " ")}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Governance */}
          <div className="border border-gray-800 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Shield className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wide">Governance</span>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Auto-Escalation</span>
                <span className={agent.escalationEnabled ? "text-emerald-400" : "text-gray-500"}>
                  {agent.escalationEnabled ? "Enabled" : "Disabled"}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-500">Audit Logging</span>
                <span className="text-emerald-400">Always On</span>
              </div>
            </div>
          </div>

          {/* Quick run CTA */}
          <Link
            to={`/agents/${id}/run`}
            className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            <Play className="w-4 h-4" />
            Run a Task Now
          </Link>
        </div>

        {/* Right column: execution history */}
        <div className="lg:col-span-2">
          <div className="border border-gray-800 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 bg-gray-900/50 border-b border-gray-800">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Execution History
              </h2>
              <span className="text-xs text-gray-500">{executions.length} runs</span>
            </div>

            {executions.length === 0 ? (
              <div className="py-14 text-center">
                <Play className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No executions yet</p>
                <p className="text-gray-600 text-xs mt-1 mb-4">Run this agent on a task to see results here</p>
                <Link
                  to={`/agents/${id}/run`}
                  className="inline-flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                >
                  <Play className="w-3.5 h-3.5" />
                  Run First Task
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-gray-800/60">
                {executions.map((exec) => {
                  const confPct = exec.confidenceScore != null
                    ? Math.round(exec.confidenceScore <= 1 ? exec.confidenceScore * 100 : exec.confidenceScore)
                    : null;
                  return (
                    <div key={exec.id} className="px-5 py-4 hover:bg-gray-900/30 transition-colors">
                      <div className="flex items-start gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm text-gray-300 truncate">
                            {exec.input ? exec.input.slice(0, 80) + (exec.input.length > 80 ? "…" : "") : "No task description"}
                          </div>
                          {exec.output && (
                            <div className="text-xs text-gray-500 mt-1 truncate">
                              → {exec.output.slice(0, 100)}{exec.output.length > 100 ? "…" : ""}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {confPct != null && (
                            <span className={`text-xs font-semibold ${confPct >= 80 ? "text-emerald-400" : confPct >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                              {confPct}%
                            </span>
                          )}
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColor[exec.status] || statusColor.pending}`}>
                            {exec.status}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-600">
                        <Clock className="w-3 h-3" />
                        {timeAgo(exec.createdAt)}
                        {exec.processingTimeMs && (
                          <span className="ml-2 text-gray-700">· {(exec.processingTimeMs / 1000).toFixed(1)}s</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
