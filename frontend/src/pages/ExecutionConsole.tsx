import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bot, Play, Loader2, CheckCircle, XCircle, AlertTriangle,
  ArrowLeft, Shield, Upload, X, FileText, ChevronDown, Zap,
  Link2, Copy, Check
} from "lucide-react";
import { agentsApi, executionsApi, integrationsApi } from "../lib/api";

const OUTPUT_FORMATS = [
  { value: "", label: "Default (agent decides)" },
  { value: "bullet point summary", label: "Bullet Point Summary" },
  { value: "structured table with columns: Item, Status, Notes", label: "Structured Table" },
  { value: "formal report with Executive Summary, Findings, and Recommendations sections", label: "Formal Report" },
  { value: "numbered list of action items with priority (High/Medium/Low)", label: "Action Items List" },
  { value: "JSON object with keys: summary, findings, recommendations, risk_level", label: "JSON Output" },
  { value: "brief executive summary in 3-5 sentences", label: "Executive Summary" },
  { value: "detailed analysis with supporting evidence for each finding", label: "Detailed Analysis" },
];

const ACCEPTED_FILE_TYPES = ".pdf,.csv,.xlsx,.xls,.docx,.doc,.txt,.md";
const MAX_FILE_SIZE_MB = 20;

export default function ExecutionConsole() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [agent, setAgent] = useState<any>(null);
  const [input, setInput] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [execution, setExecution] = useState<any>(null);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState("");
  const [logs, setLogs] = useState<string[]>([]);
  const [agentIntegrations, setAgentIntegrations] = useState<any[]>([]);
  const [copied, setCopied] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!id) return;
    agentsApi.get(Number(id)).then((r) => setAgent(r.data)).catch(() => {});
    integrationsApi.getAgentAssignments(Number(id))
      .then((r) => setAgentIntegrations(r.data?.assignments || []))
      .catch(() => {});
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  useEffect(() => {
    if (logsRef.current) logsRef.current.scrollTop = logsRef.current.scrollHeight;
  }, [logs]);

  const addLog = (msg: string) => setLogs((prev) => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || []);
    const valid = selected.filter((f) => {
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        setError(`File "${f.name}" exceeds the ${MAX_FILE_SIZE_MB}MB limit.`);
        return false;
      }
      return true;
    });
    setFiles((prev) => [...prev, ...valid].slice(0, 5));
    if (e.target) e.target.value = "";
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCopyOutput = () => {
    if (execution?.output) {
      navigator.clipboard.writeText(execution.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getConfidencePct = (score: number) =>
    Math.round(score <= 1 ? score * 100 : score);

  const handleRun = async () => {
    if (!input.trim() || !id) return;
    setRunning(true);
    setError("");
    setExecution(null);
    setLogs([]);
    addLog("Initializing agent execution...");
    addLog(`Agent: ${agent?.name || `#${id}`}`);
    if (files.length > 0) addLog(`Uploading ${files.length} file(s) for analysis...`);
    if (agentIntegrations.length > 0) addLog(`Pulling live data from ${agentIntegrations.length} connected system(s)...`);
    if (outputFormat) addLog(`Output format: ${OUTPUT_FORMATS.find(f => f.value === outputFormat)?.label}`);
    addLog("Sending task to AI engine (OpenAI GPT-4o-mini)...");

    try {
      const res = await executionsApi.create({
        agentId: Number(id),
        input,
        outputFormat: outputFormat || undefined,
        files: files.length > 0 ? files : undefined,
      });
      const execId = res.data?.execution?.id || res.data?.executionId;
      addLog(`Execution started (ID: ${execId})`);
      addLog("Processing with confidence scoring...");

      pollRef.current = setInterval(async () => {
        try {
          const statusRes = await executionsApi.get(execId);
          const exec = statusRes.data?.execution || statusRes.data;
          if (
            exec.status === "success" ||
            exec.status === "completed" ||
            exec.status === "failed" ||
            exec.status === "escalated"
          ) {
            clearInterval(pollRef.current);
            setExecution(exec);
            setRunning(false);
            if (exec.status === "success" || exec.status === "completed") {
              addLog(`✓ Execution completed. Confidence: ${getConfidencePct(exec.confidenceScore || 0)}%`);
              addLog(`Risk level: ${exec.riskLevel || "low"}`);
              if (exec.tokenCount) addLog(`Tokens used: ${exec.tokenCount}`);
            } else if (exec.status === "escalated") {
              addLog(`⚠ Escalated for human review (confidence: ${getConfidencePct(exec.confidenceScore || 0)}%)`);
            } else {
              addLog(`✗ Execution failed: ${exec.output || "Unknown error"}`);
            }
          } else {
            addLog(`Status: ${exec.status}...`);
          }
        } catch (_) {}
      }, 2000);

      setTimeout(() => {
        if (running) {
          clearInterval(pollRef.current);
          setRunning(false);
          addLog("Execution timed out after 2 minutes");
        }
      }, 120000);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to start execution");
      setRunning(false);
      addLog("✗ Failed to start execution");
    }
  };

  const confidenceColor = (score: number) => {
    const pct = score <= 1 ? score * 100 : score;
    if (pct >= 80) return "text-green-400";
    if (pct >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const integrationIcon: Record<string, string> = {
    google_drive: "📁",
    slack: "💬",
    rest_api: "🔌",
    webhook: "🪝",
    database: "🗄️",
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
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500">Confidence Threshold</div>
            <div className="text-lg font-bold text-blue-400">
              {Math.round((agent.confidenceThreshold || 0.75) * 100)}%
            </div>
          </div>
        </div>
      )}

      {/* Connected Integrations */}
      {agentIntegrations.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Link2 className="w-4 h-4 text-purple-400" />
            <span className="text-sm font-medium text-gray-300">Connected Systems</span>
            <span className="text-xs bg-purple-900/40 text-purple-400 px-2 py-0.5 rounded-full">
              Live data will be pulled at execution time
            </span>
          </div>
          <div className="flex flex-wrap gap-2">
            {agentIntegrations.map((a: any) => (
              <div
                key={a.id}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs border ${
                  a.integrationStatus === "active"
                    ? "bg-green-950/20 border-green-800/50 text-green-400"
                    : "bg-red-950/20 border-red-800/50 text-red-400"
                }`}
              >
                <span>{integrationIcon[a.integrationType] || "🔗"}</span>
                <span>{a.integrationName}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Input */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4">
        <h2 className="font-semibold text-white flex items-center gap-2">
          <Zap className="w-4 h-4 text-yellow-400" />
          Task Input
        </h2>

        {/* Task description */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Task Description</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={running}
            rows={4}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none disabled:opacity-50"
            placeholder="Describe what you want this agent to do. Be specific — e.g. 'Review the attached invoice CSV and flag any amounts over $10,000 for approval.'"
          />
        </div>

        {/* Output Format */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">Output Format</label>
          <div className="relative">
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value)}
              disabled={running}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 appearance-none disabled:opacity-50 pr-10"
            >
              {OUTPUT_FORMATS.map((f) => (
                <option key={f.value} value={f.value}>{f.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          </div>
        </div>

        {/* File Upload */}
        <div>
          <label className="text-xs text-gray-400 mb-1.5 block">
            Attach Files (optional) — PDF, CSV, Excel, Word, TXT — up to 5 files, 20MB each
          </label>
          <div
            onClick={() => !running && fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
              running
                ? "border-gray-700 opacity-50 cursor-not-allowed"
                : "border-gray-700 hover:border-blue-500 cursor-pointer"
            }`}
          >
            <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
            <p className="text-sm text-gray-400">Click to upload or drag &amp; drop</p>
            <p className="text-xs text-gray-600 mt-0.5">The agent will read and reason over the file content</p>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept={ACCEPTED_FILE_TYPES}
            onChange={handleFileChange}
            className="hidden"
          />
          {files.length > 0 && (
            <div className="mt-2 space-y-1">
              {files.map((file, i) => (
                <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2 text-sm">
                  <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-gray-300 flex-1 truncate">{file.name}</span>
                  <span className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                  <button
                    onClick={() => removeFile(i)}
                    disabled={running}
                    className="text-gray-500 hover:text-red-400 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {error && <div className="text-red-400 text-sm">{error}</div>}

        <button
          onClick={handleRun}
          disabled={running || !input.trim()}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          {running ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> Running...</>
          ) : (
            <><Play className="w-4 h-4" /> Execute Agent</>
          )}
        </button>
      </div>

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
            <div className={`w-2 h-2 rounded-full ${running ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
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
                {getConfidencePct(execution.confidenceScore || 0)}%
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
                {execution.processingTimeMs ? `${(execution.processingTimeMs / 1000).toFixed(1)}s` : "—"}
              </div>
              <div className="text-xs text-gray-400 mt-1">Processing Time</div>
            </div>
          </div>

          {/* Output */}
          {execution.output && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm font-medium text-gray-300">Output</div>
                <button
                  onClick={handleCopyOutput}
                  className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                >
                  {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  {copied ? "Copied!" : "Copy"}
                </button>
              </div>
              <div className="bg-gray-800 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
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
                  {execution.escalationReason || `Confidence (${getConfidencePct(execution.confidenceScore || 0)}%) fell below the agent's escalation threshold. A human supervisor must review before proceeding.`}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
