import Stripe from "stripe";
import { z } from "zod";
import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { invokeLLM } from "./_core/llm";
import {
  createAgent, getAgentsByUser, getAgentById, updateAgent, deleteAgent, incrementAgentExecutions,
  createTeam, getTeamsByUser, getTeamById, updateTeam, deleteTeam, getTeamMembers, upsertTeamMembers,
  createExecution, getExecutionById, updateExecution, getExecutionsByUser,
  createAuditLog, getAuditLogs,
  getGovernanceSettings, upsertGovernanceSettings,
  getSubscriptionByUser, upsertSubscription, getSubscriptionByCustomerId,
} from "./db";
import { PLANS, PLAN_ORDER } from "./products";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", { apiVersion: "2026-02-25.clover" });

function classifyRisk(confidence: number): "low" | "medium" | "high" | "critical" {
  if (confidence >= 0.85) return "low";
  if (confidence >= 0.70) return "medium";
  if (confidence >= 0.50) return "high";
  return "critical";
}

const agentRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => getAgentsByUser(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const agent = await getAgentById(input.id, ctx.user.id);
      if (!agent) throw new Error("Agent not found");
      return agent;
    }),

  fromJobDescription: protectedProcedure
    .input(z.object({ jobDescription: z.string().min(50) }))
    .mutation(async ({ ctx, input }) => {
      const response = await invokeLLM({
        messages: [
          { role: "system", content: `You are an AI agent configuration expert. Given a job description, return JSON with: name, role, description, capabilities (array), permissions (array), systemPrompt, confidenceThreshold (0-1), riskThreshold (low/medium/high/critical).` },
          { role: "user", content: `Job Description:\n\n${input.jobDescription}` },
        ],
        response_format: {
          type: "json_schema",
          json_schema: {
            name: "agent_config", strict: true,
            schema: {
              type: "object",
              properties: {
                name: { type: "string" }, role: { type: "string" }, description: { type: "string" },
                capabilities: { type: "array", items: { type: "string" } },
                permissions: { type: "array", items: { type: "string" } },
                systemPrompt: { type: "string" },
                confidenceThreshold: { type: "number" },
                riskThreshold: { type: "string", enum: ["low", "medium", "high", "critical"] },
              },
              required: ["name", "role", "description", "capabilities", "permissions", "systemPrompt", "confidenceThreshold", "riskThreshold"],
              additionalProperties: false,
            },
          },
        },
      });
      const content = response.choices[0]?.message?.content as string | undefined;
      if (!content) throw new Error("Failed to generate agent configuration");
      return JSON.parse(content);
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1), role: z.string().min(1),
      description: z.string().optional(),
      capabilities: z.array(z.string()).optional(),
      permissions: z.array(z.string()).optional(),
      systemPrompt: z.string().optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
      riskThreshold: z.enum(["low", "medium", "high", "critical"]).optional(),
      sourceType: z.enum(["job_description", "manual"]).optional(),
      sourceJobDescription: z.string().optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      await createAgent({ userId: ctx.user.id, ...input, confidenceThreshold: input.confidenceThreshold ?? 0.75, riskThreshold: input.riskThreshold ?? "medium", sourceType: input.sourceType ?? "manual", status: "active" });
      await createAuditLog({ userId: ctx.user.id, action: `Created agent: ${input.name}`, category: "agent", details: { name: input.name, role: input.role } });
      return { success: true };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(), name: z.string().min(1).optional(), role: z.string().min(1).optional(),
      description: z.string().optional(), capabilities: z.array(z.string()).optional(),
      permissions: z.array(z.string()).optional(), systemPrompt: z.string().optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
      riskThreshold: z.enum(["low", "medium", "high", "critical"]).optional(),
      status: z.enum(["active", "inactive", "draft"]).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;
      await updateAgent(id, ctx.user.id, data);
      await createAuditLog({ userId: ctx.user.id, action: `Updated agent #${id}`, category: "agent", details: { id } });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteAgent(input.id, ctx.user.id);
      await createAuditLog({ userId: ctx.user.id, action: `Deleted agent #${input.id}`, category: "agent", details: { id: input.id } });
      return { success: true };
    }),
});

