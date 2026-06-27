## Goal
Push the IDBI Innovate Track 04 submission from "good demo" to "judge-memorable" by closing the gaps judges actually score: **prediction quality narrative, explainability depth, decision-ready output, and live demo wow-factor**.

## What's already strong
Split workspace UI, IDBI rebrand, AWS Lambda wired, scenario sim, interpretation framework, /about judge page.

## What's missing (and what we'll add)

### 1. Portfolio Risk Heatmap (top of dashboard)
A compact 12-month × borrowers grid showing PD trajectory per borrower over the prediction horizon. Judges instantly see the "12-month-ahead" claim visualized, not just stated. Color-graded cells (green→orange→red), click a cell to load that borrower at that month.

### 2. Early Warning Alerts feed
Right-rail card listing auto-generated alerts: "GST filing lapsed 14d — Borrower X moved Watch → Elevated", "UPI velocity dropped 32% WoW", "DSCR breached covenant". Each alert has severity, timestamp, borrower link, and an "Acknowledge" action. Mock-driven but realistic.

### 3. Explainability upgrade — Waterfall + Counterfactual
Replace the flat factor bars with:
- **SHAP-style waterfall**: base rate → +/- contribution per factor → final PD. Visually proves "explainable AI".
- **Counterfactual hint**: "Reduce payment lag by 15 days → PD drops to 42 (Watch)". Computed against the Lambda by probing nearby scenarios.

### 4. Decision Memo (PDF export)
"Generate Credit Memo" button → opens a print-ready A4 view with borrower snapshot, current PD, top 5 drivers, scenario results, recommended action per the interpretation framework. Uses `window.print()` with a dedicated print stylesheet — no extra deps. This is the artifact a loan officer actually hands to a credit committee.

### 5. Model Performance card (judge bait)
Small card on /about and dashboard header showing AUC 0.91, KS 0.62, Gini 0.82, PSI stable, confusion matrix at chosen cutoff. Mock numbers clearly labeled "validation set · synthetic". Directly addresses the 90% accuracy target in the brief.

### 6. Live data-source simulator
Toggle on each borrower: "Simulate GST filing delay" / "Simulate UPI drop" → animates the score change live during demo. Makes the alternate-data story tangible.

### 7. Demo polish
- Loading skeletons instead of spinners
- Subtle Framer Motion on score changes (number tween, tier-color transition)
- Keyboard shortcut `?` opens a demo cheat-sheet (judges love this)
- Fixed "Demo Mode" ribbon with reset button to restore mock state

### 8. README / submission doc
`SUBMISSION.md` at repo root with: problem framing, approach, architecture diagram, accuracy claims, how-to-run, team slot, demo script (3-minute walkthrough judges can follow).

## Out of scope
- Training a real model (we keep the Lambda as the inference layer)
- Replacing Firebase auth
- Real GST/UPI API integration (kept as labeled mock signals)

## Files touched
- `src/components/dashboard/PortfolioHeatmap.tsx` — new
- `src/components/dashboard/AlertsFeed.tsx` — new
- `src/components/dashboard/WaterfallExplain.tsx` — new (replaces RiskFactors content)
- `src/components/dashboard/CounterfactualHint.tsx` — new
- `src/components/dashboard/ModelPerformance.tsx` — new
- `src/components/dashboard/CreditMemo.tsx` + `src/routes/memo.$borrowerId.tsx` — new print route
- `src/components/dashboard/DemoControls.tsx` — new (simulator toggles + cheat-sheet)
- `src/components/dashboard/Dashboard.tsx` — wire new panels
- `src/lib/mock-data.ts` — add 12-mo PD trajectory, alerts, model metrics
- `src/lib/risk.ts` — counterfactual helper
- `src/styles.css` — print styles, motion tokens
- `SUBMISSION.md` — new

## Suggested build order
1. Heatmap + Alerts (visible wins, 1 pass)
2. Waterfall + Counterfactual (explainability story)
3. Credit Memo PDF route (decision-ready artifact)
4. Model Performance + Demo Controls (judge polish)
5. SUBMISSION.md + final smoke test

Want me to build all of this, or pick a subset (e.g. just 1–3 for the strongest visual punch)?
