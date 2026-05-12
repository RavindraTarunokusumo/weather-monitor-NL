# Vercel Preview Seed Guard — 2026-05-12

Completed session archived from `TODO.md`.

Spec: `docs/specs/production-live-refresh-guardrails.md`

## Completed tasks

- [x] Prevented Vercel preview deployments from running the local Prisma seed step against shared dashboard databases. Commit: `1ba1ca5`

## Validation

- `npm test -- tests/postbuild.test.ts` — PASS.
- `npm run lint` — PASS.
- `npm run typecheck` — PASS.
- `npm test` — PASS, 11 files and 89 tests.
- `VERCEL=1 VERCEL_ENV=preview npm run build` — PASS after clearing generated `.next`; postbuild printed `Skipping Prisma seed after build: VERCEL=1`.

## Notes

- The production check after PR #11 merge showed fresh `mock_*` snapshots again. The likely source was Vercel preview deployment seeding against a shared dashboard database because the old guard skipped only `VERCEL_ENV=production`.
