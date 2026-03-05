import {
  pgTable, serial, text, varchar, timestamp, boolean, integer,
  jsonb, real, pgEnum, index, uniqueIndex
} from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role", ["user", "admin", "manager"]);
export const planEnum = pgEnum("plan", ["starter", "professional", "enterprise"]);
export const agentStatusEnum = pgEnum("agent_status", ["active", "inactive", "draft"]);
export const execStatusEnum = pgEnum("exec_status", ["pending", "running", "success", "failed", "escalated", "cancelled"]);
export const riskEnum = pgEnum("risk_level", ["low", "medium", "high", "critical"]);
export const connectorEnum = pgEnum("connector_type", ["overlay", "readonly", "write_back"]);

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  email: varchar("email", { length: 320 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  name: text("name").notNull(),
  role: roleEnum("role").default("user").notNull(),
  plan: planEnum("plan").default("starter").notNull(),
  stripeCustomerId: varchar("stripe_customer_id", { length: 64 }),
  stripeSubscriptionId: varchar("stripe_subscription_id", { length: 64 }),
  isActive: boolean("is_active").default(true).notNull(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  lastSignedIn: timestamp("last_signed_in"),
});

export const agents = pgTable("agents", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  role: varchar("role", { length: 255 }),
  capabilities: jsonb("capabilities").$type<string[]>(),
  permissions: jsonb("permissions").$type<string[]>(),
  connectorType: connectorEnum("connector_type").default("readonly"),
  confidenceThreshold: real("confidence_threshold").default(0.75).notNull(),
  escalationThreshold: real("escalation_threshold").default(0.5).notNull(),
  systemPrompt: text("system_prompt"),
  status: agentStatusEnum("status").default("draft").notNull(),
  lastExecutedAt: timestamp("last_executed_at"),
  totalExecutions: integer("total_executions").default(0).notNull(),
  avgConfidence: real("avg_confidence"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({ userIdx: index("agents_user_idx").on(t.userId) }));

export const teams = pgTable("teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  memberAgentIds: jsonb("member_agent_ids").$type<number[]>(),
  executionOrder: jsonb("execution_order").$type<number[]>(),
  // 'sequential' | 'parallel' | 'conditional'
  executionMode: varchar("execution_mode", { length: 32 }).default("sequential").notNull(),
  // Array of branching rules: { condition: string, fromAgentId: number, toAgentId: number, elseAgentId?: number }
  branchingRules: jsonb("branching_rules").$type<Array<{ condition: string; fromAgentId: number; toAgentId: number; elseAgentId?: number }>>(),
  governanceRules: jsonb("governance_rules").$type<Record<string, unknown>>(),
  confidenceThreshold: real("confidence_threshold").default(0.7).notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  totalExecutions: integer("total_executions").default(0).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const executions = pgTable("executions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  agentId: integer("agent_id").references(() => agents.id, { onDelete: "set null" }),
  teamId: integer("team_id").references(() => teams.id, { onDelete: "set null" }),
  type: varchar("type", { length: 32 }).default("single").notNull(),
  status: execStatusEnum("status").default("pending").notNull(),
  input: text("input"),
  output: text("output"),
  confidenceScore: real("confidence_score"),
  riskLevel: riskEnum("risk_level"),
  escalated: boolean("escalated").default(false).notNull(),
  escalationReason: text("escalation_reason"),
  processingTimeMs: integer("processing_time_ms"),
  tokenCount: integer("token_count"),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("exec_user_idx").on(t.userId),
  agentIdx: index("exec_agent_idx").on(t.agentId),
  statusIdx: index("exec_status_idx").on(t.status),
}));

export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id, { onDelete: "set null" }),
  executionId: integer("execution_id").references(() => executions.id, { onDelete: "set null" }),
  agentId: integer("agent_id").references(() => agents.id, { onDelete: "set null" }),
  action: varchar("action", { length: 128 }).notNull(),
  entityType: varchar("entity_type", { length: 64 }),
  entityId: varchar("entity_id", { length: 64 }),
  details: jsonb("details").$type<Record<string, unknown>>(),
  ipAddress: varchar("ip_address", { length: 45 }),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
}, (t) => ({
  userIdx: index("audit_user_idx").on(t.userId),
  createdIdx: index("audit_created_idx").on(t.createdAt),
}));

