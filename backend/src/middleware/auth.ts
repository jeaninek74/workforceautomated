import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

export interface AuthRequest extends Request {
  user?: { id: number; email: string; role: string; plan: string; name: string };
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return res.status(401).json({ error: "No token provided" });
  }
  const token = authHeader.slice(7);
  try {
    const appSecret = process.env.APP_SECRET;
    if (!appSecret) {
      console.error("APP_SECRET environment variable is not set — refusing to verify tokens");
      return res.status(500).json({ error: "Server configuration error" });
    }
    const payload = jwt.verify(token, appSecret) as { userId: number };
    const result = await db.select({
      id: users.id, email: users.email, role: users.role, plan: users.plan, name: users.name
    }).from(users).where(eq(users.id, payload.userId)).limit(1);
    if (!result[0]) return res.status(401).json({ error: "User not found" });
    req.user = result[0];
    next();
  } catch {
    return res.status(401).json({ error: "Invalid token" });
  }
}

export function requireAdmin(req: AuthRequest, res: Response, next: NextFunction) {
  if (req.user?.role !== "admin") return res.status(403).json({ error: "Admin only" });
  next();
}
