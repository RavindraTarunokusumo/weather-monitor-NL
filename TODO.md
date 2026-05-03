# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.

## Active Session

- [ ] Add GitHub Actions pipelines for quality gates and seeded database bootstrap smoke tests.
  - [ ] Replace the stale Python-oriented CI workflow with Node/Prisma checks that match the Next.js app.
  - [ ] Add a PostgreSQL-backed smoke pipeline that runs the Prisma migration, seed, and API endpoint verification.
