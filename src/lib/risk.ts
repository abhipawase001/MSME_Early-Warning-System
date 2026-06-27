// Shared risk types + transparent scoring formula used as fallback / what-if baseline.
export type RiskTier = "low" | "moderate" | "elevated" | "high";

export interface RiskFactor {
  name: string;
  impact: number; // positive = increases risk
  weight: number; // 0..1 for bar width
}

export interface ScenarioInputs {
  revenueDeltaPct: number; // -50..+50
  paymentLagDays: number; // 0..90
  gstFilingDelayDays: number; // 0..60
}

export interface ScoreResult {
  score: number; // 0..100
  tier: RiskTier;
  factors: RiskFactor[];
  source: "ml" | "fallback";
}

export const DEFAULT_SCENARIO: ScenarioInputs = {
  revenueDeltaPct: 0,
  paymentLagDays: 14,
  gstFilingDelayDays: 0,
};

export function tierFor(score: number): RiskTier {
  if (score < 35) return "low";
  if (score < 60) return "moderate";
  if (score < 80) return "elevated";
  return "high";
}

export function tierLabel(t: RiskTier) {
  return { low: "LOW RISK", moderate: "MODERATE RISK", elevated: "ELEVATED RISK", high: "HIGH RISK" }[t];
}

export function tierColor(t: RiskTier) {
  return { low: "risk-green", moderate: "risk-amber", elevated: "risk-amber", high: "risk-red" }[t];
}

// Deterministic, transparent scoring used as fallback when ML endpoint isn't configured,
// and as a fast-path for instant scenario re-scoring on the client.
export function computeFallbackScore(
  baseline: { sector: string; gstCompliancePct: number; debtServiceRatio: number; baseScore: number },
  scenario: ScenarioInputs,
): ScoreResult {
  const revenueDrag = Math.max(0, -scenario.revenueDeltaPct) * 0.55;
  const paymentDrag = Math.max(0, scenario.paymentLagDays - 7) * 0.45;
  const gstDrag = scenario.gstFilingDelayDays * 0.6;
  const complianceCredit = (baseline.gstCompliancePct - 90) * -0.25; // higher compliance = less risk
  const dscrCredit = (baseline.debtServiceRatio - 1.2) * -8;
  const raw = baseline.baseScore + revenueDrag + paymentDrag + gstDrag + complianceCredit + dscrCredit;
  const score = Math.max(0, Math.min(100, Math.round(raw * 10) / 10));

  const factors: RiskFactor[] = [
    {
      name: "Projected Revenue Drop",
      impact: +(revenueDrag).toFixed(1),
      weight: Math.min(1, revenueDrag / 25),
    },
    {
      name: "Buyer Payment Lag",
      impact: +(paymentDrag).toFixed(1),
      weight: Math.min(1, paymentDrag / 25),
    },
    {
      name: "GST Filing Delay",
      impact: +(gstDrag).toFixed(1),
      weight: Math.min(1, gstDrag / 25),
    },
    {
      name: "GST Compliance History",
      impact: +(complianceCredit).toFixed(1),
      weight: Math.min(1, Math.abs(complianceCredit) / 15),
    },
    {
      name: "Debt Service Coverage",
      impact: +(dscrCredit).toFixed(1),
      weight: Math.min(1, Math.abs(dscrCredit) / 15),
    },
  ].sort((a, b) => Math.abs(b.impact) - Math.abs(a.impact));

  return { score, tier: tierFor(score), factors, source: "fallback" };
}
