import { useMemo } from "react";
import { Lightbulb } from "lucide-react";
import { computeFallbackScore, tierLabel, tierFor, type ScenarioInputs } from "@/lib/risk";
import type { Borrower } from "@/lib/mock-data";

interface Props {
  borrower: Borrower;
  scenario: ScenarioInputs;
  currentScore: number;
}

/**
 * Suggest the smallest single-variable change that would drop the borrower
 * into a better risk tier. Probes the fallback formula locally.
 */
export function CounterfactualHint({ borrower, scenario, currentScore }: Props) {
  const suggestion = useMemo(() => {
    const baseline = {
      sector: borrower.sector,
      gstCompliancePct: borrower.gstCompliancePct,
      debtServiceRatio: borrower.debtServiceRatio,
      baseScore: borrower.baseScore,
    };
    const currentTier = tierFor(currentScore);
    if (currentTier === "low") return null;

    const probes: { label: string; mutate: (s: ScenarioInputs) => ScenarioInputs; format: (v: number) => string }[] = [
      {
        label: "payment lag",
        format: (v) => `to ${v} days`,
        mutate: (s) => ({ ...s, paymentLagDays: Math.max(0, s.paymentLagDays - 1) }),
      },
      {
        label: "GST filing delay",
        format: (v) => `to ${v} days`,
        mutate: (s) => ({ ...s, gstFilingDelayDays: Math.max(0, s.gstFilingDelayDays - 1) }),
      },
      {
        label: "revenue",
        format: (v) => `by ${v > 0 ? "+" : ""}${v}%`,
        mutate: (s) => ({ ...s, revenueDeltaPct: s.revenueDeltaPct + 1 }),
      },
    ];

    let best: { label: string; valueLabel: string; newScore: number; newTier: string; steps: number } | null = null;
    for (const p of probes) {
      let s = { ...scenario };
      for (let i = 0; i < 40; i++) {
        s = p.mutate(s);
        const r = computeFallbackScore(baseline, s);
        if (tierFor(r.score) !== currentTier && r.score < currentScore) {
          const value =
            p.label === "payment lag" ? s.paymentLagDays :
            p.label === "GST filing delay" ? s.gstFilingDelayDays :
            s.revenueDeltaPct;
          const candidate = {
            label: p.label,
            valueLabel: p.format(value),
            newScore: r.score,
            newTier: tierLabel(r.tier),
            steps: i + 1,
          };
          if (!best || candidate.steps < best.steps) best = candidate;
          break;
        }
      }
    }
    return best;
  }, [borrower, scenario, currentScore]);

  if (!suggestion) return null;

  return (
    <div className="mt-4 p-3 rounded-lg border border-idbi-orange/30 bg-idbi-orange/5 flex items-start gap-2.5">
      <Lightbulb className="size-4 text-idbi-orange shrink-0 mt-0.5" />
      <div className="text-[11px] leading-relaxed">
        <span className="font-bold text-idbi-orange uppercase tracking-wider text-[10px] block mb-0.5">
          Counterfactual
        </span>
        <span className="text-foreground/80">
          Change <strong>{suggestion.label}</strong> {suggestion.valueLabel} →{" "}
          score drops to <span className="font-mono font-bold">{suggestion.newScore.toFixed(1)}</span>{" "}
          ({suggestion.newTier.toLowerCase()}).
        </span>
      </div>
    </div>
  );
}