const teamRouter = router({
  list: protectedProcedure.query(async ({ ctx }) => getTeamsByUser(ctx.user.id)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const team = await getTeamById(input.id, ctx.user.id);
      if (!team) throw new Error("Team not found");
      const members = await getTeamMembers(input.id);
      return { ...team, members };
    }),

  create: protectedProcedure
    .input(z.object({
      name: z.string().min(1), description: z.string().optional(),
      governanceMode: z.enum(["sequential", "parallel", "conditional"]).optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
      riskThreshold: z.enum(["low", "medium", "high", "critical"]).optional(),
      memberAgentIds: z.array(z.object({ agentId: z.number(), role: z.enum(["lead", "member", "reviewer"]).optional() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const result = await createTeam({ userId: ctx.user.id, name: input.name, description: input.description, governanceMode: input.governanceMode ?? "sequential", confidenceThreshold: input.confidenceThreshold ?? 0.75, riskThreshold: input.riskThreshold ?? "medium", status: "active" });
      const insertId = (result as any)[0]?.insertId ?? (result as any).insertId;
      if (insertId && input.memberAgentIds?.length) {
        await upsertTeamMembers(insertId, input.memberAgentIds.map((m, i) => ({ teamId: insertId, agentId: m.agentId, executionOrder: i, role: m.role ?? "member" })));
      }
      await createAuditLog({ userId: ctx.user.id, action: `Created team: ${input.name}`, category: "team", details: { name: input.name } });
      return { success: true, id: insertId };
    }),

  update: protectedProcedure
    .input(z.object({
      id: z.number(), name: z.string().optional(), description: z.string().optional(),
      governanceMode: z.enum(["sequential", "parallel", "conditional"]).optional(),
      confidenceThreshold: z.number().min(0).max(1).optional(),
      riskThreshold: z.enum(["low", "medium", "high", "critical"]).optional(),
      status: z.enum(["active", "inactive", "draft"]).optional(),
      memberAgentIds: z.array(z.object({ agentId: z.number(), role: z.enum(["lead", "member", "reviewer"]).optional() })).optional(),
    }))
    .mutation(async ({ ctx, input }) => {
      const { id, memberAgentIds, ...data } = input;
      await updateTeam(id, ctx.user.id, data);
      if (memberAgentIds) await upsertTeamMembers(id, memberAgentIds.map((m, i) => ({ teamId: id, agentId: m.agentId, executionOrder: i, role: m.role ?? "member" })));
      await createAuditLog({ userId: ctx.user.id, action: `Updated team #${id}`, category: "team", details: { id } });
      return { success: true };
    }),

  delete: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await deleteTeam(input.id, ctx.user.id);
      await createAuditLog({ userId: ctx.user.id, action: `Deleted team #${input.id}`, category: "team", details: { id: input.id } });
      return { success: true };
    }),
});

const executionRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional() }).optional())
    .query(async ({ ctx, input }) => getExecutionsByUser(ctx.user.id, input?.limit ?? 50)),

  get: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const exec = await getExecutionById(input.id, ctx.user.id);
      if (!exec) throw new Error("Execution not found");
      return exec;
    }),

  runAgent: protectedProcedure
    .input(z.object({ agentId: z.number(), input: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const agent = await getAgentById(input.agentId, ctx.user.id);
      if (!agent) throw new Error("Agent not found");
      const govSettings = await getGovernanceSettings(ctx.user.id);
      const confThreshold = agent.confidenceThreshold ?? govSettings?.globalConfidenceThreshold ?? 0.75;
      const execResult = await createExecution({ userId: ctx.user.id, agentId: input.agentId, type: "single", status: "running", input: input.input, startedAt: new Date() });
      const startTime = Date.now();
      const steps: any[] = [];
      try {
        const systemPrompt = agent.systemPrompt || `You are ${agent.name}, an AI agent with role: ${agent.role}. ${agent.description || ""}. Capabilities: ${(agent.capabilities || []).join(", ")}. Return JSON with output, confidence (0-1), reasoning, actions_taken (array).`;
        const llmResponse = await invokeLLM({
          messages: [{ role: "system", content: systemPrompt }, { role: "user", content: input.input as string }],
          response_format: { type: "json_schema", json_schema: { name: "agent_response", strict: true, schema: { type: "object", properties: { output: { type: "string" }, confidence: { type: "number" }, reasoning: { type: "string" }, actions_taken: { type: "array", items: { type: "string" } } }, required: ["output", "confidence", "reasoning", "actions_taken"], additionalProperties: false } } },
        });
        const content = llmResponse.choices[0]?.message?.content as string | undefined;
        if (!content) throw new Error("No response from agent");
        const agentResult = JSON.parse(content);
        const confidence = Math.min(1, Math.max(0, agentResult.confidence ?? 0.75));
        const riskLevel = classifyRisk(confidence);
        const escalated = confidence < confThreshold;
        const duration = Date.now() - startTime;
        steps.push({ stepId: "execute", agentId: input.agentId, agentName: agent.name, action: "Agent execution", input: input.input, output: agentResult.output, confidenceScore: confidence, riskLevel, status: escalated ? "escalated" : "completed", startedAt: startTime, completedAt: Date.now(), durationMs: duration });
        const finalStatus = escalated ? "escalated" : "completed";
        const execId = (execResult as any)[0]?.insertId ?? 0;
        await updateExecution(execId, { status: finalStatus, output: agentResult.output, confidenceScore: confidence, riskLevel, escalated, escalationReason: escalated ? `Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(confThreshold * 100).toFixed(1)}%` : undefined, steps, completedAt: new Date(), durationMs: duration });
        await incrementAgentExecutions(input.agentId, confidence);
        await createAuditLog({ userId: ctx.user.id, agentId: input.agentId, executionId: execId, action: `Agent execution: ${agent.name}`, category: "execution", details: { agentId: input.agentId, confidence, riskLevel, escalated, duration }, confidenceScore: confidence, riskLevel });
        return { executionId: execId, status: finalStatus, output: agentResult.output, confidence, riskLevel, escalated, escalationReason: escalated ? `Confidence ${(confidence * 100).toFixed(1)}% below threshold ${(confThreshold * 100).toFixed(1)}%` : undefined, reasoning: agentResult.reasoning, actionsTaken: agentResult.actions_taken, durationMs: duration, steps };
      } catch (err: any) {
        const execId = (execResult as any)[0]?.insertId ?? 0;
        await updateExecution(execId, { status: "failed", steps, completedAt: new Date(), durationMs: Date.now() - startTime });
        throw err;
      }
    }),

  runTeam: protectedProcedure
    .input(z.object({ teamId: z.number(), input: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const team = await getTeamById(input.teamId, ctx.user.id);
      if (!team) throw new Error("Team not found");
      const members = await getTeamMembers(input.teamId);
      if (!members.length) throw new Error("Team has no members");
      const govSettings = await getGovernanceSettings(ctx.user.id);
      const confThreshold = team.confidenceThreshold ?? govSettings?.globalConfidenceThreshold ?? 0.75;
      const execResult = await createExecution({ userId: ctx.user.id, teamId: input.teamId, type: "team", status: "running", input: input.input, startedAt: new Date() });
      const startTime = Date.now();
      const steps: any[] = [];
      let currentInput = input.input;
      let overallConfidence = 1.0;
      let escalated = false;
      let escalationReason = "";
      for (const member of members) {
        const agent = await getAgentById(member.agentId, ctx.user.id);
        if (!agent) continue;
        const stepStart = Date.now();
        try {
          const systemPrompt = agent.systemPrompt || `You are ${agent.name}, role: ${agent.role}. Process the input and return JSON with output, confidence (0-1), and reasoning.`;
          const llmResponse = await invokeLLM({ messages: [{ role: "system", content: systemPrompt }, { role: "user", content: currentInput as string }], response_format: { type: "json_schema", json_schema: { name: "step_response", strict: true, schema: { type: "object", properties: { output: { type: "string" }, confidence: { type: "number" }, reasoning: { type: "string" } }, required: ["output", "confidence", "reasoning"], additionalProperties: false } } } });
          const content = llmResponse.choices[0]?.message?.content as string | undefined;
          if (!content) throw new Error("No response");
          const result = JSON.parse(content);
          const stepConf = Math.min(1, Math.max(0, result.confidence ?? 0.75));
          overallConfidence = Math.min(overallConfidence, stepConf);
          const stepRisk = classifyRisk(stepConf);
          const stepEscalated = stepConf < confThreshold;
          if (stepEscalated && !escalated) { escalated = true; escalationReason = `Agent ${agent.name} confidence ${(stepConf * 100).toFixed(1)}% below threshold`; }
          steps.push({ stepId: `step_${member.executionOrder}`, agentId: agent.id, agentName: agent.name, action: `${agent.role} processing`, input: currentInput, output: result.output, confidenceScore: stepConf, riskLevel: stepRisk, status: stepEscalated ? "escalated" : "completed", startedAt: stepStart, completedAt: Date.now(), durationMs: Date.now() - stepStart });
          currentInput = result.output;
        } catch (err: any) {
          steps.push({ stepId: `step_${member.executionOrder}`, agentId: agent.id, agentName: agent.name, action: `${agent.role} processing`, input: currentInput, status: "failed", startedAt: stepStart, completedAt: Date.now(), durationMs: Date.now() - stepStart });
          escalated = true; escalationReason = `Agent ${agent.name} failed: ${err.message}`;
        }
      }
      const finalRisk = classifyRisk(overallConfidence);
      const finalStatus = escalated ? "escalated" : "completed";
      const duration = Date.now() - startTime;
      const execId = (execResult as any)[0]?.insertId ?? 0;
      await updateExecution(execId, { status: finalStatus, output: currentInput, confidenceScore: overallConfidence, riskLevel: finalRisk, escalated, escalationReason: escalated ? escalationReason : undefined, steps, completedAt: new Date(), durationMs: duration });
      await createAuditLog({ userId: ctx.user.id, teamId: input.teamId, executionId: execId, action: `Team execution: ${team.name}`, category: "execution", details: { teamId: input.teamId, steps: steps.length, overallConfidence, escalated }, confidenceScore: overallConfidence, riskLevel: finalRisk });
      return { executionId: execId, status: finalStatus, output: currentInput, overallConfidence, riskLevel: finalRisk, escalated, escalationReason: escalated ? escalationReason : undefined, steps, durationMs: duration };
    }),

  resolveEscalation: protectedProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await updateExecution(input.id, { status: "completed", escalationResolvedAt: new Date(), escalationResolvedBy: ctx.user.id });
      await createAuditLog({ userId: ctx.user.id, executionId: input.id, action: `Resolved escalation #${input.id}`, category: "escalation", details: { executionId: input.id } });
      return { success: true };
    }),
});

