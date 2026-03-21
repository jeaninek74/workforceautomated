import { useRef, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Bot, Eye, EyeOff, Loader2, Shield } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { haptic } from "@/hooks/useHaptic";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

interface SSOStatus {
  enabled: boolean;
  provider: string | null;
  forceSSO: boolean;
  hasSsoUrl: boolean;
}

const PROVIDER_LABELS: Record<string, string> = {
  okta: "Okta",
  azure: "Microsoft Azure AD",
  google: "Google Workspace",
  onelogin: "OneLogin",
  ping: "PingIdentity",
  custom: "SSO",
};

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ssoStatus, setSsoStatus] = useState<SSOStatus | null>(null);

  useEffect(() => {
    // Check if SSO is configured
    axios.get(`${API}/api/sso/status`)
      .then((res) => setSsoStatus(res.data))
      .catch(() => setSsoStatus(null));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const email = emailRef.current?.value?.trim() || "";
    const password = passwordRef.current?.value || "";
    if (!email || !password) {
      setError("Please enter your email and password.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await login(email, password);
      navigate("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.error || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  const handleSSOLogin = () => {
    haptic("medium");
    // Redirect to SSO settings page for now — in a full SAML flow this would
    // initiate the SP-initiated SAML request to the IdP
    window.location.href = `${API}/api/sso/initiate`;
  };

  const ssoEnabled = ssoStatus?.enabled && ssoStatus?.hasSsoUrl;
  const providerLabel = ssoStatus?.provider
    ? PROVIDER_LABELS[ssoStatus.provider] || "SSO"
    : "SSO";

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <Bot className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-white">WorkforceAutomated</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="text-gray-400 mt-1">Sign in to your account</p>
        </div>

        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8">
          {error && (
            <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3 mb-6">
              {error}
            </div>
          )}

          {/* SSO Login Button */}
          {ssoEnabled && (
            <>
              <button
                type="button"
                onClick={handleSSOLogin}
                className="w-full flex items-center justify-center gap-2.5 bg-gray-800 hover:bg-gray-700 border border-gray-700 text-white font-medium py-2.5 rounded-lg transition-colors mb-5"
              >
                <Shield className="w-4 h-4 text-purple-400" />
                Sign in with {providerLabel}
              </button>

              {!ssoStatus?.forceSSO && (
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex-1 h-px bg-gray-800" />
                  <span className="text-xs text-gray-500">or sign in with password</span>
                  <div className="flex-1 h-px bg-gray-800" />
                </div>
              )}
            </>
          )}

          {/* Password Login Form — hidden when SSO is forced */}
          {!ssoStatus?.forceSSO && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Email address</label>
                <input
                  ref={emailRef}
                  type="email"
                  required
                  autoComplete="email"
                  className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
                  placeholder="you@company.com"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    ref={passwordRef}
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 placeholder-gray-500 pr-10"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => { haptic("selection"); setShowPassword(!showPassword); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-300"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <button
                type="submit"
                disabled={loading}
                onClick={() => haptic("medium")}
                className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                Sign In
              </button>
            </form>
          )}

          {ssoStatus?.forceSSO && (
            <p className="text-center text-xs text-gray-500 mt-4">
              Your organization requires SSO login. Contact your admin if you need assistance.
            </p>
          )}

          {!ssoStatus?.forceSSO && (
            <p className="text-center text-sm text-gray-400 mt-6">
              Don't have an account?{" "}
              <Link to="/register" className="text-blue-400 hover:text-blue-300 font-medium">
                Sign up free
              </Link>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
