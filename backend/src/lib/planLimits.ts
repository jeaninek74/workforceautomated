/**
 * Per-tier plan limits for WorkforceAutomated.
 * null = unlimited (Enterprise).
 */
export const PLAN_LIMITS: Record<string, { agents: number | null; teams: number | null; executionsPerMonth: number | null }> = {
  starter:      { agents: 5,    teams: 1,    executionsPerMonth: 10_000 },
  professional: { agents: 25,   teams: null, executionsPerMonth: 100_000 },
  enterprise:   { agents: null, teams: null, executionsPerMonth: null },
};

export function getLimits(plan: string) {
  return PLAN_LIMITS[plan] ?? PLAN_LIMITS["starter"];
}
