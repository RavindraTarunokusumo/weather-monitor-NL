# Insights

Record reusable lessons from completed sessions.

## 2026-05-10 - 24-Hour Outlook UI Bound

- What worked: a focused component regression test caught the visual overflow by proving the `24H` tab only renders the first 24 hourly forecast entries.
- What failed: forecast ingestion can return more than one day of hourly data, so UI chart components must bound display series explicitly instead of assuming API arrays already match the selected tab.
- Useful commands: `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`, `npm run lint`, `npm run typecheck`, `npm test`, `npx prisma validate`, `npx next build`.
- Scripts created: none.
- Workflow improvement: in worktrees without `.env`, pass a placeholder `DATABASE_URL` for Prisma schema validation and Next production compile checks.

## 2026-05-09 - Forecast Summary Trend Data Wiring

- What worked: keeping forecast/warning/trend enrichment inside ingestion jobs preserved the public dashboard as a snapshot-only read path while still exposing live API fields for every city.
- What worked: mocked provider tests covered Open-Meteo, KNMI warnings, Luchtmeetnet trends, Rijkswaterstaat trends, weekly water levels, and deterministic briefing fallback before live validation.
- What failed: the current KNMI key can read EDR observations but returns forbidden for the warnings open-data dataset, so the UI must treat warning access failures as `unknown` instead of `none`.
- Useful commands: `npm test -- tests/ingestion-live-adapters.test.ts tests/dashboard-regeneration.test.ts tests/dashboard.test.ts`, `npm run ingest:all -- --live`, `npm run dashboard:regenerate -- --all`, `npm run build`.
- Scripts created: none.
- Workflow improvement: after `npm run build`, rerun live ingestion and dashboard regeneration because the build `postbuild` seed step replaces the current local dashboard data.
- Skill worth adding or updating: adapt the repo-local `security-review` and `test-plan-writer` skills from inherited trading language to this weather-monitoring product.

## 2026-05-06 - Reference Dashboard Webpage UI

- What worked: writing failing response-shaping and component interaction tests before implementation kept the new dashboard fields, city switching, chart state, and local Q&A behavior grounded in the accepted spec.
- What failed: `npm run lint` initially traversed generated `.worktrees` output, so validation needed an ignore-pattern fix before the standard lint script was useful.
- Useful commands: `npm test -- tests/dashboard.test.ts`, `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`, `npx eslint app lib prisma tests scripts --no-error-on-unmatched-pattern`.
- Scripts created: none.
- Workflow improvement: when supplied UI assets arrive outside `public/`, copy only the needed files into a committed public asset tree and leave reference artifacts untouched unless the spec says otherwise.
- Skill worth adding or updating: adapt the repo-local `test-plan-writer` skill context from its inherited trading-domain defaults to Dutch Weather Intelligence.

## 2026-05-06 - Live Data Pipeline Wiring

- What worked: keeping public dashboard requests snapshot-only made the live API work testable with mocked provider payloads and kept source failures away from page-request latency.
- What worked: adding provider-specific fixture tests first exposed clean adapter contracts for KNMI CoverageJSON, Luchtmeetnet measurement rows, and Rijkswaterstaat WaterWebservices observations.
- What worked: direct provider probes showed KNMI EDR authentication separately from parameter validity, then exposed `R1H`/`fx` and CoverageCollection parsing requirements before code changes.
- What worked: querying the Rijkswaterstaat catalog for WATHTE-capable locations found live-observation replacements for Amsterdam and Rotterdam instead of guessing station codes.
- What failed: earlier root lint runs scanned ignored generated worktree output under `.worktrees/.../.next`; rerun full lint after dependency/worktree cleanup rather than assuming focused ESLint is enough.
- What failed: running `npm run build` while the dev server was active locked Prisma's Windows query-engine DLL; stop the dev server before local build validation on Windows.
- Useful commands: `npm test -- tests/ingestion-live-adapters.test.ts tests/ingestion-jobs.test.ts tests/dashboard-regeneration.test.ts tests/dashboard.test.ts`, `npm run ingest:all -- --live`, `npm run dashboard:regenerate -- --all`.
- Scripts created: `npm run ingest:all` and `npm run dashboard:regenerate` now route through `scripts/ingest.ts`.
- Workflow improvement: when a spec requires "live" data, keep provider API keys out of docs and use injected fetch clients so tests prove parsing without touching real services.

