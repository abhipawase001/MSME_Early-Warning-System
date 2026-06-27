import { useEffect, useMemo, useState, useTransition } from "react";
import { useServerFn } from "@tanstack/react-start";
import { scoreScenario } from "@/lib/score.functions";
import { computeFallbackScore, DEFAULT_SCENARIO, tierFor, type ScoreResult, type ScenarioInputs } from "@/lib/risk";
import type { Borrower } from "@/lib/mock-data";

interface Props {
  borrower: Borrower;
}

const tierBarColor = {
  low: "bg-risk-green",
  moderate: "bg-risk-amber",
  elevated: "bg-risk-amber",
  high: "bg-risk-red",
} as const;

export function ScenarioPanel({ borrower }: Props) {
  const [scenario, setScenario] = useState<ScenarioInputs>(DEFAULT_SCENARIO);
  const [serverResult, setServerResult] = useState<ScoreResult | null>(null);
  const [isPending, startTransition] = useTransition();
  const callScore = useServerFn(scoreScenario);

  // Reset on borrower change
  useEffect(() => {
    setScenario(DEFAULT_SCENARIO);
    setServerResult(null);
  }, [borrower.id]);

  // Instant client-side estimate so sliders feel real-time.
  const instant = useMemo(
    () =>
      computeFallbackScore(
        {
          sector: borrower.sector,
          gstCompliancePct: borrower.gstCompliancePct,
          debtServiceRatio: borrower.debtServiceRatio,
          baseScore: borrower.baseScore,
        },
        scenario,
      ),
    [borrower, scenario],
  );

  // Debounced server (ML) call.
  useEffect(() => {
    const t = setTimeout(() => {
      startTransition(async () => {
        try {
          const r = await callScore({ data: { borrowerId: borrower.id, ...scenario } });
          setServerResult(r);
        } catch (e) {
          console.warn("score call failed", e);
        }
      });
    }, 350);
    return () => clearTimeout(t);
  }, [borrower.id, scenario, callScore]);

  const display = serverResult ?? instant;
  const delta = +(display.score - borrower.baseScore).toFixed(1);
  const deltaUp = delta > 0;

  return (
    <aside className="w-80 border-l border-border bg-surface flex flex-col shrink-0 animate-in-soft [animation-delay:200ms] overflow-y-auto">
      <div className="p-4 border-b border-border bg-background flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-widest">Scenario Workbench</h2>
        <span
          className={`text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded ${
            display.source === "ml" ? "bg-risk-green/10 text-risk-green" : "bg-muted text-muted-foreground"
          }`}
          title={display.source === "ml" ? "Score from ML endpoint" : "Score from fallback formula"}
        >
          {display.source === "ml" ? "ML" : "Local"}
        </span>
      </div>

      <div className="p-6 space-y-8">
        <div className="p-4 bg-accent text-accent-foreground rounded-lg">
          <div className="text-[10px] uppercase font-bold tracking-wider opacity-60 mb-1">Projected Risk</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold tabular-nums">{display.score.toFixed(1)}</span>
            {delta !== 0 && (
              <span className={`text-xs font-bold ${deltaUp ? "text-risk-red" : "text-risk-green"}`}>
                {deltaUp ? "+" : ""}
                {delta} {deltaUp ? "↑" : "↓"}
              </span>
            )}
            {isPending && <span className="text-[10px] opacity-50 ml-auto">syncing…</span>}
          </div>
          <div className="mt-3 h-1 w-full bg-white/20 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-300 ${tierBarColor[display.tier]}`}
              style={{ width: `${display.score}%` }}
            />
          </div>
        </div>

        <Slider
          label="Revenue Delta"
          value={scenario.revenueDeltaPct}
          min={-50}
          max={50}
          step={1}
          unit="%"
          onChange={(v) => setScenario((s) => ({ ...s, revenueDeltaPct: v }))}
        />
        <Slider
          label="Payment Lag"
          value={scenario.paymentLagDays}
          min={0}
          max={90}
          step={1}
          unit="d"
          onChange={(v) => setScenario((s) => ({ ...s, paymentLagDays: v }))}
        />
        <Slider
          label="GST Filing Delay"
          value={scenario.gstFilingDelayDays}
          min={0}
          max={60}
          step={1}
          unit="d"
          onChange={(v) => setScenario((s) => ({ ...s, gstFilingDelayDays: v }))}
        />

        <div className="pt-4 space-y-2">
          <button
            type="button"
            className="w-full py-2.5 bg-accent text-accent-foreground text-xs font-bold rounded uppercase tracking-widest shadow-lg shadow-accent/10 hover:opacity-90 transition-opacity"
          >
            Generate Risk Memo
          </button>
          <button
            type="button"
            onClick={() => setScenario(DEFAULT_SCENARIO)}
            className="w-full py-2 text-muted-foreground text-xs font-semibold hover:text-foreground transition-colors"
          >
            Reset Simulation
          </button>
        </div>
      </div>

      {display.tier === "high" || display.tier === "elevated" ? (
        <div className="mt-auto p-4 border-t border-border">
          <div className="flex items-start gap-3 p-3 bg-risk-amber/5 rounded border border-risk-amber/20">
            <div className="size-4 mt-0.5 rounded-full border-2 border-risk-amber flex items-center justify-center text-[10px] font-bold text-risk-amber shrink-0">
              !
            </div>
            <p className="text-[10px] leading-relaxed text-foreground/80">
              <strong>Critical Impact:</strong> Scenario projects breach into {tierFor(display.score)} risk tier.
              Recommend covenant review before disbursal.
            </p>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, unit, onChange }: SliderProps) {
  const id = `slider-${label.replace(/\s+/g, "-").toLowerCase()}`;
  return (
    <div className="space-y-3">
      <div className="flex justify-between items-center">
        <label htmlFor={id} className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </label>
        <span className="text-[11px] font-mono tabular-nums">
          {value > 0 && unit !== "d" ? "+" : ""}
          {value}
          {unit}
        </span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-accent cursor-pointer"
      />
    </div>
  );
}
