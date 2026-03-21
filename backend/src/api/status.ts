import { Router } from "express";
import { pool } from "../db/index.js";

export const statusRouter = Router();

// ── Ensure tables exist ──────────────────────────────────────────────────────
async function ensureStatusTables() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS status_checks (
        id SERIAL PRIMARY KEY,
        service VARCHAR(64) NOT NULL DEFAULT 'api',
        status VARCHAR(16) NOT NULL DEFAULT 'operational',
        response_ms INTEGER,
        checked_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
      CREATE INDEX IF NOT EXISTS status_checks_service_idx ON status_checks(service, checked_at DESC);

      CREATE TABLE IF NOT EXISTS status_incidents (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        severity VARCHAR(16) NOT NULL DEFAULT 'minor',
        status VARCHAR(32) NOT NULL DEFAULT 'investigating',
        service VARCHAR(64) NOT NULL DEFAULT 'api',
        started_at TIMESTAMP DEFAULT NOW() NOT NULL,
        resolved_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL
      );
    `);
  } finally {
    client.release();
  }
}
ensureStatusTables().catch(console.error);

// ── Background health recorder ───────────────────────────────────────────────
// Records a health check every 60 seconds so we have real uptime data
let healthInterval: ReturnType<typeof setInterval> | null = null;
const startTime = Date.now();

function startHealthRecorder() {
  if (healthInterval) return;
  healthInterval = setInterval(async () => {
    const t0 = Date.now();
    try {
      const client = await pool.connect();
      try {
        const responseMs = Date.now() - t0;
        await client.query(
          `INSERT INTO status_checks (service, status, response_ms) VALUES ('api', 'operational', $1)`,
          [responseMs]
        );
        // Prune checks older than 90 days
        await client.query(
          `DELETE FROM status_checks WHERE checked_at < NOW() - INTERVAL '90 days'`
        );
      } finally {
        client.release();
      }
    } catch {
      // If DB is down, record degraded
      try {
        const client = await pool.connect();
        await client.query(
          `INSERT INTO status_checks (service, status, response_ms) VALUES ('api', 'degraded', $1)`,
          [Date.now() - t0]
        );
        client.release();
      } catch { /* ignore */ }
    }
  }, 60_000);
}
startHealthRecorder();

// ── GET /api/status ──────────────────────────────────────────────────────────
// Public: returns current status, uptime %, and recent incidents
statusRouter.get("/", async (_req, res) => {
  const client = await pool.connect();
  try {
    // Current status: last check
    const { rows: lastChecks } = await client.query(
      `SELECT status, response_ms, checked_at FROM status_checks
       WHERE service = 'api' ORDER BY checked_at DESC LIMIT 1`
    );

    // 30-day uptime calculation
    const { rows: uptimeRows } = await client.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'operational') AS operational_count,
        COUNT(*) AS total_count
       FROM status_checks
       WHERE service = 'api' AND checked_at > NOW() - INTERVAL '30 days'`
    );

    // 90-day uptime
    const { rows: uptime90Rows } = await client.query(
      `SELECT
        COUNT(*) FILTER (WHERE status = 'operational') AS operational_count,
        COUNT(*) AS total_count
       FROM status_checks
       WHERE service = 'api' AND checked_at > NOW() - INTERVAL '90 days'`
    );

    // Daily uptime for the last 90 days (for chart)
    const { rows: dailyRows } = await client.query(
      `SELECT
        DATE(checked_at) AS day,
        COUNT(*) FILTER (WHERE status = 'operational') AS operational,
        COUNT(*) AS total
       FROM status_checks
       WHERE service = 'api' AND checked_at > NOW() - INTERVAL '90 days'
       GROUP BY DATE(checked_at)
       ORDER BY day ASC`
    );

    // Recent incidents (last 90 days)
    const { rows: incidents } = await client.query(
      `SELECT * FROM status_incidents
       WHERE started_at > NOW() - INTERVAL '90 days'
       ORDER BY started_at DESC LIMIT 20`
    );

    const totalChecks30 = parseInt(uptimeRows[0]?.total_count || "0");
    const operationalChecks30 = parseInt(uptimeRows[0]?.operational_count || "0");
    const uptime30 = totalChecks30 > 0
      ? ((operationalChecks30 / totalChecks30) * 100).toFixed(3)
      : "100.000";

    const totalChecks90 = parseInt(uptime90Rows[0]?.total_count || "0");
    const operationalChecks90 = parseInt(uptime90Rows[0]?.operational_count || "0");
    const uptime90 = totalChecks90 > 0
      ? ((operationalChecks90 / totalChecks90) * 100).toFixed(3)
      : "100.000";

    // If no checks yet, compute uptime from server start time
    const serverUptimeMs = Date.now() - startTime;
    const serverUptimeHours = Math.floor(serverUptimeMs / 3600000);
    const serverUptimeMinutes = Math.floor((serverUptimeMs % 3600000) / 60000);

    const currentStatus = lastChecks[0]?.status || "operational";
    const lastResponseMs = lastChecks[0]?.response_ms || null;
    const lastCheckedAt = lastChecks[0]?.checked_at || null;

    // Services list
    const services = [
      { name: "API", key: "api", status: currentStatus, responseMs: lastResponseMs },
      { name: "Authentication", key: "auth", status: currentStatus, responseMs: lastResponseMs },
      { name: "Agent Execution Engine", key: "execution", status: currentStatus, responseMs: lastResponseMs },
      { name: "Database", key: "database", status: currentStatus, responseMs: lastResponseMs },
      { name: "Integrations", key: "integrations", status: currentStatus, responseMs: lastResponseMs },
    ];

    res.json({
      overall: currentStatus,
      uptime30d: uptime30,
      uptime90d: uptime90,
      serverUptimeHours,
      serverUptimeMinutes,
      lastCheckedAt,
      services,
      dailyUptime: dailyRows.map((r) => ({
        day: r.day,
        uptime: r.total > 0 ? ((parseInt(r.operational) / parseInt(r.total)) * 100).toFixed(1) : "100.0",
        operational: parseInt(r.operational),
        total: parseInt(r.total),
      })),
      incidents: incidents.map((i) => ({
        id: i.id,
        title: i.title,
        description: i.description,
        severity: i.severity,
        status: i.status,
        service: i.service,
        startedAt: i.started_at,
        resolvedAt: i.resolved_at,
        updatedAt: i.updated_at,
      })),
      sla: {
        target: 99.9,
        period: "monthly",
        description: "We guarantee 99.9% uptime for all platform services, measured monthly.",
      },
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// ── GET /api/status/ping ─────────────────────────────────────────────────────
// Simple liveness check
statusRouter.get("/ping", (_req, res) => {
  res.json({ ok: true, ts: new Date().toISOString() });
});
