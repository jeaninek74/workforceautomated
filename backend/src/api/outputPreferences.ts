import { Router } from "express";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";

export const outputPreferencesRouter = Router();
outputPreferencesRouter.use(authenticate);

// GET /api/output-preferences — return the current user's output preferences
outputPreferencesRouter.get("/", async (req: AuthRequest, res) => {
  try {
    const [user] = await db
      .select({ outputPreferences: users.outputPreferences })
      .from(users)
      .where(eq(users.id, req.user!.id))
      .limit(1);
    res.json({ outputPreferences: user?.outputPreferences || "" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/output-preferences — save the current user's output preferences
outputPreferencesRouter.put("/", async (req: AuthRequest, res) => {
  try {
    const { outputPreferences } = req.body as { outputPreferences: string };
    if (typeof outputPreferences !== "string") {
      return res.status(400).json({ error: "outputPreferences must be a string" });
    }
    await db
      .update(users)
      .set({ outputPreferences: outputPreferences || null, updatedAt: new Date() })
      .where(eq(users.id, req.user!.id));
    res.json({ success: true, outputPreferences });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
