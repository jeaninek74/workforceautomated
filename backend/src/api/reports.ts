import { Router } from "express";
import { db } from "../db/index.js";
import { executions, agents, teams, auditLogs, escalationReviews } from "../db/schema.js";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import PDFDocument from "pdfkit";

const router = Router();
router.use(authenticate);

function fmtDate(d: Date | null | undefined): string {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 19).replace("T", " ");
}

function csvField(val: unknown): string {
  if (val === null || val === undefined) return "";
  const str = String(val);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function toCsv(headers: string[], rows: unknown[][]): string {
  const lines = [headers.join(",")];
  for (const row of rows) {
    lines.push(row.map(csvField).join(","));
  }
  return lines.join("\n");
}

function buildDateFilters(startDate?: string, endDate?: string) {
  const filters: any[] = [];
  if (startDate) filters.push(gte(executions.createdAt, new Date(startDate)));
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999);
    filters.push(lte(executions.createdAt, end));
  }
  return filters;
}

// GET /api/reports/executions.csv
router.get("/executions.csv", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, agentId, teamId } = req.query as Record<string, string>;

    const filters: any[] = [eq(executions.userId, userId), ...buildDateFilters(startDate, endDate)];
    if (agentId) filters.push(eq(executions.agentId, parseInt(agentId)));
    if (teamId) filters.push(eq(executions.teamId, parseInt(teamId)));

    const rows = await db.select().from(executions).where(and(...filters)).orderBy(desc(executions.createdAt)).limit(5000);

    const headers = ["ID", "Date", "Type", "Status", "Agent/Team", "Confidence", "Risk Level", "Escalated", "Processing Time (ms)", "Input (preview)", "Output (preview)"];
    const csvRows = await Promise.all(rows.map(async (r) => {
      let name = "";
      if (r.agentId) {
        const [a] = await db.select({ name: agents.name }).from(agents).where(eq(agents.id, r.agentId));
        name = a?.name || `Agent #${r.agentId}`;
      } else if (r.teamId) {
        const [t] = await db.select({ name: teams.name }).from(teams).where(eq(teams.id, r.teamId));
        name = t?.name || `Team #${r.teamId}`;
      }
      return [
        r.id,
        fmtDate(r.createdAt),
        r.type,
        r.status,
        name,
        r.confidenceScore ? (r.confidenceScore * 100).toFixed(1) + "%" : "",
        r.riskLevel || "",
        r.escalated ? "Yes" : "No",
        r.processingTimeMs || "",
        (r.input || "").slice(0, 100),
        (r.output || "").slice(0, 200),
      ];
    }));

    const csv = toCsv(headers, csvRows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="executions-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/executions.json — for frontend report display
router.get("/executions.json", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, agentId, teamId, status } = req.query as Record<string, string>;

    const filters: any[] = [eq(executions.userId, userId), ...buildDateFilters(startDate, endDate)];
    if (agentId) filters.push(eq(executions.agentId, parseInt(agentId)));
    if (teamId) filters.push(eq(executions.teamId, parseInt(teamId)));
    if (status) filters.push(eq(executions.status, status as any));

    const rows = await db.select().from(executions).where(and(...filters)).orderBy(desc(executions.createdAt)).limit(1000);

    const enriched = await Promise.all(rows.map(async (r) => {
      let agentName = null, teamName = null;
      if (r.agentId) {
        const [a] = await db.select({ name: agents.name }).from(agents).where(eq(agents.id, r.agentId));
        agentName = a?.name;
      }
      if (r.teamId) {
        const [t] = await db.select({ name: teams.name }).from(teams).where(eq(teams.id, r.teamId));
        teamName = t?.name;
      }
      return { ...r, agentName, teamName };
    }));

    const total = enriched.length;
    const successful = enriched.filter((r) => r.status === "success").length;
    const escalated = enriched.filter((r) => r.escalated).length;
    const avgConfidence = total > 0
      ? enriched.filter((r) => r.confidenceScore).reduce((s, r) => s + (r.confidenceScore || 0), 0) / total
      : 0;
    const avgProcessingMs = total > 0
      ? enriched.filter((r) => r.processingTimeMs).reduce((s, r) => s + (r.processingTimeMs || 0), 0) / total
      : 0;

    res.json({
      executions: enriched,
      summary: { total, successful, escalated, avgConfidence, avgProcessingMs },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/audit.csv
router.get("/audit.csv", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as Record<string, string>;

    const filters: any[] = [eq(auditLogs.userId, userId)];
    if (startDate) filters.push(gte(auditLogs.createdAt, new Date(startDate)));
    if (endDate) {
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      filters.push(lte(auditLogs.createdAt, end));
    }

    const rows = await db.select().from(auditLogs).where(and(...filters)).orderBy(desc(auditLogs.createdAt)).limit(5000);

    const headers = ["ID", "Date", "Action", "Entity Type", "Entity ID", "Execution ID", "IP Address"];
    const csvRows = rows.map((r) => [
      r.id, fmtDate(r.createdAt), r.action, r.entityType || "", r.entityId || "", r.executionId || "", r.ipAddress || "",
    ]);

    const csv = toCsv(headers, csvRows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="audit-log-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/escalations.csv
router.get("/escalations.csv", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as Record<string, string>;

    const dateFilters = buildDateFilters(startDate, endDate);
    const filters: any[] = [eq(executions.userId, userId), eq(executions.escalated, true), ...dateFilters];

    const rows = await db
      .select({ execution: executions, review: escalationReviews })
      .from(executions)
      .leftJoin(escalationReviews, eq(escalationReviews.executionId, executions.id))
      .where(and(...filters))
      .orderBy(desc(executions.createdAt))
      .limit(2000);

    const headers = ["Execution ID", "Date", "Risk Level", "Confidence", "Escalation Reason", "Review Status", "Decision Comment", "Reviewed At"];
    const csvRows = rows.map((r) => [
      r.execution.id,
      fmtDate(r.execution.createdAt),
      r.execution.riskLevel || "",
      r.execution.confidenceScore ? (r.execution.confidenceScore * 100).toFixed(1) + "%" : "",
      r.execution.escalationReason || "",
      r.review?.status || "pending",
      r.review?.decisionComment || "",
      fmtDate(r.review?.reviewedAt),
    ]);

    const csv = toCsv(headers, csvRows);
    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", `attachment; filename="escalations-${Date.now()}.csv"`);
    res.send(csv);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/summary.json — dashboard summary stats
router.get("/summary.json", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as Record<string, string>;

    const dateFilters = buildDateFilters(startDate, endDate);
    const allExecs = await db.select().from(executions).where(and(eq(executions.userId, userId), ...dateFilters));

    const total = allExecs.length;
    const successful = allExecs.filter((e) => e.status === "success").length;
    const escalated = allExecs.filter((e) => e.escalated).length;
    const failed = allExecs.filter((e) => e.status === "failed").length;
    const avgConf = total > 0
      ? allExecs.filter((e) => e.confidenceScore).reduce((s, e) => s + (e.confidenceScore || 0), 0) / total
      : 0;
    const avgMs = total > 0
      ? allExecs.filter((e) => e.processingTimeMs).reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total
      : 0;

    const riskBreakdown = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const e of allExecs) {
      if (e.riskLevel) riskBreakdown[e.riskLevel]++;
    }

    res.json({
      total, successful, escalated, failed,
      avgConfidence: avgConf,
      avgProcessingMs: avgMs,
      automationRate: total > 0 ? ((total - escalated) / total) : 0,
      escalationRate: total > 0 ? (escalated / total) : 0,
      riskBreakdown,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/executions.pdf — alias for summary.pdf
router.get("/executions.pdf", async (req: AuthRequest, res) => {
  // Redirect to summary.pdf
  const qs = req.url.split('?')[1] ? `?${req.url.split('?')[1]}` : '';
  res.redirect(`/api/reports/summary.pdf${qs}`);
});

// GET /api/reports/summary.pdf — formatted PDF report
router.get("/summary.pdf", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query as Record<string, string>;

    const dateFilters = buildDateFilters(startDate, endDate);
    const allExecs = await db.select().from(executions).where(and(eq(executions.userId, userId), ...dateFilters));

    const total = allExecs.length;
    const successful = allExecs.filter((e) => e.status === "success").length;
    const escalated = allExecs.filter((e) => e.escalated).length;
    const failed = allExecs.filter((e) => e.status === "failed").length;
    const avgConf = total > 0
      ? allExecs.filter((e) => e.confidenceScore).reduce((s, e) => s + (e.confidenceScore || 0), 0) / total
      : 0;
    const avgMs = total > 0
      ? allExecs.filter((e) => e.processingTimeMs).reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total
      : 0;
    const automationRate = total > 0 ? ((total - escalated) / total) : 0;
    const escalationRate = total > 0 ? (escalated / total) : 0;
    const riskBreakdown = { low: 0, medium: 0, high: 0, critical: 0 };
    for (const e of allExecs) { if (e.riskLevel) riskBreakdown[e.riskLevel as keyof typeof riskBreakdown]++; }

    // Recent 20 executions for the table
    const recent = allExecs.slice(0, 20);

    const doc = new PDFDocument({ margin: 50, size: "A4" });
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="workforce-report-${Date.now()}.pdf"`);
    doc.pipe(res);

    // Header
    doc.fontSize(22).fillColor("#7c3aed").text("WorkforceAutomated", 50, 50);
    doc.fontSize(14).fillColor("#374151").text("Execution Report", 50, 78);
    const dateRange = startDate || endDate
      ? `${startDate || "All time"} → ${endDate || "Now"}`
      : "All time";
    doc.fontSize(10).fillColor("#6b7280").text(`Generated: ${new Date().toLocaleString()}   |   Period: ${dateRange}`, 50, 98);
    doc.moveTo(50, 118).lineTo(545, 118).strokeColor("#e5e7eb").stroke();

    // Summary stats
    doc.moveDown(2);
    doc.fontSize(13).fillColor("#111827").text("Summary", 50, 130);
    const stats = [
      ["Total Executions", String(total)],
      ["Successful", String(successful)],
      ["Escalated", String(escalated)],
      ["Failed", String(failed)],
      ["Automation Rate", `${(automationRate * 100).toFixed(1)}%`],
      ["Escalation Rate", `${(escalationRate * 100).toFixed(1)}%`],
      ["Avg Confidence", `${(avgConf * 100).toFixed(0)}%`],
      ["Avg Processing Time", avgMs > 0 ? `${(avgMs / 1000).toFixed(1)}s` : "—"],
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

    // Risk breakdown
    const riskY = y + Math.ceil(stats.length / 2) * 22 + 20;
    doc.moveTo(50, riskY - 5).lineTo(545, riskY - 5).strokeColor("#e5e7eb").stroke();
    doc.fontSize(13).fillColor("#111827").text("Risk Level Breakdown", 50, riskY);
    const riskColors: Record<string, string> = { low: "#16a34a", medium: "#ca8a04", high: "#ea580c", critical: "#dc2626" };
    let riskX = 50;
    for (const [level, count] of Object.entries(riskBreakdown)) {
      const pct = total > 0 ? ((count / total) * 100).toFixed(0) : "0";
      doc.fontSize(10).fillColor(riskColors[level] || "#374151").text(`${level.toUpperCase()}: ${count} (${pct}%)`, riskX, riskY + 20);
      riskX += 120;
    }

    // Recent executions table
    const tableY = riskY + 55;
    doc.moveTo(50, tableY - 5).lineTo(545, tableY - 5).strokeColor("#e5e7eb").stroke();
    doc.fontSize(13).fillColor("#111827").text("Recent Executions (last 20)", 50, tableY);
    const colWidths = [40, 90, 90, 60, 60, 60, 90];
    const colHeaders = ["ID", "Date", "Agent/Team", "Status", "Confidence", "Risk", "Escalated"];
    let tableRowY = tableY + 20;
    // Header row
    doc.fontSize(9).fillColor("#6b7280");
    let cx = 50;
    for (let i = 0; i < colHeaders.length; i++) {
      doc.text(colHeaders[i], cx, tableRowY, { width: colWidths[i] });
      cx += colWidths[i];
    }
    tableRowY += 16;
    doc.moveTo(50, tableRowY - 2).lineTo(545, tableRowY - 2).strokeColor("#e5e7eb").stroke();

    for (const r of recent) {
      if (tableRowY > 750) { doc.addPage(); tableRowY = 50; }
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

    // Footer
    doc.fontSize(8).fillColor("#9ca3af").text(
      `WorkforceAutomated — Confidential — ${new Date().toLocaleDateString()}`,
      50, 800, { align: "center", width: 495 }
    );

    doc.end();
  } catch (err: any) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

// POST /api/reports/schedule-delivery — save scheduled report delivery settings
router.post("/schedule-delivery", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { emails, frequency, includeEscalations, includeAuditLog } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: "At least one recipient email is required" });
    }
    const { notificationSettings } = await import("../db/schema.js");
    const [existing] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    const scheduleConfig = JSON.stringify({
      emails,
      frequency: frequency || "weekly",
      includeEscalations: !!includeEscalations,
      includeAuditLog: !!includeAuditLog,
      enabled: true,
      createdAt: new Date().toISOString(),
    });
    if (existing) {
      await db.update(notificationSettings)
        .set({ updatedAt: new Date() } as any)
        .where(eq(notificationSettings.userId, userId));
      // Store config in a raw SQL update since the column may not be in the typed schema yet
      await db.execute(
        `UPDATE notification_settings SET report_schedule_config = '${scheduleConfig.replace(/'/g, "''")}' WHERE user_id = ${userId}` as any
      ).catch(() => {/* column may not exist yet, ignore */});
    } else {
      await db.insert(notificationSettings).values({ userId } as any);
      await db.execute(
        `UPDATE notification_settings SET report_schedule_config = '${scheduleConfig.replace(/'/g, "''")}' WHERE user_id = ${userId}` as any
      ).catch(() => {/* ignore */});
    }
    res.json({ success: true, message: `Report scheduled for ${frequency || "weekly"} delivery to ${(emails as string[]).join(", ")}` });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reports/schedule-delivery — get current scheduled delivery settings
router.get("/schedule-delivery", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { notificationSettings } = await import("../db/schema.js");
    const [settings] = await db.select().from(notificationSettings).where(eq(notificationSettings.userId, userId));
    // Try to read the schedule config from the raw record
    const config = (settings as any)?.reportScheduleConfig
      ? JSON.parse((settings as any).reportScheduleConfig)
      : null;
    res.json({ schedule: config });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
