import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "@/lib/api";
import { haptic } from "@/hooks/useHaptic";
import {
  Bot, Play, Shield, Link2, Bell, CheckCircle2, ChevronRight,
  X, MessageSquare, Slack, Mail, Zap, ArrowRight
} from "lucide-react";

interface OnboardingStep {
  id: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  action: string;
  path: string;
  tip?: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: "create_agent",
    icon: <Bot size={20} />,
    title: "Create your first AI agent",
    description: "An agent is your AI worker. Give it a name, a role, and a task — it will execute it autonomously.",
    action: "Build an Agent",
    path: "/agents/new",
    tip: "Tip: Paste a job description or upload one to auto-configure your agent in seconds.",
  },
  {
    id: "run_agent",
    icon: <Play size={20} />,
    title: "Run your agent on a task",
    description: "Go to Executions and give your agent a task. It will process it, score its own confidence, and return a result.",
    action: "Run a Task",
    path: "/executions",
    tip: "Tip: Your agent will tell you its confidence score. If it's unsure, it will stop and ask you before proceeding.",
  },
  {
    id: "talk_to_agent",
    icon: <MessageSquare size={20} />,
    title: "Talk to your agent",
    description: "When your agent needs input or has a question, it will notify you. You can respond directly in the Review Queue — or connect Slack so it messages you there.",
    action: "Open Review Queue",
    path: "/reviews",
    tip: "Where to talk to your agent: Review Queue (in-app) · Slack (connect in Settings → Slack) · Email (configure in Settings → Notifications)",
  },
  {
    id: "set_governance",
    icon: <Shield size={20} />,
    title: "Set your confidence threshold",
    description: "Tell the platform when the AI should stop and ask you. Set a threshold — anything below it gets escalated to you automatically.",
    action: "Configure Governance",
    path: "/governance",
    tip: "Tip: Start at 0.7 (70% confidence). The AI will ask you any time it's less than 70% sure.",
  },
  {
    id: "connect_slack",
    icon: <Slack size={20} />,
    title: "Connect Slack for real-time alerts",
    description: "When your agent has a question or completes a task, get notified instantly in Slack. Your agent will message your channel directly.",
    action: "Connect Slack",
    path: "/settings?tab=slack",
    tip: "How it works: Agent escalates → Slack message sent to your channel → You approve or reject → Agent continues.",
  },
  {
    id: "connect_integrations",
    icon: <Link2 size={20} />,
    title: "Connect your tools",
    description: "Link your CRM, HR system, or data sources so your agent can read and write data automatically.",
    action: "Add Integrations",
    path: "/integrations",
    tip: "Tip: Connect your backend API or database so the agent can pull real data instead of working from text alone.",
  },
];

interface OnboardingState {
  hasAgents: boolean;
  hasExecutions: boolean;
  hasGovernance: boolean;
  hasIntegrations: boolean;
  hasSlack: boolean;
  dismissed: boolean;
}