const auditRouter = router({
  list: protectedProcedure
    .input(z.object({ limit: z.number().optional(), offset: z.number().optional(), category: z.string().optional(), search: z.string().optional() }).optional())
    .query(async ({ ctx, input }) => getAuditLogs(ctx.user.id, input ?? {})),
});

const governanceRouter = router({
  get: protectedProcedure.query(async ({ ctx }) => {
    const settings = await getGovernanceSettings(ctx.user.id);
    return settings ?? { globalConfidenceThreshold: 0.75, globalRiskThreshold: "medium", autoEscalate: true, escalateOnRiskLevels: ["high", "critical"], requireHumanApproval: false, maxConcurrentExecutions: 5, retentionDays: 90, notifyOnEscalation: true };
  }),
  update: protectedProcedure
    .input(z.object({ globalConfidenceThreshold: z.number().min(0).max(1).optional(), globalRiskThreshold: z.enum(["low", "medium", "high", "critical"]).optional(), autoEscalate: z.boolean().optional(), requireHumanApproval: z.boolean().optional(), maxConcurrentExecutions: z.number().min(1).max(50).optional(), retentionDays: z.number().min(7).max(365).optional(), notifyOnEscalation: z.boolean().optional() }))
    .mutation(async ({ ctx, input }) => {
      await upsertGovernanceSettings(ctx.user.id, input);
      await createAuditLog({ userId: ctx.user.id, action: "Updated governance settings", category: "governance", details: input });
      return { success: true };
    }),
});

