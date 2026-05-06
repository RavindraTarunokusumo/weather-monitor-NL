# API Wiring Live Data Pipeline Session

Spec path: `docs/specs/api-wiring-live-data-pipeline.md`
PR: https://github.com/RavindraTarunokusumo/weather-monitor-NL/pull/5
Archived date: 2026-05-06

## Completed Items

- [x] Add source configuration, safe HTTP helper, and live-capable KNMI/Luchtmeetnet/Rijkswaterstaat adapters. Commit: `fbbc513`
- [x] Add shared ingestion orchestration, live/mock CLI flags, all-city execution, and protected job routes. Commits: `7747aad`, `373b23d`
- [x] Implement dashboard snapshot regeneration from latest stored source snapshots. Commit: `1cf98cd`
- [x] Extend public dashboard API/UI for all seeded cities, source freshness, stale, and missing states. Commit: `e57703c`
- [x] Update docs, run simplification/security/test-plan checks, and complete full validation. Commit: `fddc9b6`
- [x] Fix and verify live KNMI/Rijkswaterstaat adapter contracts for all seeded cities. Commit: `e5982d5`

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx prisma validate`
- `npm run build`
- `npm run ingest:all -- --live`
- `npm run dashboard:regenerate -- --all`
- Browser verification at `http://localhost:3001`

## Notes

- Security review found and fixed query-parameter `CRON_SECRET` authorization. Job auth now accepts bearer tokens only.
- The KNMI API key was not committed. It must be set locally or in deployment as `KNMI_API_KEY`.
- The KNMI live adapter uses supported EDR parameters `ta`, `ff`, `dd`, `fx`, and `R1H` and normalizes CoverageCollection payloads.
- Rijkswaterstaat live ingestion uses `OphalenWaarnemingen`, `Locatie`, and WATHTE-capable locations with recent observations for all seeded cities.
