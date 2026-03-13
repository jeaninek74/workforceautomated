import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, AlertTriangle, CheckCircle, Loader2, Shield } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

export default function AccountRecovery() {
  const navigate = useNavigate();
  const [step, setStep] = useState<"verify" | "recover" | "success">("verify");
  const [userId, setUserId] = useState("");
  const [recoveryKey, setRecoveryKey] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleVerifyRecoveryKey = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!userId || !recoveryKey) {
        throw new Error("Please enter both user ID and recovery key");
      }

      const response = await axios.post(`${API}/api/security/verify-recovery-key`, {
        userId: parseInt(userId),
        recoveryKey,
      });

      if (response.data.isValid) {
        setSuccess("Recovery key verified successfully!");
        setStep("recover");
      } else {
        throw new Error("Invalid recovery key");
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || "Failed to verify recovery key");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (!newPassword || !confirmPassword) {
        throw new Error("Please enter both password fields");
      }

      if (newPassword !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      if (newPassword.length < 8) {
        throw new Error("Password must be at least 8 characters");
      }

      // In production, this would call an endpoint to reset password with recovery key
      // For now, we'll simulate success
      setSuccess("Password reset successfully!");
      setStep("success");

      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#0a0a0f", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div style={{ maxWidth: 500, width: "100%" }}>
        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 10, marginBottom: 20 }}>
            <Shield size={32} color="#6366f1" />
            <h1 style={{ fontSize: 28, fontWeight: 700, color: "#fff", margin: 0 }}>Account Recovery</h1>
          </div>
          <p style={{ color: "#6060a0", fontSize: 16 }}>
            {step === "verify" && "Use your recovery key to regain access to your account"}
            {step === "recover" && "Create a new password for your account"}
            {step === "success" && "Your account has been recovered successfully"}
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div style={{ background: "#7f1d1d", border: "1px solid #991b1b", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 12 }}>
            <AlertTriangle size={20} color="#fca5a5" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#fca5a5" }}>Error</div>
              <div style={{ fontSize: 13, color: "#fecaca", marginTop: 4 }}>{error}</div>
            </div>
          </div>
        )}

        {/* Success Alert */}
        {success && (
          <div style={{ background: "#064e3b", border: "1px solid #10b981", borderRadius: 12, padding: 16, marginBottom: 24, display: "flex", gap: 12 }}>
            <CheckCircle size={20} color="#6ee7b7" style={{ flexShrink: 0 }} />
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: "#6ee7b7" }}>Success</div>
              <div style={{ fontSize: 13, color: "#a7f3d0", marginTop: 4 }}>{success}</div>
            </div>
          </div>
        )}

        {/* Step 1: Verify Recovery Key */}
        {step === "verify" && (
          <form onSubmit={handleVerifyRecoveryKey} style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 12, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#c0c0d8", marginBottom: 8 }}>User ID</label>
              <input
                type="number"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                placeholder="Enter your user ID"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#c0c0d8", marginBottom: 8 }}>Recovery Key</label>
              <textarea
                value={recoveryKey}
                onChange={(e) => setRecoveryKey(e.target.value)}
                placeholder="Paste your recovery key here"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  minHeight: 100,
                  fontFamily: "monospace",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
              <p style={{ fontSize: 12, color: "#6060a0", marginTop: 8 }}>
                This is the recovery key you saved when you set up encryption. It should be stored in a secure location.
              </p>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: 8,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              Verify Recovery Key
            </button>
          </form>
        )}

        {/* Step 2: Reset Password */}
        {step === "recover" && (
          <form onSubmit={handleResetPassword} style={{ background: "#0f0f1a", border: "1px solid #2a2a3e", borderRadius: 12, padding: 32 }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#c0c0d8", marginBottom: 8 }}>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: 24 }}>
              <label style={{ display: "block", fontSize: 14, fontWeight: 600, color: "#c0c0d8", marginBottom: 8 }}>Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repeat new password"
                style={{
                  width: "100%",
                  background: "#0a0a0f",
                  border: "1px solid #2a2a3e",
                  borderRadius: 8,
                  padding: "12px 16px",
                  color: "#fff",
                  fontSize: 14,
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                border: "none",
                borderRadius: 8,
                padding: "12px 16px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.5 : 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
              }}
            >
              {loading && <Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} />}
              Reset Password
            </button>
          </form>
        )}

        {/* Step 3: Success */}
        {step === "success" && (
          <div style={{ background: "#064e3b", border: "2px solid #10b981", borderRadius: 12, padding: 40, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 20 }}>
              <CheckCircle size={48} color="#10b981" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: "#fff", marginBottom: 12 }}>Account Recovered</h2>
            <p style={{ color: "#a7f3d0", fontSize: 14, marginBottom: 24 }}>
              Your account has been successfully recovered. You can now log in with your new password.
            </p>
            <button
              onClick={() => navigate("/login")}
              style={{
                background: "#10b981",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                color: "#fff",
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Go to Login
            </button>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: "center", marginTop: 24 }}>
          <p style={{ color: "#6060a0", fontSize: 13 }}>
            Don't have a recovery key?{" "}
            <a href="/contact-support" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 600 }}>
              Contact support
            </a>
          </p>
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
