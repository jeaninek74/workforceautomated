import { Router } from "express";
import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";
import { eq, desc, and, gte, lte } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const auditRouter = Router();
auditRouter.use(authenticate);

auditRouter.get("/", async (req: AuthRequest, res) => {
  const { limit = "100", offset = "0", from, to, action } = req.query as Record<string, string>;
  const conditions = [eq(auditLogs.userId, req.user!.id)];
  if (from) conditions.push(gte(auditLogs.createdAt, new Date(from)));
  if (to) conditions.push(lte(auditLogs.createdAt, new Date(to)));
  const logs = await db.select().from(auditLogs)
    .where(and(...conditions))
    .orderBy(desc(auditLogs.createdAt))
    .limit(parseInt(limit))
    .offset(parseInt(offset));
  res.json({ logs, total: logs.length });
});
