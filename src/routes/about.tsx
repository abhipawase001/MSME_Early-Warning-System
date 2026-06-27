import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Database, Cpu, Sparkles, ShieldCheck, Activity, Layers } from "lucide-react";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "Approach · IDBI Innovate 2026 · MSME Default EWS" },
      {
        name: "description",
        content:
          "How our Track 04 submission predicts MSME defaults 12 months ahead: structured + alternate data fusion, AWS Lambda inference, and an explainable common interpretation framework.",
      },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Brand band */}
      <div className="bg-idbi-green-deep text-white">
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-idbi-orange grid place-items-center font-display text-base">
              i
            </div>
            <div className="leading-tight">
              <div className="font-display text-base">IDBI Innovate 2026</div>
              <div className="text-[10px] uppercase tracking-[0.18em] text-white/70">
                Track 04 · MSME Default EWS
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-5 text-[12px]">
            <Link to="/" className="text-white/70 hover:text-white">
              ← Open Dashboard
            </Link>
            <a
              href="https://hack2skill.com/event/idbinnovate"
              target="_blank"
              rel="noreferrer"
              className="text-white/70 hover:text-white"
            >
              Hackathon Brief ↗
            </a>
          </nav>
        </div>
      </div>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-idbi-orange/10 border border-idbi-orange/30 text-idbi-orange text-[11px] font-semibold uppercase tracking-widest">
          <Sparkles className="size-3" /> Submission · Track 04 · Default Prediction Model
        </div>
        <h1 className="font-display text-5xl md:text-6xl text-idbi-green-deep mt-5 leading-tight tracking-tight">
          Catching MSME default risk
          <br />
          <span className="text-idbi-orange italic">twelve months before it lands.</span>
        </h1>
        <p className="text-base text-muted-foreground mt-5 max-w-2xl leading-relaxed">
          Traditional credit models for MSMEs flag stress at 16–22% accuracy and only after the borrower has already
          slipped. Our system fuses structured filings with alternate-data signals (UPI, bank statements, EPFO) to
          predict default 12 months ahead, and ships every score with a human-readable explanation a loan officer can
          act on.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-idbi-orange text-white text-sm font-semibold uppercase tracking-wider hover:brightness-95 transition"
          >
            Open the live dashboard <ArrowRight className="size-4" />
          </Link>
          <a
            href="https://hack2skill.com/event/idbinnovate"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-border text-sm font-semibold uppercase tracking-wider hover:bg-muted transition"
          >
            View hackathon brief
          </a>
        </div>
      </section>

      {/* KPI strip */}
      <section className="max-w-6xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Stat value="90%" label="Target accuracy" hint="Track 04 benchmark" />
          <Stat value="12 mo" label="Prediction horizon" hint="Ahead of default" />
          <Stat value="<500ms" label="Inference latency" hint="AWS Lambda · ap-south-1" />
          <Stat value="5+" label="Data signals fused" hint="GST · UPI · Bank · Bureau · EPFO" />
        </div>
      </section>

      {/* Approach cards */}
      <section className="bg-idbi-green/[0.04] border-y border-border py-16">
        <div className="max-w-6xl mx-auto px-6">
          <h2 className="font-display text-3xl text-idbi-green-deep mb-2">How it works</h2>
          <p className="text-sm text-muted-foreground mb-10">Three pillars that map directly to the Track 04 brief.</p>
          <div className="grid md:grid-cols-3 gap-5">
            <Card
              icon={<Database className="size-5" />}
              title="Data fusion"
              body="GST returns, UPI velocity, bank-statement parsed cash flow, CIBIL/Bureau commercial pulls and EPFO contributions — normalized into a feature store for every MSME borrower."
              chips={["GST", "UPI", "Bank Stmt", "Bureau", "EPFO"]}
            />
            <Card
              icon={<Cpu className="size-5" />}
              title="Serverless ML inference"
              body="Python model deployed as an AWS Lambda function in ap-south-1, exposed via a Function URL. Sub-500ms cold-mitigated inference; scales to portfolio batch scoring without provisioning."
              chips={["AWS Lambda", "Python 3.12", "ap-south-1"]}
            />
            <Card
              icon={<Layers className="size-5" />}
              title="Explainable scenario sim"
              body="Per-factor SHAP-style contributions plus a real-time scenario workbench: loan officers stress-test cash-flow shock, payment lag and GST lapse and watch the PD update live."
              chips={["SHAP", "Real-time", "What-if"]}
            />
          </div>
        </div>
      </section>

      {/* Architecture */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <h2 className="font-display text-3xl text-idbi-green-deep mb-2">Architecture</h2>
        <p className="text-sm text-muted-foreground mb-8">
          End-to-end request path — from loan-officer slider movement to scored response.
        </p>

        <div className="border border-border rounded-xl p-8 bg-card">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-stretch text-center">
            <Node icon={<Activity className="size-5" />} title="Browser" sub="Loan officer UI" />
            <Arrow />
            <Node icon={<ShieldCheck className="size-5" />} title="TanStack server fn" sub="Auth + payload validation" />
            <Arrow />
            <Node icon={<Cpu className="size-5" />} title="AWS Lambda" sub="Python ML · returns {score, status}" tint />
          </div>
          <div className="mt-6 pt-6 border-t border-border text-[11px] text-muted-foreground font-mono leading-relaxed overflow-x-auto">
            POST https://da6peh6effytuvystfpobxfwki0fkaxm.lambda-url.ap-south-1.on.aws/
            <br />
            {"→ { score: 0.5701, status: \"Normal\" }  // scaled to 0–100 + mapped to risk tier"}
          </div>
        </div>
      </section>

      {/* Demo creds */}
      <section className="max-w-6xl mx-auto px-6 pb-20">
        <div className="border border-idbi-orange/30 bg-idbi-orange/5 rounded-xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="text-[11px] uppercase tracking-widest text-idbi-orange font-bold mb-1">
              Judges · Demo access
            </div>
            <p className="text-sm text-foreground">
              Demo mode is active. Sign in with any email — prefix with{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-background border border-border">admin@</code>{" "}
              or{" "}
              <code className="font-mono text-xs px-1.5 py-0.5 rounded bg-background border border-border">
                manager@
              </code>{" "}
              to preview role tiers.
            </p>
          </div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded bg-idbi-green text-white text-sm font-semibold uppercase tracking-wider hover:brightness-95 transition shrink-0"
          >
            Launch demo <ArrowRight className="size-4" />
          </Link>
        </div>
      </section>

      <footer className="border-t border-border py-6 text-center text-[11px] text-muted-foreground">
        Built for IDBI Innovate 2026 · Track 04 · Independent submission — not affiliated with IDBI Bank Ltd.
      </footer>
    </div>
  );
}

