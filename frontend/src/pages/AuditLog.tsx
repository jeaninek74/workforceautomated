import { useEffect, useState } from "react";
import { Shield, Search, Download, Filter, Clock, Bot, User, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { auditApi } from "../lib/api";

const ACTION_COLORS: Record<string, string> = {
  agent_created: "text-blue-400",
  agent_executed: "text-green-400",
  execution_escalated: "text-orange-400",
  execution_failed: "text-red-400",
  team_created: "text-purple-400",
  team_executed: "text-purple-300",
  user_login: "text-gray-400",
  user_logout: "text-gray-400",
  settings_changed: "text-yellow-400",
};

export default function AuditLog() {
  const [logs, setLogs] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [actionFilter, setActionFilter] = useState("");
  const limit = 20;

  const load = async () => {
    setLoading(true);
    try {
      const res = await auditApi.list({ page, limit, search, action: actionFilter });
      setLogs(res.data?.logs || []);
      setTotal(res.data?.total || 0);
    } catch (_) {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page, search, actionFilter]);

  const handleExport = async () => {
    try {
      const res = await auditApi.export({ search, action: actionFilter });
      const blob = new Blob([res.data], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `audit-log-${new Date().toISOString().split("T")[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (_) {}
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-gray-400 text-sm mt-1">Immutable record of all agent actions and system events</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-300 text-sm font-medium px-4 py-2 rounded-lg transition-colors border border-gray-700"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search logs..."
            className="w-full bg-gray-900 border border-gray-800 text-white rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
          />
        </div>
        <select
          value={actionFilter}
          onChange={(e) => { setActionFilter(e.target.value); setPage(1); }}
          className="bg-gray-900 border border-gray-800 text-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
        >
          <option value="">All Actions</option>
          <option value="agent_executed">Agent Executed</option>
          <option value="execution_escalated">Escalated</option>
          <option value="execution_failed">Failed</option>
          <option value="agent_created">Agent Created</option>
          <option value="team_created">Team Created</option>
          <option value="user_login">User Login</option>
        </select>
      </div>

      {/* Stats Bar */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl px-6 py-4 flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2 text-gray-400">
          <Shield className="w-4 h-4 text-green-400" />
          <span>{total.toLocaleString()} total events</span>
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
          Cryptographically sealed
        </div>
        <div className="flex items-center gap-1 text-gray-500">
          <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
          Tamper-evident
        </div>
      </div>

      {/* Log Table */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
        <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-gray-800 text-xs font-medium text-gray-500 uppercase tracking-wider">
          <div className="col-span-2">Timestamp</div>
          <div className="col-span-2">Action</div>
          <div className="col-span-3">Actor</div>
          <div className="col-span-3">Details</div>
          <div className="col-span-2">Confidence</div>
        </div>
        {loading ? (
          <div className="divide-y divide-gray-800">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="px-6 py-4 animate-pulse">
                <div className="h-4 bg-gray-800 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <Shield className="w-10 h-10 text-gray-700 mx-auto mb-3" />
            <p className="text-gray-400 text-sm">No audit events found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-800">
            {logs.map((log) => (
              <div key={log.id} className="grid grid-cols-12 gap-4 px-6 py-3.5 hover:bg-gray-800/50 transition-colors items-center">
                <div className="col-span-2 flex items-center gap-1.5 text-xs text-gray-500">
                  <Clock className="w-3 h-3 flex-shrink-0" />
                  <span className="truncate">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className={`col-span-2 text-xs font-medium ${ACTION_COLORS[log.action] || "text-gray-400"}`}>
                  {log.action?.replace(/_/g, " ")}
                </div>
                <div className="col-span-3 flex items-center gap-1.5 text-xs text-gray-300">
                  {log.actorType === "agent" ? <Bot className="w-3 h-3 text-blue-400 flex-shrink-0" /> : <User className="w-3 h-3 text-gray-400 flex-shrink-0" />}
                  <span className="truncate">{log.actorName || log.actorId || "System"}</span>
                </div>
                <div className="col-span-3 text-xs text-gray-400 truncate">{log.details || "—"}</div>
                <div className="col-span-2">
                  {log.confidenceScore != null ? (
                    <span className={`text-xs font-medium ${log.confidenceScore >= 80 ? "text-green-400" : log.confidenceScore >= 60 ? "text-yellow-400" : "text-red-400"}`}>
                      {Math.round(log.confidenceScore)}%
                    </span>
                  ) : <span className="text-gray-600">—</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-gray-400">
          <span>Showing {((page - 1) * limit) + 1}–{Math.min(page * limit, total)} of {total.toLocaleString()} events</span>
          <div className="flex gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 bg-gray-900 border border-gray-800 rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
