# Database Schema & Seed Dashboard Spec

Status: Draft
Spec path: `docs/specs/database-schema-seed-dashboard.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Create the initial database schema, migrations, city seed data, and mock dashboard snapshot flow needed to render a realistic public dashboard before live data ingestion exists.

This spec enables the frontend to consume a stable backend dashboard API using seeded Amsterdam, Utrecht, and Rotterdam data.

## Scope

This spec includes:

* SQLAlchemy database models
* Alembic migrations
* Supported city seed data
* Mock weather, air-quality, water, and dashboard snapshots
* API schema models for dashboard responses
* Public dashboard endpoint
* Public cities endpoint
* Source freshness endpoint using seed/mock data
* Shared fixture for frontend/backend contract testing

Required API routes:

```http
GET /api/v1/cities
GET /api/v1/dashboard?city=amsterdam
GET /api/v1/source-status
```

Required tables:

```text
cities
source_runs
weather_snapshots
air_quality_snapshots
water_snapshots
dashboard_snapshots
```

Optional foundation table:

```text
source_observations
```

Seed cities:

```text
amsterdam
utrecht
rotterdam
```

Dashboard response should include:

```text
city
generated_at
source_freshness
current
next_24h
cycle_comfort
air_quality
water_signal
```

## Non-Goals

The following are intentionally out of scope:

* Live external data ingestion
* Authenticated user records
* AI-generated briefings
* AI Q&A
* Full time-series analytics
* PostGIS station matching
* TimescaleDB optimization
* Long-term climate scenario data
* Flood prediction

## Acceptance Criteria

* Alembic migration creates all required foundation tables.
* Seed command inserts Amsterdam, Utrecht, and Rotterdam.
* Seed command inserts realistic mock dashboard data for at least Amsterdam.
* `GET /api/v1/cities` returns active supported cities.
* `GET /api/v1/dashboard?city=amsterdam` returns a complete dashboard response from seed data.
* Dashboard endpoint returns a clear 404 or validation error for unsupported cities.
* `GET /api/v1/source-status` returns source freshness records from seed/mock data.
* API response does not expose raw source payloads by default.
* Frontend can render the seeded dashboard without needing external APIs.
* Shared fixture exists at `packages/shared/fixtures/dashboard-amsterdam.json` or equivalent.

## Constraints

* Use PostgreSQL-compatible schema.
* Use Alembic for schema migrations.
* Use UUID primary keys unless there is a strong reason not to.
* Use `TIMESTAMPTZ` for timestamps.
* Keep API schemas separate from database models.
* Do not rely on Supabase-specific database features.
* Do not require user accounts for dashboard access.
* Do not store fake data in production unless demo mode is explicitly enabled.
* Avoid premature PostGIS/TimescaleDB dependency unless needed by migrations later.

## Implementation Notes

Recommended table fields:

```text
cities
  id UUID primary key
  slug TEXT unique not null
  name TEXT not null
  country_code TEXT not null default 'NL'
  latitude DOUBLE PRECISION not null
  longitude DOUBLE PRECISION not null
  timezone TEXT not null default 'Europe/Amsterdam'
  is_active BOOLEAN not null default true
  created_at TIMESTAMPTZ not null
```

```text
source_runs
  id UUID primary key
  source_name TEXT not null
  job_type TEXT not null
  status TEXT not null
  started_at TIMESTAMPTZ not null
  finished_at TIMESTAMPTZ nullable
  records_fetched INTEGER default 0
  records_stored INTEGER default 0
  error_message TEXT nullable
  metadata JSONB nullable
```

```text
weather_snapshots
  id UUID primary key
  city_id UUID references cities(id)
  observed_at TIMESTAMPTZ not null
  ingested_at TIMESTAMPTZ not null
  temperature_c DOUBLE PRECISION nullable
  feels_like_c DOUBLE PRECISION nullable
  rain_mm DOUBLE PRECISION nullable
  rain_probability DOUBLE PRECISION nullable
  wind_speed_kmh DOUBLE PRECISION nullable
  wind_gust_kmh DOUBLE PRECISION nullable
  wind_direction TEXT nullable
  weather_code TEXT nullable
  warning_level TEXT nullable
  source_name TEXT not null
  source_payload JSONB nullable
```

```text
air_quality_snapshots
  id UUID primary key
  city_id UUID references cities(id)
  observed_at TIMESTAMPTZ not null
  ingested_at TIMESTAMPTZ not null
  aqi_value DOUBLE PRECISION nullable
  aqi_label TEXT nullable
  pm25 DOUBLE PRECISION nullable
  pm10 DOUBLE PRECISION nullable
  no2 DOUBLE PRECISION nullable
  o3 DOUBLE PRECISION nullable
  so2 DOUBLE PRECISION nullable
  main_pollutant TEXT nullable
  trend_label TEXT nullable
  source_name TEXT not null
  source_payload JSONB nullable
```

```text
water_snapshots
  id UUID primary key
  city_id UUID references cities(id)
  station_id TEXT nullable
  station_name TEXT nullable
  observed_at TIMESTAMPTZ not null
  ingested_at TIMESTAMPTZ not null
  water_level_cm DOUBLE PRECISION nullable
  trend_label TEXT nullable
  risk_label TEXT nullable
  source_name TEXT not null
  source_payload JSONB nullable
```

```text
dashboard_snapshots
  id UUID primary key
  city_id UUID references cities(id)
  generated_at TIMESTAMPTZ not null
  state_hash TEXT not null
  weather_snapshot_id UUID nullable references weather_snapshots(id)
  air_quality_snapshot_id UUID nullable references air_quality_snapshots(id)
  water_snapshot_id UUID nullable references water_snapshots(id)
  cycle_comfort_score INTEGER nullable
  cycle_comfort_label TEXT nullable
  best_outdoor_window TEXT nullable
  worst_outdoor_window TEXT nullable
  summary_payload JSONB not null
```

Recommended backend schema:

```python
class DashboardState(BaseModel):
    city: str
    generated_at: datetime
    source_freshness: list[SourceFreshness]
    current: CurrentWeather | None
    next_24h: Outlook24h | None
    cycle_comfort: CycleComfort | None
    air_quality: AirQuality | None
    water_signal: WaterSignal | None
```

Recommended commands:

```bash
cd apps/api
alembic revision --autogenerate -m "create foundation tables"
alembic upgrade head
python -m app.jobs.seed_dev
```

## Test Expectations

Automated checks:

* Migration applies successfully to an empty test database.
* Seed command is idempotent or safely repeatable.
* Cities endpoint returns expected seed cities.
* Dashboard endpoint returns valid schema for Amsterdam.
* Dashboard endpoint handles unsupported city slugs.
* Source status endpoint returns source freshness records.
* Shared dashboard fixture validates against backend schema.

Manual checks:

* Frontend can render Amsterdam from backend seed data.
* Dashboard response contains no secret values.
* Mock data is clearly distinguishable from live data in development.

Not applicable:

* Live KNMI data validation.
* Live Rijkswaterstaat data validation.
* Live Luchtmeetnet data validation.
* AI briefing validation.

## Open Questions

* None.
