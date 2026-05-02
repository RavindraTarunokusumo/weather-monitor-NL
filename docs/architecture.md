# System Architecture

Dutch Weather Intelligence is planned as a web dashboard that aggregates Dutch weather, water, and air-quality data into practical daily briefings.

## Entry Points

Implementation has not started yet. The current recommended stack is:

- Frontend: Next.js, TypeScript, Tailwind CSS
- Backend: Python FastAPI with Pydantic models
- Jobs: Celery, Dramatiq, or APScheduler
- Storage: PostgreSQL with TimescaleDB and PostGIS
- AI: LLM API over compact normalized JSON only

## Module Structure

Expected source boundaries once implementation starts:

### `src/api/`

HTTP API routes for dashboard state, AI briefing, dashboard Q&A, and source status.

### `src/ingestion/`

Source adapters for KNMI, Rijkswaterstaat Waterinfo, and Luchtmeetnet / RIVM.

### `src/normalization/`

Validation and conversion from source-specific payloads into stable internal dashboard models.

### `src/scoring/`

Deterministic cycle comfort, air-quality category, water trend, and outdoor-window calculations.

### `src/ai/`

Prompt templates, briefing generation, grounded Q&A, and guardrail validation.

### `src/persistence/`

Database sessions, repositories, migrations, raw response cache, and time-series writes.

### `frontend/`

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
