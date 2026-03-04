import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Bot, Plus, X, Loader2, ArrowDown, Save } from "lucide-react";
import { agentsApi, teamsApi } from "../lib/api";

export default function TeamBuilder() {
  const navigate = useNavigate();
  const [agents, setAgents] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    description: "",
    executionMode: "sequential" as "sequential" | "parallel",
    memberAgentIds: [] as number[],
    confidenceThreshold: 70,
  });

  useEffect(() => {
    agentsApi.list({ status: "active" }).then((r) => setAgents(r.data?.agents || []));
  }, []);

  const toggleAgent = (id: number) => {
    setForm((prev) => ({
      ...prev,
      memberAgentIds: prev.memberAgentIds.includes(id)
        ? prev.memberAgentIds.filter((a) => a !== id)
        : [...prev.memberAgentIds, id],
    }));
  };

  const handleSave = async () => {
    if (!form.name) { setError("Team name is required"); return; }
    if (form.memberAgentIds.length < 2) { setError("A team needs at least 2 agents"); return; }
    setSaving(true);
    setError("");
    try {
      await teamsApi.create(form);
      navigate("/teams");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to create team");
    }
    setSaving(false);
  };

  const selectedAgents = agents.filter((a) => form.memberAgentIds.includes(a.id));

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Team Builder</h1>
        <p className="text-gray-400 text-sm mt-1">Compose agents into a multi-step workflow</p>
      </div>

      {error && <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>}

      {/* Basic Info */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Team Configuration</h2>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Team Name *</label>
          <input
            type="text"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
            placeholder="e.g., Customer Onboarding Team"
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
          <label className="block text-sm font-medium text-gray-300 mb-1.5">Execution Mode</label>
          <div className="flex gap-3">
            {(["sequential", "parallel"] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setForm({ ...form, executionMode: mode })}
                className={`flex-1 py-2.5 rounded-lg text-sm font-medium border transition-colors ${
                  form.executionMode === mode
                    ? "bg-blue-600 border-blue-500 text-white"
                    : "bg-gray-800 border-gray-700 text-gray-400 hover:text-white"
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500 mt-2">
            {form.executionMode === "sequential" ? "Agents run one after another, passing output to the next agent" : "All agents run simultaneously on the same input"}
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1.5">
            Team Confidence Threshold: <span className="text-blue-400">{form.confidenceThreshold}%</span>
          </label>
          <input
            type="range"
            min={0}
            max={100}
            value={form.confidenceThreshold}
            onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
            className="w-full accent-blue-500"
          />
        </div>
      </div>

      {/* Agent Selection */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
        <h2 className="font-semibold text-white">Select Agents ({form.memberAgentIds.length} selected)</h2>
        {agents.length === 0 ? (
          <p className="text-gray-400 text-sm">No active agents found. Create agents first.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {agents.map((agent) => {
              const selected = form.memberAgentIds.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-colors ${
                    selected ? "bg-blue-600/10 border-blue-500/50 text-white" : "bg-gray-800 border-gray-700 text-gray-300 hover:border-gray-600"
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${selected ? "bg-blue-500/20" : "bg-gray-700"}`}>
                    <Bot className={`w-4 h-4 ${selected ? "text-blue-400" : "text-gray-400"}`} />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium truncate">{agent.name}</div>
                    <div className="text-xs text-gray-500 truncate">{agent.role}</div>
                  </div>
                  {selected && <div className="ml-auto w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                    <div className="w-2 h-2 rounded-full bg-white" />
                  </div>}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Workflow Preview */}
      {selectedAgents.length > 0 && form.executionMode === "sequential" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
          <h2 className="font-semibold text-white">Workflow Preview</h2>
          <div className="space-y-2">
            {selectedAgents.map((agent, idx) => (
              <div key={agent.id}>
                <div className="flex items-center gap-3 bg-gray-800 rounded-lg p-3">
                  <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0">{idx + 1}</div>
                  <Bot className="w-4 h-4 text-blue-400 flex-shrink-0" />
                  <span className="text-sm text-white">{agent.name}</span>
                  <span className="text-xs text-gray-500 ml-auto">{agent.role}</span>
                </div>
                {idx < selectedAgents.length - 1 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-gray-600" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
      >
        {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating Team...</> : <><Save className="w-4 h-4" /> Create Team</>}
      </button>
    </div>
  );
}
