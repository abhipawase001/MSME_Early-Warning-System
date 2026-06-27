import type { RiskTier } from "@/lib/risk";

const BANDS: { tier: RiskTier; range: string; label: string; color: string; action: string }[] = [
  { tier: "low", range: "0 – 35", label: "Standard", color: "bg-risk-green", action: "Routine monitoring · annual review" },
  { tier: "moderate", range: "36 – 55", label: "Watch", color: "bg-risk-amber", action: "Quarterly review · alert on GST lapse" },
  { tier: "elevated", range: "56 – 75", label: "Elevated", color: "bg-idbi-orange", action: "Monthly review · request fresh statements" },
  { tier: "high", range: "76 – 100", label: "High", color: "bg-risk-red", action: "Restructure · field visit · credit committee" },
];

const LOAN_TYPES = ["Working Capital", "Term Loan", "Equipment Finance", "MUDRA / PMEGP"];

export function InterpretationFramework({ score, tier }: { score: number; tier: RiskTier }) {
  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-baseline justify-between mb-4 gap-4 flex-wrap">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Common Interpretation Framework
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            One unified 0–100 score, four action tiers — applied uniformly across loan products.
          </p>
        </div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground">
          Applies to: <span className="text-foreground font-medium">{LOAN_TYPES.join(" · ")}</span>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-3">
        {BANDS.map((b) => {
          const active = b.tier === tier;
          return (
            <div
              key={b.tier}
              className={`p-3 rounded-lg border transition-all ${
                active
                  ? "border-idbi-green-deep bg-idbi-green/5 shadow-sm"
                  : "border-border bg-background/50"
              }`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className={`size-2 rounded-full ${b.color}`} />
                <span className="text-[11px] font-bold uppercase tracking-wider">{b.label}</span>
                {active && (
                  <span className="ml-auto text-[9px] font-bold text-idbi-orange uppercase tracking-widest">
                    Current
                  </span>
                )}
              </div>
              <div className="font-mono text-xs tabular-nums text-foreground/80 mb-1">{b.range}</div>
              <div className="text-[10px] text-muted-foreground leading-snug">{b.action}</div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-[10px] text-muted-foreground">
        <span>
          Borrower score: <span className="font-mono font-bold text-foreground">{score.toFixed(1)}</span>
        </span>
        <span className="italic">
          Framework aligns with IDBI Innovate 2026 · Track 04 — common interpretation across MSME loan types.
        </span>
      </div>
    </div>
  );
}
