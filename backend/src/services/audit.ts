import { db } from "../db/index.js";
import { auditLogs } from "../db/schema.js";
import type { Request } from "express";

interface AuditParams {
  userId?: number;
  executionId?: number;
  agentId?: number;
  action: string;
  entityType?: string;
  entityId?: string;
  details?: Record<string, unknown>;
  req?: Request;
}

export async function logAudit(params: AuditParams) {
  try {
    await db.insert(auditLogs).values({
      userId: params.userId,
      executionId: params.executionId,
      agentId: params.agentId,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      details: params.details,
      ipAddress: params.req?.ip || params.req?.socket?.remoteAddress,
      userAgent: params.req?.headers?.["user-agent"],
    });
  } catch (err) {
    console.error("[Audit] Failed to log:", err);
  }
}