- What worked: API smoke checks by city caught that Rotterdam and Utrecht still had empty `weekly_levels_cm` even after Amsterdam looked correct.
- What failed: treating `riskLabel: "normal"` as enriched water metadata caused observation-only water rows to mask older rows with weekly levels and trend details.
- Useful commands: `npm run ingest:all -- --live`, `npm run dashboard:regenerate -- --all`, and city-by-city `/api/dashboard?city=<slug>` checks for forecast counts and source freshness.
- Workflow improvement: worktree dev servers need the original repo env loaded explicitly when `.env`/`.env.local` are not present in the worktree.
- Windows note: stop the Next dev server before `npm run build`; otherwise Prisma client generation can lock `query_engine-windows.dll.node`.

## 2026-05-03 - Production Bootstrap Debugging

- What worked: `vercel logs --environment production --level error --expand` exposed the real failure quickly; the app was connected to Postgres, but Prisma raised `P2021` because the production schema had never been applied.
- What failed: a healthy Vercel deployment can still serve 500s if the managed database is empty or uninitialized, so "deployment ready" is not the same as "data ready."
- Useful commands: `vercel ls`, `vercel inspect <deployment-url>`, `vercel env ls production`, `vercel env pull --environment production`, `npm run build`, `npm test`.
- Workflow improvement: for Prisma-backed Vercel apps, make the deploy path self-initializing by running `prisma migrate deploy` before app build completion and `prisma db seed` immediately after, with a direct non-pooled URL reserved for migration work.
- CI/CD recommendation: keep a fast PR gate in GitHub Actions that runs pre-commit, lint, typecheck, tests, Prisma validation, and the production build. This matches the checks described in `.pre-commit-config.yaml` and the pre-commit section in `AGENTS/CLAUDE.md`.
- CI/CD recommendation: add a separate database bootstrap job in GitHub Actions for main-branch deploy validation that starts Postgres, applies migrations, runs the seed, and then hits `/api/health` and `/api/dashboard?city=amsterdam`.
- CI/CD recommendation: keep deployment itself on Vercel Preview/Production, and let GitHub Actions own code quality plus database smoke checks. That avoids duplicating deployment logic in two places.

## 2026-05-03 - Vercel/Postgres Foundation

- What worked: isolating dashboard response shaping in `lib/dashboard.ts` made the Route Handler contract easy to test without a live database.
- What failed: Docker was unavailable on PATH again, so local Compose startup, Prisma migrate against PostgreSQL, and seed execution remain manual follow-ups in an environment with Docker.
- Useful commands: `npm test -- tests/dashboard.test.ts`, `npx prisma validate`, `npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script`.
- Scripts created: root `package.json` now owns app, Prisma, and validation commands.
- Workflow improvement: when changing the product architecture from monorepo/FastAPI to single Next.js, create a replacement accepted spec first so docs and TODOs do not point at stale implementation authority.

## 2026-05-03 - Database Schema & Seed Dashboard

- What worked: a temporary SQLite database plus Alembic upgrade in tests gave fast coverage for migration shape, repeatable seeding, route responses, and the shared Amsterdam fixture.
- What failed: Docker was unavailable on PATH, so Compose validation remained a manual follow-up.
- Useful commands: `cd apps/api && uv run pytest`, `cd apps/api && uv run ruff check .`, `cd apps/api && uv run alembic upgrade head`, `cd apps/api && uv run python -m app.jobs.seed_dev`.
- Scripts created: `infra/scripts/migrate.sh` and `infra/scripts/seed.sh` now call the implemented Alembic and seed commands.
- Workflow improvement: commit the scaffold baseline before starting dependent feature specs so Step 5 can map each TODO sub-item to its own clean commit.
- Skill worth adding or updating: the repo-local `test-plan-writer` and `security-review` skills still contain trading-specific context and should be adapted for Dutch Weather Intelligence.

