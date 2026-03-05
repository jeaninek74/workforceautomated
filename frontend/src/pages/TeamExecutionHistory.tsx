import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft, Clock, CheckCircle2, AlertTriangle, XCircle, Loader2,
  ChevronDown, ChevronUp, GitBranch, Zap, Users, BarChart3, MessageSquare
} from "lucide-react";
import { teamsApi, executionsApi } from "../lib/api";

const STATUS_CONFIG: Record<string, { icon: any; color: string; label: string }> = {
  success: { icon: CheckCircle2, color: "text-green-400", label: "Success" },
  escalated: { icon: AlertTriangle, color: "text-yellow-400", label: "Escalated" },
  failed: { icon: XCircle, color: "text-red-400", label: "Failed" },
  running: { icon: Loader2, color: "text-blue-400", label: "Running" },
  pending: { icon: Clock, color: "text-gray-400", label: "Pending" },
  cancelled: { icon: XCircle, color: "text-gray-500", label: "Cancelled" },
};

const RISK_COLORS: Record<string, string> = {
  low: "text-green-400 bg-green-400/10",
  medium: "text-yellow-400 bg-yellow-400/10",
  high: "text-orange-400 bg-orange-400/10",
  critical: "text-red-400 bg-red-400/10",
};

function ConfidenceBar({ score }: { score: number }) {
  const pct = Math.round(score * 100);
  const color = pct >= 80 ? "bg-green-500" : pct >= 60 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-gray-700 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className={`text-xs font-mono ${pct >= 80 ? "text-green-400" : pct >= 60 ? "text-yellow-400" : "text-red-400"}`}>
        {pct}%
      </span>
    </div>
  );
}

