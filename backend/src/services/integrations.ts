/**
 * Integration Connector Service
 *
 * Handles fetching data from connected systems at execution time.
 * Each connector type knows how to authenticate and retrieve data
 * using the credentials stored for that integration.
 */

import { db } from "../db/index.js";
import { integrations, agentIntegrations } from "../db/schema.js";
import { eq, and, inArray } from "drizzle-orm";

export interface ConnectorResult {
  integrationId: number;
  integrationName: string;
  type: string;
  data: string; // Text representation of fetched data
  error?: string;
}

// ─── SSRF Protection ──────────────────────────────────────────────────────────
// Block requests to private/internal IP ranges to prevent SSRF attacks.

import { URL } from "url";
import dns from "dns/promises";

const PRIVATE_IP_PATTERNS = [
  /^127\./,                          // Loopback
  /^10\./,                           // RFC1918
  /^172\.(1[6-9]|2[0-9]|3[01])\./,  // RFC1918
  /^192\.168\./,                     // RFC1918
  /^169\.254\./,                     // Link-local / AWS metadata
  /^100\.(6[4-9]|[7-9][0-9]|1[01][0-9]|12[0-7])\./, // CGNAT
  /^::1$/,                           // IPv6 loopback
  /^fc00:/i,                         // IPv6 ULA
  /^fd/i,                            // IPv6 ULA
  /^fe80:/i,                         // IPv6 link-local
  /^0\./,                            // 0.0.0.0/8
];

async function assertSafeUrl(rawUrl: string): Promise<void> {
  let parsed: URL;
  try {
    parsed = new URL(rawUrl);
  } catch {
    throw new Error(`Invalid URL: ${rawUrl}`);
  }

  // Only allow http and https
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new Error(`URL protocol not allowed: ${parsed.protocol}`);
  }

  const hostname = parsed.hostname;

  // Check if hostname is already a private IP
  for (const pattern of PRIVATE_IP_PATTERNS) {
    if (pattern.test(hostname)) {
      throw new Error(`URL resolves to a private/internal address and is not allowed`);
    }
  }

  // Resolve DNS to catch DNS rebinding attacks
  try {
    const addresses = await dns.lookup(hostname, { all: true });
    for (const { address } of addresses) {
      for (const pattern of PRIVATE_IP_PATTERNS) {
        if (pattern.test(address)) {
          throw new Error(`URL resolves to a private/internal address and is not allowed`);
        }
      }
    }
  } catch (err: any) {
    if (err.message.includes("private/internal")) throw err;
    // DNS resolution failure — let the fetch fail naturally
  }
}

// ─── Google Drive Connector ───────────────────────────────────────────────────

async function fetchGoogleDriveData(
  credentials: Record<string, string>,
  config: Record<string, string>
): Promise<string> {
  const { access_token, refresh_token, client_id, client_secret } = credentials;
  const folderId = config.folder_id;

  if (!access_token && !refresh_token) {
    throw new Error("Google Drive: No access token provided. Please re-authenticate.");
  }

  // Sanitize folderId to prevent Google Drive query injection
  // Google Drive file IDs are alphanumeric with hyphens and underscores only
  const safeFolderId = folderId ? folderId.replace(/[^a-zA-Z0-9_\-]/g, "") : null;

  // Use Google Drive API v3 to list files in the specified folder
  const query = safeFolderId
    ? `'${safeFolderId}' in parents and trashed=false`
    : "trashed=false";

  const listUrl = `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,mimeType,modifiedTime,size)&pageSize=20&orderBy=modifiedTime desc`;

  const response = await fetch(listUrl, {
    headers: { Authorization: `Bearer ${access_token}` },
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({})) as any;
    throw new Error(`Google Drive API error: ${err.error?.message || response.statusText}`);
  }

  const result = await response.json() as any;
  const files: any[] = result.files || [];

  if (files.length === 0) {
    return `Google Drive: No files found${safeFolderId ? ` in folder ${safeFolderId}` : ""}.`;
  }

  const lines = [
    `Google Drive Files (${files.length} found${safeFolderId ? ` in folder ${safeFolderId}` : ""}):`,
    "",
  ];

  for (const file of files) {
    lines.push(`- ${file.name} (${file.mimeType}) — modified ${file.modifiedTime}`);
  }

  // If a specific file ID is configured, try to fetch its content
  if (config.file_id) {
    // Sanitize file_id as well
    const safeFileId = config.file_id.replace(/[^a-zA-Z0-9_\-]/g, "");
    try {
      const contentUrl = `https://www.googleapis.com/drive/v3/files/${safeFileId}/export?mimeType=text/plain`;
      const contentResp = await fetch(contentUrl, {
        headers: { Authorization: `Bearer ${access_token}` },
      });
      if (contentResp.ok) {
        const text = await contentResp.text();
        lines.push("", `--- File Content ---`, text.slice(0, 5000));
      }
    } catch {
      // Ignore content fetch errors — file listing is still useful
    }
  }

  return lines.join("\n");
}

// ─── Slack Connector ──────────────────────────────────────────────────────────

async function fetchSlackData(
  credentials: Record<string, string>,
  config: Record<string, string>
): Promise<string> {
  const { bot_token } = credentials;
  const channelId = config.channel_id;

  if (!bot_token) throw new Error("Slack: No bot token provided.");
  if (!channelId) throw new Error("Slack: No channel ID configured.");

  // Fetch recent messages from the channel
  const url = `https://slack.com/api/conversations.history?channel=${channelId}&limit=20`;
  const response = await fetch(url, {
    headers: { Authorization: `Bearer ${bot_token}` },
  });

  const result = await response.json() as any;
  if (!result.ok) throw new Error(`Slack API error: ${result.error}`);

  const messages: any[] = result.messages || [];
  if (messages.length === 0) return `Slack channel ${channelId}: No recent messages.`;

  const lines = [`Slack Channel Messages (${messages.length} recent):`];
  for (const msg of messages) {
    const ts = new Date(parseFloat(msg.ts) * 1000).toISOString();
    lines.push(`[${ts}] ${msg.text || "(no text)"}`);
  }

  return lines.join("\n");
}

