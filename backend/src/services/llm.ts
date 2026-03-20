import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import * as fs from "fs";
import * as path from "path";
import csv from "csv-parser";
import * as XLSX from "xlsx";

// ─── AI Client ────────────────────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// ─── Agent Config Types ───────────────────────────────────────────────────────

interface AgentConfig {
  name: string;
  description: string;
  role: string;
  capabilities: string[];
  permissions: string[];
  systemPrompt: string;
  connectorType: "readonly" | "overlay" | "write_back";
  confidenceThreshold: number;
  escalationThreshold: number;
}

// ─── Domain Patterns ──────────────────────────────────────────────────────────

const DOMAIN_PATTERNS: Array<{
  keywords: string[];
  domain: string;
  capabilities: string[];
  permissions: string[];
  connectorType: "readonly" | "overlay" | "write_back";
  confidenceThreshold: number;
}> = [
  {
    keywords: ["financial", "finance", "revenue", "invoice", "accounting", "budget", "expense", "variance", "forecast", "balance sheet", "cash flow", "audit", "tax", "payroll"],
    domain: "Finance",
    capabilities: ["read_financial_data", "generate_variance_reports", "flag_anomalies", "calculate_metrics", "send_alerts"],
    permissions: ["read:financial_db", "read:invoices", "write:reports", "notify:finance_team"],
    connectorType: "readonly",
    confidenceThreshold: 0.85,
  },
  {
    keywords: ["compliance", "regulatory", "legal", "policy", "contract", "gdpr", "hipaa", "sox", "risk", "governance", "regulation", "law", "clause"],
    domain: "Legal & Compliance",
    capabilities: ["review_documents", "flag_compliance_issues", "generate_compliance_reports", "track_deadlines", "escalate_violations"],
    permissions: ["read:contracts", "read:policies", "write:compliance_reports", "notify:legal_team"],
    connectorType: "readonly",
    confidenceThreshold: 0.90,
  },
  {
    keywords: ["customer", "support", "ticket", "service", "helpdesk", "crm", "client", "satisfaction", "feedback", "resolution", "refund", "complaint"],
    domain: "Customer Success",
    capabilities: ["read_tickets", "classify_issues", "draft_responses", "escalate_critical_issues", "update_ticket_status"],
    permissions: ["read:crm", "write:ticket_responses", "notify:support_team", "read:customer_history"],
    connectorType: "overlay",
    confidenceThreshold: 0.75,
  },
  {
    keywords: ["hr", "human resources", "recruit", "hiring", "onboard", "employee", "performance", "leave", "benefit", "talent", "workforce", "staff", "personnel"],
    domain: "Human Resources",
    capabilities: ["screen_candidates", "generate_hr_reports", "track_onboarding", "monitor_performance", "flag_policy_violations"],
    permissions: ["read:hr_system", "read:employee_records", "write:hr_reports", "notify:hr_team"],
    connectorType: "readonly",
    confidenceThreshold: 0.80,
  },
  {
    keywords: ["sales", "pipeline", "lead", "opportunity", "quota", "prospect", "deal", "conversion", "account"],
    domain: "Sales Operations",
    capabilities: ["analyze_pipeline", "score_leads", "generate_sales_reports", "flag_at_risk_deals", "update_crm_records"],
    permissions: ["read:crm", "write:crm_updates", "read:sales_data", "notify:sales_team"],
    connectorType: "overlay",
    confidenceThreshold: 0.78,
  },
  {
    keywords: ["it", "infrastructure", "security", "network", "server", "cloud", "devops", "monitoring", "incident", "vulnerability", "patch", "cyber"],
    domain: "IT & Security",
    capabilities: ["monitor_systems", "detect_anomalies", "generate_incident_reports", "flag_security_threats", "track_vulnerabilities"],
    permissions: ["read:system_logs", "read:security_events", "write:incident_reports", "notify:security_team"],
    connectorType: "readonly",
    confidenceThreshold: 0.88,
  },
  {
    keywords: ["operations", "supply chain", "logistics", "inventory", "procurement", "vendor", "warehouse", "shipping", "order", "fulfillment", "workflow"],
    domain: "Operations",
    capabilities: ["monitor_operations", "track_inventory", "generate_ops_reports", "flag_bottlenecks", "update_status"],
    permissions: ["read:operations_db", "read:inventory", "write:ops_reports", "notify:ops_team"],
    connectorType: "overlay",
    confidenceThreshold: 0.80,
  },
  {
    keywords: ["marketing", "campaign", "content", "social media", "seo", "analytics", "brand", "email", "advertising", "engagement", "audience"],
    domain: "Marketing",
    capabilities: ["analyze_campaigns", "generate_performance_reports", "track_metrics", "flag_underperforming_campaigns", "draft_content_briefs"],
    permissions: ["read:marketing_analytics", "read:campaign_data", "write:marketing_reports", "notify:marketing_team"],
    connectorType: "readonly",
    confidenceThreshold: 0.75,
  },
];

