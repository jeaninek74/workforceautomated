import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { integrations, agentIntegrations, agents } from "../db/schema.js";
import { eq, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { testIntegration } from "../services/integrations.js";

export const integrationsRouter = Router();
integrationsRouter.use(authenticate);

// ─── GET /api/integrations ────────────────────────────────────────────────────
integrationsRouter.get("/", async (req: AuthRequest, res) => {
  const list = await db
    .select({
      id: integrations.id,
      name: integrations.name,
      type: integrations.type,
      status: integrations.status,
      config: integrations.config,
      lastTestedAt: integrations.lastTestedAt,
      lastUsedAt: integrations.lastUsedAt,
      errorMessage: integrations.errorMessage,
      createdAt: integrations.createdAt,
      updatedAt: integrations.updatedAt,
      // Never return credentials to frontend
    })
    .from(integrations)
    .where(eq(integrations.userId, req.user!.id));

  res.json({ integrations: list });
});

// ─── POST /api/integrations ───────────────────────────────────────────────────
integrationsRouter.post("/", async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      name: z.string().min(1).max(255),
      type: z.enum(["google_drive", "slack", "rest_api", "webhook", "database"]),
      credentials: z.record(z.string()).optional().default({}),
      config: z.record(z.string()).optional().default({}),
    }).parse(req.body);

    const [integration] = await db
      .insert(integrations)
      .values({
        userId: req.user!.id,
        name: body.name,
        type: body.type,
        credentials: body.credentials,
        config: body.config,
        status: "active",
      })
      .returning({
        id: integrations.id,
        name: integrations.name,
        type: integrations.type,
        status: integrations.status,
        config: integrations.config,
        createdAt: integrations.createdAt,
      });

    res.status(201).json({ integration });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── PUT /api/integrations/:id ────────────────────────────────────────────────
integrationsRouter.put("/:id", async (req: AuthRequest, res) => {
  try {
    const id = parseInt(req.params.id);
    const body = z.object({
      name: z.string().min(1).max(255).optional(),
      credentials: z.record(z.string()).optional(),
      config: z.record(z.string()).optional(),
      status: z.enum(["active", "inactive", "error"]).optional(),
    }).parse(req.body);

    const [updated] = await db
      .update(integrations)
      .set({ ...body, updatedAt: new Date() })
      .where(and(eq(integrations.id, id), eq(integrations.userId, req.user!.id)))
      .returning({
        id: integrations.id,
        name: integrations.name,
        type: integrations.type,
        status: integrations.status,
        config: integrations.config,
        updatedAt: integrations.updatedAt,
      });

    if (!updated) return res.status(404).json({ error: "Integration not found" });
    res.json({ integration: updated });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /api/integrations/:id ────────────────────────────────────────────
integrationsRouter.delete("/:id", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [deleted] = await db
    .delete(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.userId, req.user!.id)))
    .returning({ id: integrations.id });

  if (!deleted) return res.status(404).json({ error: "Integration not found" });
  res.json({ success: true });
});

// ─── POST /api/integrations/:id/test ─────────────────────────────────────────
integrationsRouter.post("/:id/test", async (req: AuthRequest, res) => {
  const id = parseInt(req.params.id);
  const [integration] = await db
    .select()
    .from(integrations)
    .where(and(eq(integrations.id, id), eq(integrations.userId, req.user!.id)))
    .limit(1);

  if (!integration) return res.status(404).json({ error: "Integration not found" });

  const result = await testIntegration(
    integration.type,
    (integration.credentials || {}) as Record<string, string>,
    (integration.config || {}) as Record<string, string>
  );

  await db
    .update(integrations)
    .set({
      lastTestedAt: new Date(),
      status: result.success ? "active" : "error",
      errorMessage: result.success ? null : result.message,
      updatedAt: new Date(),
    })
    .where(eq(integrations.id, id));

  res.json(result);
});

// ─── GET /api/integrations/agent/:agentId ────────────────────────────────────
// Ownership check: verify the agent belongs to the authenticated user
integrationsRouter.get("/agent/:agentId", async (req: AuthRequest, res) => {
  const agentId = parseInt(req.params.agentId);

  // Verify the agent belongs to the authenticated user
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.userId, req.user!.id)))
    .limit(1);

  if (!agent) return res.status(404).json({ error: "Agent not found" });

  const assignments = await db
    .select({
      id: agentIntegrations.id,
      integrationId: agentIntegrations.integrationId,
      permissions: agentIntegrations.permissions,
      createdAt: agentIntegrations.createdAt,
      integrationName: integrations.name,
      integrationType: integrations.type,
      integrationStatus: integrations.status,
    })
    .from(agentIntegrations)
    .innerJoin(integrations, eq(agentIntegrations.integrationId, integrations.id))
    .where(eq(agentIntegrations.agentId, agentId));

  res.json({ assignments });
});

// ─── POST /api/integrations/agent/:agentId/assign ────────────────────────────
// Ownership checks: verify both the agent and the integration belong to the user
integrationsRouter.post("/agent/:agentId/assign", async (req: AuthRequest, res) => {
  try {
    const agentId = parseInt(req.params.agentId);
    const body = z.object({
      integrationId: z.number(),
      permissions: z.array(z.string()).optional().default(["read"]),
    }).parse(req.body);

    // Verify the agent belongs to the authenticated user
    const [agent] = await db
      .select({ id: agents.id })
      .from(agents)
      .where(and(eq(agents.id, agentId), eq(agents.userId, req.user!.id)))
      .limit(1);

    if (!agent) return res.status(404).json({ error: "Agent not found" });

    // Verify the integration belongs to the authenticated user
    const [integration] = await db
      .select({ id: integrations.id })
      .from(integrations)
      .where(and(eq(integrations.id, body.integrationId), eq(integrations.userId, req.user!.id)))
      .limit(1);

    if (!integration) return res.status(404).json({ error: "Integration not found" });

    const [assignment] = await db
      .insert(agentIntegrations)
      .values({
        agentId,
        integrationId: body.integrationId,
        permissions: body.permissions,
      })
      .returning();

    res.status(201).json({ assignment });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// ─── DELETE /api/integrations/agent/:agentId/assign/:assignmentId ────────────
// Ownership check: verify the assignment belongs to an agent owned by the user
integrationsRouter.delete("/agent/:agentId/assign/:assignmentId", async (req: AuthRequest, res) => {
  const agentId = parseInt(req.params.agentId);
  const assignmentId = parseInt(req.params.assignmentId);

  // Verify the agent belongs to the authenticated user
  const [agent] = await db
    .select({ id: agents.id })
    .from(agents)
    .where(and(eq(agents.id, agentId), eq(agents.userId, req.user!.id)))
    .limit(1);

  if (!agent) return res.status(404).json({ error: "Agent not found" });

  // Delete only if the assignment belongs to this agent (which we've verified belongs to the user)
  const [deleted] = await db
    .delete(agentIntegrations)
    .where(and(eq(agentIntegrations.id, assignmentId), eq(agentIntegrations.agentId, agentId)))
    .returning({ id: agentIntegrations.id });

  if (!deleted) return res.status(404).json({ error: "Assignment not found" });
  res.json({ success: true });
});
