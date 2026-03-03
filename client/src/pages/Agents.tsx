import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Bot, Plus, Search, Play, Edit, Trash2, Clock, TrendingUp, AlertTriangle } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Agents() {
  const [search, setSearch] = useState("");
  const { data: agents, isLoading, refetch } = trpc.agent.list.useQuery();
  const deleteMutation = trpc.agent.delete.useMutation({
    onSuccess: () => { toast.success("Agent deleted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const filtered = agents?.filter((a: any) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    (a.role ?? "").toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const statusColor: Record<string, string> = {
    active: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    inactive: "bg-gray-500/20 text-gray-400 border-gray-500/30",
    draft: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">AI Agents</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your AI workforce</p>
          </div>
          <Link href="/agents/new"><Button><Plus className="w-4 h-4 mr-2" />New Agent</Button></Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search agents..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : !filtered.length ? (
          <div className="text-center py-16">
            <Bot className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No agents yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Create your first AI agent from a job description or manually.</p>
            <Link href="/agents/new"><Button>Create Agent</Button></Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((agent: any) => (
              <Card key={agent.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <Bot className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{agent.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${statusColor[agent.status] ?? statusColor.draft}`}>{agent.status}</span>
                        {agent.sourceType === "job_description" && <Badge variant="secondary" className="text-xs">AI-Generated</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{agent.role}</p>
                      {agent.description && <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{agent.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />Threshold: {((agent.confidenceThreshold ?? 0.75) * 100).toFixed(0)}%</span>
                        <span className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" />Risk: {agent.riskThreshold}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{agent.totalExecutions ?? 0} runs</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/execute/${agent.id}`}><Button size="sm"><Play className="w-3 h-3 mr-1" />Run</Button></Link>
                      <Link href={`/agents/${agent.id}/edit`}><Button size="sm" variant="outline"><Edit className="w-3 h-3" /></Button></Link>
                      <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300"
                        onClick={() => { if (confirm("Delete this agent?")) deleteMutation.mutate({ id: agent.id }); }}>
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