function extractRoleName(text: string): string {
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  const firstLine = lines[0] || "";
  const cleaned = firstLine
    .replace(/^(job title|role|position|title|sop|standard operating procedure)[\s:–\-]*/i, "")
    .replace(/\s+/g, " ")
    .trim();
  if (cleaned.length > 3 && cleaned.length < 80) return cleaned;
  return "AI Process Agent";
}

function detectEscalation(text: string): number {
  const lower = text.toLowerCase();
  if (lower.includes("critical") || lower.includes("immediate") || lower.includes("cfo") || lower.includes("ceo") || lower.includes("board")) return 0.45;
  if (lower.includes("escalat") || lower.includes("approval required") || lower.includes("manager approval")) return 0.55;
  return 0.60;
}

function detectConnectorType(text: string): "readonly" | "overlay" | "write_back" {
  const lower = text.toLowerCase();
  if (lower.includes("write back") || lower.includes("write-back") || lower.includes("update record") || lower.includes("create record")) return "write_back";
  if (lower.includes("suggest") || lower.includes("recommend") || lower.includes("draft") || lower.includes("overlay")) return "overlay";
  return "readonly";
}

// ─── Agent Config Generation ──────────────────────────────────────────────────

export async function generateAgentFromJobDescription(jobDescription: string): Promise<AgentConfig> {
  const lower = jobDescription.toLowerCase();
  const roleName = extractRoleName(jobDescription);

  let bestMatch = DOMAIN_PATTERNS[6];
  let bestScore = 0;
  for (const pattern of DOMAIN_PATTERNS) {
    const score = pattern.keywords.filter((kw) => lower.includes(kw)).length;
    if (score > bestScore) { bestScore = score; bestMatch = pattern; }
  }

  const extraCapabilities: string[] = [];
  if (lower.includes("report")) extraCapabilities.push("generate_reports");
  if (lower.includes("monitor")) extraCapabilities.push("continuous_monitoring");
  if (lower.includes("alert") || lower.includes("notify")) extraCapabilities.push("send_notifications");
  if (lower.includes("analyz") || lower.includes("analysis")) extraCapabilities.push("data_analysis");
  if (lower.includes("review")) extraCapabilities.push("document_review");
  if (lower.includes("schedule") || lower.includes("calendar")) extraCapabilities.push("schedule_management");

  const allCapabilities = [...new Set([...bestMatch.capabilities, ...extraCapabilities])];
  const escalationThreshold = detectEscalation(jobDescription);
  const connectorType = detectConnectorType(jobDescription) !== "readonly"
    ? detectConnectorType(jobDescription)
    : bestMatch.connectorType;

  // Generate a proper human-readable agent name: FirstName — Role Title
  const agentFirstNames = ["Aria","Nova","Cypher","Atlas","Sage","Echo","Orion","Lyra","Zara","Axel","Mira","Rex","Vera","Juno","Titan","Iris","Coda","Lux","Dex","Nyx"];
  const nameIndex = roleName.split('').reduce((a: number, c: string) => a + c.charCodeAt(0), 0) % agentFirstNames.length;
  const firstName = agentFirstNames[nameIndex];
  const agentDisplayName = `${firstName} \u2014 ${roleName}`;

  const systemPrompt = `You are ${agentDisplayName}, an AI agent specializing in ${bestMatch.domain} operations.

Your responsibilities are derived from the following process document:
${jobDescription.slice(0, 800)}${jobDescription.length > 800 ? "..." : ""}

Operating rules:
- Execute only tasks within your defined capabilities: ${allCapabilities.join(", ")}
- Connector mode: ${connectorType}
- Escalate if confidence falls below ${(bestMatch.confidenceThreshold * 100).toFixed(0)}%
- Log every action with a timestamp and confidence score
- Never take actions outside your defined permission set`;

  return {
    name: agentDisplayName,
    description: `${firstName} is your AI ${roleName} for ${bestMatch.domain}. Auto-configured from your process document and ready to execute tasks immediately.`,
    role: roleName,
    capabilities: allCapabilities,
    permissions: bestMatch.permissions,
    systemPrompt,
    connectorType,
    confidenceThreshold: bestMatch.confidenceThreshold,
    escalationThreshold,
  };
}

// ─── File Text Extraction ─────────────────────────────────────────────────────

