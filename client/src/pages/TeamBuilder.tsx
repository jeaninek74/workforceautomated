import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ChevronLeft, Plus, Trash2, Loader2, GripVertical, Bot, ArrowDown } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

interface TeamMember {
  agentId: number;
  order: number;
  role: string;
  isRequired: boolean;
}

export default function TeamBuilder() {
  const [, navigate] = useLocation();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [governanceMode, setGovernanceMode] = useState<"sequential" | "parallel" | "conditional">("sequential");
  const [confidenceThreshold, setConfidenceThreshold] = useState(0.75);
  const [escalationPolicy, setEscalationPolicy] = useState<"stop" | "continue" | "human_review">("human_review");
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [memberRole, setMemberRole] = useState("");

  const { data: agents } = trpc.agent.list.useQuery();
  const createMutation = trpc.team.create.useMutation({
    onSuccess: () => { toast.success("Team created!"); navigate("/teams"); },
    onError: (err) => toast.error(err.message),
  });

  const addMember = () => {
    if (!selectedAgent) { toast.error("Select an agent"); return; }
    const agentId = parseInt(selectedAgent);
    if (members.find(m => m.agentId === agentId)) { toast.error("Agent already in team"); return; }
    setMembers([...members, { agentId, order: members.length, role: memberRole || "member", isRequired: true }]);
    setSelectedAgent(""); setMemberRole("");
  };

  const removeMember = (idx: number) => {
    setMembers(members.filter((_, i) => i !== idx).map((m, i) => ({ ...m, order: i })));
  };

  const getAgentName = (id: number) => agents?.find((a: any) => a.id === id)?.name ?? `Agent ${id}`;

  const handleSubmit = () => {
    if (!name) { toast.error("Team name is required"); return; }
    if (members.length < 2) { toast.error("A team needs at least 2 agents"); return; }
    createMutation.mutate({ name, description, governanceMode, confidenceThreshold, memberAgentIds: members.map(m => ({ agentId: m.agentId, role: m.role as "lead" | "member" | "reviewer" })) });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/teams")}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold">Team Workflow Builder</h1>
            <p className="text-muted-foreground text-sm">Compose multi-agent workflows with governance rules</p>
          </div>
        </div>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Team Details</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>Team Name *</Label>
              <Input className="mt-1" placeholder="e.g. Customer Onboarding Team" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div>
              <Label>Description</Label>
              <Textarea className="mt-1" placeholder="What does this team accomplish?" value={description} onChange={e => setDescription(e.target.value)} rows={2} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Governance Settings</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Execution Mode</Label>
                <Select value={governanceMode} onValueChange={(v: any) => setGovernanceMode(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sequential">Sequential — one at a time</SelectItem>
                    <SelectItem value="parallel">Parallel — all at once</SelectItem>
                    <SelectItem value="conditional">Conditional — based on results</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Escalation Policy</Label>
                <Select value={escalationPolicy} onValueChange={(v: any) => setEscalationPolicy(v)}>
                  <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="human_review">Human Review</SelectItem>
                    <SelectItem value="stop">Stop Workflow</SelectItem>
                    <SelectItem value="continue">Continue Anyway</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label>Team Confidence Threshold: {(confidenceThreshold * 100).toFixed(0)}%</Label>
              <p className="text-xs text-muted-foreground mb-2">Team-level confidence required to proceed without escalation</p>
              <Slider min={0.1} max={1} step={0.05} value={[confidenceThreshold]}
                onValueChange={([v]: number[]) => setConfidenceThreshold(v)} />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border/50">
          <CardHeader><CardTitle className="text-base">Team Members ({members.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {members.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground text-sm">
                <Bot className="w-8 h-8 mx-auto mb-2 opacity-40" />
                Add at least 2 agents to form a team
              </div>
            ) : (
              <div className="space-y-2">
                {members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-secondary/30 border border-border/30">
                    <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="w-7 h-7 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary shrink-0">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{getAgentName(m.agentId)}</div>
                      <div className="text-xs text-muted-foreground">{m.role}</div>
                    </div>
                    {governanceMode === "sequential" && i < members.length - 1 && (
                      <ArrowDown className="w-3 h-3 text-muted-foreground" />
                    )}
                    <Button size="sm" variant="ghost" className="text-red-400 hover:text-red-300 shrink-0"
                      onClick={() => removeMember(i)}><Trash2 className="w-3 h-3" /></Button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-border/30 pt-4">
              <Label className="text-sm">Add Agent</Label>
              <div className="flex gap-2 mt-2">
                <Select value={selectedAgent} onValueChange={setSelectedAgent}>
                  <SelectTrigger className="flex-1"><SelectValue placeholder="Select agent..." /></SelectTrigger>
                  <SelectContent>
                    {agents?.filter((a: any) => !members.find(m => m.agentId === a.id)).map((a: any) => (
                      <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input placeholder="Role in team" value={memberRole} onChange={e => setMemberRole(e.target.value)} className="w-40" />
                <Button variant="outline" onClick={addMember}><Plus className="w-4 h-4" /></Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full">
          {createMutation.isPending
            ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Team...</>
            : "Create Team Workflow"}
        </Button>
      </div>
    </DashboardLayout>
  );
}
