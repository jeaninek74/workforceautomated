import cron from "node-cron";
import PDFDocument from "pdfkit";
import nodemailer from "nodemailer";
import { db } from "../db/index.js";
import { notificationSettings, executions, agents, teams } from "../db/schema.js";
import { eq, desc, gte } from "drizzle-orm";

interface ScheduleConfig {
  emails: string[];
  frequency: "daily" | "weekly" | "monthly";
  includeEscalations: boolean;
  includeAuditLog: boolean;
  enabled: boolean;
}

async function generateReportBuffer(userId: number, startDate: Date): Promise<Buffer> {
  const allExecs = await db
    .select()
    .from(executions)
    .where(eq(executions.userId, userId))
    .orderBy(desc(executions.createdAt))
    .limit(500);

  const filtered = allExecs.filter((e) => new Date(e.createdAt) >= startDate);
  const total = filtered.length;
  const successful = filtered.filter((e) => e.status === "success").length;
  const escalated = filtered.filter((e) => e.escalated).length;
  const failed = filtered.filter((e) => e.status === "failed").length;
  const avgConf =
    total > 0
      ? filtered
          .filter((e) => e.confidenceScore)
          .reduce((s, e) => s + (e.confidenceScore || 0), 0) / total
      : 0;
  const automationRate = total > 0 ? (total - escalated) / total : 0;
  const escalationRate = total > 0 ? escalated / total : 0;
  const riskBreakdown = { low: 0, medium: 0, high: 0, critical: 0 };
  for (const e of filtered) {
    if (e.riskLevel) riskBreakdown[e.riskLevel as keyof typeof riskBreakdown]++;
  }

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: "A4" });
    const chunks: Buffer[] = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);

    doc.fontSize(22).fillColor("#7c3aed").text("WorkforceAutomated", 50, 50);
    doc.fontSize(14).fillColor("#374151").text("Scheduled Execution Report", 50, 78);
    doc
      .fontSize(10)
      .fillColor("#6b7280")
      .text(
        `Generated: ${new Date().toLocaleString()}   |   Period: ${startDate.toLocaleDateString()} → Now`,
        50,
        98
      );
    doc.moveTo(50, 118).lineTo(545, 118).strokeColor("#e5e7eb").stroke();

    doc.fontSize(13).fillColor("#111827").text("Summary", 50, 130);
    const stats = [
      ["Total Executions", String(total)],
      ["Successful", String(successful)],
      ["Escalated", String(escalated)],
      ["Failed", String(failed)],
      ["Automation Rate", `${(automationRate * 100).toFixed(1)}%`],
      ["Escalation Rate", `${(escalationRate * 100).toFixed(1)}%`],
      ["Avg Confidence", `${(avgConf * 100).toFixed(0)}%`],
    ];
    let y = 150;
    for (let i = 0; i < stats.length; i++) {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? 50 : 300;
      const rowY = y + row * 22;
      doc.fontSize(10).fillColor("#6b7280").text(stats[i][0], x, rowY);
      doc.fontSize(10).fillColor("#111827").text(stats[i][1], x + 130, rowY);
    }

    const riskY = y + Math.ceil(stats.length / 2) * 22 + 20;
    doc.moveTo(50, riskY - 5).lineTo(545, riskY - 5).strokeColor("#e5e7eb").stroke();
    doc.fontSize(13).fillColor("#111827").text("Risk Level Breakdown", 50, riskY);
    const riskColors: Record<string, string> = {
      low: "#16a34a",
      medium: "#ca8a04",
      high: "#ea580c",
      critical: "#dc2626",
    };
    let riskX = 50;
    for (const [level, count] of Object.entries(riskBreakdown)) {
      const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
      doc
        .fontSize(10)
        .fillColor(riskColors[level] || "#374151")
        .text(`${level.toUpperCase()}: ${count} (${pct}%)`, riskX, riskY + 20);
      riskX += 120;
    }

    const recent = filtered.slice(0, 20);
    const tableY = riskY + 55;
    doc.moveTo(50, tableY - 5).lineTo(545, tableY - 5).strokeColor("#e5e7eb").stroke();
    doc.fontSize(13).fillColor("#111827").text("Recent Executions (last 20)", 50, tableY);
    const colWidths = [40, 90, 90, 60, 60, 60, 90];
    const colHeaders = ["ID", "Date", "Agent/Team", "Status", "Confidence", "Risk", "Escalated"];
    let tableRowY = tableY + 20;
    doc.fontSize(9).fillColor("#6b7280");
    let cx = 50;
    for (let i = 0; i < colHeaders.length; i++) {
      doc.text(colHeaders[i], cx, tableRowY, { width: colWidths[i] });
      cx += colWidths[i];
    }
    tableRowY += 16;
    doc.moveTo(50, tableRowY - 2).lineTo(545, tableRowY - 2).strokeColor("#e5e7eb").stroke();
    for (const r of recent) {
      if (tableRowY > 750) {
        doc.addPage();
        tableRowY = 50;
      }
      doc.fontSize(8).fillColor("#374151");
      cx = 50;
      const rowData = [
        String(r.id),
        r.createdAt ? new Date(r.createdAt).toLocaleDateString() : "",
        "",
        r.status || "",
        r.confidenceScore ? `${(r.confidenceScore * 100).toFixed(0)}%` : "—",
        r.riskLevel || "—",
        r.escalated ? "Yes" : "No",
      ];
      for (let i = 0; i < rowData.length; i++) {
        doc.text(rowData[i], cx, tableRowY, { width: colWidths[i], ellipsis: true });
        cx += colWidths[i];
      }
      tableRowY += 14;
    }

    doc
      .fontSize(8)
      .fillColor("#9ca3af")
      .text(
        `WorkforceAutomated — Confidential — ${new Date().toLocaleDateString()}`,
        50,
        800,
        { align: "center", width: 495 }
      );
    doc.end();
  });
}

