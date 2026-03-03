import { useEffect, useState } from "react";
import { TrendingUp, AlertTriangle, Shield, BarChart3, CheckCircle, XCircle } from "lucide-react";
import { metricsApi, governanceApi } from "../lib/api";

export default function ConfidenceMonitor() {
  const [metrics, setMetrics] = useState<any>(null);
  const [governance, setGovernance] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [thresholds, setThresholds] = useState({ escalationThreshold: 75, criticalThreshold: 50, autoApproveThreshold: 90 });

  useEffect(() => {
    Promise.all([metricsApi.confidence(), governanceApi.getSettings()])
      .then(([mRes, gRes]) => {
        setMetrics(mRes.data);
        const g = gRes.data?.settings;
        if (g) {
          setGovernance(g);
          setThresholds({
            escalationThreshold: g.escalationThreshold || 75,
            criticalThreshold: g.criticalThreshold || 50,
            autoApproveThreshold: g.autoApproveThreshold || 90,
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSaveThresholds = async () => {
    setSaving(true);
    try {
      await governanceApi.updateSettings(thresholds);
      alert("Governance thresholds updated successfully");
    } catch (_) {}
    setSaving(false);
  };

  const riskDist = metrics?.riskDistribution || { low: 0, medium: 0, high: 0, critical: 0 };
  const total = Object.values(riskDist).reduce((a: any, b: any) => a + b, 0) as number;

  const riskColors: Record<string, string> = {
    low: "bg-green-500",
    medium: "bg-yellow-500",
    high: "bg-orange-500",
    critical: "bg-red-500",
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Confidence & Risk Monitor</h1>
        <p className="text-gray-400 text-sm mt-1">Real-time governance metrics and threshold management</p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Avg Confidence", value: `${Math.round(metrics?.avgConfidence || 0)}%`, icon: TrendingUp, color: "blue" },
          { label: "Total Executions", value: (metrics?.totalExecutions || 0).toLocaleString(), icon: BarChart3, color: "purple" },
          { label: "Escalations", value: (metrics?.escalations || 0).toLocaleString(), icon: AlertTriangle, color: "orange" },
          { label: "Success Rate", value: `${Math.round(metrics?.successRate || 0)}%`, icon: CheckCircle, color: "green" },
        ].map((m) => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs text-gray-400">{m.label}</span>
              <m.icon className={`w-4 h-4 text-${m.color}-400`} />
            </div>
            <div className="text-2xl font-bold text-white">{m.value}</div>
          </div>
        ))}
      </div>

      {/* Risk Distribution */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
        <h2 className="font-semibold text-white mb-5">Risk Distribution</h2>
        <div className="space-y-4">
          {(["low", "medium", "high", "critical"] as const).map((level) => {
            const count = riskDist[level] || 0;
            const pct = total > 0 ? (count / total) * 100 : 0;
            return (
              <div key={level}>
                <div className="flex items-center justify-between text-sm mb-1.5">
                  <span className="capitalize text-gray-300">{level}</span>
                  <span className="text-gray-400">{count} ({Math.round(pct)}%)</span>
                </div>
                <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${riskColors[level]} rounded-full transition-all duration-500`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Confidence Trend */}
      {metrics?.trend && metrics.trend.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
          <h2 className="font-semibold text-white mb-5">Confidence Trend (Last 30 Days)</h2>
          <div className="flex items-end gap-1 h-32">
            {metrics.trend.map((point: any, i: number) => {
              const height = Math.max(4, (point.avgConfidence / 100) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="relative flex-1 w-full flex items-end">
                    <div
                      className="w-full bg-blue-600 rounded-t hover:bg-blue-500 transition-colors"
                      style={{ height: `${height}%` }}
                      title={`${point.date}: ${Math.round(point.avgConfidence)}%`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
          <div className="flex justify-between text-xs text-gray-600 mt-2">
            <span>30 days ago</span>
            <span>Today</span>
          </div>
        </div>
      )}

      {/* Governance Thresholds */}
      <div className="bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-white">Governance Thresholds</h2>
          <Shield className="w-5 h-5 text-blue-400" />
        </div>
        <div className="space-y-5">
          {[
            { key: "autoApproveThreshold", label: "Auto-Approve Threshold", desc: "Executions above this confidence are auto-approved", color: "green" },
            { key: "escalationThreshold", label: "Escalation Threshold", desc: "Executions below this confidence are escalated for human review", color: "orange" },
            { key: "criticalThreshold", label: "Critical Risk Threshold", desc: "Executions below this confidence are flagged as critical risk", color: "red" },
          ].map((t) => (
            <div key={t.key}>
              <div className="flex items-center justify-between mb-1.5">
                <div>
                  <div className="text-sm font-medium text-gray-300">{t.label}</div>
                  <div className="text-xs text-gray-500">{t.desc}</div>
                </div>
                <span className={`text-lg font-bold text-${t.color}-400`}>{(thresholds as any)[t.key]}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                value={(thresholds as any)[t.key]}
                onChange={(e) => setThresholds((prev) => ({ ...prev, [t.key]: Number(e.target.value) }))}
                className={`w-full accent-${t.color}-500`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={handleSaveThresholds}
          disabled={saving}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
        >
          {saving ? "Saving..." : "Save Thresholds"}
        </button>
      </div>
    </div>
  );
}
