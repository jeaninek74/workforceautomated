import { Router } from "express";
import { db } from "../db/index.js";
import { executions, metricsSnapshots } from "../db/schema.js";
import { eq, desc, sql, and, gte } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const metricsRouter = Router();
metricsRouter.use(authenticate);

metricsRouter.get("/summary", async (req: AuthRequest, res) => {
  const userId = req.user!.id;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const execs = await db.select().from(executions)
    .where(and(eq(executions.userId, userId), gte(executions.createdAt, thirtyDaysAgo)));
  const total = execs.length;
  const successful = execs.filter(e => e.status === "success").length;
  const failed = execs.filter(e => e.status === "failed").length;
  const escalated = execs.filter(e => e.escalated).length;
  const avgConfidence = total > 0 ? execs.reduce((s, e) => s + (e.confidenceScore || 0), 0) / total : 0;
  const avgProcessingMs = total > 0 ? execs.reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total : 0;
  const automationRate = total > 0 ? (successful / total) * 100 : 0;
  const escalationRate = total > 0 ? (escalated / total) * 100 : 0;
  const hoursSaved = (successful * avgProcessingMs) / (1000 * 60 * 60) * 10; // estimate
  const costSavings = hoursSaved * 75; // $75/hr estimate
  res.json({
    total, successful, failed, escalated,
    avgConfidence: Math.round(avgConfidence * 100) / 100,
    avgProcessingMs: Math.round(avgProcessingMs),
    automationRate: Math.round(automationRate * 10) / 10,
    escalationRate: Math.round(escalationRate * 10) / 10,
    hoursSaved: Math.round(hoursSaved * 10) / 10,
    costSavings: Math.round(costSavings),
  });
});

metricsRouter.get("/trends", async (req: AuthRequest, res) => {
  const execs = await db.select().from(executions)
    .where(eq(executions.userId, req.user!.id))
    .orderBy(desc(executions.createdAt)).limit(200);
  // Group by day
  const byDay: Record<string, { date: string; total: number; success: number; escalated: number; avgConf: number }> = {};
  for (const e of execs) {
    const day = e.createdAt.toISOString().slice(0, 10);
    if (!byDay[day]) byDay[day] = { date: day, total: 0, success: 0, escalated: 0, avgConf: 0 };
    byDay[day].total++;
    if (e.status === "success") byDay[day].success++;
    if (e.escalated) byDay[day].escalated++;
    byDay[day].avgConf += e.confidenceScore || 0;
  }
  const trends = Object.values(byDay).map(d => ({ ...d, avgConf: d.total > 0 ? d.avgConf / d.total : 0 })).slice(0, 30);
  res.json({ trends });
});
