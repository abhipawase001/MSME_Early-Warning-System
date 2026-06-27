import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { extractDocumentSignals, type NlpResult } from "@/lib/nlp.functions";
import type { Borrower } from "@/lib/mock-data";
import { FileSearch, Loader2, Sparkles } from "lucide-react";

const SAMPLES: Record<string, string> = {
  loan_note: `RM site visit 15-Jun-2026: Borrower's working capital cycle stretched from 62 to 91 days due to delayed receivables from two top buyers (auto OEM). Promoter confirms a litigation notice received from supplier over disputed Rs 1.2 Cr invoice. GST 3B filing for May was filed 11 days late. Inventory build-up observed at plant; management plans to liquidate slow-moving SKUs by Q2. EMI for the term loan paid on time but one cheque bounced earlier in April. Promoter committed to infuse Rs 50 lakh equity by quarter-end.`,
  financial_statement: `FY26 unaudited: Revenue down 14% YoY to Rs 38.2 Cr against guidance of flat growth. EBITDA margin compressed from 11.4% to 7.8% driven by raw material inflation. Current ratio fell from 1.42 to 1.08. Debtor days expanded to 96. Long-term debt up Rs 4 Cr to fund capex. Interest coverage at 1.6x vs 2.4x prior year. Auditor noted going-concern emphasis-of-matter on one foreign subsidiary.`,
  bank_statement: `Apr-Jun bank statement summary: avg monthly inflow Rs 2.8 Cr (down from Rs 3.4 Cr). Three cheque returns observed in May. UPI inflow remained stable. Two new outflows tagged as "supplier dispute settlement". Closing balance trending downward, hit minimum Rs 4 lakh on 12-Jun.`,
  auditor_remark: `Auditor flagged related-party transactions worth Rs 2.6 Cr not disclosed in prior year. Internal controls over inventory valuation deemed inadequate. No fraud observed but management response classified as "limited cooperation".`,
  news_clip: `Local trade press reports the borrower's largest buyer is restructuring its supply chain and may shift sourcing offshore over the next 9 months. Industry association notes input cost pressure across the sector.`,
};

export function DocumentNLP({ borrower, onUplift }: { borrower: Borrower; onUplift?: (pts: number) => void }) {
  const extract = useServerFn(extractDocumentSignals);
  const [docType, setDocType] = useState<keyof typeof SAMPLES>("loan_note");
  const [text, setText] = useState(SAMPLES.loan_note);
  const [result, setResult] = useState<NlpResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const run = async () => {
    setLoading(true);
    setErr(null);
    try {
      const r = await extract({
        data: {
          borrowerName: borrower.name,
          sector: borrower.sector,
          documentType: docType,
          text,
        },
      });
      setResult(r);
      onUplift?.(r.pdUpliftPts);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Extraction failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="flex items-center gap-2 mb-1">
        <FileSearch className="size-3.5 text-idbi-green-deep" />
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
          Document Intelligence · NLP → PD lift
        </h3>
        <span className="ml-auto text-[10px] font-mono px-1.5 py-0.5 rounded bg-idbi-orange/10 text-idbi-orange font-bold uppercase tracking-wider">
          Unstructured
        </span>
      </div>
      <p className="text-[10px] text-muted-foreground mb-3 leading-relaxed">
        Extracts risk signals from loan notes, financials and auditor remarks via Lovable AI,
        then feeds them into the PD score (delta shown below). Powers the &quot;structured + unstructured&quot; brief clause.
      </p>

      <div className="flex gap-2 mb-2">
        <select
          value={docType}
          onChange={(e) => {
            const v = e.target.value as keyof typeof SAMPLES;
            setDocType(v);
            setText(SAMPLES[v]);
            setResult(null);
          }}
          className="text-[11px] border border-border rounded px-2 py-1.5 bg-background"
        >
          <option value="loan_note">RM loan note</option>
          <option value="financial_statement">Financial statement</option>
          <option value="bank_statement">Bank statement summary</option>
          <option value="auditor_remark">Auditor remark</option>
          <option value="news_clip">News / market clip</option>
        </select>
        <button
          onClick={run}
          disabled={loading || text.length < 20}
          className="ml-auto px-3 py-1.5 rounded bg-idbi-green-deep text-white text-[10px] font-bold uppercase tracking-widest hover:brightness-110 disabled:opacity-50 inline-flex items-center gap-1.5"
        >
          {loading ? <Loader2 className="size-3 animate-spin" /> : <Sparkles className="size-3" />}
          {loading ? "Extracting…" : "Extract signals"}
        </button>
      </div>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        className="w-full text-[11px] font-mono p-2.5 border border-border rounded bg-background resize-y leading-relaxed"
        placeholder="Paste loan note, financial statement excerpt, auditor remark…"
      />

      {err && <div className="mt-2 text-[11px] text-risk-red">{err}</div>}

      {result && (
        <div className="mt-4 space-y-3">
          <div className="flex items-center gap-3 p-3 rounded-md bg-muted/40 border border-border">
            <div className="text-center min-w-[80px]">
              <div className={`font-mono text-2xl font-bold tabular-nums ${result.pdUpliftPts > 0 ? "text-risk-red" : result.pdUpliftPts < 0 ? "text-risk-green" : ""}`}>
                {result.pdUpliftPts > 0 ? "+" : ""}{result.pdUpliftPts.toFixed(1)}
              </div>
              <div className="text-[9px] uppercase tracking-widest text-muted-foreground">PD lift (pts)</div>
            </div>
            <div className="flex-1 text-[11px] text-foreground/85 leading-relaxed">
              {result.summary}
              <div className="text-[10px] text-muted-foreground mt-1">
                Confidence: {(result.confidence * 100).toFixed(0)}% · {result.signals.length} signals
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            {result.signals.map((s, i) => (
              <div key={i} className="flex items-start gap-2 text-[11px] p-2 border border-border rounded">
                <span className={`mt-0.5 px-1.5 py-0.5 rounded-sm text-[9px] font-bold uppercase tracking-wider shrink-0 ${
                  s.polarity === "negative" ? "bg-risk-red/10 text-risk-red" :
                  s.polarity === "positive" ? "bg-risk-green/10 text-risk-green" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {s.polarity === "negative" ? "+" : s.polarity === "positive" ? "−" : "·"}{Math.abs(s.impactPts).toFixed(1)}
                </span>
                <div className="flex-1">
                  <div className="font-semibold">
                    {s.label} <span className="text-[9px] uppercase tracking-widest text-muted-foreground ml-1">{s.category}</span>
                  </div>
                  <div className="text-[10px] text-muted-foreground italic mt-0.5">&ldquo;{s.evidence}&rdquo;</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
