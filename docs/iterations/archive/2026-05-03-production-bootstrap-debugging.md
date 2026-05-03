# Production Bootstrap Debugging - 2026-05-03

Completed session archived from `TODO.md`.

Spec: `docs/specs/project-scaffold-vercel-postgres-foundation.md`

- [x] Diagnose the failing Vercel production deployment and identify the missing database bootstrap step. Commit: `e74b20d`
- [x] Make production deploys run Prisma migration and seed data during build. Commit: `e74b20d`
- [x] Update spec and task log to describe the Vercel bootstrap behavior. Commit: `1e4d903`

Validation:

- `vercel logs --environment production --level error --expand` identified Prisma `P2021` errors from the production deployment.
- `npm run build` passed locally against the Docker-backed PostgreSQL database.
- `npm test` passed.

Notes:

- The production database was connected but uninitialized; the schema migration had not been applied.
- The fix is build-time database initialization, not a frontend or API route change.
