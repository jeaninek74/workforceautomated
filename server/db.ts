import { and, desc, eq, gte, lte, like, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import {
  InsertUser, users, agents, teams, teamMembers, executions,
  auditLogs, governanceSettings, subscriptions,
  InsertAgent, InsertTeam, InsertTeamMember, InsertExecution,
  InsertAuditLog, InsertGovernanceSettings, InsertSubscription,
} from "../drizzle/schema";
import { ENV } from "./_core/env";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); }
    catch (error) { console.warn("[Database] Failed to connect:", error); _db = null; }
  }
  return _db;
}

// ─── Users ────────────────────────────────────────────────────────────────────
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }
  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    textFields.forEach((field) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized; updateSet[field] = normalized;
    });
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = "admin"; updateSet.role = "admin"; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) { console.error("[Database] Failed to upsert user:", error); throw error; }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Agents ───────────────────────────────────────────────────────────────────
export async function createAgent(data: InsertAgent) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(agents).values(data);
}

export async function getAgentsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(agents).where(eq(agents.userId, userId)).orderBy(desc(agents.createdAt));
}

export async function getAgentById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(agents).where(and(eq(agents.id, id), eq(agents.userId, userId))).limit(1);
  return result[0];
}

export async function updateAgent(id: number, userId: number, data: Partial<InsertAgent>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(agents).set(data).where(and(eq(agents.id, id), eq(agents.userId, userId)));
}

export async function deleteAgent(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(agents).where(and(eq(agents.id, id), eq(agents.userId, userId)));
}

export async function incrementAgentExecutions(agentId: number, confidenceScore: number) {
  const db = await getDb();
  if (!db) return;
  const agent = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  if (!agent[0]) return;
  const current = agent[0];
  const total = (current.totalExecutions ?? 0) + 1;
  const avgConf = ((current.avgConfidenceScore ?? 0) * (current.totalExecutions ?? 0) + confidenceScore) / total;
  await db.update(agents).set({ totalExecutions: total, avgConfidenceScore: avgConf, lastExecutedAt: new Date() }).where(eq(agents.id, agentId));
}

// ─── Teams ────────────────────────────────────────────────────────────────────
export async function createTeam(data: InsertTeam) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(teams).values(data);
}

export async function getTeamsByUser(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teams).where(eq(teams.userId, userId)).orderBy(desc(teams.createdAt));
}

export async function getTeamById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(teams).where(and(eq(teams.id, id), eq(teams.userId, userId))).limit(1);
  return result[0];
}

export async function updateTeam(id: number, userId: number, data: Partial<InsertTeam>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(teams).set(data).where(and(eq(teams.id, id), eq(teams.userId, userId)));
}

export async function deleteTeam(id: number, userId: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teams).where(and(eq(teams.id, id), eq(teams.userId, userId)));
}

export async function getTeamMembers(teamId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(teamMembers).where(eq(teamMembers.teamId, teamId)).orderBy(teamMembers.executionOrder);
}

export async function upsertTeamMembers(teamId: number, members: InsertTeamMember[]) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.delete(teamMembers).where(eq(teamMembers.teamId, teamId));
  if (members.length > 0) await db.insert(teamMembers).values(members);
}

// ─── Executions ───────────────────────────────────────────────────────────────
export async function createExecution(data: InsertExecution) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return db.insert(executions).values(data);
}

export async function getExecutionById(id: number, userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(executions).where(and(eq(executions.id, id), eq(executions.userId, userId))).limit(1);
  return result[0];
}

export async function updateExecution(id: number, data: Partial<InsertExecution>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.update(executions).set(data).where(eq(executions.id, id));
}

export async function getExecutionsByUser(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(executions).where(eq(executions.userId, userId)).orderBy(desc(executions.createdAt)).limit(limit);
}

export async function getExecutionsByAgent(agentId: number, userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(executions).where(and(eq(executions.agentId, agentId), eq(executions.userId, userId))).orderBy(desc(executions.createdAt)).limit(limit);
}

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export async function createAuditLog(data: InsertAuditLog) {
  const db = await getDb();
  if (!db) return;
  await db.insert(auditLogs).values(data);
}

export async function getAuditLogs(userId: number, options: { limit?: number; offset?: number; category?: string; search?: string; startDate?: Date; endDate?: Date } = {}) {
  const db = await getDb();
  if (!db) return { logs: [], total: 0 };
  const { limit = 50, offset = 0, category, search, startDate, endDate } = options;
  const conditions: any[] = [eq(auditLogs.userId, userId)];
  if (category) conditions.push(eq(auditLogs.category, category as any));
  if (startDate) conditions.push(gte(auditLogs.createdAt, startDate));
  if (endDate) conditions.push(lte(auditLogs.createdAt, endDate));
  if (search) conditions.push(like(auditLogs.action, `%${search}%`));
  const [logs, countResult] = await Promise.all([
    db.select().from(auditLogs).where(and(...conditions)).orderBy(desc(auditLogs.createdAt)).limit(limit).offset(offset),
    db.select({ count: sql<number>`count(*)` }).from(auditLogs).where(and(...conditions)),
  ]);
  return { logs, total: Number(countResult[0]?.count ?? 0) };
}

// ─── Governance Settings ──────────────────────────────────────────────────────
export async function getGovernanceSettings(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(governanceSettings).where(eq(governanceSettings.userId, userId)).limit(1);
  return result[0];
}

export async function upsertGovernanceSettings(userId: number, data: Partial<InsertGovernanceSettings>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getGovernanceSettings(userId);
  if (existing) {
    await db.update(governanceSettings).set(data).where(eq(governanceSettings.userId, userId));
  } else {
    await db.insert(governanceSettings).values({ userId, ...data } as InsertGovernanceSettings);
  }
}

// ─── Subscriptions ────────────────────────────────────────────────────────────
export async function getSubscriptionByUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.userId, userId)).limit(1);
  return result[0];
}

export async function upsertSubscription(userId: number, data: Partial<InsertSubscription>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const existing = await getSubscriptionByUser(userId);
  if (existing) {
    await db.update(subscriptions).set(data).where(eq(subscriptions.userId, userId));
  } else {
    await db.insert(subscriptions).values({ userId, ...data } as InsertSubscription);
  }
}

export async function getSubscriptionByStripeId(stripeSubscriptionId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeSubscriptionId, stripeSubscriptionId)).limit(1);
  return result[0];
}

export async function getSubscriptionByCustomerId(stripeCustomerId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(subscriptions).where(eq(subscriptions.stripeCustomerId, stripeCustomerId)).limit(1);
  return result[0];
}
