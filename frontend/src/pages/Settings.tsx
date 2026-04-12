import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { User, Lock, Bell, Loader2, CheckCircle, Mail, MessageSquare, Send, Server, Eye, EyeOff, KeyRound, Activity } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authApi, api } from "../lib/api";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"profile" | "security" | "encryption" | "backups" | "notifications" | "slack">("profile");
  const [encryptionKey, setEncryptionKey] = useState<{ publicKey: string; recoveryKey: string } | null>(null);
  const [recoveryKeys, setRecoveryKeys] = useState<any[]>([]);
  const [backups, setBackups] = useState<any[]>([]);
  const [loadingEncryption, setLoadingEncryption] = useState(false);
  const [loadingBackups, setLoadingBackups] = useState(false);

  // Notification settings state
  const [notifSettings, setNotifSettings] = useState({
    escalationEmailEnabled: false,
    escalationEmail: "",
    slackWebhookEnabled: false,
    slackWebhookUrl: "",
    notifyOnHighRisk: true,
    notifyOnCriticalRisk: true,
    notifyOnLowConfidence: true,
  });
  const [smtpConfig, setSmtpConfig] = useState({
    host: "",
    port: "587",
    user: "",
    pass: "",
    from: "",
    secure: false,
  });
  const [showSmtpPass, setShowSmtpPass] = useState(false);
  const [savingSmtp, setSavingSmtp] = useState(false);
  const [testingSmtp, setTestingSmtp] = useState(false);
  const [notifLoading, setNotifLoading] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [testingSlack, setTestingSlack] = useState(false);

  useEffect(() => {
      if (tab === "notifications" || tab === "slack") {
        api.get("/api/notifications/settings")
          .then((r) => {
            const s = r.data.settings;
            setNotifSettings({
              escalationEmailEnabled: s.escalationEmailEnabled ?? false,
              escalationEmail: s.escalationEmail ?? "",
              slackWebhookEnabled: s.slackWebhookEnabled ?? false,
              slackWebhookUrl: s.slackWebhookUrl ?? "",
              notifyOnHighRisk: s.notifyOnHighRisk ?? true,
              notifyOnCriticalRisk: s.notifyOnCriticalRisk ?? true,
              notifyOnLowConfidence: s.notifyOnLowConfidence ?? true,
            });
          })
          .catch(() => {});
        // Load SMTP config (masked)
        api.get("/api/notifications/smtp")
          .then((r) => {
            const s = r.data.smtp || {};
            setSmtpConfig({
              host: s.host || "",
              port: s.port || "587",
              user: s.user || "",
              pass: s.configured ? "••••••••" : "",
              from: s.from || "",
              secure: s.secure ?? false,
            });
          })
          .catch(() => {});
      }
  }, [tab]);
  const [profile, setProfile] = useState({ name: user?.name || "", email: user?.email || "" });
  const [passwords, setPasswords] = useState({ current: "", newPass: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await authApi.updateProfile(profile);
      await refreshUser();
      setSuccess("Profile updated successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to update profile");
    }
    setSaving(false);
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPass !== passwords.confirm) { setError("Passwords do not match"); return; }
    if (passwords.newPass.length < 8) { setError("Password must be at least 8 characters"); return; }
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await authApi.changePassword({ currentPassword: passwords.current, newPassword: passwords.newPass });
      setPasswords({ current: "", newPass: "", confirm: "" });
      setSuccess("Password changed successfully");
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to change password");
    }
    setSaving(false);
  };

  return (
    <div className="p-6 max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Settings</h1>
          <p className="text-gray-400 text-sm mt-1">Manage your account settings</p>
        </div>
        <div className="flex gap-2">
          <Link
            to="/sso"
            className="flex items-center gap-1.5 text-xs text-purple-400 hover:text-purple-300 bg-purple-950/30 border border-purple-800/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" />
            SSO / SAML
          </Link>
          <Link
            to="/status"
            className="flex items-center gap-1.5 text-xs text-green-400 hover:text-green-300 bg-green-950/30 border border-green-800/50 px-3 py-1.5 rounded-lg transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            System Status
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1 overflow-x-auto">
        {([
          { id: "profile", label: "Profile", icon: User },
          { id: "security", label: "Security", icon: Lock },
          { id: "encryption", label: "Encryption", icon: Lock },
          { id: "backups", label: "Backups", icon: Lock },
          { id: "notifications", label: "Notifications", icon: Bell },
          { id: "slack", label: "Slack", icon: MessageSquare },
        ] as const).map((t) => (

          <button
            key={t.id}
            onClick={() => { setTab(t.id); setError(""); setSuccess(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-colors ${tab === t.id ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
          >
            <t.icon className="w-4 h-4" />
            {t.label}
          </button>
        ))}
      </div>

      {error && <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>}
      {success && (
        <div className="bg-green-950/50 border border-green-800 text-green-300 text-sm rounded-lg px-4 py-3 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {success}
        </div>
      )}

      {tab === "profile" && (
        <form onSubmit={handleProfileSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white">Profile Information</h2>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Full Name</label>
            <input
              type="text"
              value={profile.name}
              onChange={(e) => setProfile({ ...profile, name: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Email Address</label>
            <input
              type="email"
              value={profile.email}
              onChange={(e) => setProfile({ ...profile, email: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1.5">Role</label>
            <input
              type="text"
              value={user?.role || "user"}
              disabled
              className="w-full bg-gray-800/50 border border-gray-700 text-gray-500 rounded-lg px-4 py-2.5 text-sm cursor-not-allowed"
            />
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Changes
          </button>
        </form>
      )}

      {tab === "encryption" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-white mb-2">Zero-Knowledge Encryption</h2>
              <p className="text-gray-400 text-sm mb-4">Your data is encrypted on the client side before being sent to our servers. Only you can decrypt it with your encryption key.</p>
            </div>
            <button
              onClick={async () => {
                setLoadingEncryption(true);
                try {
                  const res = await api.get("/api/security/encryption-key");
                  setEncryptionKey(res.data);
                  setSuccess("Encryption key generated. Save your recovery key in a secure location!");
                } catch (err: any) {
                  setError(err.response?.data?.error || "Failed to get encryption key");
                }
                setLoadingEncryption(false);
              }}
              disabled={loadingEncryption}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loadingEncryption && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate Encryption Key
            </button>
            {encryptionKey && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Public Key (Safe to share)</label>
                  <div className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-gray-300 font-mono break-all max-h-24 overflow-y-auto">{encryptionKey.publicKey}</div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-400 mb-1">Recovery Key (Save offline - required for account recovery)</label>
                  <div className="bg-gray-900 border border-gray-700 rounded p-2 text-xs text-yellow-300 font-mono break-all max-h-24 overflow-y-auto">{encryptionKey.recoveryKey}</div>
                  <p className="text-xs text-yellow-600 mt-2">⚠️ Store this key in a secure location. You will need it to recover your account if you lose access.</p>
                </div>
              </div>
            )}
          </div>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h2 className="font-semibold text-white">Recovery Keys</h2>
            <p className="text-gray-400 text-sm">Recovery keys allow you to regain access to your account if it's ever compromised. You can create multiple recovery keys.</p>
            <button
              onClick={async () => {
                setLoadingEncryption(true);
                try {
                  const res = await api.post("/api/security/recovery-keys/generate", {});
                  setSuccess("Recovery key generated. Save it in a secure location!");
                  setEncryptionKey({ publicKey: "", recoveryKey: res.data.recoveryKey });
                  // Reload recovery keys
                  const keysRes = await api.get("/api/security/recovery-keys");
                  setRecoveryKeys(keysRes.data.recoveryKeys);
                } catch (err: any) {
                  setError(err.response?.data?.error || "Failed to generate recovery key");
                }
                setLoadingEncryption(false);
              }}
              disabled={loadingEncryption}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loadingEncryption && <Loader2 className="w-4 h-4 animate-spin" />}
              Generate New Recovery Key
            </button>
            {recoveryKeys.length > 0 && (
              <div className="space-y-2">
                {recoveryKeys.map((key) => (
                  <div key={key.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                    <div className="text-sm">
                      <div className="text-white font-medium">Recovery Key {key.id.substring(0, 8)}...</div>
                      <div className="text-xs text-gray-400">Created: {new Date(key.createdAt).toLocaleDateString()}</div>
                    </div>
                    <button
                      onClick={async () => {
                        try {
                          await api.delete(`/api/security/recovery-keys/${key.id}`);
                          setRecoveryKeys(recoveryKeys.filter((k) => k.id !== key.id));
                          setSuccess("Recovery key revoked");
                        } catch (err: any) {
                          setError(err.response?.data?.error || "Failed to revoke recovery key");
                        }
                      }}
                      className="text-xs bg-red-600/20 hover:bg-red-600/30 text-red-400 px-3 py-1.5 rounded transition-colors"
                    >
                      Revoke
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {tab === "backups" && (
        <div className="space-y-5">
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <div>
              <h2 className="font-semibold text-white mb-2">Encrypted Backups (DRASS)</h2>
              <p className="text-gray-400 text-sm mb-4">Your data is automatically backed up and encrypted separately from the main database. You can restore from backups if needed.</p>
            </div>
            <button
              onClick={async () => {
                setLoadingBackups(true);
                try {
                  const res = await api.get("/api/security/backups");
                  setBackups(res.data.backups);
                  setSuccess("Backups loaded");
                } catch (err: any) {
                  setError(err.response?.data?.error || "Failed to load backups");
                }
                setLoadingBackups(false);
              }}
              disabled={loadingBackups}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {loadingBackups && <Loader2 className="w-4 h-4 animate-spin" />}
              Load Backups
            </button>
            {backups.length > 0 && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-white">Available Backups</h3>
                {backups.map((backup) => (
                  <div key={backup.id} className="bg-gray-800 border border-gray-700 rounded-lg p-3 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{backup.dataType.replace("_", " ").toUpperCase()}</div>
                        <div className="text-xs text-gray-400">Created: {new Date(backup.backupDate).toLocaleDateString()}</div>
                      </div>
                      <div className="text-xs text-gray-400">{(backup.encryptedSize / 1024).toFixed(2)} KB</div>
                    </div>
                    <div className="text-xs text-gray-500">Expires: {new Date(backup.expiresAt).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
            {backups.length === 0 && !loadingBackups && (
              <div className="text-sm text-gray-400">No backups available yet. Backups are created automatically.</div>
            )}
          </div>
        </div>
      )}

      {tab === "security" && (
        <form onSubmit={handlePasswordSave} className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
          <h2 className="font-semibold text-white">Change Password</h2>
          {[
            { key: "current", label: "Current Password", placeholder: "Enter current password" },
            { key: "newPass", label: "New Password", placeholder: "Min. 8 characters" },
            { key: "confirm", label: "Confirm New Password", placeholder: "Repeat new password" },
          ].map((f) => (
            <div key={f.key}>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">{f.label}</label>
              <input
                type="password"
                value={(passwords as any)[f.key]}
                onChange={(e) => setPasswords({ ...passwords, [f.key]: e.target.value })}
                placeholder={f.placeholder}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
            </div>
          ))}
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {saving && <Loader2 className="w-4 h-4 animate-spin" />}
            Change Password
          </button>
        </form>
      )}
      {/* Notifications Tab */}
      {tab === "notifications" && (
        <form onSubmit={async (e) => {
          e.preventDefault();
          setNotifLoading(true); setError(""); setSuccess("");
          try {
            await api.put("/api/notifications/settings", notifSettings);
            setSuccess("Notification settings saved");
          } catch (err: any) {
            setError(err.response?.data?.error || "Failed to save notification settings");
          }
          setNotifLoading(false);
        }} className="space-y-5">
          {/* Trigger conditions */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white">When to Notify</h2>
            <p className="text-gray-400 text-sm">Receive alerts when an agent escalates a task based on these conditions.</p>
            {[
              { key: "notifyOnCriticalRisk", label: "Critical risk level", description: "Agent flags the task as critical — immediate human review required" },
              { key: "notifyOnHighRisk", label: "High risk level", description: "Agent flags the task as high risk" },
              { key: "notifyOnLowConfidence", label: "Low confidence score", description: "Agent confidence falls below the escalation threshold" },
            ].map((item) => (
              <label key={item.key} className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(notifSettings as any)[item.key]}
                  onChange={(e) => setNotifSettings({ ...notifSettings, [item.key]: e.target.checked })}
                  className="mt-1 w-4 h-4 accent-blue-500"
                />
                <div>
                  <div className="text-sm font-medium text-white">{item.label}</div>
                  <div className="text-xs text-gray-400 mt-0.5">{item.description}</div>
                </div>
              </label>
            ))}
          </div>

          {/* SMTP Configuration */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Server className="w-4 h-4 text-green-400" />
              <h2 className="font-semibold text-white">SMTP Server Configuration</h2>
            </div>
            <p className="text-gray-400 text-sm">Configure your outbound email server to enable email escalation alerts. These credentials are stored securely and never exposed to the browser.</p>
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">SMTP Host</label>
                <input
                  type="text"
                  value={smtpConfig.host}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, host: e.target.value })}
                  placeholder="smtp.gmail.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500 font-mono"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Port</label>
                <input
                  type="number"
                  value={smtpConfig.port}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, port: e.target.value })}
                  placeholder="587"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500 font-mono"
                />
              </div>
              <div className="flex items-end pb-0.5">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={smtpConfig.secure}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, secure: e.target.checked })}
                    className="w-4 h-4 accent-green-500"
                  />
                  <span className="text-sm text-gray-300">Use SSL/TLS (port 465)</span>
                </label>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Username</label>
                <input
                  type="text"
                  value={smtpConfig.user}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, user: e.target.value })}
                  placeholder="you@gmail.com"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password / App Password</label>
                <div className="relative">
                  <input
                    type={showSmtpPass ? "text" : "password"}
                    value={smtpConfig.pass}
                    onChange={(e) => setSmtpConfig({ ...smtpConfig, pass: e.target.value })}
                    placeholder="App password or SMTP password"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 pr-10 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowSmtpPass(!showSmtpPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  >
                    {showSmtpPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-300 mb-1.5">From Address</label>
                <input
                  type="email"
                  value={smtpConfig.from}
                  onChange={(e) => setSmtpConfig({ ...smtpConfig, from: e.target.value })}
                  placeholder="WorkforceAutomated <noreply@yourcompany.com>"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-green-500 placeholder-gray-500"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={async () => {
                  setSavingSmtp(true); setError(""); setSuccess("");
                  try {
                    await api.put("/api/notifications/smtp", smtpConfig);
                    setSuccess("SMTP configuration saved");
                  } catch (err: any) {
                    setError(err.response?.data?.error || "Failed to save SMTP configuration");
                  }
                  setSavingSmtp(false);
                }}
                disabled={savingSmtp || !smtpConfig.host || !smtpConfig.user}
                className="flex items-center gap-2 bg-green-700 hover:bg-green-600 disabled:opacity-50 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {savingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Server className="w-3.5 h-3.5" />}
                Save SMTP Config
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTestingSmtp(true); setError(""); setSuccess("");
                  try {
                    await api.post("/api/notifications/test-smtp", smtpConfig);
                    setSuccess("SMTP connection test passed — server is reachable");
                  } catch (err: any) {
                    setError(err.response?.data?.error || "SMTP connection test failed — check host, port, and credentials");
                  }
                  setTestingSmtp(false);
                }}
                disabled={testingSmtp || !smtpConfig.host || !smtpConfig.user}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
              >
                {testingSmtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                Test Connection
              </button>
            </div>
            <div className="bg-gray-800/50 rounded-lg px-4 py-3 text-xs text-gray-500 space-y-1">
              <p><strong className="text-gray-400">Gmail:</strong> Use smtp.gmail.com, port 587, and generate an App Password at myaccount.google.com/apppasswords (requires 2FA).</p>
              <p><strong className="text-gray-400">Outlook/Office 365:</strong> Use smtp.office365.com, port 587, STARTTLS.</p>
              <p><strong className="text-gray-400">SendGrid:</strong> Use smtp.sendgrid.net, port 587, username: apikey, password: your SendGrid API key.</p>
            </div>
          </div>

          {/* Email notifications */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-blue-400" />
                <h2 className="font-semibold text-white">Email Notifications</h2>
              </div>
              <div
                onClick={() => setNotifSettings({ ...notifSettings, escalationEmailEnabled: !notifSettings.escalationEmailEnabled })}
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer ${notifSettings.escalationEmailEnabled ? "bg-blue-600" : "bg-gray-700"} relative`}
              >
                <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-transform ${notifSettings.escalationEmailEnabled ? "translate-x-5" : "translate-x-0.5"}`} />
              </div>
            </div>
            {notifSettings.escalationEmailEnabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1.5">Escalation Email Address</label>
                  <input
                    type="email"
                    value={notifSettings.escalationEmail}
                    onChange={(e) => setNotifSettings({ ...notifSettings, escalationEmail: e.target.value })}
                    placeholder="reviewer@yourcompany.com"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Requires SMTP configuration above.</p>
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    setTestingEmail(true); setError(""); setSuccess("");
                    try {
                      await api.post("/api/notifications/test-email", {});
                      setSuccess("Test email sent — check your inbox");
                    } catch (err: any) {
                      setError(err.response?.data?.error || "Email test failed — check SMTP configuration");
                    }
                    setTestingEmail(false);
                  }}
                  disabled={testingEmail || !notifSettings.escalationEmail}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors"
                >
                  {testingEmail ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Send Test Email
                </button>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={notifLoading}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            {notifLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Notification Settings
          </button>
        </form>
      )}

      {/* ─── Slack Tab ─────────────────────────────────────────────────────── */}
      {tab === "slack" && (
        <div className="space-y-6">
          {/* Hero banner */}
          <div className="bg-gradient-to-r from-purple-950/60 to-indigo-950/60 border border-purple-800/50 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-purple-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Slack — AI Communication Channel</h2>
                <p className="text-purple-300 text-sm">How your AI agents talk to you in real time</p>
              </div>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              When an AI agent has a question, needs a decision, or escalates a low-confidence task, it posts a real-time alert to your Slack channel — including the full task context, confidence score, risk level, and a direct link to approve or reject in the dashboard. No email chains. No missed alerts.
            </p>
          </div>

          {/* What you'll receive */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h3 className="font-semibold text-white">What Slack alerts look like</h3>
            <div className="bg-gray-800 rounded-lg p-4 font-mono text-xs space-y-1 border-l-4 border-purple-500">
              <p className="text-purple-300 font-bold">WorkforceAutomated Alerts</p>
              <p className="text-yellow-300">⚠️ Agent Escalation — Human Review Required</p>
              <p className="text-gray-300"><span className="text-gray-500">Agent:</span> Invoice Reviewer</p>
              <p className="text-gray-300"><span className="text-gray-500">Task:</span> Vendor X invoice $67,000 — missing PO number</p>
              <p className="text-gray-300"><span className="text-gray-500">Confidence:</span> <span className="text-red-400">42%</span> (below your 80% threshold)</p>
              <p className="text-gray-300"><span className="text-gray-500">Risk:</span> <span className="text-orange-400">High</span></p>
              <p className="text-blue-400 underline">→ Review &amp; Approve in Dashboard</p>
            </div>
            <div className="grid grid-cols-1 gap-3 text-sm">
              {[
                { icon: "🔔", title: "Escalation alerts", desc: "Agent confidence below your threshold — needs human sign-off" },
                { icon: "❓", title: "Agent questions", desc: "Agent needs clarification before proceeding with a task" },
                { icon: "⚠️", title: "High-risk flags", desc: "Critical or high-risk actions flagged before execution" },
                { icon: "✅", title: "Completion summaries", desc: "Batch completion reports when configured" },
              ].map((item) => (
                <div key={item.title} className="flex gap-3 items-start bg-gray-800/50 rounded-lg p-3">
                  <span className="text-lg flex-shrink-0">{item.icon}</span>
                  <div>
                    <p className="font-medium text-white text-sm">{item.title}</p>
                    <p className="text-gray-400 text-xs mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step-by-step connection guide */}
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
            <h3 className="font-semibold text-white">Connect your Slack workspace — 5 steps</h3>
            <ol className="space-y-4 list-none">
              {[
                { n: 1, text: <span>Go to <a href="https://api.slack.com/apps" target="_blank" rel="noreferrer" className="text-purple-400 hover:underline font-medium">api.slack.com/apps</a> and click <strong className="text-white">Create New App</strong> → <strong className="text-white">From scratch</strong>.</span> },
                { n: 2, text: <span>Name your app (e.g. <em className="text-gray-200">WorkforceAutomated Alerts</em>), select your Slack workspace, and click <strong className="text-white">Create App</strong>.</span> },
                { n: 3, text: <span>In the left sidebar click <strong className="text-white">Incoming Webhooks</strong>, then toggle <strong className="text-white">Activate Incoming Webhooks</strong> to On.</span> },
                { n: 4, text: <span>Click <strong className="text-white">Add New Webhook to Workspace</strong>, choose the channel for AI alerts (e.g. <code className="text-purple-300 bg-gray-800 px-1 rounded text-xs">#ai-alerts</code>), and click <strong className="text-white">Allow</strong>.</span> },
                { n: 5, text: <span>Copy the <strong className="text-white">Webhook URL</strong> (starts with <code className="text-purple-300 bg-gray-800 px-1 rounded text-xs">https://hooks.slack.com/services/...</code>) and paste it below, then click <strong className="text-white">Send Test Message</strong>.</span> },
              ].map((step) => (
                <li key={step.n} className="flex gap-4 items-start">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-purple-600 text-white text-sm flex items-center justify-center font-bold">{step.n}</span>
                  <p className="text-sm text-gray-300 leading-relaxed pt-0.5">{step.text}</p>
                </li>
              ))}
            </ol>
          </div>

          {/* Webhook URL input + toggle + test */}
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              setNotifLoading(true); setError(""); setSuccess("");
              try {
                await api.put("/api/notifications/settings", notifSettings);
                setSuccess("Slack settings saved");
              } catch (err: any) {
                setError(err.response?.data?.error || "Failed to save Slack settings");
              }
              setNotifLoading(false);
            }}
            className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5"
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white">Enable Slack Notifications</h3>
                <p className="text-gray-400 text-xs mt-0.5">Toggle on to activate real-time Slack alerts from AI agents</p>
              </div>
              <div
                onClick={() => setNotifSettings({ ...notifSettings, slackWebhookEnabled: !notifSettings.slackWebhookEnabled })}
                className={`w-11 h-6 rounded-full transition-colors cursor-pointer flex-shrink-0 ${notifSettings.slackWebhookEnabled ? "bg-purple-600" : "bg-gray-700"} relative`}
              >
                <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${notifSettings.slackWebhookEnabled ? "translate-x-6" : "translate-x-1"}`} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Slack Incoming Webhook URL</label>
              <input
                type="url"
                value={notifSettings.slackWebhookUrl}
                onChange={(e) => setNotifSettings({ ...notifSettings, slackWebhookUrl: e.target.value })}
                placeholder="Paste your Slack Incoming Webhook URL here"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-purple-500 placeholder-gray-500 font-mono"
              />
              <p className="text-xs text-gray-500 mt-1">Once saved, AI agents will post escalation alerts and approval requests directly to your chosen Slack channel in real time.</p>
            </div>
            {/* Trigger settings */}
            <div className="space-y-3">
              <p className="text-sm font-medium text-gray-300">Notify me when:</p>
              {[
                { key: "notifyOnHighRisk" as const, label: "High-risk tasks are flagged", desc: "Agent flags a task as high or critical risk" },
                { key: "notifyOnCriticalRisk" as const, label: "Critical-risk tasks are flagged", desc: "Agent flags a task as critical — immediate action required" },
                { key: "notifyOnLowConfidence" as const, label: "Low-confidence tasks are escalated", desc: "Agent confidence falls below your governance threshold" },
              ].map((trigger) => (
                <label key={trigger.key} className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifSettings[trigger.key]}
                    onChange={(e) => setNotifSettings({ ...notifSettings, [trigger.key]: e.target.checked })}
                    className="w-4 h-4 accent-purple-500 mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="text-sm text-white font-medium">{trigger.label}</p>
                    <p className="text-xs text-gray-500">{trigger.desc}</p>
                  </div>
                </label>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={notifLoading}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
              >
                {notifLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                Save Slack Settings
              </button>
              <button
                type="button"
                onClick={async () => {
                  setTestingSlack(true); setError(""); setSuccess("");
                  try {
                    await api.post("/api/notifications/test-slack", {});
                    setSuccess("Test Slack message sent — check your channel");
                  } catch (err: any) {
                    setError(err.response?.data?.error || "Slack test failed — check your webhook URL and save settings first");
                  }
                  setTestingSlack(false);
                }}
                disabled={testingSlack || !notifSettings.slackWebhookUrl}
                className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-gray-300 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors"
              >
                {testingSlack ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Send Test Message
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
