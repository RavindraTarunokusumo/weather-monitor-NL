# API Wiring & Live Data Pipeline Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the accepted job-driven live data pipeline so Amsterdam, Utrecht, and Rotterdam dashboards read latest stored source-backed snapshots.

**Architecture:** Keep external source calls behind server-side ingestion adapters. Store normalized source snapshots first, then regenerate dashboard snapshots from latest stored records; public page/API requests read only dashboard snapshots. Use dependency-injected fetch clients and fixtures so automated tests never hit real providers.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, Vitest, server-side `fetch`, existing `scripts/ingest.ts` and `app/api/jobs/*` routes.

---

## File Structure

- `lib/ingestion/source-config.ts`: per-city station/location configuration and source freshness thresholds.
- `lib/ingestion/http.ts`: small safe JSON fetch helper with timeout/status handling and secret-safe errors.
- `lib/ingestion/knmi.ts`: KNMI live adapter plus mock mode.
- `lib/ingestion/luchtmeetnet.ts`: Luchtmeetnet live adapter plus mock mode.
- `lib/ingestion/rijkswaterstaat.ts`: Rijkswaterstaat live adapter plus mock mode.
- `lib/ingestion/run.ts`: source-run metadata improvements if needed.
- `lib/ingestion/jobs.ts`: shared ingestion orchestration for one city, all cities, and protected route reuse.
- `lib/dashboard-regeneration.ts`: latest-snapshot loading, deterministic summary/comfort calculation, idempotent dashboard snapshot creation.
- `lib/dashboard.ts`: public dashboard response shaping with source status metadata.
- `app/api/jobs/*/route.ts`: protected route handlers using shared job helpers.
- `scripts/ingest.ts`: CLI support for `--live`, `--all`, and regeneration commands where practical.
- `app/page.tsx`: seeded city selection wiring and source status rendering.
- `tests/*.test.ts`: failing tests first for each behavior slice.
- `docs/commands.md`, `docs/database.md`, `docs/changelog.md`: operational documentation updates.
- `TODO.md`: active session tracking for spec-derived sub-items and commit hashes.

## Task 1: Source Configuration And Live Adapter Contracts

**Files:**
- Create: `lib/ingestion/source-config.ts`
- Create: `lib/ingestion/http.ts`
- Modify: `lib/ingestion/base.ts`
- Modify: `lib/ingestion/knmi.ts`
- Modify: `lib/ingestion/luchtmeetnet.ts`
- Modify: `lib/ingestion/rijkswaterstaat.ts`
- Test: `tests/ingestion-live-adapters.test.ts`

- [ ] **Step 1: Write failing adapter/config tests**

Create tests that assert all seeded cities have source config, adapter source names switch between `mock_*` and live provider names, and fixture live payloads normalize into existing snapshot types without network calls.

Run: `npm test -- tests/ingestion-live-adapters.test.ts`
Expected: FAIL because the config module and live adapter options do not exist yet.

- [ ] **Step 2: Implement minimal source config and HTTP helper**

Add explicit Amsterdam, Utrecht, and Rotterdam source config with documented station/location placeholders chosen during implementation discovery. Add a fetch helper that accepts injected `fetch`, rejects non-2xx responses with safe messages, and never includes request headers in thrown errors.

- [ ] **Step 3: Implement live-capable adapters**

Extend each adapter constructor to accept `{ mode, fetcher, apiKey, baseUrl }`. Keep default behavior compatible with current mock tests. Live mode maps fixture-shaped provider responses into `NormalizedWeatherRecord`, `NormalizedAirQualityRecord`, and `NormalizedWaterRecord`.

- [ ] **Step 4: Verify task tests and existing ingestion tests**

Run: `npm test -- tests/ingestion-live-adapters.test.ts tests/ingestion.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit task**

Stage only the files listed in this task and commit with a spec-referencing git note.

## Task 2: Shared Ingestion Job Orchestration And Protected Routes

**Files:**
- Create: `lib/ingestion/jobs.ts`
- Modify: `scripts/ingest.ts`
- Modify: `app/api/jobs/ingest-weather/route.ts`
- Modify: `app/api/jobs/ingest-air-quality/route.ts`
- Modify: `app/api/jobs/ingest-water/route.ts`
- Test: `tests/ingestion-jobs.test.ts`

- [ ] **Step 1: Write failing job orchestration tests**

Tests should cover one-city ingestion, all-active-city ingestion, live-vs-mock mode selection, inactive-city rejection, and protected route authorization behavior.

Run: `npm test -- tests/ingestion-jobs.test.ts`
Expected: FAIL because shared orchestration does not exist yet.

- [ ] **Step 2: Implement shared ingestion functions**

Create reusable functions for `runWeatherIngestion`, `runAirQualityIngestion`, `runWaterIngestion`, and `runAllIngestion`. Each function loads `City`, builds `CityConfig`, creates the correct adapter, and stores normalized records through Prisma.

- [ ] **Step 3: Wire routes and CLI**

Routes must reject live execution without a valid bearer token matching `CRON_SECRET`. CLI must support `--live`, `--mock`, `--city <slug>`, and `--all`.

- [ ] **Step 4: Verify task tests**

Run: `npm test -- tests/ingestion-jobs.test.ts tests/ingestion.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit task**

