import Stripe from "stripe";
import express from "express";
import { upsertSubscription, getSubscriptionByCustomerId } from "./db";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-02-25.clover" });

export function registerStripeWebhook(app: express.Application) {
  // MUST use raw body before json middleware
  app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !webhookSecret) {
      return res.status(400).json({ error: "Missing signature or webhook secret" });
    }

    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err: any) {
      console.error("[Stripe Webhook] Signature verification failed:", err.message);
      return res.status(400).json({ error: `Webhook Error: ${err.message}` });
    }

    // Handle test events
    if (event.id.startsWith("evt_test_")) {
      console.log("[Stripe Webhook] Test event detected, returning verification response");
      return res.json({ verified: true });
    }

    console.log(`[Stripe Webhook] Event: ${event.type} | ID: ${event.id}`);

    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          const userId = parseInt(session.metadata?.user_id || session.client_reference_id || "0");
          const plan = (session.metadata?.plan || "starter") as "starter" | "professional" | "enterprise";
          if (userId) {
            await upsertSubscription(userId, {
              stripeCustomerId: session.customer as string,
              stripeSubscriptionId: session.subscription as string,
              plan,
              status: "active",
            });
            console.log(`[Stripe Webhook] Subscription activated for user ${userId}, plan: ${plan}`);
          }
          break;
        }
        case "customer.subscription.updated": {
          const sub = event.data.object as Stripe.Subscription;
          const existing = await getSubscriptionByCustomerId(sub.customer as string);
          if (existing) {
            const status = sub.status as "active" | "canceled" | "past_due" | "trialing" | "incomplete";
            await upsertSubscription(existing.userId, {
              stripeSubscriptionId: sub.id,
              status,
              cancelAtPeriodEnd: sub.cancel_at_period_end,
              currentPeriodStart: new Date(((sub as any).current_period_start) * 1000),
              currentPeriodEnd: new Date(((sub as any).current_period_end) * 1000),
            });
            console.log(`[Stripe Webhook] Subscription updated for user ${existing.userId}, status: ${status}`);
          }
          break;
        }
        case "customer.subscription.deleted": {
          const sub = event.data.object as Stripe.Subscription;
          const existing = await getSubscriptionByCustomerId(sub.customer as string);
          if (existing) {
            await upsertSubscription(existing.userId, { status: "canceled", plan: "starter" });
            console.log(`[Stripe Webhook] Subscription canceled for user ${existing.userId}`);
          }
          break;
        }
        case "invoice.payment_failed": {
          const invoice = event.data.object as Stripe.Invoice;
          const existing = await getSubscriptionByCustomerId(invoice.customer as string);
          if (existing) {
            await upsertSubscription(existing.userId, { status: "past_due" });
            console.log(`[Stripe Webhook] Payment failed for user ${existing.userId}`);
          }
          break;
        }
        default:
          console.log(`[Stripe Webhook] Unhandled event type: ${event.type}`);
      }
    } catch (err: any) {
      console.error("[Stripe Webhook] Handler error:", err.message);
      return res.status(500).json({ error: "Webhook handler failed" });
    }

    return res.json({ received: true });
  });
}
