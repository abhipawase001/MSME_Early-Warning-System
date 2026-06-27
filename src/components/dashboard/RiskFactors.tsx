import type { RiskFactor } from "@/lib/risk";
import { WaterfallExplain } from "./WaterfallExplain";

interface Props {
  factors: RiskFactor[];
  baseRate?: number;
  finalScore?: number;
}

export function RiskFactors({ factors, baseRate = 30, finalScore }: Props) {
  const final = finalScore ?? baseRate + factors.reduce((s, f) => s + f.impact, 0);
  return <WaterfallExplain baseRate={baseRate} factors={factors} finalScore={final} />;
}
