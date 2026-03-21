import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const billingRouter = Router();
billingRouter.use(authenticate);

function getStripe() {
  return new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-02-24.acacia" as any });
}

// Price IDs are not secrets — they are safe to include as fallbacks
const PLANS = {
  starter: {
    priceId: process.env.STRIPE_STARTER_PRICE_ID || "price_1TDHvUEI9dLhzTVpioXPV7q8",
    name: "Starter",
    price: 49,
    features: ["5 AI agents", "500 executions/mo", "Email support", "Slack notifications", "Audit log"],
  },
  professional: {
    priceId: process.env.STRIPE_PRO_PRICE_ID || "price_1TDHvWEI9dLhzTVpwKCUQmkf",
    name: "Professional",
    price: 149,
    features: ["25 AI agents", "5,000 executions/mo", "Priority support", "Slack notifications", "Advanced governance", "Custom KPIs", "Scheduled runs"],
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "price_1TDHvYEI9dLhzTVp3q00L7i4",
    name: "Enterprise",
    price: 499,
    features: ["Unlimited agents", "Unlimited executions", "Dedicated support", "SSO / SAML", "Custom integrations", "SLA guarantee", "White-label option"],
  },
};

billingRouter.get("/plans", (_req, res) => {
  res.json({ plans: PLANS });
});

async function createCheckoutSession(req: AuthRequest, res: any) {
  try {
    const stripe = getStripe();
    const { plan } = req.body as { plan: "starter" | "professional" | "enterprise" };
    const planConfig = PLANS[plan];
    if (!planConfig) return res.status(400).json({ error: "Invalid plan" });
    if (!planConfig.priceId) return res.status(500).json({ error: "Stripe price ID not configured" });
    const origin = req.headers.origin || process.env.FRONTEND_URL || "https://workforceautomated.com";
    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: req.user!.email,
      line_items: [{ price: planConfig.priceId, quantity: 1 }],
      success_url: `${origin}/billing?success=true`,
      cancel_url: `${origin}/billing?cancelled=true`,
      allow_promotion_codes: true,
      metadata: { userId: String(req.user!.id), plan },
      client_reference_id: String(req.user!.id),
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

billingRouter.post("/checkout", createCheckoutSession);
billingRouter.post("/subscribe", createCheckoutSession);

billingRouter.post("/portal", async (req: AuthRequest, res) => {
  try {
    const stripe = getStripe();
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!user?.stripeCustomerId) return res.status(400).json({ error: "No billing account found" });
    const origin = req.headers.origin || process.env.FRONTEND_URL || "https://workforceautomated.com";
    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${origin}/billing`,
    });
    res.json({ url: session.url });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

billingRouter.get("/subscription", async (req: AuthRequest, res) => {
  const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
  res.json({ plan: user?.plan || "starter", stripeCustomerId: user?.stripeCustomerId });
});
