import {
  int,
  mysqlEnum,
  mysqlTable,
  text,
  timestamp,
  varchar,
  json,
  boolean,
  float,
  bigint,
} from "drizzle-orm/mysql-core";

// ─── Users ────────────────────────────────────────────────────────────────────
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

// ─── Subscriptions ────────────────────────────────────────────────────────────
export const subscriptions = mysqlTable("subscriptions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  stripeCustomerId: varchar("stripeCustomerId", { length: 128 }),
  stripeSubscriptionId: varchar("stripeSubscriptionId", { length: 128 }),
  stripePriceId: varchar("stripePriceId", { length: 128 }),
  plan: mysqlEnum("plan", ["starter", "professional", "enterprise"]).default("starter").notNull(),
  status: mysqlEnum("status", ["active", "canceled", "past_due", "trialing", "incomplete"]).default("active").notNull(),
  currentPeriodStart: timestamp("currentPeriodStart"),
  currentPeriodEnd: timestamp("currentPeriodEnd"),
  cancelAtPeriodEnd: boolean("cancelAtPeriodEnd").default(false),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Subscription = typeof subscriptions.$inferSelect;
export type InsertSubscription = typeof subscriptions.$inferInsert;

// ─── Agents ───────────────────────────────────────────────────────────────────
export const agents = mysqlTable("agents", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  role: varchar("role", { length: 255 }).notNull(),
  description: text("description"),
  capabilities: json("capabilities").$type<string[]>(),
  permissions: json("permissions").$type<string[]>(),
  systemPrompt: text("systemPrompt"),
  confidenceThreshold: float("confidenceThreshold").default(0.75),
  riskThreshold: mysqlEnum("riskThreshold", ["low", "medium", "high", "critical"]).default("medium"),
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("draft"),
  sourceType: mysqlEnum("sourceType", ["job_description", "manual"]).default("manual"),
  sourceJobDescription: text("sourceJobDescription"),
  lastExecutedAt: timestamp("lastExecutedAt"),
  totalExecutions: int("totalExecutions").default(0),
  avgConfidenceScore: float("avgConfidenceScore").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = typeof agents.$inferInsert;

// ─── Teams ────────────────────────────────────────────────────────────────────
export const teams = mysqlTable("teams", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  governanceMode: mysqlEnum("governanceMode", ["sequential", "parallel", "conditional"]).default("sequential"),
  confidenceThreshold: float("confidenceThreshold").default(0.75),
  riskThreshold: mysqlEnum("riskThreshold", ["low", "medium", "high", "critical"]).default("medium"),
  escalationPolicy: json("escalationPolicy").$type<{ autoEscalate: boolean; escalateOnRisk: string[] }>(),
  status: mysqlEnum("status", ["active", "inactive", "draft"]).default("draft"),
  totalExecutions: int("totalExecutions").default(0),
  avgConfidenceScore: float("avgConfidenceScore").default(0),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Team = typeof teams.$inferSelect;
export type InsertTeam = typeof teams.$inferInsert;

// ─── Team Members (agents in a team) ─────────────────────────────────────────
export const teamMembers = mysqlTable("teamMembers", {
  id: int("id").autoincrement().primaryKey(),
  teamId: int("teamId").notNull(),
  agentId: int("agentId").notNull(),
  executionOrder: int("executionOrder").default(0),
  role: mysqlEnum("role", ["lead", "member", "reviewer"]).default("member"),
  inputMapping: json("inputMapping").$type<Record<string, string>>(),
  outputMapping: json("outputMapping").$type<Record<string, string>>(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type TeamMember = typeof teamMembers.$inferSelect;
export type InsertTeamMember = typeof teamMembers.$inferInsert;

// ─── Executions ───────────────────────────────────────────────────────────────
export const executions = mysqlTable("executions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentId: int("agentId"),
  teamId: int("teamId"),
  type: mysqlEnum("type", ["single", "team"]).default("single").notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed", "escalated", "canceled"]).default("pending").notNull(),
  input: text("input"),
  output: text("output"),
  confidenceScore: float("confidenceScore"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]),
  escalated: boolean("escalated").default(false),
  escalationReason: text("escalationReason"),
  escalationResolvedAt: timestamp("escalationResolvedAt"),
  escalationResolvedBy: int("escalationResolvedBy"),
  steps: json("steps").$type<ExecutionStep[]>(),
  startedAt: timestamp("startedAt"),
  completedAt: timestamp("completedAt"),
  durationMs: bigint("durationMs", { mode: "number" }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ExecutionStep = {
  stepId: string;
  agentId?: number;
  agentName?: string;
  action: string;
  input?: string;
  output?: string;
  confidenceScore?: number;
  riskLevel?: string;
  status: "pending" | "running" | "completed" | "failed" | "escalated";
  startedAt?: number;
  completedAt?: number;
  durationMs?: number;
};

export type Execution = typeof executions.$inferSelect;
export type InsertExecution = typeof executions.$inferInsert;

// ─── Audit Logs ───────────────────────────────────────────────────────────────
export const auditLogs = mysqlTable("auditLogs", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  executionId: int("executionId"),
  agentId: int("agentId"),
  teamId: int("teamId"),
  action: varchar("action", { length: 255 }).notNull(),
  category: mysqlEnum("category", ["agent", "team", "execution", "escalation", "billing", "auth", "governance"]).notNull(),
  details: json("details").$type<Record<string, unknown>>(),
  confidenceScore: float("confidenceScore"),
  riskLevel: mysqlEnum("riskLevel", ["low", "medium", "high", "critical"]),
  ipAddress: varchar("ipAddress", { length: 64 }),
  userAgent: varchar("userAgent", { length: 512 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = typeof auditLogs.$inferInsert;

// ─── Governance Settings ──────────────────────────────────────────────────────
export const governanceSettings = mysqlTable("governanceSettings", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  globalConfidenceThreshold: float("globalConfidenceThreshold").default(0.75),
  globalRiskThreshold: mysqlEnum("globalRiskThreshold", ["low", "medium", "high", "critical"]).default("medium"),
  autoEscalate: boolean("autoEscalate").default(true),
  escalateOnRiskLevels: json("escalateOnRiskLevels").$type<string[]>(),
  requireHumanApproval: boolean("requireHumanApproval").default(false),
  maxConcurrentExecutions: int("maxConcurrentExecutions").default(5),
  retentionDays: int("retentionDays").default(90),
  notifyOnEscalation: boolean("notifyOnEscalation").default(true),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GovernanceSettings = typeof governanceSettings.$inferSelect;
export type InsertGovernanceSettings = typeof governanceSettings.$inferInsert;