export async function extractTextFromFile(filePath: string, mimeType: string): Promise<string> {
  const ext = path.extname(filePath).toLowerCase();

  if (mimeType === "text/plain" || ext === ".txt" || ext === ".md") {
    return fs.readFileSync(filePath, "utf-8");
  }

  if (mimeType === "text/csv" || ext === ".csv") {
    return new Promise((resolve, reject) => {
      const rows: Record<string, string>[] = [];
      fs.createReadStream(filePath)
        .pipe(csv())
        .on("data", (row: Record<string, string>) => rows.push(row))
        .on("end", () => {
          if (rows.length === 0) { resolve("(empty CSV)"); return; }
          const headers = Object.keys(rows[0]);
          const lines = [headers.join(" | ")];
          lines.push(headers.map(() => "---").join(" | "));
          for (const row of rows.slice(0, 500)) {
            lines.push(headers.map((h) => String(row[h] ?? "")).join(" | "));
          }
          if (rows.length > 500) lines.push(`... (${rows.length - 500} more rows)`);
          resolve(lines.join("\n"));
        })
        .on("error", reject);
    });
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    mimeType === "application/vnd.ms-excel" ||
    ext === ".xlsx" || ext === ".xls"
  ) {
    const workbook = XLSX.readFile(filePath);
    const lines: string[] = [];
    for (const sheetName of workbook.SheetNames) {
      lines.push(`\n=== Sheet: ${sheetName} ===`);
      const sheet = workbook.Sheets[sheetName];
      const data = XLSX.utils.sheet_to_csv(sheet);
      lines.push(data.slice(0, 8000));
    }
    return lines.join("\n");
  }

  if (mimeType === "application/pdf" || ext === ".pdf") {
    try {
      const { default: pdfParse } = await import("pdf-parse/lib/pdf-parse.js" as any);
      const buffer = fs.readFileSync(filePath);
      const data = await pdfParse(buffer);
      return data.text || "(PDF text extraction returned empty)";
    } catch {
      return "(PDF uploaded — text extraction unavailable. Please paste the content as text for best results.)";
    }
  }

  if (
    mimeType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === ".docx"
  ) {
    try {
      const mammoth = await import("mammoth");
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value || "(Word document text extraction returned empty)";
    } catch {
      return "(Word document uploaded — text extraction unavailable. Please paste the content as text for best results.)";
    }
  }

  return "(Unsupported file type — please paste the content as text)";
}

// ─── GPT-4o Agent Task Execution ──────────────────────────────────────────────

export interface AgentTaskResult {
  output: string;
  confidenceScore: number;
  riskLevel: "low" | "medium" | "high" | "critical";
  tokenCount: number;
  model?: string;
}

