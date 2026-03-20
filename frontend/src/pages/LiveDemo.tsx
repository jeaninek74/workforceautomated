import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";

const TEAL = "#0d9488";
const DARK = "#111827";
const GRAY = "#6b7280";
const LIGHT_BG = "#f9fafb";
const BORDER = "#e5e7eb";

const INDUSTRIES = [
  { id: "Finance & Accounting", label: "Finance & Accounting", emoji: "💰", role: "Accounts Payable Specialist" },
  { id: "IT Tasks & Helpdesk", label: "IT Helpdesk", emoji: "🖥️", role: "IT Helpdesk L2 Technician" },
  { id: "Cybersecurity", label: "Cybersecurity", emoji: "🔒", role: "SOC Analyst Tier 2" },
  { id: "Human Resources", label: "Human Resources", emoji: "👥", role: "HR Business Partner" },
  { id: "Payroll & Compensation", label: "Payroll", emoji: "💵", role: "Payroll Compliance Specialist" },
  { id: "Networking & Infrastructure", label: "Networking", emoji: "🌐", role: "NOC Analyst" },
  { id: "Healthcare & Clinical", label: "Healthcare", emoji: "🏥", role: "Clinical Documentation Specialist" },
  { id: "Sales & Revenue", label: "Sales", emoji: "📈", role: "Sales Operations Analyst" },
  { id: "Legal & Contracts", label: "Legal", emoji: "⚖️", role: "Contract Review Specialist" },
  { id: "Customer Support", label: "Customer Support", emoji: "🎧", role: "Customer Success Manager" },
  { id: "Supply Chain", label: "Supply Chain", emoji: "🚚", role: "Supply Chain Analyst" },
  { id: "C-Level & Executive", label: "C-Level / Executive", emoji: "🏢", role: "Chief of Staff" },
];

const STARTER_PROMPTS: Record<string, string[]> = {
  "Finance & Accounting": [
    "Vendor invoice is $14,750 but the PO was only for $14,000. What should I do?",
    "I need to generate a weekly AP aging report. What data do I need?",
    "How do I process a payment run for Net-30 invoices due this Friday?",
  ],
  "IT Tasks & Helpdesk": [
    "User's VPN says 'certificate expired' and they have a meeting in 1 hour.",
    "How do I provision a new employee account in Active Directory?",
    "A laptop won't boot — showing a blue screen error 0x0000007E.",
  ],
  "Cybersecurity": [
    "SIEM alert: 2.3GB transferred to a Tor exit node at 2am from a finance workstation.",
    "PowerShell with encoded commands was executed on a workstation. Is this a threat?",
    "How do I create a detection rule for credential dumping attempts?",
  ],
  "Human Resources": [
    "Employee has missed 4 sprint deadlines and 3 unexcused absences. How do I handle this?",
    "How do I write a Performance Improvement Plan for an underperforming employee?",
    "A manager filed a complaint about a team member sleeping in meetings. What are my steps?",
  ],
  "Payroll & Compensation": [
    "Employee classified as exempt but does 80% routine data entry. Is this correct under FLSA?",
    "How do I calculate back pay for an employee who was underpaid for 6 months?",
    "What are the quarterly payroll tax filing deadlines for a multi-state employer?",
  ],
  "Networking & Infrastructure": [
    "Core switch showing 94% CPU and 47 spanning tree changes in 5 minutes. What do I do?",
    "How do I isolate a broadcast storm on an access switch?",
    "Network outage affecting 340 users. SLA requires resolution in 30 minutes. Steps?",
  ],
  "Healthcare & Clinical": [
    "Discharge summary says 'CHF exacerbation' but doesn't specify systolic vs diastolic. What query do I send?",
    "Patient has Type 2 diabetes in nursing notes but not in the discharge diagnosis. What's the impact?",
    "How does an unspecified CHF diagnosis affect DRG assignment and reimbursement?",
  ],
  "Sales & Revenue": [
    "38% of our pipeline has had no activity in 30+ days. How do I identify at-risk deals?",
    "Top deal has been in 'Proposal' stage for 67 days with no contact. What's the intervention?",
    "3 of 8 reps are below 50% attainment. How do I analyze the root cause?",
  ],
  "Legal & Contracts": [
    "Vendor contract has a liability cap of 1 month of fees on a $30K/year deal. Is this acceptable?",
    "Contract auto-renews for 3 years with 90-day cancellation notice. What are the risks?",
    "Vendor wants to use our data for 'product improvement' with no opt-out. What should I do?",
  ],
  "Customer Support": [
    "Enterprise customer's health score dropped from 82 to 34 in 30 days. Renewal in 45 days. Help.",
    "Our champion contact at a $180K ARR account just left the company. What's the action plan?",
    "Customer mentioned a competitor in their last support ticket. How do I respond?",
  ],
  "Supply Chain": [
    "Primary supplier announced 3-week shutdown. We have 7 days of stock left. What do I do?",
    "Secondary supplier has inventory at 22% premium. Should I use them?",
    "How do I calculate the cost of a stockout vs the cost of emergency procurement?",
  ],
  "C-Level & Executive": [
    "Revenue missed Q3 target by 9.2%. I need to brief the board on Monday. Help me structure this.",
    "Customer churn increased from 4.2% to 6.8%. What's the recovery narrative?",
    "Two large enterprise deals slipped to Q4. How do I present the Q4 outlook to investors?",
  ],
};

