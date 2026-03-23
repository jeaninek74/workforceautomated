import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Bot, Play, Loader2, CheckCircle, XCircle, AlertTriangle,
  ArrowLeft, Shield, Upload, X, FileText, ChevronDown, Zap,
  Link2, Copy, Check, MessageSquare, ArrowRight, RefreshCw,
  Clock, Lightbulb, History, PlusCircle, ChevronUp,
  Download, Sparkles, AlertCircle
} from "lucide-react";
import { agentsApi, executionsApi, integrationsApi } from "../lib/api";
import { api } from "../lib/api";

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

// Example prompts keyed by common role keywords
const EXAMPLE_PROMPTS: Record<string, string[]> = {
  default: [
    "Review the attached document and summarize the key findings.",
    "Analyze the data and identify the top 3 action items.",
    "Draft a professional response to the situation described below.",
  ],
  payroll: [
    "Process payroll for the pay period ending this Friday. Flag any hours over 40 for overtime review.",
    "Audit the attached payroll CSV for discrepancies and generate a variance report.",
    "Calculate net pay for 12 employees after federal and state tax deductions.",
  ],
  finance: [
    "Review the attached invoice batch and flag any amounts over $10,000 for approval.",
    "Reconcile the accounts payable ledger against the attached bank statement.",
    "Generate a cash flow forecast for Q2 based on the attached revenue data.",
  ],
  hr: [
    "Screen the attached resumes and rank the top 5 candidates for the Software Engineer role.",
    "Draft an onboarding checklist for a new Marketing Manager starting Monday.",
    "Analyze employee survey responses and identify the top 3 engagement concerns.",
  ],
  legal: [
    "Review the attached contract and flag any non-standard clauses or missing provisions.",
    "Summarize the key obligations and deadlines in the attached service agreement.",
    "Draft a cease and desist letter based on the situation described below.",
  ],
  support: [
    "Analyze the attached support ticket backlog and prioritize by urgency and impact.",
    "Draft a response to the customer complaint described below.",
    "Identify the top 5 recurring issues from the attached support logs.",
  ],
  sales: [
    "Analyze the attached pipeline data and identify the top 10 deals at risk of churning.",
    "Draft a follow-up email sequence for leads who attended last week's webinar.",
    "Generate a competitive analysis summary based on the attached market data.",
  ],
  it: [
    "Review the attached system logs and identify any security anomalies or performance issues.",
    "Generate a vulnerability assessment report based on the attached scan results.",
    "Draft a change management plan for the database migration described below.",
  ],
  cybersecurity: [
    "Analyze the attached network logs for indicators of compromise (IOCs).",
    "Review the attached security policy and identify gaps against NIST CSF.",
    "Generate an incident response runbook for a ransomware attack scenario.",
  ],
};

const ACCEPTED_FILE_TYPES = ".pdf,.csv,.xlsx,.xls,.docx,.doc,.txt,.md";
const MAX_FILE_SIZE_MB = 20;

