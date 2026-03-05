import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  CheckCircle, XCircle, Clock, AlertTriangle, ChevronDown, ChevronUp,
  MessageSquare, Filter
} from "lucide-react";

interface ReviewItem {
  id: number | null;
  executionId: number;
  reviewStatus: "pending" | "approved" | "rejected";
  decisionComment: string | null;
  reviewedAt: string | null;
  execution: {
    id: number;
    input: string | null;
    output: string | null;
    confidenceScore: number | null;
    riskLevel: string | null;
    escalationReason: string | null;
    createdAt: string;
    agentName: string | null;
    teamName: string | null;
  };
}

const riskColors: Record<string, string> = {
  low: "text-green-400 bg-green-900/30",
  medium: "text-yellow-400 bg-yellow-900/30",
  high: "text-orange-400 bg-orange-900/30",
  critical: "text-red-400 bg-red-900/30",
};

export default function ReviewQueue() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "all">("pending");
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [comments, setComments] = useState<Record<number, string>>({});
  const [markAllConfirm, setMarkAllConfirm] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["reviews", statusFilter],
    queryFn: () => api.get(`/api/reviews?status=${statusFilter}`).then((r) => r.data),
  });

  const approveMutation = useMutation({
    mutationFn: ({ executionId, comment }: { executionId: number; comment?: string }) =>
      api.post(`/api/reviews/${executionId}/approve`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ executionId, comment }: { executionId: number; comment?: string }) =>
      api.post(`/api/reviews/${executionId}/reject`, { comment }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: () => api.post("/api/reviews/mark-all-reviewed", {}),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["reviews"] });
      setMarkAllConfirm(false);
    },
  });

  const reviews: ReviewItem[] = data?.reviews || [];
  const canReview: boolean = data?.canReview ?? false;

  const statusBadge = (status: string) => {
    if (status === "approved") return <span className="flex items-center gap-1 text-green-400 text-xs font-medium"><CheckCircle className="w-3 h-3" /> Approved</span>;
    if (status === "rejected") return <span className="flex items-center gap-1 text-red-400 text-xs font-medium"><XCircle className="w-3 h-3" /> Rejected</span>;
    return <span className="flex items-center gap-1 text-yellow-400 text-xs font-medium"><Clock className="w-3 h-3" /> Pending Review</span>;
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Escalation Review Queue</h1>
          <p className="text-gray-400 text-sm mt-1">Review and approve or reject escalated agent executions</p>
        </div>
        <div className="flex items-center gap-2">
          {canReview && statusFilter === "pending" && reviews.length > 0 && (
            markAllConfirm ? (
              <div className="flex items-center gap-2">
                <span className="text-yellow-400 text-xs">Mark all {reviews.length} as reviewed?</span>
                <button
                  onClick={() => markAllMutation.mutate()}
                  disabled={markAllMutation.isPending}
                  className="px-3 py-1.5 bg-green-600 hover:bg-green-500 text-white rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                >
                  {markAllMutation.isPending ? "Processing..." : "Confirm"}
                </button>
                <button
                  onClick={() => setMarkAllConfirm(false)}
                  className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setMarkAllConfirm(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-xs font-medium transition-colors"
              >
                <CheckCircle className="w-3.5 h-3.5" />
                Mark all reviewed
              </button>
            )
          )}
          <Filter className="w-4 h-4 text-gray-400" />
          {(["pending", "approved", "rejected", "all"] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                statusFilter === s
                  ? "bg-violet-600 text-white"
                  : "bg-gray-800 text-gray-400 hover:bg-gray-700"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-800 rounded-xl h-24 animate-pulse" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
          <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-300 font-medium">No {statusFilter === "all" ? "" : statusFilter} reviews</p>
          <p className="text-gray-500 text-sm mt-1">
            {statusFilter === "pending"
              ? "All escalated executions have been reviewed."
              : `No ${statusFilter} reviews found.`}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const isExpanded = expandedId === review.executionId;
            const comment = comments[review.executionId] || "";
            const isPending = review.reviewStatus === "pending";

            return (
              <div
                key={review.executionId}
                className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden"
              >
                {/* Header row */}
                <div
                  className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-750"
                  onClick={() => setExpandedId(isExpanded ? null : review.executionId)}
                >
                  <div className="flex items-center gap-3">
                    <AlertTriangle className={`w-5 h-5 ${riskColors[review.execution.riskLevel || "medium"]?.split(" ")[0] || "text-yellow-400"}`} />
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-medium text-sm">
                          {review.execution.agentName || review.execution.teamName || `Execution #${review.executionId}`}
                        </span>
                        {review.execution.riskLevel && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${riskColors[review.execution.riskLevel] || ""}`}>
                            {review.execution.riskLevel} risk
                          </span>
                        )}
                      </div>
                      <p className="text-gray-400 text-xs mt-0.5">
                        {new Date(review.execution.createdAt).toLocaleString()} ·{" "}
                        {review.execution.confidenceScore != null
                          ? `${(review.execution.confidenceScore * 100).toFixed(0)}% confidence`
                          : "No confidence score"}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {statusBadge(review.reviewStatus)}
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
                  </div>
                </div>

                {/* Expanded detail */}
                {isExpanded && (
                  <div className="border-t border-gray-700 p-4 space-y-4">
                    {review.execution.escalationReason && (
                      <div className="bg-yellow-900/20 border border-yellow-700/30 rounded-lg p-3">
                        <p className="text-yellow-300 text-xs font-medium mb-1">Escalation Reason</p>
                        <p className="text-yellow-100 text-sm">{review.execution.escalationReason}</p>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-2">Input</p>
                        <div className="bg-gray-900 rounded-lg p-3 text-gray-300 text-sm max-h-32 overflow-y-auto">
                          {review.execution.input || "No input"}
                        </div>
                      </div>
                      <div>
                        <p className="text-gray-400 text-xs font-medium mb-2">Agent Output</p>
                        <div className="bg-gray-900 rounded-lg p-3 text-gray-300 text-sm max-h-32 overflow-y-auto whitespace-pre-wrap">
                          {review.execution.output || "No output"}
                        </div>
                      </div>
                    </div>

                    {isPending && (
                      <div className="space-y-3">
                        <div>
                          <label className="text-gray-400 text-xs font-medium flex items-center gap-1 mb-1">
                            <MessageSquare className="w-3 h-3" /> Decision Comment (optional)
                          </label>
                          <textarea
                            value={comment}
                            onChange={(e) => setComments((prev) => ({ ...prev, [review.executionId]: e.target.value }))}
                            placeholder="Add a note explaining your decision..."
                            rows={2}
                            className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
                          />
                        </div>
                        <div className="flex gap-3">
                          <button
                            onClick={() => approveMutation.mutate({ executionId: review.executionId, comment })}
                            disabled={approveMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <CheckCircle className="w-4 h-4" />
                            {approveMutation.isPending ? "Approving..." : "Approve"}
                          </button>
                          <button
                            onClick={() => rejectMutation.mutate({ executionId: review.executionId, comment })}
                            disabled={rejectMutation.isPending}
                            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                          >
                            <XCircle className="w-4 h-4" />
                            {rejectMutation.isPending ? "Rejecting..." : "Reject"}
                          </button>
                        </div>
                      </div>
                    )}

                    {!isPending && review.decisionComment && (
                      <div className="bg-gray-900 rounded-lg p-3">
                        <p className="text-gray-400 text-xs font-medium mb-1">Decision Comment</p>
                        <p className="text-gray-300 text-sm">{review.decisionComment}</p>
                        {review.reviewedAt && (
                          <p className="text-gray-500 text-xs mt-1">Reviewed {new Date(review.reviewedAt).toLocaleString()}</p>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
