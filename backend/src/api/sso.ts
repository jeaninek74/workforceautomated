import { Router } from "express";
import { z } from "zod";
import { db } from "../db/index.js";
import { authenticate, requireAdmin, type AuthRequest } from "../middleware/auth.js";
import { logAudit } from "../services/audit.js";
import { pool } from "../db/index.js";
import { URL } from "url";
import dns from "dns/promises";

// ── SSRF Protection (shared with integrations service) ───────────────────────
const PRIVATE_IP_PATTERNS = [
  /^127\./,
  /^10\./,
  /^172\.(1[6-9]|2[0-9]|3[01])\./,
  /^192\.168\./,
  /^169\.254\./,
  /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./,
  /^::1$/,
  /^fc00:/i,
  /^fd/i,
  /^fe80:/i,
  /^0\./,
];

async function assertSafeUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try { parsed = new URL(rawUrl); } catch { throw new Error(`Invalid URL: ${rawUrl}`); }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`URL protocol not allowed: ${parsed.protocol}`);
  }
  const hostname = parsed.hostname;
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) throw new Error(`URL resolves to a private/internal address and is not allowed`);
  }
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const { address } of addresses) {
      for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(address)) throw new Error(`URL resolves to a private/internal address and is not allowed`);
      }
    }
  } catch (err: any) {
    if (err.message.includes("private/internal")) throw err;
  }
}

export const ssoRouter = Router();

// ── Schema ──────────────────────────────────────────────────────────────────
const ssoConfigSchema = z.object({
  enabled: z.boolean(),
  provider: z.enum(["okta", "azure", "google", "onelogin", "ping", "custom"]).optional(),
  entityId: z.string().optional(),
  ssoUrl: z.string().url().optional().or(z.literal("")),
  certificate: z.string().optional(),
  attributeEmail: z.string().default("email"),
  attributeName: z.string().default("name"),
  forceSSO: z.boolean().default(false),
});

// ── Helpers ──────────────────────────────────────────────────────────────────
async function ensureSsoTable() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS sso_config (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT false NOT NULL,
        provider VARCHAR(64),
        entity_id TEXT,
        sso_url TEXT,
        certificate TEXT,
        attribute_email VARCHAR(128) DEFAULT 'email',
        attribute_name VARCHAR(128) DEFAULT 'name',
        force_sso BOOLEAN DEFAULT false NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW() NOT NULL,
        updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL
      );
      INSERT INTO sso_config (id, enabled) VALUES (1, false) ON CONFLICT (id) DO NOTHING;
    `);
  } finally {
    client.release();
  }
}
ensureSsoTable().catch(console.error);

// ── GET /api/sso/config ──────────────────────────────────────────────────────
// Returns config (certificate redacted for non-admins)
ssoRouter.get("/config", authenticate, async (req: AuthRequest, res) => {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT * FROM sso_config WHERE id = 1");
      const row = rows[0] || { enabled: false };
      const isAdmin = req.user?.role === "admin";
      res.json({
        enabled: row.enabled,
        provider: row.provider || null,
        entityId: row.entity_id || "",
        ssoUrl: row.sso_url || "",
        certificate: isAdmin ? (row.certificate || "") : (row.certificate ? "***REDACTED***" : ""),
        attributeEmail: row.attribute_email || "email",
        attributeName: row.attribute_name || "name",
        forceSSO: row.force_sso || false,
        updatedAt: row.updated_at || null,
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── PUT /api/sso/config ──────────────────────────────────────────────────────
// Admin only: update SSO configuration
ssoRouter.put("/config", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const body = ssoConfigSchema.parse(req.body);
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE sso_config SET
          enabled = $1,
          provider = $2,
          entity_id = $3,
          sso_url = $4,
          certificate = $5,
          attribute_email = $6,
          attribute_name = $7,
          force_sso = $8,
          updated_at = NOW(),
          updated_by = $9
        WHERE id = 1`,
        [
          body.enabled,
          body.provider || null,
          body.entityId || null,
          body.ssoUrl || null,
          body.certificate || null,
          body.attributeEmail,
          body.attributeName,
          body.forceSSO,
          req.user!.id,
        ]
      );
    } finally {
      client.release();
    }
    await logAudit({
      userId: req.user!.id,
      action: "sso.config.update",
      entityType: "sso_config",
      entityId: "1",
      req,
    });
    res.json({ success: true });
  } catch (err: any) {
    if (err.name === "ZodError") return res.status(400).json({ error: "Validation error", details: err.errors });
    res.status(500).json({ error: err.message });
  }
});

// ── GET /api/sso/status ──────────────────────────────────────────────────────
// Public: returns whether SSO is enabled and the provider name (for login page)
ssoRouter.get("/status", async (_req, res) => {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT enabled, provider, force_sso, sso_url FROM sso_config WHERE id = 1");
      const row = rows[0] || { enabled: false };
      res.json({
        enabled: row.enabled || false,
        provider: row.provider || null,
        forceSSO: row.force_sso || false,
        hasSsoUrl: !!(row.sso_url),
      });
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── POST /api/sso/test ───────────────────────────────────────────────────────
// Admin only: validate the SSO configuration (basic checks)
ssoRouter.post("/test", authenticate, requireAdmin, async (req: AuthRequest, res) => {
  try {
    const client = await pool.connect();
    try {
      const { rows } = await client.query("SELECT * FROM sso_config WHERE id = 1");
      const row = rows[0];
      if (!row || !row.enabled) return res.status(400).json({ error: "SSO is not enabled" });
      if (!row.sso_url) return res.status(400).json({ error: "SSO URL is not configured" });
      if (!row.entity_id) return res.status(400).json({ error: "Entity ID is not configured" });
      if (!row.certificate) return res.status(400).json({ error: "X.509 certificate is not configured" });
      // SSRF protection: block requests to private/internal addresses
      try {
        await assertSafeUrl(row.sso_url);
      } catch (ssrfErr: any) {
        return res.status(400).json({ error: `SSO URL rejected: ${ssrfErr.message}` });
      }
      // Basic URL reachability check
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 5000);
        const response = await fetch(row.sso_url, { method: "HEAD", signal: controller.signal });
        clearTimeout(timeout);
        res.json({
          success: true,
          message: `SSO endpoint responded with HTTP ${response.status}`,
          provider: row.provider,
        });
      } catch {
        // URL unreachable is a warning, not a hard error — the cert/config may still be valid
        res.json({
          success: true,
          warning: "SSO URL could not be reached from the server, but configuration looks valid",
          provider: row.provider,
        });
      }
    } finally {
      client.release();
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
