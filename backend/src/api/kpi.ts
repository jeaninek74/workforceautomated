import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { kpiDefinitions, kpiResults } from "../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const kpiRouter = Router();
kpiRouter.use(authenticate);

kpiRouter.get("/", async (req: AuthRequest, res) => {
  const kpis = await db.select().from(kpiDefinitions).where(eq(kpiDefinitions.userId, req.user!.id)).orderBy(desc(kpiDefinitions.createdAt));
  res.json({ kpis });
});

kpiRouter.post("/", async (req: AuthRequest, res) => {
  try {
    const body = z.object({
      name: z.string().min(1),
      description: z.string().optional(),
      formula: z.string().optional(),
      dataSource: z.string().optional(),
      unit: z.string().optional(),
      targetValue: z.number().optional(),
      thresholdWarning: z.number().optional(),
      thresholdCritical: z.number().optional(),
      chartType: z.string().optional(),
    }).parse(req.body);
    const [kpi] = await db.insert(kpiDefinitions).values({ ...body, userId: req.user!.id }).returning();
    res.status(201).json({ kpi });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

kpiRouter.delete("/:id", async (req: AuthRequest, res) => {
  await db.delete(kpiDefinitions).where(and(eq(kpiDefinitions.id, parseInt(req.params.id)), eq(kpiDefinitions.userId, req.user!.id)));
  res.json({ success: true });
});

kpiRouter.get("/:id/results", async (req: AuthRequest, res) => {
  const results = await db.select().from(kpiResults).where(eq(kpiResults.kpiId, parseInt(req.params.id))).orderBy(desc(kpiResults.calculatedAt)).limit(100);
  res.json({ results });
});

kpiRouter.post("/:id/results", async (req: AuthRequest, res) => {
  const { value, metadata } = req.body;
  const [result] = await db.insert(kpiResults).values({ kpiId: parseInt(req.params.id), value, metadata }).returning();
  res.status(201).json({ result });
});
