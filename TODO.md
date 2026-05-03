# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.

## Active Session

- [ ] Repair production bootstrap so Vercel deploys create the Prisma schema and seed the Amsterdam dashboard data.
  - [ ] Configure Prisma migrations to use the managed database's direct connection URL when available.
  - [ ] Make the foundation seed repeat-safe across repeated deploys.
  - [ ] Run migration and seed as part of the Vercel build pipeline so a fresh production database becomes usable on first deploy.
