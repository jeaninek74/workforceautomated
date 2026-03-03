import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { executions, agents, teams } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";
import { runAgentExecution } from "../services/executor.js";

export const executionsRouter = Router();
executionsRouter.use(authenticate);

executionsRouter.get("/", async (req: AuthRequest, res) => {
  const list = await db.select().from(executions).where(eq(executions.userId, req.user!.id)).orderBy(desc(executions.createdAt)).limit(50);
  res.json({ executions: list });
});

executionsRouter.post("/", async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      agentId: z.number().optional(),
      teamId: z.number().optional(),
      input: z.string().min(1),
      type: z.enum(["single", "team"]).default("single"),
    }).parse(req.body);
    // Create execution record
    const [exec] = await db.insert(executions).values({
      userId: req.user!.id,
      agentId: body.agentId,
      teamId: body.teamId,
      type: body.type,
      input: body.input,
      status: "pending",
      startedAt: new Date(),
    }).returning();
    // Run asynchronously
    runAgentExecution(exec.id, req.user!.id, body).catch(console.error);
    res.status(202).json({ execution: exec });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

executionsRouter.get("/:id", async (req: AuthRequest, res) => {
  const [exec] = await db.select().from(executions).where(and(eq(executions.id, parseInt(req.params.id)), eq(executions.userId, req.user!.id))).limit(1);
  if (!exec) return res.status(404).json({ error: "Execution not found" });
  res.json({ execution: exec });
});

executionsRouter.post("/:id/cancel", async (req: AuthRequest, res) => {
  const [exec] = await db.update(executions).set({ status: "cancelled", completedAt: new Date() })
    .where(and(eq(executions.id, parseInt(req.params.id)), eq(executions.userId, req.user!.id))).returning();
  if (!exec) return res.status(404).json({ error: "Execution not found" });
  res.json({ execution: exec });
});
