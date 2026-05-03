# System Architecture

Dutch Weather Intelligence is a web dashboard scaffold that will aggregate Dutch weather, water, and air-quality data into practical daily briefings.

## Entry Points

Current scaffold entry points:

- Frontend: `apps/web/` Next.js with TypeScript and app router
- Backend: `apps/api/` FastAPI with Pydantic settings and health routing
- Infrastructure: `infra/docker/` for local PostgreSQL and API image scaffolding
- Shared: `packages/shared/` reserved for later cross-cutting code

## Module Structure

Expected source boundaries once implementation grows:

### `apps/api/app/api/`

HTTP API routes for dashboard state, AI briefing, dashboard Q&A, and source status.

### `apps/api/app/ingestion/`

Source adapters for KNMI, Rijkswaterstaat Waterinfo, and Luchtmeetnet / RIVM.

### `apps/api/app/schemas/`

Validated internal models for normalized dashboard payloads and health responses.

### `apps/api/app/services/`

Deterministic scoring, trends, and business rules for the backend source of truth.

### `apps/api/app/db/`

Database sessions, repositories, migrations, raw response cache, and time-series writes.

### `apps/web/app/`

Dashboard UI: city selector, briefing, cards, timelines, map panel, Q&A, and source freshness footer.

## Data Flow

1. Scheduled jobs fetch external source data.
2. Raw responses are cached with source metadata and freshness timestamps.
3. Normalizers validate units, timestamps, station IDs, and missing data.
4. Processing code calculates trends, categories, scores, and best/worst windows.
5. API endpoints serve normalized dashboard state.
6. AI features receive compact dashboard JSON and generate explanations or answers.
7. Frontend displays values, interpretation, confidence, and freshness.

## Background Jobs

Planned refresh targets:

- Weather forecast: every 1-3 hours depending on source availability
- Current observations: every 10-30 minutes if supported
- Air quality: hourly
- Water data: every 15-60 minutes depending on source support
- AI briefing: regenerate only after meaningful dashboard summary changes

## External Integrations

### KNMI

- Purpose: observations, forecasts, weather warnings where available
- Auth: to be confirmed for selected datasets
- Failure behavior: show stale or unavailable source state; do not invent values
- Tests: mock network responses and source failures

### Rijkswaterstaat Waterinfo

- Purpose: nearby water-level signal and trend
- Auth: to be confirmed for selected endpoint
- Failure behavior: show water signal as unavailable
- Tests: mock station lookup, missing stations, and outliers

### Luchtmeetnet / RIVM

- Purpose: PM2.5, PM10, NO2, ozone where available
- Auth: to be confirmed for selected endpoint
- Failure behavior: show air quality as unknown or stale
- Tests: mock pollutant readings, trend windows, and missing pollutants

## Invariants

- The product is an interpretation layer, not an official warning system.
- AI may explain source-backed facts but must not create forecasts.
- Flood prediction is out of scope for MVP.
- Amsterdam is the first live prototype city; Utrecht and Rotterdam follow after adapters are stable.
