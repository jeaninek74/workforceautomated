import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { governanceSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const governanceRouter = Router();
governanceRouter.use(authenticate);

governanceRouter.get("/settings", async (req: AuthRequest, res) => {
  let [settings] = await db.select().from(governanceSettings).where(eq(governanceSettings.userId, req.user!.id)).limit(1);
  if (!settings) {
    [settings] = await db.insert(governanceSettings).values({ userId: req.user!.id }).returning();
  }
  res.json({ settings });
});

const governanceUpdateSchema = z.object({
  globalConfidenceThreshold: z.number().min(0).max(1).optional(),
  globalEscalationThreshold: z.number().min(0).max(1).optional(),
  requireApprovalForWriteBack: z.boolean().optional(),
  maxConcurrentExecutions: z.number().int().min(1).max(100).optional(),
  autoEscalateHighRisk: z.boolean().optional(),
  notifyOnEscalation: z.boolean().optional(),
  retentionDays: z.number().int().min(1).max(3650).optional(),
});

governanceRouter.put("/settings", async (req: AuthRequest, res) => {
  const validated = governanceUpdateSchema.parse(req.body);
  const [settings] = await db.update(governanceSettings)
    .set({ ...validated, updatedAt: new Date() })
    .where(eq(governanceSettings.userId, req.user!.id)).returning();
  res.json({ settings });
});
