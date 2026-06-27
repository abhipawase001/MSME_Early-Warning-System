## Goal
Layer judge-defensible **technical depth** on top of the working dashboard so the submission visibly answers every clause of the brief: 90% accuracy, 12-month horizon, structured + unstructured fusion, segment-specific methods, common interpretation framework.

## What's already shipped
Split workspace UI, IDBI rebrand, AWS Lambda wired, scenario sim, SHAP-style waterfall, counterfactual hint, portfolio heatmap, alerts feed, model performance card, credit memo PDF, `/about` + SUBMISSION.md.

## New technical pillars to add

### 1. Unstructured-data pipeline (visible, not just claimed)
The brief explicitly demands unstructured data. Add a **Document Intelligence panel** on each borrower:
- Drop-zone for bank statement PDF / GST return / invoice image.
- Server route `/api/public/ingest` runs OCR (Tesseract via WASM in worker, or Lovable AI vision on the file) → extracts cash-in/out, bounced cheques, top counterparties.
- Lovable AI Gateway (`google/gemini-3-flash-preview`) does **news/sentiment scan** on borrower name (mocked corpus + live web search via Firecrawl connector if linked) → returns sentiment score and adverse-media flags that feed the risk score as a new factor.

### 2. Ensemble model story with per-segment routing
Add a **Model Router** card showing which sub-model fired for the current borrower:
- Working Capital → XGBoost on cash-flow features
- Term Loan → LightGBM on DSCR + bureau trajectory
- Equipment Finance → survival model (time-to-default)
- MUDRA / micro → logistic + alternate-data (UPI velocity, GST regularity)
Each shown with its own AUC. Routing logic lives in `score.functions.ts`; Lambda receives a `segment` field and returns which sub-model scored it. Directly answers "suitable analytical methods for different loan types".

### 3. 12-month PD term structure chart
Replace the single PD number with a **survival curve** (PD at months 1, 3, 6, 9, 12) per borrower using Recharts area chart. Visually proves the "12-month-ahead" claim instead of stating it. Mock from a Weibull-ish curve; expose via Lambda payload field `pd_curve`.

### 4. Drift & fairness monitoring
New `/monitoring` route:
- **PSI per feature** table (population stability) with green/amber/red.
- **Fairness slice**: PD distribution by sector and by ticket-size bucket — proves the model isn't biased against micro borrowers.
- **Backtest panel**: rolling 12-month AUC chart on synthetic holdout.
Judges love operational ML rigor.

### 5. Common Interpretation Framework — formalized
Upgrade the existing panel to a **Score Card spec**:
- Deterministic mapping table with worked example.
- Downloadable JSON schema (`/api/public/interpretation-schema`) so other bank systems can consume the score.
- API contract documented inline (request/response with Zod schemas displayed).

### 6. Early-warning **trigger engine** (rules + ML hybrid)
Codify regulator-style triggers alongside the ML score:
- 3 GST filings missed in 6 months → auto-Watch
- DSCR < 1.1 for 2 consecutive quarters → auto-Elevated
- Bounced cheque in last 30 days → auto-Elevated
Rules engine evaluated client-side; alerts feed already exists, this gives it teeth. Shown as a small "Triggers fired" chip strip on each borrower.

### 7. Explainability v2 — Global + Local
Add a **Global Feature Importance** chart on `/about` (bar chart of mean |SHAP| across the synthetic portfolio) next to the local waterfall. Pair = textbook XAI presentation.

### 8. RM Action API (`/api/public/actions`)
POST endpoint that accepts `{borrowerId, action}` and returns a JSON receipt — proves the system is integration-ready for a bank's core banking workflow (signed-off restructure, field-visit dispatch, committee escalation). Webhook-style with HMAC verification per the public-routes guideline.

### 9. Performance & accessibility polish
- Lighthouse-clean: lazy-load Recharts, add `prefers-reduced-motion` guards, ARIA on the heatmap grid (it's currently divs).
- Sub-500 ms perceived latency: optimistic UI on scenario sliders + de-bounced Lambda call + skeleton states.

### 10. Judge-facing artifacts
- `/architecture` route with an inline SVG architecture diagram (data sources → ingestion → ensemble → interpretation → officer UI).
- `/api-docs` route auto-rendered from Zod schemas (one-pager OpenAPI-ish view).
- Update SUBMISSION.md with the new sections.

## Out of scope
- Training actual models (Lambda stays inference layer; metrics stay clearly labeled synthetic).
- Real bureau / GSTN integration (we ship the contract + mock).
- Replacing Firebase auth.

## Files touched
- `src/components/dashboard/DocumentIntelligence.tsx` — new (upload + OCR + AI extract)
- `src/components/dashboard/ModelRouter.tsx` — new
- `src/components/dashboard/PDTermStructure.tsx` — new (survival curve)
- `src/components/dashboard/TriggerChips.tsx` — new
- `src/components/dashboard/GlobalImportance.tsx` — new
- `src/routes/monitoring.tsx` — new (PSI, fairness, backtest)
- `src/routes/architecture.tsx` — new
- `src/routes/api-docs.tsx` — new
- `src/routes/api/public/ingest.ts` — new (file → extracted features)
- `src/routes/api/public/actions.ts` — new (RM action receipt, HMAC)
- `src/routes/api/public/interpretation-schema.ts` — new
- `src/lib/triggers.ts` — new rules engine
- `src/lib/segments.ts` — new (segment → sub-model routing + per-segment metrics)
- `src/lib/score.functions.ts` — add `segment`, `pd_curve` handling
- `src/lib/mock-data.ts` — add PD curves, PSI series, fairness slices, segment labels
- `src/components/dashboard/Dashboard.tsx` — wire new panels into right rail and centre
- `SUBMISSION.md` — append the new technical sections

## Build order (incremental, each visible on its own)
1. PD term structure + Trigger engine + Model Router (biggest narrative wins)
2. Document Intelligence + AI sentiment (unstructured data story)
3. Monitoring route (drift + fairness + backtest)
4. Architecture + API-docs routes, action webhook
5. A11y / perf pass, SUBMISSION.md update, smoke test

## Required confirmations before I build
- Use **Lovable AI Gateway** (`google/gemini-3-flash-preview`) for the unstructured-data extraction + sentiment? It's already wired into the platform — no extra keys.
- Enable the **Firecrawl** connector for live adverse-media search, or keep it on a mock corpus? Mock is fine for demo; Firecrawl adds "live data" flair.
- Want all 10 pillars, or a top-N subset (recommend 1, 2, 3, 4 for max judge impact)?
