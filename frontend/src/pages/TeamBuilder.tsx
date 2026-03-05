import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Users, Bot, Plus, X, Loader2, ArrowDown, Save, ChevronRight,
  ChevronLeft, Zap, GitBranch, Layers, ArrowRight, GripVertical,
  AlertTriangle, CheckCircle2, Info, Trash2, Play, FileText,
  TrendingUp, Activity
} from "lucide-react";
import { agentsApi, teamsApi, executionsApi } from "../lib/api";

type ExecutionMode = "sequential" | "parallel" | "conditional";

interface BranchingRule {
  condition: string;
  fromAgentId: number;
  toAgentId: number;
  elseAgentId?: number;
}

const EXECUTION_MODES = [
  {
    id: "sequential" as ExecutionMode,
    icon: ArrowDown,
    label: "Sequential",
    color: "blue",
    description: "Agents run one after another. Each agent receives the previous agent's output as context — ideal for multi-step analysis pipelines.",
    example: "Extract → Analyse → Recommend",
  },
  {
    id: "parallel" as ExecutionMode,
    icon: Layers,
    label: "Parallel",
    color: "green",
    description: "All agents run simultaneously on the same input. Results are merged into a combined output — ideal for independent specialist reviews.",
    example: "Legal + Finance + Risk all review at once",
  },
  {
    id: "conditional" as ExecutionMode,
    icon: GitBranch,
    label: "Conditional",
    color: "purple",
    description: "Agents route to different paths based on conditions like risk level or confidence score — ideal for triage and escalation workflows.",
    example: "If risk=high → Escalation Agent, else → Approval Agent",
  },
];

const CONDITION_PRESETS = [
  { label: "Risk is High", value: "riskLevel=high" },
  { label: "Risk is Critical", value: "riskLevel=critical" },
  { label: "Risk is Medium", value: "riskLevel=medium" },
  { label: "Confidence below 60%", value: "confidence<0.6" },
  { label: "Confidence below 75%", value: "confidence<0.75" },
  { label: "Confidence above 85%", value: "confidence>0.85" },
  { label: "Output contains ESCALATE", value: "output_contains:ESCALATE" },
  { label: "Output contains APPROVE", value: "output_contains:APPROVE" },
  { label: "Output contains REJECT", value: "output_contains:REJECT" },
];