async function sendScheduledReports() {
  try {
    const allSettings = await db.select().from(notificationSettings);
    for (const settings of allSettings) {
      const config: ScheduleConfig | null = (settings as any).reportScheduleConfig
        ? JSON.parse((settings as any).reportScheduleConfig)
        : null;

      if (!config || !config.enabled || !config.emails?.length) continue;

      // Check if it's time to send based on frequency
      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sunday
      const dayOfMonth = now.getDate();
      const hour = now.getHours();

      // Only run at 8am
      if (hour !== 8) continue;

      let shouldSend = false;
      let startDate = new Date();

      if (config.frequency === "daily") {
        shouldSend = true;
        startDate.setDate(startDate.getDate() - 1);
      } else if (config.frequency === "weekly" && dayOfWeek === 1) {
        // Monday
        shouldSend = true;
        startDate.setDate(startDate.getDate() - 7);
      } else if (config.frequency === "monthly" && dayOfMonth === 1) {
        shouldSend = true;
        startDate.setMonth(startDate.getMonth() - 1);
      }

      if (!shouldSend) continue;

      // Check SMTP config
      const smtpHost = (settings as any).smtpHost;
      const smtpUser = (settings as any).smtpUser;
      const smtpPass = (settings as any).smtpPass;
      const smtpPort = parseInt((settings as any).smtpPort || "587");
      const smtpFrom = (settings as any).smtpFrom || smtpUser;
      const smtpSecure = (settings as any).smtpSecure || false;

      if (!smtpHost || !smtpUser || !smtpPass) {
        console.log(`[ReportScheduler] User ${settings.userId} has no SMTP configured, skipping`);
        continue;
      }

      try {
        const pdfBuffer = await generateReportBuffer(settings.userId, startDate);

        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpSecure,
          auth: { user: smtpUser, pass: smtpPass },
        });

        const periodLabel =
          config.frequency === "daily"
            ? "Daily"
            : config.frequency === "weekly"
            ? "Weekly"
            : "Monthly";

        await transporter.sendMail({
          from: smtpFrom,
          to: config.emails.join(", "),
          subject: `WorkforceAutomated — ${periodLabel} Execution Report`,
          text: `Please find attached your ${periodLabel.toLowerCase()} WorkforceAutomated execution report.\n\nThis report covers the period from ${startDate.toLocaleDateString()} to ${now.toLocaleDateString()}.\n\n— WorkforceAutomated`,
          attachments: [
            {
              filename: `workforce-report-${now.toISOString().slice(0, 10)}.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ],
        });

        console.log(
          `[ReportScheduler] Sent ${periodLabel} report to ${config.emails.join(", ")} for user ${settings.userId}`
        );
      } catch (err: any) {
        console.error(`[ReportScheduler] Failed to send report for user ${settings.userId}:`, err.message);
      }
    }
  } catch (err: any) {
    console.error("[ReportScheduler] Error in scheduled report run:", err.message);
  }
}

export function startReportScheduler() {
  // Run every hour at minute 0 — the function itself checks the hour (8am) and frequency
  cron.schedule("0 * * * *", () => {
    console.log("[ReportScheduler] Hourly check running...");
    sendScheduledReports();
  });
  console.log("[ReportScheduler] Scheduled report delivery initialized");
}
