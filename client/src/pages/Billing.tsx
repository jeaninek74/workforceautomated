import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, Loader2, CreditCard, Zap, Users, Building2, ExternalLink } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { toast } from "sonner";

const PLAN_ICONS: Record<string, any> = { starter: Zap, professional: Users, enterprise: Building2 };

export default function Billing() {
  const { data: subscription } = trpc.billing.getSubscription.useQuery();
  const { data: plans, isLoading: plansLoading } = trpc.billing.getPlans.useQuery();
  const checkoutMutation = trpc.billing.createCheckoutSession.useMutation({
    onSuccess: (data) => {
      toast.info("Redirecting to Stripe checkout...");
      if (data.url) window.open(data.url, "_blank");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const currentPlan = (subscription as any)?.plan ?? "starter";

  return (
    <DashboardLayout>
      <div className="p-6 max-w-5xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Billing & Subscription</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your plan and payment details</p>
        </div>

        {subscription && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-4 flex items-center gap-4">
              <CreditCard className="w-8 h-8 text-primary shrink-0" />
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold capitalize">{currentPlan} Plan</span>
                  <Badge variant="secondary" className="capitalize">{(subscription as any).status ?? "active"}</Badge>
                </div>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {(subscription as any).stripeSubscriptionId
                    ? "Managed via Stripe. Use the portal to update payment or cancel."
                    : "Free tier — upgrade to unlock more agents and team workflows."}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="text-center mb-2">
          <h2 className="text-xl font-bold">Choose Your Plan</h2>
          <p className="text-muted-foreground text-sm mt-1">Scale your AI workforce with the right tier</p>
        </div>

        {plansLoading ? (
          <div className="grid md:grid-cols-3 gap-6">{[...Array(3)].map((_, i) => <div key={i} className="h-80 rounded-xl bg-secondary animate-pulse" />)}</div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {plans?.map((plan: any) => {
              const Icon = PLAN_ICONS[plan.id] ?? Zap;
              const isCurrent = currentPlan === plan.id;
              const isPopular = plan.id === "professional";
              return (
                <Card key={plan.id} className={`relative bg-card border-border/50 transition-all ${isPopular ? "border-primary/50 shadow-lg shadow-primary/10" : ""} ${isCurrent ? "ring-1 ring-primary/30" : ""}`}>
                  {isPopular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-primary text-primary-foreground text-xs font-semibold rounded-full">Most Popular</div>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center gap-2 mb-2">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isPopular ? "bg-primary/20" : "bg-secondary"}`}>
                        <Icon className={`w-4 h-4 ${isPopular ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <CardTitle className="text-base">{plan.name}</CardTitle>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-bold">${(plan.price / 100).toFixed(0)}</span>
                      <span className="text-muted-foreground text-sm">/{plan.interval}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <ul className="space-y-2">
                      {plan.features?.map((f: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="w-full mt-4"
                      variant={isCurrent ? "outline" : isPopular ? "default" : "outline"}
                      disabled={isCurrent || checkoutMutation.isPending}
                      onClick={() => !isCurrent && checkoutMutation.mutate({ plan: plan.id })}>
                      {checkoutMutation.isPending && checkoutMutation.variables?.plan === plan.id
                        ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Processing...</>
                        : isCurrent ? "Current Plan"
                        : currentPlan === "starter" ? "Upgrade"
                        : plan.id === "starter" ? "Downgrade"
                        : "Switch Plan"}
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        <Card className="bg-card border-border/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-sm">Test Payment</p>
                <p className="text-xs text-muted-foreground mt-0.5">Use card <span className="font-mono">4242 4242 4242 4242</span> with any future expiry and CVC to test</p>
              </div>
              <a href="https://dashboard.stripe.com" target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm"><ExternalLink className="w-3 h-3 mr-1" />Stripe Dashboard</Button>
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
