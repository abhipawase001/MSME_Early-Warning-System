// Regulator-style trigger engine — hard rules that fire alongside the ML score.
import type { Borrower } from "./mock-data";

export type TriggerSeverity = "watch" | "elevated" | "high";

export interface Trigger {
  code: string;
  label: string;
  severity: TriggerSeverity;
  rationale: string;
}

const RULES: ((b: Borrower) => Trigger | null)[] = [
  (b) =>
    b.gstCompliancePct < 80
      ? {
          code: "GST-LOW",
          label: "GST compliance < 80%",
          severity: "watch",
          rationale: `Compliance at ${b.gstCompliancePct}% — sustained filing irregularity.`,
        }
      : null,
  (b) =>
    b.debtServiceRatio < 1.1
      ? {
          code: "DSCR-BREACH",
          label: "DSCR below covenant",
          severity: "elevated",
          rationale: `DSCR ${b.debtServiceRatio.toFixed(2)}× under 1.10× covenant floor.`,
        }
      : null,
  (b) =>
    b.avgPaymentDelayDays > 25
      ? {
          code: "LAG-HIGH",
          label: "Avg payment lag > 25d",
          severity: "elevated",
          rationale: `Receivable lag ${b.avgPaymentDelayDays}d vs 15d sector median.`,
        }
      : null,
  (b) => {
    // Outflow > inflow in 3 of last 6 months → cash burn
    const burn = b.cashFlow.filter((c) => c.outflow > c.inflow).length;
    return burn >= 3
      ? {
          code: "BURN-3OF6",
          label: "Cash burn 3/6 months",
          severity: "high",
          rationale: `Outflows exceeded inflows in ${burn} of last 6 months.`,
        }
      : null;
  },
  (b) => {
    // Exposure heavy + elevated baseScore → committee escalation
    return b.exposureInr > 20_000_000 && b.baseScore > 65
      ? {
          code: "EXPOSURE-LARGE",
          label: "Large exposure · elevated PD",
          severity: "high",
          rationale: `Exposure ₹${(b.exposureInr / 1e7).toFixed(2)}Cr with base score ${b.baseScore}.`,
        }
      : null;
  },
];

export function evaluateTriggers(b: Borrower): Trigger[] {
  return RULES.map((r) => r(b)).filter((t): t is Trigger => t !== null);
}

export const TRIGGER_COLOR: Record<TriggerSeverity, string> = {
  watch: "risk-amber",
  elevated: "idbi-orange",
  high: "risk-red",
};
