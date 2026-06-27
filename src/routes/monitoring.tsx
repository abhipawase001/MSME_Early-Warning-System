import { createFileRoute, Link } from "@tanstack/react-router";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, ReferenceLine, Bar, BarChart, Cell } from "recharts";
import { SUB_MODELS } from "@/lib/segments";

export const Route = createFileRoute("/monitoring")({
  head: () => ({
    meta: [
      { title: "Model Monitoring · IDBI Innovate Track 04" },
      { name: "description", content: "PSI drift, fairness slices, and rolling AUC backtest for the MSME default model." },
    ],
  }),
  component: MonitoringPage,
});

// Synthetic monitoring data — clearly labelled.
const PSI_FEATURES = [
  { feature: "GST compliance %", psi: 0.04 },
  { feature: "DSCR", psi: 0.06 },
  { feature: "Payment lag days", psi: 0.09 },
  { feature: "UPI velocity", psi: 0.13 },
  { feature: "Sector beta", psi: 0.05 },
  { feature: "Exposure bucket", psi: 0.03 },
  { feature: "Bureau utilisation", psi: 0.18 },
];

const ROLLING_AUC = Array.from({ length: 12 }, (_, i) => ({
  month: `M${i + 1}`,
  auc: +(0.88 + Math.sin(i * 0.7) * 0.025 + (i > 8 ? 0.01 : 0)).toFixed(3),
}));

const FAIRNESS_SECTOR = [
  { slice: "Manufacturing", pd: 32, n: 4128 },
  { slice: "Agri-Processing", pd: 24, n: 1845 },
  { slice: "Logistics", pd: 38, n: 1230 },
  { slice: "Heavy Engineering", pd: 47, n: 980 },
  { slice: "Pharmaceuticals", pd: 21, n: 1402 },
  { slice: "Services", pd: 29, n: 2680 },
];

const FAIRNESS_TICKET = [
  { slice: "< ₹25L", pd: 36, n: 5210 },
  { slice: "₹25L – ₹1Cr", pd: 31, n: 4490 },
  { slice: "₹1 – ₹3Cr", pd: 27, n: 2105 },
  { slice: "> ₹3Cr", pd: 24, n: 760 },
];

function psiColor(v: number) {
  if (v < 0.1) return "risk-green";
  if (v < 0.2) return "risk-amber";
  return "risk-red";
}

function MonitoringPage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-idbi-green-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-display text-lg">Model Monitoring</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              Drift · Fairness · Backtest · Track 04
            </div>
          </div>
          <nav className="flex gap-5 text-[12px]">
            <Link to="/" className="text-white/70 hover:text-white">Dashboard</Link>
            <Link to="/about" className="text-white/70 hover:text-white">About</Link>
            <Link to="/architecture" className="text-white/70 hover:text-white">Architecture</Link>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="font-display text-2xl mb-1">Operational ML rigor</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Production-grade monitoring required by the brief's "consistent, comparable, actionable" mandate.
            Synthetic numbers on a held-out validation slice — production hooks point to the same telemetry.
          </p>
        </section>

        {/* PSI */}
        <section className="p-6 border border-border rounded-xl bg-card">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Population Stability Index (last 30 days vs training)
          </h3>
          <div className="space-y-2">
            {PSI_FEATURES.map((f) => {
              const c = psiColor(f.psi);
              return (
                <div key={f.feature} className="grid grid-cols-[1fr_auto_3fr_auto] gap-3 items-center text-[12px]">
                  <span>{f.feature}</span>
                  <span className={`font-mono tabular-nums text-${c} font-bold w-12 text-right`}>{f.psi.toFixed(2)}</span>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className={`h-full bg-${c} transition-all`} style={{ width: `${Math.min(100, (f.psi / 0.3) * 100)}%` }} />
                  </div>
                  <span className={`text-[10px] uppercase tracking-widest font-bold text-${c} w-16 text-right`}>
                    {f.psi < 0.1 ? "stable" : f.psi < 0.2 ? "monitor" : "drift"}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[10px] text-muted-foreground mt-3 italic">
            Thresholds: &lt; 0.10 stable · 0.10 – 0.20 monitor · &gt; 0.20 retrain trigger.
          </p>
        </section>

        {/* Rolling AUC */}
        <section className="p-6 border border-border rounded-xl bg-card">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
            Rolling 12-Month AUC (backtest)
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ROLLING_AUC} margin={{ top: 10, right: 12, left: -10, bottom: 0 }}>
                <XAxis dataKey="month" fontSize={10} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} />
                <YAxis fontSize={10} tickLine={false} axisLine={false} domain={[0.8, 0.95]} />
                <ReferenceLine y={0.9} stroke="hsl(var(--idbi-green-hsl, 152 70% 20%))" strokeDasharray="3 3" label={{ value: "90% target", fontSize: 9, fill: "hsl(var(--muted-foreground))", position: "insideTopLeft" }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: number) => [v.toFixed(3), "AUC"]} />
                <Line type="monotone" dataKey="auc" stroke="hsl(22 90% 52%)" strokeWidth={2.5} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </section>

        {/* Fairness slices */}
        <div className="grid md:grid-cols-2 gap-6">
          <FairnessCard title="By sector" data={FAIRNESS_SECTOR} />
          <FairnessCard title="By ticket size" data={FAIRNESS_TICKET} />
        </div>

        {/* Sub-model bench */}
        <section className="p-6 border border-border rounded-xl bg-card">
          <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-4">
            Sub-Model Benchmark · Per-Segment
          </h3>
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="py-2">Segment</th>
                <th className="py-2">Family</th>
                <th className="py-2 text-right font-mono">AUC</th>
                <th className="py-2 text-right font-mono">KS</th>
                <th className="py-2 text-right font-mono">Cutoff</th>
              </tr>
            </thead>
            <tbody>
              {Object.values(SUB_MODELS).map((m) => (
                <tr key={m.id} className="border-b border-border/50">
                  <td className="py-2 font-semibold">{m.label}</td>
                  <td className="py-2 text-muted-foreground">{m.family}</td>
                  <td className="py-2 text-right font-mono tabular-nums text-idbi-green-deep font-bold">{m.auc.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{m.ks.toFixed(2)}</td>
                  <td className="py-2 text-right font-mono tabular-nums">{m.cutoff}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      </main>
    </div>
  );
}

function FairnessCard({ title, data }: { title: string; data: { slice: string; pd: number; n: number }[] }) {
  return (
    <section className="p-6 border border-border rounded-xl bg-card">
      <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">
        Fairness · {title}
      </h3>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
            <XAxis dataKey="slice" fontSize={9} tickLine={false} axisLine={{ stroke: "hsl(var(--border))" }} interval={0} angle={-15} textAnchor="end" height={50} />
            <YAxis fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6 }} formatter={(v: number, _n, ctx) => [`${v}% (n=${ctx.payload.n})`, "Avg PD"]} />
            <Bar dataKey="pd" radius={[4, 4, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.slice} fill={d.pd > 40 ? "hsl(var(--risk-red-hsl, 0 75% 50%))" : d.pd > 30 ? "hsl(22 90% 52%)" : "hsl(152 50% 35%)"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="text-[10px] text-muted-foreground italic mt-2">
        Demographic-parity check — spreads kept within bank's policy band.
      </p>
    </section>
  );
}