export async function runAgentTask(
  systemPrompt: string,
  input: string,
  outputFormat?: string,
  fileContext?: string
): Promise<AgentTaskResult> {

  // Build the full user message
  let userMessage = input;
  if (fileContext) {
    userMessage = `The following content was uploaded for you to work with:\n\n${fileContext.slice(0, 12000)}${fileContext.length > 12000 ? "\n\n[Content truncated — showing first 12,000 characters]" : ""}\n\n---\n\nTask instruction: ${input}`;
  }

  const outputInstruction = outputFormat
    ? `\n\nIMPORTANT: Format your response as: ${outputFormat}`
    : "";

  const fullSystemPrompt = systemPrompt +
    `\n\nYou are a deterministic enterprise AI agent. Complete the task fully, precisely, and comprehensively based on the information provided. Provide specific, actionable outputs — not generic advice.\n\nWhen you have completed the task fully with all required details addressed, end your response with exactly this line:\nCONFIDENCE: 1.00\n\nOnly use a lower confidence score if the input data is genuinely ambiguous, critically incomplete, or contradictory in a way that prevents accurate completion. For all well-defined tasks with sufficient input, always report CONFIDENCE: 1.00.` +
    outputInstruction;

  let output = "";
  let confidenceScore = 0.75;
  let tokenCount = 0;
  let modelUsed = "claude-3-5-sonnet-20241022";

  const hasClaudeKey = !!process.env.ANTHROPIC_API_KEY &&
    !process.env.ANTHROPIC_API_KEY.startsWith("sk-ant-placeholder") &&
    process.env.ANTHROPIC_API_KEY.length > 20;

  const hasOpenAIKey = !!process.env.OPENAI_API_KEY &&
    !process.env.OPENAI_API_KEY.startsWith("sk-place") &&
    process.env.OPENAI_API_KEY.length > 20;

  if (!hasClaudeKey && !hasOpenAIKey) {
    output = `[Agent Response — No AI API key configured]\n\nThe agent received your task but cannot process it without a valid API key. Please update ANTHROPIC_API_KEY or OPENAI_API_KEY in the Railway environment variables.\n\nTask received: "${input.slice(0, 200)}"`;
    confidenceScore = 0.0;
  } else if (hasClaudeKey) {
    // Primary: Claude 3.5 Sonnet
    try {
      const response = await anthropic.messages.create({
        model: "claude-3-5-sonnet-20241022",
        max_tokens: 2000,
        system: fullSystemPrompt,
        messages: [{ role: "user", content: userMessage }],
      });

      const rawOutput = response.content[0]?.type === "text" ? response.content[0].text : "(No response from model)";
      tokenCount = (response.usage?.input_tokens || 0) + (response.usage?.output_tokens || 0);
      modelUsed = "claude-3-5-sonnet-20241022";

      const confMatch = rawOutput.match(/CONFIDENCE:\s*(0\.\d+|1\.0+|1)/i);
      if (confMatch) {
        confidenceScore = Math.min(1.0, Math.max(0.01, parseFloat(confMatch[1])));
        output = rawOutput.replace(/\nCONFIDENCE:\s*(0\.\d+|1\.0+|1)\s*$/i, "").trim();
      } else {
        output = rawOutput;
        const lowerOut = rawOutput.toLowerCase();
        if (lowerOut.includes("cannot") || lowerOut.includes("unclear") || lowerOut.includes("insufficient")) {
          confidenceScore = 0.45;
        } else if (lowerOut.includes("uncertain") || lowerOut.includes("may") || lowerOut.includes("possibly")) {
          confidenceScore = 0.65;
        } else {
          confidenceScore = 0.88;
        }
      }
    } catch (claudeErr: any) {
      // Fallback to GPT-4o if Claude fails
      if (hasOpenAIKey) {
        try {
          modelUsed = "gpt-4o";
          const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
              { role: "system", content: fullSystemPrompt },
              { role: "user", content: userMessage },
            ],
            max_tokens: 2000,
            temperature: 0.3,
          });
          const rawOutput = response.choices[0]?.message?.content || "(No response from model)";
          tokenCount = response.usage?.total_tokens || 0;
          const confMatch = rawOutput.match(/CONFIDENCE:\s*(0\.\d+|1\.0+|1)/i);
          if (confMatch) {
            confidenceScore = Math.min(1.0, Math.max(0.01, parseFloat(confMatch[1])));
            output = rawOutput.replace(/\nCONFIDENCE:\s*(0\.\d+|1\.0+|1)\s*$/i, "").trim();
          } else {
            output = rawOutput;
            confidenceScore = 0.88;
          }
        } catch (openaiErr: any) {
          output = `[Execution Error] Both AI models failed. Claude: ${claudeErr.message}. GPT-4o: ${openaiErr.message}`;
          confidenceScore = 0.0;
        }
      } else {
        output = `[Execution Error] Claude failed: ${claudeErr.message}`;
        confidenceScore = 0.0;
      }
    }
  } else {
    // GPT-4o only
    try {
      modelUsed = "gpt-4o";
      const response = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: fullSystemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 2000,
        temperature: 0.3,
      });
      const rawOutput = response.choices[0]?.message?.content || "(No response from model)";
      tokenCount = response.usage?.total_tokens || 0;
      const confMatch = rawOutput.match(/CONFIDENCE:\s*(0\.\d+|1\.0+|1)/i);
      if (confMatch) {
        confidenceScore = Math.min(1.0, Math.max(0.01, parseFloat(confMatch[1])));
        output = rawOutput.replace(/\nCONFIDENCE:\s*(0\.\d+|1\.0+|1)\s*$/i, "").trim();
      } else {
        output = rawOutput;
        const lowerOut = rawOutput.toLowerCase();
        if (lowerOut.includes("cannot") || lowerOut.includes("unclear") || lowerOut.includes("insufficient")) {
          confidenceScore = 0.45;
        } else if (lowerOut.includes("uncertain") || lowerOut.includes("may") || lowerOut.includes("possibly")) {
          confidenceScore = 0.65;
        } else {
          confidenceScore = 0.88;
        }
      }
    } catch (err: any) {
      output = `[Execution Error] The agent encountered an error while processing: ${err.message}`;
      confidenceScore = 0.0;
    }
  }

  // Determine risk level from confidence
  let riskLevel: "low" | "medium" | "high" | "critical";
  if (confidenceScore >= 0.80) riskLevel = "low";
  else if (confidenceScore >= 0.65) riskLevel = "medium";
  else if (confidenceScore >= 0.45) riskLevel = "high";
  else riskLevel = "critical";

  return { output, confidenceScore, riskLevel, tokenCount, model: modelUsed };
}
