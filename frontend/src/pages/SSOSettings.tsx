import { useState, useEffect } from "react";
import { Shield, CheckCircle, AlertTriangle, Loader2, ExternalLink, Key, Settings, Info } from "lucide-react";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import DashboardLayout from "../components/layout/DashboardLayout";

const API = import.meta.env.VITE_API_URL || "";

const PROVIDERS = [
  { id: "okta", name: "Okta", logo: "🔐", docs: "https://developer.okta.com/docs/guides/build-sso-integration/saml2/main/" },
  { id: "azure", name: "Microsoft Azure AD", logo: "🔷", docs: "https://learn.microsoft.com/en-us/azure/active-directory/saas-apps/tutorial-list" },
  { id: "google", name: "Google Workspace", logo: "🔵", docs: "https://support.google.com/a/answer/6087519" },
  { id: "onelogin", name: "OneLogin", logo: "🔑", docs: "https://developers.onelogin.com/saml" },
  { id: "ping", name: "PingIdentity", logo: "🏓", docs: "https://docs.pingidentity.com" },
  { id: "custom", name: "Custom SAML 2.0", logo: "⚙️", docs: "" },
];

interface SSOConfig {
  enabled: boolean;
  provider: string | null;
  entityId: string;
  ssoUrl: string;
  certificate: string;
  attributeEmail: string;
  attributeName: string;
  forceSSO: boolean;
  updatedAt: string | null;
}

