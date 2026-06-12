# 2026-06-04 - Complete City Data And Config-Only Expansion

Spec: `docs/specs/major-dutch-cities-10.md`

## Completed

- [x] Added regression coverage for observation-only live weather without enriched forecast payloads. Commit: `f05cea7`.
- [x] Added deterministic configured fallback outlook/current metadata for supported cities. Commit: `f05cea7`.
- [x] Reused the same supported-city config for city bootstrap and source mappings. Commit: `f05cea7`.
- [x] Repaired production and verified all 10 city dashboards have forecast data.

## Summary

Production live refresh created source-backed weather, air, and water rows, but the weather rows were observation-only. Dashboard regeneration then published empty `outlook.hourly`, empty `outlook.weekly`, null `rain_probability`, and null `weather_code`, which made the UI look empty.

The fix keeps live observed values where available and fills missing forecast/current metadata from deterministic supported-city config. Supported city rows, source mappings, and fallback dashboard defaults now live together in `lib/supported-cities.ts`, so adding another verified city is a catalog/config edit plus validation.

## Validation

- `npm test -- tests/dashboard-regeneration.test.ts tests/supported-cities.test.ts` - PASS.
- `npm test -- tests/dashboard-regeneration.test.ts tests/supported-cities.test.ts tests/ingestion-live-adapters.test.ts` - PASS.
- `npm run typecheck` - PASS.
- `npm run lint` - PASS.
- `npx prisma validate` - PASS.
- `npm test` - PASS, 120 tests.
- `npx next build` - PASS.
- `npm run postbuild` - PASS.
- `npm run build` - attempted; local `prisma migrate deploy` failed with Prisma `Schema engine error` against `localhost:5432` before `next build`.

## Production Verification

After PR 21 deployed, ran:

```bash
curl -X POST "https://weather-monitor-nl.vercel.app/api/jobs/regenerate-dashboard-snapshots?all=true&force=true" -H "Authorization: Bearer $CRON_SECRET"
```

Verified all 10 `/api/dashboard?city=<slug>` responses have:

- non-null `current.rain_probability`
- non-null `current.condition_label`
- 9 hourly outlook entries
- 7 weekly outlook entries
- live source identifiers: `knmi`, `luchtmeetnet`, `rijkswaterstaat`