function AgentCommunicationsPanel({ messages }: { messages: any[] }) {
  const [expanded, setExpanded] = useState(false);
  const typeConfig: Record<string, { color: string; bg: string; label: string }> = {
    handoff: { color: "text-blue-400", bg: "bg-blue-500/10 border-blue-500/20", label: "Handoff" },
    branch_decision: { color: "text-purple-400", bg: "bg-purple-500/10 border-purple-500/20", label: "Branch Decision" },
    question: { color: "text-yellow-400", bg: "bg-yellow-500/10 border-yellow-500/20", label: "Question" },
    answer: { color: "text-green-400", bg: "bg-green-500/10 border-green-500/20", label: "Answer" },
    note: { color: "text-gray-400", bg: "bg-gray-700/50 border-gray-600", label: "Note" },
  };
  return (
    <div className="border border-gray-700 rounded-xl overflow-hidden">
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gray-800 hover:bg-gray-750 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-blue-400" />
          <span className="text-sm font-medium text-gray-200">Agent Communications</span>
          <span className="text-xs bg-blue-900/40 text-blue-400 px-2 py-0.5 rounded-full">
            {messages.length} message{messages.length !== 1 ? "s" : ""}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`} />
      </button>
      {expanded && (
        <div className="p-4 space-y-3 bg-gray-900">
          {messages.map((msg: any, idx: number) => {
            const cfg = typeConfig[msg.type] || typeConfig.note;
            return (
              <div key={idx} className={`rounded-lg border p-3 ${cfg.bg}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    {msg.fromAgent && (
                      <>
                        <div className="flex items-center gap-1 text-xs text-gray-300">
                          <Bot className="w-3 h-3" />
                          <span className="font-medium">{msg.fromAgent}</span>
                        </div>
                        {msg.toAgent && (
                          <>
                            <ArrowRight className="w-3 h-3 text-gray-500" />
                            <div className="flex items-center gap-1 text-xs text-gray-300">
                              <Bot className="w-3 h-3" />
                              <span className="font-medium">{msg.toAgent}</span>
                            </div>
                          </>
                        )}
                      </>
                    )}
                  </div>
                  <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${cfg.color}`}>{cfg.label}</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">{msg.content}</p>
                {msg.timestamp && (
                  <div className="text-xs text-gray-600 mt-1.5">{new Date(msg.timestamp).toLocaleTimeString()}</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Render output with basic markdown-like formatting
function OutputRenderer({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <div className="text-sm text-gray-300 leading-relaxed space-y-1">
      {lines.map((line, i) => {
        if (line.startsWith("## ")) return <h3 key={i} className="text-base font-semibold text-white mt-3 mb-1">{line.slice(3)}</h3>;
        if (line.startsWith("# ")) return <h2 key={i} className="text-lg font-bold text-white mt-4 mb-2">{line.slice(2)}</h2>;
        if (line.startsWith("### ")) return <h4 key={i} className="text-sm font-semibold text-blue-300 mt-2 mb-1">{line.slice(4)}</h4>;
        if (line.startsWith("- ") || line.startsWith("* ")) return (
          <div key={i} className="flex gap-2">
            <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
        if (/^\d+\.\s/.test(line)) {
          const match = line.match(/^(\d+)\.\s(.*)$/);
          if (match) return (
            <div key={i} className="flex gap-2">
              <span className="text-blue-400 font-medium flex-shrink-0 w-5">{match[1]}.</span>
              <span>{match[2]}</span>
            </div>
          );
        }
        if (line.startsWith("**") && line.endsWith("**")) return <p key={i} className="font-semibold text-white">{line.slice(2, -2)}</p>;
        if (line === "" || line === "---") return <div key={i} className="h-2" />;
        return <p key={i}>{line}</p>;
      })}
    </div>
  );
}

// Task history item type
interface TaskHistoryItem {
  input: string;
  timestamp: string;
  status: string;
  confidence?: number;
}

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
  const [showExamples, setShowExamples] = useState(false);
  const [taskHistory, setTaskHistory] = useState<TaskHistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [appendText, setAppendText] = useState("");
  const [showAppend, setShowAppend] = useState(false);
  // Scope check / self-upgrade state
  const [scopeCheckLoading, setScopeCheckLoading] = useState(false);
  const [upgradeModal, setUpgradeModal] = useState<{
    visible: boolean;
    reason: string;
    suggestedCapabilities: string[];
    agentName: string;
  }>({ visible: false, reason: "", suggestedCapabilities: [], agentName: "" });
  const [upgrading, setUpgrading] = useState(false);
  const logsRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskInputRef = useRef<HTMLTextAreaElement>(null);

  // localStorage key per agent
  const storageKey = id ? `wfa_task_${id}` : null;
  const historyKey = id ? `wfa_task_history_${id}` : null;

  // Load persisted input and history on mount
  useEffect(() => {
    if (!id) return;
    agentsApi.get(Number(id)).then((r) => setAgent(r.data)).catch(() => {});
    integrationsApi.getAgentAssignments(Number(id))
      .then((r) => setAgentIntegrations(r.data?.assignments || []))
      .catch(() => {});

    // Restore saved task input
    if (storageKey) {
      const saved = localStorage.getItem(storageKey);
      if (saved) setInput(saved);
    }
    // Restore task history
    if (historyKey) {
      try {
        const savedHistory = localStorage.getItem(historyKey);
        if (savedHistory) setTaskHistory(JSON.parse(savedHistory));
      } catch (_) {}
    }

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [id]);

  // Persist input to localStorage whenever it changes
  useEffect(() => {
    if (storageKey) {
      localStorage.setItem(storageKey, input);
    }
  }, [input, storageKey]);

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

  const removeFile = (index: number) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleCopyOutput = () => {
    if (execution?.output) {
      navigator.clipboard.writeText(execution.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // After execution completes, keep the input visible and allow building on it
  const handleRunAgain = () => {
    setExecution(null);
    setLogs([]);
    setError("");
    // Input is intentionally NOT cleared — user can build on it
    // Scroll task input into view
    setTimeout(() => taskInputRef.current?.focus(), 100);
  };

  // Append additional context to the existing task
  const handleAppend = () => {
    if (!appendText.trim()) return;
    const separator = input.trim() ? "\n\n" : "";
    const newInput = input + separator + appendText.trim();
    setInput(newInput);
    setAppendText("");
    setShowAppend(false);
    setTimeout(() => taskInputRef.current?.focus(), 100);
  };

  // Use a history item as the new task input
  const handleUseHistoryItem = (item: TaskHistoryItem) => {
    setInput(item.input);
    setShowHistory(false);
    setExecution(null);
    setLogs([]);
    setTimeout(() => taskInputRef.current?.focus(), 100);
  };

  const getConfidencePct = (score: number) => Math.round(score <= 1 ? score * 100 : score);

  // Get example prompts based on agent role
  const getExamples = () => {
    if (!agent?.role) return EXAMPLE_PROMPTS.default;
    const role = agent.role.toLowerCase();
    for (const key of Object.keys(EXAMPLE_PROMPTS)) {
      if (key !== "default" && role.includes(key)) return EXAMPLE_PROMPTS[key];
    }
    return EXAMPLE_PROMPTS.default;
  };

  // ─── Download output helpers ───────────────────────────────────────────────
  const downloadOutput = (format: "txt" | "csv" | "pdf") => {
    if (!execution?.output) return;
    const text = typeof execution.output === "string" ? execution.output : JSON.stringify(execution.output, null, 2);
    const agentLabel = agent?.name?.replace(/[^a-z0-9]/gi, "_") || "output";
    const ts = new Date().toISOString().slice(0, 10);
    if (format === "txt") {
      const blob = new Blob([text], { type: "text/plain" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${agentLabel}_${ts}.txt`; a.click();
      URL.revokeObjectURL(url);
    } else if (format === "csv") {
      // Wrap output as a single CSV cell with proper escaping
      const escaped = text.replace(/"/g, '""');
      const csv = `"Agent","Date","Confidence","Risk","Output"\n"${agentLabel}","${ts}","${Math.round((execution.confidenceScore || 0) * 100)}%","${execution.riskLevel || "low"}","${escaped}"`;
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a"); a.href = url; a.download = `${agentLabel}_${ts}.csv`; a.click();
      URL.revokeObjectURL(url);
    } else if (format === "pdf") {
      // Use print-to-PDF via a new window with formatted HTML
      const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${agentLabel} Output</title><style>body{font-family:Arial,sans-serif;padding:40px;max-width:800px;margin:0 auto;color:#111}h1{font-size:20px;margin-bottom:4px}p.meta{font-size:12px;color:#666;margin-bottom:24px}pre{white-space:pre-wrap;word-wrap:break-word;font-size:13px;line-height:1.6;background:#f5f5f5;padding:20px;border-radius:6px}</style></head><body><h1>${agent?.name || "Agent"} — Output</h1><p class="meta">Date: ${new Date().toLocaleString()} &nbsp;|&nbsp; Confidence: ${Math.round((execution.confidenceScore || 0) * 100)}% &nbsp;|&nbsp; Risk: ${execution.riskLevel || "low"}</p><pre>${text.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</pre></body></html>`;
      const win = window.open("", "_blank");
      if (win) { win.document.write(html); win.document.close(); win.focus(); setTimeout(() => win.print(), 500); }
    }
  };

  // ─── Scope check + upgrade logic ────────────────────────────────────────────
  const handleUpgradeAgent = async () => {
    if (!id || !agent) return;
    setUpgrading(true);
    try {
      // Expand agent's role and system prompt to include the new task scope
      const newRole = `${agent.role || "General purpose"} + ${upgradeModal.suggestedCapabilities.join(", ")}`;
      const newSystemPrompt = (agent.systemPrompt || "") +
        `\n\n[Self-Upgrade] This agent has been expanded to handle: ${upgradeModal.suggestedCapabilities.join(", ")}. ` +
        `Reason: ${upgradeModal.reason}`;
      await agentsApi.update(Number(id), { role: newRole, systemPrompt: newSystemPrompt });
      setAgent((prev: any) => ({ ...prev, role: newRole, systemPrompt: newSystemPrompt }));
      setUpgradeModal({ visible: false, reason: "", suggestedCapabilities: [], agentName: "" });
      // Now run the execution
      await executeTask();
    } catch {
      setError("Failed to upgrade agent. Please try again.");
    } finally {
      setUpgrading(false);
    }
  };

  const executeTask = async () => {
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
    addLog("Sending task to AI engine (OpenAI GPT-4o)...");

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

            const historyItem: TaskHistoryItem = {
              input: input.trim(),
              timestamp: new Date().toISOString(),
              status: exec.status,
              confidence: exec.confidenceScore,
            };
            setTaskHistory((prev) => {
              const updated = [historyItem, ...prev].slice(0, 20);
              if (historyKey) localStorage.setItem(historyKey, JSON.stringify(updated));
              return updated;
            });

            if (exec.status === "success" || exec.status === "completed") {
              addLog(`Execution completed. Confidence: ${getConfidencePct(exec.confidenceScore || 0)}%`);
              addLog(`Risk level: ${exec.riskLevel || "low"}`);
              if (exec.tokenCount) addLog(`Tokens used: ${exec.tokenCount}`);
              const msgs = exec.metadata?.agentMessages || [];
              if (msgs.length > 0) addLog(`${msgs.length} agent communication(s) recorded`);
            } else if (exec.status === "escalated") {
              addLog(`Escalated for human review (confidence: ${getConfidencePct(exec.confidenceScore || 0)}%)`);
            } else {
              addLog(`Execution failed: ${exec.output || "Unknown error"}`);
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
      addLog("Failed to start execution");
    }
  };

  const handleRun = async () => {
    if (!input.trim() || !id) return;
    // Pre-flight scope check
    setScopeCheckLoading(true);
    try {
      const scopeRes = await api.post("/executions/check-scope", { agentId: id, input });
      const { inScope, reason, suggestedCapabilities, agentName } = scopeRes.data;
      setScopeCheckLoading(false);
      if (!inScope) {
        setUpgradeModal({ visible: true, reason, suggestedCapabilities, agentName });
        return;
      }
    } catch {
      // If scope check fails, proceed with execution anyway
      setScopeCheckLoading(false);
    }
    await executeTask();
  };

  const confidenceColor = (score: number) => {
    const pct = score <= 1 ? score * 100 : score;
    if (pct >= 80) return "text-emerald-400";
    if (pct >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  const riskBadge: Record<string, string> = {
    low: "bg-emerald-950/50 text-emerald-400 border-emerald-800",
    medium: "bg-yellow-950/50 text-yellow-400 border-yellow-800",
    high: "bg-orange-950/50 text-orange-400 border-orange-800",
    critical: "bg-red-950/50 text-red-400 border-red-800",
  };

  const integrationIcon: Record<string, string> = {
    google_drive: "Drive", slack: "Slack", rest_api: "API", webhook: "Webhook", database: "DB",
  };

  const agentFirstName = agent?.name?.split(" — ")[0] || agent?.name;

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          className="w-9 h-9 flex items-center justify-center bg-gray-900 border border-gray-800 hover:border-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-white">Run Agent</h1>
          {agent && (
            <p className="text-gray-400 text-sm mt-0.5">
              {agentFirstName} &mdash; <span className="text-gray-500">{agent.role}</span>
            </p>
          )}
        </div>
        {/* Task History button */}
        {taskHistory.length > 0 && (
          <button
            onClick={() => setShowHistory((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-900 border border-gray-800 hover:border-gray-700 px-3 py-2 rounded-lg transition-colors"
          >
            <History className="w-3.5 h-3.5" />
            Task History ({taskHistory.length})
            {showHistory ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </button>
        )}
      </div>

      {/* Task History Panel */}
      {showHistory && taskHistory.length > 0 && (
        <div className="border border-gray-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 bg-gray-900 border-b border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <History className="w-4 h-4 text-blue-400" />
              <span className="text-sm font-medium text-white">Previous Tasks</span>
              <span className="text-xs text-gray-500">Click any task to reuse or build on it</span>
            </div>
            <button onClick={() => {
              if (historyKey) localStorage.removeItem(historyKey);
              setTaskHistory([]);
              setShowHistory(false);
            }} className="text-xs text-gray-600 hover:text-red-400 transition-colors">Clear history</button>
          </div>
          <div className="divide-y divide-gray-800 max-h-72 overflow-y-auto">
            {taskHistory.map((item, i) => (
              <button
                key={i}
                onClick={() => handleUseHistoryItem(item)}
                className="w-full text-left px-4 py-3 hover:bg-gray-800/50 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="text-sm text-gray-300 group-hover:text-white line-clamp-2 flex-1">{item.input}</p>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-1.5 py-0.5 rounded border ${
                      item.status === "success" || item.status === "completed"
                        ? "bg-emerald-950/50 text-emerald-400 border-emerald-800"
                        : item.status === "escalated"
                        ? "bg-orange-950/50 text-orange-400 border-orange-800"
                        : "bg-red-950/50 text-red-400 border-red-800"
                    }`}>
                      {item.status === "completed" ? "success" : item.status}
                    </span>
                    {item.confidence !== undefined && (
                      <span className={`text-xs font-medium ${confidenceColor(item.confidence)}`}>
                        {getConfidencePct(item.confidence)}%
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {new Date(item.timestamp).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Agent Info Bar */}
      {agent && (
        <div className="flex items-center gap-4 bg-gray-900 border border-gray-800 rounded-xl px-5 py-3">
          <div className="w-9 h-9 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <Bot className="w-4 h-4 text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white">{agent.name}</div>
            <div className="text-xs text-gray-500">{agent.role}</div>
          </div>
          <div className="text-right flex-shrink-0">
            <div className="text-xs text-gray-500">Confidence Threshold</div>
            <div className="text-base font-bold text-blue-400">
              {Math.round((agent.confidenceThreshold || 0.75) * 100)}%
            </div>
          </div>
          {agentIntegrations.length > 0 && (
            <div className="border-l border-gray-700 pl-4 flex-shrink-0">
              <div className="text-xs text-gray-500 mb-1">Connected</div>
              <div className="flex gap-1">
                {agentIntegrations.slice(0, 3).map((a: any) => (
                  <span key={a.id} className="text-xs bg-purple-900/30 text-purple-400 border border-purple-800/50 px-1.5 py-0.5 rounded">
                    {integrationIcon[a.integrationType] || a.integrationType}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Task Input — always visible, never hidden */}
      <div className="border border-gray-800 rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800 bg-gray-900/50 flex items-center justify-between">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-400" />
            Task
            {execution && (
              <span className="text-xs font-normal text-gray-500 ml-1">— edit and re-run, or build on your previous task below</span>
            )}
          </h2>
          <button
            onClick={() => setShowExamples((v) => !v)}
            className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            Example prompts
          </button>
        </div>

        {/* Example prompts */}
        {showExamples && (
          <div className="px-5 py-3 bg-blue-950/20 border-b border-blue-900/30 space-y-2">
            <p className="text-xs text-blue-400 font-medium">Click to use an example:</p>
            {getExamples().map((ex, i) => (
              <button
                key={i}
                onClick={() => { setInput(ex); setShowExamples(false); }}
                className="w-full text-left text-xs text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50 rounded-lg px-3 py-2 transition-colors"
              >
                {ex}
              </button>
            ))}
          </div>
        )}

        <div className="p-5 space-y-4 bg-gray-900">
          {/* Task description — persistent, never cleared */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs text-gray-400">What should {agentFirstName || "the agent"} do?</label>
              <span className="text-xs text-gray-600">Auto-saved · {input.length} characters</span>
            </div>
            <textarea
              ref={taskInputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={running}
              rows={6}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-y disabled:opacity-50"
              placeholder={`Describe the task in detail. Your input is automatically saved and never cleared — build on it across multiple runs.`}
            />
            <div className="flex items-center gap-2 mt-2">
              {/* Append to task */}
              <button
                onClick={() => setShowAppend((v) => !v)}
                disabled={running}
                className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-blue-400 disabled:opacity-50 transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Add context
              </button>
              <span className="text-gray-700">·</span>
              {input.length > 0 && (
                <button
                  onClick={() => {
                    if (storageKey) localStorage.removeItem(storageKey);
                    setInput("");
                  }}
                  disabled={running}
                  className="text-xs text-gray-600 hover:text-red-400 disabled:opacity-50 transition-colors"
                >
                  Clear task
                </button>
              )}
            </div>
          </div>

          {/* Append context panel */}
          {showAppend && (
            <div className="bg-blue-950/20 border border-blue-900/30 rounded-lg p-4 space-y-3">
              <p className="text-xs text-blue-400 font-medium">Add context or follow-up instructions to your existing task:</p>
              <textarea
                value={appendText}
                onChange={(e) => setAppendText(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
                placeholder="e.g. Also include a risk assessment section. Focus on Q1 data only."
                autoFocus
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAppend}
                  disabled={!appendText.trim()}
                  className="flex items-center gap-1.5 text-xs bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-3 py-1.5 rounded-lg transition-colors"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  Append to task
                </button>
                <button
                  onClick={() => { setShowAppend(false); setAppendText(""); }}
                  className="text-xs text-gray-500 hover:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

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
              Attach Files — PDF, CSV, Excel, Word, TXT (up to 5 files, 20MB each)
            </label>
            <div
              onClick={() => !running && fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                running ? "border-gray-700 opacity-50 cursor-not-allowed" : "border-gray-700 hover:border-blue-500 cursor-pointer"
              }`}
            >
              <Upload className="w-5 h-5 text-gray-500 mx-auto mb-1" />
              <p className="text-sm text-gray-400">Click to upload or drag &amp; drop</p>
              <p className="text-xs text-gray-600 mt-0.5">The agent will read and reason over the file content</p>
            </div>
            <input ref={fileInputRef} type="file" multiple accept={ACCEPTED_FILE_TYPES} onChange={handleFileChange} className="hidden" />
            {files.length > 0 && (
              <div className="mt-2 space-y-1">
                {files.map((file, i) => (
                  <div key={i} className="flex items-center gap-2 bg-gray-800 rounded-lg px-3 py-2">
                    <FileText className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span className="text-gray-300 flex-1 truncate">{file.name}</span>
                    <span className="text-gray-500 text-xs">{(file.size / 1024 / 1024).toFixed(1)}MB</span>
                    <button onClick={() => removeFile(i)} disabled={running} className="text-gray-500 hover:text-red-400 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && <div className="text-red-400 text-sm bg-red-950/30 border border-red-800 rounded-lg px-3 py-2">{error}</div>}

          <button
            onClick={handleRun}
            disabled={running || scopeCheckLoading || !input.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {scopeCheckLoading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Checking task scope...</>
            ) : running ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Running — this takes about 7-10 seconds...</>
            ) : (
              <><Play className="w-4 h-4" /> Execute Agent</>
            )}
          </button>
        </div>
      </div>

      {/* Execution Logs */}
      {logs.length > 0 && (
        <div className="bg-gray-950 border border-gray-800 rounded-xl overflow-hidden">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-800 bg-gray-900">
            <div className={`w-2 h-2 rounded-full ${running ? "bg-green-500 animate-pulse" : "bg-gray-500"}`} />
            <span className="text-xs font-mono text-gray-400">Execution Log</span>
            {!running && <span className="text-xs text-gray-600 ml-auto">Completed</span>}
          </div>
          <div ref={logsRef} className="p-4 h-36 overflow-y-auto font-mono text-xs text-green-400 space-y-1">
            {logs.map((log, i) => <div key={i}>{log}</div>)}
            {running && <div className="animate-pulse">▋</div>}
          </div>
        </div>
      )}

      {/* Result */}
      {execution && (
        <div className="border border-gray-800 rounded-xl overflow-hidden">
          {/* Result header */}
          <div className="flex items-center justify-between px-5 py-4 bg-gray-900 border-b border-gray-800">
            <div className="flex items-center gap-2">
              {(execution.status === "completed" || execution.status === "success") && <CheckCircle className="w-5 h-5 text-emerald-400" />}
              {execution.status === "failed" && <XCircle className="w-5 h-5 text-red-400" />}
              {execution.status === "escalated" && <AlertTriangle className="w-5 h-5 text-orange-400" />}
              <h2 className="font-semibold text-white">
                {execution.status === "completed" || execution.status === "success" ? "Task Complete" :
                 execution.status === "escalated" ? "Escalated for Review" : "Execution Failed"}
              </h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRunAgain}
                className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 px-3 py-1.5 rounded-lg transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Edit &amp; Re-run
              </button>
            </div>
          </div>

          <div className="p-5 space-y-5 bg-gray-900">
            {/* Metrics row */}
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className={`text-2xl font-bold ${confidenceColor(execution.confidenceScore || 0)}`}>
                  {getConfidencePct(execution.confidenceScore || 0)}%
                </div>
                <div className="text-xs text-gray-500 mt-1">Confidence</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded border ${riskBadge[execution.riskLevel] || riskBadge.low}`}>
                  <Shield className="w-3 h-3" />
                  {execution.riskLevel || "low"}
                </div>
                <div className="text-xs text-gray-500 mt-2">Risk Level</div>
              </div>
              <div className="bg-gray-800 rounded-lg p-3 text-center">
                <div className="text-2xl font-bold text-white flex items-center justify-center gap-1">
                  <Clock className="w-4 h-4 text-gray-400" />
                  {execution.processingTimeMs ? `${(execution.processingTimeMs / 1000).toFixed(1)}s` : "—"}
                </div>
                <div className="text-xs text-gray-500 mt-1">Processing Time</div>
              </div>
            </div>

            {/* Output */}
            {execution.output && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="text-sm font-medium text-gray-300">Output</div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyOutput}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
                    >
                      {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                    <span className="text-gray-700">|</span>
                    <span className="text-xs text-gray-600">Download:</span>
                    <button
                      onClick={() => downloadOutput("txt")}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-blue-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded transition-colors"
                      title="Download as plain text"
                    >
                      <Download className="w-3 h-3" /> TXT
                    </button>
                    <button
                      onClick={() => downloadOutput("csv")}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-emerald-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded transition-colors"
                      title="Download as CSV (Excel-compatible)"
                    >
                      <Download className="w-3 h-3" /> CSV
                    </button>
                    <button
                      onClick={() => downloadOutput("pdf")}
                      className="flex items-center gap-1 text-xs text-gray-500 hover:text-red-400 bg-gray-800 hover:bg-gray-700 border border-gray-700 px-2 py-1 rounded transition-colors"
                      title="Download as PDF"
                    >
                      <Download className="w-3 h-3" /> PDF
                    </button>
                  </div>
                </div>
                <div className="bg-gray-800 rounded-lg p-5 max-h-[500px] overflow-y-auto">
                  {typeof execution.output === "string" ? (
                    <OutputRenderer text={execution.output} />
                  ) : (
                    <pre className="text-sm text-gray-300 whitespace-pre-wrap">{JSON.stringify(execution.output, null, 2)}</pre>
                  )}
                </div>
              </div>
            )}

            {/* Agent Communications */}
            {(() => {
              const msgs: any[] = execution.metadata?.agentMessages || [];
              if (msgs.length === 0) return null;
              return <AgentCommunicationsPanel messages={msgs} />;
            })()}

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

            {/* Build on task prompt */}
            <div className="border-t border-gray-800 pt-4 flex items-center justify-between">
              <p className="text-xs text-gray-500">Your task is saved above — edit it, add context, or run a new task.</p>
              <button
                onClick={() => {
                  setShowAppend(true);
                  setExecution(null);
                  setLogs([]);
                  setTimeout(() => taskInputRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
                }}
                className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                Build on this task
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ─── Self-Upgrade Modal ─────────────────────────────────────────────── */}
      {upgradeModal.visible && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="bg-gray-900 border border-yellow-700/60 rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden">
            <div className="flex items-start gap-4 px-6 py-5 border-b border-gray-800">
              <div className="w-10 h-10 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white">Task Outside Agent Scope</h2>
                <p className="text-sm text-gray-400 mt-1">
                  <span className="font-medium text-yellow-300">{upgradeModal.agentName}</span> was not programmed for this task.
                </p>
              </div>
            </div>
            <div className="px-6 py-5 space-y-4">
              <div className="bg-gray-800/60 border border-gray-700 rounded-xl p-4">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-gray-300">{upgradeModal.reason}</p>
                </div>
              </div>
              {upgradeModal.suggestedCapabilities.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Capabilities needed for this task:</p>
                  <div className="flex flex-wrap gap-2">
                    {upgradeModal.suggestedCapabilities.map((cap, i) => (
                      <span key={i} className="text-xs bg-blue-950/50 text-blue-300 border border-blue-800/50 px-2.5 py-1 rounded-full">{cap}</span>
                    ))}
                  </div>
                </div>
              )}
              <p className="text-sm text-gray-400">What would you like to do?</p>
              <div className="grid grid-cols-1 gap-3">
                <button
                  onClick={handleUpgradeAgent}
                  disabled={upgrading}
                  className="flex items-start gap-3 text-left bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/40 hover:border-blue-500 rounded-xl px-4 py-4 transition-colors disabled:opacity-50"
                >
                  <Sparkles className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white flex items-center gap-2">
                      Upgrade this agent for this task
                      {upgrading && <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-400" />}
                    </div>
                    <div className="text-xs text-gray-400 mt-0.5">Expand {upgradeModal.agentName}'s capabilities and immediately run the task.</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setUpgradeModal({ visible: false, reason: "", suggestedCapabilities: [], agentName: "" });
                    navigate("/agents/new", { state: { prefillTask: input, prefillCapabilities: upgradeModal.suggestedCapabilities } });
                  }}
                  className="flex items-start gap-3 text-left bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/40 hover:border-purple-500 rounded-xl px-4 py-4 transition-colors"
                >
                  <Bot className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <div className="text-sm font-semibold text-white">Create a new agent</div>
                    <div className="text-xs text-gray-400 mt-0.5">Build a purpose-built agent for this task in the Agent Builder.</div>
                  </div>
                </button>
                <button
                  onClick={() => {
                    setUpgradeModal({ visible: false, reason: "", suggestedCapabilities: [], agentName: "" });
                    executeTask();
                  }}
                  className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 justify-center py-2 transition-colors"
                >
                  Run anyway without upgrading
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
