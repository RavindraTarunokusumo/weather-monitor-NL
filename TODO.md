# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.

## Active Session

<!-- reference-dashboard-webpage-ui — spec: docs/specs/reference-dashboard-webpage-ui.md -->

- [x] Task: Keep the 24-hour outlook chart to a single 24-entry row when forecast ingestion returns more than one day of hourly data. Commit: `e10ba99`

<!-- forecast-summary-trend-data-wiring — spec: docs/specs/forecast-summary-trend-data-wiring.md -->

- [x] Task: Preserve enriched weather and water metadata when the newest live rows contain observations only. Commit: `57c4e9d`
- [x] Task: Hide unavailable pollutant rows from the dashboard detail panel. Commit: `57c4e9d`

<!-- public-dashboard-ui-shell — spec: docs/specs/public-dashboard-ui-shell.md -->

- [x] Task 1: Shared types (`lib/types/dashboard.ts`). Commit: `f2c633f`
- [x] Task 2: Pure formatters + tests (`lib/utils/format.ts`, `tests/format.test.ts`). Commit: `6d87549`
- [x] Task 3: API client (`lib/api/dashboard-client.ts`). Commit: `486b0d0`
- [x] Task 4: Testing infrastructure (React Testing Library + happy-dom + vitest config). Commit: `a34ab41`
- [x] Task 5: Pure display components (6 card components in `app/components/`). Commit: `a8f2760`
- [x] Task 6: LiveDashboard client component + tests. Commit: `5f09018`
- [x] Task 7: Update page.tsx, layout.tsx, globals.css. Commit: `e8adc15`
- [x] Task 8: Full validation — 39 tests pass, 0 typecheck errors, 0 lint errors
