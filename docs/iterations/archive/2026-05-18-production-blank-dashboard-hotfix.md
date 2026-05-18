# Production Blank Dashboard Hotfix - 2026-05-18

Completed session archived from `TODO.md`.

Spec: `docs/specs/briefing-panel-glass-overlay.md`

PR: `https://github.com/RavindraTarunokusumo/weather-monitor-NL/pull/15`

## Completed tasks

- [x] Move the public dashboard shell hero image lookup behind the `city` loading guard so production does not crash before dashboard data loads. Commit: `cedf22b`.
- [x] Add a contract test covering the loading guard order for the public HTML shell. Commit: `cedf22b`.
- [x] Validate locally and verify production renders after deployment. Commits: `cedf22b`, `e1ef08d`.

## Validation

- `npm test -- tests/dashboard.test.ts` - PASS.
- `npm run lint` - PASS.
- `npm run typecheck` - PASS.
- `npm run build` with local PostgreSQL `DATABASE_URL` - PASS.
- Headless browser check against local `next start --port 3002` - PASS: iframe rendered and no `city.slug` page error was emitted.
- Production headless browser check against `https://weather-monitor-nl.vercel.app/` after merge - PASS: iframe rendered dashboard content and no page errors were emitted.

## Notes

- Root cause: `cityData` starts as `null`, but `heroImageSrc` read `city.slug` before the existing loading guard.
- Production deployment verified: `weather-monitor-lf502nis5-ravindratarunokusumos-projects.vercel.app`, aliased to `https://weather-monitor-nl.vercel.app`.
