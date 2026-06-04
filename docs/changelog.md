# Changelog

Record notable behavior, architecture, API, persistence, or workflow changes.

## 2026-06-04 - Production 10-City Refresh Bootstrap

Summary:

- What changed: the authorized `/api/jobs/refresh-live` route now ensures the accepted 10 active city rows exist before running all-source live ingestion and dashboard regeneration.
- Why: production builds intentionally skip Prisma seed, so a merged 10-city code rollout did not make the seven new cities appear in the database-backed city switcher.
- User-visible impact: after the protected refresh route runs on the deployed hotfix, `/api/cities` and the dashboard switcher can expose Amsterdam, Arnhem, Breda, Den Haag, Dordrecht, Groningen, Maastricht, Nijmegen, Rotterdam, and Utrecht with live-generated snapshots.
- Migration notes: no schema migration is required; run `POST /api/jobs/refresh-live?force=true` with `CRON_SECRET` after deployment to bootstrap rows and regenerate dashboards.
- Related spec: `docs/specs/major-dutch-cities-10.md`.

## 2026-05-28 - Major Dutch Cities 10-City Rollout

Summary:

- What changed: expanded the supported dashboard city catalog from 3 to 10 total cities with deterministic seed snapshots and explicit source mappings for Amsterdam, Arnhem, Breda, Den Haag, Dordrecht, Groningen, Maastricht, Nijmegen, Rotterdam, and Utrecht.
- Why: add reliable Dutch city coverage while avoiding unverified provincial-capital mappings.
- User-visible impact: after seeding or live refresh, `/api/cities` and the public dashboard city switcher can expose 10 supported cities.
- Migration notes: no schema migration is required; run `npx prisma db seed` for local seeded snapshots, or run live ingestion plus dashboard regeneration when provider-backed values are desired.
- Related spec: `docs/specs/major-dutch-cities-10.md`.

## 2026-05-18 - Briefing Panel Glass Overlay

Summary:

- What changed: the dashboard hero now uses the accepted glass-overlay briefing design in both the visible provided HTML shell and the typed React dashboard path, including the responsive collapsible pill, smartphone icon-only circle, and city-specific Amsterdam/Rotterdam/Utrecht hero images.
- Follow-up fix: moved the public HTML shell hero image lookup behind the async city-data loading guard so production no longer crashes to a blank white screen before dashboard data loads.
- Why: match the accepted `briefing-panel-glass-overlay` spec exactly while keeping the existing dashboard API wiring unchanged.
- User-visible impact: `/` now shows the export-matched briefing overlay behavior and typography, and the briefing trigger/expanded panel semantics are keyboard- and screen-reader-safe.
- Migration notes: no schema or API changes are required.
- Related spec: `docs/specs/briefing-panel-glass-overlay.md`.

## 2026-05-16 - Dashboard Provided HTML Data Wiring

Summary:

- What changed: the public dashboard root now renders the provided `Dutch Weather Dashboard.html` UI, with same-origin API data wiring, a compact liquid-glass briefing panel, a unified right column, and a dynamically scaled 24-hour outlook chart.
- Why: align the app with the supplied UI spec while keeping the existing normalized dashboard API as the data source.
- User-visible impact: `/` shows the provided dashboard design with live-backed values, 24 hourly bins, rain chance percentage scaling, and no duplicate Cycle Comfort metric card.
- Build behavior: local builds no longer reseed mock dashboard snapshots unless `RUN_DB_SEED_AFTER_BUILD=true` is set.
- Migration notes: no schema migration is required; refresh local snapshots with `npm run ingest:all -- --live` and `npm run dashboard:regenerate -- --all` when live API values are desired.
- Related spec: `docs/specs/dashboard-ui-liquid-glass-panel-polish.md`.

## 2026-05-12 - Vercel Preview Seed Guard

Summary:

- What changed: Vercel deployments now skip `prisma db seed` whenever the Vercel system environment flag is present, not only when `VERCEL_ENV=production`.
- Why: preview deployments may share the same dashboard database as production; allowing preview builds to seed mock dashboard snapshots made production show fresh `mock_*` data after PR deploys.
- User-visible impact: Vercel preview and production deploys should no longer overwrite live dashboard snapshots with seeded mock snapshots.
- Migration notes: local and GitHub smoke builds without `VERCEL=1` still seed isolated databases as before.
- Related spec: `docs/specs/production-live-refresh-guardrails.md`.

## 2026-05-12 - UI Overhaul Design Handoff

Summary:

- What changed: refit the public dashboard to the accepted Dutch Weather Intelligence handoff with a compact sticky nav, redesigned briefing hero, compact metric strip, metric-switching 24-hour SVG chart, reordered detail panels, redesigned ask-dashboard panel, and bordered source freshness footer.
- Layout note: the compact handoff spacing remains the baseline at 1220px and 1440px widths, but the large-desktop frame expands beyond 1220px so the production screenshot can match the supplied concept image proportions.
- Why: make the production dashboard visually match the supplied handoff while preserving the existing normalized dashboard API, SSR entry path, and grounded local Q&A behavior.
- User-visible impact: `/` now renders the handoff-aligned dashboard layout and supports Rain, Temp, and Wind chart modes, improved responsive behavior, and concept-verified desktop presentation.
- Migration notes: no schema migration is required; local production build validation should stop active `next` servers first on Windows to avoid Prisma query-engine DLL locks.
- Related spec: `docs/specs/ui-overhaul-design-handoff.md`.

