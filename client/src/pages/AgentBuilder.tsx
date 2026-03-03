import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Bot, Wand2, Plus, X, Loader2, ChevronLeft } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

interface AgentFormData {
  name: string;
  role: string;
  description: string;
  systemPrompt: string;
  confidenceThreshold: number;
  riskThreshold: "low" | "medium" | "high" | "critical";
  capabilities: string[];
  permissions: string[];
}

function AgentFormFields({ form, setForm }: { form: AgentFormData; setForm: (f: AgentFormData) => void }) {
  const [capInput, setCapInput] = useState("");
  const [permInput, setPermInput] = useState("");

  const addTag = (field: "capabilities" | "permissions", value: string) => {
    if (!value.trim()) return;
    setForm({ ...form, [field]: [...form[field], value.trim()] });
    if (field === "capabilities") setCapInput(""); else setPermInput("");
  };
  const removeTag = (field: "capabilities" | "permissions", idx: number) =>
    setForm({ ...form, [field]: form[field].filter((_, i) => i !== idx) });

  return (
    <div className="space-y-4">
      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-base">Basic Information</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Agent Name *</Label>
              <Input className="mt-1" placeholder="e.g. Customer Support Agent" value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })} />
            </div>
            <div>
              <Label>Role *</Label>
              <Input className="mt-1" placeholder="e.g. Customer Support Specialist" value={form.role}
                onChange={e => setForm({ ...form, role: e.target.value })} />
            </div>
          </div>
          <div>
            <Label>Description</Label>
            <Textarea className="mt-1" placeholder="What does this agent do?" value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })} rows={2} />
          </div>
          <div>
            <Label>System Prompt</Label>
            <Textarea className="mt-1" placeholder="Instructions for the AI agent..." value={form.systemPrompt}
              onChange={e => setForm({ ...form, systemPrompt: e.target.value })} rows={4} />
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-base">Capabilities & Permissions</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Capabilities</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Add capability..." value={capInput} onChange={e => setCapInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag("capabilities", capInput)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addTag("capabilities", capInput)}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.capabilities.map((c, i) => (
                <Badge key={i} variant="secondary" className="gap-1">{c}
                  <button onClick={() => removeTag("capabilities", i)}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <Label>Permissions</Label>
            <div className="flex gap-2 mt-1">
              <Input placeholder="Add permission..." value={permInput} onChange={e => setPermInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTag("permissions", permInput)} />
              <Button type="button" variant="outline" size="sm" onClick={() => addTag("permissions", permInput)}><Plus className="w-4 h-4" /></Button>
            </div>
            <div className="flex flex-wrap gap-2 mt-2">
              {form.permissions.map((p, i) => (
                <Badge key={i} variant="outline" className="gap-1">{p}
                  <button onClick={() => removeTag("permissions", i)}><X className="w-3 h-3" /></button>
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-card border-border/50">
        <CardHeader><CardTitle className="text-base">Governance Thresholds</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Confidence Threshold: {(form.confidenceThreshold * 100).toFixed(0)}%</Label>
            <p className="text-xs text-muted-foreground mb-2">Executions below this confidence will be escalated for human review</p>
            <Slider min={0.1} max={1} step={0.05} value={[form.confidenceThreshold]}
              onValueChange={([v]: number[]) => setForm({ ...form, confidenceThreshold: v })} />
          </div>
          <div>
            <Label>Risk Threshold</Label>
            <div className="flex gap-2 mt-2">
              {(["low", "medium", "high", "critical"] as const).map(r => (
                <button key={r} onClick={() => setForm({ ...form, riskThreshold: r })}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border transition-colors ${form.riskThreshold === r ? "bg-primary text-primary-foreground border-primary" : "border-border/50 hover:border-primary/30"}`}>
                  {r}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function AgentBuilder() {
  const [, navigate] = useLocation();
  const [tab, setTab] = useState("ai");
  const [jd, setJd] = useState("");
  const [generated, setGenerated] = useState<any>(null);
  const [form, setForm] = useState<AgentFormData>({
    name: "", role: "", description: "", systemPrompt: "",
    confidenceThreshold: 0.75, riskThreshold: "medium",
    capabilities: [], permissions: [],
  });

  const generateMutation = trpc.agent.fromJobDescription.useMutation({
    onSuccess: (data) => {
      setGenerated(data);
      setForm({ name: data.name, role: data.role, description: data.description, systemPrompt: data.systemPrompt, confidenceThreshold: data.confidenceThreshold, riskThreshold: data.riskThreshold, capabilities: data.capabilities, permissions: data.permissions });
      setTab("review");
      toast.success("Agent configuration generated!");
    },
    onError: (err) => toast.error(err.message),
  });

  const createMutation = trpc.agent.create.useMutation({
    onSuccess: () => { toast.success("Agent created!"); navigate("/agents"); },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = () => {
    if (!form.name || !form.role) { toast.error("Name and role are required"); return; }
    createMutation.mutate({ ...form, sourceType: generated ? "job_description" : "manual", sourceJobDescription: generated ? jd : undefined });
  };

  return (
    <DashboardLayout>
      <div className="p-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/agents")}><ChevronLeft className="w-4 h-4 mr-1" />Back</Button>
          <div>
            <h1 className="text-2xl font-bold">Agent Builder</h1>
            <p className="text-muted-foreground text-sm">Create an AI agent from a job description or manually</p>
          </div>
        </div>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="grid grid-cols-3 w-full">
            <TabsTrigger value="ai"><Wand2 className="w-4 h-4 mr-1" />AI from JD</TabsTrigger>
            <TabsTrigger value="manual"><Bot className="w-4 h-4 mr-1" />Manual</TabsTrigger>
            <TabsTrigger value="review" disabled={!generated && tab !== "review"}>Review & Save</TabsTrigger>
          </TabsList>

          <TabsContent value="ai" className="space-y-4 mt-4">
            <Card className="bg-card border-border/50">
              <CardHeader><CardTitle className="text-base">Paste a Job Description</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  placeholder="Paste the full job description here... The AI will extract the role, capabilities, permissions, and governance thresholds automatically."
                  value={jd} onChange={e => setJd(e.target.value)} rows={10} />
                <Button onClick={() => generateMutation.mutate({ jobDescription: jd })}
                  disabled={jd.length < 50 || generateMutation.isPending} className="w-full">
                  {generateMutation.isPending
                    ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Generating...</>
                    : <><Wand2 className="w-4 h-4 mr-2" />Generate Agent Configuration</>}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manual" className="mt-4">
            <AgentFormFields form={form} setForm={setForm} />
          </TabsContent>

          <TabsContent value="review" className="mt-4">
            {generated && (
              <Card className="bg-primary/5 border-primary/20 mb-4">
                <CardContent className="p-4 text-sm text-primary">
                  AI-generated configuration from job description. Review and adjust before saving.
                </CardContent>
              </Card>
            )}
            <AgentFormFields form={form} setForm={setForm} />
          </TabsContent>
        </Tabs>

        {(tab === "manual" || tab === "review") && (
          <Button onClick={handleSubmit} disabled={createMutation.isPending} className="w-full">
            {createMutation.isPending
              ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Creating Agent...</>
              : "Create Agent"}
          </Button>
        )}
      </div>
    </DashboardLayout>
  );
}
