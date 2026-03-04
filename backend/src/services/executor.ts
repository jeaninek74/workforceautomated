import { db } from "../db/index.js";
import { executions, agents, teams, governanceSettings } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { runAgentTask, extractTextFromFile } from "./llm.js";
import { fetchIntegrationData } from "./integrations.js";
import { logAudit } from "./audit.js";

interface ExecutionInput {
  agentId?: number;
  teamId?: number;
  input: string;
  type: string;
  outputFormat?: string;
  // File attachments: array of { path, mimeType, originalName }
  files?: Array<{ path: string; mimeType: string; originalName: string }>;
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

    // Pull live data from connected integrations (if agent has any assigned)
    let integrationContext = "";
    if (input.agentId) {
      try {
        const connectorResults = await fetchIntegrationData(input.agentId);
        if (connectorResults.length > 0) {
          const parts: string[] = [];
          for (const result of connectorResults) {
            if (result.error) {
              parts.push(`--- Integration: ${result.integrationName} (${result.type}) ---\nError fetching data: ${result.error}`);
            } else {
              parts.push(`--- Integration: ${result.integrationName} (${result.type}) ---\n${result.data}`);
            }
          }
          integrationContext = parts.join("\n\n");
        }
      } catch (err: any) {
        console.error("[Executor] Failed to fetch integration data:", err.message);
      }
    }

    // Extract text from any uploaded files
    let fileContext = "";
    if (input.files && input.files.length > 0) {
      const fileTexts: string[] = [];
      for (const file of input.files) {
        try {
          const text = await extractTextFromFile(file.path, file.mimeType);
          fileTexts.push(`--- File: ${file.originalName} ---\n${text}`);
        } catch (err: any) {
          fileTexts.push(`--- File: ${file.originalName} ---\n(Could not extract text: ${err.message})`);
        }
      }
      fileContext = fileTexts.join("\n\n");
    }

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

      // Combine file context and integration context
      const combinedContext = [integrationContext, fileContext].filter(Boolean).join("\n\n") || undefined;

      const result = await runAgentTask(
        systemPrompt,
        input.input,
        input.outputFormat,
        combinedContext
      );

      output = result.output;
      confidenceScore = result.confidenceScore;
      riskLevel = result.riskLevel;
      tokenCount = result.tokenCount;

      const agentThreshold = agent.escalationThreshold || escalationThreshold;
      if (
        confidenceScore < agentThreshold ||
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
      let agentsRun = 0;

      for (const agentId of memberIds) {
        const [agent] = await db
          .select()
          .from(agents)
          .where(eq(agents.id, agentId))
          .limit(1);
        if (!agent) continue;

        // Each agent in the team gets the previous agent's output as context
        const systemPrompt =
          agent.systemPrompt ||
          `You are ${agent.name}, role: ${agent.role}. ${agent.description || ""}`;

        const contextualInput = teamOutput
          ? `Previous agent output:\n${teamOutput}\n\n---\nYour task: ${input.input}`
          : input.input;

        const result = await runAgentTask(
          systemPrompt,
          contextualInput,
          input.outputFormat,
          agentsRun === 0 ? (fileContext || undefined) : undefined // Only first agent gets raw file
        );

        teamOutput += `\n\n[${agent.name}]:\n${result.output}`;
        totalConf += result.confidenceScore;
        tokenCount += result.tokenCount;
        agentsRun++;

        if (result.riskLevel === "critical" || result.riskLevel === "high") {
          riskLevel = result.riskLevel;
        }

        await db
          .update(agents)
          .set({
            lastExecutedAt: new Date(),
            totalExecutions: (agent.totalExecutions || 0) + 1,
            avgConfidence: agent.avgConfidence
              ? (agent.avgConfidence + result.confidenceScore) / 2
              : result.confidenceScore,
          })
          .where(eq(agents.id, agentId));
      }

      output = teamOutput.trim();
      confidenceScore = agentsRun > 0 ? totalConf / agentsRun : 0.75;

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
        metadata: {
          outputFormat: input.outputFormat || null,
          filesAttached: input.files?.length || 0,
          fileNames: input.files?.map((f) => f.originalName) || [],
        },
      })
      .where(eq(executions.id, executionId));

    await logAudit({
      userId,
      executionId,
      agentId: input.agentId,
      action: escalated ? "execution.escalated" : "execution.completed",
      entityType: "execution",
      entityId: String(executionId),
      details: {
        confidenceScore,
        riskLevel,
        processingTimeMs,
        escalated,
        filesAttached: input.files?.length || 0,
        outputFormat: input.outputFormat || null,
      },
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
