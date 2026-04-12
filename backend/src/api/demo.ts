import { Router, Request, Response } from "express";
import { rateLimit } from "express-rate-limit";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { INDUSTRY_INTELLIGENCE, buildAgentSystemPrompt, getAllIndustriesSummary } from "../data/industryIntelligence.js";

const router = Router();

// Stricter rate limit for unauthenticated demo chat to prevent LLM credit abuse
const demoChatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Too many demo requests, please try again later" },
});

// ─── AI Clients ───────────────────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || undefined,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ─── Confidence scoring helper ────────────────────────────────────────────────

function computeConfidence(message: string, reply: string, industry?: string): number {
  let score = 85;
  if (reply.length > 200) score += 5;
  if (reply.includes("1.") || reply.includes("•") || reply.includes("-")) score += 3;
  if (industry && INDUSTRY_INTELLIGENCE[industry]) score += 4;
  if (message.length > 50) score += 2;
  if (reply.toLowerCase().includes("recommend") || reply.toLowerCase().includes("suggest")) score += 1;
  return Math.min(score, 99);
}

// ─── POST /api/demo/chat ──────────────────────────────────────────────────────

router.post("/chat", demoChatLimiter, async (req: Request, res: Response) => {
  try {
    const {
      message,
      systemPrompt,
      model = "openai",
      history = [],
      industry,
      agentRole,
      customContext,
    } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build system prompt — use industry intelligence if industry is specified
    let systemContent: string;
    if (industry && INDUSTRY_INTELLIGENCE[industry]) {
      systemContent = buildAgentSystemPrompt(industry, agentRole, customContext);
    } else if (systemPrompt) {
      systemContent = systemPrompt;
    } else {
      systemContent = `You are an elite AI agent for WorkforceAutomated — an Enterprise AI Workforce Operating System. 
You are a master of any industry or task you are assigned to. You produce high-quality, structured, actionable outputs.
You have deep expertise across: Supply Chain, Contracts & Legal, Analytics & Data, Marketing, Project Management, 
Program Management, Finance & Accounting, Human Resources, Sales, IT & Security, and Customer Support.
Always produce professional, structured outputs with clear recommendations and measurable outcomes.`;
    }

    let reply = "";
    let usedModel = model;

    // Determine preferred model based on industry intelligence
    if (industry && INDUSTRY_INTELLIGENCE[industry] && model === "auto") {
      const ind = INDUSTRY_INTELLIGENCE[industry];
      const role = agentRole ? ind.agentRoles.find(r => r.name.toLowerCase() === agentRole?.toLowerCase()) : null;
      if (role?.model === "claude" && process.env.ANTHROPIC_API_KEY) {
        usedModel = "claude";
      } else {
        usedModel = "openai";
      }
    }

    if (usedModel === "claude") {
      // ── Claude (Anthropic) ─────────────────────────────────────────────────
      if (!process.env.ANTHROPIC_API_KEY) {
        // Fallback to OpenAI if Claude key not set
        const fallback = await openai.chat.completions.create({
          model: "gpt-4o",
          messages: [
            { role: "system", content: systemContent },
            ...history,
            { role: "user", content: message },
          ],
          max_tokens: 1200,
          temperature: 0.7,
        });
        reply = fallback.choices[0]?.message?.content || "I was unable to process that request.";
        usedModel = "openai-fallback";
      } else {
        const claudeMessages = [
          ...history.map((h: { role: string; content: string }) => ({
            role: h.role as "user" | "assistant",
            content: h.content,
          })),
          { role: "user" as const, content: message },
        ];

        const claudeResp = await anthropic.messages.create({
          model: "claude-3-5-sonnet-20241022",
          max_tokens: 1200,
          system: systemContent,
          messages: claudeMessages,
        });

        reply = claudeResp.content[0]?.type === "text" ? claudeResp.content[0].text : "I was unable to process that request.";
      }
    } else {
      // ── OpenAI ─────────────────────────────────────────────────────────────
      const openaiResp = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemContent },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 1200,
        temperature: 0.7,
      });

      reply = openaiResp.choices[0]?.message?.content || "I was unable to process that request.";
      usedModel = "openai";
    }

    const confidence = computeConfidence(message, reply, industry);

    return res.json({
      reply,
      model: usedModel,
      confidence,
      industry: industry || null,
      agentRole: agentRole || null,
    });
  } catch (error: any) {
    console.error("Demo chat error:", error?.message || error);
    return res.status(500).json({
      error: "AI service temporarily unavailable",
      reply: "I am currently unavailable. Please try again in a moment or switch to a different AI model.",
    });
  }
});

// ─── GET /api/demo/industries ─────────────────────────────────────────────────

router.get("/industries", (_req: Request, res: Response) => {
  res.json({
    industries: getAllIndustriesSummary(),
    total: Object.keys(INDUSTRY_INTELLIGENCE).length,
  });
});

// ─── GET /api/demo/industries/:id ────────────────────────────────────────────

router.get("/industries/:id", (req: Request, res: Response) => {
  const industry = INDUSTRY_INTELLIGENCE[req.params.id];
  if (!industry) {
    return res.status(404).json({ error: "Industry not found" });
  }
  res.json(industry);
});

// ─── GET /api/demo/models ─────────────────────────────────────────────────────

router.get("/models", (_req: Request, res: Response) => {
  res.json({
    available: [
      {
        id: "openai",
        name: "OpenAI GPT-4o Mini",
        provider: "OpenAI",
        available: !!process.env.OPENAI_API_KEY,
        description: "Fast, capable, and cost-efficient. Best for most automation tasks.",
        bestFor: ["Finance", "HR", "Sales", "Analytics", "Customer Support", "Project Management"],
      },
      {
        id: "claude",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        available: !!process.env.ANTHROPIC_API_KEY,
        description: "Exceptional at nuanced reasoning, long documents, and compliance tasks.",
        fallback: !process.env.ANTHROPIC_API_KEY ? "openai" : null,
        bestFor: ["Contracts", "Legal", "IT Security", "Program Management", "Supply Chain Risk", "Compliance"],
      },
      {
        id: "auto",
        name: "Auto (Recommended)",
        provider: "WorkforceAutomated",
        available: true,
        description: "Automatically selects the best AI model for your industry and task type.",
        bestFor: ["All industries"],
      },
    ],
  });
});

export default router;
