## Goal
Make this submission unmistakably an **IDBI Innovate 2026 — Track 04 (Default Prediction Model)** entry: adopt IDBI's visual identity (deep green + orange on white) and tighten the narrative judges will score on.

## Visual rebrand (IDBI identity)

New design tokens in `src/styles.css` (replacing current dark enterprise palette):
- `--idbi-green: oklch(0.42 0.10 160)` (~#0A6E4E) — primary
- `--idbi-green-deep: oklch(0.30 0.08 160)` — sidebar/header band
- `--idbi-orange: oklch(0.70 0.18 50)` (~#F37021) — CTAs, risk highlights, runner-up accent
- `--idbi-sand: oklch(0.98 0.01 90)` — page background
- Risk tiers re-mapped to IDBI palette: low=green, moderate=sand/amber, elevated=orange, high=deep red
- Typography: keep Inter for body; switch display to **"DM Serif Display"** for headings (matches IDBI's editorial banking tone) + JetBrains Mono kept for numerics
- Header band: deep-green with white type; orange "Apply / Run Scenario" buttons — mirrors idbibank.in

## Track 04 alignment (content + UX)

1. **Header rebrand**: "IDBI Innovate 2026 · MSME Default Early Warning" with Track 04 badge and tagline "12-month-ahead PD · structured + alternate data · common interpretation framework".
2. **Risk score card**: add "12-month PD" label, show baseline (16–22%) vs target (90%) accuracy chip so judges immediately see the problem framing.
3. **Data sources strip** on each borrower: chips for GST · UPI · Bank Statements · Bureau · EPFO (visual; mock data) — proves "structured + unstructured" claim.
4. **Common Interpretation Framework** panel: a small legend block explaining the unified 0–100 score and tier mapping used across loan types (working capital, term loan, equipment) — directly answers the brief's "common interpretation framework" requirement.
5. **Risk Factors** panel: add per-factor "direction" arrows + plain-English explanation, with a tooltip noting SHAP-style attribution.

## New `/about` route — judge landing page

Single scrollable page, IDBI-styled:
- Hero with IDBI-Innovate badge, problem statement (quoted from brief), team-name placeholder.
- "Why this wins" KPI strip: 90% target accuracy · 12-mo horizon · <500ms inference · explainable.
- "Approach" — 3 cards: Data Fusion (GST/UPI/Bank/Bureau), AWS Lambda ML, Explainable Scenario Sim.
- Architecture diagram (clean SVG): Browser → TanStack server fn → AWS Lambda (Python) → JSON {score, status}.
- Demo credentials box; CTA buttons "Open Dashboard" / "View Hackathon Brief".

## Nav + meta
- Header links: Dashboard · About · Hackathon Brief (external).
- Root route head: title "IDBI Innovate 2026 · MSME Default Early Warning" + Track 04 meta description + OG.

## Files touched
- `src/styles.css` — palette + fonts swap
- `src/routes/__root.tsx` — head meta, font link
- `src/routes/about.tsx` — **new**
- `src/components/dashboard/Dashboard.tsx` — header band, badges, KPI chips
- `src/components/dashboard/PortfolioList.tsx` — data-source chips
- `src/components/dashboard/RiskFactors.tsx` — directions + framework tooltip
- New `src/components/dashboard/InterpretationFramework.tsx`
- `src/components/auth/LoginScreen.tsx` — IDBI-styled login

Out of scope: changing ML logic, auth provider, or real GST/UPI APIs (kept as mock chips clearly labeled "demo data").

## Note on logo
I will **not** copy IDBI's actual logo (trademark). I'll use a neutral "IDBI Innovate 2026 · Track 04" wordmark badge so the submission stays compliant.