## 2026-05-02 - Root Scaffold Configuration Baseline

- What worked: `uv lock`, `uv sync --locked --group dev --no-install-project`, and `pre-commit` fit cleanly into a single CI validation path for the root scaffold.
- What failed: initial pre-commit runs surfaced missing end-of-file newlines in existing tracked files, which the hook normalized automatically.
- Useful commands: `uv lock --check`, `uv run --group dev pre-commit run --all-files`.
- Scripts created: none.
- Workflow improvement: keep the CI job focused on repository-root guarantees until application code and database services exist.
- Skill worth adding or updating: a repo-specific CI checklist for uv-managed projects would reduce setup drift when the backend and frontend jobs arrive.

## 2026-05-02 - Spec-Driven Workflow

- What worked: the accepted plan translated cleanly into a per-feature spec contract under `docs/specs/`.
- What failed: none yet.
- Useful commands: `rg -n "SPEC|spec|prompt|query" AGENTS.md docs .github TODO.md`, `git diff --check`.
- Scripts created: none.
- Workflow improvement: archived session records should include the related spec path so completed work remains traceable to its accepted scope.
- Skill worth adding or updating: consider revising `brainstorming` and `writing-plans` defaults to write specs into `docs/specs/` for this repository.

## 2026-05-02 - Harness Bootstrap

- What worked: the onboarding bootstrap and product plan were enough to create project-specific harness docs before implementation started.
- What failed: hidden `.codex` and `.agents` directory creation required escalated filesystem permissions in this workspace.
- Useful commands: `rg --files`, `git status --short --branch`, `git switch -c harness-bootstrap`.
- Scripts created: none.
- Workflow improvement: keep bootstrap instructions and product plan together so harness docs can avoid generic placeholders.
- Skill worth adding or updating: copy supplied onboarding skill bodies into `.codex/skills/` only after the user explicitly approves installing those skills.
- Validation note: `git diff --check` was sufficient for the docs-only bootstrap; `ruff` and `pytest` were unavailable, and no package manifest existed for `npm` commands.

## 2026-05-02 - Install Onboarding Skills and Agents

- What worked: supplied skill packages mapped directly into `.codex/skills/`, and agent TOML configs mapped cleanly into `.agents/`.
- What failed: hidden harness directories required escalated filesystem permissions for copy operations.
- Useful commands: `find Onboarding -maxdepth 3 -type f`, `cp -R Onboarding/Skills/. .codex/skills/`, `cp Onboarding/Agents/*.toml .agents/`.
- Scripts created: none.
- Workflow improvement: after importing supplied skills, scan for source-project references before using the files operationally.
- Skill worth adding or updating: project-specific cleanup pass for imported `test-plan-writer`, `trace-inspect`, `security-review`, and `simplify` content.

## 2026-05-02 - Add Vercel Plugin Scaffold

- What worked: the bundled `plugin-creator` script created the plugin manifest and stub `.mcp.json` and `.app.json` files correctly.
- What failed: the script partially completed before hitting sandbox restrictions when creating `.agents/plugins/marketplace.json`, so the marketplace file had to be added afterward.
- Useful commands: `python3 /root/.codex/skills/.system/plugin-creator/scripts/create_basic_plugin.py --help`, `find plugins -maxdepth 4 -type f`.
- Scripts created: none.
- Workflow improvement: when scaffolding repo-local plugins in this workspace, expect hidden-path writes under `.agents/` to require escalation.
- Skill worth adding or updating: install `plugin-creator` into the repo-local skill roots if plugin scaffolding will be a recurring workflow here.
