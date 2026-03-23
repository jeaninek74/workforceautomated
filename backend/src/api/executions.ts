import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { db } from "../db/index.js";
import { executions, agents } from "../db/schema.js";
import { eq, and, desc, gte, sql } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { runAgentExecution } from "../services/executor.js";
import { checkTaskScope } from "../services/llm.js";

export const executionsRouter = Router();
executionsRouter.use(authenticate);

// ─── Multer file upload config ────────────────────────────────────────────────
const uploadDir = path.join(os.tmpdir(), "wa-uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  },
});

const ALLOWED_MIME_TYPES = [
  "text/plain",
  "text/csv",
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
];

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024, files: 5 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`Unsupported file type: ${file.mimetype}. Supported: PDF, CSV, Excel, Word, TXT`));
    }
  },
});

// ─── POST /api/executions/check-scope ───────────────────────────────────────
// Fast pre-flight scope check — does NOT create an execution record.
// Returns { inScope, reason, suggestedCapabilities, agentName }
executionsRouter.post("/check-scope", async (req: AuthRequest, res) => {
  try {
    const { agentId, input } = req.body;
    if (!agentId || !input) return res.status(400).json({ error: "agentId and input are required" });
    const [agent] = await db
      .select()
      .from(agents)
      .where(and(eq(agents.id, parseInt(agentId)), eq(agents.userId, req.user!.id)))
      .limit(1);
    if (!agent) return res.status(404).json({ error: "Agent not found" });
    const result = await checkTaskScope(
      agent.name,
      agent.role || null,
      agent.description || null,
      agent.systemPrompt || null,
      input
    );
    res.json({ ...result, agentName: agent.name });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/executions ──────────────────────────────────────────────────────
executionsRouter.get("/", async (req: AuthRequest, res) => {
  try {
    const agentId = req.query.agentId ? parseInt(req.query.agentId as string) : undefined;
    const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
    const limit = req.query.limit ? Math.min(parseInt(req.query.limit as string), 200) : 50;
    let whereClause: any = eq(executions.userId, req.user!.id);
    if (agentId) whereClause = and(whereClause, eq(executions.agentId, agentId));
    if (teamId) whereClause = and(whereClause, eq(executions.teamId, teamId));
    // Join with agents to get agentName
    const rows = await db
      .select({
        id: executions.id,
        userId: executions.userId,
        agentId: executions.agentId,
        teamId: executions.teamId,
        type: executions.type,
        status: executions.status,
        input: executions.input,
        output: executions.output,
        confidenceScore: executions.confidenceScore,
        riskLevel: executions.riskLevel,
        escalated: executions.escalated,
        escalationReason: executions.escalationReason,
        processingTimeMs: executions.processingTimeMs,
        tokenCount: executions.tokenCount,
        metadata: executions.metadata,
        startedAt: executions.startedAt,
        completedAt: executions.completedAt,
        createdAt: executions.createdAt,
        agentName: agents.name,
      })
      .from(executions)
      .leftJoin(agents, eq(executions.agentId, agents.id))
      .where(whereClause)
      .orderBy(desc(executions.createdAt))
      .limit(limit);
    const total = rows.length;
    res.json({ executions: rows, total });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── POST /api/executions (with optional file uploads) ───────────────────────
executionsRouter.post(
  "/",
  upload.array("files", 5),
  async (req: AuthRequest, res) => {
    const uploadedFiles = (req.files as Express.Multer.File[]) || [];
    try {
      const body = z.object({
        agentId: z.coerce.number().optional(),
        teamId: z.coerce.number().optional(),
        input: z.string().min(1),
        type: z.enum(["single", "team"]).default("single"),
        outputFormat: z.string().optional(),
      }).parse(req.body);

      const [exec] = await db
        .insert(executions)
        .values({
          userId: req.user!.id,
          agentId: body.agentId,
          teamId: body.teamId,
          type: body.type,
          input: body.input,
          status: "pending",
          startedAt: new Date(),
          metadata: {
            outputFormat: body.outputFormat || null,
            filesAttached: uploadedFiles.length,
            fileNames: uploadedFiles.map((f) => f.originalname),
          },
        })
        .returning();

      const files = uploadedFiles.map((f) => ({
        path: f.path,
        mimeType: f.mimetype,
        originalName: f.originalname,
      }));

      // Run execution synchronously — await the result so the client gets the full output in one response
      try {
        await runAgentExecution(exec.id, req.user!.id, { ...body, files });
      } catch (execErr: any) {
        console.error("[Execution] Error:", execErr.message);
      } finally {
        for (const file of uploadedFiles) {
          fs.unlink(file.path, () => {});
        }
      }

      // Fetch the completed execution with full output
      const [completedExec] = await db
        .select()
        .from(executions)
        .where(eq(executions.id, exec.id))
        .limit(1);

      res.status(200).json({ execution: completedExec || exec });
    } catch (err: any) {
      for (const file of uploadedFiles) {
        fs.unlink(file.path, () => {});
      }
      res.status(400).json({ error: err.message });
    }
  }
);

// ─── GET /api/executions/usage/monthly ──────────────────────────────────────────
// Real database count of executions since the 1st of the current month.
// Returns count, plan limit, percent used, and remaining so the
// dashboard counter widget always shows accurate live data.
executionsRouter.get("/usage/monthly", async (req: AuthRequest, res) => {
  try {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const [row] = await db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(executions)
      .where(and(
        eq(executions.userId, req.user!.id),
        gte(executions.createdAt, monthStart)
      ));
    const count = row?.count ?? 0;
    const plan: string = (req.user as any)?.plan || "starter";
    const limits: Record<string, number | null> = {
      starter: 10000,
      professional: 100000,
      enterprise: null,
    };
    const limit = limits[plan] ?? 10000;
    res.json({
      count,
      limit,
      plan,
      month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`,
      percentUsed: limit ? Math.min(Math.round((count / limit) * 100), 100) : 0,
      remaining: limit !== null ? Math.max(limit - count, 0) : null,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ─── GET /api/executions/:id ──────────────────────────────────────────────────
executionsRouter.get("/:id", async (req: AuthRequest, res) => {
  const [exec] = await db
    .select()
    .from(executions)
    .where(and(eq(executions.id, parseInt(req.params.id)), eq(executions.userId, req.user!.id)))
    .limit(1);
  if (!exec) return res.status(404).json({ error: "Execution not found" });
  res.json({ execution: exec });
});

// ─── POST /api/executions/:id/cancel ─────────────────────────────────────────
executionsRouter.post("/:id/cancel", async (req: AuthRequest, res) => {
  const [exec] = await db
    .update(executions)
    .set({ status: "cancelled", completedAt: new Date() })
    .where(and(eq(executions.id, parseInt(req.params.id)), eq(executions.userId, req.user!.id)))
    .returning();
  if (!exec) return res.status(404).json({ error: "Execution not found" });
  res.json({ execution: exec });
});
