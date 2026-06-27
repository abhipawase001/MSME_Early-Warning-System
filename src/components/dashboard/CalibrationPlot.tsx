import { useMemo, useState } from "react";
import { COHORTS, type CohortDim, type CohortKey, cohortSampleSize, getCalibrationSlice, isotonicRecalibrate, plattRecalibrate } from "@/lib/calibration";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Legend } from "recharts";
import { Target } from "lucide-react";

const DIM_LABEL: Record<CohortDim, string> = {
  all: "All",
  sector: "Sector",
  ticket: "Ticket size",
  borrowerType: "Borrower type",
};

export function CalibrationPlot({ rawScore }: { rawScore?: number }) {
  const [dim, setDim] = useState<CohortDim>("all");
  const [cohort, setCohort] = useState<CohortKey>("all");

  const slice = useMemo(() => getCalibrationSlice(cohort), [cohort]);
  const n = useMemo(() => cohortSampleSize(cohort), [cohort]);

  const data = [
    { binMid: 0, raw: 0, platt: 0, isotonic: 0, perfect: 0 },
    ...slice.bins.map((b) => ({ ...b, perfect: b.binMid })),
    { binMid: 100, raw: 100, platt: 100, isotonic: 100, perfect: 100 },
  ];

  const platt = rawScore != null ? plattRecalibrate(rawScore, cohort) : null;
  const iso = rawScore != null ? isotonicRecalibrate(rawScore, cohort) : null;

  const thinData = n < 800;
  const drift = slice.metrics.isotonic.ece > 0.025;

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-2 mb-1 flex-wrap">
        <Target className="size-3.5 text-idbi-green-deep" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Calibration · Reliability Curve
        </h3>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-idbi-green/10 text-idbi-green font-bold uppercase tracking-wider">
          Isotonic active
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3">
        Predicted PD vs observed default rate on 12-mo holdout. Closer to the dotted diagonal = better calibrated.
      </p>

      {/* Cohort filter */}
      <div className="flex flex-wrap items-center gap-2 mb-3 p-2 rounded-md bg-muted/40 border border-border">
        <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Slice:</span>
        <div className="flex gap-1">
          {(Object.keys(DIM_LABEL) as CohortDim[]).map((d) => (
            <button
              key={d}
              onClick={() => {
                setDim(d);
                setCohort(COHORTS[d][0].key);
              }}
              className={`px-2 py-0.5 text-[10px] rounded-sm uppercase tracking-wider font-bold transition-colors ${
                dim === d
                  ? "bg-idbi-green-deep text-white"
                  : "bg-card border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {DIM_LABEL[d]}
            </button>
          ))}
        </div>
        {dim !== "all" && (
          <select
            value={cohort}
            onChange={(e) => setCohort(e.target.value)}
            className="ml-auto text-[11px] border border-border rounded px-2 py-1 bg-card"
          >
            {COHORTS[dim].map((c) => (
              <option key={c.key} value={c.key}>{c.label}</option>
            ))}
          </select>
        )}
        <span className="text-[10px] font-mono text-muted-foreground ml-auto">
          n = {n.toLocaleString("en-IN")}
        </span>
      </div>

      {(thinData || drift) && (
        <div className={`mb-3 text-[10px] px-2 py-1.5 rounded border ${drift ? "bg-risk-red/5 border-risk-red/30 text-risk-red" : "bg-risk-amber/5 border-risk-amber/30 text-risk-amber"}`}>
          {drift && <strong>Calibration drift in this cohort.</strong>}{drift && thinData && " "}
          {thinData && <span>Thin sample (n &lt; 800) — confidence bands widen; treat metrics as directional.</span>}
        </div>
      )}

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="binMid" type="number" domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} label={{ value: "Predicted PD", fontSize: 9, position: "insideBottom", offset: -2, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis type="number" domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v) => `${Number(v).toFixed(1)}%`} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" ifOverflow="extendDomain" />
            <Line type="monotone" dataKey="raw" name="Raw XGBoost" stroke="hsl(0 70% 55%)" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="platt" name="Platt" stroke="hsl(35 90% 50%)" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="isotonic" name="Isotonic" stroke="hsl(152 60% 30%)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics row — cohort-specific */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <MetricCard label="Raw" m={slice.metrics.raw} accent="text-risk-red" />
        <MetricCard label="Platt" m={slice.metrics.platt} accent="text-risk-amber" />
        <MetricCard label="Isotonic ✓" m={slice.metrics.isotonic} accent="text-idbi-green-deep" />
      </div>

      {rawScore != null && (
        <div className="mt-4 p-3 rounded-md bg-muted/40 border border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Recalibrated PD for this borrower · cohort = {cohort === "all" ? "All" : cohort}
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Bucket label="Raw" v={rawScore} muted />
            <Bucket label="Platt" v={platt!} />
            <Bucket label="Isotonic" v={iso!} highlight />
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-2 leading-relaxed">
            Officer-facing PD uses the <strong className="text-foreground">isotonic</strong> output, refit per cohort.
            ECE for this slice = <span className="font-mono text-foreground">{slice.metrics.isotonic.ece.toFixed(3)}</span>.
          </p>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, m, accent }: { label: string; m: { ece: number; brier: number; logloss: number }; accent: string }) {
  return (
    <div className="border border-border rounded-md py-2 px-2">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">{label}</div>
      <div className="grid grid-cols-3 gap-1 text-[10px]">
        <Stat k="ECE" v={m.ece.toFixed(3)} accent={accent} />
        <Stat k="Brier" v={m.brier.toFixed(3)} accent={accent} />
        <Stat k="LL" v={m.logloss.toFixed(3)} accent={accent} />
      </div>
    </div>
  );
}

function Stat({ k, v, accent }: { k: string; v: string; accent: string }) {
  return (
    <div>
      <div className={`font-mono text-[11px] font-bold tabular-nums ${accent}`}>{v}</div>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{k}</div>
    </div>
  );
}

function Bucket({ label, v, highlight, muted }: { label: string; v: number; highlight?: boolean; muted?: boolean }) {
  return (
    <div className={`rounded-md py-2 ${highlight ? "bg-idbi-green/10 border border-idbi-green/30" : muted ? "opacity-70" : ""}`}>
      <div className="text-[9px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className={`font-mono text-lg font-bold tabular-nums ${highlight ? "text-idbi-green-deep" : ""}`}>
        {v.toFixed(1)}%
      </div>
    </div>
  );
}
