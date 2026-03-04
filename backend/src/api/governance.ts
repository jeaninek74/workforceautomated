import { Router } from "express";
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

governanceRouter.put("/settings", async (req: AuthRequest, res) => {
  const [settings] = await db.update(governanceSettings)
    .set({ ...req.body, updatedAt: new Date() })
    .where(eq(governanceSettings.userId, req.user!.id)).returning();
  res.json({ settings });
});
