import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, Download, Shield, Clock, User, Bot, AlertTriangle, CheckCircle, Filter } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const CATEGORY_ICONS: Record<string, any> = {
  agent: Bot, team: Shield, execution: CheckCircle, governance: Shield,
  billing: User, auth: User, escalation: AlertTriangle,
};

const CATEGORY_COLORS: Record<string, string> = {
  agent: "bg-blue-500/20 text-blue-400 border-blue-500/30",
  team: "bg-cyan-500/20 text-cyan-400 border-cyan-500/30",
  execution: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  governance: "bg-violet-500/20 text-violet-400 border-violet-500/30",
  billing: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  auth: "bg-gray-500/20 text-gray-400 border-gray-500/30",
  escalation: "bg-red-500/20 text-red-400 border-red-500/30",
};

export default function AuditLog() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [page, setPage] = useState(0);
  const PAGE_SIZE = 25;

  const { data: logs, isLoading } = trpc.audit.list.useQuery({ limit: 200 });

  const filtered = ((logs as any)?.logs ?? []).filter((l: any) => {
    const matchSearch = !search || l.action.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || l.category === category;
    return matchSearch && matchCat;
  });

  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  const exportCSV = () => {
    const rows = [
      ["Timestamp", "Action", "Category", "Confidence", "Risk", "Details"],
      ...filtered.map((l: any) => [
        new Date(l.createdAt).toISOString(),
        l.action, l.category,
        l.confidenceScore != null ? (l.confidenceScore * 100).toFixed(1) + "%" : "",
        l.riskLevel ?? "",
        JSON.stringify(l.details ?? {}),
      ]),
    ];
    const csv = rows.map((r: string[]) => r.map((c: string) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = `audit-log-${Date.now()}.csv`; a.click();
    toast.success("Audit log exported");
  };

  const categories = ["all", "agent", "team", "execution", "governance", "billing", "auth", "escalation"];

  return (
    <DashboardLayout>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Audit Log</h1>
            <p className="text-muted-foreground text-sm mt-1">Immutable record of all system actions and executions</p>
          </div>
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />Export CSV</Button>
        </div>

        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input className="pl-9" placeholder="Search actions..." value={search} onChange={e => { setSearch(e.target.value); setPage(0); }} />
          </div>
          <Select value={category} onValueChange={v => { setCategory(v); setPage(0); }}>
            <SelectTrigger className="w-44"><Filter className="w-4 h-4 mr-2" /><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c: string) => <SelectItem key={c} value={c}>{c === "all" ? "All Categories" : c}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="text-xs text-muted-foreground">
          Showing {filtered.length} entries{search || category !== "all" ? " (filtered)" : ""}
        </div>

        <Card className="bg-card border-border/50">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="p-6 space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-12 bg-secondary animate-pulse rounded" />)}</div>
            ) : paged.length === 0 ? (
              <div className="text-center py-12">
                <Shield className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No audit entries found</p>
              </div>
            ) : (
              <div className="divide-y divide-border/30">
                {paged.map((log: any, i: number) => {
                  const Icon = CATEGORY_ICONS[log.category] ?? Shield;
                  const colorClass = CATEGORY_COLORS[log.category] ?? CATEGORY_COLORS.auth;
                  return (
                    <div key={i} className="flex items-start gap-4 p-4 hover:bg-secondary/20 transition-colors">
                      <div className="w-8 h-8 rounded-lg bg-secondary/50 flex items-center justify-center shrink-0 mt-0.5">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-medium text-sm">{log.action}</span>
                          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium border ${colorClass}`}>{log.category}</span>
                          {log.confidenceScore != null && (
                            <span className="text-xs text-muted-foreground">
                              {(log.confidenceScore * 100).toFixed(0)}% confidence
                            </span>
                          )}
                          {log.riskLevel && (
                            <Badge variant="outline" className="text-xs capitalize">{log.riskLevel}</Badge>
                          )}
                        </div>
                        {log.details && Object.keys(log.details).length > 0 && (
                          <p className="text-xs text-muted-foreground mt-1 font-mono truncate">
                            {JSON.stringify(log.details)}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
                        <Clock className="w-3 h-3" />
                        {new Date(log.createdAt).toLocaleString()}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between">
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0}>Previous</Button>
            <span className="text-sm text-muted-foreground">Page {page + 1} of {totalPages}</span>
            <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1}>Next</Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
