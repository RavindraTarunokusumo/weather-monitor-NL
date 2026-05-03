# Database and Persistence

## Purpose

Document the current Prisma/PostgreSQL foundation schema, seed path, migration commands, and persistence rules for the seeded dashboard.

## Storage Backend

The current storage target is PostgreSQL with Prisma models and migrations under `prisma/`.

The first Vercel/Postgres milestone keeps the schema portable:

- PostgreSQL-compatible tables only
- no TimescaleDB dependency
- no PostGIS dependency
- no raw-object storage layer

## Core Models

### `City`

Stores the supported city catalog for public dashboard access.

### `SourceRun`

Reserved for source job freshness and outcome tracking.

### `WeatherSnapshot`

Stores normalized mock weather observations for a city snapshot.

### `AirQualitySnapshot`

Stores normalized mock air-quality observations for a city snapshot.

### `WaterSnapshot`

Stores normalized mock water observations for a city snapshot.

### `DashboardSnapshot`

Stores the API-ready read model used by `/api/dashboard`.

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

## Persistence Invariants

- Stable city slugs are public identifiers.
- Display names are not state keys.
- Writes that produce a dashboard snapshot must keep source freshness attached.
- External source payloads are not exposed by default through public API responses.