Stage only task files and commit with a spec-referencing git note.

## Task 3: Dashboard Snapshot Regeneration

**Files:**
- Create: `lib/dashboard-regeneration.ts`
- Modify: `app/api/jobs/regenerate-dashboard-snapshots/route.ts`
- Modify: `scripts/ingest.ts`
- Test: `tests/dashboard-regeneration.test.ts`

- [ ] **Step 1: Write failing dashboard regeneration tests**

Tests should cover complete source data, one missing source, stale source metadata, deterministic state hashes, and idempotent no-op behavior when latest source IDs are unchanged.

Run: `npm test -- tests/dashboard-regeneration.test.ts`
Expected: FAIL because regeneration helper does not exist and the route returns `501`.

- [ ] **Step 2: Implement deterministic summary and state hashing**

Load latest snapshots per city, compute cycle comfort from normalized weather/air data, attach missing/stale metadata, and generate a stable hash from linked source snapshot IDs and derived summary.

- [ ] **Step 3: Implement route and CLI regeneration entrypoint**

Support one city and all active cities. Protect route execution with the same job authorization helper used by ingestion.

- [ ] **Step 4: Verify task tests**

Run: `npm test -- tests/dashboard-regeneration.test.ts tests/dashboard.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit task**

Stage only task files and commit with a spec-referencing git note.

## Task 4: Public Dashboard API And UI Wiring

**Files:**
- Modify: `lib/dashboard.ts`
- Modify: `app/api/dashboard/route.ts`
- Modify: `app/page.tsx`
- Modify: `app/globals.css`
- Test: `tests/dashboard.test.ts`

- [ ] **Step 1: Write failing public response tests**

Extend dashboard tests to assert source freshness includes `observed_at`, `status`, and `detail`, and that missing source records are represented explicitly.

Run: `npm test -- tests/dashboard.test.ts`
Expected: FAIL until response shaping is extended.

- [ ] **Step 2: Extend API response shaping**

Preserve existing keys while adding source status metadata and stale/missing detail from `summaryPayload`.

- [ ] **Step 3: Wire city selection UI**

Render links or a selector for Amsterdam, Utrecht, and Rotterdam using `city` search params, fetch the selected city server-side, and display source status without client-side external calls.

- [ ] **Step 4: Verify task tests**

Run: `npm test -- tests/dashboard.test.ts`
Expected: PASS.

- [ ] **Step 5: Commit task**

Stage only task files and commit with a spec-referencing git note.

## Task 5: Documentation, Validation, And Pre-PR Checks

**Files:**
- Modify: `docs/commands.md`
- Modify: `docs/database.md`
- Modify: `docs/changelog.md`
- Modify: `docs/insights.md`
- Modify: `TODO.md`

- [ ] **Step 1: Update operational docs**

Document server-only environment variables, local live ingestion commands, dashboard regeneration commands, and manual verification steps. Do not record real API keys.

- [ ] **Step 2: Run simplification and required validations**

Run focused tests first, then:

```bash
npm run typecheck
npm test
npx prisma validate
npm run lint
```

Record any pre-existing tooling failures clearly.

- [ ] **Step 3: Run security review if source/network changes are present**

Because this implementation touches external network calls and secrets, run the `security-review` skill before PR preparation.

- [ ] **Step 4: Commit docs and TODO updates**

Stage only docs/TODO files and commit with a spec-referencing git note.

## Self-Review

- Spec coverage: Tasks cover all accepted spec areas: source config, live adapters, ingestion jobs, protected routes, dashboard regeneration, public API response, UI city selection, documentation, tests, and validation.
- Scope check: AI briefing regeneration, production scheduler provisioning, new cities, and request-time external source calls are excluded.
- Placeholder scan: This plan contains no implementation placeholders. Station/location IDs must be chosen during Task 1 source discovery and documented in `source-config.ts`.
- Type consistency: The plan uses existing `CityConfig`, normalized record types, Prisma snapshot models, and `summaryPayload` conventions.
