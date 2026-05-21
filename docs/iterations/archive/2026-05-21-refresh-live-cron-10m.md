# 2026-05-21 - Refresh Live Cron 10m

Spec: `docs/specs/production-live-refresh-guardrails.md`

## Completed

- [x] Update the production refresh cron schedule to every 10 minutes — commit `ae58b86`
  - Changed the Vercel Cron registration for `/api/jobs/refresh-live` from the daily schedule to `*/10 * * * *`.
  - Updated the docs and cron contract test to match the new cadence.
  - Kept the refresh route behavior and authorization unchanged.

## Validation

- `npm test -- tests/production-refresh.test.ts`
- `npm run lint`
- `npm test`
