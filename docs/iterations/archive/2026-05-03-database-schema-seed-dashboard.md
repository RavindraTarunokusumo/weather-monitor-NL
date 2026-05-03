# Database Schema & Seed Dashboard - 2026-05-03

Completed session archived from `TODO.md`.

Spec: `docs/specs/database-schema-seed-dashboard.md`

- [x] Add SQLAlchemy and Alembic foundation for `cities`, `source_runs`, `weather_snapshots`, `air_quality_snapshots`, `water_snapshots`, and `dashboard_snapshots`. Commit: `f238205d16f67f9f5a8d7f3d0f759f7b2b40eacc`
- [x] Add repeatable seed flow for Amsterdam, Utrecht, and Rotterdam plus realistic mock dashboard data for Amsterdam. Commit: `f238205d16f67f9f5a8d7f3d0f759f7b2b40eacc`
- [x] Add `GET /api/v1/cities`, `GET /api/v1/dashboard`, and `GET /api/v1/source-status` backed by seeded snapshot data. Commit: `f238205d16f67f9f5a8d7f3d0f759f7b2b40eacc`
- [x] Add backend tests, migration checks, and shared fixture coverage for the seeded dashboard contract. Commit: `f238205d16f67f9f5a8d7f3d0f759f7b2b40eacc`

Validation:

- `uv run pytest` passed in `apps/api`.
- `uv run ruff check .` passed in `apps/api`.
- `uv run ruff format --check .` passed in `apps/api`.
- `npm run lint` passed in `apps/web`.
- `npm test` passed in `apps/web`.
- `bash -n infra/scripts/dev.sh`, `bash -n infra/scripts/migrate.sh`, and `bash -n infra/scripts/seed.sh` passed.
- `git diff --check` passed.
- `docker compose -f infra/docker/docker-compose.yml config` could not be run because `docker` was not installed on the PATH.

Notes:

- The scaffold prerequisite was committed first because the completed scaffold files were still uncommitted when this database session began.
- The database implementation sub-items share one integration commit because the uncommitted scaffold baseline made the backend package, migration tests, seed flow, and routes tightly coupled in the worktree.