const billingRouter = router({
  getSubscription: protectedProcedure.query(async ({ ctx }) => {
    const sub = await getSubscriptionByUser(ctx.user.id);
    return sub ?? { plan: "starter", status: "active" };
  }),
  getPlans: publicProcedure.query(() => PLAN_ORDER.map(tier => PLANS[tier])),
  createCheckoutSession: protectedProcedure
    .input(z.object({ plan: z.enum(["starter", "professional", "enterprise"]) }))
    .mutation(async ({ ctx, input }) => {
      const planConfig = PLANS[input.plan];
      let customerId: string | undefined;
      const existingSub = await getSubscriptionByUser(ctx.user.id);
      if (existingSub?.stripeCustomerId) { customerId = existingSub.stripeCustomerId; }
      else {
        const customer = await stripe.customers.create({ email: ctx.user.email ?? undefined, name: ctx.user.name ?? undefined, metadata: { userId: ctx.user.id.toString() } });
        customerId = customer.id;
        await upsertSubscription(ctx.user.id, { stripeCustomerId: customerId });
      }
      const origin = "https://workforceautomated.com";
      const session = await stripe.checkout.sessions.create({
        customer: customerId, payment_method_types: ["card"], mode: "subscription", allow_promotion_codes: true,
        line_items: [{ price_data: { currency: "usd", product_data: { name: `WorkforceAutomated ${planConfig.name}`, description: planConfig.description }, unit_amount: planConfig.price, recurring: { interval: planConfig.interval } }, quantity: 1 }],
        success_url: `${origin}/dashboard?upgraded=true`, cancel_url: `${origin}/billing`,
        client_reference_id: ctx.user.id.toString(),
        metadata: { user_id: ctx.user.id.toString(), plan: input.plan, customer_email: ctx.user.email ?? "", customer_name: ctx.user.name ?? "" },
      });
      await createAuditLog({ userId: ctx.user.id, action: `Initiated checkout for ${input.plan} plan`, category: "billing", details: { plan: input.plan } });
      return { url: session.url };
    }),
  createPortalSession: protectedProcedure.mutation(async ({ ctx }) => {
    const sub = await getSubscriptionByUser(ctx.user.id);
    if (!sub?.stripeCustomerId) throw new Error("No active subscription found");
    const session = await stripe.billingPortal.sessions.create({ customer: sub.stripeCustomerId, return_url: "https://workforceautomated.com/billing" });
    return { url: session.url };
  }),
});

