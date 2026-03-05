import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bot, Wand2, Loader2, Plus, X, ChevronDown, ChevronUp, Save, Link2, CheckCircle2, Zap, Globe, Slack } from "lucide-react";
import { agentsApi, integrationsApi } from "../lib/api";

const CAPABILITY_OPTIONS = [
  "data_analysis", "web_search", "document_processing", "email_management",
  "calendar_management", "code_generation", "report_writing", "customer_support",
  "financial_analysis", "hr_processing", "compliance_checking", "scheduling",
];

const INTEGRATION_ICONS: Record<string, any> = {
  slack: Slack,
  google_drive: Globe,
  rest_api: Zap,
  webhook: Link2,
};

export default function AgentBuilder() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"jd" | "manual">("jd");
  const [jobDescription, setJobDescription] = useState("");
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [availableIntegrations, setAvailableIntegrations] = useState<any[]>([]);
  const [selectedIntegrationIds, setSelectedIntegrationIds] = useState<number[]>([]);

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

  useEffect(() => {
    integrationsApi.list().then((r) => {
      const list = r.data?.integrations || [];
      setAvailableIntegrations(list.filter((i: any) => i.status === "active"));
    }).catch(() => {});
  }, []);

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

  const toggleIntegration = (id: number) => {
    setSelectedIntegrationIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleSave = async () => {
    if (!form.name || !form.role) { setError("Name and role are required"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await agentsApi.create(form);
      const agentId = res.data?.agent?.id;
      // Assign selected integrations to the new agent
      if (agentId && selectedIntegrationIds.length > 0) {
        await Promise.all(
          selectedIntegrationIds.map((integrationId) =>
            integrationsApi.assignToAgent(agentId, { integrationId, permissions: ["read"] })
          )
        );
      }
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

          {/* Connect Systems */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <button
              onClick={() => setShowIntegrations(!showIntegrations)}
              className="w-full flex items-center justify-between px-6 py-4 text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              <span className="flex items-center gap-2">
                <Link2 className="w-4 h-4 text-blue-400" />
                Connect Systems
                {selectedIntegrationIds.length > 0 && (
                  <span className="bg-blue-600 text-white text-xs px-1.5 py-0.5 rounded-full">{selectedIntegrationIds.length}</span>
                )}
              </span>
              {showIntegrations ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
            {showIntegrations && (
              <div className="px-6 pb-6 space-y-3">
                <p className="text-xs text-gray-500">
                  Select which integrations this agent can access when executing tasks. The agent will pull live data from connected systems automatically — no manual uploads needed.
                </p>
                {availableIntegrations.length === 0 ? (
                  <div className="text-center py-6">
                    <Link2 className="w-8 h-8 text-gray-700 mx-auto mb-2" />
                    <p className="text-xs text-gray-500">No active integrations found.</p>
                    <a href="/integrations" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-block">
                      Set up integrations →
                    </a>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {availableIntegrations.map((integration) => {
                      const selected = selectedIntegrationIds.includes(integration.id);
                      const IconComp = INTEGRATION_ICONS[integration.type] || Link2;
                      return (
                        <button
                          key={integration.id}
                          onClick={() => toggleIntegration(integration.id)}
                          className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                            selected
                              ? "bg-blue-600/10 border-blue-500/50"
                              : "bg-gray-800 border-gray-700 hover:border-gray-600"
                          }`}
                        >
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            selected ? "bg-blue-500/20" : "bg-gray-700"
                          }`}>
                            <IconComp className={`w-4 h-4 ${selected ? "text-blue-400" : "text-gray-400"}`} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-xs font-medium text-white truncate">{integration.name}</div>
                            <div className="text-xs text-gray-500 capitalize">{integration.type.replace(/_/g, " ")}</div>
                          </div>
                          {selected && <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
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
