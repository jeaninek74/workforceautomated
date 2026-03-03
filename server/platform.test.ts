import { describe, expect, it, vi, beforeEach } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

// ─── Mock DB helpers ──────────────────────────────────────────────────────────
vi.mock("./db", () => ({
  upsertUser: vi.fn(),
  getUserByOpenId: vi.fn(),
  createAgent: vi.fn().mockResolvedValue({ id: 1, name: "Test Agent", role: "Analyst", status: "active", capabilities: [], permissions: [], confidenceThreshold: 0.75, riskLevel: "medium", userId: 1, createdAt: new Date(), updatedAt: new Date() }),
  getAgentsByUser: vi.fn().mockResolvedValue([]),
  getAgentById: vi.fn().mockResolvedValue({ id: 1, name: "Test Agent", role: "Analyst", userId: 1, status: "active", capabilities: [], permissions: [], confidenceThreshold: 0.75, riskLevel: "medium", createdAt: new Date(), updatedAt: new Date() }),
  updateAgent: vi.fn().mockResolvedValue({ id: 1, name: "Updated Agent", role: "Analyst", userId: 1, status: "active", capabilities: [], permissions: [], confidenceThreshold: 0.75, riskLevel: "medium", createdAt: new Date(), updatedAt: new Date() }),
  deleteAgent: vi.fn().mockResolvedValue(undefined),
  createTeam: vi.fn().mockResolvedValue([{ insertId: 1 }]),
  getTeamsByUser: vi.fn().mockResolvedValue([]),
  getTeamById: vi.fn().mockResolvedValue({ id: 1, name: "Test Team", userId: 1, status: "active", memberAgentIds: [], executionOrder: "sequential", governanceMode: "standard", createdAt: new Date(), updatedAt: new Date() }),
  createExecution: vi.fn().mockResolvedValue({ id: 1, userId: 1, type: "single", status: "running", input: "test", agentId: 1, teamId: null, confidenceScore: null, riskLevel: null, output: null, escalationReason: null, startedAt: new Date(), completedAt: null, createdAt: new Date() }),
  getExecutionsByUser: vi.fn().mockResolvedValue([]),
  getExecutionById: vi.fn().mockResolvedValue({ id: 1, userId: 1, type: "single", status: "completed", input: "test", agentId: 1, teamId: null, confidenceScore: 0.88, riskLevel: "low", output: "Result", escalationReason: null, startedAt: new Date(), completedAt: new Date(), createdAt: new Date() }),
  updateExecution: vi.fn().mockResolvedValue(undefined),
  createAuditLog: vi.fn().mockResolvedValue(undefined),
  getAuditLogsByUser: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
  getAuditLogs: vi.fn().mockResolvedValue({ logs: [], total: 0 }),
  incrementAgentExecutions: vi.fn().mockResolvedValue(undefined),
  getExecutionsByAgent: vi.fn().mockResolvedValue([]),
  getTeamMembers: vi.fn().mockResolvedValue([]),
  upsertTeamMembers: vi.fn().mockResolvedValue(undefined),
  updateTeam: vi.fn().mockResolvedValue({ id: 1, name: "Test Team", userId: 1, status: "active", memberAgentIds: [], executionOrder: "sequential", governanceMode: "standard", createdAt: new Date(), updatedAt: new Date() }),
  deleteTeam: vi.fn().mockResolvedValue(undefined),
  getSubscriptionByStripeId: vi.fn().mockResolvedValue(null),
  getGovernanceSettings: vi.fn().mockResolvedValue(null),
  upsertGovernanceSettings: vi.fn().mockResolvedValue(undefined),
  getSubscriptionByUser: vi.fn().mockResolvedValue(null),
  upsertSubscription: vi.fn().mockResolvedValue(undefined),
  getSubscriptionByCustomerId: vi.fn().mockResolvedValue(null),
  getDashboardStats: vi.fn().mockResolvedValue({ totalAgents: 0, activeAgents: 0, totalTeams: 0, totalExecutions: 0, completedExecutions: 0, escalatedExecutions: 0, avgConfidenceScore: 0, riskBreakdown: { low: 0, medium: 0, high: 0, critical: 0 }, recentExecutions: [], recentAuditLogs: [] }),
}));

