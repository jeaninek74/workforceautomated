import { Router } from "express";
import { db } from "../db/index.js";
import { escalationReviews, executions, agents, teams, users } from "../db/schema.js";
import { eq, desc, and } from "drizzle-orm";
import { authenticate, type AuthRequest } from "../middleware/auth.js";
import { parseIntParam } from "../utils/parseIntParam.js";

const router = Router();
router.use(authenticate);

// Helper: check if user has reviewer/admin/manager role
async function canReview(userId: number): Promise<boolean> {
  const [user] = await db.select({ role: users.role }).from(users).where(eq(users.id, userId));
  const role = user?.role || "user";
  return role === "admin" || role === "manager";
}

// GET /api/reviews — list escalation reviews for this user
router.get("/", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const status = (req.query.status as string) || "pending";

    const allEscalated = await db
      .select({ exec: executions, review: escalationReviews })
      .from(executions)
      .leftJoin(escalationReviews, eq(escalationReviews.executionId, executions.id))
      .where(and(eq(executions.userId, userId), eq(executions.escalated, true)))
      .orderBy(desc(executions.createdAt))
      .limit(100);

    const filtered = allEscalated.filter((row) => {
      const reviewStatus = row.review?.status || "pending";
      if (status === "all") return true;
      return reviewStatus === status;
    });

    const enriched = await Promise.all(
      filtered.map(async (row) => {
        let agentName = null;
        let teamName = null;
        if (row.exec.agentId) {
          const [a] = await db.select({ name: agents.name }).from(agents).where(eq(agents.id, row.exec.agentId));
          agentName = a?.name;
        }
        if (row.exec.teamId) {
          const [t] = await db.select({ name: teams.name }).from(teams).where(eq(teams.id, row.exec.teamId));
          teamName = t?.name;
        }
        return {
          id: row.review?.id || null,
          executionId: row.exec.id,
          reviewStatus: row.review?.status || "pending",
          decisionComment: row.review?.decisionComment || null,
          reviewedAt: row.review?.reviewedAt || null,
          execution: {
            id: row.exec.id,
            input: row.exec.input,
            output: row.exec.output,
            confidenceScore: row.exec.confidenceScore,
            riskLevel: row.exec.riskLevel,
            escalationReason: row.exec.escalationReason,
            createdAt: row.exec.createdAt,
            agentName,
            teamName,
          },
        };
      })
    );

    // Also return whether user can review (for UI gating)
    const reviewerAccess = await canReview(req.user!.id);
    res.json({ reviews: enriched, total: enriched.length, canReview: reviewerAccess });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/count — pending review count for sidebar badge
router.get("/count", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const allEscalated = await db
      .select({ execId: executions.id, reviewStatus: escalationReviews.status })
      .from(executions)
      .leftJoin(escalationReviews, eq(escalationReviews.executionId, executions.id))
      .where(and(eq(executions.userId, userId), eq(executions.escalated, true)));

    const pending = allEscalated.filter((r) => !r.reviewStatus || r.reviewStatus === "pending").length;
    const reviewerAccess = await canReview(userId);
    res.json({ pending, canReview: reviewerAccess });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/mark-all-reviewed — bulk approve all pending (admin/manager only)
router.post("/mark-all-reviewed", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const hasAccess = await canReview(userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Only admins and managers can mark all as reviewed" });
    }

    const allEscalated = await db
      .select({ execId: executions.id, reviewStatus: escalationReviews.status })
      .from(executions)
      .leftJoin(escalationReviews, eq(escalationReviews.executionId, executions.id))
      .where(and(eq(executions.userId, userId), eq(executions.escalated, true)));

    const pending = allEscalated.filter((r) => !r.reviewStatus || r.reviewStatus === "pending");

    for (const row of pending) {
      const existing = await db.select().from(escalationReviews).where(eq(escalationReviews.executionId, row.execId));
      if (existing.length > 0) {
        await db.update(escalationReviews).set({
          status: "approved",
          reviewerId: userId,
          decisionComment: "Bulk approved — marked all as reviewed",
          reviewedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(escalationReviews.executionId, row.execId));
      } else {
        await db.insert(escalationReviews).values({
          executionId: row.execId,
          reviewerId: userId,
          status: "approved",
          decisionComment: "Bulk approved — marked all as reviewed",
          reviewedAt: new Date(),
        });
      }
    }

    res.json({ success: true, marked: pending.length });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:executionId/approve
router.post("/:executionId/approve", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const hasAccess = await canReview(userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Only admins and managers can approve reviews" });
    }
    const executionId = parseIntParam(req.params.executionId, res); if (executionId === null) return;
    const { comment } = req.body;

    const [exec] = await db.select().from(executions).where(and(eq(executions.id, executionId), eq(executions.userId, userId)));
    if (!exec) return res.status(404).json({ error: "Execution not found" });

    const existing = await db.select().from(escalationReviews).where(eq(escalationReviews.executionId, executionId));
    if (existing.length > 0) {
      await db.update(escalationReviews).set({
        status: "approved",
        reviewerId: userId,
        decisionComment: comment || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(escalationReviews.executionId, executionId));
    } else {
      await db.insert(escalationReviews).values({
        executionId,
        reviewerId: userId,
        status: "approved",
        decisionComment: comment || null,
        reviewedAt: new Date(),
      });
    }

    res.json({ success: true, status: "approved" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/reviews/:executionId/reject
router.post("/:executionId/reject", async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.id;
    const hasAccess = await canReview(userId);
    if (!hasAccess) {
      return res.status(403).json({ error: "Only admins and managers can reject reviews" });
    }
    const executionId = parseIntParam(req.params.executionId, res); if (executionId === null) return;
    const { comment } = req.body;

    const [exec] = await db.select().from(executions).where(and(eq(executions.id, executionId), eq(executions.userId, userId)));
    if (!exec) return res.status(404).json({ error: "Execution not found" });

    const existing = await db.select().from(escalationReviews).where(eq(escalationReviews.executionId, executionId));
    if (existing.length > 0) {
      await db.update(escalationReviews).set({
        status: "rejected",
        reviewerId: userId,
        decisionComment: comment || null,
        reviewedAt: new Date(),
        updatedAt: new Date(),
      }).where(eq(escalationReviews.executionId, executionId));
    } else {
      await db.insert(escalationReviews).values({
        executionId,
        reviewerId: userId,
        status: "rejected",
        decisionComment: comment || null,
        reviewedAt: new Date(),
      });
    }

    res.json({ success: true, status: "rejected" });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