## 2026-05-11 - Production Live Data Guardrails

Summary:

- What changed: production Vercel builds now skip `prisma db seed`, and production job routes require bearer authorization even when `CRON_SECRET` is not configured.
- Why: prevent deployments or unauthenticated job calls from making seeded mock dashboard snapshots newer than live-regenerated snapshots.
- User-visible impact: after production secrets are configured and live ingestion/regeneration runs, future deploys should not overwrite the latest live dashboard with mock source labels.
- Migration notes: configure `CRON_SECRET` and `KNMI_API_KEY` in Vercel production, then run live ingestion and dashboard regeneration after the guarded deployment is live.
- Related spec: `docs/specs/api-wiring-live-data-pipeline.md`.

## 2026-05-09 - Forecast Summary and Trend Data Wiring

Summary:

- What changed: accepted the forecast summary/trend wiring spec, enriched live KNMI weather snapshots with Open-Meteo forecast outlooks and official KNMI warning data, derived Luchtmeetnet air trends, derived Rijkswaterstaat water trends and weekly levels, and regenerated dashboard summaries/outlooks from stored snapshot metadata.
- Why: fill the highest-value live data gaps before further UI design work, especially empty outlook panels, null briefing summary fields, unknown source trends, and missing warning/condition labels.
- User-visible impact: after live ingestion and dashboard regeneration, `/api/dashboard?city=<slug>` can return hourly/weekly outlook data, deterministic briefing fallback text, UI summary fields, weather condition/warning labels, air trend, water trend, and weekly water levels for Amsterdam, Utrecht, and Rotterdam.
- Migration notes: no schema migration is required; new compact provider metadata is stored in existing `sourcePayload` JSON columns. Weather live ingestion needs `KNMI_API_KEY`; optional override variables are `OPEN_METEO_API_BASE_URL` and `KNMI_OPEN_DATA_API_BASE_URL`.
- Related spec: `docs/specs/forecast-summary-trend-data-wiring.md`.

## 2026-05-06 - Reference Dashboard Webpage UI

Summary:

- What changed: upgraded the public dashboard page to a reference-aligned UI with a briefing hero, metric strip, outlook views, city selector, local ask-dashboard panel, air-quality detail, water signal detail, cycle comfort, and source freshness footer.
- Why: make the first public webpage feel like a complete Dutch Weather Intelligence dashboard while staying grounded in same-app normalized data.
- User-visible impact: `http://localhost:3000` now renders the polished dashboard shell and can switch among seeded Amsterdam, Utrecht, and Rotterdam dashboard snapshots.
- Migration notes: run Prisma migration and seed commands so all three city dashboards exist locally; the browser still calls only same-app API routes.
- Related spec: `docs/specs/reference-dashboard-webpage-ui.md`.

## 2026-05-06 - Live Data Pipeline Wiring

Summary:

- What changed: added live-capable KNMI, Luchtmeetnet, and Rijkswaterstaat ingestion adapters, explicit source configuration for Amsterdam/Utrecht/Rotterdam, shared ingestion jobs, all-source refresh command, dashboard snapshot regeneration, and source status metadata in `/api/dashboard`.
- Follow-up fix: corrected KNMI EDR live requests to use supported `ta`, `ff`, `dd`, `fx`, and `R1H` parameters with CoverageCollection normalization, and corrected Rijkswaterstaat live requests to use `OphalenWaarnemingen` with current WATHTE locations for Amsterdam and Rotterdam.
- Why: make the skeleton dashboard capable of showing latest stored source-backed weather, air-quality, and water signals without request-time external API calls.
- User-visible impact: the public page can select Amsterdam, Utrecht, or Rotterdam and display stored live-backed values plus freshness/stale/missing source states after ingestion and regeneration commands run.
- Migration notes: add server-only `KNMI_API_KEY` and `CRON_SECRET` to local/production environments; run `npm run ingest:all -- --live` followed by `npm run dashboard:regenerate -- --all` to refresh all seeded cities.
- Related spec: `docs/specs/api-wiring-live-data-pipeline.md`.

## 2026-05-04 - Public Dashboard UI Shell

Summary:

- What changed: replaced the bare server-rendered homepage with a full dashboard UI shell — sticky navy nav, city selector, auto-refresh, and per-domain display cards.
- Why: deliver the first account-agnostic public dashboard that renders seeded backend data in a Dutch-inspired interface per `docs/specs/public-dashboard-ui-shell.md`.
- User-visible impact: `http://localhost:3000` now shows a styled dashboard with briefing, current weather, cycle comfort, air quality, water signal, and source freshness cards; the city selector and 30-second auto-poll are functional.
- Architecture notes: `app/page.tsx` is a pure SSR shell that passes initial data to `LiveDashboard` (a `'use client'` component). All display cards are pure components. Shared types live in `lib/types/dashboard.ts`; client fetch helpers in `lib/api/dashboard-client.ts`; formatting utilities in `lib/utils/format.ts`.
- Migration notes: set `NEXT_PUBLIC_APP_NAME=Dutch Weather Intelligence` in your local `.env.local` for the nav title to render correctly.
- Related spec: `docs/specs/public-dashboard-ui-shell.md`.

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
