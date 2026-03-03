import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { TrendingUp, AlertTriangle, CheckCircle, XCircle, Shield, Loader2 } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const RISK_COLORS = { low: "#34d399", medium: "#fbbf24", high: "#fb923c", critical: "#f87171" };

export default function ConfidenceMonitor() {
  const [period, setPeriod] = useState("7d");
  const [savingSettings, setSavingSettings] = useState(false);

  const { data: executions, isLoading } = trpc.execution.list.useQuery({ limit: 100 });
  const { data: govSettings, refetch: refetchGov } = trpc.governance.get.useQuery();
  const updateGovMutation = trpc.governance.update.useMutation({
    onSuccess: () => { toast.success("Governance settings saved"); refetchGov(); setSavingSettings(false); },
    onError: (err: any) => { toast.error(err.message); setSavingSettings(false); },
  });

  const [localThreshold, setLocalThreshold] = useState<number | null>(null);
  const [localRisk, setLocalRisk] = useState<string | null>(null);

  const threshold = localThreshold ?? ((govSettings as any)?.globalConfidenceThreshold ?? 0.75);
  const riskLevel = localRisk ?? ((govSettings as any)?.globalRiskThreshold ?? "medium");

  const execs = executions ?? [];

  // Compute stats
  const total = execs.length;
  const completed = execs.filter((e: any) => e.status === "completed").length;
  const escalated = execs.filter((e: any) => e.status === "escalated").length;
  const failed = execs.filter((e: any) => e.status === "failed").length;
  const avgConf = total > 0
    ? execs.reduce((s: number, e: any) => s + (e.confidenceScore ?? 0), 0) / total
    : 0;

  // Risk distribution
  const riskDist = ["low", "medium", "high", "critical"].map(r => ({
    name: r, value: execs.filter((e: any) => e.riskLevel === r).length,
    color: RISK_COLORS[r as keyof typeof RISK_COLORS],
  }));

  // Confidence over time (last 20 executions)
  const confTrend = execs.slice(-20).map((e: any, i: number) => ({
    idx: i + 1,
    confidence: Math.round((e.confidenceScore ?? 0) * 100),
    threshold: Math.round(threshold * 100),
  }));

  // Daily execution counts
  const dailyCounts: Record<string, { date: string; completed: number; escalated: number; failed: number }> = {};
  execs.forEach((e: any) => {
    const d = new Date(e.startedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" });
    if (!dailyCounts[d]) dailyCounts[d] = { date: d, completed: 0, escalated: 0, failed: 0 };
    if (e.status === "completed") dailyCounts[d].completed++;
    else if (e.status === "escalated") dailyCounts[d].escalated++;
    else if (e.status === "failed") dailyCounts[d].failed++;
  });
  const dailyData = Object.values(dailyCounts).slice(-7);

  const saveSettings = () => {
    setSavingSettings(true);
    updateGovMutation.mutate({ globalConfidenceThreshold: threshold, globalRiskThreshold: riskLevel as any });
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Confidence & Risk Monitor</h1>
            <p className="text-muted-foreground text-sm mt-1">Real-time governance analytics and threshold management</p>
          </div>
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Executions", value: total, icon: <TrendingUp className="w-5 h-5 text-primary" />, color: "text-foreground" },
            { label: "Completed", value: completed, icon: <CheckCircle className="w-5 h-5 text-emerald-400" />, color: "text-emerald-400" },
            { label: "Escalated", value: escalated, icon: <AlertTriangle className="w-5 h-5 text-amber-400" />, color: "text-amber-400" },
            { label: "Avg Confidence", value: `${(avgConf * 100).toFixed(1)}%`, icon: <Shield className="w-5 h-5 text-cyan-400" />, color: "text-cyan-400" },
          ].map((s, i) => (
            <Card key={i} className="bg-card border-border/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">{s.icon}<span className="text-xs text-muted-foreground">{s.label}</span></div>
                <div className={`text-2xl font-bold ${s.color}`}>{s.value}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Confidence Trend */}
          <Card className="bg-card border-border/50">
            <CardHeader><CardTitle className="text-base">Confidence Trend (Last 20 Runs)</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <div className="h-48 animate-pulse bg-secondary rounded" /> : (
                <ResponsiveContainer width="100%" height={200}>
                  <LineChart data={confTrend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 240)" />
                    <XAxis dataKey="idx" tick={{ fontSize: 11, fill: "oklch(0.60 0.01 240)" }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "oklch(0.60 0.01 240)" }} />
                    <Tooltip contentStyle={{ background: "oklch(0.14 0.01 240)", border: "1px solid oklch(0.22 0.01 240)", borderRadius: "8px" }} />
                    <Line type="monotone" dataKey="confidence" stroke="oklch(0.62 0.22 264)" strokeWidth={2} dot={false} name="Confidence %" />
                    <Line type="monotone" dataKey="threshold" stroke="oklch(0.60 0.22 25)" strokeWidth={1} strokeDasharray="4 4" dot={false} name="Threshold %" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* Risk Distribution */}
          <Card className="bg-card border-border/50">
            <CardHeader><CardTitle className="text-base">Risk Distribution</CardTitle></CardHeader>
            <CardContent>
              {isLoading ? <div className="h-48 animate-pulse bg-secondary rounded" /> : (
                <div className="flex items-center gap-4">
                  <ResponsiveContainer width={160} height={160}>
                    <PieChart>
                      <Pie data={riskDist} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                        {riskDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 flex-1">
                    {riskDist.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full shrink-0" style={{ background: r.color }} />
                        <span className="capitalize flex-1">{r.name}</span>
                        <span className="font-mono font-medium">{r.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Daily Activity */}
        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Daily Execution Activity</CardTitle></CardHeader>
          <CardContent>
            {isLoading ? <div className="h-48 animate-pulse bg-secondary rounded" /> : (
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.22 0.01 240)" />
                  <XAxis dataKey="date" tick={{ fontSize: 11, fill: "oklch(0.60 0.01 240)" }} />
                  <YAxis tick={{ fontSize: 11, fill: "oklch(0.60 0.01 240)" }} />
                  <Tooltip contentStyle={{ background: "oklch(0.14 0.01 240)", border: "1px solid oklch(0.22 0.01 240)", borderRadius: "8px" }} />
                  <Bar dataKey="completed" fill="#34d399" name="Completed" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="escalated" fill="#fbbf24" name="Escalated" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="failed" fill="#f87171" name="Failed" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        {/* Governance Settings */}
        <Card className="bg-card border-border/50">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              <CardTitle className="text-base">Global Governance Thresholds</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Global Confidence Threshold: {(threshold * 100).toFixed(0)}%</Label>
              <p className="text-xs text-muted-foreground mb-2">Executions below this threshold are automatically escalated for human review</p>
              <Slider min={0.1} max={1} step={0.05} value={[threshold]}
                onValueChange={([v]: number[]) => setLocalThreshold(v)} />
            </div>
            <div>
              <Label>Default Risk Threshold</Label>
              <div className="flex gap-2 mt-2">
                {(["low", "medium", "high", "critical"] as const).map(r => (
                  <button key={r} onClick={() => setLocalRisk(r)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${riskLevel === r ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/30"}`}>
                    {r}
                  </button>
                ))}
              </div>
            </div>
            <Button onClick={saveSettings} disabled={savingSettings} className="w-full">
              {savingSettings ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : "Save Governance Settings"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
