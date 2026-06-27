## Wire your Lambda URL into the dashboard

You've shared the Function URL:
`https://da6peh6effytuvystfpobxfwki0fkaxm.lambda-url.ap-south-1.on.aws/`

### Steps
1. Save `ML_API_URL` as a secret with that URL (opens the secure form, pre-filled — you just confirm).
2. Ask whether your Lambda requires an API key:
   - **Yes** → also save `ML_API_KEY` (the same value as the `API_KEY` env var on your Lambda).
   - **No (Auth: NONE, no key check in code)** → skip `ML_API_KEY`; the server function already handles that case.
3. Smoke test the live endpoint from the sandbox with a sample payload matching the contract in `src/lib/score.functions.ts` (borrower_id, sector, base_score, gst_compliance_pct, debt_service_ratio, scenario{...}). Verify it returns `{ score, tier?, factors? }`.
4. If the response shape differs, adapt the parser in `score.functions.ts` to map your Lambda's actual fields onto `ScoreResult` so the badge flips from **Local** → **ML**.
5. Verify in the preview: open the Scenario Workbench, move a slider, confirm the badge shows **ML** and the score updates.

### One quick question before I proceed
Does your Lambda require an API key in the `Authorization: Bearer ...` header, or is it open (Auth: NONE with no key check)?
