import { MODEL_METRICS } from "@/lib/mock-data";

export function ModelPerformance() {
  const { auc, ks, gini, psi, confusion, note, trainedOn } = MODEL_METRICS;
  const total = confusion.tp + confusion.fp + confusion.tn + confusion.fn;
  const precision = confusion.tp / (confusion.tp + confusion.fp);
  const recall = confusion.tp / (confusion.tp + confusion.fn);
  const accuracy = (confusion.tp + confusion.tn) / total;

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-baseline justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
            Model Performance
          </h3>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            {note} · last trained {trainedOn}
          </p>
        </div>
        <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-idbi-green/10 text-idbi-green font-bold uppercase tracking-wider">
          Holdout
        </span>
      </div>

      <div className="grid grid-cols-4 gap-3 mb-4">
        <Stat label="AUC-ROC" value={auc.toFixed(2)} accent />
        <Stat label="KS stat" value={ks.toFixed(2)} />
        <Stat label="Gini" value={gini.toFixed(2)} />
        <Stat label="PSI" value={psi.toFixed(2)} hint={psi < 0.1 ? "stable" : "drift"} />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-2">
            Confusion @ cutoff {MODEL_METRICS.validationCutoff}
          </div>
          <div className="grid grid-cols-2 gap-1 text-center text-[10px]">
            <Cell label="TP" v={confusion.tp} good />
            <Cell label="FP" v={confusion.fp} />
            <Cell label="FN" v={confusion.fn} />
            <Cell label="TN" v={confusion.tn} good />
          </div>
        </div>
        <div className="space-y-1.5 text-[11px]">
          <Row k="Accuracy" v={(accuracy * 100).toFixed(1) + "%"} />
          <Row k="Precision" v={(precision * 100).toFixed(1) + "%"} />
          <Row k="Recall" v={(recall * 100).toFixed(1) + "%"} />
          <Row k="N (validation)" v={total.toLocaleString()} />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, hint, accent }: { label: string; value: string; hint?: string; accent?: boolean }) {
  return (
    <div className="border border-border rounded-lg p-2.5">
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-bold tabular-nums ${accent ? "text-idbi-green-deep" : ""}`}>{value}</div>
      {hint && <div className="text-[9px] text-muted-foreground">{hint}</div>}
    </div>
  );
}

function Cell({ label, v, good }: { label: string; v: number; good?: boolean }) {
  return (
    <div className={`p-1.5 rounded ${good ? "bg-idbi-green/10 text-idbi-green-deep" : "bg-muted text-foreground/70"}`}>
      <div className="font-mono font-bold tabular-nums">{v}</div>
      <div className="text-[9px] uppercase tracking-wider">{label}</div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3 border-b border-border/50 pb-1">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-mono tabular-nums font-medium">{v}</span>
    </div>
  );
}