interface Message {
  role: "user" | "assistant";
  content: string;
  streaming?: boolean;
}

export default function LiveDemo() {
  const [selectedIndustry, setSelectedIndustry] = useState(INDUSTRIES[0]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const MAX_FREE_MESSAGES = 5;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset chat when industry changes
  const handleIndustryChange = (industry: typeof INDUSTRIES[0]) => {
    setSelectedIndustry(industry);
    setMessages([]);
    setMsgCount(0);
  };

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading || msgCount >= MAX_FREE_MESSAGES) return;

    const userMsg: Message = { role: "user", content: text };
    const history = messages.map(m => ({ role: m.role, content: m.content }));

    setMessages(prev => [...prev, userMsg, { role: "assistant", content: "", streaming: true }]);
    setInput("");
    setIsLoading(true);
    setMsgCount(c => c + 1);

    try {
      const BASE = import.meta.env.VITE_API_URL || "";
      const response = await fetch(`${BASE}/api/demo/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          industry: selectedIndustry.id,
          agentRole: selectedIndustry.role,
          history,
          model: "openai",
        }),
      });

      if (!response.ok) throw new Error("Service unavailable");

      const data = await response.json();
      const reply = data.reply || "I was unable to process that request.";

      // Simulate streaming by revealing text progressively
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = { role: "assistant", content: "", streaming: true };
        return updated;
      });

      let i = 0;
      const words = reply.split(" ");
      const interval = setInterval(() => {
        i += 3; // reveal 3 words at a time for speed
        const partial = words.slice(0, i).join(" ");
        setMessages(prev => {
          const updated = [...prev];
          updated[updated.length - 1] = {
            role: "assistant",
            content: partial,
            streaming: i < words.length,
          };
          return updated;
        });
        if (i >= words.length) {
          clearInterval(interval);
          setMessages(prev => {
            const updated = [...prev];
            updated[updated.length - 1] = { role: "assistant", content: reply, streaming: false };
            return updated;
          });
          setIsLoading(false);
        }
      }, 30);
    } catch {
      setMessages(prev => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: "I'm temporarily unavailable. Please try again in a moment.",
          streaming: false,
        };
        return updated;
      });
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const prompts = STARTER_PROMPTS[selectedIndustry.id] || [];
  const remainingMessages = MAX_FREE_MESSAGES - msgCount;
  const isLimitReached = msgCount >= MAX_FREE_MESSAGES;

  return (
    <div style={{ minHeight: "100vh", background: "#fff", fontFamily: "'Inter', system-ui, sans-serif" }}>
      {/* Nav */}
      <nav style={{ borderBottom: `1px solid ${BORDER}`, padding: "0 32px", height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", position: "sticky", top: 0, background: "#fff", zIndex: 100 }}>
        <Link to="/" style={{ fontWeight: 800, fontSize: 16, color: DARK, textDecoration: "none", letterSpacing: "-0.5px" }}>
          WorkforceAutomated
        </Link>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <Link to="/register" style={{ background: TEAL, color: "#fff", padding: "8px 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
            Start Free Trial
          </Link>
        </div>
      </nav>

      <div style={{ maxWidth: 1100, margin: "0 auto", padding: "32px 24px" }}>
        {/* Header */}
        <div style={{ marginBottom: 32, textAlign: "center" }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: TEAL, letterSpacing: 2, textTransform: "uppercase", marginBottom: 8 }}>Live Demo</div>
          <h1 style={{ fontSize: 32, fontWeight: 800, color: DARK, margin: "0 0 12px", letterSpacing: "-1px" }}>
            Talk to a Real AI Agent
          </h1>
          <p style={{ color: GRAY, fontSize: 16, margin: 0 }}>
            Select an industry, ask a real work question, and see exactly how WorkforceAutomated handles it.
            No signup required — {MAX_FREE_MESSAGES} free messages.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "260px 1fr", gap: 24, alignItems: "start" }}>
          {/* Industry Selector */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 12 }}>
              Select Industry
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {INDUSTRIES.map(ind => (
                <button
                  key={ind.id}
                  onClick={() => handleIndustryChange(ind)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 10,
                    padding: "10px 14px",
                    borderRadius: 8,
                    border: "none",
                    cursor: "pointer",
                    textAlign: "left",
                    background: selectedIndustry.id === ind.id ? "#f0fdfa" : "transparent",
                    color: selectedIndustry.id === ind.id ? TEAL : DARK,
                    fontWeight: selectedIndustry.id === ind.id ? 700 : 400,
                    fontSize: 13,
                    transition: "all 0.15s",
                  }}
                >
                  <span style={{ fontSize: 16 }}>{ind.emoji}</span>
                  {ind.label}
                </button>
              ))}
            </div>

            {/* Agent info */}
            <div style={{ marginTop: 24, padding: 16, background: LIGHT_BG, borderRadius: 8 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: GRAY, letterSpacing: 1, textTransform: "uppercase", marginBottom: 8 }}>Active Agent</div>
              <div style={{ fontSize: 13, fontWeight: 700, color: DARK }}>{selectedIndustry.emoji} {selectedIndustry.role}</div>
              <div style={{ fontSize: 12, color: GRAY, marginTop: 4 }}>{selectedIndustry.label} specialist</div>
              <div style={{ marginTop: 12, display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#22c55e", display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#16a34a", fontWeight: 600 }}>Online — Ready</span>
              </div>
            </div>
          </div>

          {/* Chat Window */}
          <div style={{ display: "flex", flexDirection: "column", height: 560, border: `1px solid ${BORDER}`, borderRadius: 12, overflow: "hidden", background: "#fff" }}>
            {/* Chat header */}
            <div style={{ padding: "14px 20px", borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 18 }}>
                {selectedIndustry.emoji}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: DARK }}>{selectedIndustry.role}</div>
                <div style={{ fontSize: 12, color: GRAY }}>WorkforceAutomated AI · {selectedIndustry.label}</div>
              </div>
              {!isLimitReached && (
                <div style={{ marginLeft: "auto", fontSize: 12, color: GRAY }}>
                  {remainingMessages} message{remainingMessages !== 1 ? "s" : ""} remaining
                </div>
              )}
            </div>

            {/* Messages */}
            <div style={{ flex: 1, overflowY: "auto", padding: "20px", display: "flex", flexDirection: "column", gap: 16 }}>
              {messages.length === 0 && (
                <div style={{ textAlign: "center", paddingTop: 40 }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{selectedIndustry.emoji}</div>
                  <div style={{ fontWeight: 700, color: DARK, marginBottom: 8 }}>Ask me anything about {selectedIndustry.label}</div>
                  <div style={{ color: GRAY, fontSize: 13, marginBottom: 24 }}>I'm trained on real {selectedIndustry.label} workflows and best practices.</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8, maxWidth: 420, margin: "0 auto" }}>
                    {prompts.map((p, i) => (
                      <button
                        key={i}
                        onClick={() => sendMessage(p)}
                        style={{
                          padding: "10px 16px",
                          borderRadius: 8,
                          border: `1px solid ${BORDER}`,
                          background: LIGHT_BG,
                          color: DARK,
                          fontSize: 13,
                          cursor: "pointer",
                          textAlign: "left",
                          lineHeight: 1.4,
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <div key={i} style={{ display: "flex", justifyContent: msg.role === "user" ? "flex-end" : "flex-start" }}>
                  {msg.role === "assistant" && (
                    <div style={{ width: 28, height: 28, borderRadius: "50%", background: "#f0fdfa", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, marginRight: 10, flexShrink: 0, marginTop: 2 }}>
                      {selectedIndustry.emoji}
                    </div>
                  )}
                  <div
                    style={{
                      maxWidth: "75%",
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "18px 18px 4px 18px" : "4px 18px 18px 18px",
                      background: msg.role === "user" ? TEAL : LIGHT_BG,
                      color: msg.role === "user" ? "#fff" : DARK,
                      fontSize: 14,
                      lineHeight: 1.6,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {msg.content || (msg.streaming ? <span style={{ opacity: 0.5 }}>●●●</span> : "")}
                    {msg.streaming && msg.content && <span style={{ opacity: 0.5 }}>▌</span>}
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Input area */}
            <div style={{ padding: "12px 16px", borderTop: `1px solid ${BORDER}`, background: "#fff" }}>
              {isLimitReached ? (
                <div style={{ textAlign: "center", padding: "12px 0" }}>
                  <div style={{ color: DARK, fontWeight: 600, marginBottom: 8 }}>You've used your 5 free messages</div>
                  <div style={{ color: GRAY, fontSize: 13, marginBottom: 12 }}>Sign up for unlimited access to all 22 industry agents.</div>
                  <Link
                    to="/register"
                    style={{ background: TEAL, color: "#fff", padding: "10px 24px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 14 }}
                  >
                    Start Free Trial — No Credit Card
                  </Link>
                </div>
              ) : (
                <div style={{ display: "flex", gap: 10, alignItems: "flex-end" }}>
                  <textarea
                    ref={inputRef}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={`Ask the ${selectedIndustry.role} anything...`}
                    rows={2}
                    style={{
                      flex: 1,
                      padding: "10px 14px",
                      borderRadius: 8,
                      border: `1px solid ${BORDER}`,
                      fontSize: 14,
                      resize: "none",
                      outline: "none",
                      fontFamily: "inherit",
                      lineHeight: 1.5,
                    }}
                    disabled={isLoading}
                  />
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={isLoading || !input.trim()}
                    style={{
                      background: isLoading || !input.trim() ? "#d1d5db" : TEAL,
                      color: "#fff",
                      border: "none",
                      borderRadius: 8,
                      padding: "10px 18px",
                      fontWeight: 700,
                      fontSize: 14,
                      cursor: isLoading || !input.trim() ? "not-allowed" : "pointer",
                      height: 44,
                      flexShrink: 0,
                    }}
                  >
                    {isLoading ? "..." : "Send"}
                  </button>
                </div>
              )}
              {!isLimitReached && (
                <div style={{ fontSize: 11, color: GRAY, marginTop: 6 }}>
                  Press Enter to send · Shift+Enter for new line
                </div>
              )}
            </div>
          </div>
        </div>

        {/* CTA below */}
        <div style={{ marginTop: 48, textAlign: "center", padding: "40px 0", borderTop: `1px solid ${BORDER}` }}>
          <div style={{ fontWeight: 800, fontSize: 22, color: DARK, marginBottom: 8 }}>
            Ready to deploy agents across your entire organization?
          </div>
          <div style={{ color: GRAY, marginBottom: 24 }}>
            All 22 industries. Unlimited executions. Full audit trail. Start in under 5 minutes.
          </div>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <Link to="/register" style={{ background: TEAL, color: "#fff", padding: "12px 28px", borderRadius: 8, fontWeight: 700, textDecoration: "none", fontSize: 15 }}>
              Start Free Trial
            </Link>
            <Link to="/industries" style={{ background: "transparent", color: DARK, padding: "12px 28px", borderRadius: 8, fontWeight: 600, textDecoration: "none", fontSize: 15, border: `1px solid ${BORDER}` }}>
              View All 22 Industries
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
