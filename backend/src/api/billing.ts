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

const PLANS = {
  starter: { priceId: process.env.STRIPE_STARTER_PRICE_ID || "", name: "Starter", price: 49 },
  professional: { priceId: process.env.STRIPE_PRO_PRICE_ID || "", name: "Professional", price: 149 },
  enterprise: { priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID || "", name: "Enterprise", price: 499 },
};

billingRouter.get("/plans", (_req, res) => {
  res.json({ plans: PLANS });
});

billingRouter.post("/checkout", async (req: AuthRequest, res) => {
  try {
    const stripe = getStripe();
    const { plan } = req.body as { plan: "starter" | "professional" | "enterprise" };
    const planConfig = PLANS[plan];
    if (!planConfig) return res.status(400).json({ error: "Invalid plan" });
    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
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
});

billingRouter.post("/portal", async (req: AuthRequest, res) => {
  try {
    const stripe = getStripe();
    const [user] = await db.select().from(users).where(eq(users.id, req.user!.id)).limit(1);
    if (!user?.stripeCustomerId) return res.status(400).json({ error: "No billing account found" });
    const origin = req.headers.origin || process.env.FRONTEND_URL || "http://localhost:5173";
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
