# 2026-06-04 - Production 10-City Refresh Bootstrap

Spec: `docs/specs/major-dutch-cities-10.md`

## Completed

- [x] Covered the refresh route bootstrap sequence with a regression test. Commit: `3990007`.
- [x] Implemented a focused supported-city bootstrap helper. Commit: `3990007`.
- [x] Updated docs for the protected production refresh behavior. Commit: `3990007`.
- [x] Ran validation and prepared the hotfix PR.

## Summary

Production still showed only Amsterdam, Rotterdam, and Utrecht because `/api/cities` is database-backed and Vercel builds intentionally skip Prisma seed. The hotfix makes the authorized `/api/jobs/refresh-live` route upsert the accepted 10 active city rows before running live ingestion and dashboard regeneration.

## Validation

- `npm test -- tests/production-refresh.test.ts tests/supported-cities.test.ts` - PASS.
- `npm run lint` - PASS.
- `npm run typecheck` - PASS.
- `npx prisma validate` - PASS.
- `npm test` - PASS, 118 tests.
- `npx next build` - PASS.
- `npm run postbuild` - PASS.
- `npm run build` - attempted; local `prisma migrate deploy` failed with Prisma `Schema engine error` against `localhost:5432` before `next build`.

## Notes

- No schema migration is required.
- The production repair still requires running the protected refresh route after the hotfix deploy is live so the new rows and snapshots are created in production.
