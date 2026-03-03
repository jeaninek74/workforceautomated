import { useState } from "react";
import { useParams, useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Play, Loader2, CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

function ConfidenceBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = pct >= 85 ? "bg-emerald-400" : pct >= 70 ? "bg-amber-400" : pct >= 50 ? "bg-orange-400" : "bg-red-400";
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs"><span>Confidence</span><span className="font-mono">{pct}%</span></div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-500 ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export default function ExecutionConsole() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [input, setInput] = useState("");
  const [result, setResult] = useState<any>(null);
  const [showSteps, setShowSteps] = useState(false);

  const { data: agent } = trpc.agent.get.useQuery({ id: parseInt(id) }, { enabled: !!id });
  const runMutation = trpc.execution.runAgent.useMutation({
    onSuccess: (data) => {
      setResult(data);
      if (data.escalated) toast.warning("Execution escalated for human review");
      else toast.success("Execution completed successfully");
    },
    onError: (err) => toast.error(err.message),
  });

  const resolveMutation = trpc.execution.resolveEscalation.useMutation({
    onSuccess: () => {
      toast.success("Escalation resolved");
      setResult((r: any) => r ? { ...r, status: "completed" } : r);
    },
    onError: (err) => toast.error(err.message),
  });

  const riskColors: Record<string, string> = {
    low: "text-emerald-400", medium: "text-amber-400",
    high: "text-orange-400", critical: "text-red-400",
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-4xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/agents")}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold">Execution Console</h1>
            <p className="text-muted-foreground text-sm">{agent?.name} — {agent?.role}</p>
          </div>
        </div>

        {agent && (
          <Card className="bg-card border-border/50">
            <CardContent className="p-4">
              <div className="flex items-center gap-4 flex-wrap text-sm">
                <div><span className="text-muted-foreground">Role: </span><span className="font-medium">{agent.role}</span></div>
                <div><span className="text-muted-foreground">Confidence Threshold: </span><span className="font-medium">{((agent.confidenceThreshold ?? 0.75) * 100).toFixed(0)}%</span></div>
                <div><span className="text-muted-foreground">Risk Threshold: </span>
                  <span className={`font-medium ${riskColors[agent.riskThreshold ?? "medium"]}`}>{agent.riskThreshold}</span>
                </div>
                {(agent.capabilities as string[] | null)?.slice(0, 3).map((c: string) => (
                  <Badge key={c} variant="secondary" className="text-xs">{c}</Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Task Input</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea placeholder="Describe the task for this agent to execute..." value={input}
              onChange={e => setInput(e.target.value)} rows={5} />
            <Button onClick={() => runMutation.mutate({ agentId: parseInt(id), input })}
              disabled={!input.trim() || runMutation.isPending} className="w-full">
              {runMutation.isPending
                ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Running Agent...</>
                : <><Play className="w-4 h-4 mr-2" />Execute Agent</>}
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
              <div className="flex-1">
                <p className="font-semibold capitalize">{result.status}</p>
                {result.escalationReason && <p className="text-sm text-muted-foreground mt-1">{result.escalationReason}</p>}
              </div>
              {result.status === "escalated" && (
                <Button size="sm" onClick={() => resolveMutation.mutate({ id: result.executionId })}
                  disabled={resolveMutation.isPending}>
                  {resolveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : "Resolve"}
                </Button>
              )}
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <Card className="bg-card border-border/50">
                <CardContent className="p-4"><ConfidenceBar value={result.confidence} /></CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Risk Level</div>
                  <div className={`text-lg font-bold capitalize ${riskColors[result.riskLevel]}`}>{result.riskLevel}</div>
                </CardContent>
              </Card>
              <Card className="bg-card border-border/50">
                <CardContent className="p-4 space-y-1">
                  <div className="text-xs text-muted-foreground">Duration</div>
                  <div className="text-lg font-bold">{(result.durationMs / 1000).toFixed(1)}s</div>
                </CardContent>
              </Card>
            </div>

            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">Output</CardTitle></CardHeader>
              <CardContent>
                <div className="bg-secondary/50 rounded-lg p-4 text-sm whitespace-pre-wrap">{result.output}</div>
                {result.reasoning && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Reasoning</p>
                    <p className="text-sm text-muted-foreground italic">{result.reasoning}</p>
                  </div>
                )}
                {result.actionsTaken?.length > 0 && (
                  <div className="mt-3">
                    <p className="text-xs text-muted-foreground mb-1">Actions Taken</p>
                    <ul className="space-y-1">
                      {result.actionsTaken.map((a: string, i: number) => (
                        <li key={i} className="text-sm flex items-start gap-2">
                          <CheckCircle className="w-3 h-3 text-emerald-400 mt-0.5 shrink-0" />{a}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>

            {result.steps?.length > 0 && (
              <Card className="bg-card border-border/50">
                <CardHeader className="pb-2">
                  <button className="flex items-center justify-between w-full" onClick={() => setShowSteps(!showSteps)}>
                    <CardTitle className="text-base">Execution Steps ({result.steps.length})</CardTitle>
                    {showSteps ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </CardHeader>
                {showSteps && (
                  <CardContent>
                    <div className="space-y-2">
                      {result.steps.map((step: any, i: number) => (
                        <div key={i} className="p-3 rounded-lg bg-secondary/30 text-sm">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">{step.agentName}</span>
                            <Badge variant="outline" className="text-xs">{step.status}</Badge>
                            {step.confidenceScore != null && (
                              <span className="text-xs text-muted-foreground">{(step.confidenceScore * 100).toFixed(0)}% confidence</span>
                            )}
                          </div>
                          {step.output && <p className="text-muted-foreground text-xs line-clamp-2">{step.output}</p>}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
