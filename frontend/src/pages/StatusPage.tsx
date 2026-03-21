import { useState, useEffect } from "react";
import { CheckCircle, AlertTriangle, XCircle, RefreshCw, Activity, Clock, Shield } from "lucide-react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "";

interface ServiceStatus {
  name: string;
  key: string;
  status: string;
  responseMs: number | null;
}

interface DailyUptime {
  day: string;
  uptime: string;
  operational: number;
  total: number;
}

interface Incident {
  id: number;
  title: string;
  description: string;
  severity: string;
  status: string;
  service: string;
  startedAt: string;
  resolvedAt: string | null;
  updatedAt: string;
}

interface StatusData {
  overall: string;
  uptime30d: string;
  uptime90d: string;
  serverUptimeHours: number;
  serverUptimeMinutes: number;
  lastCheckedAt: string | null;
  services: ServiceStatus[];
  dailyUptime: DailyUptime[];
  incidents: Incident[];
  sla: { target: number; period: string; description: string };
}

function StatusBadge({ status }: { status: string }) {
  if (status === "operational") {
    return (
      <span className="flex items-center gap-1.5 text-green-400 text-sm font-medium">
        <CheckCircle className="w-4 h-4" />
        Operational
      </span>
    );
  }
  if (status === "degraded") {
    return (
      <span className="flex items-center gap-1.5 text-yellow-400 text-sm font-medium">
        <AlertTriangle className="w-4 h-4" />
        Degraded
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1.5 text-red-400 text-sm font-medium">
      <XCircle className="w-4 h-4" />
      Outage
    </span>
  );
}

function UptimeBar({ value }: { value: string }) {
  const pct = parseFloat(value);
  const color = pct >= 99.9 ? "bg-green-500" : pct >= 99 ? "bg-yellow-500" : "bg-red-500";
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 bg-gray-800 rounded-full h-2">
        <div className={`${color} h-2 rounded-full transition-all`} style={{ width: `${Math.min(pct, 100)}%` }} />
      </div>
      <span className="text-sm font-mono text-white w-16 text-right">{pct.toFixed(3)}%</span>
    </div>
  );
}

