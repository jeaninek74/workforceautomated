import nodemailer from "nodemailer";
import { db } from "../db/index.js";
import { notificationSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface EscalationNotificationPayload {
  userId: number;
  executionId: number;
  agentName?: string;
  teamName?: string;
  taskInput: string;
  escalationReason: string;
  confidenceScore: number;
  riskLevel: string;
  output?: string;
}

// ─── Email via SMTP ───────────────────────────────────────────────────────────

async function sendEmailNotification(
  to: string,
  payload: EscalationNotificationPayload
): Promise<boolean> {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = parseInt(process.env.SMTP_PORT || "587");
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fromEmail = process.env.SMTP_FROM || smtpUser || "noreply@workforceautomated.com";

  if (!smtpHost || !smtpUser || !smtpPass) {
    console.warn("[Notifications] SMTP not configured — skipping email");
    return false;
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: { user: smtpUser, pass: smtpPass },
  });

  const source = payload.teamName
    ? `Team: ${payload.teamName}`
    : `Agent: ${payload.agentName || "Unknown"}`;

  const confidencePct = Math.round(payload.confidenceScore * 100);

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; max-width: 600px; margin: 0 auto; background: #0f172a; color: #e2e8f0; padding: 24px; border-radius: 12px;">
      <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 24px;">
        <div style="background: #f59e0b; width: 8px; height: 8px; border-radius: 50%;"></div>
        <h1 style="margin: 0; font-size: 18px; font-weight: 700; color: #f59e0b;">⚠️ Escalation Required</h1>
      </div>
      
      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Source</div>
        <div style="font-weight: 600; color: #e2e8f0;">${source}</div>
      </div>

      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Task</div>
        <div style="color: #cbd5e1; font-size: 14px;">${payload.taskInput.slice(0, 300)}${payload.taskInput.length > 300 ? "..." : ""}</div>
      </div>

      <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px; margin-bottom: 16px;">
        <div style="background: #1e293b; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Confidence</div>
          <div style="font-size: 24px; font-weight: 700; color: ${confidencePct >= 80 ? "#4ade80" : confidencePct >= 60 ? "#facc15" : "#f87171"};">${confidencePct}%</div>
        </div>
        <div style="background: #1e293b; border-radius: 8px; padding: 12px; text-align: center;">
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 4px;">Risk Level</div>
          <div style="font-size: 18px; font-weight: 700; color: ${payload.riskLevel === "critical" ? "#f87171" : payload.riskLevel === "high" ? "#fb923c" : "#facc15"}; text-transform: capitalize;">${payload.riskLevel}</div>
        </div>
      </div>

      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Escalation Reason</div>
        <div style="color: #fbbf24; font-size: 14px;">${payload.escalationReason}</div>
      </div>

      ${payload.output ? `
      <div style="background: #1e293b; border-radius: 8px; padding: 16px; margin-bottom: 16px;">
        <div style="font-size: 12px; color: #94a3b8; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Agent Output (Preview)</div>
        <div style="color: #94a3b8; font-size: 13px; font-family: monospace; white-space: pre-wrap;">${payload.output.slice(0, 500)}${payload.output.length > 500 ? "\n..." : ""}</div>
      </div>
      ` : ""}

      <div style="text-align: center; margin-top: 24px;">
        <a href="${process.env.FRONTEND_URL || "https://workforceautomated.com"}/executions/${payload.executionId}" 
           style="background: #3b82f6; color: white; padding: 10px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 14px;">
          Review Execution
        </a>
      </div>

      <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #1e293b; font-size: 12px; color: #475569; text-align: center;">
        WorkforceAutomated · AI Workforce Operating System
      </div>
    </div>
  `;

  try {
    await transporter.sendMail({
      from: `"WorkforceAutomated" <${fromEmail}>`,
      to,
      subject: `⚠️ Escalation Required — ${source} (${payload.riskLevel} risk, ${confidencePct}% confidence)`,
      html,
    });
    return true;
  } catch (err: any) {
    console.error("[Notifications] Email send failed:", err.message);
    return false;
  }
}

// ─── Slack webhook ────────────────────────────────────────────────────────────

async function sendSlackNotification(
  webhookUrl: string,
  payload: EscalationNotificationPayload
): Promise<boolean> {
  const source = payload.teamName
    ? `Team: *${payload.teamName}*`
    : `Agent: *${payload.agentName || "Unknown"}*`;
  const confidencePct = Math.round(payload.confidenceScore * 100);
  const riskEmoji = payload.riskLevel === "critical" ? "🔴" : payload.riskLevel === "high" ? "🟠" : "🟡";

  const body = {
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "⚠️ WorkforceAutomated — Escalation Required", emoji: true },
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Source:*\n${source}` },
          { type: "mrkdwn", text: `*Risk Level:*\n${riskEmoji} ${payload.riskLevel.charAt(0).toUpperCase() + payload.riskLevel.slice(1)}` },
          { type: "mrkdwn", text: `*Confidence:*\n${confidencePct}%` },
          { type: "mrkdwn", text: `*Execution ID:*\n#${payload.executionId}` },
        ],
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Task:*\n${payload.taskInput.slice(0, 200)}${payload.taskInput.length > 200 ? "..." : ""}`,
        },
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Escalation Reason:*\n${payload.escalationReason}`,
        },
      },
      {
        type: "actions",
        elements: [
          {
            type: "button",
            text: { type: "plain_text", text: "Review Execution", emoji: true },
            url: `${process.env.FRONTEND_URL || "https://workforceautomated.com"}/executions/${payload.executionId}`,
            style: "primary",
          },
        ],
      },
    ],
  };

  try {
    const res = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    return res.ok;
  } catch (err: any) {
    console.error("[Notifications] Slack send failed:", err.message);
    return false;
  }
}

// ─── Main entry point ─────────────────────────────────────────────────────────

export async function sendEscalationNotification(
  payload: EscalationNotificationPayload
): Promise<{ email: boolean; slack: boolean }> {
  const results = { email: false, slack: false };

  try {
    const [settings] = await db
      .select()
      .from(notificationSettings)
      .where(eq(notificationSettings.userId, payload.userId))
      .limit(1);

    if (!settings) return results;

    const ns = settings as any;

    // Email notification
    if (ns.escalationEmailEnabled && ns.escalationEmail) {
      results.email = await sendEmailNotification(ns.escalationEmail, payload);
    }

    // Slack notification
    if (ns.slackWebhookEnabled && ns.slackWebhookUrl) {
      results.slack = await sendSlackNotification(ns.slackWebhookUrl, payload);
    }
  } catch (err: any) {
    console.error("[Notifications] Failed to send escalation notification:", err.message);
  }

  return results;
}
