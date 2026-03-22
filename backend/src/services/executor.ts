import { db } from "../db/index.js";
import { executions, agents, teams, governanceSettings, users } from "../db/schema.js";
import { eq } from "drizzle-orm";
import { runAgentTask, extractTextFromFile } from "./llm.js";
import { fetchIntegrationData } from "./integrations.js";
import { logAudit } from "./audit.js";
import { sendEscalationNotification } from "./notifications.js";

interface ExecutionInput {
  agentId?: number;
  teamId?: number;
  input: string;
  type: string;
  outputFormat?: string;
  userOutputPreferences?: string;
  files?: Array<{ path: string; mimeType: string; originalName: string }>;
}

interface AgentResult {
  agentId: number;
  agentName: string;
  output: string;
  confidenceScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  tokenCount: number;
  messages?: AgentMessage[];
}

interface AgentMessage {
  fromAgentId: number;
  fromAgentName: string;
  toAgentId: number;
  toAgentName: string;
  message: string;
  timestamp: string;
}

interface BranchingRule {
  condition: string; // e.g. "riskLevel=high", "confidence<0.6", "output_contains:ESCALATE"
  fromAgentId: number;
  toAgentId: number;
  elseAgentId?: number;
}

// ─── helpers ────────────────────────────────────────────────────────────────

function evaluateBranchCondition(
  condition: string,
  result: AgentResult
): boolean {
  const c = condition.trim().toLowerCase();
  if (c.startsWith("risklevel=")) {
    const level = c.split("=")[1];
    return result.riskLevel === level;
  }
  if (c.startsWith("confidence<")) {
    const threshold = parseFloat(c.split("<")[1]);
    return result.confidenceScore < threshold;
  }
  if (c.startsWith("confidence>")) {
    const threshold = parseFloat(c.split(">")[1]);
    return result.confidenceScore > threshold;
  }
  if (c.startsWith("output_contains:")) {
    const keyword = condition.split(":")[1].trim();
    return result.output.toLowerCase().includes(keyword.toLowerCase());
  }
  return false;
}

async function runSingleAgent(
  agentId: number,
  taskInput: string,
  outputFormat: string | undefined,
  fileContext: string | undefined,
  priorMessages: AgentMessage[]
): Promise<AgentResult> {
  const [agent] = await db.select().from(agents).where(eq(agents.id, agentId)).limit(1);
  if (!agent) throw new Error(`Agent ${agentId} not found`);

  const systemPrompt =
    agent.systemPrompt ||
    `You are ${agent.name}, an AI agent with role: ${agent.role}. ${agent.description || ""}`;

  // Inject prior agent messages as context
  let contextualInput = taskInput;
  if (priorMessages.length > 0) {
    const msgContext = priorMessages
      .map((m) => `[Message from ${m.fromAgentName} to ${m.toAgentName}]: ${m.message}`)
      .join("\n");
    contextualInput = `Agent communications so far:\n${msgContext}\n\n---\nYour task: ${taskInput}`;
  }

  const result = await runAgentTask(systemPrompt, contextualInput, outputFormat, fileContext);

  await db.update(agents).set({
    lastExecutedAt: new Date(),
    totalExecutions: (agent.totalExecutions || 0) + 1,
    avgConfidence: agent.avgConfidence
      ? (agent.avgConfidence + result.confidenceScore) / 2
      : result.confidenceScore,
  }).where(eq(agents.id, agentId));

  return {
    agentId,
    agentName: agent.name,
    output: result.output,
    confidenceScore: result.confidenceScore,
    riskLevel: result.riskLevel,
    tokenCount: result.tokenCount,
    messages: [],
  };
}

// ─── execution modes ─────────────────────────────────────────────────────────