export default function SSOSettings() {
  const { user } = useAuth();
  const [config, setConfig] = useState<SSOConfig>({
    enabled: false,
    provider: null,
    entityId: "",
    ssoUrl: "",
    certificate: "",
    attributeEmail: "email",
    attributeName: "name",
    forceSSO: false,
    updatedAt: null,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testResult, setTestResult] = useState<{ success?: boolean; warning?: string; message?: string; error?: string } | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  async function fetchConfig() {
    try {
      const res = await axios.get(`${API}/api/sso/config`, { withCredentials: true });
      setConfig(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to load SSO configuration");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await axios.put(`${API}/api/sso/config`, config, { withCredentials: true });
      setSuccess("SSO configuration saved successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to save SSO configuration");
    } finally {
      setSaving(false);
    }
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    setError("");
    try {
      const res = await axios.post(`${API}/api/sso/test`, {}, { withCredentials: true });
      setTestResult(res.data);
    } catch (err: any) {
      setTestResult({ error: err.response?.data?.error || "Test failed" });
    } finally {
      setTesting(false);
    }
  }

  const isAdmin = user?.role === "admin";

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-purple-400" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Shield className="w-7 h-7 text-purple-400" />
              SSO / SAML Configuration
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Configure Single Sign-On with your identity provider. Available on all plans.
            </p>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium ${config.enabled ? "bg-green-950/60 text-green-400 border border-green-800" : "bg-gray-800 text-gray-400 border border-gray-700"}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${config.enabled ? "bg-green-400" : "bg-gray-500"}`} />
            {config.enabled ? "SSO Active" : "SSO Disabled"}
          </div>
        </div>

        {!isAdmin && (
          <div className="bg-yellow-950/40 border border-yellow-800 rounded-xl p-4 flex items-start gap-3">
            <Info className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
            <p className="text-yellow-300 text-sm">Only administrators can modify SSO settings. Contact your admin to make changes.</p>
          </div>
        )}

        {error && <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>}
        {success && (
          <div className="bg-green-950/50 border border-green-800 text-green-300 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {success}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          {/* Enable toggle */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Enable SSO / SAML</h3>
                <p className="text-gray-400 text-xs mt-0.5">Allow users to sign in with your identity provider</p>
              </div>
              <div
                onClick={() => isAdmin && setConfig({ ...config, enabled: !config.enabled })}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${config.enabled ? "bg-purple-600" : "bg-gray-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.enabled ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
          </div>

          {/* Identity Provider */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Identity Provider</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {PROVIDERS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  disabled={!isAdmin}
                  onClick={() => isAdmin && setConfig({ ...config, provider: p.id })}
                  className={`flex flex-col items-center gap-2 p-3 rounded-lg border text-sm font-medium transition-colors ${config.provider === p.id ? "border-purple-500 bg-purple-950/40 text-white" : "border-gray-700 bg-gray-800 text-gray-400 hover:border-gray-600"} ${!isAdmin ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                >
                  <span className="text-xl">{p.logo}</span>
                  <span className="text-xs text-center leading-tight">{p.name}</span>
                </button>
              ))}
            </div>
            {config.provider && PROVIDERS.find(p => p.id === config.provider)?.docs && (
              <a
                href={PROVIDERS.find(p => p.id === config.provider)?.docs}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View setup guide for {PROVIDERS.find(p => p.id === config.provider)?.name}
              </a>
            )}
          </div>

          {/* SAML Configuration */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">SAML 2.0 Configuration</h3>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Service Provider Entity ID</label>
              <input
                type="text"
                value={config.entityId}
                onChange={(e) => setConfig({ ...config, entityId: e.target.value })}
                disabled={!isAdmin}
                placeholder="https://app.workforceautomated.com/saml/metadata"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono disabled:opacity-60"
              />
              <p className="text-xs text-gray-500 mt-1">The unique identifier for your WorkforceAutomated instance. Provide this to your identity provider.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">IdP SSO URL</label>
              <input
                type="url"
                value={config.ssoUrl}
                onChange={(e) => setConfig({ ...config, ssoUrl: e.target.value })}
                disabled={!isAdmin}
                placeholder="https://your-idp.example.com/sso/saml"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono disabled:opacity-60"
              />
              <p className="text-xs text-gray-500 mt-1">The Single Sign-On URL provided by your identity provider.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">X.509 Certificate</label>
              <textarea
                value={config.certificate}
                onChange={(e) => setConfig({ ...config, certificate: e.target.value })}
                disabled={!isAdmin}
                rows={5}
                placeholder="-----BEGIN CERTIFICATE-----&#10;MIIDpDCCAoygAwIBAgIGAV...&#10;-----END CERTIFICATE-----"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono resize-none disabled:opacity-60"
              />
              <p className="text-xs text-gray-500 mt-1">The public certificate from your identity provider used to verify SAML assertions.</p>
            </div>
          </div>

          {/* Attribute Mapping */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">Attribute Mapping</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Attribute</label>
                <input
                  type="text"
                  value={config.attributeEmail}
                  onChange={(e) => setConfig({ ...config, attributeEmail: e.target.value })}
                  disabled={!isAdmin}
                  placeholder="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono disabled:opacity-60"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Name Attribute</label>
                <input
                  type="text"
                  value={config.attributeName}
                  onChange={(e) => setConfig({ ...config, attributeName: e.target.value })}
                  disabled={!isAdmin}
                  placeholder="name"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono disabled:opacity-60"
                />
              </div>
            </div>
          </div>

          {/* Force SSO */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Enforce SSO Login</h3>
                <p className="text-gray-400 text-xs mt-0.5">Require all users to sign in via SSO. Password login will be disabled.</p>
              </div>
              <div
                onClick={() => isAdmin && setConfig({ ...config, forceSSO: !config.forceSSO })}
                className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 relative ${isAdmin ? "cursor-pointer" : "cursor-not-allowed opacity-60"} ${config.forceSSO ? "bg-purple-600" : "bg-gray-700"}`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${config.forceSSO ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
          </div>

          {/* Actions */}
          {isAdmin && (
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={saving}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings className="w-4 h-4" />}
                Save Configuration
              </button>
              <button
                type="button"
                onClick={handleTest}
                disabled={testing || !config.enabled}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                Test Connection
              </button>
            </div>
          )}

          {/* Test result */}
          {testResult && (
            <div className={`rounded-xl p-4 border flex items-start gap-3 ${testResult.error ? "bg-red-950/40 border-red-800" : "bg-green-950/40 border-green-800"}`}>
              {testResult.error
                ? <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                : <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0 mt-0.5" />
              }
              <div>
                <p className={`text-sm font-medium ${testResult.error ? "text-red-300" : "text-green-300"}`}>
                  {testResult.error ? "Test Failed" : "Test Passed"}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  {testResult.error || testResult.message || testResult.warning}
                </p>
              </div>
            </div>
          )}

          {/* Info box */}
          <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-5 space-y-2">
            <h4 className="text-sm font-semibold text-gray-300 flex items-center gap-2">
              <Info className="w-4 h-4 text-purple-400" />
              How SSO works on WorkforceAutomated
            </h4>
            <ul className="text-xs text-gray-500 space-y-1.5 list-disc list-inside">
              <li>When SSO is enabled, users will see a "Sign in with SSO" button on the login page.</li>
              <li>Your identity provider authenticates the user and returns a SAML assertion.</li>
              <li>WorkforceAutomated maps the email and name attributes to create or update the user account.</li>
              <li>Existing accounts are matched by email address — no duplicate accounts are created.</li>
              <li>If "Enforce SSO" is on, password-based login is disabled for all users.</li>
            </ul>
          </div>

          {config.updatedAt && (
            <p className="text-xs text-gray-600 text-right">
              Last updated: {new Date(config.updatedAt).toLocaleString()}
            </p>
          )}
        </form>
      </div>
    </DashboardLayout>
  );
}
