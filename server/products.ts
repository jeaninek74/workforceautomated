// WorkforceAutomated — Stripe Products & Pricing Configuration

export type PlanTier = "starter" | "professional" | "enterprise";

export interface PlanConfig {
  id: PlanTier;
  name: string;
  description: string;
  price: number; // in cents
  priceDisplay: string;
  interval: "month" | "year";
  stripePriceId?: string; // set after creating in Stripe dashboard
  features: string[];
  limits: {
    agents: number | "unlimited";
    executions: number | "unlimited";
    teamWorkflows: number | "unlimited";
    auditRetentionDays: number;
  };
  highlighted?: boolean;
}

export const PLANS: Record<PlanTier, PlanConfig> = {
  starter: {
    id: "starter",
    name: "Starter",
    description: "For individuals and small teams exploring AI workforce automation",
    price: 4900, // $49/month
    priceDisplay: "$49",
    interval: "month",
    features: [
      "Up to 5 AI agents",
      "500 executions per month",
      "Single agent execution mode",
      "Confidence scoring & risk classification",
      "Basic audit logging (30 days)",
      "Email support",
    ],
    limits: {
      agents: 5,
      executions: 500,
      teamWorkflows: 0,
      auditRetentionDays: 30,
    },
  },
  professional: {
    id: "professional",
    name: "Professional",
    description: "For growing teams that need multi-agent workflows and advanced governance",
    price: 14900, // $149/month
    priceDisplay: "$149",
    interval: "month",
    highlighted: true,
    features: [
      "Up to 25 AI agents",
      "5,000 executions per month",
      "Multi-agent team workflows",
      "Advanced confidence & risk monitoring",
      "Governance threshold controls",
      "Escalation management",
      "Audit logging (90 days)",
      "Priority support",
    ],
    limits: {
      agents: 25,
      executions: 5000,
      teamWorkflows: 10,
      auditRetentionDays: 90,
    },
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    description: "For organizations requiring unlimited scale, SSO, and full compliance",
    price: 49900, // $499/month
    priceDisplay: "$499",
    interval: "month",
    features: [
      "Unlimited AI agents",
      "Unlimited executions",
      "Unlimited team workflows",
      "Full governance & compliance suite",
      "Immutable audit logs (365 days)",
      "Custom confidence thresholds",
      "SSO & advanced access controls",
      "Exportable compliance reports",
      "Dedicated account manager",
      "SLA guarantee",
    ],
    limits: {
      agents: "unlimited",
      executions: "unlimited",
      teamWorkflows: "unlimited",
      auditRetentionDays: 365,
    },
  },
};

export const PLAN_ORDER: PlanTier[] = ["starter", "professional", "enterprise"];

export function getPlanByTier(tier: PlanTier): PlanConfig {
  return PLANS[tier];
}

export function canAccessFeature(
  plan: PlanTier,
  feature: "team_workflows" | "governance" | "sso" | "export_reports"
): boolean {
  switch (feature) {
    case "team_workflows":
      return plan === "professional" || plan === "enterprise";
    case "governance":
      return plan === "professional" || plan === "enterprise";
    case "sso":
      return plan === "enterprise";
    case "export_reports":
      return plan === "enterprise";
    default:
      return false;
  }
}