const dashboardRouter = router({
  stats: protectedProcedure.query(async ({ ctx }) => {
    const [agents, teams, executions, auditResult] = await Promise.all([
      getAgentsByUser(ctx.user.id),
      getTeamsByUser(ctx.user.id),
      getExecutionsByUser(ctx.user.id, 100),
      getAuditLogs(ctx.user.id, { limit: 5 }),
    ]);
    const completedExecs = executions.filter(e => e.status === "completed");
    const escalatedExecs = executions.filter(e => e.escalated);
    const avgConfidence = completedExecs.length > 0 ? completedExecs.reduce((sum, e) => sum + (e.confidenceScore ?? 0), 0) / completedExecs.length : 0;
    const riskBreakdown = { low: executions.filter(e => e.riskLevel === "low").length, medium: executions.filter(e => e.riskLevel === "medium").length, high: executions.filter(e => e.riskLevel === "high").length, critical: executions.filter(e => e.riskLevel === "critical").length };
    return { totalAgents: agents.length, activeAgents: agents.filter(a => a.status === "active").length, totalTeams: teams.length, totalExecutions: executions.length, completedExecutions: completedExecs.length, escalatedExecutions: escalatedExecs.length, avgConfidenceScore: avgConfidence, riskBreakdown, recentAuditLogs: auditResult.logs, recentExecutions: executions.slice(0, 5) };
  }),
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),
  agent: agentRouter,
  team: teamRouter,
  execution: executionRouter,
  audit: auditRouter,
  governance: governanceRouter,
  billing: billingRouter,
  dashboard: dashboardRouter,
});

export type AppRouter = typeof appRouter;
