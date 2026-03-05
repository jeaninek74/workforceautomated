import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { notificationSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const notificationsRouter = Router();
notificationsRouter.use(authenticate);

// ─── GET /api/notifications/settings ─────────────────────────────────────────
notificationsRouter.get("/settings", async (req: AuthRequest, res) => {
  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, req.user!.id))
    .limit(1);

  if (!settings) {
    // Return defaults if not configured yet
    return res.json({
      settings: {
        escalationEmailEnabled: false,
        escalationEmail: "",
        slackWebhookEnabled: false,
        slackWebhookUrl: "",
        notifyOnHighRisk: true,
        notifyOnCriticalRisk: true,
        notifyOnLowConfidence: true,
      },
    });
  }

  // Never expose slackWebhookUrl in full — mask it
  const masked = {
    ...settings,
    slackWebhookUrl: settings.slackWebhookUrl
      ? settings.slackWebhookUrl.slice(0, 30) + "..." 
      : "",
  };
  res.json({ settings: masked });
});

// ─── PUT /api/notifications/settings ─────────────────────────────────────────
notificationsRouter.put("/settings", async (req: AuthRequest, res) => {
  const body = z.object({
    escalationEmailEnabled: z.boolean().optional(),
    escalationEmail: z.string().email().optional().or(z.literal("")),
    slackWebhookEnabled: z.boolean().optional(),
    slackWebhookUrl: z.string().url().optional().or(z.literal("")),
    notifyOnHighRisk: z.boolean().optional(),
    notifyOnCriticalRisk: z.boolean().optional(),
    notifyOnLowConfidence: z.boolean().optional(),
  }).parse(req.body);

  const [existing] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, req.user!.id))
    .limit(1);

  if (existing) {
    const [updated] = await db
      .update(notificationSettings)
      .set({ ...body, updatedAt: new Date() })
      .where(eq(notificationSettings.userId, req.user!.id))
      .returning();
    return res.json({ settings: updated });
  } else {
    const [created] = await db
      .insert(notificationSettings)
      .values({ userId: req.user!.id, ...body })
      .returning();
    return res.json({ settings: created });
  }
});

// ─── POST /api/notifications/test-slack ──────────────────────────────────────
notificationsRouter.post("/test-slack", async (req: AuthRequest, res) => {
  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, req.user!.id))
    .limit(1);

  if (!settings?.slackWebhookUrl) {
    return res.status(400).json({ error: "No Slack webhook URL configured" });
  }

  try {
    const response = await fetch(settings.slackWebhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        text: "✅ WorkforceAutomated — Slack notifications are working correctly! You will receive escalation alerts here.",
      }),
    });
    if (response.ok) {
      res.json({ success: true });
    } else {
      res.status(400).json({ error: `Slack returned ${response.status}` });
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/notifications/test-email ──────────────────────────────────────
notificationsRouter.post("/test-email", async (req: AuthRequest, res) => {
  const [settings] = await db
    .select()
    .from(notificationSettings)
    .where(eq(notificationSettings.userId, req.user!.id))
    .limit(1);

  if (!settings?.escalationEmail) {
    return res.status(400).json({ error: "No escalation email configured" });
  }

  // Import sendEscalationNotification to send a test
  const { sendEscalationNotification } = await import("../services/notifications.js");
  const result = await sendEscalationNotification({
    userId: req.user!.id,
    executionId: 0,
    agentName: "Test Agent",
    taskInput: "This is a test notification from WorkforceAutomated.",
    escalationReason: "Test notification — your email alerts are configured correctly.",
    confidenceScore: 0.45,
    riskLevel: "high",
  });

  if (result.email) {
    res.json({ success: true });
  } else {
    res.status(500).json({ error: "Email send failed — check SMTP configuration" });
  }
});