function Stat({ value, label, hint }: { value: string; label: string; hint: string }) {
  return (
    <div className="p-5 border border-border rounded-xl bg-card">
      <div className="font-display text-3xl text-idbi-green-deep leading-none">{value}</div>
      <div className="text-[11px] uppercase tracking-widest text-foreground/80 font-semibold mt-2">{label}</div>
      <div className="text-[11px] text-muted-foreground mt-1">{hint}</div>
    </div>
  );
}

function Card({
  icon,
  title,
  body,
  chips,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
  chips: string[];
}) {
  return (
    <div className="p-6 bg-card border border-border rounded-xl hover:shadow-md hover:border-idbi-green/30 transition">
      <div className="size-10 rounded-lg bg-idbi-green/10 text-idbi-green grid place-items-center mb-4">{icon}</div>
      <h3 className="font-display text-xl text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed mb-4">{body}</p>
      <div className="flex flex-wrap gap-1.5">
        {chips.map((c) => (
          <span
            key={c}
            className="px-2 py-0.5 text-[10px] font-medium rounded-sm bg-idbi-green/10 text-idbi-green border border-idbi-green/20"
          >
            {c}
          </span>
        ))}
      </div>
    </div>
  );
}

function Node({
  icon,
  title,
  sub,
  tint,
}: {
  icon: React.ReactNode;
  title: string;
  sub: string;
  tint?: boolean;
}) {
  return (
    <div
      className={`p-4 rounded-lg border ${
        tint ? "bg-idbi-orange/10 border-idbi-orange/30" : "bg-background border-border"
      }`}
    >
      <div
        className={`size-9 mx-auto rounded grid place-items-center mb-2 ${
          tint ? "bg-idbi-orange text-white" : "bg-idbi-green text-white"
        }`}
      >
        {icon}
      </div>
      <div className="text-xs font-bold text-foreground">{title}</div>
      <div className="text-[10px] text-muted-foreground mt-0.5">{sub}</div>
    </div>
  );
}

function Arrow() {
  return (
    <div className="hidden md:grid place-items-center text-idbi-green">
      <ArrowRight className="size-5" />
    </div>
  );
}
