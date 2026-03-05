import { Router } from "express";
import { db } from "../db/index.js";
import { executions, agents, teams, auditLogs, escalationReviews } from "../db/schema.js";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

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

export default router;
