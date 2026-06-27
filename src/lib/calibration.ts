// Calibration / reliability curve mock data + recalibration helpers.
// In production these come from a held-out validation set, sliced per cohort.

export type CalibrationPoint = { binMid: number; raw: number; platt: number; isotonic: number; n: number };
export type CalMetrics = { ece: number; brier: number; logloss: number };
export type CalibrationSlice = {
  bins: CalibrationPoint[];
  metrics: { raw: CalMetrics; platt: CalMetrics; isotonic: CalMetrics };
};

// Cohort dimensions officers can slice by.
export type CohortDim = "all" | "sector" | "ticket" | "borrowerType";
export type CohortKey = string; // e.g. "all", "Manufacturing", "<25L", "Working Capital"

export const COHORTS: Record<CohortDim, { key: CohortKey; label: string }[]> = {
  all: [{ key: "all", label: "All borrowers" }],
  sector: [
    { key: "Manufacturing", label: "Manufacturing" },
    { key: "Agri-Processing", label: "Agri-Processing" },
    { key: "Logistics", label: "Logistics" },
    { key: "Heavy Engineering", label: "Heavy Engineering" },
    { key: "Pharmaceuticals", label: "Pharmaceuticals" },
    { key: "Services", label: "Services" },
  ],
  ticket: [
    { key: "<25L", label: "< ₹25L" },
    { key: "25L-1Cr", label: "₹25L – ₹1Cr" },
    { key: "1-3Cr", label: "₹1 – ₹3Cr" },
    { key: ">3Cr", label: "> ₹3Cr" },
  ],
  borrowerType: [
    { key: "Working Capital", label: "Working Capital" },
    { key: "Term Loan", label: "Term Loan" },
    { key: "Equipment", label: "Equipment Finance" },
    { key: "MUDRA / Micro", label: "MUDRA / Micro" },
  ],
};

// Base bins — best-calibrated cohort.
const BASE_BINS: CalibrationPoint[] = [
  { binMid: 5,  raw: 2,  platt: 4,  isotonic: 5,  n: 812 },
  { binMid: 15, raw: 8,  platt: 12, isotonic: 14, n: 654 },
  { binMid: 25, raw: 17, platt: 22, isotonic: 25, n: 540 },
  { binMid: 35, raw: 28, platt: 33, isotonic: 35, n: 489 },
  { binMid: 45, raw: 40, platt: 44, isotonic: 46, n: 401 },
  { binMid: 55, raw: 51, platt: 54, isotonic: 55, n: 372 },
  { binMid: 65, raw: 60, platt: 64, isotonic: 65, n: 318 },
  { binMid: 75, raw: 68, platt: 73, isotonic: 75, n: 264 },
  { binMid: 85, raw: 76, platt: 83, isotonic: 86, n: 197 },
  { binMid: 95, raw: 84, platt: 92, isotonic: 95, n: 121 },
];

// Per-cohort bias and sample-size profile. bias > 0 = model under-estimates risk in this cohort.
// sample multiplier scales `n` so officers can see thin-data cohorts.
const COHORT_PROFILE: Record<CohortKey, { rawBias: number; isoBias: number; plattBias: number; nMul: number; eceMul: number }> = {
  all:                { rawBias: 0,   plattBias: 0,   isoBias: 0,   nMul: 1.0, eceMul: 1.0 },
  // sectors
  Manufacturing:      { rawBias: -3,  plattBias: -1,  isoBias: 0,   nMul: 0.85, eceMul: 0.95 },
  "Agri-Processing":  { rawBias: 6,   plattBias: 3,   isoBias: 1,   nMul: 0.40, eceMul: 1.7 },
  Logistics:          { rawBias: 4,   plattBias: 2,   isoBias: 1,   nMul: 0.30, eceMul: 1.5 },
  "Heavy Engineering":{ rawBias: 9,   plattBias: 4,   isoBias: 2,   nMul: 0.22, eceMul: 2.1 },
  Pharmaceuticals:    { rawBias: -5,  plattBias: -2,  isoBias: -1,  nMul: 0.32, eceMul: 0.8 },
  Services:           { rawBias: 2,   plattBias: 1,   isoBias: 0,   nMul: 0.62, eceMul: 1.1 },
  // ticket size
  "<25L":             { rawBias: 8,   plattBias: 4,   isoBias: 2,   nMul: 1.10, eceMul: 1.8 },
  "25L-1Cr":          { rawBias: 3,   plattBias: 1,   isoBias: 0,   nMul: 0.95, eceMul: 1.1 },
  "1-3Cr":            { rawBias: -2,  plattBias: -1,  isoBias: 0,   nMul: 0.50, eceMul: 0.9 },
  ">3Cr":             { rawBias: -6,  plattBias: -2,  isoBias: -1,  nMul: 0.18, eceMul: 1.4 },
  // borrower / loan type
  "Working Capital":  { rawBias: 1,   plattBias: 0,   isoBias: 0,   nMul: 0.95, eceMul: 0.95 },
  "Term Loan":        { rawBias: -2,  plattBias: -1,  isoBias: 0,   nMul: 0.80, eceMul: 1.0 },
  Equipment:          { rawBias: 5,   plattBias: 2,   isoBias: 1,   nMul: 0.35, eceMul: 1.3 },
  "MUDRA / Micro":    { rawBias: 7,   plattBias: 3,   isoBias: 2,   nMul: 0.55, eceMul: 1.6 },
};

