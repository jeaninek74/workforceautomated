import { Link } from "react-router-dom";
import { haptic } from "@/hooks/useHaptic";

const TEAL = "#0d9488";
const TEAL_LIGHT = "#f0fdfa";
const TEAL_BORDER = "#99f6e4";
const GRAY_TEXT = "#6b7280";
const DARK = "#111827";
const DIVIDER = "1px solid #e5e7eb";
const PURPLE = "#7c3aed";
const PURPLE_LIGHT = "#f5f3ff";
const PURPLE_BORDER = "#c4b5fd";

export default function SlackPage() {
  return (
    <div style={{ fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif", background: "#fff", color: DARK, minHeight: "100vh" }}>

      {/* Nav */}
      <nav style={{ background: "#fff", borderBottom: DIVIDER, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 48px", height: 60, position: "sticky", top: 0, zIndex: 100 }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }} onClick={() => haptic("selection")}>
          <div style={{ width: 30, height: 30, background: TEAL, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" /></svg>
          </div>
          <span style={{ fontWeight: 700, fontSize: 15, color: DARK }}>WorkforceAutomated</span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/demo" style={{ color: TEAL, fontSize: 14, fontWeight: 600, textDecoration: "none" }} onClick={() => haptic("selection")}>Demo</Link>
          <Link to="/login" style={{ color: GRAY_TEXT, fontSize: 14, fontWeight: 500, textDecoration: "none" }} onClick={() => haptic("selection")}>Sign in</Link>
          <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 600, textDecoration: "none", padding: "7px 18px", borderRadius: 7 }} onClick={() => haptic("medium")}>Get started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: PURPLE_LIGHT, borderBottom: `1px solid ${PURPLE_BORDER}`, padding: "64px 48px 56px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto", textAlign: "center" }}>
          <div style={{ fontSize: 52, marginBottom: 16 }}>💬</div>
          <h1 style={{ fontSize: 38, fontWeight: 900, color: DARK, margin: "0 0 16px", lineHeight: 1.15, letterSpacing: "-0.02em" }}>
            Your AI sends you messages in Slack
          </h1>
          <p style={{ fontSize: 18, color: "#374151", lineHeight: 1.75, margin: "0 0 28px", maxWidth: 600, marginLeft: "auto", marginRight: "auto" }}>
            When your AI finishes a job, it tells you in Slack. When it gets stuck, it asks you in Slack. You say yes or no — and it keeps going. That is the whole thing.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: PURPLE, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", padding: "12px 28px", borderRadius: 8 }} onClick={() => haptic("medium")}>
              Try it free
            </Link>
            <Link to="/demo" style={{ background: "#fff", color: PURPLE, fontSize: 15, fontWeight: 600, textDecoration: "none", padding: "12px 28px", borderRadius: 8, border: `1.5px solid ${PURPLE_BORDER}` }} onClick={() => haptic("selection")}>
              See the demo
            </Link>
          </div>
        </div>
      </section>

      {/* The Simple Explanation */}
      <section style={{ padding: "64px 48px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>The simple version</h2>
        <p style={{ fontSize: 28, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          Think of it like texting a really fast helper
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {[
            {
              emoji: "🤖",
              title: "Your AI does the work",
              desc: "You give your AI a job — like \"review all the invoices that came in today\" or \"check which sales leads haven't been followed up.\" It goes off and does it, fast.",
            },
            {
              emoji: "💬",
              title: "It texts you in Slack when it's done",
              desc: "When it finishes, it sends a message to your Slack — the same app you already use for work chat. The message says what it did, how confident it was, and what happened.",
            },
            {
              emoji: "❓",
              title: "If it's not sure, it asks you first",
              desc: "Sometimes the AI isn't 100% sure what to do. Instead of guessing and getting it wrong, it stops and sends you a message asking: \"Hey, I found this weird invoice for $67,000 with no purchase order. Should I approve it or flag it?\"",
            },
            {
              emoji: "✅",
              title: "You tap Yes or No — that's it",
              desc: "Right in the Slack message, there are two buttons: Approve and Reject. You tap one. The AI sees your answer and keeps going. You never have to open a dashboard or log into anything.",
            },
            {
              emoji: "📱",
              title: "Works on your phone",
              desc: "Because it's just Slack, you can approve things from your phone while you're in a meeting, at lunch, or on the couch. The AI is waiting for your answer and picks right back up the second you reply.",
            },
          ].map((item, i) => (
            <div key={i} style={{ display: "flex", gap: 20, padding: "24px", background: i % 2 === 0 ? "#f9fafb" : PURPLE_LIGHT, borderRadius: 14, border: `1px solid ${i % 2 === 0 ? "#e5e7eb" : PURPLE_BORDER}` }}>
              <div style={{ flexShrink: 0, fontSize: 32 }}>{item.emoji}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: DARK, marginBottom: 8 }}>{item.title}</div>
                <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, margin: 0 }}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Real example */}
      <section style={{ background: "#f8fafc", borderTop: DIVIDER, borderBottom: DIVIDER, padding: "64px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>A real example</h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            Here is exactly what happens, step by step
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
            {[
              { step: "1", color: TEAL, bg: TEAL_LIGHT, border: TEAL_BORDER, text: "It is 9:00 AM. Your Invoice Reviewer AI starts its morning run. It has 47 invoices to check." },
              { step: "2", color: TEAL, bg: TEAL_LIGHT, border: TEAL_BORDER, text: "By 9:03 AM it has already reviewed 44 of them. All clear — it approves them automatically and moves on." },
              { step: "3", color: PURPLE, bg: PURPLE_LIGHT, border: PURPLE_BORDER, text: "Invoice #2043 looks weird. It is for $67,000 but there is no purchase order attached. The AI is only 42% sure what to do." },
              { step: "4", color: PURPLE, bg: PURPLE_LIGHT, border: PURPLE_BORDER, text: "Your phone buzzes. It is a Slack message from your AI: \"I found an invoice for $67,000 from Vendor X with no PO attached. Confidence: 42%. Approve or flag for review?\"" },
              { step: "5", color: "#d97706", bg: "#fffbeb", border: "#fcd34d", text: "You are in a meeting. You glance at your phone, tap Reject, and put your phone back down. Takes 3 seconds." },
              { step: "6", color: TEAL, bg: TEAL_LIGHT, border: TEAL_BORDER, text: "The AI sees your answer instantly. It flags the invoice, sends it to your finance manager, and finishes the remaining 2 invoices on its own." },
              { step: "7", color: TEAL, bg: TEAL_LIGHT, border: TEAL_BORDER, text: "At 9:07 AM you get a final Slack message: \"Done. 46 approved, 1 flagged for review. Full report attached.\" Your whole morning just got handled in 7 minutes." },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", gap: 0 }}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginRight: 20 }}>
                  <div style={{ width: 36, height: 36, borderRadius: "50%", background: item.bg, border: `2px solid ${item.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 14, color: item.color, flexShrink: 0 }}>{item.step}</div>
                  {i < 6 && <div style={{ width: 2, flex: 1, background: "#e5e7eb", margin: "4px 0" }} />}
                </div>
                <div style={{ paddingBottom: 24, paddingTop: 6 }}>
                  <p style={{ fontSize: 15, color: "#374151", lineHeight: 1.75, margin: 0 }}>{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* What you see in Slack */}
      <section style={{ padding: "64px 48px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>What the message looks like</h2>
        <p style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          A simple message in your Slack channel
        </p>

        {/* Mock Slack message */}
        <div style={{ background: "#1a1d21", borderRadius: 14, padding: "24px 28px", fontFamily: "monospace" }}>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
            <div style={{ width: 36, height: 36, background: PURPLE, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, fontSize: 18 }}>🤖</div>
            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ color: "#fff", fontWeight: 700, fontSize: 14, fontFamily: "sans-serif" }}>WorkforceAutomated</span>
                <span style={{ background: "#2c5f2e", color: "#4ade80", fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 4, fontFamily: "sans-serif" }}>APP</span>
                <span style={{ color: "#6b7280", fontSize: 12, fontFamily: "sans-serif" }}>9:03 AM</span>
              </div>
              <div style={{ background: "#222529", borderRadius: 8, padding: "16px 18px", borderLeft: `4px solid ${PURPLE}` }}>
                <div style={{ color: "#e5e7eb", fontSize: 14, lineHeight: 1.7, fontFamily: "sans-serif" }}>
                  <div style={{ fontWeight: 700, color: "#fff", marginBottom: 8, fontSize: 15 }}>⚠️ Invoice needs your review</div>
                  <div style={{ marginBottom: 4 }}>📄 <strong style={{ color: "#fff" }}>Invoice #2043</strong> — Vendor X</div>
                  <div style={{ marginBottom: 4 }}>💰 Amount: <strong style={{ color: "#fff" }}>$67,000</strong></div>
                  <div style={{ marginBottom: 4 }}>❌ Missing: Purchase Order</div>
                  <div style={{ marginBottom: 16 }}>🤔 AI confidence: <strong style={{ color: "#f59e0b" }}>42%</strong> — not sure what to do</div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <div style={{ background: "#16a34a", color: "#fff", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>✅ Approve</div>
                    <div style={{ background: "#dc2626", color: "#fff", padding: "8px 20px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>❌ Flag for review</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <p style={{ fontSize: 13, color: GRAY_TEXT, marginTop: 12, textAlign: "center" }}>This is what shows up in your Slack. Tap a button. Done.</p>
      </section>

      {/* How to set it up */}
      <section style={{ background: PURPLE_LIGHT, borderTop: `1px solid ${PURPLE_BORDER}`, borderBottom: `1px solid ${PURPLE_BORDER}`, padding: "64px 48px" }}>
        <div style={{ maxWidth: 800, margin: "0 auto" }}>
          <h2 style={{ fontSize: 13, fontWeight: 700, color: PURPLE, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Setup</h2>
          <p style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 8px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
            Takes 2 minutes to connect
          </p>
          <p style={{ fontSize: 16, color: GRAY_TEXT, margin: "0 0 40px", lineHeight: 1.6 }}>
            No IT department needed. No special permissions. Just copy and paste one link.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[
              { num: "1", title: "Go to api.slack.com/apps", desc: "Open that website. It is free. You will see a button that says \"Create New App.\" Click it." },
              { num: "2", title: "Create a Slack app in 30 seconds", desc: "Give it any name — like \"WorkforceAutomated.\" Pick your Slack workspace. Click Create." },
              { num: "3", title: "Turn on Incoming Webhooks", desc: "In the left menu click \"Incoming Webhooks.\" Flip the switch to On. Then click \"Add New Webhook to Workspace.\" Pick the channel where you want the AI to send messages — like #general or #finance-alerts." },
              { num: "4", title: "Copy the webhook URL", desc: "Slack gives you a link that starts with https://hooks.slack.com/services/... Copy that whole link." },
              { num: "5", title: "Paste it in WorkforceAutomated", desc: "In your WorkforceAutomated account, go to Settings → Notifications → Slack. Paste the link. Click Save. Done — your AI will now talk to you through Slack." },
            ].map((item) => (
              <div key={item.num} style={{ display: "flex", gap: 18, background: "#fff", borderRadius: 12, padding: "20px 24px", border: `1px solid ${PURPLE_BORDER}` }}>
                <div style={{ width: 36, height: 36, borderRadius: "50%", background: PURPLE, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15, color: "#fff", flexShrink: 0 }}>{item.num}</div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 6 }}>{item.title}</div>
                  <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ padding: "64px 48px", maxWidth: 800, margin: "0 auto" }}>
        <h2 style={{ fontSize: 13, fontWeight: 700, color: TEAL, textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 10px" }}>Questions</h2>
        <p style={{ fontSize: 26, fontWeight: 800, color: DARK, margin: "0 0 32px", lineHeight: 1.25, letterSpacing: "-0.01em" }}>
          Simple answers
        </p>

        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { q: "Do I need to pay for Slack?", a: "No. Slack has a free plan that works perfectly for this. You do not need to pay anything extra." },
            { q: "What if I don't use Slack?", a: "Slack is free to sign up for at slack.com. It takes about 2 minutes. Or you can just use the dashboard inside WorkforceAutomated — the Slack part is optional." },
            { q: "Can I choose which channel the AI posts in?", a: "Yes. When you set it up, you pick exactly which Slack channel gets the messages. You can create a dedicated channel just for your AI, like #ai-updates." },
            { q: "What if I ignore the message?", a: "The AI waits. It will not do anything until you respond. It will also send a reminder if you have not replied after a while." },
            { q: "Can multiple people approve things?", a: "Yes. If you add the webhook to a shared channel, anyone in that channel can see the message and tap Approve or Reject." },
            { q: "Is it secure?", a: "Yes. The messages only go to your Slack workspace. Nobody else can see them. The AI never sends your private business data to any outside service." },
          ].map((item, i) => (
            <div key={i} style={{ padding: "20px 0", borderTop: DIVIDER }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: DARK, marginBottom: 8 }}>{item.q}</div>
              <p style={{ fontSize: 14, color: GRAY_TEXT, lineHeight: 1.7, margin: 0 }}>{item.a}</p>
            </div>
          ))}
          <div style={{ borderTop: DIVIDER }} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: DARK, padding: "64px 48px", textAlign: "center" }}>
        <div style={{ maxWidth: 600, margin: "0 auto" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>💬</div>
          <h2 style={{ fontSize: 28, fontWeight: 800, color: "#fff", margin: "0 0 12px", lineHeight: 1.25 }}>
            Ready to have your AI talk to you in Slack?
          </h2>
          <p style={{ fontSize: 16, color: "#9ca3af", margin: "0 0 32px", lineHeight: 1.6 }}>
            Start free. Connect Slack in 2 minutes. Your AI will be messaging you before lunch.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/register" style={{ background: TEAL, color: "#fff", fontSize: 15, fontWeight: 700, textDecoration: "none", padding: "13px 32px", borderRadius: 8 }} onClick={() => haptic("medium")}>
              Get started free
            </Link>
            <Link to="/demo" style={{ background: "transparent", color: "#fff", fontSize: 15, fontWeight: 600, textDecoration: "none", padding: "13px 32px", borderRadius: 8, border: "1.5px solid #374151" }} onClick={() => haptic("selection")}>
              See the demo first
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: "#fff", borderTop: DIVIDER, padding: "24px 48px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <span style={{ fontSize: 13, color: GRAY_TEXT }}>© 2025 WorkforceAutomated. All rights reserved.</span>
        <div style={{ display: "flex", gap: 20, alignItems: "center" }}>
          <a href="mailto:contact@workforceautomated.com" style={{ fontSize: 13, color: GRAY_TEXT, textDecoration: "none" }}>contact@workforceautomated.com</a>
          <Link to="/privacy" style={{ fontSize: 13, color: GRAY_TEXT, textDecoration: "none" }}>Privacy</Link>
          <Link to="/terms" style={{ fontSize: 13, color: GRAY_TEXT, textDecoration: "none" }}>Terms</Link>
        </div>
      </footer>

    </div>
  );
}
