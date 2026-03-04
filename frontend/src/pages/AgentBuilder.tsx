import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Wand2, Loader2, Plus, X, ChevronDown, ChevronUp, Save } from "lucide-react";
import { agentsApi } from "../lib/api";

const CAPABILITY_OPTIONS = [
  "data_analysis", "web_search", "document_processing", "email_management",
  "calendar_management", "code_generation", "report_writing", "customer_support",
  "financial_analysis", "hr_processing", "compliance_checking", "scheduling",
];

export default function AgentBuilder() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"jd" | "manual">("jd");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const [form, setForm] = useState({
    name: "",
    role: "",
    description: "",
    capabilities: [] as string[],
    confidenceThreshold: 75,
    riskLevel: "medium" as "low" | "medium" | "high" | "critical",
    escalationEnabled: true,
    systemPrompt: "",
  });

  const handleGenerate = async () => {
    if (!jobDescription.trim()) return;
    setGenerating(true);
    setError("");
    try {
      const res = await agentsApi.generateFromJD(jobDescription);
      const data = res.data;
      setForm((prev) => ({
        ...prev,
        name: data.name || prev.name,
        role: data.role || prev.role,
        description: data.description || prev.description,
        capabilities: data.capabilities || prev.capabilities,
        systemPrompt: data.systemPrompt || prev.systemPrompt,
        confidenceThreshold: data.confidenceThreshold || prev.confidenceThreshold,
      }));
      setMode("manual");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to generate agent. Please try again.");
    }
    setGenerating(false);
  };

  const toggleCapability = (cap: string) => {
    setForm((prev) => ({
      ...prev,
      capabilities: prev.capabilities.includes(cap)
        ? prev.capabilities.filter((c) => c !== cap)
        : [...prev.capabilities, cap],
    }));
  };

  const handleSave = async () => {
    if (!form.name || !form.role) { setError("Name and role are required"); return; }
    setSaving(true);
    setError("");
    try {
      await agentsApi.create(form);
      navigate("/agents");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save agent");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Agent Builder</h1>
        <p className="text-gray-400 text-sm mt-1">Create a new AI agent from a job description or configure manually</p>
      </div>

      {/* Mode Tabs */}
      <div className="flex gap-2 bg-gray-900 border border-gray-800 rounded-xl p-1">
        <button
          onClick={() => setMode("jd")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "jd" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          <Wand2 className="w-4 h-4" />
          From Job Description (AI)
        </button>
        <button
          onClick={() => setMode("manual")}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-colors ${mode === "manual" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
        >
          <Bot className="w-4 h-4" />
          Manual Configuration
        </button>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
      )}

      {/* JD Mode */}
      {mode === "jd" && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Paste Job Description</label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={10}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
              placeholder="Paste the full job description here. Our AI will analyze the responsibilities, skills, and requirements to configure an appropriate AI agent..."
            />
          </div>
          <button
            onClick={handleGenerate}
            disabled={generating || !jobDescription.trim()}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          >
            {generating ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Generating Agent Configuration...</>
            ) : (
              <><Wand2 className="w-4 h-4" /> Generate Agent with AI</>
            )}
          </button>
          <p className="text-xs text-gray-500 text-center">
            The AI will extract responsibilities, required capabilities, and configure appropriate governance settings
          </p>
        </div>
      )}

      {/* Manual / Post-generation form */}
      {mode === "manual" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Basic Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Agent Name *</label>
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  placeholder="e.g., Customer Support Agent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Role / Job Title *</label>
                <input
                  type="text"
                  value={form.role}
                  onChange={(e) => setForm({ ...form, role: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  placeholder="e.g., Customer Success Manager"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <textarea
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                rows={3}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none"
                placeholder="Describe what this agent does..."
              />
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {CAPABILITY_OPTIONS.map((cap) => (
                <button
                  key={cap}
                  onClick={() => toggleCapability(cap)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    form.capabilities.includes(cap)
                      ? "bg-blue-600 text-white"
                      : "bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white"
                  }`}
                >
                  {cap.replace(/_/g, " ")}
                </button>
              ))}
            </div>
          </div>

          {/* Governance */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Governance Settings</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">
                  Confidence Threshold: <span className="text-blue-400">{form.confidenceThreshold}%</span>
                </label>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={form.confidenceThreshold}
                  onChange={(e) => setForm({ ...form, confidenceThreshold: Number(e.target.value) })}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>0% (Always escalate)</span>
                  <span>100% (Never escalate)</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Default Risk Level</label>
                <select
                  value={form.riskLevel}
                  onChange={(e) => setForm({ ...form, riskLevel: e.target.value as any })}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium text-gray-300">Auto-Escalation</div>
                <div className="text-xs text-gray-500">Escalate to human review when confidence is below threshold</div>
              </div>
              <button
                onClick={() => setForm({ ...form, escalationEnabled: !form.escalationEnabled })}
                className={`relative w-11 h-6 rounded-full transition-colors ${form.escalationEnabled ? "bg-blue-600" : "bg-gray-700"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.escalationEnabled ? "translate-x-5" : "translate-x-0"}`} />
              </button>
            </div>
          </div>

          {/* Advanced */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Advanced: System Prompt
              {showAdvanced ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showAdvanced && (
              <div className="px-6 pb-6">
                <textarea
                  value={form.systemPrompt}
                  onChange={(e) => setForm({ ...form, systemPrompt: e.target.value })}
                  rows={6}
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500 resize-none font-mono"
                  placeholder="Optional: Custom system prompt for this agent. Leave blank to use the auto-generated prompt based on role and capabilities."
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-xl transition-colors"
          >
            {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Save className="w-4 h-4" /> Save Agent</>}
          </button>
        </div>
      )}
    </div>
  );
}
