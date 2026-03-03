import { useState } from "react";
import { User, Lock, Bell, Loader2, CheckCircle } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { authApi } from "../lib/api";

export default function Settings() {
  const { user, refreshUser } = useAuth();
  const [tab, setTab] = useState<"profile" | "security">("profile");
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
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your account settings</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-900 border border-gray-800 rounded-xl p-1">
        {([
          { id: "profile", label: "Profile", icon: User },
          { id: "security", label: "Security", icon: Lock },
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
    </div>
  );
}