export default function OnboardingBanner() {
  const navigate = useNavigate();
  const [state, setState] = useState<OnboardingState>({
    hasAgents: false,
    hasExecutions: false,
    hasGovernance: false,
    hasIntegrations: false,
    hasSlack: false,
    dismissed: false,
  });
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    // Check if user dismissed the banner this session
    const dismissed = sessionStorage.getItem("onboarding_dismissed") === "true";
    if (dismissed) {
      setState(s => ({ ...s, dismissed: true }));
      setLoading(false);
      return;
    }

    const checkState = async () => {
      try {
        const [agentsRes, execRes, govRes, intRes, notifRes] = await Promise.allSettled([
          api.get("/api/agents?limit=1"),
          api.get("/api/executions?limit=1"),
          api.get("/api/governance/settings"),
          api.get("/api/integrations?limit=1"),
          api.get("/api/notifications/settings"),
        ]);

        const hasAgents = agentsRes.status === "fulfilled" && (agentsRes.value.data?.agents?.length > 0 || agentsRes.value.data?.total > 0);
        const hasExecutions = execRes.status === "fulfilled" && (execRes.value.data?.executions?.length > 0 || execRes.value.data?.total > 0);
        const hasGovernance = govRes.status === "fulfilled" && govRes.value.data?.globalEscalationThreshold !== undefined && govRes.value.data?.globalEscalationThreshold !== 0.5;
        const hasIntegrations = intRes.status === "fulfilled" && (intRes.value.data?.integrations?.length > 0 || intRes.value.data?.total > 0);
        const hasSlack = notifRes.status === "fulfilled" && !!notifRes.value.data?.slackWebhookUrl;

        setState(s => ({
          ...s,
          hasAgents,
          hasExecutions,
          hasGovernance,
          hasIntegrations,
          hasSlack,
        }));
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
      }
    };

    checkState();
  }, []);

  const dismiss = () => {
    haptic("light");
    sessionStorage.setItem("onboarding_dismissed", "true");
    setState(s => ({ ...s, dismissed: true }));
  };

  const isStepComplete = (stepId: string): boolean => {
    switch (stepId) {
      case "create_agent": return state.hasAgents;
      case "run_agent": return state.hasExecutions;
      case "talk_to_agent": return state.hasExecutions; // available once they've run an agent
      case "set_governance": return state.hasGovernance;
      case "connect_slack": return state.hasSlack;
      case "connect_integrations": return state.hasIntegrations;
      default: return false;
    }
  };

  const completedCount = STEPS.filter(s => isStepComplete(s.id)).length;
  const allComplete = completedCount === STEPS.length;

  // Find the current active step (first incomplete step)
  const activeStep = STEPS.find(s => !isStepComplete(s.id));

  if (loading || state.dismissed) return null;

  if (allComplete) {
    return (
      <div style={{
        background: "linear-gradient(135deg, rgba(16,185,129,0.12) 0%, rgba(5,150,105,0.08) 100%)",
        border: "1px solid rgba(16,185,129,0.3)",
        borderRadius: 12,
        padding: "14px 20px",
        marginBottom: 24,
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}>
        <CheckCircle2 size={20} color="#10b981" />
        <span style={{ color: "#10b981", fontWeight: 600, fontSize: 14 }}>
          You're fully set up — your AI workforce is live and ready.
        </span>
        <button onClick={dismiss} style={{ marginLeft: "auto", background: "none", border: "none", cursor: "pointer", color: "#6b7280" }}>
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div style={{
      background: "linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.06) 100%)",
      border: "1px solid rgba(99,102,241,0.25)",
      borderRadius: 12,
      marginBottom: 24,
      overflow: "hidden",
    }}>
      {/* Header bar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "14px 20px",
          cursor: "pointer",
        }}
        onClick={() => { haptic("selection"); setExpanded(e => !e); }}
      >
        <div style={{
          background: "rgba(99,102,241,0.15)",
          borderRadius: 8,
          padding: "6px 10px",
          display: "flex",
          alignItems: "center",
          gap: 6,
        }}>
          <Zap size={14} color="#818cf8" />
          <span style={{ color: "#818cf8", fontSize: 12, fontWeight: 700 }}>
            {completedCount}/{STEPS.length} steps complete
          </span>
        </div>

        {/* Progress bar */}
        <div style={{ flex: 1, height: 4, background: "rgba(99,102,241,0.15)", borderRadius: 2 }}>
          <div style={{
            height: "100%",
            width: `${(completedCount / STEPS.length) * 100}%`,
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 2,
            transition: "width 0.4s ease",
          }} />
        </div>

        {activeStep && (
          <span style={{ color: "#c7d2fe", fontSize: 13, fontWeight: 500, whiteSpace: "nowrap" }}>
            Next: {activeStep.title}
          </span>
        )}

        <ChevronRight
          size={16}
          color="#818cf8"
          style={{ transform: expanded ? "rotate(90deg)" : "rotate(0deg)", transition: "transform 0.2s" }}
        />

        <button
          onClick={(e) => { e.stopPropagation(); dismiss(); }}
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: 0 }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Active step callout — always visible */}
      {activeStep && !expanded && (
        <div style={{
          borderTop: "1px solid rgba(99,102,241,0.15)",
          padding: "14px 20px",
          display: "flex",
          alignItems: "flex-start",
          gap: 14,
        }}>
          <div style={{
            background: "rgba(99,102,241,0.2)",
            borderRadius: 8,
            padding: 8,
            color: "#818cf8",
            flexShrink: 0,
          }}>
            {activeStep.icon}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
              {activeStep.title}
            </div>
            <div style={{ color: "#a5b4fc", fontSize: 13, lineHeight: 1.5, marginBottom: activeStep.tip ? 6 : 0 }}>
              {activeStep.description}
            </div>
            {activeStep.tip && (
              <div style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                {activeStep.tip}
              </div>
            )}
          </div>
          <button
            onClick={() => { haptic("medium"); navigate(activeStep.path); }}
            style={{
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              border: "none",
              borderRadius: 8,
              color: "#fff",
              fontSize: 13,
              fontWeight: 600,
              padding: "8px 16px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0,
            }}
          >
            {activeStep.action}
            <ArrowRight size={14} />
          </button>
        </div>
      )}

      {/* Expanded: all steps */}
      {expanded && (
        <div style={{ borderTop: "1px solid rgba(99,102,241,0.15)" }}>
          {STEPS.map((step, i) => {
            const complete = isStepComplete(step.id);
            const isActive = step.id === activeStep?.id;
            return (
              <div
                key={step.id}
                style={{
                  display: "flex",
                  alignItems: "flex-start",
                  gap: 14,
                  padding: "14px 20px",
                  borderBottom: i < STEPS.length - 1 ? "1px solid rgba(99,102,241,0.08)" : "none",
                  opacity: complete ? 0.6 : 1,
                  background: isActive ? "rgba(99,102,241,0.06)" : "transparent",
                }}
              >
                {/* Step icon / check */}
                <div style={{
                  background: complete ? "rgba(16,185,129,0.15)" : "rgba(99,102,241,0.15)",
                  borderRadius: 8,
                  padding: 8,
                  color: complete ? "#10b981" : "#818cf8",
                  flexShrink: 0,
                }}>
                  {complete ? <CheckCircle2 size={20} /> : step.icon}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    color: complete ? "#6b7280" : "#e0e7ff",
                    fontWeight: 600,
                    fontSize: 14,
                    marginBottom: 4,
                    textDecoration: complete ? "line-through" : "none",
                  }}>
                    {step.title}
                  </div>
                  {!complete && (
                    <>
                      <div style={{ color: "#a5b4fc", fontSize: 13, lineHeight: 1.5, marginBottom: step.tip ? 6 : 0 }}>
                        {step.description}
                      </div>
                      {step.tip && (
                        <div style={{ color: "#6b7280", fontSize: 12, lineHeight: 1.5, fontStyle: "italic" }}>
                          {step.tip}
                        </div>
                      )}
                    </>
                  )}
                </div>

                {!complete && (
                  <button
                    onClick={() => { haptic("medium"); navigate(step.path); }}
                    style={{
                      background: isActive
                        ? "linear-gradient(135deg, #6366f1, #8b5cf6)"
                        : "rgba(99,102,241,0.15)",
                      border: "none",
                      borderRadius: 8,
                      color: isActive ? "#fff" : "#818cf8",
                      fontSize: 12,
                      fontWeight: 600,
                      padding: "7px 14px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: 5,
                      whiteSpace: "nowrap",
                      flexShrink: 0,
                    }}
                  >
                    {step.action}
                    <ArrowRight size={12} />
                  </button>
                )}
              </div>
            );
          })}

          {/* Agent communication summary card */}
          <div style={{
            margin: "0 20px 16px",
            background: "rgba(99,102,241,0.08)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: 10,
            padding: "14px 16px",
          }}>
            <div style={{ color: "#c7d2fe", fontWeight: 700, fontSize: 13, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
              <MessageSquare size={14} />
              Where and how to talk to your agent
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 10 }}>
              {[
                {
                  icon: <CheckCircle2 size={14} color="#10b981" />,
                  label: "Review Queue",
                  desc: "In-app — agent posts questions here when it needs your input. Approve or reject with one click.",
                  path: "/reviews",
                },
                {
                  icon: <Slack size={14} color="#818cf8" />,
                  label: "Slack",
                  desc: "Connect your Slack workspace in Settings → Slack. Agent messages your channel directly.",
                  path: "/settings?tab=slack",
                },
                {
                  icon: <Mail size={14} color="#f59e0b" />,
                  label: "Email",
                  desc: "Configure escalation email in Settings → Notifications. Agent sends alerts when it escalates.",
                  path: "/settings",
                },
              ].map(ch => (
                <div
                  key={ch.label}
                  onClick={() => { haptic("light"); navigate(ch.path); }}
                  style={{
                    background: "rgba(99,102,241,0.08)",
                    borderRadius: 8,
                    padding: "10px 12px",
                    cursor: "pointer",
                    border: "1px solid rgba(99,102,241,0.12)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
                    {ch.icon}
                    <span style={{ color: "#e0e7ff", fontWeight: 600, fontSize: 12 }}>{ch.label}</span>
                  </div>
                  <div style={{ color: "#6b7280", fontSize: 11, lineHeight: 1.5 }}>{ch.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
