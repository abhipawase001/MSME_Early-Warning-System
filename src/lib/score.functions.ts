import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { computeFallbackScore, type ScoreResult } from "./risk";
import { BORROWERS } from "./mock-data";

const scenarioSchema = z.object({
  borrowerId: z.string(),
  revenueDeltaPct: z.number().min(-50).max(50),
  paymentLagDays: z.number().min(0).max(120),
  gstFilingDelayDays: z.number().min(0).max(90),
});

export const scoreScenario = createServerFn({ method: "POST" })
  .validator(scenarioSchema)
  .handler(async ({ data }): Promise<ScoreResult> => {
    const borrower = BORROWERS.find((b) => b.id === data.borrowerId);
    if (!borrower) throw new Error("Borrower not found");

    const baseline = {
      sector: borrower.sector,
      gstCompliancePct: borrower.gstCompliancePct,
      debtServiceRatio: borrower.debtServiceRatio,
      baseScore: borrower.baseScore,
    };
    const fallback = computeFallbackScore(baseline, {
      revenueDeltaPct: data.revenueDeltaPct,
      paymentLagDays: data.paymentLagDays,
      gstFilingDelayDays: data.gstFilingDelayDays,
    });

    const url = process.env.ML_API_URL;
    const key = process.env.ML_API_KEY;
    if (!url) return fallback;

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(key ? { Authorization: `Bearer ${key}` } : {}),
        },
        body: JSON.stringify({
          borrower_id: borrower.id,
          sector: borrower.sector,
          base_score: borrower.baseScore,
          gst_compliance_pct: borrower.gstCompliancePct,
          debt_service_ratio: borrower.debtServiceRatio,
          scenario: {
            revenue_delta_pct: data.revenueDeltaPct,
            payment_lag_days: data.paymentLagDays,
            gst_filing_delay_days: data.gstFilingDelayDays,
          },
        }),
        signal: AbortSignal.timeout(8000),
      });
      if (!res.ok) throw new Error(`ML ${res.status}`);
      const payload = (await res.json()) as {
        score?: number;
        tier?: ScoreResult["tier"];
        factors?: ScoreResult["factors"];
        status?: string;
      };
      if (typeof payload.score !== "number") return fallback;
      // Lambda returns 0..1 — scale to 0..100. If already >1 assume it's 0..100.
      const scaled = payload.score <= 1 ? payload.score * 100 : payload.score;
      const score = Math.max(0, Math.min(100, Math.round(scaled * 10) / 10));
      const statusTier: Record<string, ScoreResult["tier"]> = {
        Normal: "low",
        Watch: "moderate",
        Elevated: "elevated",
        High: "high",
        Critical: "high",
      };
      const tier: ScoreResult["tier"] =
        payload.tier ??
        (payload.status ? statusTier[payload.status] : undefined) ??
        (score < 35 ? "low" : score < 60 ? "moderate" : score < 80 ? "elevated" : "high");

      return {
        score,
        tier,
        factors: payload.factors ?? fallback.factors,
        source: "ml",
      };

    } catch (err) {
      console.warn("[score] ML endpoint failed, using fallback:", err);
      return fallback;
    }
  });
