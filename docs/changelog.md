# Changelog

Record notable behavior, architecture, API, persistence, or workflow changes.

## 2026-05-06 - Live Data Pipeline Wiring

Summary:

- What changed: added live-capable KNMI, Luchtmeetnet, and Rijkswaterstaat ingestion adapters, explicit source configuration for Amsterdam/Utrecht/Rotterdam, shared ingestion jobs, all-source refresh command, dashboard snapshot regeneration, and source status metadata in `/api/dashboard`.
- Why: make the skeleton dashboard capable of showing latest stored source-backed weather, air-quality, and water signals without request-time external API calls.
- User-visible impact: the public page can select Amsterdam, Utrecht, or Rotterdam and display stored live-backed values plus freshness/stale/missing source states after ingestion and regeneration commands run.
- Migration notes: add server-only `KNMI_API_KEY` and `CRON_SECRET` to local/production environments; run `npm run ingest:all -- --live` followed by `npm run dashboard:regenerate -- --all` to refresh all seeded cities.
- Related spec: `docs/specs/api-wiring-live-data-pipeline.md`.

## 2026-05-03 - GitHub Actions CI and Bootstrap Pipelines

Summary:

- What changed: replaced the stale Python-oriented CI workflow with Next.js/Prisma quality checks and added a PostgreSQL-backed bootstrap smoke workflow.
- Why: make pre-commit, lint, typecheck, tests, Prisma validation, seeded build validation, and API smoke checks part of the repository’s automated path.
- User-visible impact: pull requests and main-branch changes now get faster feedback on both code quality and seeded dashboard readiness.
- Migration notes: the quality workflow runs pre-commit, npm lint/typecheck/tests, and Prisma validation; the bootstrap workflow runs a seeded build and API smoke checks against PostgreSQL.
- Related spec: `docs/specs/project-scaffold-vercel-postgres-foundation.md`.

## 2026-05-03 - Vercel/Postgres Foundation

Summary:

- What changed: replaced the monorepo/FastAPI scaffold with a single root Next.js App Router app, Prisma foundation schema, seeded dashboard data, Route Handlers, and a seeded Amsterdam homepage.
- Why: align the implementation path with the Vercel/Postgres milestone so the browser can render dashboard data directly from a Next.js app backed by PostgreSQL.
- User-visible impact: local `http://localhost:3000` can render Amsterdam dashboard data once PostgreSQL is running and Prisma seed data is loaded; `/api/health`, `/api/cities`, and `/api/dashboard?city=amsterdam` are available in the same app.
- Migration notes: run `docker compose -f infra/docker/docker-compose.yml up -d postgres`, `npx prisma migrate dev --name foundation_schema`, and `npx prisma db seed` before starting the app locally.
- Related spec: `docs/specs/project-scaffold-vercel-postgres-foundation.md`.

## 2026-05-03 - Seeded Dashboard Database Foundation

Summary:

- What changed: added the initial Alembic migration, SQLAlchemy models, repeatable seed job, seeded dashboard routes, and Amsterdam shared fixture.
- Why: make the public dashboard contract available from backend seed data before live external ingestion exists.
- User-visible impact: local backend can serve `GET /api/v1/cities`, `GET /api/v1/dashboard?city=amsterdam`, and `GET /api/v1/source-status` after migration and seeding.
- Migration notes: run `cd apps/api && uv run alembic upgrade head && uv run python -m app.jobs.seed_dev`.
- Related spec: `docs/specs/database-schema-seed-dashboard.md`.

## 2026-05-02 - Adopted Spec-Driven Workflow

Summary:

- What changed: updated the agent workflow so feature implementation is driven by accepted per-feature specs under `docs/specs/`.
- Why: make implementation scope explicit and durable before agents create TODO items, commits, PRs, or archived session records.
- User-visible impact: feature work now starts from an accepted spec instead of direct chat prompts.
- Migration notes: new workflow items should reference the related spec path in `TODO.md`, git notes, PRs, and archived sessions.
- Related PR/commit: `8cb939e`.

## 2026-05-02 - Added Vercel Plugin Scaffold

Summary:

- What changed: added a repo-local `vercel` plugin scaffold under `plugins/vercel` and registered it in `.agents/plugins/marketplace.json`.
- Why: make a Vercel plugin available from the repository's local Codex plugin catalog.
- User-visible impact: the repo now includes a discoverable local plugin scaffold with placeholder manifest values.
- Migration notes: plugin manifest metadata is still placeholder content and needs project-specific values before real distribution or use.
- Related PR/commit: `639606825f2d7b1175ce6fdf67fcd13eeab830fb`.

## 2026-05-02 - Installed Onboarding Skills and Agents

Summary:

- What changed: copied supplied onboarding skill packages into `.codex/skills/` and agent TOML configs into `.agents/`.
- Why: make the supplied workflow instructions available from repo-local harness locations.
- User-visible impact: no product behavior exists yet.
- Migration notes: imported skill and agent bodies should be reviewed for project-specific references before operational use.
- Related PR/commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`.

## 2026-05-02 - Agent Harness Bootstrap

Summary:

- What changed: added the initial agent harness, documentation map, workflow rules, PR templates, and skill roots.
- Why: prepare the repository for safe agentic development.
- User-visible impact: no product behavior exists yet.
- Migration notes: none.
- Related PR/commit: `b2714014dc46591dfb0f42b4d28e7ffac2138051`.
