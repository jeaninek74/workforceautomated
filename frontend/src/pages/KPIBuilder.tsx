import { useEffect, useState } from "react";
import { BarChart3, Plus, Trash2, Loader2, TrendingUp, Target } from "lucide-react";
import { kpiApi } from "../lib/api";

const METRIC_TYPES = [
  { value: "execution_count", label: "Execution Count" },
  { value: "avg_confidence", label: "Average Confidence Score" },
  { value: "success_rate", label: "Success Rate" },
  { value: "escalation_rate", label: "Escalation Rate" },
  { value: "avg_execution_time", label: "Average Execution Time" },
  { value: "agent_utilization", label: "Agent Utilization" },
];

export default function KPIBuilder() {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", metricType: "execution_count", targetValue: "", description: "" });

  useEffect(() => {
    kpiApi.list()
      .then((r) => setKpis(r.data?.kpis || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.metricType) return;
    setCreating(true);
    try {
      const res = await kpiApi.create({
        ...form,
        targetValue: form.targetValue ? Number(form.targetValue) : null,
      });
      setKpis((prev) => [...prev, res.data?.kpi]);
      setForm({ name: "", metricType: "execution_count", targetValue: "", description: "" });
      setShowForm(false);
    } catch (_) {}
    setCreating(false);
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this KPI?")) return;
    await kpiApi.delete(id);
    setKpis((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KPI Builder</h1>
          <p className="text-gray-400 text-sm mt-1">Define custom metrics to track AI workforce performance</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> New KPI
        </button>
      </div>

      {/* Create Form */}
      {showForm && (
        <form onSubmit={handleCreate} className="bg-gray-900 border border-blue-600/30 rounded-xl p-6 space-y-4">
          <h2 className="font-semibold text-white">Create New KPI</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">KPI Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g., Weekly Agent Success Rate"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Metric Type *</label>
              <select
                value={form.metricType}
                onChange={(e) => setForm({ ...form, metricType: e.target.value })}
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500"
              >
                {METRIC_TYPES.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Target Value</label>
              <input
                type="number"
                value={form.targetValue}
                onChange={(e) => setForm({ ...form, targetValue: e.target.value })}
                placeholder="e.g., 90 (for 90%)"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1.5">Description</label>
              <input
                type="text"
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                placeholder="Brief description of this KPI"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-blue-500 placeholder-gray-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={creating}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
            >
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              Create KPI
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white text-sm transition-colors">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* KPI Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => <div key={i} className="bg-gray-900 border border-gray-800 rounded-xl p-5 animate-pulse h-32" />)}
        </div>
      ) : kpis.length === 0 ? (
        <div className="bg-gray-900 border border-gray-800 rounded-xl py-20 text-center">
          <BarChart3 className="w-12 h-12 text-gray-700 mx-auto mb-4" />
          <h3 className="text-white font-medium mb-2">No KPIs defined</h3>
          <p className="text-gray-400 text-sm mb-6">Create custom metrics to track your AI workforce performance</p>
          <button onClick={() => setShowForm(true)} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
            <Plus className="w-4 h-4" /> Create First KPI
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {kpis.map((kpi) => {
            const progress = kpi.targetValue && kpi.currentValue
              ? Math.min(100, (kpi.currentValue / kpi.targetValue) * 100)
              : null;
            return (
              <div key={kpi.id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-blue-500/10 border border-blue-500/20 rounded-lg flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 text-blue-400" />
                    </div>
                    <div>
                      <div className="text-sm font-medium text-white">{kpi.name}</div>
                      <div className="text-xs text-gray-500">{METRIC_TYPES.find((m) => m.value === kpi.metricType)?.label || kpi.metricType}</div>
                    </div>
                  </div>
                  <button onClick={() => handleDelete(kpi.id)} className="text-gray-600 hover:text-red-400 transition-colors">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                {kpi.description && <p className="text-xs text-gray-500 mb-3">{kpi.description}</p>}
                {kpi.targetValue && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-400">Progress</span>
                      <span className="text-gray-300 flex items-center gap-1">
                        <Target className="w-3 h-3" />
                        Target: {kpi.targetValue}
                      </span>
                    </div>
                    {progress != null && (
                      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full ${progress >= 100 ? "bg-green-500" : progress >= 70 ? "bg-blue-500" : "bg-orange-500"}`}
                          style={{ width: `${progress}%` }}
                        />
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
