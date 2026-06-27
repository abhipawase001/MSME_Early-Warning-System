import { useMemo, useState } from "react";
import { BORROWERS } from "@/lib/mock-data";
import { computeFallbackScore, DEFAULT_SCENARIO, tierColor, tierLabel } from "@/lib/risk";
import { PortfolioList } from "./PortfolioList";
import { ScenarioPanel } from "./ScenarioPanel";
import { CashFlowChart } from "./CashFlowChart";
import { RiskFactors } from "./RiskFactors";
import { useAuth } from "@/hooks/use-auth";
import { LogOut } from "lucide-react";

const formatInr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

export function Dashboard() {
  const [selectedId, setSelectedId] = useState(BORROWERS[0].id);
  const [query, setQuery] = useState("");
  const { user, signOut } = useAuth();

  const borrower = useMemo(
    () => BORROWERS.find((b) => b.id === selectedId) ?? BORROWERS[0],
    [selectedId],
  );

  const baseline = useMemo(
    () =>
      computeFallbackScore(
        {
          sector: borrower.sector,
          gstCompliancePct: borrower.gstCompliancePct,
          debtServiceRatio: borrower.debtServiceRatio,
          baseScore: borrower.baseScore,
        },
        DEFAULT_SCENARIO,
      ),
    [borrower],
  );

  const tier = baseline.tier;
  const tierC = tierColor(tier);

  return (
    <div className="flex h-screen w-full bg-background text-foreground overflow-hidden">
      <PortfolioList
        borrowers={BORROWERS}
        selectedId={selectedId}
        onSelect={setSelectedId}
        query={query}
        onQueryChange={setQuery}
      />

      <main className="flex-1 overflow-y-auto bg-surface p-8 animate-in-soft [animation-delay:100ms]">
        <header className="flex justify-between items-end mb-8 gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h1 className="text-2xl font-bold tracking-tight">{borrower.name}</h1>
              <span
                className={`px-2 py-0.5 rounded text-[10px] font-bold border bg-${tierC}/10 text-${tierC} border-${tierC}/20`}
              >
                {tierLabel(tier)}
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              Exposure: {formatInr(borrower.exposureInr)} • Term: {borrower.termMonths} Months • Sector:{" "}
              {borrower.sector}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right">
              <div className={`font-mono text-4xl font-bold tracking-tighter text-${tierC} tabular-nums`}>
                {baseline.score.toFixed(1)}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest">
                Composite Risk Index
              </div>
            </div>
            {user && (
              <div className="flex items-center gap-2 pl-6 border-l border-border">
                <div className="text-right">
                  <div className="text-xs font-medium">{user.displayName ?? user.email}</div>
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{user.role}</div>
                </div>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="size-8 grid place-items-center rounded hover:bg-muted transition-colors"
                  aria-label="Sign out"
                >
                  <LogOut className="size-4" />
                </button>
              </div>
            )}
          </div>
        </header>

        <div className="grid grid-cols-2 gap-6">
          <section className="col-span-2 p-5 border border-border rounded-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                6-Month Cash Flow Trend
              </h3>
            </div>
            <CashFlowChart data={borrower.cashFlow} />
          </section>

          <section className="p-5 border border-border rounded-xl">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              Primary Risk Drivers
            </h3>
            <RiskFactors factors={baseline.factors} />
            <p className="text-[10px] text-muted-foreground italic mt-6 leading-relaxed">
              Positive impacts increase default probability; negative impacts reduce it. Driver weights mirror SHAP
              contributions returned by the upstream model.
            </p>
          </section>

          <section className="p-5 border border-border rounded-xl bg-background/30">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
              GST Compliance Score
            </h3>
            <div className="flex items-center gap-6">
              <div
                className={`size-24 rounded-full border-8 grid place-items-center ${
                  borrower.gstCompliancePct >= 90
                    ? "border-risk-green"
                    : borrower.gstCompliancePct >= 75
                    ? "border-risk-amber"
                    : "border-risk-red"
                }`}
              >
                <span className="font-mono text-xl font-bold tabular-nums">{borrower.gstCompliancePct}%</span>
              </div>
              <div className="space-y-2">
                <Row label="Avg Payment Delay" value={`${borrower.avgPaymentDelayDays} days`} />
                <Row label="Debt Service Ratio" value={borrower.debtServiceRatio.toFixed(2) + "x"} />
                <Row label="Term Remaining" value={`${borrower.termMonths} mo`} />
              </div>
            </div>
          </section>
        </div>
      </main>

      <ScenarioPanel borrower={borrower} />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 text-[11px]">
      <span className="text-muted-foreground w-32">{label}</span>
      <span className="font-mono font-medium tabular-nums">{value}</span>
    </div>
  );
}