async function runSequential(
  memberIds: number[],
  taskInput: string,
  outputFormat: string | undefined,
  fileContext: string | undefined
): Promise<{ output: string; results: AgentResult[]; messages: AgentMessage[] }> {
  const results: AgentResult[] = [];
  const allMessages: AgentMessage[] = [];
  let runningContext = "";

  for (let i = 0; i < memberIds.length; i++) {
    const agentId = memberIds[i];
    const contextInput = runningContext
      ? `Previous agent output:\n${runningContext}\n\n---\nYour task: ${taskInput}`
      : taskInput;

    const result = await runSingleAgent(
      agentId,
      contextInput,
      outputFormat,
      i === 0 ? fileContext : undefined,
      allMessages
    );
    results.push(result);
    runningContext += `\n\n[${result.agentName}]:\n${result.output}`;

    // Simulate agent-to-agent message: each agent sends a handoff note to the next
    if (i < memberIds.length - 1) {
      const nextAgentId = memberIds[i + 1];
      const [nextAgent] = await db.select().from(agents).where(eq(agents.id, nextAgentId)).limit(1);
      if (nextAgent) {
        const handoffMessage: AgentMessage = {
          fromAgentId: agentId,
          fromAgentName: result.agentName,
          toAgentId: nextAgentId,
          toAgentName: nextAgent.name,
          message: `Handoff from ${result.agentName}: Confidence ${(result.confidenceScore * 100).toFixed(0)}%, Risk: ${result.riskLevel}. Key finding: ${result.output.slice(0, 200)}...`,
          timestamp: new Date().toISOString(),
        };
        allMessages.push(handoffMessage);
      }
    }
  }

  const combinedOutput = results.map((r) => `[${r.agentName}]:\n${r.output}`).join("\n\n");
  return { output: combinedOutput, results, messages: allMessages };
}

async function runParallel(
  memberIds: number[],
  taskInput: string,
  outputFormat: string | undefined,
  fileContext: string | undefined
): Promise<{ output: string; results: AgentResult[]; messages: AgentMessage[] }> {
  // All agents run simultaneously on the same task
  const promises = memberIds.map((agentId) =>
    runSingleAgent(agentId, taskInput, outputFormat, fileContext, [])
  );
  const results = await Promise.all(promises);

  // After parallel run, generate cross-agent messages summarising each agent's findings
  const allMessages: AgentMessage[] = [];
  for (let i = 0; i < results.length; i++) {
    for (let j = 0; j < results.length; j++) {
      if (i === j) continue;
      allMessages.push({
        fromAgentId: results[i].agentId,
        fromAgentName: results[i].agentName,
        toAgentId: results[j].agentId,
        toAgentName: results[j].agentName,
        message: `Parallel result from ${results[i].agentName}: Confidence ${(results[i].confidenceScore * 100).toFixed(0)}%, Risk: ${results[i].riskLevel}.`,
        timestamp: new Date().toISOString(),
      });
    }
  }

  // Merge: synthesise a combined output
  const individualOutputs = results.map((r) => `[${r.agentName}]:\n${r.output}`).join("\n\n");
  const mergedOutput = `=== Parallel Execution Results ===\n\n${individualOutputs}\n\n=== Synthesis ===\nAll ${results.length} agents completed simultaneously. Average confidence: ${(results.reduce((s, r) => s + r.confidenceScore, 0) / results.length * 100).toFixed(0)}%.`;

  return { output: mergedOutput, results, messages: allMessages };
}

