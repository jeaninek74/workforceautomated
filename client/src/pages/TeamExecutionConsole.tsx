import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Play, Loader2, CheckCircle, AlertTriangle, XCircle, Bot, GitBranch } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

function ConfidenceBar({ value, label }: { value: number; label?: string }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "bg-emerald-400" : pct >= 70 ? "bg-amber-400" : pct >= 50 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs">
        <span className="text-muted-foreground">{label ?? "Confidence"}</span>
        <span className="font-mono font-medium">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-700 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function TeamExecutionConsole() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);

  const { data: team } = trpc.team.get.useQuery({ id: parseInt(id) }, { enabled: !!id });
  const runMutation = trpc.execution.runTeam.useMutation({
    onSuccess: (data) => {
      setResult(data);
      if (data.escalated) toast.warning("Team execution escalated for human review");
      else toast.success("Team execution completed");
    },
    onError: (err) => toast.error(err.message),
  });

  const riskColors: Record<string, string> = {
    low: "text-emerald-400", medium: "text-amber-400",
    high: "text-orange-400", critical: "text-red-400",
  };

  const stepStatusIcon = (status: string) => {
    if (status === "completed") return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    if (status === "escalated") return <AlertTriangle className="w-4 h-4 text-amber-400" />;
    if (status === "failed") return <XCircle className="w-4 h-4 text-red-400" />;
    return <Loader2 className="w-4 h-4 text-muted-foreground animate-spin" />;
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/teams")}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold">Team Execution Console</h1>
            <p className="text-muted-foreground text-sm">{team?.name}</p>
          </div>
        </div>

        {team && (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div><span className="text-muted-foreground">Mode: </span>
                  <Badge variant="secondary" className="capitalize">{team.governanceMode}</Badge>
                </div>
                <div><span className="text-muted-foreground">Threshold: </span>
                  <span className="font-medium">{((team.confidenceThreshold ?? 0.75) * 100).toFixed(0)}%</span>
                </div>
                <div><span className="text-muted-foreground">Agents: </span>
                  <span className="font-medium">{team.members?.length ?? 0}</span>
                </div>
              </div>
              {team.members && team.members.length > 0 && (
                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  {team.members.map((m: any, i: number) => (
                    <div key={i} className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-secondary/50 text-xs">
                      <Bot className="w-3 h-3 text-primary" />
                      <span>{m.agentName ?? `Agent ${m.agentId}`}</span>
                      {i < team.members.length - 1 && team.governanceMode === "sequential" && (
                        <GitBranch className="w-3 h-3 text-muted-foreground ml-1" />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Team Task Input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Describe the task for the team to execute collaboratively..." value={input}
              onChange={e => setInput(e.target.value)} rows={5} />
            <Button onClick={() => runMutation.mutate({ teamId: parseInt(id), input })}
              disabled={!input.trim() || runMutation.isPending} className="w-full">
              {runMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running Team Workflow...</>
                : <><Play className="w-4 h-4 mr-2" />Execute Team Workflow</>}
            </Button>
          </CardContent>
        </Card>

        {result && (
          <div className="space-y-4">
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              result.status === "completed" ? "bg-emerald-500/10 border-emerald-500/30" :
              result.status === "escalated" ? "bg-amber-500/10 border-amber-500/30" :
              "bg-red-500/10 border-red-500/30"
            }`}>
              {result.status === "completed" ? <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" /> :
               result.status === "escalated" ? <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" /> :
               <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />}
              <div>
                <p className="font-semibold capitalize">{result.status}</p>
                {result.escalationReason && <p className="text-sm text-muted-foreground mt-1">{result.escalationReason}</p>}
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-4"><ConfidenceBar value={result.overallConfidence} label="Team Confidence" /></CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                  <div className={`text-lg font-bold capitalize ${riskColors[result.riskLevel]}`}>{result.riskLevel}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Steps Completed</div>
                  <div className="text-lg font-bold">{result.steps?.filter((s: any) => s.status === "completed").length ?? 0} / {result.steps?.length ?? 0}</div>
                </CardContent>
              </Card>
            </div>

            {result.steps && result.steps.length > 0 && (
              <Card className="bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Agent Execution Steps</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {result.steps.map((step: any, i: number) => (
                      <div key={i} className={`p-4 rounded-lg border ${
                        step.status === "completed" ? "bg-emerald-500/5 border-emerald-500/20" :
                        step.status === "escalated" ? "bg-amber-500/5 border-amber-500/20" :
                        step.status === "failed" ? "bg-red-500/5 border-red-500/20" :
                        "bg-secondary/20 border-border/30"
                      }`}>
                        <div className="flex items-center gap-3 mb-2">
                          {stepStatusIcon(step.status)}
                          <span className="font-medium text-sm">{step.agentName}</span>
                          <Badge variant="outline" className="text-xs capitalize ml-auto">{step.status}</Badge>
                        </div>
                        {step.confidenceScore != null && (
                          <ConfidenceBar value={step.confidenceScore} label="Agent Confidence" />
                        )}
                        {step.output && (
                          <p className="text-xs text-muted-foreground mt-2 line-clamp-3">{step.output}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.output && (
              <Card className="bg-card border-border/50">
                <CardHeader><CardTitle className="text-base">Final Team Output</CardTitle></CardHeader>
                <CardContent>
                  <div className="bg-secondary/50 rounded-lg p-4 text-sm whitespace-pre-wrap">{result.output}</div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
