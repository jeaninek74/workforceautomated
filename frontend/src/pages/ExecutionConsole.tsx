import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Bot, Play, Loader2, CheckCircle, XCircle, AlertTriangle, Clock, ArrowLeft, Shield } from "lucide-react";
import { agentsApi, executionsApi } from "../lib/api";

export default function ExecutionConsole() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [input, setInput] = useState("");
  const [execution, setExecution] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const logsRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);

  useEffect(() => {
    if (id) agentsApi.get(Number(id)).then((r) => setAgent(r.data)).catch(() => {});
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleRun = async () => {
    if (!input.trim() || !id) return;
    setRunning(true);
    setError("");
    setExecution(null);
    setLogs([]);
    addLog("Initializing agent execution...");
    addLog(`Agent: ${agent?.name || `#${id}`}`);
    addLog("Sending task to AI engine...");

    try {
      const res = await executionsApi.create({ agentId: Number(id), input });
      const execId = res.data?.executionId;
      addLog(`Execution started (ID: ${execId})`);
      addLog("Processing with confidence scoring...");

      // Poll for completion
      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await executionsApi.get(execId);
          const exec = statusRes.data;
          if (exec.status === "completed" || exec.status === "failed" || exec.status === "escalated") {
            clearInterval(pollRef.current);
            setExecution(exec);
            setRunning(false);
            if (exec.status === "completed") {
              addLog(`Execution completed. Confidence: ${Math.round(exec.confidenceScore || 0)}%`);
              addLog(`Risk level: ${exec.riskLevel || "low"}`);
            } else if (exec.status === "escalated") {
              addLog(`⚠ Escalated to human review (confidence: ${Math.round(exec.confidenceScore || 0)}%)`);
            } else {
              addLog(`✗ Execution failed: ${exec.error || "Unknown error"}`);
            }
          } else {
            addLog(`Status: ${exec.status}...`);
          }
        } catch (_) {}
      }, 2000);

      // Timeout after 2 minutes
      setTimeout(() => {
        if (running) {
          clearInterval(pollRef.current);
          setRunning(false);
          addLog("Execution timed out");
        }
      }, 120000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start execution");
      setRunning(false);
      addLog("✗ Failed to start execution");
    }
  };

  const confidenceColor = (score: number) => {
    if (score >= 80) return "text-green-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const riskBadge: Record<string, string> = {
    low: "bg-green-950/50 text-green-400 border-green-800",
    medium: "bg-yellow-950/50 text-yellow-400 border-yellow-800",
    high: "bg-orange-950/50 text-orange-400 border-orange-800",
    critical: "bg-red-950/50 text-red-400 border-red-800",
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate("/agents")} className="text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Execution Console</h1>
          {agent && <p className="text-gray-400 text-sm mt-0.5">Running: <span className="text-blue-400">{agent.name}</span></p>}
        </div>
      </div>

      {/* Agent Info */}
      {agent && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-xl flex items-center justify-center flex-shrink-0">
            <Bot className="w-6 h-6 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-white">{agent.name}</div>
            <div className="text-sm text-gray-400">{agent.role}</div>
          </div>
          <div className="text-right">
            <div className="text-xs text-gray-500">Confidence Threshold</div>
            <div className="text-lg font-bold text-blue-400">{agent.confidenceThreshold || 75}%</div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Task Input</h2>
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          rows={5}
          disabled={running}
          className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none disabled:opacity-50"
          placeholder="Describe the task you want this agent to perform..."
        />
        {error && <div className="text-red-400 text-sm">{error}</div>}
        <button
          onClick={handleRun}
          disabled={running || !input.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {running ? <><Loader2 className="w-4 h-4 animate-spin" /> Running...</> : <><Play className="w-4 h-4" /> Execute Agent</>}
        </button>
      </div>

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-mono text-gray-400">Execution Log</span>
          </div>
          <div ref={logsRef} className="p-4 h-40 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
            {running && <div className="animate-pulse">▋</div>}
          </div>
        </div>
      )}

      {/* Result */}
      {execution && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-white">Execution Result</h2>
            <div className="flex items-center gap-2">
              {execution.status === "completed" && <CheckCircle className="w-5 h-5 text-green-400" />}
              {execution.status === "failed" && <XCircle className="w-5 h-5 text-red-400" />}
              {execution.status === "escalated" && <AlertTriangle className="w-5 h-5 text-orange-400" />}
              <span className={`text-sm font-medium ${
                execution.status === "completed" ? "text-green-400" :
                execution.status === "failed" ? "text-red-400" : "text-orange-400"
              }`}>{execution.status}</span>
            </div>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className={`text-2xl font-bold ${confidenceColor(execution.confidenceScore || 0)}`}>
                {Math.round(execution.confidenceScore || 0)}%
              </div>
              <div className="text-xs text-gray-400 mt-1">Confidence Score</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className={`inline-flex items-center gap-1 text-sm font-medium px-2 py-1 rounded border ${riskBadge[execution.riskLevel] || riskBadge.low}`}>
                <Shield className="w-3 h-3" />
                {execution.riskLevel || "low"}
              </div>
              <div className="text-xs text-gray-400 mt-2">Risk Level</div>
            </div>
            <div className="bg-gray-800 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-white">
                {execution.executionTime ? `${(execution.executionTime / 1000).toFixed(1)}s` : "—"}
              </div>
              <div className="text-xs text-gray-400 mt-1">Execution Time</div>
            </div>
          </div>

          {/* Output */}
          {execution.output && (
            <div>
              <div className="text-sm font-medium text-gray-300 mb-2">Output</div>
              <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap max-h-64 overflow-y-auto">
                {typeof execution.output === "string" ? execution.output : JSON.stringify(execution.output, null, 2)}
              </div>
            </div>
          )}

          {/* Escalation Notice */}
          {execution.status === "escalated" && (
            <div className="bg-orange-950/30 border border-orange-800 rounded-lg p-4 flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" />
              <div>
                <div className="text-sm font-medium text-orange-300">Escalated for Human Review</div>
                <div className="text-xs text-orange-400/70 mt-1">
                  This execution was escalated because the confidence score ({Math.round(execution.confidenceScore || 0)}%) fell below the agent's threshold ({agent?.confidenceThreshold || 75}%). A human supervisor must review and approve before proceeding.
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
