import type { RiskFactor } from "@/lib/risk";

export function RiskFactors({ factors }: { factors: RiskFactor[] }) {
  return (
    <div className="space-y-4">
      {factors.slice(0, 5).map((f) => {
        const negative = f.impact > 0; // increases risk
        const color = negative ? "bg-risk-red" : "bg-risk-green";
        const text = negative ? "text-risk-red" : "text-risk-green";
        return (
          <div key={f.name} className="space-y-1.5">
            <div className="flex justify-between text-[11px] font-medium">
              <span className="text-foreground/80">{f.name}</span>
              <span className={`font-mono ${text}`}>
                {f.impact > 0 ? "+" : ""}
                {f.impact.toFixed(1)}
              </span>
            </div>
            <div className={`h-1.5 w-full bg-background rounded-full overflow-hidden flex ${negative ? "" : "justify-end"}`}>
              <div className={`h-full rounded-full ${color}`} style={{ width: `${Math.max(6, f.weight * 100)}%` }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
