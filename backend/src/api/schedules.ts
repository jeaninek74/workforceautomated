import { Router } from "express";
import { db } from "../db/index.js";
import { schedules, agents, teams, executions } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { runAgentExecution } from "../services/executor.js";

const router = Router();
router.use(authenticate);

// Helper: parse cron to human-readable
function cronToHuman(expr: string): string {
  const presets: Record<string, string> = {
    "0 9 * * 1": "Every Monday at 9:00 AM",
    "0 9 * * 1-5": "Weekdays at 9:00 AM",
    "0 9 * * *": "Every day at 9:00 AM",
    "0 9 * * 0": "Every Sunday at 9:00 AM",
    "0 */6 * * *": "Every 6 hours",
    "0 * * * *": "Every hour",
    "0 9 1 * *": "1st of every month at 9:00 AM",
    "0 9 1,15 * *": "1st and 15th of every month at 9:00 AM",
  };
  return presets[expr] || expr;
}

function getNextRun(cronExpr: string): Date {
  const next = new Date();
  next.setHours(next.getHours() + 1);
  return next;
}

// GET /api/schedules
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const rows = await db.select().from(schedules)
      .where(eq(schedules.userId, userId))
      .orderBy(desc(schedules.createdAt));

    const enriched = await Promise.all(rows.map(async (s) => {
      let agentName = null;
      let teamName = null;
      if (s.agentId) {
        const [a] = await db.select({ name: agents.name }).from(agents).where(eq(agents.id, s.agentId));
        agentName = a?.name;
      }
      if (s.teamId) {
        const [t] = await db.select({ name: teams.name }).from(teams).where(eq(teams.id, s.teamId));
        teamName = t?.name;
      }
      return { ...s, agentName, teamName, cronHuman: cronToHuman(s.cronExpression) };
    }));

    res.json({ schedules: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schedules — create a new schedule
router.post("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const { name, description, agentId, teamId, cronExpression, inputText, outputFormat } = req.body;

    if (!name || !cronExpression) {
      return res.status(400).json({ error: "name and cronExpression are required" });
    }
    if (!agentId && !teamId) {
      return res.status(400).json({ error: "Either agentId or teamId is required" });
    }

    const nextRunAt = getNextRun(cronExpression);

    const [created] = await db.insert(schedules).values({
      userId,
      name,
      description: description || null,
      agentId: agentId ? parseInt(agentId) : null,
      teamId: teamId ? parseInt(teamId) : null,
      cronExpression,
      inputText: inputText || null,
      outputFormat: outputFormat || "bullet_points",
      enabled: true,
      nextRunAt,
    }).returning();

    res.json({ schedule: { ...created, cronHuman: cronToHuman(cronExpression) } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/schedules/:id — update a schedule
router.put("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    const { name, description, cronExpression, inputText, outputFormat, enabled } = req.body;

    const [existing] = await db.select().from(schedules).where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
    if (!existing) return res.status(404).json({ error: "Schedule not found" });

    const updates: Partial<typeof schedules.$inferInsert> = { updatedAt: new Date() };
    if (name !== undefined) updates.name = name;
    if (description !== undefined) updates.description = description;
    if (cronExpression !== undefined) { updates.cronExpression = cronExpression; updates.nextRunAt = getNextRun(cronExpression); }
    if (inputText !== undefined) updates.inputText = inputText;
    if (outputFormat !== undefined) updates.outputFormat = outputFormat;
    if (enabled !== undefined) updates.enabled = enabled;

    await db.update(schedules).set(updates).where(eq(schedules.id, id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/schedules/:id
router.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);
    await db.delete(schedules).where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/schedules/:id/run-now — trigger an immediate run
router.post("/:id/run-now", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const id = parseInt(req.params.id);

    const [schedule] = await db.select().from(schedules).where(and(eq(schedules.id, id), eq(schedules.userId, userId)));
    if (!schedule) return res.status(404).json({ error: "Schedule not found" });

    // Create an execution record first
    const [exec] = await db.insert(executions).values({
      userId,
      agentId: schedule.agentId || null,
      teamId: schedule.teamId || null,
      type: schedule.teamId ? "team" : "single",
      status: "pending",
      input: schedule.inputText || "Scheduled execution — no input provided",
    }).returning();

    // Run asynchronously
    runAgentExecution(exec.id, userId, {
      agentId: schedule.agentId || undefined,
      teamId: schedule.teamId || undefined,
      type: schedule.teamId ? "team" : "single",
      input: schedule.inputText || "Scheduled execution",
      outputFormat: schedule.outputFormat || "bullet_points",
    }).catch(console.error);

    // Update last run
    await db.update(schedules).set({
      lastRunAt: new Date(),
      totalRuns: (schedule.totalRuns || 0) + 1,
      updatedAt: new Date(),
    }).where(eq(schedules.id, id));

    res.json({ success: true, executionId: exec.id });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
