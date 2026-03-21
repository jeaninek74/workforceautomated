import { useEffect, useState } from "react";
import { CreditCard, CheckCircle, Loader2, ExternalLink, Star, Zap, Shield } from "lucide-react";
import { billingApi } from "../lib/api";
import { useAuth } from "../contexts/AuthContext";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "$49",
    period: "/mo",
    priceId: import.meta.env.VITE_STRIPE_STARTER_PRICE_ID || "",
    features: ["5 AI Agents", "1 agent team", "10,000 executions/month", "Slack + webhook integrations", "Audit log & governance"],
    icon: Zap,
    color: "blue",
  },
  {
    id: "professional",
    name: "Professional",
    price: "$149",
    period: "/mo",
    priceId: import.meta.env.VITE_STRIPE_PRO_PRICE_ID || "",
    features: ["25 AI Agents", "Unlimited agent teams", "100,000 executions/month", "Slack, Zapier, REST API, CRM & ERP connectors", "Execution trend reports & agent performance dashboards", "Advanced governance & custom KPIs"],
    icon: Star,
    color: "purple",
    popular: true,
  },
  {
    id: "enterprise",
    name: "Enterprise",
    price: "Custom",
    period: "",
    priceId: "",
    features: ["Unlimited AI Agents", "Unlimited agent teams", "Unlimited executions", "Custom integrations", "99.9% uptime SLA", "SSO / SAML"],
    icon: Shield,
    color: "green",
  },
];

export default function Billing() {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    billingApi.getSubscription()
      .then((r) => setSubscription(r.data?.subscription))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (priceId: string, planId: string) => {
    if (!priceId) {
      window.open("mailto:sales@workforceautomated.com?subject=Enterprise Inquiry", "_blank");
      return;
    }
    setCheckoutLoading(planId);
    try {
      const res = await billingApi.createCheckout({ priceId, origin: window.location.origin });
      window.open(res.data?.url, "_blank");
    } catch (err: any) {
      alert(err.response?.data?.error || "Failed to start checkout");
    }
    setCheckoutLoading(null);
  };

  const handlePortal = async () => {
    setPortalLoading(true);
    try {
      const res = await billingApi.createPortal({ origin: window.location.origin });
      window.open(res.data?.url, "_blank");
    } catch (_) {}
    setPortalLoading(false);
  };

  const currentPlan = subscription?.plan || "free";

  return (
    <div className="p-6 space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing & Subscription</h1>
        <p className="text-gray-400 text-sm mt-1">Manage your plan and payment details</p>
      </div>

      {/* Current Subscription */}
      {!loading && subscription && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-sm text-gray-400 mb-1">Current Plan</div>
              <div className="text-xl font-bold text-white capitalize">{subscription.plan || "Free"}</div>
              {subscription.currentPeriodEnd && (
                <div className="text-sm text-gray-400 mt-1">
                  Renews {new Date(subscription.currentPeriodEnd * 1000).toLocaleDateString()}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                subscription.status === "active" ? "bg-green-950/50 text-green-400 border border-green-800" : "bg-gray-800 text-gray-400"
              }`}>
                {subscription.status || "inactive"}
              </div>
              {subscription.stripeSubscriptionId && (
                <button
                  onClick={handlePortal}
                  disabled={portalLoading}
                  className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-gray-700"
                >
                  {portalLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ExternalLink className="w-4 h-4" />}
                  Manage Billing
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {PLANS.map((plan) => {
          const isCurrentPlan = currentPlan === plan.id;
          const Icon = plan.icon;
          return (
            <div key={plan.id} className={`relative bg-gray-900 border rounded-2xl p-6 ${plan.popular ? "border-purple-600 shadow-lg shadow-purple-500/10" : "border-gray-800"}`}>
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-medium px-3 py-1 rounded-full">
                  Most Popular
                </div>
              )}
              <div className={`w-10 h-10 rounded-xl bg-${plan.color}-500/10 border border-${plan.color}-500/20 flex items-center justify-center mb-4`}>
                <Icon className={`w-5 h-5 text-${plan.color}-400`} />
              </div>
              <div className="text-sm text-gray-400 mb-1">{plan.name}</div>
              <div className="flex items-baseline gap-1 mb-4">
                <span className="text-3xl font-bold text-white">{plan.price}</span>
                <span className="text-gray-500 text-sm">{plan.period}</span>
              </div>
              <ul className="space-y-2.5 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-gray-300">
                    <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              {isCurrentPlan ? (
                <div className="w-full text-center py-2.5 bg-gray-800 text-gray-400 text-sm font-medium rounded-xl border border-gray-700">
                  Current Plan
                </div>
              ) : (
                <button
                  onClick={() => handleSubscribe(plan.priceId, plan.id)}
                  disabled={checkoutLoading === plan.id}
                  className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    plan.popular
                      ? "bg-purple-600 hover:bg-purple-500 text-white"
                      : "bg-gray-800 hover:bg-gray-700 text-white border border-gray-700"
                  } disabled:opacity-50`}
                >
                  {checkoutLoading === plan.id ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Redirecting...</>
                  ) : plan.price === "Custom" ? (
                    "Contact Sales"
                  ) : (
                    "Upgrade Now"
                  )}
                </button>
              )}
            </div>
          );
        })}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 flex items-start gap-3">
        <CreditCard className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-400">
          <span className="text-white font-medium">Test mode:</span> Use card number <code className="bg-gray-800 text-blue-300 px-1.5 py-0.5 rounded text-xs">4242 4242 4242 4242</code> with any future expiry and any CVC for testing. All transactions are in test mode until you activate your Stripe account.
        </div>
      </div>
    </div>
  );
}