export default function TeamBuilder() {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const isEditing = Boolean(id);

  const [step, setStep] = useState(1);
  const [agents, setAgents] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    description: "",
    executionMode: "sequential" as ExecutionMode,
    memberAgentIds: [] as number[],
    executionOrder: [] as number[],
    branchingRules: [] as BranchingRule[],
    confidenceThreshold: 70,
  });

  useEffect(() => {
    agentsApi.list({ status: "active" }).then((r) => setAgents(r.data?.agents || []));
    if (isEditing && id) {
      teamsApi.get(Number(id)).then((r) => {
        const t = r.data?.team;
        if (t) {
          setForm({
            name: t.name || "",
            description: t.description || "",
            executionMode: t.executionMode || "sequential",
            memberAgentIds: t.memberAgentIds || [],
            executionOrder: t.executionOrder || t.memberAgentIds || [],
            branchingRules: t.branchingRules || [],
            confidenceThreshold: Math.round((t.confidenceThreshold || 0.7) * 100),
          });
        }
        setLoading(false);
      });
    }
  }, [id, isEditing]);

  const toggleAgent = (agentId: number) => {
    setForm((prev) => {
      const isSelected = prev.memberAgentIds.includes(agentId);
      const newIds = isSelected
        ? prev.memberAgentIds.filter((a) => a !== agentId)
        : [...prev.memberAgentIds, agentId];
      const newOrder = isSelected
        ? prev.executionOrder.filter((a) => a !== agentId)
        : [...prev.executionOrder, agentId];
      return { ...prev, memberAgentIds: newIds, executionOrder: newOrder };
    });
  };

  const moveAgent = (index: number, direction: "up" | "down") => {
    const newOrder = [...form.executionOrder];
    const swapIdx = direction === "up" ? index - 1 : index + 1;
    if (swapIdx < 0 || swapIdx >= newOrder.length) return;
    [newOrder[index], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[index]];
    setForm((prev) => ({ ...prev, executionOrder: newOrder }));
  };

  const addBranchingRule = () => {
    if (form.executionOrder.length < 2) return;
    setForm((prev) => ({
      ...prev,
      branchingRules: [
        ...prev.branchingRules,
        {
          condition: "riskLevel=high",
          fromAgentId: prev.executionOrder[0],
          toAgentId: prev.executionOrder[1],
          elseAgentId: prev.executionOrder.length > 2 ? prev.executionOrder[2] : undefined,
        },
      ],
    }));
  };

  const updateRule = (idx: number, patch: Partial<BranchingRule>) => {
    setForm((prev) => ({
      ...prev,
      branchingRules: prev.branchingRules.map((r, i) => (i === idx ? { ...r, ...patch } : r)),
    }));
  };

  const removeRule = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      branchingRules: prev.branchingRules.filter((_, i) => i !== idx),
    }));
  };

  const handleSave = async () => {
    if (!form.name) { setError("Team name is required"); return; }
    if (form.memberAgentIds.length < 2) { setError("A team needs at least 2 agents"); return; }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        confidenceThreshold: form.confidenceThreshold / 100,
        executionOrder: form.executionOrder,
        branchingRules: form.executionMode === "conditional" ? form.branchingRules : [],
      };
      if (isEditing && id) {
        await teamsApi.update(Number(id), payload);
      } else {
        await teamsApi.create(payload);
      }
      navigate("/teams");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save team");
    }
    setSaving(false);
  };

   const [testInput, setTestInput] = useState("");
  const [testRunning, setTestRunning] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [showTestModal, setShowTestModal] = useState(false);

  const SAMPLE_INPUTS: Record<ExecutionMode, string> = {
    sequential: "Review the following invoice and flag any amounts over $10,000 for approval. Invoice #INV-2024-0042: Vendor: Acme Corp, Amount: $14,500, Date: 2024-03-01, Category: Software Licenses, Approver: pending.",
    parallel: "Analyse the following contract clause for legal, financial, and risk implications: 'The vendor shall not be liable for any indirect, incidental, or consequential damages exceeding the total contract value of $50,000.'",
    conditional: "Triage the following support ticket and route to the appropriate team: Customer reports complete data loss after system update. 500 users affected. Production environment down for 3 hours. Revenue impact estimated at $200,000.",
  };

  const handleTestRun = async () => {
    if (!testInput.trim() || form.memberAgentIds.length < 2) return;
    setTestRunning(true);
    setTestResult(null);
    try {
      // Run against the first agent in the team as a quick preview
      const firstAgentId = form.executionOrder[0] || form.memberAgentIds[0];
      if (!firstAgentId) return;
      const res = await executionsApi.create({
        agentId: firstAgentId,
        input: testInput,
        outputFormat: "bullet point summary",
      });
      const execId = res.data?.execution?.id || res.data?.executionId;
      // Poll for result
      let attempts = 0;
      const poll = setInterval(async () => {
        attempts++;
        if (attempts > 30) { clearInterval(poll); setTestRunning(false); return; }
        try {
          const statusRes = await executionsApi.get(execId);
          const exec = statusRes.data?.execution || statusRes.data;
          if (["success", "completed", "failed", "escalated"].includes(exec.status)) {
            clearInterval(poll);
            setTestResult(exec);
            setTestRunning(false);
          }
        } catch (_) {}
      }, 2000);
    } catch (err: any) {
      setTestResult({ status: "failed", output: err.response?.data?.error || "Test failed" });
      setTestRunning(false);
    }
  };

  const orderedAgents = form.executionOrder
    .map((id) => agents.find((a) => a.id === id))
    .filter(Boolean);
  const selectedMode = EXECUTION_MODES.find((m) => m.id === form.executionMode)!;
  const ModeIcon = selectedMode.icon;

  if (loading) {
    return <div className="p-6 flex items-center justify-center h-64"><Loader2 className="w-6 h-6 animate-spin text-gray-500" /></div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate("/teams")} className="text-gray-400 hover:text-white transition-colors">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">{isEditing ? "Edit Team" : "Team Builder"}</h1>
          <p className="text-gray-400 text-sm mt-0.5">Compose agents into a multi-agent workflow</p>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="flex items-center gap-2">
        {[
          { n: 1, label: "Configure" },
          { n: 2, label: "Add Agents" },
          { n: 3, label: "Pipeline" },
          { n: 4, label: "Review" },
        ].map(({ n, label }, i, arr) => (
          <div key={n} className="flex items-center gap-2">
            <button
              onClick={() => setStep(n)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                step === n
                  ? "bg-blue-600 text-white"
                  : step > n
                  ? "bg-green-600/20 text-green-400 hover:bg-green-600/30"
                  : "bg-gray-800 text-gray-500 hover:text-gray-300"
              }`}
            >
              {step > n ? <CheckCircle2 className="w-3.5 h-3.5" /> : <span className="w-4 h-4 rounded-full border border-current flex items-center justify-center text-xs">{n}</span>}
              {label}
            </button>
            {i < arr.length - 1 && <ChevronRight className="w-3 h-3 text-gray-700" />}
          </div>
        ))}
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* ── Step 1: Configure ── */}
      {step === 1 && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Users className="w-4 h-4 text-blue-400" /> Team Details</h2>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Team Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                placeholder="e.g., Invoice Review Team"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={2}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
                placeholder="What does this team accomplish?"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">
                Confidence Threshold: <span className="text-blue-400">{form.confidenceThreshold}%</span>
              </label>
              <input
                type="range" min={0} max={100}
                value={form.confidenceThreshold}
                onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
                className="w-full accent-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Executions below this confidence will be escalated for human review</p>
            </div>
          </div>

          {/* Execution Mode */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2"><Zap className="w-4 h-4 text-yellow-400" /> Execution Mode</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {EXECUTION_MODES.map((mode) => {
                const Icon = mode.icon;
                const active = form.executionMode === mode.id;
                const colorMap: Record<string, string> = {
                  blue: active ? "border-blue-500 bg-blue-600/10" : "border-gray-700 hover:border-blue-500/50",
                  green: active ? "border-green-500 bg-green-600/10" : "border-gray-700 hover:border-green-500/50",
                  purple: active ? "border-purple-500 bg-purple-600/10" : "border-gray-700 hover:border-purple-500/50",
                };
                const iconColorMap: Record<string, string> = {
                  blue: "text-blue-400", green: "text-green-400", purple: "text-purple-400",
                };
                return (
                  <button
                    key={mode.id}
                    onClick={() => setForm({ ...form, executionMode: mode.id })}
                    className={`p-4 rounded-xl border text-left transition-all ${colorMap[mode.color]}`}
                  >
                    <Icon className={`w-5 h-5 mb-2 ${iconColorMap[mode.color]}`} />
                    <div className="font-semibold text-white text-sm mb-1">{mode.label}</div>
                    <div className="text-xs text-gray-400 mb-2">{mode.description}</div>
                    <div className={`text-xs font-mono px-2 py-1 rounded ${active ? `bg-${mode.color}-600/20 text-${mode.color}-300` : "bg-gray-800 text-gray-500"}`}>
                      {mode.example}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            onClick={() => { if (!form.name) { setError("Team name is required"); return; } setError(""); setStep(2); }}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
          >
            Next: Add Agents <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Step 2: Add Agents ── */}
      {step === 2 && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white flex items-center gap-2">
                <Bot className="w-4 h-4 text-blue-400" /> Select Agents
              </h2>
              <span className="text-sm text-gray-400">{form.memberAgentIds.length} selected</span>
            </div>
            {agents.length === 0 ? (
              <div className="text-center py-8">
                <Bot className="w-10 h-10 text-gray-700 mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No active agents found.</p>
                <p className="text-gray-500 text-xs mt-1">Create agents in the Agent Builder first.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {agents.map((agent) => {
                  const selected = form.memberAgentIds.includes(agent.id);
                  return (
                    <button
                      key={agent.id}
                      onClick={() => toggleAgent(agent.id)}
                      className={`flex items-center gap-3 p-4 rounded-xl border text-left transition-all ${
                        selected
                          ? "bg-blue-600/10 border-blue-500/50"
                          : "bg-gray-800 border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-blue-500/20" : "bg-gray-700"}`}>
                        <Bot className={`w-5 h-5 ${selected ? "text-blue-400" : "text-gray-400"}`} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-white truncate">{agent.name}</div>
                        <div className="text-xs text-gray-500 truncate">{agent.role}</div>
                        <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                          {agent.totalExecutions > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded">
                              <Activity className="w-2.5 h-2.5" />
                              {agent.totalExecutions} run{agent.totalExecutions !== 1 ? "s" : ""}
                            </span>
                          )}
                          {agent.avgConfidence != null && agent.avgConfidence > 0 && (
                            <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded ${
                              agent.avgConfidence >= 0.8 ? "bg-green-900/40 text-green-400" :
                              agent.avgConfidence >= 0.6 ? "bg-yellow-900/40 text-yellow-400" :
                              "bg-red-900/40 text-red-400"
                            }`}>
                              <TrendingUp className="w-2.5 h-2.5" />
                              {(agent.avgConfidence * 100).toFixed(0)}% avg
                            </span>
                          )}
                          {(!agent.totalExecutions || agent.totalExecutions === 0) && (
                            <span className="inline-flex items-center gap-1 text-xs bg-gray-700/50 text-gray-500 px-1.5 py-0.5 rounded">
                              New
                            </span>
                          )}
                        </div>
                      </div>
                      {selected && (
                        <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                          <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(1)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={() => { if (form.memberAgentIds.length < 2) { setError("Select at least 2 agents"); return; } setError(""); setStep(3); }}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors"
            >
              Next: Configure Pipeline <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 3: Pipeline ── */}
      {step === 3 && (
        <div className="space-y-5">
          {/* Execution order */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 mb-1">
              <ModeIcon className="w-4 h-4 text-blue-400" />
              <h2 className="font-semibold text-white">
                {form.executionMode === "parallel" ? "Parallel Agents" : "Execution Order"}
              </h2>
            </div>
            {form.executionMode === "parallel" && (
              <div className="flex items-start gap-2 bg-green-950/30 border border-green-800/40 rounded-lg px-3 py-2 text-xs text-green-300">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                All agents below will run simultaneously. Order does not matter in parallel mode.
              </div>
            )}
            {form.executionMode === "sequential" && (
              <div className="flex items-start gap-2 bg-blue-950/30 border border-blue-800/40 rounded-lg px-3 py-2 text-xs text-blue-300">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                Drag agents up or down to set the execution order. Each agent receives the previous agent's output.
              </div>
            )}
            {form.executionMode === "conditional" && (
              <div className="flex items-start gap-2 bg-purple-950/30 border border-purple-800/40 rounded-lg px-3 py-2 text-xs text-purple-300">
                <Info className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" />
                The first agent always runs. Branching rules below determine which agent runs next based on the result.
              </div>
            )}

            <div className="space-y-2">
              {orderedAgents.map((agent, idx) => (
                <div key={agent.id} className="flex items-center gap-3">
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveAgent(idx, "up")}
                      disabled={idx === 0 || form.executionMode === "parallel"}
                      className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3 h-3 -rotate-90" />
                    </button>
                    <button
                      onClick={() => moveAgent(idx, "down")}
                      disabled={idx === orderedAgents.length - 1 || form.executionMode === "parallel"}
                      className="p-0.5 text-gray-600 hover:text-gray-300 disabled:opacity-20 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="w-3 h-3 rotate-90" />
                    </button>
                  </div>
                  <div className="flex-1 flex items-center gap-3 bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                      form.executionMode === "parallel" ? "bg-green-600" : "bg-blue-600"
                    }`}>
                      {form.executionMode === "parallel" ? "∥" : idx + 1}
                    </div>
                    <Bot className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-medium text-white">{agent.name}</div>
                      <div className="text-xs text-gray-500">{agent.role}</div>
                    </div>
                    <GripVertical className="w-4 h-4 text-gray-600" />
                  </div>
                  {idx < orderedAgents.length - 1 && form.executionMode === "sequential" && (
                    <div className="absolute left-1/2 -translate-x-1/2 mt-12">
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Flow arrows for sequential */}
            {form.executionMode === "sequential" && orderedAgents.length > 1 && (
              <div className="flex flex-col items-center gap-1 py-1">
                {orderedAgents.slice(0, -1).map((_, idx) => (
                  <div key={idx} className="flex items-center gap-2 text-xs text-gray-600">
                    <ArrowDown className="w-3 h-3" />
                    <span>passes output to next agent</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Branching Rules (conditional mode only) */}
          {form.executionMode === "conditional" && (
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-purple-400" /> Branching Rules
                </h2>
                <button
                  onClick={addBranchingRule}
                  className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-600/10 hover:bg-purple-600/20 px-3 py-1.5 rounded-lg transition-colors"
                >
                  <Plus className="w-3 h-3" /> Add Rule
                </button>
              </div>

              {form.branchingRules.length === 0 ? (
                <div className="text-center py-6 border border-dashed border-gray-700 rounded-lg">
                  <GitBranch className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">No branching rules yet</p>
                  <p className="text-gray-600 text-xs mt-1">Add rules to route agents based on conditions</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {form.branchingRules.map((rule, idx) => (
                    <div key={idx} className="bg-gray-800 border border-gray-700 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-purple-400 uppercase tracking-wide">Rule {idx + 1}</span>
                        <button onClick={() => removeRule(idx)} className="text-gray-600 hover:text-red-400 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">When this agent completes</label>
                          <select
                            value={rule.fromAgentId}
                            onChange={(e) => updateRule(idx, { fromAgentId: Number(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                          >
                            {orderedAgents.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">And this condition is met</label>
                          <select
                            value={rule.condition}
                            onChange={(e) => updateRule(idx, { condition: e.target.value })}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                          >
                            {CONDITION_PRESETS.map((c) => (
                              <option key={c.value} value={c.value}>{c.label}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Route to this agent (condition met)</label>
                          <select
                            value={rule.toAgentId}
                            onChange={(e) => updateRule(idx, { toAgentId: Number(e.target.value) })}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                          >
                            {orderedAgents.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-400 mb-1">Otherwise route to (optional)</label>
                          <select
                            value={rule.elseAgentId ?? ""}
                            onChange={(e) => updateRule(idx, { elseAgentId: e.target.value ? Number(e.target.value) : undefined })}
                            className="w-full bg-gray-700 border border-gray-600 text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-purple-500"
                          >
                            <option value="">— End pipeline —</option>
                            {orderedAgents.map((a) => (
                              <option key={a.id} value={a.id}>{a.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="bg-gray-900 rounded-lg px-3 py-2 text-xs text-gray-400">
                        <span className="text-purple-400 font-medium">Preview: </span>
                        After <span className="text-white">{orderedAgents.find((a) => a.id === rule.fromAgentId)?.name || "?"}</span> — if <span className="text-yellow-400">{CONDITION_PRESETS.find((c) => c.value === rule.condition)?.label || rule.condition}</span> → route to <span className="text-green-400">{orderedAgents.find((a) => a.id === rule.toAgentId)?.name || "?"}</span>{rule.elseAgentId ? <>, else → <span className="text-blue-400">{orderedAgents.find((a) => a.id === rule.elseAgentId)?.name || "?"}</span></> : <>, else end pipeline</>}.
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button onClick={() => setStep(2)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button onClick={() => { setError(""); setStep(4); }} className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 rounded-xl transition-colors">
              Review & Save <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* ── Step 4: Review ── */}
      {step === 4 && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Review Your Team</h2>

            {/* Summary */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Team Name", value: form.name },
                { label: "Mode", value: form.executionMode.charAt(0).toUpperCase() + form.executionMode.slice(1) },
                { label: "Agents", value: `${form.memberAgentIds.length} agents` },
                { label: "Confidence", value: `${form.confidenceThreshold}%` },
              ].map(({ label, value }) => (
                <div key={label} className="bg-gray-800 rounded-lg p-3">
                  <div className="text-xs text-gray-500 mb-1">{label}</div>
                  <div className="text-sm font-semibold text-white">{value}</div>
                </div>
              ))}
            </div>

            {/* Pipeline visual */}
            <div>
              <div className="text-sm font-medium text-gray-300 mb-3">
                {form.executionMode === "parallel" ? "Parallel Agents" : "Execution Pipeline"}
              </div>
              <div className={`${form.executionMode === "parallel" ? "flex flex-wrap gap-2" : "space-y-2"}`}>
                {orderedAgents.map((agent, idx) => (
                  <div key={agent.id}>
                    <div className={`flex items-center gap-3 rounded-lg p-3 ${
                      form.executionMode === "parallel" ? "bg-green-600/10 border border-green-600/20" : "bg-gray-800 border border-gray-700"
                    }`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0 ${
                        form.executionMode === "parallel" ? "bg-green-600" : "bg-blue-600"
                      }`}>
                        {form.executionMode === "parallel" ? "∥" : idx + 1}
                      </div>
                      <Bot className="w-4 h-4 text-blue-400" />
                      <span className="text-sm text-white">{agent.name}</span>
                      <span className="text-xs text-gray-500 ml-auto">{agent.role}</span>
                    </div>
                    {idx < orderedAgents.length - 1 && form.executionMode === "sequential" && (
                      <div className="flex justify-center py-1">
                        <ArrowDown className="w-3 h-3 text-gray-600" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Branching rules summary */}
            {form.executionMode === "conditional" && form.branchingRules.length > 0 && (
              <div>
                <div className="text-sm font-medium text-gray-300 mb-2">Branching Rules</div>
                <div className="space-y-1.5">
                  {form.branchingRules.map((rule, idx) => (
                    <div key={idx} className="text-xs bg-gray-800 rounded-lg px-3 py-2 text-gray-400">
                      <span className="text-purple-400">Rule {idx + 1}:</span> After <span className="text-white">{orderedAgents.find((a) => a.id === rule.fromAgentId)?.name}</span> — if <span className="text-yellow-400">{rule.condition}</span> → <span className="text-green-400">{orderedAgents.find((a) => a.id === rule.toAgentId)?.name}</span>{rule.elseAgentId ? <>, else → <span className="text-blue-400">{orderedAgents.find((a) => a.id === rule.elseAgentId)?.name}</span></> : null}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Test with sample data */}
          <div className="bg-gray-900 border border-gray-700 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Play className="w-4 h-4 text-green-400" /> Test with Sample Data
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">Run a quick test against the first agent before saving — verify the pipeline behaves as expected</p>
              </div>
              <button
                onClick={() => { setTestInput(SAMPLE_INPUTS[form.executionMode]); setShowTestModal(true); }}
                className="flex items-center gap-1.5 bg-green-600/10 hover:bg-green-600/20 text-green-400 text-xs font-medium px-3 py-1.5 rounded-lg border border-green-600/20 transition-colors"
              >
                <FileText className="w-3 h-3" /> Load Sample
              </button>
            </div>
            {showTestModal && (
              <div className="space-y-3">
                <textarea
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  rows={3}
                  disabled={testRunning}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500 resize-none disabled:opacity-50"
                  placeholder="Enter a test task to run against the first agent in this team..."
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleTestRun}
                    disabled={testRunning || !testInput.trim() || form.memberAgentIds.length < 2}
                    className="flex items-center gap-1.5 bg-green-600 hover:bg-green-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
                  >
                    {testRunning ? <><Loader2 className="w-3 h-3 animate-spin" /> Running...</> : <><Play className="w-3 h-3" /> Run Test</>}
                  </button>
                  <button
                    onClick={() => { setShowTestModal(false); setTestResult(null); setTestInput(""); }}
                    className="text-xs text-gray-500 hover:text-gray-300 px-3 py-2 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
                {testResult && (
                  <div className={`rounded-lg p-3 border text-xs ${
                    testResult.status === "completed" || testResult.status === "success"
                      ? "bg-green-950/20 border-green-800/50"
                      : testResult.status === "escalated"
                      ? "bg-orange-950/20 border-orange-800/50"
                      : "bg-red-950/20 border-red-800/50"
                  }`}>
                    <div className="flex items-center gap-1.5 mb-2">
                      {(testResult.status === "completed" || testResult.status === "success") && <CheckCircle2 className="w-3.5 h-3.5 text-green-400" />}
                      {testResult.status === "escalated" && <AlertTriangle className="w-3.5 h-3.5 text-orange-400" />}
                      {testResult.status === "failed" && <X className="w-3.5 h-3.5 text-red-400" />}
                      <span className="font-medium text-gray-200">Test {testResult.status} — Confidence: {Math.round((testResult.confidenceScore || 0) * 100)}%</span>
                    </div>
                    <div className="text-gray-300 whitespace-pre-wrap leading-relaxed max-h-40 overflow-y-auto">
                      {typeof testResult.output === "string" ? testResult.output : JSON.stringify(testResult.output, null, 2)}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setStep(3)} className="flex-1 flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 font-medium py-3 rounded-xl transition-colors">
              <ChevronLeft className="w-4 h-4" /> Back
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
            >
              {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> {isEditing ? "Save Changes" : "Create Team"}</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