async function runConditional(
  memberIds: number[],
  branchingRules: BranchingRule[],
  taskInput: string,
  outputFormat: string | undefined,
  fileContext: string | undefined
): Promise<{ output: string; results: AgentResult[]; messages: AgentMessage[] }> {
  const results: AgentResult[] = [];
  const allMessages: AgentMessage[] = [];
  const executedIds = new Set<number>();

  // Start with the first agent
  let currentAgentId = memberIds[0];

  while (currentAgentId && !executedIds.has(currentAgentId)) {
    executedIds.add(currentAgentId);

    const contextInput = results.length > 0
      ? `Previous agent output:\n${results[results.length - 1].output}\n\n---\nYour task: ${taskInput}`
      : taskInput;

    const result = await runSingleAgent(
      currentAgentId,
      contextInput,
      outputFormat,
      results.length === 0 ? fileContext : undefined,
      allMessages
    );
    results.push(result);

    // Evaluate branching rules for this agent's output
    const applicableRule = branchingRules.find((r) => r.fromAgentId === currentAgentId);
    let nextAgentId: number | undefined;

    if (applicableRule) {
      const conditionMet = evaluateBranchCondition(applicableRule.condition, result);
      nextAgentId = conditionMet ? applicableRule.toAgentId : applicableRule.elseAgentId;

      // Log the branching decision as an agent message
      const branchTarget = conditionMet ? applicableRule.toAgentId : applicableRule.elseAgentId;
      if (branchTarget) {
        const [targetAgent] = await db.select().from(agents).where(eq(agents.id, branchTarget)).limit(1);
        if (targetAgent) {
          allMessages.push({
            fromAgentId: currentAgentId,
            fromAgentName: result.agentName,
            toAgentId: branchTarget,
            toAgentName: targetAgent.name,
            message: `Branch decision: condition "${applicableRule.condition}" was ${conditionMet ? "MET" : "NOT MET"}. Routing to ${targetAgent.name}.`,
            timestamp: new Date().toISOString(),
          });
        }
      }
    } else {
      // No rule — follow default sequential order
      const currentIndex = memberIds.indexOf(currentAgentId);
      nextAgentId = currentIndex < memberIds.length - 1 ? memberIds[currentIndex + 1] : undefined;
    }

    currentAgentId = nextAgentId as number;
  }

  const combinedOutput = results.map((r) => `[${r.agentName}]:\n${r.output}`).join("\n\n");
  return { output: combinedOutput, results, messages: allMessages };
}

