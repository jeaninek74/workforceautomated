import { Router } from "express";
import { z } from "zod";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os";
import { db } from "../db/index.js";
import { executions } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { runAgentExecution } from "../services/executor.js";

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

// ─── GET /api/executions ──────────────────────────────────────────────────────
executionsRouter.get("/", async (req: AuthRequest, res) => {
  const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
  const whereClause = teamId
    ? and(eq(executions.userId, req.user!.id), eq(executions.teamId, teamId))
    : eq(executions.userId, req.user!.id);
  const list = await db
    .select()
    .from(executions)
    .where(whereClause)
    .orderBy(desc(executions.createdAt))
    .limit(100);
  res.json({ executions: list });
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

      runAgentExecution(exec.id, req.user!.id, { ...body, files })
        .catch(console.error)
        .finally(() => {
          for (const file of uploadedFiles) {
            fs.unlink(file.path, () => {});
          }
        });

      res.status(202).json({ execution: exec });
    } catch (err: any) {
      for (const file of uploadedFiles) {
        fs.unlink(file.path, () => {});
      }
      res.status(400).json({ error: err.message });
    }
  }
);

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
