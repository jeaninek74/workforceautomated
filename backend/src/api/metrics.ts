import { Router } from "express";
import { db } from "../db/index.js";
import { executions, agents } from "../db/schema.js";
import { eq, desc, and, gte } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const metricsRouter = Router();
metricsRouter.use(authenticate);

// Shared helper: fetch recent executions for a user
async function getUserExecs(userId: number, days = 30) {
  const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
  return db.select().from(executions)
    .where(and(eq(executions.userId, userId), gte(executions.createdAt, since)));
}

// /api/metrics/dashboard — used by the Dashboard page
metricsRouter.get("/dashboard", async (req: AuthRequest, res) => {
  try {
    const execs = await getUserExecs(req.user!.id, 30);
    const total = execs.length;
    const successful = execs.filter(e => e.status === "success" || e.status === "completed").length;
    const failed = execs.filter(e => e.status === "failed").length;
    const escalated = execs.filter(e => e.escalated).length;
    const avgConfRaw = total > 0 ? execs.reduce((s, e) => s + (e.confidenceScore || 0), 0) / total : 0;
    const avgConfidence = Math.round(avgConfRaw <= 1 ? avgConfRaw * 100 : avgConfRaw);
    res.json({
      total, successful, failed,
      escalations: escalated,
      avgConfidence,
      automationRate: total > 0 ? Math.round((successful / total) * 100) : 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/summary — alias
metricsRouter.get("/summary", async (req: AuthRequest, res) => {
  try {
    const execs = await getUserExecs(req.user!.id, 30);
    const total = execs.length;
    const successful = execs.filter(e => e.status === "success" || e.status === "completed").length;
    const failed = execs.filter(e => e.status === "failed").length;
    const escalated = execs.filter(e => e.escalated).length;
    const avgConfidence = total > 0 ? execs.reduce((s, e) => s + (e.confidenceScore || 0), 0) / total : 0;
    const avgProcessingMs = total > 0 ? execs.reduce((s, e) => s + (e.processingTimeMs || 0), 0) / total : 0;
    const automationRate = total > 0 ? (successful / total) * 100 : 0;
    const escalationRate = total > 0 ? (escalated / total) * 100 : 0;
    const hoursSaved = (successful * avgProcessingMs) / (1000 * 60 * 60) * 10;
    const costSavings = hoursSaved * 75;
    res.json({
      total, successful, failed, escalated,
      avgConfidence: Math.round(avgConfidence * 100) / 100,
      avgProcessingMs: Math.round(avgProcessingMs),
      automationRate: Math.round(automationRate * 10) / 10,
      escalationRate: Math.round(escalationRate * 10) / 10,
      hoursSaved: Math.round(hoursSaved * 10) / 10,
      costSavings: Math.round(costSavings),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/trends — daily execution trend data
metricsRouter.get("/trends", async (req: AuthRequest, res) => {
  try {
    const execs = await db.select().from(executions)
      .where(eq(executions.userId, req.user!.id))
      .orderBy(desc(executions.createdAt)).limit(200);
    const byDay: Record<string, { date: string; total: number; success: number; escalated: number; avgConf: number }> = {};
    for (const e of execs) {
      const day = e.createdAt.toISOString().slice(0, 10);
      if (!byDay[day]) byDay[day] = { date: day, total: 0, success: 0, escalated: 0, avgConf: 0 };
      byDay[day].total++;
      if (e.status === "success" || e.status === "completed") byDay[day].success++;
      if (e.escalated) byDay[day].escalated++;
      byDay[day].avgConf += e.confidenceScore || 0;
    }
    const trends = Object.values(byDay)
      .map(d => ({ ...d, avgConf: d.total > 0 ? Math.round((d.avgConf / d.total) * 100) : 0 }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30);
    res.json({ trends });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/confidence — confidence score distribution
metricsRouter.get("/confidence", async (req: AuthRequest, res) => {
  try {
    const period = Number(req.query.period) || 30;
    const execs = await getUserExecs(req.user!.id, period);
    const total = execs.length;
    const high = execs.filter(e => (e.confidenceScore || 0) >= 0.8).length;
    const medium = execs.filter(e => (e.confidenceScore || 0) >= 0.6 && (e.confidenceScore || 0) < 0.8).length;
    const low = execs.filter(e => (e.confidenceScore || 0) < 0.6).length;
    const avg = total > 0 ? execs.reduce((s, e) => s + (e.confidenceScore || 0), 0) / total : 0;
    res.json({
      total,
      high, medium, low,
      avgConfidence: Math.round(avg * 100),
      distribution: { high, medium, low },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/risk — risk level breakdown
metricsRouter.get("/risk", async (req: AuthRequest, res) => {
  try {
    const execs = await getUserExecs(req.user!.id, 30);
    const breakdown: Record<string, number> = { low: 0, medium: 0, high: 0, critical: 0, unknown: 0 };
    for (const e of execs) {
      const r = (e.riskLevel as string) || "unknown";
      breakdown[r] = (breakdown[r] || 0) + 1;
    }
    res.json({ total: execs.length, breakdown });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/escalations — escalation stats
metricsRouter.get("/escalations", async (req: AuthRequest, res) => {
  try {
    const execs = await getUserExecs(req.user!.id, 30);
    const escalated = execs.filter(e => e.escalated);
    const total = execs.length;
    const rate = total > 0 ? Math.round((escalated.length / total) * 100) : 0;
    // Group by reason
    const byReason: Record<string, number> = {};
    for (const e of escalated) {
      const reason = e.escalationReason || "Unknown";
      byReason[reason] = (byReason[reason] || 0) + 1;
    }
    res.json({
      total: escalated.length,
      rate,
      pending: escalated.length,
      byReason,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// /api/metrics/usage — token and processing usage
metricsRouter.get("/usage", async (req: AuthRequest, res) => {
  try {
    const period = Number(req.query.period) || 30;
    const execs = await getUserExecs(req.user!.id, period);
    const totalTokens = execs.reduce((s, e) => s + (e.tokenCount || 0), 0);
    const totalMs = execs.reduce((s, e) => s + (e.processingTimeMs || 0), 0);
    const avgMs = execs.length > 0 ? Math.round(totalMs / execs.length) : 0;
    res.json({
      totalExecutions: execs.length,
      totalTokens,
      avgProcessingMs: avgMs,
      estimatedCost: Math.round((totalTokens / 1000) * 0.002 * 100) / 100,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
