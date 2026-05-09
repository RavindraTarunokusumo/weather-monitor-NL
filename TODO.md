# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.

## Active Session

<!-- forecast-summary-trend-data-wiring — spec: docs/specs/forecast-summary-trend-data-wiring.md -->

- [x] Task 1: Accept the data wiring spec and keep implementation scope tied to `docs/specs/forecast-summary-trend-data-wiring.md`.
- [x] Task 2: Add forecast, warning, air-trend, water-trend, weekly-level, and deterministic summary tests.
- [x] Task 3: Enrich live weather ingestion with Open-Meteo forecast payloads and KNMI warning normalization.
- [x] Task 4: Derive Luchtmeetnet air trends and Rijkswaterstaat water trends/weekly levels in source adapters.
- [x] Task 5: Regenerate dashboard snapshots with outlook, UI summary, source status, and deterministic briefing fallback.
- [x] Task 6: Update commands/docs and run validation.
- [ ] Task 7: Prepare commit/PR with the active spec path.

<!-- public-dashboard-ui-shell — spec: docs/specs/public-dashboard-ui-shell.md -->

- [x] Task 1: Shared types (`lib/types/dashboard.ts`). Commit: `f2c633f`
- [x] Task 2: Pure formatters + tests (`lib/utils/format.ts`, `tests/format.test.ts`). Commit: `6d87549`
- [x] Task 3: API client (`lib/api/dashboard-client.ts`). Commit: `486b0d0`
- [x] Task 4: Testing infrastructure (React Testing Library + happy-dom + vitest config). Commit: `a34ab41`
- [x] Task 5: Pure display components (6 card components in `app/components/`). Commit: `a8f2760`
- [x] Task 6: LiveDashboard client component + tests. Commit: `5f09018`
- [x] Task 7: Update page.tsx, layout.tsx, globals.css. Commit: `e8adc15`
- [x] Task 8: Full validation — 39 tests pass, 0 typecheck errors, 0 lint errors
