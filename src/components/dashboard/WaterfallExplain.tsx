import type { RiskFactor } from "@/lib/risk";

interface Props {
  baseRate: number; // sector base
  factors: RiskFactor[];
  finalScore: number;
}

/**
 * SHAP-style waterfall: base rate -> sum of contributions -> final score.
 * Positive contributions push risk up (red), negative push down (green).
 */
export function WaterfallExplain({ baseRate, factors, finalScore }: Props) {
  const top = factors.slice(0, 5);
  const max = Math.max(finalScore, baseRate, ...top.map((f) => Math.abs(f.impact))) || 1;
  const scale = (v: number) => Math.max(2, Math.min(100, (Math.abs(v) / max) * 80));

  // Build cumulative bars
  let running = baseRate;
  const steps = top.map((f) => {
    const start = running;
    running += f.impact;
    return { factor: f, start, end: running };
  });

  return (
    <div className="space-y-2.5">
      <Bar label="Sector base rate" value={baseRate} width={scale(baseRate)} color="bg-muted-foreground/40" mono />

      {steps.map(({ factor, start, end }) => {
        const positive = factor.impact > 0;
        const color = positive ? "bg-risk-red" : "bg-risk-green";
        const offset = (Math.min(start, end) / max) * 80;
        return (
          <div key={factor.name} className="space-y-0.5">
            <div className="flex justify-between text-[11px]">
              <span className="text-foreground/80 font-medium">{factor.name}</span>
              <span className={`font-mono tabular-nums ${positive ? "text-risk-red" : "text-risk-green"}`}>
                {positive ? "+" : ""}{factor.impact.toFixed(1)}
              </span>
            </div>
            <div className="h-2 w-full bg-background rounded-sm relative overflow-hidden">
              <div
                className={`absolute top-0 bottom-0 ${color} rounded-sm`}
                style={{ left: `${offset}%`, width: `${scale(factor.impact)}%` }}
              />
            </div>
          </div>
        );
      })}

      <div className="pt-2 border-t border-border">
        <Bar
          label="Final composite score"
          value={finalScore}
          width={scale(finalScore)}
          color="bg-idbi-green-deep"
          mono
          bold
        />
      </div>
    </div>
  );
}

function Bar({
  label,
  value,
  width,
  color,
  mono,
  bold,
}: {
  label: string;
  value: number;
  width: number;
  color: string;
  mono?: boolean;
  bold?: boolean;
}) {
  return (
    <div className="space-y-0.5">
      <div className="flex justify-between text-[11px]">
        <span className={`text-foreground/80 ${bold ? "font-bold" : "font-medium"}`}>{label}</span>
        <span className={`${mono ? "font-mono" : ""} tabular-nums ${bold ? "font-bold text-idbi-green-deep" : ""}`}>
          {value.toFixed(1)}
        </span>
      </div>
      <div className="h-2 w-full bg-background rounded-sm overflow-hidden">
        <div className={`h-full ${color} rounded-sm`} style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
