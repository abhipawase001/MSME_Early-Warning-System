// Segment-aware model routing — answers "suitable analytical methods for different loan types".
import type { Borrower } from "./mock-data";

export type Segment = "working_capital" | "term_loan" | "equipment" | "micro";

export interface SubModel {
  id: Segment;
  label: string;
  family: string;
  features: string[];
  auc: number;
  ks: number;
  cutoff: number;
}

export const SUB_MODELS: Record<Segment, SubModel> = {
  working_capital: {
    id: "working_capital",
    label: "Working Capital",
    family: "XGBoost · gradient boosted trees",
    features: ["Cash-flow volatility", "Receivable ageing", "GST velocity", "Sector beta"],
    auc: 0.92,
    ks: 0.64,
    cutoff: 58,
  },
  term_loan: {
    id: "term_loan",
    label: "Term Loan",
    family: "LightGBM · monotone DSCR",
    features: ["DSCR trajectory", "Bureau utilisation", "EMI bounce rate", "Vintage"],
    auc: 0.90,
    ks: 0.60,
    cutoff: 62,
  },
  equipment: {
    id: "equipment",
    label: "Equipment Finance",
    family: "Cox proportional hazards (survival)",
    features: ["Asset depreciation", "Buyer concentration", "Utilisation gap", "Sector PMI"],
    auc: 0.89,
    ks: 0.58,
    cutoff: 60,
  },
  micro: {
    id: "micro",
    label: "MUDRA / Micro",
    family: "Logistic + alternate-data ensemble",
    features: ["UPI inflow regularity", "GST filing cadence", "Mobile-money churn", "EPFO signal"],
    auc: 0.87,
    ks: 0.55,
    cutoff: 55,
  },
};

export function segmentFor(b: Borrower): Segment {
  if (b.exposureInr < 7_500_000) return "micro";
  if (b.sector === "Heavy Engineering" || b.sector === "Logistics") return "equipment";
  if (b.termMonths >= 48) return "term_loan";
  return "working_capital";
}

export function modelFor(b: Borrower): SubModel {
  return SUB_MODELS[segmentFor(b)];
}

// 12-month PD term-structure (survival-style). Anchored to baseScore, shaped by segment.
export function pdTermStructure(b: Borrower): { month: number; pd: number }[] {
  const seg = segmentFor(b);
  const k = seg === "equipment" ? 1.25 : seg === "micro" ? 1.4 : seg === "term_loan" ? 0.95 : 1.1;
  const base = b.baseScore / 100;
  const out: { month: number; pd: number }[] = [];
  for (let m = 1; m <= 12; m++) {
    // Weibull-ish cumulative hazard, scaled to 0..100
    const t = m / 12;
    const cum = 1 - Math.exp(-Math.pow(t * (base + 0.25) * 1.8, k));
    out.push({ month: m, pd: +(cum * 100).toFixed(1) });
  }
  return out;
}
