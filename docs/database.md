# Database and Persistence

## Purpose

Document the current Prisma/PostgreSQL foundation schema, seed path, ingestion snapshot flow, migration commands, and persistence rules for the dashboard.

## Storage Backend

The current storage target is PostgreSQL with Prisma models and migrations under `prisma/`.

The current Vercel/Postgres foundation keeps the schema portable:

- PostgreSQL-compatible tables only
- no TimescaleDB dependency
- no PostGIS dependency
- no raw-object storage layer

## Core Models

### `City`

Stores the supported city catalog for public dashboard access.

### `SourceRun`

Tracks source job freshness and outcome state for KNMI, Luchtmeetnet, Rijkswaterstaat, and mock ingestion runs.

### `WeatherSnapshot`

Stores normalized weather observations for a city snapshot. Records may come from seeded mock data or live KNMI ingestion.
Live weather snapshots may also store compact forecast and warning metadata in `sourcePayload` so dashboard regeneration can build `outlook`, `rain_probability`, `weather_code`, and warning fields without request-time provider calls.

### `AirQualitySnapshot`

Stores normalized air-quality observations for a city snapshot. Records may come from seeded mock data or live Luchtmeetnet ingestion.
Live air-quality snapshots store the derived trend label from recent station measurements; trend support is source-derived and remains `unknown` when there is not enough comparable recent data.

### `WaterSnapshot`

Stores normalized water observations for a city snapshot. Records may come from seeded mock data or live Rijkswaterstaat ingestion.
Live water snapshots store the derived trend label and compact `weekly_levels_cm` metadata in `sourcePayload` for the dashboard water signal chart.

### `DashboardSnapshot`

Stores the API-ready read model used by `/api/dashboard`. Dashboard snapshots link the latest source snapshots and carry source freshness, missing-source, and stale-source metadata through `summaryPayload`.

### `AiBriefing`

Stores a mock briefing for the seeded dashboard. Real LLM generation is not implemented.

### `User`, `QaInteraction`, `UsageQuota`

Foundation tables reserved for later auth, AI Q&A, and quota milestones. They are not active in this milestone.

## Migration Rules

- Local development uses `npx prisma migrate dev --name foundation_schema`.
- Production deployment uses `npx prisma migrate deploy`.
- Migrations must be deterministic.
- Data deletion must be intentional and documented.
- Runtime secrets must not appear in migration files.

## Seed Rules

- `npx prisma db seed` inserts Amsterdam, Utrecht, and Rotterdam.
- The Amsterdam dashboard seed includes mock weather, air-quality, water, dashboard, and briefing data.
- The seed removes the previous `mock-amsterdam-v1` dashboard and briefing before inserting a fresh mock snapshot.
- Vercel production builds skip the seed step. This keeps deploys from making seeded mock dashboard snapshots newer than live-regenerated snapshots.

## Persistence Invariants

- Stable city slugs are public identifiers.
- Display names are not state keys.
- Writes that produce a dashboard snapshot must keep source freshness attached.
- External source payloads are not exposed by default through public API responses.
- Public dashboard requests read stored `DashboardSnapshot` rows only; they must not call external source providers at request time.
- Failed source ingestion must update `SourceRun` without deleting the last good source or dashboard snapshot.
- Live source names must remain distinguishable from `mock_*` seed data.
