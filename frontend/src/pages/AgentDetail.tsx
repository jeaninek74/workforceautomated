import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Bot, Play, Edit, Trash2, ArrowLeft, Loader2, CheckCircle, AlertTriangle, Clock } from "lucide-react";
import { agentsApi, executionsApi } from "../lib/api";

export default function AgentDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [executions, setExecutions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [input, setInput] = useState("");
  const [runResult, setRunResult] = useState<any>(null);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      agentsApi.get(Number(id)),
      executionsApi.list({ agentId: Number(id), limit: 10 }),
    ]).then(([aRes, eRes]) => {
      setAgent(aRes.data?.agent);
      setExecutions(eRes.data?.executions || []);
    }).finally(() => setLoading(false));
  }, [id]);

  const handleRun = async () => {
    if (!input.trim()) return;
    setRunning(true);
    setRunResult(null);
    try {
      const res = await executionsApi.create({ agentId: Number(id), input });
      setRunResult(res.data?.execution);
      setExecutions((prev) => [res.data?.execution, ...prev].slice(0, 10));
    } catch (err: any) {
      setRunResult({ error: err.response?.data?.error || "Execution failed" });
    }
    setRunning(false);
  };

  const handleDelete = async () => {
    if (!confirm("Delete this agent?")) return;
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

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-4">
        <Link to="/agents" className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-white">{agent.name}</h1>
          <p className="text-gray-400 text-sm">{agent.role}</p>
        </div>
        <div className="flex items-center gap-2">
          <Link to={`/agents/${id}/edit`} className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-gray-700">
            <Edit className="w-4 h-4" /> Edit
          </Link>
          <button onClick={handleDelete} className="flex items-center gap-2 bg-red-950/50 hover:bg-red-900/50 text-red-400 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-red-800">
            <Trash2 className="w-4 h-4" /> Delete
          </button>
        </div>
      </div>

      {/* Agent Info */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Status</div>
          <div className={`text-sm font-medium capitalize ${agent.status === "active" ? "text-green-400" : "text-gray-400"}`}>{agent.status}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Avg Confidence</div>
          <div className="text-sm font-medium text-white">{agent.avgConfidence ? `${Math.round(agent.avgConfidence)}%` : "—"}</div>
        </div>
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-1">Total Executions</div>
          <div className="text-sm font-medium text-white">{agent.executionCount || 0}</div>
        </div>
      </div>

      {agent.description && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5">
          <div className="text-xs text-gray-400 mb-2">Description</div>
          <p className="text-sm text-gray-300">{agent.description}</p>
        </div>
      )}

      {/* Run Console */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Execute Agent</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={4}
          placeholder="Enter task input for this agent..."
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
        />
        <button
          onClick={handleRun}
          disabled={running || !input.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition-colors"
        >
          {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Run Agent</>}
        </button>

        {runResult && (
          <div className={`rounded-lg p-4 text-sm ${runResult.error ? "bg-red-950/50 border border-red-800 text-red-300" : "bg-gray-800 border border-gray-700"}`}>
            {runResult.error ? (
              <div className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" />{runResult.error}</div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-green-400 font-medium">
                  <CheckCircle className="w-4 h-4" /> Execution Complete
                </div>
                {runResult.confidenceScore != null && (
                  <div className="text-gray-300">Confidence: <span className="font-medium text-white">{Math.round(runResult.confidenceScore)}%</span></div>
                )}
                {runResult.output && <div className="text-gray-300 mt-2 whitespace-pre-wrap">{runResult.output}</div>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recent Executions */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-800">
          <h2 className="font-semibold text-white">Recent Executions</h2>
        </div>
        {executions.length === 0 ? (
          <div className="py-10 text-center text-gray-400 text-sm">No executions yet</div>
        ) : (
          <div className="divide-y divide-gray-800">
            {executions.map((exec) => (
              <div key={exec.id} className="px-6 py-3.5 flex items-center gap-4">
                <div className="flex-1 text-sm text-gray-300 truncate">{exec.input}</div>
                <div className={`text-xs font-medium ${exec.confidenceScore >= 80 ? "text-green-400" : exec.confidenceScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                  {exec.confidenceScore != null ? `${Math.round(exec.confidenceScore)}%` : "—"}
                </div>
                <div className={`text-xs px-2 py-0.5 rounded-full border ${
                  exec.status === "completed" ? "bg-green-950/50 text-green-400 border-green-800" :
                  exec.status === "failed" ? "bg-red-950/50 text-red-400 border-red-800" :
                  exec.status === "escalated" ? "bg-orange-950/50 text-orange-400 border-orange-800" :
                  "bg-gray-800 text-gray-400 border-gray-700"
                }`}>{exec.status}</div>
                <div className="text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {new Date(exec.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
