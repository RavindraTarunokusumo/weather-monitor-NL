# Source Adapter & Ingestion Skeleton — 2026-05-03

Completed session archived from `TODO.md`.

Spec: `docs/specs/source-adapter-ingestion-skeleton.md`

## Completed tasks

- [x] Base adapter interface (`lib/ingestion/base.ts`). Commit: `abdc0d2`
- [x] KnmiAdapter stub with mock weather fixture. Commit: `3364b82`, `b76c659`
- [x] LuchtmeetnetAdapter stub with mock air quality fixture. Commit: `b68f155`
- [x] RijkswaterstaatAdapter stub with mock water fixture. Commit: `eaf807b`
- [x] `runIngestionJob` with source_run tracking and error handling. Commit: `c0f228c`, `bd57341`
- [x] Ingest-weather API route. Commit: `51fcb4e`
- [x] Ingest-air-quality API route. Commit: `7ca8c00`
- [x] Ingest-water API route. Commit: `5d4cc02`
- [x] `regenerate-dashboard-snapshots` stub (501). Commit: `b3ea90a`
- [x] CLI ingest entrypoint and npm scripts. Commit: `e4f4a51`
- [x] Lint fixes. Commit: `71ac534`
- [x] Merged to main. Commit: `7b1fd07`

## Validation

- `npm test` — 11 PASS (2 dashboard + 9 adapter + 2 run)
- `npm run typecheck` — 0 errors
- `npm run lint` — 0 errors

## Notes

- Ingestion adapters are stubs only; live KNMI/Luchtmeetnet/Rijkswaterstaat API integration deferred.
- `regenerate-dashboard-snapshots` remains a 501 stub; dashboard snapshot regeneration is a future spec.
- CLI can be exercised with `npm run ingest:weather -- --city amsterdam --mock`.
