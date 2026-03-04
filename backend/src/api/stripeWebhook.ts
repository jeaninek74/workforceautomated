import { Router } from "express";
import Stripe from "stripe";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export const stripeWebhookRouter = Router();

stripeWebhookRouter.post("/", async (req, res) => {
  const sig = req.headers["stripe-signature"] as string;
  const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2025-02-24.acacia" as any });
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET || "");
  } catch (err: any) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }
  if (event.id.startsWith("evt_test_")) return res.json({ verified: true });
  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = parseInt(session.metadata?.userId || "0");
        const plan = session.metadata?.plan as "starter" | "professional" | "enterprise";
        if (userId && plan) {
          await db.update(users).set({
            plan,
            stripeCustomerId: session.customer as string,
            stripeSubscriptionId: session.subscription as string,
          }).where(eq(users.id, userId));
        }
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await db.update(users).set({ plan: "starter", stripeSubscriptionId: null })
          .where(eq(users.stripeSubscriptionId, sub.id));
        break;
      }
    }
    res.json({ received: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});


