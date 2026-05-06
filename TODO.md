# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
- [ ] Implement `regenerate-dashboard-snapshots` route (currently 501 stub).

## Active Session

<!-- public-dashboard-ui-shell — spec: docs/specs/public-dashboard-ui-shell.md -->

<!-- api-wiring-live-data-pipeline — spec: docs/specs/api-wiring-live-data-pipeline.md -->

- [x] Add source configuration, safe HTTP helper, and live-capable KNMI/Luchtmeetnet/Rijkswaterstaat adapters. Commit: `fbbc513`
- [x] Add shared ingestion orchestration, live/mock CLI flags, all-city execution, and protected job routes. Commits: `7747aad`, `373b23d`
- [x] Implement dashboard snapshot regeneration from latest stored source snapshots. Commit: `1cf98cd`
- [x] Extend public dashboard API/UI for all seeded cities, source freshness, stale, and missing states. Commit: `e57703c`
- [x] Update docs, run simplification/security/test-plan checks, and complete full validation. Commit: `fddc9b6`
