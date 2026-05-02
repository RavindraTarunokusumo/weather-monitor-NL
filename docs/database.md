# Database and Persistence

## Purpose

Document schema, state ownership, migrations, and persistence rules for the planned environmental dashboard.

## Storage Backend

The recommended storage layer is PostgreSQL with:

- TimescaleDB for time-series observations and forecast snapshots
- PostGIS for geospatial station matching
- S3-compatible object storage for large raw files, if needed

No schema has been implemented yet.

## Core Tables / Collections

Expected table families once implementation starts:

### `source_snapshots`

Purpose: preserve raw or lightly wrapped source responses with fetch metadata.

Fields:

- `id`
- `source`
- `fetched_at`
- `source_timestamp`
- `status`
- `payload_uri` or `payload_json`

Relationships:

- Used by normalizers and audit/debug workflows.

Notes:

- Raw payloads must never include secrets.

### `observations`

Purpose: store normalized weather, air-quality, and water measurements.

Fields:

- `id`
- `source`
- `station_id`
- `observed_at`
- `metric`
- `value`
- `unit`
- `quality_flag`

### `dashboard_snapshots`

Purpose: store normalized city dashboard state used by the API and AI layer.

Fields:

- `id`
- `city`
- `generated_at`
- `summary_json`
- `source_freshness_json`

## Migration Rules

- Migrations must be deterministic.
- Backward compatibility must be explicit.
- Data deletion must be intentional and documented.
- Tests must cover migration-sensitive behavior.

## State Ownership

- Source adapters own fetch metadata.
- Normalizers own unit conversion and source payload interpretation.
- Scoring modules own deterministic scores and category labels.
- AI modules own generated summaries, never raw measurements.
- API modules own serialization and response shape.

## Persistence Invariants

- Stable source and station IDs are authoritative.
- Display names are not state keys.
- Writes must be atomic where consistency matters.
- External side effects must be auditable.
- Source freshness must travel with derived dashboard state.
