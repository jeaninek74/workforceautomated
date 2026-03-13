import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "../lib/api";
import {
  Clock, Plus, Play, Trash2, ToggleLeft, ToggleRight,
  Calendar, Bot, Users, ChevronDown, X
} from "lucide-react";

interface Schedule {
  id: number;
  name: string;
  description: string | null;
  agentId: number | null;
  teamId: number | null;
  agentName: string | null;
  teamName: string | null;
  cronExpression: string;
  cronHuman: string;
  inputText: string | null;
  outputFormat: string;
  enabled: boolean;
  lastRunAt: string | null;
  nextRunAt: string | null;
  totalRuns: number;
}

const CRON_PRESETS = [
  { label: "Every Monday at 9 AM", value: "0 9 * * 1" },
  { label: "Weekdays at 9 AM", value: "0 9 * * 1-5" },
  { label: "Every day at 9 AM", value: "0 9 * * *" },
  { label: "Every 6 hours", value: "0 */6 * * *" },
  { label: "Every hour", value: "0 * * * *" },
  { label: "1st of every month at 9 AM", value: "0 9 1 * *" },
  { label: "1st and 15th at 9 AM", value: "0 9 1,15 * *" },
];

const OUTPUT_FORMATS = [
  { value: "bullet_points", label: "Bullet Points" },
  { value: "formal_report", label: "Formal Report" },
  { value: "structured_table", label: "Structured Table" },
  { value: "json", label: "JSON" },
  { value: "executive_summary", label: "Executive Summary" },
];

