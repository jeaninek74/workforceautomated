import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

export async function generateAgentFromJobDescription(jobDescription: string) {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content: "You are an AI agent configuration expert. Convert job descriptions into AI agent configurations. Return a JSON object with: name, description, role, capabilities (string[]), permissions (string[]), systemPrompt, connectorType (readonly|overlay|write_back), confidenceThreshold (0.6-0.9), escalationThreshold (0.4-0.7)",
      },
      { role: "user", content: `Convert this job description to an AI agent configuration:\n\n${jobDescription}` },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
  });
  const content = response.choices[0]?.message?.content || "{}";
  return JSON.parse(content);
}

export async function runAgentTask(
  systemPrompt: string,
  input: string
): Promise<{
  output: string;
  confidenceScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  tokenCount: number;
}> {
  const openai = getOpenAI();
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          systemPrompt +
          '\n\nAfter completing the task, append a JSON block at the very end: {"confidence": 0.0-1.0, "risk": "low|medium|high|critical"}',
      },
      { role: "user", content: input },
    ],
    temperature: 0.2,
    max_tokens: 2000,
  });
  const raw = response.choices[0]?.message?.content || "";
  const tokenCount = response.usage?.total_tokens || 0;
  const jsonMatch = raw.match(/\{[^{}]*"confidence"[^{}]*\}/);
  let confidenceScore = 0.75;
  let riskLevel: "low" | "medium" | "high" | "critical" = "low";
  let output = raw;
  if (jsonMatch) {
    try {
      const meta = JSON.parse(jsonMatch[0]);
      confidenceScore = meta.confidence || 0.75;
      riskLevel = meta.risk || "low";
      output = raw.replace(jsonMatch[0], "").trim();
    } catch {}
  }
  if (confidenceScore < 0.4) riskLevel = "critical";
  else if (confidenceScore < 0.6) riskLevel = "high";
  else if (confidenceScore < 0.75) riskLevel = "medium";
  return { output, confidenceScore, riskLevel, tokenCount };
}