export async function sendSlackMessage(
  credentials: Record<string, string>,
  config: Record<string, string>,
  message: string
): Promise<void> {
  const { bot_token } = credentials;
  const channelId = config.channel_id;

  if (!bot_token || !channelId) throw new Error("Slack: Missing bot_token or channel_id.");

  const response = await fetch("https://slack.com/api/chat.postMessage", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${bot_token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ channel: channelId, text: message }),
  });

  const result = await response.json() as any;
  if (!result.ok) throw new Error(`Slack send error: ${result.error}`);
}

// ─── REST API Connector ───────────────────────────────────────────────────────

async function fetchRestApiData(
  credentials: Record<string, string>,
  config: Record<string, string>
): Promise<string> {
  const { api_key, bearer_token, username, password } = credentials;
  const { base_url, endpoint, method = "GET" } = config;

  if (!base_url) throw new Error("REST API: No base_url configured.");

  const url = endpoint ? `${base_url.replace(/\/$/, "")}/${endpoint.replace(/^\//, "")}` : base_url;

  // SSRF protection: block requests to private/internal addresses
  await assertSafeUrl(url);

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  if (bearer_token) headers["Authorization"] = `Bearer ${bearer_token}`;
  else if (api_key) headers["X-API-Key"] = api_key;
  else if (username && password) {
    headers["Authorization"] = `Basic ${Buffer.from(`${username}:${password}`).toString("base64")}`;
  }

  const response = await fetch(url, { method, headers });

  if (!response.ok) {
    throw new Error(`REST API ${method} ${url} returned ${response.status}: ${response.statusText}`);
  }

  const contentType = response.headers.get("content-type") || "";
  let text: string;

  if (contentType.includes("application/json")) {
    const json = await response.json();
    text = JSON.stringify(json, null, 2).slice(0, 8000);
  } else {
    text = await response.text();
    text = text.slice(0, 8000);
  }

  return `REST API Response (${method} ${url}):\n\n${text}`;
}

// ─── Webhook Connector ────────────────────────────────────────────────────────

async function fetchWebhookData(
  _credentials: Record<string, string>,
  config: Record<string, string>
): Promise<string> {
  // Webhooks are push-based — we can't pull from them
  // Instead, we return info about the webhook configuration
  return `Webhook Integration: This connector receives data pushed from external systems to ${config.webhook_url || "your webhook endpoint"}. Data is available in real-time when events occur.`;
}

// ─── Main: Fetch data from all integrations assigned to an agent ──────────────

export async function fetchIntegrationData(agentId: number): Promise<ConnectorResult[]> {
  // Get all integrations assigned to this agent
  const assignments = await db
    .select({ integration: integrations })
    .from(agentIntegrations)
    .innerJoin(integrations, eq(agentIntegrations.integrationId, integrations.id))
    .where(
      and(
        eq(agentIntegrations.agentId, agentId),
        eq(integrations.status, "active")
      )
    );

  if (assignments.length === 0) return [];

  const results: ConnectorResult[] = [];

  for (const { integration } of assignments) {
    const creds = (integration.credentials || {}) as Record<string, string>;
    const config = (integration.config || {}) as Record<string, string>;

    try {
      let data = "";

      switch (integration.type) {
        case "google_drive":
          data = await fetchGoogleDriveData(creds, config);
          break;
        case "slack":
          data = await fetchSlackData(creds, config);
          break;
        case "rest_api":
          data = await fetchRestApiData(creds, config);
          break;
        case "webhook":
          data = await fetchWebhookData(creds, config);
          break;
        case "database":
          data = "(Database connector: direct SQL queries not yet supported in this version)";
          break;
        default:
          data = `(Unknown integration type: ${integration.type})`;
      }

      // Update last used timestamp
      await db
        .update(integrations)
        .set({ lastUsedAt: new Date(), errorMessage: null })
        .where(eq(integrations.id, integration.id));

      results.push({
        integrationId: integration.id,
        integrationName: integration.name,
        type: integration.type,
        data,
      });
    } catch (err: any) {
      // Record the error but don't fail the whole execution
      await db
        .update(integrations)
        .set({ status: "error", errorMessage: err.message })
        .where(eq(integrations.id, integration.id));

      results.push({
        integrationId: integration.id,
        integrationName: integration.name,
        type: integration.type,
        data: "",
        error: err.message,
      });
    }
  }

  return results;
}

// ─── Test an integration connection ──────────────────────────────────────────

export async function testIntegration(
  type: string,
  credentials: Record<string, string>,
  config: Record<string, string>
): Promise<{ success: boolean; message: string }> {
  try {
    switch (type) {
      case "google_drive":
        await fetchGoogleDriveData(credentials, config);
        return { success: true, message: "Google Drive connection successful." };
      case "slack":
        await fetchSlackData(credentials, config);
        return { success: true, message: "Slack connection successful." };
      case "rest_api":
        await fetchRestApiData(credentials, config);
        return { success: true, message: "REST API connection successful." };
      case "webhook":
        return { success: true, message: "Webhook connector configured. Awaiting incoming events." };
      default:
        return { success: false, message: `Unknown integration type: ${type}` };
    }
  } catch (err: any) {
    return { success: false, message: err.message };
  }
}
