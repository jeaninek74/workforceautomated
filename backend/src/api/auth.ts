import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { db } from "../db/index.js";
import { users, governanceSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";

export const authRouter = Router();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

authRouter.post("/register", async (req, res) => {
  try {
    const body = registerSchema.parse(req.body);
    const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, body.email)).limit(1);
    if (existing[0]) return res.status(409).json({ error: "Email already registered" });
    const passwordHash = await bcrypt.hash(body.password, 12);
    const [user] = await db.insert(users).values({
      email: body.email,
      passwordHash,
      name: body.name,
    }).returning({ id: users.id, email: users.email, name: users.name, role: users.role, plan: users.plan });
    // Create default governance settings
    await db.insert(governanceSettings).values({ userId: user.id }).onConflictDoNothing();
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) return res.status(500).json({ error: "Server configuration error: APP_SECRET not set" });
    const token = jwt.sign({ userId: user.id }, appSecret, { expiresIn: "30d" });
    await logAudit({ userId: user.id, action: "user.register", entityType: "user", entityId: String(user.id), req });
    res.status(201).json({ token, user });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: err.message });
  }
});

authRouter.post("/login", async (req, res) => {
  try {
    const body = loginSchema.parse(req.body);
    const [user] = await db.select().from(users).where(eq(users.email, body.email)).limit(1);
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const valid = await bcrypt.compare(body.password, user.passwordHash);
    if (!valid) return res.status(401).json({ error: "Invalid credentials" });
    await db.update(users).set({ lastSignedIn: new Date() }).where(eq(users.id, user.id));
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) return res.status(500).json({ error: "Server configuration error: APP_SECRET not set" });
    const token = jwt.sign({ userId: user.id }, appSecret, { expiresIn: "30d" });
    await logAudit({ userId: user.id, action: "user.login", entityType: "user", entityId: String(user.id), req });
    const { passwordHash: _, ...safeUser } = user;
    res.json({ token, user: safeUser });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: err.message });
  }
});

authRouter.get("/me", authenticate, async (req: AuthRequest, res) => {
  res.json({ user: req.user });
});

authRouter.put("/profile", authenticate, async (req: AuthRequest, res) => {
  try {
    const { name } = z.object({ name: z.string().min(2) }).parse(req.body);
    await db.update(users).set({ name, updatedAt: new Date() }).where(eq(users.id, req.user!.id));
    res.json({ success: true });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// Admin-only: promote user to admin (only works if already admin or first user)
authRouter.post("/promote-admin", authenticate, async (req: AuthRequest, res) => {
  try {
    const { userId: targetUserId } = z.object({ userId: z.number() }).parse(req.body);
    // Only existing admins can promote users
    if (req.user!.role !== 'admin') {
      return res.status(403).json({ error: "Forbidden: admin role required" });
    }
    await db.update(users).set({ role: 'admin' as any, updatedAt: new Date() }).where(eq(users.id, targetUserId));
    res.json({ success: true, message: "User promoted to admin" });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});
