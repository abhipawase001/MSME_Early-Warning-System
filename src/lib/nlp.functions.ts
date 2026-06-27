import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { generateText, Output } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const inputSchema = z.object({
  borrowerName: z.string().min(1),
  sector: z.string().min(1),
  documentType: z.enum(["loan_note", "financial_statement", "bank_statement", "auditor_remark", "news_clip"]),
  text: z.string().min(20).max(20000),
});

const signalSchema = z.object({
  signals: z.array(
    z.object({
      label: z.string(),
      category: z.enum(["liquidity", "leverage", "compliance", "governance", "sector", "sentiment"]),
      polarity: z.enum(["positive", "neutral", "negative"]),
      impactPts: z.number().min(-25).max(25),
      evidence: z.string(),
    }),
  ).max(8),
  summary: z.string(),
  pdUpliftPts: z.number().min(-20).max(30),
  confidence: z.number().min(0).max(1),
});

export type NlpResult = z.infer<typeof signalSchema>;

export const extractDocumentSignals = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => inputSchema.parse(data))
  .handler(async ({ data }): Promise<NlpResult> => {
    const key = process.env.LOVABLE_API_KEY;
    if (!key) {
      // Local heuristic fallback — keeps demo working without key.
      return localFallback(data.text);
    }
    const gateway = createLovableAiGatewayProvider(key);
    const sys = `You are an MSME credit-risk NLP extractor for IDBI Bank. Read the document
and extract structured risk signals that should feed the PD model.

For each signal, give:
- label: short phrase (e.g. "Declining current ratio")
- category: liquidity | leverage | compliance | governance | sector | sentiment
- polarity: positive (lowers PD), negative (raises PD), or neutral
- impactPts: numeric PD impact in percentage points, range -25..25. Negative = lowers PD.
- evidence: exact short quote or paraphrase from the text (<= 160 chars)

Then output:
- summary: 1-2 sentence credit-analyst summary
- pdUpliftPts: net PD adjustment in pts (sum of impacts, capped -20..30)
- confidence: 0..1 based on how much explicit financial language is present

Be conservative. If text is thin, return fewer signals and lower confidence.`;

    try {
      const { output } = await generateText({
        model: gateway("google/gemini-3-flash-preview"),
        output: Output.object({ schema: signalSchema }),
        system: sys,
        prompt: `Borrower: ${data.borrowerName}\nSector: ${data.sector}\nDocument type: ${data.documentType}\n\n---\n${data.text}`,
      });
      return output;
    } catch (err) {
      console.warn("[nlp] gateway failed, using fallback:", err);
      return localFallback(data.text);
    }
  });

function localFallback(text: string): NlpResult {
  const t = text.toLowerCase();
  const signals: NlpResult["signals"] = [];
  const push = (s: NlpResult["signals"][number]) => signals.push(s);
  if (/(default|overdue|delinquen|bounced|npa)/.test(t))
    push({ label: "Past-due / bounce language", category: "compliance", polarity: "negative", impactPts: 8, evidence: "default / bounced cheque mention", });
  if (/(gst.*delay|missed gst|gst lapsed)/.test(t))
    push({ label: "GST filing slippage", category: "compliance", polarity: "negative", impactPts: 5, evidence: "GST delay mentioned" });
  if (/(declin|fall|drop|down\s*\d+%)/.test(t))
    push({ label: "Declining revenue/margin", category: "liquidity", polarity: "negative", impactPts: 6, evidence: "decline / drop language" });
  if (/(grow|up\s*\d+%|expansion|new order)/.test(t))
    push({ label: "Top-line growth", category: "sentiment", polarity: "positive", impactPts: -4, evidence: "growth / new order" });
  if (/(litigat|fraud|investigation|forensic)/.test(t))
    push({ label: "Governance / litigation flag", category: "governance", polarity: "negative", impactPts: 10, evidence: "litigation / fraud term" });
  const net = signals.reduce((s, x) => s + x.impactPts, 0);
  return {
    signals,
    summary: signals.length
      ? "Heuristic extraction (no LLM key) flagged the items above."
      : "No strong risk language detected in the document.",
    pdUpliftPts: Math.max(-20, Math.min(30, net)),
    confidence: signals.length ? 0.55 : 0.2,
  };
}
