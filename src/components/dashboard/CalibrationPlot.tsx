import { CALIBRATION_BINS, CAL_METRICS, plattRecalibrate, isotonicRecalibrate } from "@/lib/calibration";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Legend } from "recharts";
import { Target } from "lucide-react";

export function CalibrationPlot({ rawScore }: { rawScore?: number }) {
  const data = [
    { binMid: 0, raw: 0, platt: 0, isotonic: 0, perfect: 0 },
    ...CALIBRATION_BINS.map((b) => ({ ...b, perfect: b.binMid })),
    { binMid: 100, raw: 100, platt: 100, isotonic: 100, perfect: 100 },
  ];

  const platt = rawScore != null ? plattRecalibrate(rawScore) : null;
  const iso = rawScore != null ? isotonicRecalibrate(rawScore) : null;

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-2 mb-1">
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

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
            <XAxis dataKey="binMid" type="number" domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} label={{ value: "Predicted PD", fontSize: 9, position: "insideBottom", offset: -2, fill: "hsl(var(--muted-foreground))" }} />
            <YAxis type="number" domain={[0, 100]} fontSize={10} tickFormatter={(v) => `${v}%`} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: number, name) => [`${Number(v).toFixed(1)}%`, name]} />
            <Legend wrapperStyle={{ fontSize: 10 }} iconSize={8} />
            <ReferenceLine segment={[{ x: 0, y: 0 }, { x: 100, y: 100 }]} stroke="hsl(var(--muted-foreground))" strokeDasharray="3 3" ifOverflow="extendDomain" />
            <Line type="monotone" dataKey="raw" name="Raw XGBoost" stroke="hsl(0 70% 55%)" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="platt" name="Platt" stroke="hsl(35 90% 50%)" strokeWidth={2} dot={{ r: 2.5 }} />
            <Line type="monotone" dataKey="isotonic" name="Isotonic" stroke="hsl(152 60% 30%)" strokeWidth={2.5} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 mt-4 text-center">
        <MetricCard label="Raw" m={CAL_METRICS.raw} accent="text-risk-red" />
        <MetricCard label="Platt" m={CAL_METRICS.platt} accent="text-risk-amber" />
        <MetricCard label="Isotonic ✓" m={CAL_METRICS.isotonic} accent="text-idbi-green-deep" />
      </div>

      {rawScore != null && (
        <div className="mt-4 p-3 rounded-md bg-muted/40 border border-border">
          <div className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1.5">
            Recalibrated PD for this borrower
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <Bucket label="Raw" v={rawScore} muted />
            <Bucket label="Platt" v={platt!} />
            <Bucket label="Isotonic" v={iso!} highlight />
          </div>
          <p className="text-[10px] text-muted-foreground italic mt-2 leading-relaxed">
            Officer-facing PD uses the <strong className="text-foreground">isotonic</strong> output — lowest ECE
            (0.011) and Brier (0.104). Raw score over-states risk in the mid band by ~7 pts.
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
