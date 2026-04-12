import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { teams, agents } from "../db/schema.js";
import { eq, and, desc, inArray, sql } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";
import { getLimits } from "../lib/planLimits.js";
import { parseIntParam } from "../utils/parseIntParam.js";

export const teamsRouter = Router();
teamsRouter.use(authenticate);

const branchingRuleSchema = z.object({
  condition: z.string(),
  fromAgentId: z.number(),
  toAgentId: z.number(),
  elseAgentId: z.number().optional(),
});

const teamBodySchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  memberAgentIds: z.array(z.number()).optional(),
  executionOrder: z.array(z.number()).optional(),
  executionMode: z.enum(["sequential", "parallel", "conditional"]).optional().default("sequential"),
  branchingRules: z.array(branchingRuleSchema).optional(),
  governanceRules: z.record(z.unknown()).optional(),
  confidenceThreshold: z.number().min(0).max(1).optional(),
});

// Helper: enrich team with agent details
async function enrichTeam(team: any) {
  const memberIds = (team.executionOrder || team.memberAgentIds || []) as number[];
  let memberAgents: any[] = [];
  if (memberIds.length > 0) {
    memberAgents = await db.select({
      id: agents.id,
      name: agents.name,
      role: agents.role,
      description: agents.description,
      status: agents.status,
      avgConfidence: agents.avgConfidence,
      totalExecutions: agents.totalExecutions,
    }).from(agents).where(inArray(agents.id, memberIds));
    // Preserve order
    memberAgents = memberIds
      .map((id) => memberAgents.find((a) => a.id === id))
      .filter(Boolean);
  }
  return { ...team, memberAgents };
}

teamsRouter.get("/", async (req: AuthRequest, res) => {
  try {
    const list = await db.select().from(teams)
      .where(eq(teams.userId, req.user!.id))
      .orderBy(desc(teams.createdAt));
    const enriched = await Promise.all(list.map(enrichTeam));
    res.json({ teams: enriched });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

teamsRouter.post("/", async (req: AuthRequest, res) => {
  try {
    // Enforce per-plan team limit
    const plan: string = (req.user as any)?.plan || "starter";
    const limits = getLimits(plan);
    if (limits.teams !== null) {
      const [row] = await db
        .select({ count: sql<number>`cast(count(*) as int)` })
        .from(teams)
        .where(eq(teams.userId, req.user!.id));
      const current = row?.count ?? 0;
      if (current >= limits.teams) {
        return res.status(403).json({
          error: `Team limit reached. Your ${plan} plan allows ${limits.teams} team${limits.teams !== 1 ? "s" : ""}. Upgrade your plan to create more.`,
          limitReached: true,
          limit: limits.teams,
          current,
        });
      }
    }
    const body = teamBodySchema.parse(req.body);
    const [team] = await db.insert(teams).values({
      ...body,
      userId: req.user!.id,
    } as any).returning();
    await logAudit({
      userId: req.user!.id,
      action: "team.create",
      entityType: "team",
      entityId: String(team.id),
      req,
    });
    res.status(201).json({ team: await enrichTeam(team) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

teamsRouter.get("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseIntParam(req.params.id, res); if (id === null) return;
    const [team] = await db.select().from(teams)
      .where(and(eq(teams.id, id), eq(teams.userId, req.user!.id)))
      .limit(1);
    if (!team) return res.status(404).json({ error: "Team not found" });
    res.json({ team: await enrichTeam(team) });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

teamsRouter.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseIntParam(req.params.id, res); if (id === null) return;
    const body = teamBodySchema.partial().parse(req.body);
    const [team] = await db.update(teams)
      .set({ ...body, updatedAt: new Date() } as any)
      .where(and(eq(teams.id, id), eq(teams.userId, req.user!.id)))
      .returning();
    if (!team) return res.status(404).json({ error: "Team not found" });
    await logAudit({
      userId: req.user!.id,
      action: "team.update",
      entityType: "team",
      entityId: String(team.id),
      req,
    });
    res.json({ team: await enrichTeam(team) });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

teamsRouter.delete("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseIntParam(req.params.id, res); if (id === null) return;
    const [team] = await db.delete(teams)
      .where(and(eq(teams.id, id), eq(teams.userId, req.user!.id)))
      .returning();
    if (!team) return res.status(404).json({ error: "Team not found" });
    await logAudit({
      userId: req.user!.id,
      action: "team.delete",
      entityType: "team",
      entityId: String(team.id),
      req,
    });
    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
