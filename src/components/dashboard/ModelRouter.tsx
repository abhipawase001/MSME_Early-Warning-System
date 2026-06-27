import { modelFor } from "@/lib/segments";
import type { Borrower } from "@/lib/mock-data";
import { Cpu } from "lucide-react";

export function ModelRouter({ borrower }: { borrower: Borrower }) {
  const m = modelFor(borrower);
  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-2 mb-3">
        <Cpu className="size-3.5 text-idbi-green-deep" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Model Routing
        </h3>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-idbi-green/10 text-idbi-green font-bold uppercase tracking-wider">
          Segment · {m.label}
        </span>
      </div>
      <div className="text-[11px] text-foreground/85 leading-relaxed mb-3">
        <strong className="text-idbi-green-deep">{m.family}</strong> selected automatically based on
        loan type, ticket size, and tenor. Ensemble routing keeps each segment on its best-fit
        method.
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3 text-center">
        <Stat k="Sub-model AUC" v={m.auc.toFixed(2)} accent />
        <Stat k="KS" v={m.ks.toFixed(2)} />
        <Stat k="Cutoff" v={m.cutoff.toString()} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
          Top features
        </div>
        <div className="flex flex-wrap gap-1.5">
          {m.features.map((f) => (
            <span
              key={f}
              className="px-2 py-0.5 text-[10px] rounded-sm bg-muted text-foreground/80 border border-border"
            >
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent?: boolean }) {
  return (
    <div className="border border-border rounded-md py-1.5">
      <div className={`font-mono text-base font-bold tabular-nums ${accent ? "text-idbi-green-deep" : ""}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
    </div>
  );
}
