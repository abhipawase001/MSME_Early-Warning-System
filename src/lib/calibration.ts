// Calibration / reliability curve mock data + recalibration helpers.
// In production these come from a held-out validation set.

export type CalibrationPoint = { binMid: number; raw: number; platt: number; isotonic: number; n: number };

// Mock: raw model is over-confident at high scores; Platt smooths, isotonic best.
export const CALIBRATION_BINS: CalibrationPoint[] = [
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

// Aggregate calibration metrics (synthetic but reasonable for an XGBoost+isotonic stack).
export const CAL_METRICS = {
  raw:      { ece: 0.082, brier: 0.142, logloss: 0.421 },
  platt:    { ece: 0.034, brier: 0.118, logloss: 0.366 },
  isotonic: { ece: 0.011, brier: 0.104, logloss: 0.339 },
};

// Apply a Platt (sigmoid) recalibration to a raw 0..100 score.
// Coefficients fit on synthetic holdout — a=0.072, b=-3.6 maps roughly to the bin table above.
export function plattRecalibrate(rawScore: number): number {
  const x = rawScore;
  const p = 1 / (1 + Math.exp(-(0.072 * x - 3.6)));
  return +(p * 100).toFixed(1);
}

// Apply an isotonic (piecewise-linear monotone) recalibration using the bin table.
export function isotonicRecalibrate(rawScore: number): number {
  const pts = CALIBRATION_BINS;
  if (rawScore <= pts[0].raw) return pts[0].isotonic;
  if (rawScore >= pts[pts.length - 1].raw) return pts[pts.length - 1].isotonic;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1];
    if (rawScore >= a.raw && rawScore <= b.raw) {
      const t = (rawScore - a.raw) / (b.raw - a.raw);
      return +(a.isotonic + t * (b.isotonic - a.isotonic)).toFixed(1);
    }
  }
  return rawScore;
}
