import type { Borrower } from "@/lib/mock-data";

const MONTHS = ["M+1", "M+2", "M+3", "M+4", "M+5", "M+6", "M+7", "M+8", "M+9", "M+10", "M+11", "M+12"];

function cellColor(pd: number): string {
  // green → amber → orange → red
  if (pd < 25) return "bg-risk-green/80";
  if (pd < 45) return "bg-risk-amber/60";
  if (pd < 65) return "bg-idbi-orange/70";
  if (pd < 80) return "bg-idbi-orange";
  return "bg-risk-red";
}

interface Props {
  borrowers: Borrower[];
  selectedId: string;
  onSelect: (id: string) => void;
}

export function PortfolioHeatmap({ borrowers, selectedId, onSelect }: Props) {
  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-3">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Portfolio 12-Month PD Heatmap
          </h3>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Forward default probability per borrower, month-by-month. Click a row to inspect.
          </p>
        </div>
        <Legend />
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[10px]">
          <thead>
            <tr className="text-muted-foreground">
              <th className="text-left font-medium pb-2 pr-3 w-44">Borrower</th>
              {MONTHS.map((m) => (
                <th key={m} className="font-mono font-normal pb-2 px-0.5 text-center">{m}</th>
              ))}
              <th className="text-right font-medium pb-2 pl-2 w-12">Peak</th>
            </tr>
          </thead>
          <tbody>
            {borrowers.map((b) => {
              const peak = Math.max(...b.pdTrajectory);
              const selected = b.id === selectedId;
              return (
                <tr
                  key={b.id}
                  onClick={() => onSelect(b.id)}
                  className={`cursor-pointer transition-colors ${
                    selected ? "bg-idbi-green/5" : "hover:bg-foreground/[0.02]"
                  }`}
                >
                  <td className="py-1 pr-3">
                    <div className={`text-[11px] ${selected ? "font-bold text-idbi-green-deep" : "font-medium"}`}>
                      {b.name}
                    </div>
                    <div className="text-[9px] text-muted-foreground font-mono">{b.id}</div>
                  </td>
                  {b.pdTrajectory.map((pd, i) => (
                    <td key={i} className="px-0.5 py-1">
                      <div
                        className={`h-6 rounded-sm ${cellColor(pd)} grid place-items-center text-white font-mono font-semibold text-[9px] tabular-nums shadow-sm`}
                        title={`${MONTHS[i]}: PD ${pd.toFixed(1)}%`}
                      >
                        {pd >= 60 ? pd.toFixed(0) : ""}
                      </div>
                    </td>
                  ))}
                  <td className="py-1 pl-2 text-right font-mono font-bold tabular-nums">{peak.toFixed(0)}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="flex items-center gap-1 text-[9px] uppercase tracking-wider text-muted-foreground">
      <span>Low</span>
      <span className="size-3 rounded-sm bg-risk-green/80" />
      <span className="size-3 rounded-sm bg-risk-amber/60" />
      <span className="size-3 rounded-sm bg-idbi-orange/70" />
      <span className="size-3 rounded-sm bg-idbi-orange" />
      <span className="size-3 rounded-sm bg-risk-red" />
      <span>High</span>
    </div>
  );
}