export const governanceSettings = pgTable("governance_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }).unique(),
  globalConfidenceThreshold: real("global_confidence_threshold").default(0.75).notNull(),
  globalEscalationThreshold: real("global_escalation_threshold").default(0.5).notNull(),
  requireApprovalForWriteBack: boolean("require_approval_for_write_back").default(true).notNull(),
  maxConcurrentExecutions: integer("max_concurrent_executions").default(5).notNull(),
  autoEscalateHighRisk: boolean("auto_escalate_high_risk").default(true).notNull(),
  notifyOnEscalation: boolean("notify_on_escalation").default(true).notNull(),
  retentionDays: integer("retention_days").default(365).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const kpiDefinitions = pgTable("kpi_definitions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  formula: text("formula"),
  dataSource: varchar("data_source", { length: 64 }),
  unit: varchar("unit", { length: 32 }),
  targetValue: real("target_value"),
  thresholdWarning: real("threshold_warning"),
  thresholdCritical: real("threshold_critical"),
  chartType: varchar("chart_type", { length: 32 }).default("line"),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const kpiResults = pgTable("kpi_results", {
  id: serial("id").primaryKey(),
  kpiId: integer("kpi_id").notNull().references(() => kpiDefinitions.id, { onDelete: "cascade" }),
  value: real("value").notNull(),
  calculatedAt: timestamp("calculated_at").defaultNow().notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
});

export const metricsSnapshots = pgTable("metrics_snapshots", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  snapshotDate: timestamp("snapshot_date").defaultNow().notNull(),
  automationRate: real("automation_rate"),
  escalationRate: real("escalation_rate"),
  avgProcessingTimeMs: real("avg_processing_time_ms"),
  humanOverrideRate: real("human_override_rate"),
  avgConfidenceScore: real("avg_confidence_score"),
  hoursSaved: real("hours_saved"),
  costSavings: real("cost_savings"),
  totalExecutions: integer("total_executions"),
  successfulExecutions: integer("successful_executions"),
  failedExecutions: integer("failed_executions"),
  escalatedExecutions: integer("escalated_executions"),
});

// ─── Integration Connectors ──────────────────────────────────────────────────
export const integrationTypeEnum = pgEnum("integration_type", ["google_drive", "slack", "rest_api", "webhook", "database"]);
export const integrationStatusEnum = pgEnum("integration_status", ["active", "inactive", "error"]);

export const integrations = pgTable("integrations", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  name: varchar("name", { length: 255 }).notNull(),
  type: integrationTypeEnum("type").notNull(),
  status: integrationStatusEnum("status").default("active").notNull(),
  // Encrypted credentials stored as JSON — never expose raw to frontend
  credentials: jsonb("credentials").$type<Record<string, string>>(),
  // Non-sensitive config (folder IDs, channel names, base URLs, etc.)
  config: jsonb("config").$type<Record<string, string>>(),
  lastTestedAt: timestamp("last_tested_at"),
  lastUsedAt: timestamp("last_used_at"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (t) => ({ userIdx: index("integrations_user_idx").on(t.userId) }));

// Agent <-> Integration assignments
export const agentIntegrations = pgTable("agent_integrations", {
  id: serial("id").primaryKey(),
  agentId: integer("agent_id").notNull().references(() => agents.id, { onDelete: "cascade" }),
  integrationId: integer("integration_id").notNull().references(() => integrations.id, { onDelete: "cascade" }),
  permissions: jsonb("permissions").$type<string[]>(), // e.g. ["read", "write"]
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Notification settings per user
export const notificationSettings = pgTable("notification_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  escalationEmailEnabled: boolean("escalation_email_enabled").default(false).notNull(),
  escalationEmail: text("escalation_email"),
  slackWebhookEnabled: boolean("slack_webhook_enabled").default(false).notNull(),
  slackWebhookUrl: text("slack_webhook_url"),
  notifyOnHighRisk: boolean("notify_on_high_risk").default(true).notNull(),
  notifyOnCriticalRisk: boolean("notify_on_critical_risk").default(true).notNull(),
  notifyOnLowConfidence: boolean("notify_on_low_confidence").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;
export type Agent = typeof agents.$inferSelect;
export type Team = typeof teams.$inferSelect;
export type Execution = typeof executions.$inferSelect;
export type AuditLog = typeof auditLogs.$inferSelect;
export type Integration = typeof integrations.$inferSelect;
export type AgentIntegration = typeof agentIntegrations.$inferSelect;