// ─── main entry point ─────────────────────────────────────────────────────────

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

    // Fetch user's saved output preferences
    const [userRow] = await db
      .select({ outputPreferences: users.outputPreferences })
      .from(users)
      .where(eq(users.id, userId))
      .limit(1);
    const userOutputPreferences = input.userOutputPreferences || userRow?.outputPreferences || undefined;

    // Pull live data from connected integrations
    let integrationContext = "";
    if (input.agentId) {
      try {
        const connectorResults = await fetchIntegrationData(input.agentId);
        if (connectorResults.length > 0) {
          const parts: string[] = [];
          for (const result of connectorResults) {
            if (result.error) {
              parts.push(`--- Integration: ${result.integrationName} (${result.type}) ---\nError: ${result.error}`);
            } else {
              parts.push(`--- Integration: ${result.integrationName} (${result.type}) ---\n${result.data}`);
            }
          }
          integrationContext = parts.join("\n\n");
        }
      } catch (err: any) {
        console.error("[Executor] Integration fetch error:", err.message);
      }
    }

    // Extract text from uploaded files
    let fileContext = "";
    if (input.files && input.files.length > 0) {
      const fileTexts: string[] = [];
      for (const file of input.files) {
        try {
          const text = await extractTextFromFile(file.path, file.mimeType);
          fileTexts.push(`--- File: ${file.originalName} ---\n${text}`);
        } catch (err: any) {
          fileTexts.push(`--- File: ${file.originalName} ---\n(Could not extract: ${err.message})`);
        }
      }
      fileContext = fileTexts.join("\n\n");
    }

    const combinedFileContext = [integrationContext, fileContext].filter(Boolean).join("\n\n") || undefined;

    let output = "";
    let confidenceScore = 0.75;
    let riskLevel: "low" | "medium" | "high" | "critical" = "low";
    let tokenCount = 0;
    let escalated = false;
    let escalationReason = "";
    let agentMessages: AgentMessage[] = [];
    let teamResultsForMeta: AgentResult[] = [];

    // Build the effective output format: combine outputFormat + user preferences
    const effectiveOutputFormat = [
      input.outputFormat,
      userOutputPreferences ? `User output preferences: ${userOutputPreferences}` : undefined,
    ].filter(Boolean).join(" | ") || undefined;

    // ── Single agent ──
    if (input.agentId) {
      const result = await runSingleAgent(
        input.agentId,
        input.input,
        effectiveOutputFormat,
        combinedFileContext,
        []
      );
      output = result.output;
      confidenceScore = result.confidenceScore;
      riskLevel = result.riskLevel;
      tokenCount = result.tokenCount;

      const [agent] = await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1);
      const agentThreshold = agent?.escalationThreshold || escalationThreshold;
      if (confidenceScore < agentThreshold || riskLevel === "critical" || riskLevel === "high") {
        escalated = true;
        escalationReason = `Confidence ${(confidenceScore * 100).toFixed(0)}% below threshold or risk level ${riskLevel}`;
      }

    // ── Team execution ──
    } else if (input.teamId) {
      const [team] = await db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1);
      if (!team) throw new Error("Team not found");

      const memberIds = (team.executionOrder || team.memberAgentIds || []) as number[];
      if (memberIds.length === 0) throw new Error("Team has no agents");

      const mode = (team as any).executionMode || "sequential";
      const branchingRules = ((team as any).branchingRules || []) as BranchingRule[];

      let teamResult: { output: string; results: AgentResult[]; messages: AgentMessage[] };
       if (mode === "parallel") {
        teamResult = await runParallel(memberIds, input.input, effectiveOutputFormat, combinedFileContext);
      } else if (mode === "conditional") {
        teamResult = await runConditional(memberIds, branchingRules, input.input, effectiveOutputFormat, combinedFileContext);
      } else {
        teamResult = await runSequential(memberIds, input.input, effectiveOutputFormat, combinedFileContext);
      }

      output = teamResult.output;
      agentMessages = teamResult.messages;
      teamResultsForMeta = teamResult.results;
      tokenCount = teamResult.results.reduce((s, r) => s + r.tokenCount, 0);

      const avgConf = teamResult.results.length > 0
        ? teamResult.results.reduce((s, r) => s + r.confidenceScore, 0) / teamResult.results.length
        : 0.75;
      confidenceScore = avgConf;

      const highestRisk = teamResult.results.reduce((worst, r) => {
        const order = ["low", "medium", "high", "critical"];
        return order.indexOf(r.riskLevel) > order.indexOf(worst) ? r.riskLevel : worst;
      }, "low" as "low" | "medium" | "high" | "critical");
      riskLevel = highestRisk;

      if (confidenceScore < escalationThreshold || riskLevel === "critical" || riskLevel === "high") {
        escalated = true;
        escalationReason = `Team ${mode} execution: avg confidence ${(confidenceScore * 100).toFixed(0)}% or risk ${riskLevel}`;
      }

      await db.update(teams).set({
        totalExecutions: (team.totalExecutions || 0) + 1,
        updatedAt: new Date(),
      }).where(eq(teams.id, input.teamId));
    }

    const processingTimeMs = Date.now() - startTime;

    await db.update(executions).set({
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
        agentMessages,
        executionMode: input.teamId ? "team" : "single",
        agentResults: teamResultsForMeta.length > 0
          ? teamResultsForMeta.map((r) => ({
              agentId: r.agentId,
              agentName: r.agentName,
              confidenceScore: r.confidenceScore,
              riskLevel: r.riskLevel,
              tokenCount: r.tokenCount,
              outputSnippet: r.output?.slice(0, 300),
            }))
          : null,
      },
    }).where(eq(executions.id, executionId));

    // Send escalation notifications if needed
    if (escalated) {
      const [agentRow] = input.agentId
        ? await db.select().from(agents).where(eq(agents.id, input.agentId)).limit(1)
        : [null];
      const [teamRow] = input.teamId
        ? await db.select().from(teams).where(eq(teams.id, input.teamId)).limit(1)
        : [null];
      sendEscalationNotification({
        userId,
        executionId,
        agentName: agentRow?.name,
        teamName: (teamRow as any)?.name,
        taskInput: input.input,
        escalationReason,
        confidenceScore,
        riskLevel,
        output: output?.slice(0, 800),
      }).catch((e) => console.error("[Executor] Notification error:", e.message));
    }

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
        agentMessageCount: agentMessages.length,
      },
    });

  } catch (err: any) {
    await db.update(executions).set({
      status: "failed",
      output: err.message,
      processingTimeMs: Date.now() - startTime,
      completedAt: new Date(),
    }).where(eq(executions.id, executionId));
  }
}
