# 2026-05-21 - Restore Daily Refresh Live Cron

Spec: `docs/specs/production-live-refresh-guardrails.md`

## Completed

- [x] Revert the production refresh cron schedule to daily — commit `c59af25`
  - Changed the Vercel Cron registration for `/api/jobs/refresh-live` back to `0 5 * * *`.
  - Restored the docs and contract test to the daily Hobby/free-plan-compatible cadence.
  - Kept the refresh route behavior and authorization unchanged.

## Validation

- `npm test -- tests/production-refresh.test.ts`
- `npm run lint`
- `npm test`
- `npm run typecheck`
- `npm run build`
