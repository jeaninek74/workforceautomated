import { useEffect, useState } from "react";
import {
  Plus, Trash2, TestTube2, CheckCircle, XCircle, AlertCircle,
  Loader2, ChevronDown, ChevronUp, Settings, Link2, RefreshCw
} from "lucide-react";
import { integrationsApi } from "../lib/api";

const INTEGRATION_TYPES = [
  {
    value: "google_drive",
    label: "Google Drive",
    icon: "Drive",
    description: "Read files and folders from Google Drive",
    credentialFields: [
      { key: "access_token", label: "Access Token", placeholder: "ya29.xxx...", secret: true },
    ],
    configFields: [
      { key: "folder_id", label: "Folder ID (optional)", placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs" },
      { key: "file_id", label: "Specific File ID (optional)", placeholder: "1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs" },
    ],
  },
  {
    value: "slack",
    label: "Slack",
    icon: "Slack",
    description: "Read messages and post notifications to Slack channels",
    credentialFields: [
      { key: "bot_token", label: "Bot Token", placeholder: "xoxb-xxx...", secret: true },
    ],
    configFields: [
      { key: "channel_id", label: "Channel ID", placeholder: "C1234567890" },
    ],
  },
  {
    value: "rest_api",
    label: "REST API",
    icon: "API",
    description: "Connect to any REST API endpoint",
    credentialFields: [
      { key: "bearer_token", label: "Bearer Token (optional)", placeholder: "eyJhbGci...", secret: true },
      { key: "api_key", label: "API Key (optional)", placeholder: "sk-xxx...", secret: true },
      { key: "username", label: "Username (optional)", placeholder: "admin" },
      { key: "password", label: "Password (optional)", placeholder: "••••••••", secret: true },
    ],
    configFields: [
      { key: "base_url", label: "Base URL", placeholder: "https://api.example.com" },
      { key: "endpoint", label: "Endpoint (optional)", placeholder: "/v1/data" },
      { key: "method", label: "HTTP Method", placeholder: "GET" },
    ],
  },
  {
    value: "webhook",
    label: "Webhook",
    icon: "Hook",
    description: "Receive real-time data pushed from external systems",
    credentialFields: [],
    configFields: [
      { key: "webhook_url", label: "Webhook URL", placeholder: "https://yourapp.com/webhook/xxx" },
    ],
  },
];

interface Integration {
  id: number;
  name: string;
  type: string;
  status: "active" | "inactive" | "error";
  config: Record<string, string>;
  lastTestedAt: string | null;
  lastUsedAt: string | null;
  errorMessage: string | null;
  createdAt: string;
}

export default function Integrations() {
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedType, setSelectedType] = useState(INTEGRATION_TYPES[0]);
  const [formName, setFormName] = useState("");
  const [credentials, setCredentials] = useState<Record<string, string>>({});
  const [config, setConfig] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [testingId, setTestingId] = useState<number | null>(null);
  const [testResults, setTestResults] = useState<Record<number, { success: boolean; message: string }>>({});
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await integrationsApi.list();
      setIntegrations(res.data?.integrations || []);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleTypeChange = (typeValue: string) => {
    const t = INTEGRATION_TYPES.find((t) => t.value === typeValue) || INTEGRATION_TYPES[0];
    setSelectedType(t);
    setCredentials({});
    setConfig({});
  };

  const handleCreate = async () => {
    if (!formName.trim()) return;
    setCreating(true);
    try {
      await integrationsApi.create({
        name: formName.trim(),
        type: selectedType.value,
        credentials,
        config,
      });
      setShowCreate(false);
      setFormName("");
      setCredentials({});
      setConfig({});
      await load();
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to create integration");
    }
    setCreating(false);
  };

  const handleTest = async (id: number) => {
    setTestingId(id);
    try {
      const res = await integrationsApi.test(id);
      setTestResults((prev) => ({ ...prev, [id]: res.data }));
      await load();
    } catch (err: any) {
      setTestResults((prev) => ({
        ...prev,
        [id]: { success: false, message: err.response?.data?.error || "Test failed" },
      }));
    }
    setTestingId(null);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this integration? Any agents using it will lose access.")) return;
    setDeletingId(id);
    try {
      await integrationsApi.delete(id);
      await load();
    } catch (_) {}
    setDeletingId(null);
  };

  const typeInfo = (type: string) =>
    INTEGRATION_TYPES.find((t) => t.value === type) || { icon: type, label: type };

  const statusBadge = (status: string) => {
    if (status === "active") return "bg-green-950/40 text-green-400 border-green-800/50";
    if (status === "error") return "bg-red-950/40 text-red-400 border-red-800/50";
    return "bg-gray-800 text-gray-400 border-gray-700";
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Integrations</h1>
          <p className="text-gray-400 text-sm mt-0.5">
            Connect external systems so agents can pull live data at execution time
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={load}
            className="p-2 text-gray-400 hover:text-white transition-colors"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={() => setShowCreate(!showCreate)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg transition-colors text-sm"
          >
            <Plus className="w-4 h-4" />
            Add Integration
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreate && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white flex items-center gap-2">
            <Link2 className="w-4 h-4 text-blue-400" />
            New Integration
          </h2>

          {/* Integration Type */}
          <div>
            <label className="text-xs text-gray-400 mb-2 block">Integration Type</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {INTEGRATION_TYPES.map((t) => (
                <button
                  key={t.value}
                  onClick={() => handleTypeChange(t.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border text-xs transition-colors ${
                    selectedType.value === t.value
                      ? "border-blue-500 bg-blue-950/30 text-blue-400"
                      : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"
                  }`}
                >
                  <span className="text-xl">{t.icon}</span>
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
            <p className="text-xs text-gray-500 mt-2">{selectedType.description}</p>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-gray-400 mb-1.5 block">Integration Name</label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder={`e.g. "Finance Reports Drive" or "Ops Slack Channel"`}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
            />
          </div>

          {/* Config Fields */}
          {selectedType.configFields.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs text-gray-400 block">Configuration</label>
              {selectedType.configFields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
                  <input
                    type="text"
                    value={config[field.key] || ""}
                    onChange={(e) => setConfig((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                </div>
              ))}
            </div>
          )}

          {/* Credential Fields */}
          {selectedType.credentialFields.length > 0 && (
            <div className="space-y-3">
              <label className="text-xs text-gray-400 block">
                Credentials
                <span className="text-gray-600 ml-1">(stored securely, never returned to frontend)</span>
              </label>
              {selectedType.credentialFields.map((field) => (
                <div key={field.key}>
                  <label className="text-xs text-gray-500 mb-1 block">{field.label}</label>
                  <input
                    type={field.secret ? "password" : "text"}
                    value={credentials[field.key] || ""}
                    onChange={(e) => setCredentials((prev) => ({ ...prev, [field.key]: e.target.value }))}
                    placeholder={field.placeholder}
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                </div>
              ))}
            </div>
          )}

          <div className="flex items-center gap-3">
            <button
              onClick={handleCreate}
              disabled={creating || !formName.trim()}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold px-5 py-2 rounded-lg transition-colors text-sm"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              {creating ? "Creating..." : "Create Integration"}
            </button>
            <button
              onClick={() => setShowCreate(false)}
              className="text-gray-400 hover:text-white text-sm transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Integration List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 text-gray-500 animate-spin" />
        </div>
      ) : integrations.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
          <Settings className="w-10 h-10 text-gray-600 mx-auto mb-3" />
          <h3 className="text-gray-300 font-medium mb-1">No integrations yet</h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Add your first integration to let agents pull live data from Google Drive, Slack, REST APIs, and more.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {integrations.map((integration) => {
            const info = typeInfo(integration.type);
            const testResult = testResults[integration.id];
            const isExpanded = expandedId === integration.id;

            return (
              <div
                key={integration.id}
                className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden"
              >
                <div className="flex items-center gap-4 p-4">
                  <span className="text-2xl flex-shrink-0">{info.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-white">{integration.name}</span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border ${statusBadge(integration.status)}`}>
                        {integration.status}
                      </span>
                    </div>
                    <div className="text-sm text-gray-400 mt-0.5">
                      {info.label}
                      {integration.config?.base_url && (
                        <span className="text-gray-600 ml-2 truncate">{integration.config.base_url}</span>
                      )}
                      {integration.config?.channel_id && (
                        <span className="text-gray-600 ml-2">#{integration.config.channel_id}</span>
                      )}
                    </div>
                    {integration.errorMessage && (
                      <div className="text-xs text-red-400 mt-1 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {integration.errorMessage}
                      </div>
                    )}
                    {testResult && (
                      <div className={`text-xs mt-1 flex items-center gap-1 ${testResult.success ? "text-green-400" : "text-red-400"}`}>
                        {testResult.success
                          ? <CheckCircle className="w-3 h-3" />
                          : <XCircle className="w-3 h-3" />}
                        {testResult.message}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                      onClick={() => handleTest(integration.id)}
                      disabled={testingId === integration.id}
                      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-400 transition-colors px-3 py-1.5 rounded-lg border border-gray-700 hover:border-blue-700"
                      title="Test connection"
                    >
                      {testingId === integration.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <TestTube2 className="w-3 h-3" />
                      )}
                      Test
                    </button>
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : integration.id)}
                      className="text-gray-400 hover:text-white transition-colors p-1.5"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleDelete(integration.id)}
                      disabled={deletingId === integration.id}
                      className="text-gray-600 hover:text-red-400 transition-colors p-1.5"
                      title="Delete"
                    >
                      {deletingId === integration.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-800 px-4 py-3 bg-gray-950/50 space-y-2">
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-gray-500">Created:</span>{" "}
                        <span className="text-gray-400">
                          {new Date(integration.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      {integration.lastTestedAt && (
                        <div>
                          <span className="text-gray-500">Last tested:</span>{" "}
                          <span className="text-gray-400">
                            {new Date(integration.lastTestedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                      {integration.lastUsedAt && (
                        <div>
                          <span className="text-gray-500">Last used:</span>{" "}
                          <span className="text-gray-400">
                            {new Date(integration.lastUsedAt).toLocaleString()}
                          </span>
                        </div>
                      )}
                    </div>
                    {Object.keys(integration.config || {}).length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Config:</div>
                        <div className="space-y-1">
                          {Object.entries(integration.config).map(([k, v]) => (
                            <div key={k} className="flex gap-2 text-xs">
                              <span className="text-gray-500 w-28 flex-shrink-0">{k}:</span>
                              <span className="text-gray-400 truncate">{v}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-gray-600">
                      To assign this integration to an agent, go to the agent's settings and select it from the Integrations tab.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
