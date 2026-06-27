import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/architecture")({
  head: () => ({
    meta: [
      { title: "Architecture · IDBI Innovate Track 04" },
      { name: "description", content: "System architecture for the MSME default early-warning platform: data fusion, ensemble inference, interpretation framework." },
    ],
  }),
  component: ArchitecturePage,
});

function ArchitecturePage() {
  return (
    <div className="min-h-screen bg-surface">
      <div className="bg-idbi-green-deep text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <div className="font-display text-lg">System Architecture</div>
            <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">
              Data → Ensemble → Interpretation → Officer
            </div>
          </div>
          <nav className="flex gap-5 text-[12px]">
            <Link to="/" className="text-white/70 hover:text-white">Dashboard</Link>
            <Link to="/monitoring" className="text-white/70 hover:text-white">Monitoring</Link>
            <Link to="/about" className="text-white/70 hover:text-white">About</Link>
          </nav>
        </div>
      </div>

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-8">
        <section>
          <h2 className="font-display text-2xl mb-1">End-to-end pipeline</h2>
          <p className="text-sm text-muted-foreground max-w-3xl">
            Five layers, three failure-isolated boundaries, sub-500 ms inference, common interpretation framework across all MSME loan products.
          </p>
        </section>

        <section className="p-8 border border-border rounded-xl bg-card overflow-x-auto">
          <svg viewBox="0 0 980 460" className="w-full h-auto min-w-[860px]" xmlns="http://www.w3.org/2000/svg" aria-label="Architecture diagram">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                <path d="M0,0 L10,5 L0,10 z" fill="#94a3b8" />
              </marker>
            </defs>
            {/* Layer labels */}
            {["Sources", "Ingest", "Inference", "Interpretation", "Officer"].map((l, i) => (
              <text key={l} x={60 + i * 200} y={28} fontSize={11} fontWeight={700} fill="#475569" textAnchor="middle" letterSpacing={2}>
                {l.toUpperCase()}
              </text>
            ))}

            {/* Sources column */}
            {[
              ["GST returns", "Structured"],
              ["UPI velocity", "Alt-data"],
              ["Bank stmt PDF", "Unstructured"],
              ["Bureau pull", "Structured"],
              ["News / sentiment", "Unstructured"],
            ].map(([t, sub], i) => (
              <g key={t} transform={`translate(10, ${60 + i * 70})`}>
                <rect width={120} height={50} rx={6} fill="#ecfdf5" stroke="#10b981" />
                <text x={60} y={22} fontSize={11} fontWeight={600} textAnchor="middle" fill="#064e3b">{t}</text>
                <text x={60} y={38} fontSize={9} textAnchor="middle" fill="#047857">{sub}</text>
              </g>
            ))}

            {/* Ingest box */}
            <g transform="translate(210, 100)">
              <rect width={140} height={260} rx={8} fill="#fff7ed" stroke="#f97316" />
              <text x={70} y={26} fontSize={12} fontWeight={700} textAnchor="middle" fill="#7c2d12">Feature Store</text>
              <text x={70} y={50} fontSize={10} textAnchor="middle" fill="#9a3412">Normalize</text>
              <text x={70} y={70} fontSize={10} textAnchor="middle" fill="#9a3412">OCR + NER</text>
              <text x={70} y={90} fontSize={10} textAnchor="middle" fill="#9a3412">Sentiment</text>
              <text x={70} y={110} fontSize={10} textAnchor="middle" fill="#9a3412">PSI guard</text>
              <text x={70} y={140} fontSize={9} fontWeight={700} fill="#7c2d12" textAnchor="middle">Trigger Engine</text>
              <text x={70} y={158} fontSize={9} textAnchor="middle" fill="#9a3412">Hard rules</text>
              <text x={70} y={172} fontSize={9} textAnchor="middle" fill="#9a3412">(GST · DSCR · burn)</text>
              <text x={70} y={210} fontSize={9} fontWeight={700} fill="#7c2d12" textAnchor="middle">Segment Router</text>
              <text x={70} y={228} fontSize={9} textAnchor="middle" fill="#9a3412">WC · TL · Equip · Micro</text>
            </g>

            {/* Inference column - sub-models */}
            {[
              ["XGBoost", "Working Capital", "AUC 0.92"],
              ["LightGBM", "Term Loan", "AUC 0.90"],
              ["Cox PH", "Equipment", "AUC 0.89"],
              ["Logistic+", "Micro / MUDRA", "AUC 0.87"],
            ].map(([t, sub, m], i) => (
              <g key={t} transform={`translate(410, ${60 + i * 80})`}>
                <rect width={140} height={60} rx={6} fill="#eff6ff" stroke="#3b82f6" />
                <text x={70} y={22} fontSize={11} fontWeight={700} textAnchor="middle" fill="#1e3a8a">{t}</text>
                <text x={70} y={38} fontSize={9} textAnchor="middle" fill="#1e40af">{sub}</text>
                <text x={70} y={52} fontSize={9} fontWeight={600} textAnchor="middle" fill="#1e40af">{m}</text>
              </g>
            ))}
            <text x={480} y={395} fontSize={9} textAnchor="middle" fill="#64748b" fontStyle="italic">
              AWS Lambda · ap-south-1 · &lt;500 ms
            </text>

            {/* Interpretation box */}
            <g transform="translate(610, 100)">
              <rect width={160} height={260} rx={8} fill="#fefce8" stroke="#eab308" />
              <text x={80} y={26} fontSize={12} fontWeight={700} textAnchor="middle" fill="#713f12">Interpretation</text>
              <text x={80} y={48} fontSize={10} textAnchor="middle" fill="#854d0e">Common 0–100 score</text>
              <text x={80} y={68} fontSize={10} textAnchor="middle" fill="#854d0e">SHAP attribution</text>
              <text x={80} y={88} fontSize={10} textAnchor="middle" fill="#854d0e">Counterfactual</text>
              <text x={80} y={108} fontSize={10} textAnchor="middle" fill="#854d0e">PD term structure</text>
              <text x={80} y={140} fontSize={9} fontWeight={700} textAnchor="middle" fill="#713f12">Tier Mapping</text>
              <text x={80} y={158} fontSize={9} textAnchor="middle" fill="#854d0e">Standard · Watch</text>
              <text x={80} y={172} fontSize={9} textAnchor="middle" fill="#854d0e">Elevated · High</text>
              <text x={80} y={210} fontSize={9} fontWeight={700} textAnchor="middle" fill="#713f12">JSON contract</text>
              <text x={80} y={228} fontSize={9} textAnchor="middle" fill="#854d0e">consumable by CBS</text>
            </g>

            {/* Officer column */}
            {[
              ["Portfolio heatmap"],
              ["Scenario workbench"],
              ["Alerts feed"],
              ["Credit memo PDF"],
              ["Action webhook"],
            ].map(([t], i) => (
              <g key={t} transform={`translate(830, ${60 + i * 70})`}>
                <rect width={140} height={50} rx={6} fill="#f5f3ff" stroke="#8b5cf6" />
                <text x={70} y={30} fontSize={11} fontWeight={600} textAnchor="middle" fill="#4c1d95">{t}</text>
              </g>
            ))}

            {/* Arrows */}
            {[0, 1, 2, 3, 4].map((i) => (
              <line key={i} x1={132} y1={85 + i * 70} x2={208} y2={210} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#arr)" opacity={0.5} />
            ))}
            <line x1={352} y1={230} x2={408} y2={230} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arr)" />
            {[0, 1, 2, 3].map((i) => (
              <line key={i} x1={552} y1={90 + i * 80} x2={608} y2={230} stroke="#94a3b8" strokeWidth={1} markerEnd="url(#arr)" opacity={0.5} />
            ))}
            <line x1={772} y1={230} x2={828} y2={230} stroke="#94a3b8" strokeWidth={1.5} markerEnd="url(#arr)" />
          </svg>
        </section>

        <section className="grid md:grid-cols-3 gap-4">
          {[
            { h: "Data fusion", b: "Five concurrent sources — structured filings, alternate-data signals, and unstructured documents (statements, news)." },
            { h: "Ensemble routing", b: "Each borrower scored by the segment's best-fit model: XGBoost, LightGBM, Cox survival, or logistic + alt-data." },
            { h: "Common framework", b: "All sub-models project onto a single 0–100 scale with a documented JSON contract, so downstream systems behave identically." },
          ].map((c) => (
            <div key={c.h} className="p-4 border border-border rounded-lg bg-card">
              <div className="text-xs font-bold uppercase tracking-widest text-idbi-green-deep mb-1.5">{c.h}</div>
              <div className="text-[12px] text-foreground/80 leading-relaxed">{c.b}</div>
            </div>
          ))}
        </section>
      </main>
    </div>
  );
}
