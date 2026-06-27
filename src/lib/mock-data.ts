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
  },
];
