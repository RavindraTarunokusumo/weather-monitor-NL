# KNMI Dataset Selection Spec

Status: Accepted
Spec path: `docs/specs/knmi-dataset-selection.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-07-02

## Goal

Resolve Open Question 1 from `Onboarding/PLAN.md` ("Which exact KNMI datasets should be used first for current observations and forecasts?") by documenting the exact KNMI-sourced datasets already implemented and tested in `lib/ingestion/knmi.ts`, so the decision is recorded in `docs/` instead of only existing implicitly in code.

This spec does not introduce new ingestion behavior. It formalizes and pins down a decision already made and already covered by `tests/ingestion-live-adapters.test.ts`.

## Scope

Document the exact dataset/collection identifiers used for:

- Current weather observations
- Weather forecasts
- Official weather warnings

## Decision

### Current observations — KNMI Data Platform EDR API

- Base URL: `KNMI_API_BASE_URL` (`https://api.dataplatform.knmi.nl/edr/v1`)
- Collection: `10-minute-in-situ-meteorological-observations`
- Endpoint shape: `/collections/10-minute-in-situ-meteorological-observations/locations/{stationId}`
- Per-city station IDs are configured in `lib/supported-cities.ts` (`sources.knmi.stationId`), e.g. Amsterdam → Schiphol `0-20000-0-06240`.
- Parameters requested: `ta` (temperature), `ff` (wind speed), `dd` (wind direction), `fx` (wind gust), `R1H` (1-hour rainfall).
- Query window: most recent completed 10-minute observation, looked back up to 2 hours to tolerate publication lag (`buildRecentObservationWindow` in `lib/ingestion/knmi.ts`).
- Auth: `Authorization` header using `KNMI_API_KEY`.

### Forecasts — Open-Meteo (KNMI-based model), not KNMI's own forecast API

- Base URL: `OPEN_METEO_API_BASE_URL` (`https://api.open-meteo.com/v1/forecast`)
- Model: `knmi_seamless` (Open-Meteo's blended KNMI HARMONIE-based forecast model), with automatic fallback to Open-Meteo's default blended model if the KNMI-specific model request fails.
- Hourly fields: `temperature_2m, precipitation_probability, weather_code, wind_speed_10m, wind_gusts_10m` (60 hours requested).
- Daily fields: `weather_code, temperature_2m_max, temperature_2m_min, precipitation_probability_max, wind_speed_10m_max, wind_gusts_10m_max` (7 days requested).
- No API key required; this is a public, unauthenticated endpoint.
- Rationale: the KNMI Data Platform's own forecast/EDR product does not expose a comparable free-tier hourly point-forecast endpoint suitable for this MVP; Open-Meteo's `knmi_seamless` model re-serves KNMI's HARMONIE model output in a simpler JSON shape, keeping the forecast source KNMI-derived while avoiding raw GRIB/NetCDF handling (explicitly out of scope per `docs/specs/forecast-page.md` Non-Goals).

### Warnings — KNMI Open Data API

- Base URL: `KNMI_OPEN_DATA_API_BASE_URL` (`https://api.dataplatform.knmi.nl/open-data/v1`)
- Dataset: `waarschuwingen_nederland_48h`, version `1.0`
- Endpoint shape: list the most recent file (`/datasets/waarschuwingen_nederland_48h/versions/1.0/files`, sorted by `lastModified` desc), resolve its temporary download URL, then fetch and normalize the warning payload.
- Per-city warning region mapping lives in `warningRegionForCity()` in `lib/ingestion/knmi.ts` (province-level, e.g. Amsterdam → Noord-Holland).
- Auth: `Authorization` header using `KNMI_API_KEY`.

## Acceptance Criteria

- `docs/architecture.md`'s External Integrations section names the exact collection/dataset identifiers above instead of generic descriptions.
- The Open Question in `Onboarding/PLAN.md` is marked resolved with a pointer to this spec.
- No code or test changes are required; this spec documents already-implemented, already-tested behavior (`tests/ingestion-live-adapters.test.ts` asserts the exact collection/dataset strings above).

## Non-Goals

- Selecting datasets for Luchtmeetnet (air quality) or Rijkswaterstaat (water level) — those are already configured per-city in `lib/supported-cities.ts` and out of scope for this KNMI-specific spec.
- Changing the forecast source from Open-Meteo's `knmi_seamless` model to KNMI's own forecast product. If KNMI later exposes a suitable free-tier point-forecast endpoint, that would need its own spec.
- Any live-ingestion behavior change; `LIVE_INGESTION_ENABLED` and `KNMI_API_KEY` remain required for live mode, mock mode remains the default.

## Constraints

- Do not commit real API keys.
- Live ingestion behavior must remain server-side only, per `docs/architecture.md`.

## Implementation Notes

Relevant files (no changes needed, reference only):

```text
lib/ingestion/knmi.ts
lib/supported-cities.ts
tests/ingestion-live-adapters.test.ts
```

Files to update as part of this spec:

```text
docs/architecture.md
Onboarding/PLAN.md
TODO.md
```

## Test Expectations

- No new automated tests required; existing `tests/ingestion-live-adapters.test.ts` already covers these dataset identifiers (collection path assertion, warning dataset path assertion, station ID format assertion).
- `npm test` must continue to pass unchanged.

## Open Questions

- None.
