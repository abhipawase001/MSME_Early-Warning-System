import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { Printer, ArrowLeft } from "lucide-react";
import { BORROWERS, MODEL_METRICS } from "@/lib/mock-data";
import { computeFallbackScore, DEFAULT_SCENARIO, tierLabel } from "@/lib/risk";

export const Route = createFileRoute("/memo/$borrowerId")({
  head: ({ params }) => ({
    meta: [{ title: `Credit Memo · ${params.borrowerId} · IDBI Innovate Track 04` }],
  }),
  notFoundComponent: () => (
    <div className="p-10 text-center">
      <p className="text-sm text-muted-foreground">Borrower not found.</p>
      <Link to="/" className="text-idbi-green underline text-sm">Back to dashboard</Link>
    </div>
  ),
  errorComponent: ({ error }) => (
    <div className="p-10 text-center text-sm text-risk-red">{error.message}</div>
  ),
  loader: ({ params }) => {
    const borrower = BORROWERS.find((b) => b.id === params.borrowerId);
    if (!borrower) throw notFound();
    return { borrower };
  },
  component: MemoPage,
});

function MemoPage() {
  const { borrower } = Route.useLoaderData();
  const result = computeFallbackScore(
    {
      sector: borrower.sector,
      gstCompliancePct: borrower.gstCompliancePct,
      debtServiceRatio: borrower.debtServiceRatio,
      baseScore: borrower.baseScore,
    },
    DEFAULT_SCENARIO,
  );
  const pd12m = Math.min(99, Math.max(1, Math.round(result.score * 0.85)));
  const fmt = new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 });

  const recommendation =
    result.tier === "high"
      ? "Escalate to credit committee; freeze further disbursal; field visit within 7 days."
      : result.tier === "elevated"
      ? "Monthly review; request fresh bank statements + GST returns; re-price covenant."
      : result.tier === "moderate"
      ? "Quarterly review; auto-alert on GST or DSCR breach."
      : "Standard annual review; eligible for top-up.";

  return (
    <div className="min-h-screen bg-background py-10 print:py-0">
      <div className="max-w-3xl mx-auto bg-card border border-border print:border-0 print:shadow-none shadow-sm rounded-xl print:rounded-none p-10 print:p-8">
        {/* Print/back actions — hidden in print */}
        <div className="flex items-center justify-between mb-8 print:hidden">
          <Link to="/" className="text-[12px] text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
            <ArrowLeft className="size-3.5" /> Dashboard
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="px-4 py-2 bg-idbi-orange text-white text-[11px] font-bold uppercase tracking-widest rounded inline-flex items-center gap-2 hover:brightness-95"
          >
            <Printer className="size-3.5" /> Print / Save PDF
          </button>
        </div>

        {/* Header */}
        <div className="border-b border-border pb-5 mb-6 flex items-start justify-between">
          <div>
            <div className="text-[10px] uppercase tracking-widest text-idbi-orange font-bold mb-1">
              IDBI Innovate 2026 · Track 04
            </div>
            <h1 className="font-display text-3xl text-idbi-green-deep">Credit Risk Memo</h1>
            <p className="text-[11px] text-muted-foreground mt-1 font-mono">
              Generated {new Date().toLocaleString("en-IN")} · System-generated · For credit committee use
            </p>
          </div>
          <div className="text-right">
            <div className={`font-mono text-4xl font-bold ${
              result.tier === "high" ? "text-risk-red" :
              result.tier === "elevated" ? "text-idbi-orange" :
              result.tier === "moderate" ? "text-risk-amber" : "text-risk-green"
            }`}>{result.score.toFixed(1)}</div>
            <div className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">
              {tierLabel(result.tier)}
            </div>
            <div className="text-[10px] text-idbi-green font-semibold mt-0.5">12-mo PD ≈ {pd12m}%</div>
          </div>
        </div>

        {/* Borrower snapshot */}
        <Section title="Borrower Snapshot">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[12px]">
            <Field k="Name" v={borrower.name} />
            <Field k="Borrower ID" v={borrower.id} />
            <Field k="Sector" v={borrower.sector} />
            <Field k="Exposure" v={fmt.format(borrower.exposureInr)} />
            <Field k="Tenor" v={`${borrower.termMonths} months`} />
            <Field k="DSCR" v={`${borrower.debtServiceRatio.toFixed(2)}×`} />
            <Field k="GST compliance" v={`${borrower.gstCompliancePct}%`} />
            <Field k="Avg payment delay" v={`${borrower.avgPaymentDelayDays} days`} />
          </div>
        </Section>

        {/* Drivers */}
        <Section title="Top Risk Drivers (SHAP)">
          <table className="w-full text-[12px]">
            <thead>
              <tr className="text-[10px] uppercase tracking-widest text-muted-foreground border-b border-border">
                <th className="text-left font-semibold py-1.5">Driver</th>
                <th className="text-right font-semibold py-1.5">Impact</th>
                <th className="text-right font-semibold py-1.5">Direction</th>
              </tr>
            </thead>
            <tbody>
              {result.factors.slice(0, 5).map((f) => (
                <tr key={f.name} className="border-b border-border/50">
                  <td className="py-1.5">{f.name}</td>
                  <td className="py-1.5 text-right font-mono tabular-nums">
                    {f.impact > 0 ? "+" : ""}{f.impact.toFixed(1)}
                  </td>
                  <td className="py-1.5 text-right text-[11px] uppercase">
                    {f.impact > 0 ? (
                      <span className="text-risk-red font-semibold">↑ Risk</span>
                    ) : (
                      <span className="text-risk-green font-semibold">↓ Risk</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Section>

        {/* Recommendation */}
        <Section title="Recommended Action">
          <p className="text-[12px] leading-relaxed bg-idbi-green/5 border border-idbi-green/20 p-4 rounded">
            {recommendation}
          </p>
        </Section>

        {/* Model footer */}
        <Section title="Model Provenance">
          <div className="text-[11px] text-muted-foreground leading-relaxed">
            Scored by IDBI Innovate MSME EWS · AUC {MODEL_METRICS.auc.toFixed(2)} · KS{" "}
            {MODEL_METRICS.ks.toFixed(2)} · PSI {MODEL_METRICS.psi.toFixed(2)}. Inference served via AWS Lambda
            (ap-south-1). {MODEL_METRICS.note}.
          </div>
        </Section>

        <p className="text-[9px] text-muted-foreground text-center mt-8 italic">
          Independent hackathon submission — not an official IDBI Bank Ltd. document.
        </p>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-6">
      <h2 className="text-[10px] uppercase tracking-widest text-idbi-green-deep font-bold mb-3 border-b border-idbi-green/20 pb-1">
        {title}
      </h2>
      {children}
    </div>
  );
}

function Field({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between gap-3">
      <span className="text-muted-foreground">{k}</span>
      <span className="font-medium text-right">{v}</span>
    </div>
  );
}
