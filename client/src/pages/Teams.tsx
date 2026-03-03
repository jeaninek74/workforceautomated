import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "wouter";
import { Users, Plus, Search, Play, Edit, Trash2, Bot, GitBranch } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

export default function Teams() {
  const [search, setSearch] = useState("");
  const { data: teams, isLoading, refetch } = trpc.team.list.useQuery();
  const deleteMutation = trpc.team.delete.useMutation({
    onSuccess: () => { toast.success("Team deleted"); refetch(); },
    onError: (err) => toast.error(err.message),
  });

  const filtered = teams?.filter((t: any) =>
    t.name.toLowerCase().includes(search.toLowerCase())
  ) ?? [];

  const modeColors: Record<string, string> = {
    sequential: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    parallel: "bg-violet-500/20 text-violet-400 border-violet-500/30",
    conditional: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  };

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Agent Teams</h1>
            <p className="text-muted-foreground text-sm mt-1">Multi-agent workflow orchestration</p>
          </div>
          <Link href="/teams/new"><Button><Plus className="w-4 h-4 mr-2" />New Team</Button></Link>
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input className="pl-9" placeholder="Search teams..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {isLoading ? (
          <div className="grid gap-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : !filtered.length ? (
          <div className="text-center py-16">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No teams yet</h3>
            <p className="text-muted-foreground text-sm mb-4">Build a multi-agent workflow team to tackle complex tasks.</p>
            <Link href="/teams/new"><Button>Create Team</Button></Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {filtered.map((team: any) => (
              <Card key={team.id} className="bg-card border-border/50 hover:border-primary/20 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-lg bg-cyan-400/10 flex items-center justify-center shrink-0">
                      <Users className="w-5 h-5 text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold truncate">{team.name}</h3>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium border ${modeColors[team.governanceMode ?? "sequential"] ?? modeColors.sequential}`}>
                          {team.governanceMode}
                        </span>
                      </div>
                      {team.description && <p className="text-sm text-muted-foreground line-clamp-1">{team.description}</p>}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1"><Bot className="w-3 h-3" />{team.totalExecutions ?? 0} runs</span>
                        <span className="flex items-center gap-1"><GitBranch className="w-3 h-3" />Threshold: {((team.confidenceThreshold ?? 0.75) * 100).toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/team-execute/${team.id}`}><Button size="sm"><Play className="w-3 h-3 mr-1" />Run</Button></Link>
                      <Link href={`/teams/${team.id}/edit`}><Button size="sm" variant="outline"><Edit className="w-3 h-3" /></Button></Link>
                      <Button size="sm" variant="outline" className="text-red-400 hover:text-red-300"
                        onClick={() => { if (confirm("Delete this team?")) deleteMutation.mutate({ id: team.id }); }}>
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
