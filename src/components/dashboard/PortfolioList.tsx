import type { Borrower } from "@/lib/mock-data";
import { tierFor } from "@/lib/risk";

interface Props {
  borrowers: Borrower[];
  selectedId: string;
  onSelect: (id: string) => void;
  query: string;
  onQueryChange: (q: string) => void;
}

const tierTextColor = {
  low: "text-risk-green",
  moderate: "text-risk-amber",
  elevated: "text-risk-amber",
  high: "text-risk-red",
} as const;

export function PortfolioList({ borrowers, selectedId, onSelect, query, onQueryChange }: Props) {
  const filtered = borrowers.filter(
    (b) => b.name.toLowerCase().includes(query.toLowerCase()) || b.id.toLowerCase().includes(query.toLowerCase()),
  );
  return (
    <aside className="w-72 border-r border-border bg-surface flex flex-col shrink-0 animate-in-soft">
      <div className="p-4 border-b border-border flex items-center justify-between bg-idbi-green text-white">
        <div className="leading-tight">
          <div className="font-display text-sm">Borrower Portfolio</div>
          <div className="text-[9px] uppercase tracking-[0.18em] text-white/70">MSME · Track 04</div>
        </div>
        <div className="size-2 rounded-full bg-idbi-orange shadow-[0_0_8px_color-mix(in_oklab,var(--color-idbi-orange)_70%,transparent)]" />
      </div>
      <div className="p-3 border-b border-border bg-background/50">
        <input
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Search portfolio..."
          className="w-full px-3 py-1.5 text-xs bg-surface border border-border rounded focus:ring-2 focus:ring-accent/10 outline-none"
        />
      </div>
      <nav className="flex-1 overflow-y-auto p-2 space-y-1" aria-label="Borrower portfolio">
        {filtered.map((b) => {
          const tier = tierFor(b.baseScore);
          const selected = b.id === selectedId;
          return (
            <button
              type="button"
              key={b.id}
              onClick={() => onSelect(b.id)}
              aria-current={selected ? "true" : undefined}
              className={`w-full text-left p-3 rounded flex flex-col gap-1 transition-colors ${
                selected ? "bg-accent/5 border border-accent/10" : "hover:bg-foreground/[0.03] border border-transparent"
              }`}
            >
              <div className="flex justify-between items-start">
                <span className={`text-sm ${selected ? "font-semibold" : "font-medium text-foreground/80"}`}>{b.name}</span>
                <span className={`font-mono text-[10px] font-bold ${tierTextColor[tier]}`}>{b.baseScore.toFixed(1)}</span>
              </div>
              <span className="text-[10px] text-muted-foreground uppercase tracking-wider">ID: {b.id}</span>
            </button>
          );
        })}
        {filtered.length === 0 && (
          <p className="text-xs text-muted-foreground p-4 text-center">No borrowers match.</p>
        )}
      </nav>
    </aside>
  );
}
