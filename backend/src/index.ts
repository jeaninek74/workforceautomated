import "dotenv/config";
import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { rateLimit } from "express-rate-limit";
import { authRouter } from "./api/auth.js";
import { agentsRouter } from "./api/agents.js";
import { teamsRouter } from "./api/teams.js";
import { executionsRouter } from "./api/executions.js";
import { auditRouter } from "./api/audit.js";
import { billingRouter } from "./api/billing.js";
import { metricsRouter } from "./api/metrics.js";
import { kpiRouter } from "./api/kpi.js";
import { governanceRouter } from "./api/governance.js";
import { stripeWebhookRouter } from "./api/stripeWebhook.js";
import { integrationsRouter } from "./api/integrations.js";
import { notificationsRouter } from "./api/notifications.js";
import reviewsRouter from "./api/reviews.js";
import agentTemplatesRouter from "./api/agentTemplates.js";
import schedulesRouter from "./api/schedules.js";
import reportsRouter from "./api/reports.js";
import securityRouter from "./api/security.js";
import demoRouter from "./api/demo.js";
import { customBuildRouter } from "./api/customBuild.js";
import { ssoRouter } from "./api/sso.js";
import { outputPreferencesRouter } from "./api/outputPreferences.js";
import { statusRouter } from "./api/status.js";
import { startReportScheduler } from "./services/reportScheduler.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { db as _db } from "./db/index.js";
import { users as _users } from "./db/schema.js";
import { eq as _eq } from "drizzle-orm";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
const corsOrigins = process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : undefined;
if (!corsOrigins) {
  console.warn("FRONTEND_URL not set — CORS will reject cross-origin requests. Set FRONTEND_URL to allow specific origins.");
}
app.use(
  cors({
    origin: corsOrigins || false,
    credentials: true,
  })
);

// Stripe webhook MUST come before json middleware
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhookRouter
);

app.use(compression() as any);
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use("/api/", limiter);

app.use("/api/auth", authRouter);
app.use("/api/agents", agentsRouter);
app.use("/api/teams", teamsRouter);
app.use("/api/executions", executionsRouter);
app.use("/api/audit", auditRouter);
app.use("/api/billing", billingRouter);
app.use("/api/metrics", metricsRouter);
app.use("/api/kpi", kpiRouter);
app.use("/api/governance", governanceRouter);
app.use("/api/integrations", integrationsRouter);
app.use("/api/notifications", notificationsRouter);
app.use("/api/reviews", reviewsRouter);
app.use("/api/schedules", schedulesRouter);
app.use("/api/reports", reportsRouter);
app.use("/api/agent-templates", agentTemplatesRouter);
app.use("/api/security", securityRouter);
app.use("/api/demo", demoRouter);
app.use("/api/custom-build", customBuildRouter);
app.use("/api/sso", ssoRouter);
app.use("/api/output-preferences", outputPreferencesRouter);
app.use("/api/status", statusRouter);

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  // nixpacks copies frontend/dist -> backend/dist/public during build
  const frontendPath = path.join(__dirname, "public");
  // Serve static assets with long cache (they have content-hashed filenames)
  app.use(express.static(frontendPath, {
    setHeaders: (res, filePath) => {
      if (filePath.endsWith(".html")) {
        // HTML files must never be cached — forces browser/CDN to always fetch fresh
        res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
        res.setHeader("Pragma", "no-cache");
        res.setHeader("Expires", "0");
      } else {
        // JS/CSS/images with hashed names can be cached for 1 year
        res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }));
  app.get("*", (_req, res) => {
    res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", "0");
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(errorHandler);

// Start scheduled report delivery cron job
startReportScheduler();

// One-time: ensure test accounts have the correct plan assigned
(async () => {
  const testAccounts = [
    { email: "test.starter@workforceautomated.com", plan: "starter" as const },
    { email: "test.pro@workforceautomated.com", plan: "professional" as const },
    { email: "test.enterprise@workforceautomated.com", plan: "enterprise" as const },
  ];
  for (const acct of testAccounts) {
    try {
      const [row] = await _db.select({ plan: _users.plan }).from(_users).where(_eq(_users.email, acct.email));
      if (row && row.plan !== acct.plan) {
        await _db.update(_users).set({ plan: acct.plan }).where(_eq(_users.email, acct.email));
        console.log(`[seed] Updated ${acct.email} → ${acct.plan}`);
      }
    } catch (_e) { /* ignore */ }
  }
})();

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WorkforceAutomated API running on port ${PORT}`);
});

export default app;
