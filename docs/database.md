# Database and Persistence

## Purpose

Document the current foundation schema, state ownership, migrations, and persistence rules for the seeded environmental dashboard.

## Storage Backend

The current storage target is PostgreSQL with SQLAlchemy models and Alembic migrations under `apps/api/`.

The first database milestone keeps the schema portable:

- PostgreSQL-compatible tables only
- no TimescaleDB dependency yet
- no PostGIS dependency yet
- no raw-object storage layer yet

## Core Tables

### `cities`

Purpose: store the supported city catalog for public dashboard access.

Current fields:

- `id`
- `slug`
- `name`
- `country_code`
- `latitude`
- `longitude`
- `timezone`
- `is_active`
- `created_at`

### `source_runs`

Purpose: record the freshness and outcome of source-specific fetch or seed jobs.

Current fields:

- `id`
- `source_name`
- `job_type`
- `status`
- `started_at`
- `finished_at`
- `records_fetched`
- `records_stored`
- `error_message`
- `metadata`

### `weather_snapshots`

Purpose: store normalized weather observations for a city snapshot.

### `air_quality_snapshots`

Purpose: store normalized air-quality observations for a city snapshot.

### `water_snapshots`

Purpose: store normalized water observations for a city snapshot.

### `dashboard_snapshots`

Purpose: store the read-model used by `/api/v1/dashboard`.

Current fields:

- `id`
- `city_id`
- `generated_at`
- `state_hash`
- `weather_snapshot_id`
- `air_quality_snapshot_id`
- `water_snapshot_id`
- `cycle_comfort_score`
- `cycle_comfort_label`
- `best_outdoor_window`
- `worst_outdoor_window`
- `summary_payload`

## Migration Rules

- Migrations must be deterministic.
- Backward compatibility must be explicit.
- Data deletion must be intentional and documented.
- Tests must cover migration-sensitive behavior.
- The initial revision is `20260503_0001_create_foundation_tables`.

## State Ownership

- Seed and ingestion jobs own persisted source-run metadata.
- Snapshot tables own normalized weather, air-quality, and water observations.
- Dashboard snapshots own the API-ready summary payload for seeded dashboard reads.
- API schema models own serialization and response shape.
- Later ingestion adapters and scoring modules may replace the seed path without changing the dashboard contract.

## Persistence Invariants

- Stable source and station IDs are authoritative.
- Display names are not state keys.
- Writes must be atomic where consistency matters.
- External side effects must be auditable.
- Source freshness must travel with derived dashboard state.
- Seed data must be repeatable so local reruns do not accumulate duplicate public dashboard records.
