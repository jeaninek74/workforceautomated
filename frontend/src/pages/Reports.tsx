import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Download, FileText, BarChart3, AlertTriangle, CheckCircle,
  Clock, TrendingUp, Filter
} from "lucide-react";

interface SummaryStats {
  total: number;
  successful: number;
  escalated: number;
  failed: number;
  avgConfidence: number;
  avgProcessingMs: number;
  automationRate: number;
  escalationRate: number;
  riskBreakdown: { low: number; medium: number; high: number; critical: number };
}

interface ExecutionRow {
  id: number;
  createdAt: string;
  type: string;
  status: string;
  agentName: string | null;
  teamName: string | null;
  confidenceScore: number | null;
  riskLevel: string | null;
  escalated: boolean;
  processingTimeMs: number | null;
  input: string | null;
  output: string | null;
}

const riskColors: Record<string, string> = {
  low: "text-green-400",
  medium: "text-yellow-400",
  high: "text-orange-400",
  critical: "text-red-400",
};

export default function Reports() {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [agentFilter, setAgentFilter] = useState("");
  const [teamFilter, setTeamFilter] = useState("");

  const buildParams = () => {
    const params = new URLSearchParams();
    if (startDate) params.set("startDate", startDate);
    if (endDate) params.set("endDate", endDate);
    if (agentFilter) params.set("agentId", agentFilter);
    if (teamFilter) params.set("teamId", teamFilter);
    return params.toString();
  };

  const { data: summaryData, isLoading: summaryLoading } = useQuery({
    queryKey: ["reports-summary", startDate, endDate],
    queryFn: () => api.get(`/api/reports/summary.json?${buildParams()}`).then((r) => r.data),
  });

  const { data: execData, isLoading: execLoading } = useQuery({
    queryKey: ["reports-executions", startDate, endDate, agentFilter, teamFilter],
    queryFn: () => api.get(`/api/reports/executions.json?${buildParams()}`).then((r) => r.data),
  });

  const { data: agentsData } = useQuery({
    queryKey: ["agents-list"],
    queryFn: () => api.get("/api/agents").then((r) => r.data),
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams-list"],
    queryFn: () => api.get("/api/teams").then((r) => r.data),
  });

  const summary: SummaryStats | null = summaryData || null;
  const executions: ExecutionRow[] = execData?.executions || [];
  const agentsList = agentsData?.agents || [];
  const teamsList = teamsData?.teams || [];

  const downloadFile = (url: string, filename: string) => {
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const downloadCsv = (type: "executions" | "audit" | "escalations") => {
    const params = buildParams();
    const url = `/api/reports/${type}.csv${params ? "?" + params : ""}`;
    downloadFile(url, `${type}-${Date.now()}.csv`);
  };

  const downloadPdf = () => {
    const params = buildParams();
    const url = `/api/reports/summary.pdf${params ? "?" + params : ""}`;
    downloadFile(url, `workforce-report-${Date.now()}.pdf`);
  };

  const statCard = (icon: React.ReactNode, label: string, value: string, sub?: string, color?: string) => (
    <div className="bg-gray-800 border border-gray-700 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-2">
        <div className={`${color || "text-violet-400"}`}>{icon}</div>
        <span className="text-gray-400 text-xs font-medium">{label}</span>
      </div>
      <p className={`text-2xl font-bold ${color || "text-white"}`}>{value}</p>
      {sub && <p className="text-gray-500 text-xs mt-0.5">{sub}</p>}
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Reports & Analytics</h1>
          <p className="text-gray-400 text-sm mt-1">Export execution data, audit logs, and escalation reports</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={downloadPdf}
            className="flex items-center gap-2 px-3 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <FileText className="w-4 h-4" /> Download PDF Report
          </button>
          <button
            onClick={() => downloadCsv("executions")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Executions CSV
          </button>
          <button
            onClick={() => downloadCsv("escalations")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Escalations CSV
          </button>
          <button
            onClick={() => downloadCsv("audit")}
            className="flex items-center gap-2 px-3 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors"
          >
            <Download className="w-4 h-4" /> Audit Log CSV
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
        <div className="flex items-center gap-2 mb-3">
          <Filter className="w-4 h-4 text-gray-400" />
          <span className="text-gray-300 text-sm font-medium">Filter Report</span>
        </div>
        <div className="grid grid-cols-4 gap-3">
          <div>
            <label className="text-gray-400 text-xs block mb-1">Start Date</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">End Date</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            />
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Agent</label>
            <select
              value={agentFilter}
              onChange={(e) => setAgentFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">All Agents</option>
              {agentsList.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
            </select>
          </div>
          <div>
            <label className="text-gray-400 text-xs block mb-1">Team</label>
            <select
              value={teamFilter}
              onChange={(e) => setTeamFilter(e.target.value)}
              className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
            >
              <option value="">All Teams</option>
              {teamsList.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Summary stats */}
      {summaryLoading ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => <div key={i} className="bg-gray-800 rounded-xl h-24 animate-pulse" />)}
        </div>
      ) : summary ? (
        <div className="grid grid-cols-4 gap-4 mb-6">
          {statCard(<BarChart3 className="w-4 h-4" />, "Total Executions", summary.total.toString())}
          {statCard(
            <TrendingUp className="w-4 h-4" />,
            "Automation Rate",
            `${(summary.automationRate * 100).toFixed(1)}%`,
            `${summary.successful} completed without escalation`,
            "text-green-400"
          )}
          {statCard(
            <AlertTriangle className="w-4 h-4" />,
            "Escalation Rate",
            `${(summary.escalationRate * 100).toFixed(1)}%`,
            `${summary.escalated} escalated for review`,
            summary.escalationRate > 0.2 ? "text-red-400" : "text-yellow-400"
          )}
          {statCard(
            <Clock className="w-4 h-4" />,
            "Avg Processing Time",
            summary.avgProcessingMs > 0 ? `${(summary.avgProcessingMs / 1000).toFixed(1)}s` : "—",
            `Avg confidence: ${(summary.avgConfidence * 100).toFixed(0)}%`
          )}
        </div>
      ) : null}

      {/* Risk breakdown */}
      {summary && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-4 mb-6">
          <h3 className="text-white font-medium text-sm mb-3">Risk Level Breakdown</h3>
          <div className="grid grid-cols-4 gap-3">
            {(["low", "medium", "high", "critical"] as const).map((level) => {
              const count = summary.riskBreakdown[level];
              const pct = summary.total > 0 ? ((count / summary.total) * 100).toFixed(0) : "0";
              return (
                <div key={level} className="bg-gray-900 rounded-lg p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className={`text-xs font-medium capitalize ${riskColors[level]}`}>{level}</span>
                    <span className="text-gray-400 text-xs">{pct}%</span>
                  </div>
                  <p className={`text-xl font-bold ${riskColors[level]}`}>{count}</p>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${level === "low" ? "bg-green-500" : level === "medium" ? "bg-yellow-500" : level === "high" ? "bg-orange-500" : "bg-red-500"}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Execution table */}
      <div className="bg-gray-800 border border-gray-700 rounded-xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <h3 className="text-white font-medium text-sm">Execution Log</h3>
          <span className="text-gray-400 text-xs">{executions.length} records</span>
        </div>
        {execLoading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : executions.length === 0 ? (
          <div className="p-8 text-center">
            <FileText className="w-8 h-8 text-gray-600 mx-auto mb-2" />
            <p className="text-gray-400 text-sm">No executions found for the selected filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Date</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Agent / Team</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Status</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Confidence</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Risk</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Escalated</th>
                  <th className="text-left text-gray-400 font-medium px-4 py-3 text-xs">Time</th>
                </tr>
              </thead>
              <tbody>
                {executions.slice(0, 100).map((e) => (
                  <tr key={e.id} className="border-b border-gray-700/50 hover:bg-gray-750">
                    <td className="px-4 py-3 text-gray-300 text-xs whitespace-nowrap">
                      {new Date(e.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-white text-xs">
                      {e.agentName || e.teamName || `#${e.id}`}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium capitalize ${
                        e.status === "success" ? "text-green-400" :
                        e.status === "failed" ? "text-red-400" :
                        e.status === "running" ? "text-blue-400" : "text-gray-400"
                      }`}>
                        {e.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-300 text-xs">
                      {e.confidenceScore != null ? `${(e.confidenceScore * 100).toFixed(0)}%` : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs capitalize ${riskColors[e.riskLevel || ""] || "text-gray-400"}`}>
                        {e.riskLevel || "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {e.escalated ? (
                        <span className="flex items-center gap-1 text-yellow-400 text-xs">
                          <AlertTriangle className="w-3 h-3" /> Yes
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-green-400 text-xs">
                          <CheckCircle className="w-3 h-3" /> No
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs">
                      {e.processingTimeMs ? `${(e.processingTimeMs / 1000).toFixed(1)}s` : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {executions.length > 100 && (
              <div className="p-3 text-center text-gray-500 text-xs border-t border-gray-700">
                Showing first 100 of {executions.length} records. Download CSV for full export.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