export default function Schedules() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    name: "",
    description: "",
    agentId: "",
    teamId: "",
    cronExpression: "0 9 * * 1",
    inputText: "",
    outputFormat: "bullet_points",
    targetType: "agent" as "agent" | "team",
  });

  const { data: schedulesData, isLoading } = useQuery({
    queryKey: ["schedules"],
    queryFn: () => api.get("/api/schedules").then((r) => r.data),
  });

  const { data: agentsData } = useQuery({
    queryKey: ["agents-list"],
    queryFn: () => api.get("/api/agents").then((r) => r.data),
  });

  const { data: teamsData } = useQuery({
    queryKey: ["teams-list"],
    queryFn: () => api.get("/api/teams").then((r) => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => api.post("/api/schedules", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedules"] });
      setShowForm(false);
      setForm({ name: "", description: "", agentId: "", teamId: "", cronExpression: "0 9 * * 1", inputText: "", outputFormat: "bullet_points", targetType: "agent" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => api.delete(`/api/schedules/${id}`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const toggleMutation = useMutation({
    mutationFn: ({ id, enabled }: { id: number; enabled: boolean }) =>
      api.put(`/api/schedules/${id}`, { enabled }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["schedules"] }),
  });

  const runNowMutation = useMutation({
    mutationFn: (id: number) => api.post(`/api/schedules/${id}/run-now`, {}),
    onSuccess: (_: unknown, _id: number) => {
      alert(`Schedule triggered! Check Executions for results.`);
    },
  });

  const schedules: Schedule[] = schedulesData?.schedules || [];
  const agentsList = agentsData?.agents || [];
  const teamsList = teamsData?.teams || [];

  const handleCreate = () => {
    const payload: any = {
      name: form.name,
      description: form.description,
      cronExpression: form.cronExpression,
      inputText: form.inputText,
      outputFormat: form.outputFormat,
    };
    if (form.targetType === "agent" && form.agentId) payload.agentId = form.agentId;
    if (form.targetType === "team" && form.teamId) payload.teamId = form.teamId;
    createMutation.mutate(payload);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Scheduled Runs</h1>
          <p className="text-gray-400 text-sm mt-1">Automate agent and team executions on a recurring schedule</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" /> New Schedule
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className="bg-gray-800 border border-gray-700 rounded-xl p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white font-semibold">Create Schedule</h2>
            <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="text-gray-400 text-xs font-medium block mb-1">Schedule Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                placeholder="e.g., Weekly Invoice Review"
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500"
              />
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Run</label>
              <div className="flex gap-2 mb-2">
                <button
                  onClick={() => setForm((p) => ({ ...p, targetType: "agent" }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.targetType === "agent" ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  <Bot className="w-3 h-3 inline mr-1" /> Agent
                </button>
                <button
                  onClick={() => setForm((p) => ({ ...p, targetType: "team" }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-colors ${form.targetType === "team" ? "bg-violet-600 text-white" : "bg-gray-700 text-gray-400"}`}
                >
                  <Users className="w-3 h-3 inline mr-1" /> Team
                </button>
              </div>
              {form.targetType === "agent" ? (
                <select
                  value={form.agentId}
                  onChange={(e) => setForm((p) => ({ ...p, agentId: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">Select an agent...</option>
                  {agentsList.map((a: any) => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              ) : (
                <select
                  value={form.teamId}
                  onChange={(e) => setForm((p) => ({ ...p, teamId: e.target.value }))}
                  className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
                >
                  <option value="">Select a team...</option>
                  {teamsList.map((t: any) => <option key={t.id} value={t.id}>{t.name}</option>)}
                </select>
              )}
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Frequency</label>
              <select
                value={form.cronExpression}
                onChange={(e) => setForm((p) => ({ ...p, cronExpression: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {CRON_PRESETS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
              </select>
            </div>

            <div>
              <label className="text-gray-400 text-xs font-medium block mb-1">Output Format</label>
              <select
                value={form.outputFormat}
                onChange={(e) => setForm((p) => ({ ...p, outputFormat: e.target.value }))}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
              >
                {OUTPUT_FORMATS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>

            <div className="col-span-2">
              <label className="text-gray-400 text-xs font-medium block mb-1">Task Input (what the agent should do each run)</label>
              <textarea
                value={form.inputText}
                onChange={(e) => setForm((p) => ({ ...p, inputText: e.target.value }))}
                placeholder="e.g., Review all invoices submitted this week and flag any over $10,000 or missing approval signatures."
                rows={3}
                className="w-full bg-gray-900 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
              />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button
              onClick={handleCreate}
              disabled={createMutation.isPending || !form.name || !form.cronExpression}
              className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? "Creating..." : "Create Schedule"}
            </button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-lg text-sm font-medium transition-colors">
              Cancel
            </button>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => <div key={i} className="bg-gray-800 rounded-xl h-20 animate-pulse" />)}
        </div>
      ) : schedules.length === 0 ? (
        <div className="text-center py-16 bg-gray-800/50 rounded-xl border border-gray-700">
          <Calendar className="w-12 h-12 text-violet-500 mx-auto mb-3 opacity-50" />
          <p className="text-gray-300 font-medium">No schedules yet</p>
          <p className="text-gray-500 text-sm mt-1">Create a schedule to automate agent runs without manual triggering.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {schedules.map((s) => (
            <div key={s.id} className="bg-gray-800 border border-gray-700 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-2 h-2 rounded-full ${s.enabled ? "bg-green-400" : "bg-gray-500"}`} />
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white font-medium text-sm">{s.name}</span>
                      <span className="flex items-center gap-1 text-gray-400 text-xs">
                        {s.agentName ? <><Bot className="w-3 h-3" /> {s.agentName}</> : s.teamName ? <><Users className="w-3 h-3" /> {s.teamName}</> : null}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-0.5">
                      <span className="flex items-center gap-1 text-violet-400 text-xs">
                        <Clock className="w-3 h-3" /> {s.cronHuman}
                      </span>
                      {s.lastRunAt && (
                        <span className="text-gray-500 text-xs">Last run: {new Date(s.lastRunAt).toLocaleDateString()}</span>
                      )}
                      <span className="text-gray-500 text-xs">{s.totalRuns} total runs</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => runNowMutation.mutate(s.id)}
                    disabled={runNowMutation.isPending}
                    title="Run now"
                    className="p-1.5 text-gray-400 hover:text-green-400 hover:bg-green-900/20 rounded-lg transition-colors"
                  >
                    <Play className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleMutation.mutate({ id: s.id, enabled: !s.enabled })}
                    title={s.enabled ? "Disable" : "Enable"}
                    className="p-1.5 text-gray-400 hover:text-violet-400 hover:bg-violet-900/20 rounded-lg transition-colors"
                  >
                    {s.enabled ? <ToggleRight className="w-4 h-4 text-violet-400" /> : <ToggleLeft className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => { if (confirm("Delete this schedule?")) deleteMutation.mutate(s.id); }}
                    title="Delete"
                    className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-900/20 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              {s.inputText && (
                <p className="text-gray-500 text-xs mt-2 pl-5 line-clamp-1">{s.inputText}</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
