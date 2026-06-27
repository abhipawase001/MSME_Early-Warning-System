export interface Borrower {
  id: string;
  name: string;
  sector: string;
  exposureInr: number;
  termMonths: number;
  baseScore: number;
  gstCompliancePct: number;
  avgPaymentDelayDays: number;
  debtServiceRatio: number;
  cashFlow: { month: string; inflow: number; outflow: number }[];
  /** 12-month forward PD trajectory (%, 0-100) used for the portfolio heatmap. */
  pdTrajectory: number[];
}

export interface Alert {
  id: string;
  borrowerId: string;
  severity: "info" | "watch" | "elevated" | "high";
  signal: string;
  detail: string;
  timestamp: string; // ISO
}

export const MODEL_METRICS = {
  auc: 0.91,
  ks: 0.62,
  gini: 0.82,
  psi: 0.07,
  validationCutoff: 60,
  confusion: { tp: 412, fp: 38, tn: 1486, fn: 64 },
  trainedOn: "2026-05-12",
  note: "Validation set · synthetic + IDBI-public benchmark proxy",
};

// 12 monthly PDs computed from baseScore drifting upward with noise.
function trajectory(base: number, drift: number): number[] {
  const out: number[] = [];
  let v = base;
  for (let i = 0; i < 12; i++) {
    v = Math.max(2, Math.min(98, v + drift + (Math.sin(i * 1.3 + base) * 3)));
    out.push(Math.round(v * 10) / 10);
  }
  return out;
}

export const BORROWERS: Borrower[] = [
  {
    id: "MSME-9921",
    name: "Artisan Textiels Ltd",
    sector: "Manufacturing",
    exposureInr: 14_200_000,
    termMonths: 36,
    baseScore: 58,
    gstCompliancePct: 92,
    avgPaymentDelayDays: 14,
    debtServiceRatio: 1.32,
    cashFlow: [
      { month: "May", inflow: 4.2, outflow: 3.4 },
      { month: "Jun", inflow: 3.9, outflow: 3.6 },
      { month: "Jul", inflow: 4.6, outflow: 3.2 },
      { month: "Aug", inflow: 3.4, outflow: 3.7 },
      { month: "Sep", inflow: 3.8, outflow: 3.9 },
      { month: "Oct", inflow: 3.1, outflow: 3.8 },
    ],
    pdTrajectory: trajectory(50, 1.4),
  },
  {
    id: "MSME-8842",
    name: "GreenLeaf Agritech",
    sector: "Agri-Processing",
    exposureInr: 6_500_000,
    termMonths: 24,
    baseScore: 22,
    gstCompliancePct: 99,
    avgPaymentDelayDays: 4,
    debtServiceRatio: 1.84,
    cashFlow: [
      { month: "May", inflow: 2.1, outflow: 1.4 },
      { month: "Jun", inflow: 2.3, outflow: 1.5 },
      { month: "Jul", inflow: 2.6, outflow: 1.6 },
      { month: "Aug", inflow: 2.4, outflow: 1.4 },
      { month: "Sep", inflow: 2.7, outflow: 1.5 },
      { month: "Oct", inflow: 2.9, outflow: 1.6 },
    ],
    pdTrajectory: trajectory(18, 0.3),
  },
  {
    id: "MSME-1029",
    name: "Precision Dies India",
    sector: "Heavy Engineering",
    exposureInr: 22_800_000,
    termMonths: 48,
    baseScore: 76,
    gstCompliancePct: 78,
    avgPaymentDelayDays: 31,
    debtServiceRatio: 0.98,
    cashFlow: [
      { month: "May", inflow: 6.8, outflow: 6.5 },
      { month: "Jun", inflow: 6.2, outflow: 6.7 },
      { month: "Jul", inflow: 5.4, outflow: 6.9 },
      { month: "Aug", inflow: 5.8, outflow: 7.1 },
      { month: "Sep", inflow: 4.9, outflow: 6.8 },
      { month: "Oct", inflow: 5.1, outflow: 7.2 },
    ],
    pdTrajectory: trajectory(72, 1.8),
  },
  {
    id: "MSME-4471",
    name: "Coastal Cold Chain Co.",
    sector: "Logistics",
    exposureInr: 9_300_000,
    termMonths: 36,
    baseScore: 44,
    gstCompliancePct: 95,
    avgPaymentDelayDays: 9,
    debtServiceRatio: 1.41,
    cashFlow: [
      { month: "May", inflow: 3.1, outflow: 2.6 },
      { month: "Jun", inflow: 3.3, outflow: 2.8 },
      { month: "Jul", inflow: 3.0, outflow: 2.7 },
      { month: "Aug", inflow: 3.4, outflow: 2.9 },
      { month: "Sep", inflow: 3.2, outflow: 3.0 },
      { month: "Oct", inflow: 3.5, outflow: 3.1 },
    ],
    pdTrajectory: trajectory(38, 0.8),
  },
  {
    id: "MSME-3360",
    name: "Solace Pharma Generics",
    sector: "Pharmaceuticals",
    exposureInr: 17_500_000,
    termMonths: 60,
    baseScore: 36,
    gstCompliancePct: 97,
    avgPaymentDelayDays: 7,
    debtServiceRatio: 1.58,
    cashFlow: [
      { month: "May", inflow: 5.4, outflow: 4.1 },
      { month: "Jun", inflow: 5.6, outflow: 4.2 },
      { month: "Jul", inflow: 5.8, outflow: 4.3 },
      { month: "Aug", inflow: 5.5, outflow: 4.4 },
      { month: "Sep", inflow: 5.9, outflow: 4.5 },
      { month: "Oct", inflow: 6.1, outflow: 4.4 },
    ],
    pdTrajectory: trajectory(30, 0.5),
  },
];

const now = Date.now();
const m = (mins: number) => new Date(now - mins * 60_000).toISOString();

export const ALERTS: Alert[] = [
  {
    id: "a1",
    borrowerId: "MSME-1029",
    severity: "high",
    signal: "DSCR breach",
    detail: "Debt-service ratio fell below 1.0× for the 2nd consecutive month.",
    timestamp: m(12),
  },
  {
    id: "a2",
    borrowerId: "MSME-1029",
    severity: "elevated",
    signal: "UPI velocity drop",
    detail: "Inbound UPI volume down 32% week-over-week vs 90-day median.",
    timestamp: m(74),
  },
  {
    id: "a3",
    borrowerId: "MSME-9921",
    severity: "watch",
    signal: "GST filing lapsed",
    detail: "GSTR-3B for current month overdue by 14 days.",
    timestamp: m(180),
  },
  {
    id: "a4",
    borrowerId: "MSME-4471",
    severity: "watch",
    signal: "Buyer concentration",
    detail: "Top buyer accounts for 41% of receivables this quarter.",
    timestamp: m(420),
  },
  {
    id: "a5",
    borrowerId: "MSME-3360",
    severity: "info",
    signal: "EPFO contribution stable",
    detail: "Headcount + PF inflows steady — positive employment signal.",
    timestamp: m(1440),
  },
];
