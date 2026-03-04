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
import { errorHandler } from "./middleware/errorHandler.js";

const app = express();
const PORT = parseInt(process.env.PORT || "3001");

app.set("trust proxy", 1);
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  })
);
app.use(
  cors({
    origin: process.env.FRONTEND_URL ? process.env.FRONTEND_URL.split(",") : "*",
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
app.use(express.json({ limit: "50mb" }));
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

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString(), version: "1.0.0" });
});

// Serve frontend static files in production
if (process.env.NODE_ENV === "production") {
  // nixpacks copies frontend/dist -> backend/dist/public during build
  const frontendPath = path.join(__dirname, "public");
  app.use(express.static(frontendPath));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendPath, "index.html"));
  });
}

app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`WorkforceAutomated API running on port ${PORT}`);
});

export default app;
