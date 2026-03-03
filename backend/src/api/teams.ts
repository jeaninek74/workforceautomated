import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { teams } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";

export const teamsRouter = Router();
teamsRouter.use(authenticate);

teamsRouter.get("/", async (req: AuthRequest, res) => {
  const list = await db.select().from(teams).where(eq(teams.userId, req.user!.id)).orderBy(desc(teams.createdAt));
  res.json({ teams: list });
});

teamsRouter.post("/", async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      memberAgentIds: z.array(z.number()).optional(),
      executionOrder: z.array(z.number()).optional(),
      governanceRules: z.record(z.unknown()).optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
    }).parse(req.body);
    const [team] = await db.insert(teams).values({ ...body, userId: req.user!.id }).returning();
    await logAudit({ userId: req.user!.id, action: "team.create", entityType: "team", entityId: String(team.id), req });
    res.status(201).json({ team });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

teamsRouter.get("/:id", async (req: AuthRequest, res) => {
  const [team] = await db.select().from(teams).where(and(eq(teams.id, parseInt(req.params.id)), eq(teams.userId, req.user!.id))).limit(1);
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json({ team });
});

teamsRouter.put("/:id", async (req: AuthRequest, res) => {
  const [team] = await db.update(teams).set({ ...req.body, updatedAt: new Date() })
    .where(and(eq(teams.id, parseInt(req.params.id)), eq(teams.userId, req.user!.id))).returning();
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json({ team });
});

teamsRouter.delete("/:id", async (req: AuthRequest, res) => {
  const [team] = await db.delete(teams).where(and(eq(teams.id, parseInt(req.params.id)), eq(teams.userId, req.user!.id))).returning();
  if (!team) return res.status(404).json({ error: "Team not found" });
  res.json({ success: true });
});
