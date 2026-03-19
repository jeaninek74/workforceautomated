import { Router, Request, Response } from "express";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";

const router = Router();

// ─── AI Clients ───────────────────────────────────────────────────────────────

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_API_BASE || undefined,
});

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// ─── POST /api/demo/chat ──────────────────────────────────────────────────────

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { message, systemPrompt, model = "openai", history = [] } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const systemContent = systemPrompt || "You are a helpful AI assistant for WorkforceAutomated.";

    let reply = "";

    if (model === "claude") {
      // ── Claude (Anthropic) ─────────────────────────────────────────────────
      if (!process.env.ANTHROPIC_API_KEY) {
        // Fallback to OpenAI if Claude key not set
        const fallback = await openai.chat.completions.create({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: systemContent + "\n\nNote: You are currently running on OpenAI GPT as a fallback (Claude API key not configured)." },
            ...history,
            { role: "user", content: message },
          ],
          max_tokens: 600,
          temperature: 0.7,
        });
        reply = fallback.choices[0]?.message?.content || "I was unable to process that request.";
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
          max_tokens: 600,
          system: systemContent,
          messages: claudeMessages,
        });

        reply = claudeResp.content[0]?.type === "text" ? claudeResp.content[0].text : "I was unable to process that request.";
      }
    } else {
      // ── OpenAI ─────────────────────────────────────────────────────────────
      const openaiResp = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemContent },
          ...history,
          { role: "user", content: message },
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      reply = openaiResp.choices[0]?.message?.content || "I was unable to process that request.";
    }

    return res.json({
      reply,
      model: model === "claude" && !process.env.ANTHROPIC_API_KEY ? "openai-fallback" : model,
    });
  } catch (error: any) {
    console.error("Demo chat error:", error?.message || error);

    // Graceful fallback response
    return res.status(500).json({
      error: "AI service temporarily unavailable",
      reply: "I am currently unavailable. Please try again in a moment or switch to a different AI model.",
    });
  }
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
      },
      {
        id: "claude",
        name: "Claude 3.5 Sonnet",
        provider: "Anthropic",
        available: !!process.env.ANTHROPIC_API_KEY,
        description: "Exceptional at nuanced reasoning, long documents, and compliance tasks.",
        fallback: !process.env.ANTHROPIC_API_KEY ? "openai" : null,
      },
    ],
  });
});

export default router;
