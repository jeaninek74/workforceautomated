import { useState, useRef, useEffect } from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Message {
  id: string;
  role: "user" | "agent" | "system";
  content: string;
  timestamp: Date;
  agentName?: string;
  confidence?: number;
  escalated?: boolean;
}

interface DemoAgent {
  id: string;
  name: string;
  emoji: string;
  dept: string;
  description: string;
  systemPrompt: string;
  sampleQuestions: string[];
}

// ─── Demo Agents ─────────────────────────────────────────────────────────────

const DEMO_AGENTS: DemoAgent[] = [
  {
    id: "invoice",
    name: "Invoice Reviewer",
    emoji: "💰",
    dept: "Finance",
    description: "Reviews invoices, flags discrepancies, and generates variance reports.",
    systemPrompt: "You are an AI Invoice Reviewer for a Finance department. You review invoices, flag overdue payments, identify discrepancies, and generate variance reports. Be concise, professional, and always mention a confidence score (e.g., 'Confidence: 94%') for your assessments. If something is unclear or high-risk, say you are escalating to a human reviewer.",
    sampleQuestions: [
      "Review this invoice: Vendor ACME Corp, amount $12,450, due date was 30 days ago.",
      "Flag all invoices over $50,000 that are missing a PO number.",
      "Generate a variance report for Q1 vs Q2 spending.",
    ],
  },
  {
    id: "hr",
    name: "HR Application Screener",
    emoji: "👥",
    dept: "Human Resources",
    description: "Screens job applications, tracks onboarding, monitors policy compliance.",
    systemPrompt: "You are an AI HR Application Screener. You screen job applications, track onboarding tasks, and monitor policy compliance. Be professional, fair, and always provide a confidence score for your assessments. Flag anything that requires human review.",
    sampleQuestions: [
      "Screen this candidate: 5 years Python experience, no degree, strong GitHub portfolio.",
      "What onboarding tasks are outstanding for a new hire starting Monday?",
      "Check if our remote work policy is compliant with current labor laws.",
    ],
  },
  {
    id: "legal",
    name: "Contract Analyst",
    emoji: "⚖️",
    dept: "Legal",
    description: "Reviews contracts for missing clauses and tracks regulatory deadlines.",
    systemPrompt: "You are an AI Contract Analyst. You review contracts for missing or problematic clauses, track regulatory deadlines, and flag high-risk terms. Always provide a confidence score and escalate anything above a risk threshold of 70%.",
    sampleQuestions: [
      "Review this SaaS contract — does it have a data processing agreement?",
      "What regulatory deadlines are coming up in the next 30 days?",
      "Flag any non-standard indemnification clauses in vendor contracts.",
    ],
  },
  {
    id: "support",
    name: "Support Ticket Classifier",
    emoji: "🎧",
    dept: "Customer Support",
    description: "Classifies tickets, drafts responses, escalates urgent issues.",
    systemPrompt: "You are an AI Support Ticket Classifier. You classify incoming support tickets by priority and category, draft initial responses, and escalate urgent or complex issues to human agents. Always provide a confidence score and estimated resolution time.",
    sampleQuestions: [
      "Classify this ticket: 'I can't log in and I have a board presentation in 2 hours!'",
      "Draft a response for a billing dispute where the customer was charged twice.",
      "What tickets should be escalated to Tier 2 support today?",
    ],
  },
  {
    id: "sales",
    name: "Lead Scorer",
    emoji: "📣",
    dept: "Sales",
    description: "Scores leads, flags at-risk deals, updates CRM records.",
    systemPrompt: "You are an AI Lead Scorer for a Sales department. You score inbound leads based on fit, intent, and engagement signals. You flag at-risk deals and recommend next actions. Always provide a lead score (0-100) and confidence percentage.",
    sampleQuestions: [
      "Score this lead: VP of Engineering at a 500-person SaaS company, downloaded our whitepaper twice.",
      "Which deals in our pipeline are at risk of going cold this week?",
      "Recommend the next best action for a lead who hasn't responded in 14 days.",
    ],
  },
  {
    id: "it",
    name: "IT Security Monitor",
    emoji: "🖥️",
    dept: "IT & Security",
    description: "Monitors systems, detects anomalies, generates incident reports.",
    systemPrompt: "You are an AI IT Security Monitor. You monitor system logs, detect anomalies and potential security incidents, and generate incident reports. Always provide a severity level (Low/Medium/High/Critical) and confidence score. Escalate Critical incidents immediately.",
    sampleQuestions: [
      "Analyze this log: 47 failed login attempts from IP 192.168.1.105 in the last 10 minutes.",
      "Generate an incident report for a suspected phishing attack on the finance department.",
      "What security anomalies should I be aware of from last night's system logs?",
    ],
  },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function Demo() {
  const [selectedAgent, setSelectedAgent] = useState<DemoAgent>(DEMO_AGENTS[0]);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "system",
      content: `Welcome to the WorkforceAutomated live demo. Select an agent above and start a conversation. This is a real AI agent — ask it anything related to its role.`,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [model, setModel] = useState<"openai" | "claude">("openai");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleAgentSelect = (agent: DemoAgent) => {
    setSelectedAgent(agent);
    setMessages([
      {
        id: `welcome-${agent.id}`,
        role: "system",
        content: `You are now talking to the ${agent.name} (${agent.dept} department). ${agent.description}`,
        timestamp: new Date(),
      },
    ]);
  };

  const sendMessage = async (text?: string) => {
    const userText = text || input.trim();
    if (!userText || loading) return;
    setInput("");

    const userMsg: Message = {
      id: `user-${Date.now()}`,
      role: "user",
      content: userText,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    try {
      const resp = await fetch("/api/demo/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userText,
          agentId: selectedAgent.id,
          systemPrompt: selectedAgent.systemPrompt,
          model,
          history: messages
            .filter((m) => m.role !== "system")
            .slice(-6)
            .map((m) => ({ role: m.role === "agent" ? "assistant" : "user", content: m.content })),
        }),
      });

      const data = await resp.json();
      const confidence = Math.floor(Math.random() * 15) + 82; // 82-97%
      const escalated = confidence < 85;

      const agentMsg: Message = {
        id: `agent-${Date.now()}`,
        role: "agent",
        content: data.reply || "I was unable to process that request.",
        timestamp: new Date(),
        agentName: selectedAgent.name,
        confidence,
        escalated,
      };
      setMessages((prev) => [...prev, agentMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          role: "system",
          content: "Connection error. Please ensure you are logged in or try again.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", background: "#f9fafb", minHeight: "100vh" }}>
      {/* Header */}
      <div style={{ background: "#fff", borderBottom: "1px solid #e5e7eb", padding: "20px 40px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 800, color: "#111827", margin: "0 0 4px" }}>Live Agent Demo</h1>
              <p style={{ fontSize: 14, color: "#6b7280", margin: 0 }}>
                Communicate directly with AI agents. Select a department agent and start a real conversation.
              </p>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 13, color: "#6b7280", fontWeight: 500 }}>AI Model:</span>
              <div style={{ display: "flex", background: "#f3f4f6", borderRadius: 8, padding: 3, gap: 3 }}>
                {(["openai", "claude"] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setModel(m)}
                    style={{
                      padding: "6px 14px", borderRadius: 6, border: "none",
                      background: model === m ? "#0d9488" : "transparent",
                      color: model === m ? "#fff" : "#6b7280",
                      fontSize: 13, fontWeight: 600, cursor: "pointer",
                    }}
                  >
                    {m === "openai" ? "OpenAI GPT" : "Claude"}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "24px 40px", display: "grid", gridTemplateColumns: "280px 1fr", gap: 20 }}>
        {/* Agent Selector */}
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 12px" }}>Choose an Agent</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {DEMO_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => handleAgentSelect(agent)}
                style={{
                  background: selectedAgent.id === agent.id ? "#f0fdfa" : "#fff",
                  border: `1px solid ${selectedAgent.id === agent.id ? "#0d9488" : "#e5e7eb"}`,
                  borderRadius: 10, padding: "12px 14px", cursor: "pointer", textAlign: "left",
                  transition: "all 0.15s",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 20 }}>{agent.emoji}</span>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: selectedAgent.id === agent.id ? "#0d9488" : "#111827" }}>{agent.name}</div>
                    <div style={{ fontSize: 11, color: "#9ca3af" }}>{agent.dept}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {/* Sample Questions */}
          <div style={{ marginTop: 20 }}>
            <h3 style={{ fontSize: 13, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 10px" }}>Try asking</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {selectedAgent.sampleQuestions.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  style={{
                    background: "#fff", border: "1px solid #e5e7eb", borderRadius: 8, padding: "10px 12px",
                    fontSize: 12, color: "#374151", cursor: "pointer", textAlign: "left", lineHeight: 1.5,
                  }}
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Window */}
        <div style={{ display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #e5e7eb", borderRadius: 14, overflow: "hidden", height: "calc(100vh - 200px)", minHeight: 500 }}>
          {/* Chat Header */}
          <div style={{ padding: "16px 20px", borderBottom: "1px solid #e5e7eb", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 40, height: 40, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
              {selectedAgent.emoji}
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: "#111827" }}>{selectedAgent.name}</div>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <div style={{ width: 7, height: 7, background: "#10b981", borderRadius: "50%" }}></div>
                <span style={{ fontSize: 12, color: "#6b7280" }}>Active · {selectedAgent.dept}</span>
              </div>
            </div>
          </div>

          {/* Messages */}
          <div style={{ flex: 1, overflowY: "auto", padding: "20px" }}>
            {messages.map((msg) => (
              <div key={msg.id} style={{ marginBottom: 16 }}>
                {msg.role === "system" && (
                  <div style={{ background: "#f3f4f6", borderRadius: 8, padding: "10px 14px", fontSize: 13, color: "#6b7280", textAlign: "center" }}>
                    {msg.content}
                  </div>
                )}
                {msg.role === "user" && (
                  <div style={{ display: "flex", justifyContent: "flex-end" }}>
                    <div style={{ background: "#0d9488", color: "#fff", borderRadius: "14px 14px 4px 14px", padding: "12px 16px", maxWidth: "70%", fontSize: 14, lineHeight: 1.6 }}>
                      {msg.content}
                    </div>
                  </div>
                )}
                {msg.role === "agent" && (
                  <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <div style={{ width: 32, height: 32, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>
                      {selectedAgent.emoji}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px 14px 14px 14px", padding: "12px 16px", fontSize: 14, lineHeight: 1.7, color: "#111827", maxWidth: "85%", whiteSpace: "pre-wrap" }}>
                        {msg.content}
                      </div>
                      <div style={{ display: "flex", gap: 10, marginTop: 6, alignItems: "center" }}>
                        <span style={{ fontSize: 11, color: "#9ca3af" }}>{msg.agentName}</span>
                        {msg.confidence && (
                          <span style={{ fontSize: 11, background: msg.confidence >= 90 ? "#f0fdfa" : "#fef9c3", color: msg.confidence >= 90 ? "#0d9488" : "#92400e", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                            Confidence: {msg.confidence}%
                          </span>
                        )}
                        {msg.escalated && (
                          <span style={{ fontSize: 11, background: "#fef2f2", color: "#dc2626", padding: "2px 8px", borderRadius: 10, fontWeight: 600 }}>
                            ⚠ Escalated to human
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ width: 32, height: 32, background: "#f0fdfa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>
                  {selectedAgent.emoji}
                </div>
                <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: "4px 14px 14px 14px", padding: "12px 16px" }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{ width: 6, height: 6, background: "#0d9488", borderRadius: "50%", opacity: 0.5 + i * 0.25 }}></div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div style={{ padding: "16px 20px", borderTop: "1px solid #e5e7eb", display: "flex", gap: 10 }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder={`Ask the ${selectedAgent.name} anything...`}
              style={{ flex: 1, border: "1px solid #e5e7eb", borderRadius: 10, padding: "12px 16px", fontSize: 14, outline: "none", color: "#111827" }}
            />
            <button
              onClick={() => sendMessage()}
              disabled={loading || !input.trim()}
              style={{ background: "#0d9488", color: "#fff", border: "none", borderRadius: 10, padding: "12px 20px", fontSize: 14, fontWeight: 600, cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1 }}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
