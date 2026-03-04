import { useEffect, useState } from "react";
import { Play, Clock, CheckCircle, XCircle, AlertTriangle, Search } from "lucide-react";
import { executionsApi } from "../lib/api";

const STATUS_STYLES: Record<string, string> = {
  completed: "bg-green-950/50 text-green-400 border-green-800",
  running: "bg-blue-950/50 text-blue-400 border-blue-800",
  failed: "bg-red-950/50 text-red-400 border-red-800",
  escalated: "bg-orange-950/50 text-orange-400 border-orange-800",
  pending: "bg-gray-800 text-gray-400 border-gray-700",
};

export default function Executions() {
  const [executions, setExecutions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("");
  const limit = 20;

  useEffect(() => {
    setLoading(true);
    executionsApi.list({ page, limit, status: statusFilter })
      .then((r) => { setExecutions(r.data?.executions || []); setTotal(r.data?.total || 0); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Executions</h1>
          <p className="text-gray-400 text-sm mt-1">History of all agent executions</p>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="running">Running</option>
          <option value="failed">Failed</option>
          <option value="escalated">Escalated</option>
        </select>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-3">Agent</div>
          <div className="col-span-3">Input</div>
          <div className="col-span-2">Confidence</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-1">Time</div>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse"><div className="h-4 bg-gray-800 rounded w-3/4" /></div>
            ))}
          </div>
        ) : executions.length === 0 ? (
          <div className="py-16 text-center">
            <Play className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No executions found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {executions.map((exec) => (
              <div key={exec.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-gray-800/50 transition-colors items-center">
                <div className="col-span-1 text-xs text-gray-500">#{exec.id}</div>
                <div className="col-span-3 text-sm text-white truncate">{exec.agentName || `Agent #${exec.agentId}`}</div>
                <div className="col-span-3 text-xs text-gray-400 truncate">{exec.input || "—"}</div>
                <div className="col-span-2">
                  {exec.confidenceScore != null ? (
                    <span className={`text-sm font-medium ${exec.confidenceScore >= 80 ? "text-green-400" : exec.confidenceScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {Math.round(exec.confidenceScore)}%
                    </span>
                  ) : <span className="text-gray-600 text-sm">—</span>}
                </div>
                <div className="col-span-2">
                  <span className={`text-xs font-medium px-2 py-1 rounded-full border ${STATUS_STYLES[exec.status] || STATUS_STYLES.pending}`}>
                    {exec.status}
                  </span>
                </div>
                <div className="col-span-1 text-xs text-gray-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {exec.executionTime ? `${(exec.executionTime / 1000).toFixed(1)}s` : "—"}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Page {page} of {totalPages} ({total.toLocaleString()} total)</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">Previous</button>
            <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 transition-colors">Next</button>
          </div>
        </div>
      )}
    </div>
  );
}