const clamp = (v: number, lo = 0, hi = 100) => Math.max(lo, Math.min(hi, +v.toFixed(1)));

export function getCalibrationSlice(cohort: CohortKey): CalibrationSlice {
  const p = COHORT_PROFILE[cohort] ?? COHORT_PROFILE.all;
  const bins: CalibrationPoint[] = BASE_BINS.map((b) => {
    // Apply a triangular weighting so bias peaks in the mid band (where most defaults live).
    const w = 1 - Math.abs(b.binMid - 50) / 50;
    return {
      binMid: b.binMid,
      raw: clamp(b.raw + p.rawBias * w),
      platt: clamp(b.platt + p.plattBias * w),
      isotonic: clamp(b.isotonic + p.isoBias * w),
      n: Math.max(8, Math.round(b.n * p.nMul)),
    };
  });

  const base = { raw: 0.082, platt: 0.034, isotonic: 0.011 };
  return {
    bins,
    metrics: {
      raw:      { ece: +(base.raw * p.eceMul).toFixed(3),      brier: +(0.142 * (0.5 + 0.5 * p.eceMul)).toFixed(3), logloss: +(0.421 * (0.6 + 0.4 * p.eceMul)).toFixed(3) },
      platt:    { ece: +(base.platt * p.eceMul).toFixed(3),    brier: +(0.118 * (0.5 + 0.5 * p.eceMul)).toFixed(3), logloss: +(0.366 * (0.6 + 0.4 * p.eceMul)).toFixed(3) },
      isotonic: { ece: +(base.isotonic * p.eceMul).toFixed(3), brier: +(0.104 * (0.5 + 0.5 * p.eceMul)).toFixed(3), logloss: +(0.339 * (0.6 + 0.4 * p.eceMul)).toFixed(3) },
    },
  };
}

// Backwards-compatible exports (used elsewhere).
export const CALIBRATION_BINS = BASE_BINS;
export const CAL_METRICS = getCalibrationSlice("all").metrics;

// Platt sigmoid recalibration — coefficients lightly tuned per cohort bias.
export function plattRecalibrate(rawScore: number, cohort: CohortKey = "all"): number {
  const p = COHORT_PROFILE[cohort] ?? COHORT_PROFILE.all;
  const x = rawScore;
  const shift = -3.6 + p.plattBias * 0.05;
  const out = 1 / (1 + Math.exp(-(0.072 * x + shift)));
  return clamp(out * 100);
}

// Piecewise-linear monotone (isotonic) recalibration from the cohort's bin table.
export function isotonicRecalibrate(rawScore: number, cohort: CohortKey = "all"): number {
  const { bins } = getCalibrationSlice(cohort);
  if (rawScore <= bins[0].raw) return bins[0].isotonic;
  if (rawScore >= bins[bins.length - 1].raw) return bins[bins.length - 1].isotonic;
  for (let i = 0; i < bins.length - 1; i++) {
    const a = bins[i], b = bins[i + 1];
    if (rawScore >= a.raw && rawScore <= b.raw) {
      const t = (rawScore - a.raw) / (b.raw - a.raw);
      return clamp(a.isotonic + t * (b.isotonic - a.isotonic));
    }
  }
  return rawScore;
}

// Sample size for the active cohort (sum of bins).
export function cohortSampleSize(cohort: CohortKey): number {
  return getCalibrationSlice(cohort).bins.reduce((s, b) => s + b.n, 0);
}
