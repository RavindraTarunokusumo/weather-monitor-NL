# API Wiring & Live Data Pipeline Spec

Status: Draft
Spec path: `docs/specs/api-wiring-live-data-pipeline.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Wire the existing dashboard skeleton to real, source-backed environmental data for all seeded cities: Amsterdam, Utrecht, and Rotterdam.

The public site must continue to load data through the same-app dashboard API, but the displayed weather, air-quality, and water signals should come from the latest stored snapshots produced by server-side ingestion jobs instead of seeded mock records.

## Scope

This spec includes:

- Live KNMI weather ingestion for all active seeded cities.
- Live Luchtmeetnet air-quality ingestion for all active seeded cities.
- Live Rijkswaterstaat water-level ingestion for all active seeded cities.
- Per-city source configuration for Amsterdam, Utrecht, and Rotterdam.
- Server-only source clients and adapter implementations.
- Persistence of normalized `WeatherSnapshot`, `AirQualitySnapshot`, and `WaterSnapshot` records.
- `SourceRun` tracking for successful and failed source jobs.
- Dashboard snapshot regeneration from the latest stored source snapshots.
- Public dashboard API wiring so `/api/dashboard?city=<slug>` returns the latest generated dashboard snapshot for each city.
- Homepage/city selection wiring needed for the skeleton site to show live-backed data for the seeded cities.
- Freshness, stale-data, missing-data, and source-failure states in the dashboard response and UI.
- Local CLI/manual job commands for fetching and regenerating data during development.
- Protected job route behavior suitable for later scheduler calls.
- Tests with mocked external source responses.
- Documentation updates for environment variables, ingestion commands, and manual verification.

Required source coverage:

```text
amsterdam
utrecht
rotterdam
```

Required source categories:

```text
weather: KNMI
air_quality: Luchtmeetnet / RIVM
water: Rijkswaterstaat Waterdata / WaterWebservices
```

## Non-Goals

The following are intentionally out of scope:

- Request-time external source calls from `/`, `/api/dashboard`, or client-side browser code.
- Adding cities beyond Amsterdam, Utrecht, and Rotterdam.
- User accounts, saved locations, or user-specific preferences.
- AI briefing regeneration.
- Real AI Q&A changes.
- Production scheduler provisioning.
- Push notifications.
- Live maps.
- Climate scenario ingestion.
- NetCDF/GRIB-heavy forecast processing beyond the selected near-real-time weather dataset.
- Official severe-weather warning behavior unless a concrete KNMI warning source is selected and normalized in this spec's implementation.
- Retrying through a durable queue.
- Backfilling historical time series.

## Acceptance Criteria

- `/` and `/api/dashboard?city=<slug>` can show live-backed dashboard data for Amsterdam, Utrecht, and Rotterdam after running documented ingestion and dashboard regeneration commands.
- The public dashboard reads only stored `DashboardSnapshot` data and never calls KNMI, Luchtmeetnet, or Rijkswaterstaat during a page/API request.
- Source adapters use real external source clients when live mode is enabled.
- Mock/test mode remains available and is the default for automated tests.
- External source calls happen server-side only.
- Source API keys and secrets are read only from server-side environment variables and are never exposed in browser bundles or public JSON responses.
- Each live ingestion job creates or updates a `SourceRun` with `status`, `startedAt`, `finishedAt`, `recordsFetched`, `recordsStored`, and useful failure metadata.
- Failed ingestion for one source or city does not delete the last good source snapshot or dashboard snapshot.
- Dashboard regeneration links the latest available source snapshots per city.
- Dashboard regeneration records missing or stale source states explicitly in `summaryPayload` and public response fields rather than inventing measurements.
- The UI clearly shows source freshness for weather, air quality, and water for the selected city.
- The UI renders a clear unavailable/stale state when one source is missing while still showing available sources.
- KNMI, Luchtmeetnet, and Rijkswaterstaat source names in persisted live snapshots are distinguishable from existing `mock_*` seed data.
- All external HTTP calls are mocked in automated tests.
- Documentation explains required environment variables, source configuration, and local commands.

## Constraints

- Use the existing single Next.js App Router application.
- Use TypeScript.
- Use Prisma/PostgreSQL persistence.
- Keep source-specific parsing isolated in `lib/ingestion/*` modules.
- Keep business calculations outside UI components.
- Do not calculate official scores in the frontend.
- Do not write raw source responses directly to public API response shapes.
- Do not log API keys, authorization headers, full secret-bearing URLs, or raw error objects that may contain secrets.
- Use stable city slugs as public identifiers.
- Prefer configured source station IDs over implicit nearest-station guesses in runtime code.
- Normalize units and timestamps once in adapter/service code.
- Preserve source freshness and missing-data reasons through dashboard response shaping.
- Store enough `sourcePayload` metadata for debugging without exposing it publicly by default.
- Keep seeded mock data usable for local fallback and tests.
- Use protected job routes for network-side ingestion calls; require `CRON_SECRET` or equivalent server-only authorization before live job routes run.
- Keep public dashboard latency independent from source-provider latency.

## Implementation Notes

### Current Repo Seams

The implementation should extend the existing seams rather than creating a parallel pipeline:

```text
lib/ingestion/base.ts
lib/ingestion/knmi.ts
lib/ingestion/luchtmeetnet.ts
lib/ingestion/rijkswaterstaat.ts
lib/ingestion/run.ts
scripts/ingest.ts
app/api/jobs/ingest-weather/route.ts
app/api/jobs/ingest-air-quality/route.ts
app/api/jobs/ingest-water/route.ts
app/api/jobs/regenerate-dashboard-snapshots/route.ts
lib/dashboard.ts
app/api/dashboard/route.ts
app/page.tsx
prisma/schema.prisma
```

### Source Selection

Implementation should verify endpoint details against current official docs at implementation time, but the intended sources are:

- KNMI: the KNMI Data Platform APIs, preferring the current `10-minute-in-situ-meteorological-observations` EDR/Open Data path over the deprecated `Actuele10mindataKNMIstations` dataset.
- Luchtmeetnet: the official Luchtmeetnet/RIVM API or dataset source for latest station pollutant measurements.
- Rijkswaterstaat: the new `ddapi20-waterwebservices.rijkswaterstaat.nl` WaterWebservices endpoints for water-level observations, not the deprecated classic `waterwebservices.rijkswaterstaat.nl` path.

Reference URLs:

```text
https://developer.dataplatform.knmi.nl/open-data-api
https://english.knmidata.nl/open-data/10-minute-in-situ-meteorological-observations
https://api-docs.luchtmeetnet.nl/
https://data.rivm.nl/data/luchtmeetnet/
https://rijkswaterstaatdata.nl/waterdata/
```

### City Source Configuration

Add explicit per-city source configuration in a server-side module or data file, for example:

```typescript
type CitySourceConfig = {
  citySlug: "amsterdam" | "utrecht" | "rotterdam";
  knmi: {
    stationId: string;
  };
  luchtmeetnet: {
    stationId: string;
    components: Array<"pm25" | "pm10" | "no2" | "o3" | "so2">;
  };
  rijkswaterstaat: {
    locationCode: string;
    measurementCode: "WATHTE";
  };
};
```

Station/location IDs must be chosen from source metadata during implementation and documented near the config. If a city has no suitable direct station, choose a representative nearby official station and record the reason.

### Live vs Mock Mode

Adapters should support both live and mock/test operation without making tests depend on the network.

Recommended shape:

```typescript
type AdapterMode = "mock" | "live";
```

Live mode should be used only by explicit CLI flags or protected job routes. Test mode should inject fetch/client stubs.

### Pipeline Flow

Recommended full local refresh flow:

```text
For each active seeded city:
  run weather ingestion
  run air-quality ingestion
  run water ingestion
  regenerate dashboard snapshot
```

Recommended source job flow:

```text
Create SourceRun(status="running")
  fetch source records
  normalize records
  store normalized snapshots
  update SourceRun(status="success")
```

Failure flow:

```text
Create SourceRun(status="running")
  source/client/store error occurs
  update SourceRun(status="failed", errorMessage=<safe message>)
  preserve existing snapshots
  return structured failure result
```

### Dashboard Regeneration

Implement `app/api/jobs/regenerate-dashboard-snapshots/route.ts` and a shared server-side regeneration helper.

The helper should:

- Accept one city slug or all active seeded cities.
- Load latest stored snapshots for each source category.
- Compute deterministic dashboard fields from available source data.
- Create a new `DashboardSnapshot`.
- Include missing/stale source metadata in `summaryPayload`.
- Avoid creating duplicate snapshots when source IDs and derived state have not changed, unless explicitly forced.

Cycle comfort can use a simple deterministic first pass based on available normalized fields:

- temperature and feels-like range
- rain amount/probability when available
- wind speed and gusts
- air-quality category
- water-risk label as informational context, not a primary comfort driver

If a field is unavailable, score logic must use explicit missing-data handling and record the reason.

### Public Dashboard API

`/api/dashboard?city=<slug>` should continue to return the latest generated dashboard snapshot.

It may extend the response with source status metadata, for example:

```typescript
source_freshness: Array<{
  source: string;
  updated_at: string | null;
  observed_at?: string | null;
  status?: "fresh" | "stale" | "missing" | "failed";
  detail?: string | null;
}>;
```

The API must not trigger live ingestion.

### UI Wiring

The public dashboard should support selecting all seeded cities. The first implementation can keep the existing page structure, but it must:

- Let the user select Amsterdam, Utrecht, or Rotterdam.
- Fetch `/api/dashboard?city=<selected-slug>`.
- Show latest live-backed values when available.
- Show source freshness and stale/missing states.
- Avoid claiming official warning status when no official warning source is normalized.

### Commands

Recommended commands to support or document:

```bash
npm run ingest:weather -- --city amsterdam --live
npm run ingest:air-quality -- --city amsterdam --live
npm run ingest:water -- --city amsterdam --live
npm run ingest:all -- --live
npm run dashboard:regenerate -- --city amsterdam
npm run dashboard:regenerate -- --all
```

If script names differ during implementation, update `docs/commands.md` and this spec before acceptance or implementation changes broaden scope.

### Environment Variables

Expected server-only environment variables:

```text
KNMI_API_KEY
CRON_SECRET
```

Optional variables if needed by final source clients:

```text
KNMI_API_BASE_URL
LUCHTMEETNET_API_BASE_URL
RIJKSWATERSTAAT_API_BASE_URL
LIVE_INGESTION_ENABLED
```

Do not prefix secrets with `NEXT_PUBLIC_`.

## Test Expectations

Automated checks:

- Unit tests cover KNMI live-response normalization with fixture data.
- Unit tests cover Luchtmeetnet live-response normalization with fixture data.
- Unit tests cover Rijkswaterstaat live-response normalization with fixture data.
- Unit tests cover missing values and invalid source records.
- Ingestion runner tests cover success and failure `SourceRun` updates.
- Dashboard regeneration tests cover complete source data.
- Dashboard regeneration tests cover one missing source.
- Dashboard regeneration tests cover stale source metadata.
- Dashboard API response tests verify source freshness/status fields.
- UI/page tests or component-level tests verify city selection and unavailable/stale rendering where practical.
- External HTTP calls are mocked; tests must pass offline.

Manual checks:

- Run live ingestion for Amsterdam, Utrecht, and Rotterdam in local development with configured environment variables.
- Regenerate dashboard snapshots for all seeded cities.
- Open `/` locally and verify city selection shows live-backed values for all three cities.
- Call `/api/dashboard?city=amsterdam`, `/api/dashboard?city=utrecht`, and `/api/dashboard?city=rotterdam`.
- Temporarily fail one source client and verify the last good dashboard remains available.
- Verify browser network requests do not call external source domains.
- Verify source API keys do not appear in browser devtools, public JSON, logs, or committed files.

Validation commands:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

Not applicable:

- Live source uptime assertions in automated tests.
- Production cron provisioning tests.
- AI answer correctness tests.
- Historical backfill tests.

## Open Questions

- None pending user decision for this spec draft.

Implementation discovery must still verify current provider endpoint versions and select representative station/location IDs for Amsterdam, Utrecht, and Rotterdam from official source metadata before coding against live responses.
