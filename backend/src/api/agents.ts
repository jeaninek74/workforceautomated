import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { agents } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";
import { generateAgentFromJobDescription } from "../services/llm.js";

export const agentsRouter = Router();
agentsRouter.use(authenticate);

agentsRouter.get("/", async (req: AuthRequest, res) => {
  const list = await db.select().from(agents).where(eq(agents.userId, req.user!.id)).orderBy(desc(agents.createdAt));
  res.json({ agents: list });
});

agentsRouter.post("/", async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      role: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
      permissions: z.array(z.string()).optional(),
      connectorType: z.enum(["overlay", "readonly", "write_back"]).optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
      escalationThreshold: z.number().min(0).max(1).optional(),
      riskLevel: z.enum(["low", "medium", "high", "critical"]).optional(),
      escalationEnabled: z.boolean().optional(),
      systemPrompt: z.string().optional(),
    }).parse(req.body);
    const [agent] = await db.insert(agents).values({ ...body, userId: req.user!.id }).returning();
    await logAudit({ userId: req.user!.id, agentId: agent.id, action: "agent.create", entityType: "agent", entityId: String(agent.id), req });
    res.status(201).json({ agent });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

async function handleGenerateFromJD(req: AuthRequest, res: any) {
  try {
    const { jobDescription } = z.object({ jobDescription: z.string().min(10) }).parse(req.body);
    const agentConfig = await generateAgentFromJobDescription(jobDescription);
    const [agent] = await db.insert(agents).values({ ...agentConfig, userId: req.user!.id }).returning();
    await logAudit({ userId: req.user!.id, agentId: agent.id, action: "agent.create_from_jd", entityType: "agent", entityId: String(agent.id), req });
    res.status(201).json({ agent });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

// Both route names supported (frontend uses /generate-from-jd)
agentsRouter.post("/from-job-description", handleGenerateFromJD);
agentsRouter.post("/generate-from-jd", handleGenerateFromJD);

agentsRouter.get("/:id", async (req: AuthRequest, res) => {
  const [agent] = await db.select().from(agents).where(and(eq(agents.id, parseInt(req.params.id)), eq(agents.userId, req.user!.id))).limit(1);
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  res.json({ agent });
});

agentsRouter.put("/:id", async (req: AuthRequest, res) => {
  try {
    const [agent] = await db.update(agents).set({ ...req.body, updatedAt: new Date() })
      .where(and(eq(agents.id, parseInt(req.params.id)), eq(agents.userId, req.user!.id))).returning();
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    await logAudit({ userId: req.user!.id, agentId: agent.id, action: "agent.update", entityType: "agent", entityId: String(agent.id), req });
    res.json({ agent });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

agentsRouter.delete("/:id", async (req: AuthRequest, res) => {
  const [agent] = await db.delete(agents).where(and(eq(agents.id, parseInt(req.params.id)), eq(agents.userId, req.user!.id))).returning();
  if (!agent) return res.status(404).json({ error: "Agent not found" });
  await logAudit({ userId: req.user!.id, agentId: agent.id, action: "agent.delete", entityType: "agent", entityId: String(agent.id), req });
  res.json({ success: true });
});
