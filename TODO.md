# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Seamless sliding page transitions between Dashboard and Forecast. Blocker: the homepage is an iframe-rendered HTML app while /forecast is a real Next.js route, so a shared client-side transition requires first migrating the homepage onto the React port in `app/dashboard/` (needs its own spec; see the existing BLOCKED migration note). Related: Forecast initial load is slow — `force-dynamic` + sequential Prisma queries in `app/forecast/page.tsx`; parallelize/cache regardless of the transition work.
- [ ] Replace the Forecast hourly signal timeline (redundant with the dashboard) with a weather-radar display showing cloud movement and temperature gradients, alongside the existing Risk Radar. Requires a new spatial data source (e.g., KNMI Data Platform precipitation-radar datasets) plus ingestion/storage design — spec with backend scope, not a UI-only swap; no invented data per core invariants.
- [ ] Remove the 7-Day Outlook section from the Forecast page.
- [x] Investigate a pre-existing React duplicate-key console warning ("00-00") on the Forecast page hourly list — resolved in the forecast-visual-redesign session (c43a667): root cause was bare-hour `starts_at` values misparsed by `new Date()`; keys deduped and parsing fixed.
