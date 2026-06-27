import { useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { BORROWERS } from "@/lib/mock-data";
import { computeFallbackScore, DEFAULT_SCENARIO, tierColor, tierLabel } from "@/lib/risk";
import { PortfolioList } from "./PortfolioList";
import { ScenarioPanel } from "./ScenarioPanel";
import { CashFlowChart } from "./CashFlowChart";
import { RiskFactors } from "./RiskFactors";
import { InterpretationFramework } from "./InterpretationFramework";
import { useAuth } from "@/hooks/use-auth";
import { LogOut, Info } from "lucide-react";

const formatInr = (n: number) =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);

const DATA_SOURCES = ["GST", "UPI", "Bank Stmt", "Bureau", "EPFO"] as const;

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
  // 12-month PD heuristic from composite score (display only)
  const pd12m = Math.min(99, Math.max(1, Math.round(baseline.score * 0.85))).toFixed(0);

  return (
    <div className="flex flex-col h-screen w-full bg-background text-foreground overflow-hidden">
      {/* IDBI brand band */}
      <div className="bg-idbi-green-deep text-white shrink-0">
        <div className="flex items-center justify-between px-6 py-2.5">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-idbi-orange grid place-items-center font-display text-base font-bold text-white">
              i
            </div>
            <div className="leading-tight">
              <div className="font-display text-base">IDBI Innovate 2026</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                MSME Default Early Warning System
              </div>
            </div>
            <span className="ml-3 px-2 py-0.5 rounded-sm bg-idbi-orange text-[10px] font-bold uppercase tracking-widest">
              Track 04
            </span>
          </div>
          <nav className="flex items-center gap-5 text-[12px]">
            <span className="text-white font-medium">Dashboard</span>
            <Link to="/about" className="text-white/70 hover:text-white transition-colors">
              About / Approach
            </Link>
            <a
              href="https://hack2skill.com/event/idbinnovate"
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white transition-colors"
            >
              Hackathon Brief ↗
            </a>
          </nav>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <PortfolioList
          borrowers={BORROWERS}
          selectedId={selectedId}
          onSelect={setSelectedId}
          query={query}
          onQueryChange={setQuery}
        />

        <main className="flex-1 overflow-y-auto bg-surface p-8 animate-in-soft [animation-delay:100ms]">
          <header className="flex justify-between items-end mb-6 gap-6">
            <div>
              <div className="flex items-center gap-3 mb-1 flex-wrap">
                <h1 className="font-display text-3xl tracking-tight text-foreground">{borrower.name}</h1>
                <span
                  className={`px-2 py-0.5 rounded-sm text-[10px] font-bold border bg-${tierC}/10 text-${tierC} border-${tierC}/30 uppercase tracking-widest`}
                >
                  {tierLabel(tier)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Exposure: <span className="font-mono">{formatInr(borrower.exposureInr)}</span> · Term:{" "}
                {borrower.termMonths} mo · Sector: {borrower.sector}
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <span className="text-[10px] uppercase tracking-widest text-muted-foreground mr-1">
                  Data fusion:
                </span>
                {DATA_SOURCES.map((s) => (
                  <span
                    key={s}
                    className="px-1.5 py-0.5 text-[10px] font-medium rounded-sm bg-idbi-green/10 text-idbi-green border border-idbi-green/20"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right">
                <div className={`font-mono text-5xl font-bold tracking-tighter text-${tierC} tabular-nums leading-none`}>
                  {baseline.score.toFixed(1)}
                </div>
                <div className="text-[10px] text-muted-foreground uppercase font-semibold tracking-widest mt-1">
                  Composite Risk Index
                </div>
                <div className="text-[10px] text-idbi-green font-semibold mt-0.5">
                  12-mo PD ≈ {pd12m}%
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

          {/* KPI strip — Track 04 framing */}
          <div className="grid grid-cols-4 gap-3 mb-6">
            <Kpi label="Target accuracy" value="90%" hint="Track 04 goal" />
            <Kpi label="Horizon" value="12 mo" hint="ahead-of-default" />
            <Kpi label="Inference" value="<500 ms" hint="AWS Lambda" />
            <Kpi label="Explainability" value="SHAP" hint="per-factor" />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <section className="col-span-2 p-5 border border-border rounded-xl bg-card">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">
                  6-Month Cash Flow Trend
                </h3>
                <span className="text-[10px] text-muted-foreground inline-flex items-center gap-1">
                  <Info className="size-3" /> Source: bank statement parser (mock)
                </span>
              </div>
              <CashFlowChart data={borrower.cashFlow} />
            </section>

            <section className="p-5 border border-border rounded-xl bg-card">
              <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-6">
                Primary Risk Drivers
              </h3>
              <RiskFactors factors={baseline.factors} />
              <p className="text-[10px] text-muted-foreground italic mt-6 leading-relaxed">
                Positive impacts increase default probability; negative impacts reduce it. Driver weights mirror SHAP
                contributions returned by the upstream model.
              </p>
            </section>

            <section className="p-5 border border-border rounded-xl bg-card">
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

            <section className="col-span-2">
              <InterpretationFramework score={baseline.score} tier={tier} />
            </section>
          </div>
        </main>

        <ScenarioPanel borrower={borrower} />
      </div>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="px-4 py-3 border border-border rounded-lg bg-card">
      <div className="text-[10px] uppercase tracking-widest text-muted-foreground">{label}</div>
      <div className="font-display text-2xl text-idbi-green-deep leading-tight mt-0.5">{value}</div>
      <div className="text-[10px] text-muted-foreground">{hint}</div>
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