function ExecutionRow({ exec }: { exec: any }) {
  const [expanded, setExpanded] = useState(false);
  const status = STATUS_CONFIG[exec.status] || STATUS_CONFIG.pending;
  const StatusIcon = status.icon;
  const meta = exec.metadata || {};
  const agentResults: any[] = meta.agentResults || [];
  const agentMessages: any[] = meta.agentMessages || [];
  const executionMode: string = meta.executionMode || "single";

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      {/* Header row */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-800/50 transition-colors text-left"
      >
        <StatusIcon className={`w-4 h-4 flex-shrink-0 ${status.color} ${exec.status === "running" ? "animate-spin" : ""}`} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium text-white truncate max-w-xs">
              {exec.input?.slice(0, 80)}{exec.input?.length > 80 ? "..." : ""}
            </span>
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${status.color} bg-current/10`}>
              {status.label}
            </span>
            {executionMode === "team" && (
              <span className="text-xs px-1.5 py-0.5 rounded-full text-blue-400 bg-blue-400/10">
                {meta.executionMode === "team" && agentResults.length > 0 ? `${agentResults.length} agents` : "team"}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
            <span>{new Date(exec.createdAt).toLocaleString()}</span>
            {exec.processingTimeMs && <span>{(exec.processingTimeMs / 1000).toFixed(1)}s</span>}
            {exec.confidenceScore != null && (
              <span className={exec.confidenceScore >= 0.8 ? "text-green-400" : exec.confidenceScore >= 0.6 ? "text-yellow-400" : "text-red-400"}>
                {Math.round(exec.confidenceScore * 100)}% confidence
              </span>
            )}
            {exec.riskLevel && (
              <span className={`px-1.5 py-0.5 rounded ${RISK_COLORS[exec.riskLevel]}`}>
                {exec.riskLevel} risk
              </span>
            )}
          </div>
        </div>
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />}
      </button>

      {/* Expanded detail */}
      {expanded && (
        <div className="border-t border-gray-800 px-5 py-4 space-y-4">
          {/* Per-agent breakdown */}
          {agentResults.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <BarChart3 className="w-3.5 h-3.5 text-blue-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">Per-Agent Breakdown</span>
              </div>
              <div className="space-y-2">
                {agentResults.map((ar: any, idx: number) => (
                  <div key={idx} className="bg-gray-800 rounded-lg p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full bg-blue-600/20 flex items-center justify-center text-xs text-blue-400 font-bold">
                          {idx + 1}
                        </div>
                        <span className="text-sm font-medium text-white">{ar.agentName}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${RISK_COLORS[ar.riskLevel] || ""}`}>
                          {ar.riskLevel}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">{ar.tokenCount} tokens</span>
                    </div>
                    <ConfidenceBar score={ar.confidenceScore} />
                    {ar.outputSnippet && (
                      <p className="text-xs text-gray-400 mt-2 leading-relaxed line-clamp-2">{ar.outputSnippet}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Agent communications / branch paths */}
          {agentMessages.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-3.5 h-3.5 text-purple-400" />
                <span className="text-xs font-semibold text-gray-300 uppercase tracking-wide">
                  Agent Communications & Branch Paths
                </span>
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {agentMessages.map((msg: any, idx: number) => {
                  const isBranch = msg.message?.toLowerCase().includes("branch decision");
                  return (
                    <div key={idx} className={`flex gap-2 p-2 rounded-lg text-xs ${isBranch ? "bg-purple-900/20 border border-purple-800/30" : "bg-gray-800"}`}>
                      {isBranch ? (
                        <GitBranch className="w-3 h-3 text-purple-400 flex-shrink-0 mt-0.5" />
                      ) : (
                        <Zap className="w-3 h-3 text-blue-400 flex-shrink-0 mt-0.5" />
                      )}
                      <div className="min-w-0">
                        <span className="text-gray-400">
                          <span className="text-white font-medium">{msg.fromAgentName}</span>
                          {" → "}
                          <span className="text-white font-medium">{msg.toAgentName}</span>
                          {": "}
                        </span>
                        <span className="text-gray-300">{msg.message}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Escalation reason */}
          {exec.escalated && exec.escalationReason && (
            <div className="flex items-start gap-2 bg-yellow-900/20 border border-yellow-800/30 rounded-lg p-3">
              <AlertTriangle className="w-3.5 h-3.5 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="text-xs font-semibold text-yellow-400">Escalated: </span>
                <span className="text-xs text-yellow-300">{exec.escalationReason}</span>
              </div>
            </div>
          )}

          {/* Output */}
          {exec.output && (
            <div>
              <div className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Output</div>
              <div className="bg-gray-800 rounded-lg p-3 text-xs text-gray-300 whitespace-pre-wrap max-h-48 overflow-y-auto font-mono leading-relaxed">
                {exec.output}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default function TeamExecutionHistory() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [team, setTeam] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    const teamId = parseInt(id);
    Promise.all([
      teamsApi.get(teamId),
      executionsApi.list({ teamId }),
    ]).then(([teamRes, execRes]) => {
      setTeam(teamRes.data?.team);
      setExecutions(execRes.data?.executions || []);
    }).catch((err) => {
      setError(err.response?.data?.error || "Failed to load history");
    }).finally(() => setLoading(false));
  }, [id]);

  const successCount = executions.filter((e) => e.status === "success").length;
  const escalatedCount = executions.filter((e) => e.status === "escalated").length;
  const failedCount = executions.filter((e) => e.status === "failed").length;
  const avgConfidence = executions.length > 0
    ? executions.filter((e) => e.confidenceScore != null).reduce((s, e) => s + e.confidenceScore, 0) /
      executions.filter((e) => e.confidenceScore != null).length
    : null;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-blue-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate("/teams")}
          className="p-2 rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white">
            {team?.name || "Team"} — Execution History
          </h1>
          <p className="text-gray-400 text-sm mt-0.5">
            {executions.length} total run{executions.length !== 1 ? "s" : ""}
            {team?.executionMode && (
              <span className="ml-2 text-blue-400 capitalize">{team.executionMode} mode</span>
            )}
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* Summary stats */}
      {executions.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-green-400">{successCount}</div>
            <div className="text-xs text-gray-500 mt-1">Successful</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-yellow-400">{escalatedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Escalated</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-red-400">{failedCount}</div>
            <div className="text-xs text-gray-500 mt-1">Failed</div>
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${avgConfidence != null && avgConfidence >= 0.8 ? "text-green-400" : avgConfidence != null && avgConfidence >= 0.6 ? "text-yellow-400" : "text-red-400"}`}>
              {avgConfidence != null ? `${Math.round(avgConfidence * 100)}%` : "—"}
            </div>
            <div className="text-xs text-gray-500 mt-1">Avg Confidence</div>
          </div>
        </div>
      )}

      {/* Execution list */}
      {executions.length === 0 ? (
        <div className="text-center py-16">
          <Users className="w-12 h-12 text-gray-700 mx-auto mb-3" />
          <h3 className="text-gray-400 font-medium">No executions yet</h3>
          <p className="text-gray-600 text-sm mt-1">Run this team from the Execution Console to see history here.</p>
          <button
            onClick={() => navigate("/execution")}
            className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors"
          >
            Go to Execution Console
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {executions.map((exec) => (
            <ExecutionRow key={exec.id} exec={exec} />
          ))}
        </div>
      )}
    </div>
  );
}
