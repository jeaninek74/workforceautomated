import { db } from "../db/index.js";
import { executions, agents, teams, governanceSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { runAgentTask } from "./llm.js";
import { logAudit } from "./audit.js";

interface ExecutionInput {
  agentId?: number;
  teamId?: number;
  input: string;
  type: string;
}

export async function runAgentExecution(
  executionId: number,
  userId: number,
  input: ExecutionInput
) {
  const startTime = Date.now();
  try {
    await db.update(executions).set({ status: "running" }).where(eq(executions.id, executionId));
    const [govSettings] = await db
      .select()
      .from(governanceSettings)
      .where(eq(governanceSettings.userId, userId))
      .limit(1);
    const escalationThreshold = govSettings?.globalEscalationThreshold || 0.5;
    let output = "";
    let confidenceScore = 0.75;
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    let tokenCount = 0;
    let escalated = false;
    let escalationReason = "";

    if (input.agentId) {
      const [agent] = await db
        .select()
        .from(agents)
        .where(eq(agents.id, input.agentId))
        .limit(1);
      if (!agent) throw new Error("Agent not found");
      const systemPrompt =
        agent.systemPrompt ||
        `You are ${agent.name}, an AI agent with role: ${agent.role}. ${agent.description || ""}`;
      const result = await runAgentTask(systemPrompt, input.input);
      output = result.output;
      confidenceScore = result.confidenceScore;
      riskLevel = result.riskLevel;
      tokenCount = result.tokenCount;
      if (
        confidenceScore < escalationThreshold ||
        riskLevel === "critical" ||
        riskLevel === "high"
      ) {
        escalated = true;
        escalationReason = `Confidence ${(confidenceScore * 100).toFixed(0)}% below threshold or risk level ${riskLevel}`;
      }
      await db
        .update(agents)
        .set({
          lastExecutedAt: new Date(),
          totalExecutions: (agent.totalExecutions || 0) + 1,
          avgConfidence: agent.avgConfidence
            ? (agent.avgConfidence + confidenceScore) / 2
            : confidenceScore,
        })
        .where(eq(agents.id, input.agentId));
    } else if (input.teamId) {
      const [team] = await db
        .select()
        .from(teams)
        .where(eq(teams.id, input.teamId))
        .limit(1);
      if (!team) throw new Error("Team not found");
      const memberIds = (team.executionOrder || team.memberAgentIds || []) as number[];
      let teamOutput = "";
      let totalConf = 0;
      for (const agentId of memberIds) {
        const [agent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, agentId))
          .limit(1);
        if (!agent) continue;
        const systemPrompt =
          agent.systemPrompt ||
          `You are ${agent.name}, role: ${agent.role}. Previous context: ${teamOutput}`;
        const result = await runAgentTask(systemPrompt, input.input);
        teamOutput += `\n[${agent.name}]: ${result.output}`;
        totalConf += result.confidenceScore;
        tokenCount += result.tokenCount;
        if (result.riskLevel === "critical" || result.riskLevel === "high")
          riskLevel = result.riskLevel;
      }
      output = teamOutput;
      confidenceScore = memberIds.length > 0 ? totalConf / memberIds.length : 0.75;
      if (confidenceScore < escalationThreshold) {
        escalated = true;
        escalationReason = `Team average confidence ${(confidenceScore * 100).toFixed(0)}% below threshold`;
      }
    }

    const processingTimeMs = Date.now() - startTime;
    await db
      .update(executions)
      .set({
        status: escalated ? "escalated" : "success",
        output,
        confidenceScore,
        riskLevel,
        escalated,
        escalationReason: escalated ? escalationReason : null,
        processingTimeMs,
        tokenCount,
        completedAt: new Date(),
      })
      .where(eq(executions.id, executionId));
    await logAudit({
      userId,
      executionId,
      agentId: input.agentId,
      action: escalated ? "execution.escalated" : "execution.completed",
      entityType: "execution",
      entityId: String(executionId),
      details: { confidenceScore, riskLevel, processingTimeMs, escalated },
    });
  } catch (err: any) {
    await db
      .update(executions)
      .set({
        status: "failed",
        output: err.message,
        processingTimeMs: Date.now() - startTime,
        completedAt: new Date(),
      })
      .where(eq(executions.id, executionId));
  }
}
