# Production Live Refresh Guardrails Spec

Status: Accepted
Spec path: `docs/specs/production-live-refresh-guardrails.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-05-12

## Goal

Production must not silently present mock dashboard snapshots as if they were live source data. The app should make mock sources visible in the UI and provide an automated, authenticated live refresh path for Vercel production.

## Scope

- Keep `mock_*` source identifiers visibly distinguishable in the UI source freshness footer.
- Add one protected refresh route that runs live ingestion for all active cities and then regenerates dashboard snapshots.
- Register a Vercel Cron job for the refresh route so production data freshness does not depend on a remembered manual post-deploy command.
- Document the refresh route and cron behavior.
- Add future-session production data verification guidance to the agent instructions.
- Add tests for mock-source labeling, refresh route authorization/orchestration, and Vercel Cron registration.

## Non-Goals

- Do not change Prisma schema.
- Do not change the source adapter normalization contracts.
- Do not call external source APIs from public dashboard page or `/api/dashboard` requests.
- Do not expose server-side secrets to browser code or public JSON.

## Acceptance Criteria

- A dashboard response containing `mock_knmi`, `mock_luchtmeetnet`, or `mock_rijkswaterstaat` renders those sources with an explicit mock label in the footer.
- A production refresh route rejects unauthenticated requests and accepts the existing `CRON_SECRET` bearer authorization.
- The refresh route runs all live ingestion sources for all active cities before dashboard snapshot regeneration.
- Vercel Cron is configured to call the refresh route with a schedule compatible with the Hobby plan daily limit.
- Documentation explains how production refresh happens and how to manually invoke it when needed.
- Future sessions have explicit instructions to verify production source IDs through `/api/dashboard`, not by trusting footer labels alone.
- Production is manually refreshed once after this change so the current deployed instance no longer shows mock dashboard data when live source jobs succeed.
