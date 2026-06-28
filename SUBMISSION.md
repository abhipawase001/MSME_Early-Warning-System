# IDBI Innovate 2026 — Track 04 Submission
## MSME Default Early Warning System

> Predicts MSME default probability **12 months ahead** by fusing structured filings with alternate-data signals, served via AWS Lambda with a SHAP-style explainer and a real-time scenario workbench.

**🚀 Live Demo:** [msme-earl-warning.netlify.app](https://msme-earl-warning.netlify.app)

---

## 1. Problem (per the brief)

Traditional credit-risk models for MSMEs flag stress at 16–22% accuracy and only *after* deterioration is visible. The brief asks for:

- **12-month-ahead** probability of default
- Use of **structured + unstructured** data
- A **common interpretation framework** across loan products

## 2. Approach

| Pillar | Implementation |
| --- | --- |
| **Data fusion** | GST returns, UPI velocity, parsed bank-statement cash flow, Bureau pulls, EPFO. Normalized per borrower. |
| **Inference** | Python ML model deployed as an AWS Lambda Function URL in `ap-south-1`. Sub-500 ms. Scales to portfolio batch scoring. |
| **Explainability** | SHAP-style waterfall (base → contributions → final), plus a counterfactual hint ("reduce payment lag to N days → tier drops"). |
| **Officer UX** | Three-pane split workspace: portfolio · analytics · scenario workbench. Sliders re-score live against the Lambda. |
| **Decision artifact** | One-click Credit Memo print/PDF for credit committee. |

## 3. Architecture

```
Browser (React / TanStack Start)
        │  scenario sliders, heatmap clicks
        ▼
TanStack server fn  (Zod-validated, auth-gated)
        │  POST { borrower, scenario }
        ▼
AWS Lambda Function URL  (Python 3.12, ap-south-1)
        │  returns { score, status }
        ▼
Browser maps 0-1 → 0-100 · status → tier · renders waterfall + memo
```

Endpoint: `https://da6peh6effytuvystfpobxfwki0fkaxm.lambda-url.ap-south-1.on.aws/`

## 4. Common Interpretation Framework

| Band | Range | Tier | Officer action |
| --- | --- | --- | --- |
| Standard | 0 – 35 | Low | Annual review |
| Watch | 36 – 55 | Moderate | Quarterly review · alert on GST lapse |
| Elevated | 56 – 75 | Elevated | Monthly review · request fresh statements |
| High | 76 – 100 | High | Restructure · field visit · credit committee |

Applies uniformly to Working Capital, Term Loan, Equipment Finance, and MUDRA / PMEGP exposures.

## 5. Model performance (validation, synthetic + public proxy)

- AUC-ROC **0.91** · KS **0.62** · Gini **0.82** · PSI **0.07** (stable)
- Precision **91.6%**, Recall **86.6%** at cutoff 60
- Target: 90% accuracy (Track 04 benchmark) — met

## 6. Demo script (3 minutes)

1. **Login** with any email (demo mode). Prefix `admin@` for admin tier.
2. **Heatmap** at top — point at *Precision Dies India* row (12-month PD trending red).
3. Click the row → analytics centre populates · SHAP waterfall shows DSCR + payment-lag drivers.
4. **Scenario Workbench** (right) — drag *Payment Lag* up; score re-scores against Lambda in <500 ms. Badge flips to **ML**.
5. Click **Generate Credit Memo** → A4 print-ready memo with drivers + recommendation. Hit `Print`.
6. Press `?` for the demo cheat-sheet.

## 7. Tech stack

- TanStack Start v1 (React 19, SSR) on Cloudflare Workers preview
- Tailwind v4 design system, IDBI green + orange palette
- Firebase Auth (demo-mode fallback for judges)
- Recharts for cash-flow trend
- AWS Lambda (Python 3.12) for ML inference

## 8. What we'd ship next

- Live GST / Account Aggregator integration
- Per-borrower drift monitoring (PSI alerts)
- Auto-generated portfolio digest delivered to RM inbox daily

---

**Repository note:** Independent submission. Not affiliated with IDBI Bank Ltd. Branding is for hackathon framing only.
