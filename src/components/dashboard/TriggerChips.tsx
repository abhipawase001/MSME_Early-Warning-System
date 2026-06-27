import { evaluateTriggers, TRIGGER_COLOR } from "@/lib/triggers";
import type { Borrower } from "@/lib/mock-data";
import { ShieldAlert } from "lucide-react";

export function TriggerChips({ borrower }: { borrower: Borrower }) {
  const triggers = evaluateTriggers(borrower);
  if (triggers.length === 0) {
    return (
      <div className="p-3 border border-border rounded-lg bg-card flex items-center gap-2 text-[11px] text-muted-foreground">
        <ShieldAlert className="size-3.5 text-risk-green" />
        No regulator-style triggers fired. Borrower within all hard-rule covenants.
      </div>
    );
  }
  return (
    <div className="p-4 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-2 mb-2.5">
        <ShieldAlert className="size-3.5 text-idbi-orange" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Hard-Rule Triggers Fired
        </h3>
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">
          {triggers.length} active
        </span>
      </div>
      <div className="space-y-1.5">
        {triggers.map((t) => {
          const c = TRIGGER_COLOR[t.severity];
          return (
            <div
              key={t.code}
              className={`flex items-start gap-2.5 p-2 rounded-md border bg-${c}/5 border-${c}/30`}
            >
              <span
                className={`shrink-0 mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold uppercase tracking-wider bg-${c}/15 text-${c}`}
              >
                {t.severity}
              </span>
              <div className="flex-1 text-[11px] leading-tight">
                <div className="font-semibold text-foreground">{t.label}</div>
                <div className="text-muted-foreground mt-0.5">{t.rationale}</div>
              </div>
              <span className="font-mono text-[9px] text-muted-foreground shrink-0">{t.code}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