vi.mock("./_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [{ message: { content: JSON.stringify({ name: "AI Agent", role: "Data Analyst", capabilities: ["data analysis"], permissions: ["read"], confidenceThreshold: 0.8, riskLevel: "low", systemPrompt: "You are a data analyst." }) } }],
  }),
}));

// ─── Test context factory ─────────────────────────────────────────────────────
function makeCtx(overrides: Partial<TrpcContext> = {}): TrpcContext {
  return {
    user: {
      id: 1,
      openId: "test-open-id",
      email: "test@example.com",
      name: "Test User",
      loginMethod: "manus",
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
      lastSignedIn: new Date(),
    },
    req: { protocol: "https", headers: { origin: "https://workforceautomated.com" } } as TrpcContext["req"],
    res: { clearCookie: vi.fn(), cookie: vi.fn() } as unknown as TrpcContext["res"],
    ...overrides,
  };
}

// ─── Auth tests ───────────────────────────────────────────────────────────────
describe("auth", () => {
  it("returns current user from auth.me", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.me();
    expect(result).toMatchObject({ id: 1, email: "test@example.com" });
  });

  it("clears cookie on logout", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.auth.logout();
    expect(result.success).toBe(true);
    expect(ctx.res.clearCookie).toHaveBeenCalled();
  });
});

// ─── Agent tests ──────────────────────────────────────────────────────────────
describe("agent", () => {
  it("creates an agent with valid input", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agent.create({
      name: "Test Agent",
      role: "Analyst",
      capabilities: ["data analysis"],
      permissions: ["read"],
      confidenceThreshold: 0.8,
    });
    expect(result).toMatchObject({ success: true });
  });

  it("returns agent list", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.agent.list();
    expect(Array.isArray(result)).toBe(true);
  });

  it("rejects agent creation without auth", async () => {
    const ctx = makeCtx({ user: null });
    const caller = appRouter.createCaller(ctx);
    await expect(caller.agent.create({ name: "X", role: "Y", capabilities: [], permissions: [] }))
      .rejects.toThrow();
  });
});

// ─── Team tests ───────────────────────────────────────────────────────────────
describe("team", () => {
  it("creates a team with valid input", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.team.create({
      name: "Test Team",
      description: "A test team",
      memberAgentIds: [{ agentId: 1, role: "member" }],
      governanceMode: "sequential",
    });
    expect(result).toMatchObject({ success: true });
  });

  it("returns team list", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.team.list();
    expect(Array.isArray(result)).toBe(true);
  });
});

// ─── Execution tests ──────────────────────────────────────────────────────────
describe("execution", () => {
  it("lists executions", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.execution.list({ limit: 10 });
    expect(result).toBeDefined();
  });

  it("gets execution by id", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.execution.get({ id: 1 });
    expect(result).toMatchObject({ id: 1, status: "completed" });
  });
});

// ─── Governance tests ─────────────────────────────────────────────────────────
describe("governance", () => {
  it("returns governance settings", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.governance.get();
    expect(result).toMatchObject({ globalConfidenceThreshold: 0.75 });
  });

  it("updates governance settings", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.governance.update({ globalConfidenceThreshold: 0.9 });
    expect(result.success).toBe(true);
  });
});

// ─── Audit tests ──────────────────────────────────────────────────────────────
describe("audit", () => {
  it("returns audit log list", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.audit.list({ limit: 10 });
    expect(result).toBeDefined();
  });
});

// ─── Dashboard tests ──────────────────────────────────────────────────────────
describe("dashboard", () => {
  it("returns dashboard stats", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.dashboard.stats();
    expect(result).toMatchObject({ totalAgents: 0, totalTeams: 0 });
  });
});

// ─── Billing tests ────────────────────────────────────────────────────────────
describe("billing", () => {
  it("returns available plans", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.billing.getPlans();
    expect(Array.isArray(result)).toBe(true);
    expect(result.length).toBeGreaterThan(0);
  });

  it("returns subscription (null for new user)", async () => {
    const ctx = makeCtx();
    const caller = appRouter.createCaller(ctx);
    const result = await caller.billing.getSubscription();
    expect(result).toBeDefined();
  });
});