function DailyUptimeChart({ data }: { data: DailyUptime[] }) {
  if (!data.length) {
    // Show 90 green bars as placeholder
    return (
      <div className="flex items-end gap-0.5 h-12">
        {Array.from({ length: 90 }).map((_, i) => (
          <div key={i} className="flex-1 bg-green-600 rounded-sm" style={{ height: "100%" }} title="100% uptime" />
        ))}
      </div>
    );
  }
  return (
    <div className="flex items-end gap-0.5 h-12">
      {data.map((d) => {
        const pct = parseFloat(d.uptime);
        const height = `${Math.max(20, pct)}%`;
        const color = pct >= 99.9 ? "bg-green-600" : pct >= 99 ? "bg-yellow-500" : "bg-red-500";
        return (
          <div
            key={d.day}
            className={`flex-1 ${color} rounded-sm hover:opacity-80 transition-opacity`}
            style={{ height }}
            title={`${d.day}: ${pct}% uptime`}
          />
        );
      })}
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const map: Record<string, string> = {
    minor: "bg-yellow-950/60 text-yellow-400 border-yellow-800",
    major: "bg-orange-950/60 text-orange-400 border-orange-800",
    critical: "bg-red-950/60 text-red-400 border-red-800",
  };
  return (
    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${map[severity] || map.minor}`}>
      {severity.charAt(0).toUpperCase() + severity.slice(1)}
    </span>
  );
}

function IncidentStatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    investigating: "text-yellow-400",
    identified: "text-orange-400",
    monitoring: "text-blue-400",
    resolved: "text-green-400",
  };
  return (
    <span className={`text-xs font-medium ${map[status] || "text-gray-400"}`}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

export default function StatusPage() {
  const [data, setData] = useState<StatusData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [lastRefresh, setLastRefresh] = useState(new Date());

  async function fetchStatus() {
    try {
      const res = await axios.get(`${API}/api/status`);
      setData(res.data);
      setLastRefresh(new Date());
      setError("");
    } catch (err: any) {
      setError("Unable to load status data. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 60_000);
    return () => clearInterval(interval);
  }, []);

  const overallColor = data?.overall === "operational"
    ? "text-green-400"
    : data?.overall === "degraded"
    ? "text-yellow-400"
    : "text-red-400";

  const overallBg = data?.overall === "operational"
    ? "bg-green-950/30 border-green-800"
    : data?.overall === "degraded"
    ? "bg-yellow-950/30 border-yellow-800"
    : "bg-red-950/30 border-red-800";

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      {/* Header */}
      <div className="border-b border-gray-800 bg-gray-900">
        <div className="max-w-4xl mx-auto px-6 py-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white flex items-center gap-3">
              <Activity className="w-7 h-7 text-purple-400" />
              System Status
            </h1>
            <p className="text-gray-400 text-sm mt-1">WorkforceAutomated Platform — Real-time availability</p>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="flex items-center gap-2 text-gray-400 hover:text-white text-sm transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-8">
        {error && (
          <div className="bg-red-950/50 border border-red-800 text-red-300 text-sm rounded-lg px-4 py-3">{error}</div>
        )}

        {/* Overall Status Banner */}
        {data && (
          <div className={`rounded-2xl border p-6 ${overallBg}`}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm mb-1">Overall System Status</p>
                <p className={`text-3xl font-bold ${overallColor}`}>
                  {data.overall === "operational" ? "All Systems Operational" :
                   data.overall === "degraded" ? "Partial Degradation" : "Service Disruption"}
                </p>
              </div>
              <div className={`w-16 h-16 rounded-full flex items-center justify-center ${data.overall === "operational" ? "bg-green-500/20" : data.overall === "degraded" ? "bg-yellow-500/20" : "bg-red-500/20"}`}>
                {data.overall === "operational"
                  ? <CheckCircle className="w-8 h-8 text-green-400" />
                  : data.overall === "degraded"
                  ? <AlertTriangle className="w-8 h-8 text-yellow-400" />
                  : <XCircle className="w-8 h-8 text-red-400" />
                }
              </div>
            </div>
            {data.lastCheckedAt && (
              <p className="text-xs text-gray-500 mt-3 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" />
                Last checked: {new Date(data.lastCheckedAt).toLocaleString()} · Auto-refreshes every 60 seconds
              </p>
            )}
          </div>
        )}

        {/* Uptime Metrics */}
        {data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-1">30-Day Uptime</p>
              <p className="text-3xl font-bold text-white font-mono">{data.uptime30d}%</p>
              <p className="text-xs text-gray-600 mt-1">SLA target: 99.9%</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-1">90-Day Uptime</p>
              <p className="text-3xl font-bold text-white font-mono">{data.uptime90d}%</p>
              <p className="text-xs text-gray-600 mt-1">Rolling 90 days</p>
            </div>
            <div className="bg-gray-900 border border-gray-800 rounded-xl p-5 text-center">
              <p className="text-xs text-gray-500 mb-1">Server Uptime</p>
              <p className="text-3xl font-bold text-white font-mono">
                {data.serverUptimeHours}h {data.serverUptimeMinutes}m
              </p>
              <p className="text-xs text-gray-600 mt-1">Current instance</p>
            </div>
          </div>
        )}

        {/* 90-Day Uptime Chart */}
        {data && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-white">90-Day Uptime History</h2>
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-green-600 inline-block" /> Operational</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-yellow-500 inline-block" /> Degraded</span>
                <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-sm bg-red-500 inline-block" /> Outage</span>
              </div>
            </div>
            <DailyUptimeChart data={data.dailyUptime} />
            <div className="flex justify-between text-xs text-gray-600">
              <span>90 days ago</span>
              <span>Today</span>
            </div>
          </div>
        )}

        {/* Services */}
        {data && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Services</h2>
            </div>
            <div className="divide-y divide-gray-800">
              {data.services.map((svc) => (
                <div key={svc.key} className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">{svc.name}</p>
                    {svc.responseMs !== null && (
                      <p className="text-xs text-gray-500 mt-0.5">{svc.responseMs}ms response time</p>
                    )}
                  </div>
                  <StatusBadge status={svc.status} />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Incidents */}
        {data && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-800">
              <h2 className="font-semibold text-white">Incident History</h2>
              <p className="text-xs text-gray-500 mt-0.5">Last 90 days</p>
            </div>
            {data.incidents.length === 0 ? (
              <div className="px-6 py-8 text-center">
                <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3 opacity-60" />
                <p className="text-gray-400 text-sm font-medium">No incidents in the last 90 days</p>
                <p className="text-gray-600 text-xs mt-1">All systems have been running smoothly.</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-800">
                {data.incidents.map((incident) => (
                  <div key={incident.id} className="px-6 py-4 space-y-1">
                    <div className="flex items-center gap-3">
                      <SeverityBadge severity={incident.severity} />
                      <IncidentStatusBadge status={incident.status} />
                    </div>
                    <p className="text-sm font-medium text-white">{incident.title}</p>
                    {incident.description && (
                      <p className="text-xs text-gray-400">{incident.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-600">
                      <span>Started: {new Date(incident.startedAt).toLocaleString()}</span>
                      {incident.resolvedAt && (
                        <span>Resolved: {new Date(incident.resolvedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SLA Terms */}
        {data && (
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-4">
            <h2 className="font-semibold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-purple-400" />
              Service Level Agreement
            </h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Uptime Guarantee</span>
                <span className="text-sm font-semibold text-white">99.9% monthly</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Measurement Period</span>
                <span className="text-sm text-white">Calendar month</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Allowed Downtime / Month</span>
                <span className="text-sm text-white">≤ 43 minutes 49 seconds</span>
              </div>
              <div className="flex items-center justify-between py-3 border-b border-gray-800">
                <span className="text-sm text-gray-400">Monitoring Frequency</span>
                <span className="text-sm text-white">Every 60 seconds</span>
              </div>
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-gray-400">Status Updates</span>
                <span className="text-sm text-white">Real-time on this page</span>
              </div>
            </div>
            <p className="text-xs text-gray-600">
              Uptime is calculated as the percentage of minutes in a calendar month during which the WorkforceAutomated platform is available and responding to requests. Scheduled maintenance windows with 24-hour advance notice are excluded from uptime calculations.
            </p>
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-gray-700 pb-4">
          <p>Last refreshed: {lastRefresh.toLocaleTimeString()} · Auto-refreshes every 60 seconds</p>
          <p className="mt-1">WorkforceAutomated Platform Status · <a href="/" className="text-purple-500 hover:text-purple-400">workforceautomated.com</a></p>
        </div>
      </div>
    </div>
  );
}
