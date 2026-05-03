# Source Adapter & Ingestion Skeleton Spec

Status: Draft
Spec path: `docs/specs/source-adapter-ingestion-skeleton.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Create the ingestion skeleton for future KNMI, Rijkswaterstaat, and Luchtmeetnet data integration without implementing live source access yet.

This spec enables agents or engineers to add source-specific ingestion later using a consistent adapter interface, source run tracking, normalization pattern, and job entrypoint structure. In the current single-app architecture, the job modules should live in the root app or shared server-side modules, not in a separate FastAPI package.

## Scope

This spec includes:

* Source adapter base interface
* KNMI adapter stub
* Luchtmeetnet adapter stub
* Rijkswaterstaat adapter stub
* Mock adapter fixtures
* Source run logging
* Ingestion job entrypoints
* Normalized output shape tests
* Error handling pattern for failed ingestion runs

Required files:

```text
lib/ingestion/base.ts
lib/ingestion/knmi.ts
lib/ingestion/luchtmeetnet.ts
lib/ingestion/rijkswaterstaat.ts
app/api/jobs/ingest-weather/route.ts
app/api/jobs/ingest-air-quality/route.ts
app/api/jobs/ingest-water/route.ts
app/api/jobs/regenerate-dashboard-snapshots/route.ts
```

## Non-Goals

The following are intentionally out of scope:

* Live KNMI API integration
* Live Rijkswaterstaat API integration
* Live Luchtmeetnet API integration
* Climate scenario ingestion
* NetCDF/GRIB parsing
* Automated station matching
* Production scheduler setup
* Full retry queue infrastructure
* AI briefing regeneration

## Acceptance Criteria

* Base adapter interface exists.
* Three source adapter stubs exist.
* Each adapter has source name, config placeholder, fetch stub, and normalize stub.
* Mock ingestion job can create a `source_runs` record.
* Failed mock ingestion records status and error message.
* Fixture-based normalization tests verify expected output shape.
* Job entrypoints can be called from CLI/module command.
* No live external API call is required for tests.
* TODOs clearly identify where exact source endpoints/datasets must be decided later.

## Constraints

* Source adapters must not write directly to frontend-facing schemas.
* Source adapters should return normalized records for services to store.
* Ingestion must be server-side only in the Next.js app, not browser-side.
* Do not expose source API keys to the frontend.
* Jobs must be runnable locally and later from cron/systemd/cloud schedulers.
* Source failures must be logged without crashing the entire app.
* Keep source-specific parsing isolated in adapter modules.
* Use async HTTP client patterns where practical, but do not overcomplicate the skeleton.

## Implementation Notes

Recommended adapter interface:

```python
from abc import ABC, abstractmethod
from typing import Any

class SourceAdapter(ABC):
    source_name: str

    @abstractmethod
    async def fetch(self, city: Any) -> list[dict]:
        raise NotImplementedError

    @abstractmethod
    async def normalize(self, raw_records: list[dict], city: Any) -> list[dict]:
        raise NotImplementedError
```

If this work is implemented in TypeScript instead of Python, keep the same shape and names but express the contract with `class`/`interface` syntax in `lib/ingestion/*`.

Recommended ingestion run pattern:

```text
Create source_run(status="running")
  ↓
Fetch raw records
  ↓
Normalize records
  ↓
Store snapshots through service layer
  ↓
Update source_run(status="success")
```

Failure pattern:

```text
Create source_run(status="running")
  ↓
Exception occurs
  ↓
Update source_run(status="failed", error_message=<message>)
  ↓
Log structured error
```

Recommended job command shape:

```bash
npm run ingest:weather -- --city amsterdam --mock
npm run ingest:air-quality -- --city amsterdam --mock
npm run ingest:water -- --city amsterdam --mock
```

Adapter TODOs should include:

```text
KNMI:
  Decide exact current observation and forecast datasets.
  Decide file/API access pattern.

Luchtmeetnet:
  Decide station selection logic.
  Decide pollutant mapping and AQI/category method.

Rijkswaterstaat:
  Decide nearest station matching logic.
  Decide supported measurement type for water-level trend.
```

## Test Expectations

Automated checks:

* Adapter classes import successfully.
* Base adapter contract is followed.
* Mock fetch returns fixture data.
* Normalize method returns expected shape for fixture data.
* Successful mock ingestion records `source_runs.status = success`.
* Failed mock ingestion records `source_runs.status = failed` and stores error message.
* Job entrypoint argument parsing works.

Manual checks:

* Developer can run mock ingestion command locally.
* Source run appears in database after command.
* Failed command records useful error state.

Not applicable:

* Live external source uptime tests.
* Production scheduler tests.
* Climate data parsing tests.
* AI briefing regeneration tests.

## Open Questions

* None.
