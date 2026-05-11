# Forecast Summary & Trend Data Wiring Spec

Status: Accepted
Spec path: `docs/specs/forecast-summary-trend-data-wiring.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-05-09

## Goal

Fill the highest-value remaining live-data gaps in the reference dashboard by adding forecast-backed outlook data, deterministic daily briefing fields, official weather warning status, and source-derived air and water trends for Amsterdam, Utrecht, and Rotterdam.

After this work, the dashboard should no longer show empty `outlook`, null briefing summary fields, unknown air/water trends, or missing weather warning labels when live source data is available.

## Source Research

The implementation should verify provider details again before coding, but this spec is based on the following current acquisition paths:

- Open-Meteo KNMI Forecast API: JSON point forecasts from KNMI HARMONIE AROME Netherlands and Europe models. The KNMI Netherlands model is listed as 2 km, hourly, updated hourly, with a 2.5-day forecast; Open-Meteo combines with ECMWF IFS HRES after that for longer forecasts. Reference: <https://open-meteo.com/en/docs/knmi-api>
- Open-Meteo Weather Forecast API: `/v1/forecast` accepts latitude/longitude, hourly variables, daily variables, current variables, `forecast_days`, `forecast_hours`, `models`, and timezone options. Reference: <https://open-meteo.com/en/docs>
- KNMI Data Platform HARMONIE: official KNMI HARMONIE data is available through KNMI Data Platform as whole-domain GRIB files, with no point cutouts for specific locations or parameters. This is valuable later, but too heavy for the first dashboard data-gap pass. Reference: <https://english.knmidata.nl/open-data/harmonie>
- KNMI weather warnings: official 48-hour Dutch warning files are available through the KNMI Data Platform Open Data API at `https://api.dataplatform.knmi.nl/open-data/v1/datasets/waarschuwingen_nederland_48h/versions/1.0/files` with an API key in the `Authorization` header. Reference: <https://dataplatform.knmi.nl/dataset/access/waarschuwingen-nederland-48h-1-0>
- KNMI Open Data API mechanics: datasets are listed and downloaded through `https://api.dataplatform.knmi.nl/open-data/v1/datasets/{dataset}/versions/{version}/files`, authenticated with the API key header. Reference: <https://developer.dataplatform.knmi.nl/open-data-api>
- Luchtmeetnet API: the public API is available at `https://api.luchtmeetnet.nl/open_api`, requires no authentication, updates hourly, and limits requests to 100 per 5 minutes. The current code already uses `GET /open_api/stations/{stationId}/measurements`. Reference: <https://api-docs.luchtmeetnet.nl/>
- RIVM Luchtmeetnet yearly data: larger historical hourly datasets are available through the RIVM data portal, but near-real-time trend derivation should use the public API first. Reference: <https://data.rivm.nl/data/luchtmeetnet/>
- Rijkswaterstaat WaterWebservices: current and historical water observations are available through `https://ddapi20-waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES/OphalenWaarnemingen` with `Locatie`, `AquoMetadata`, and `Periode`; `WATHTE` is the water-height quantity. The same service supports quality-code filtering. Reference: <https://rijkswaterstaatdata.nl/waterdata/>
- Rijkswaterstaat water forecasts: `WATHTE` can also be requested with `ProcesType: "verwachting"` for predicted water levels where the selected location supports forecasts; the documentation recommends querying roughly `T-10min` to `T+2 days` for those forecasts. Reference: <https://rijkswaterstaatdata.nl/waterdata/>

## Scope

This spec includes:

- Weather forecast ingestion for Amsterdam, Utrecht, and Rotterdam using Open-Meteo's KNMI-backed point forecast API as the first implementation path.
- Official KNMI warning ingestion from `waarschuwingen_nederland_48h`.
- Forecast persistence or snapshot payload storage sufficient to regenerate `outlook.hourly`, `outlook.weekly`, `rain_probability`, and weather condition labels without browser-side external calls.
- Deterministic dashboard summary fields in `summaryPayload.ui_summary`:
  - `best_window`
  - `outdoor_window_detail`
  - `main_risk`
  - `risk_detail`
  - `changed`
  - `changed_detail`
- A deterministic briefing fallback returned by `/api/dashboard` when no `AiBriefing` row exists.
- Air-quality trend derivation from recent Luchtmeetnet station measurements for the configured city station.
- Water-level trend derivation from recent Rijkswaterstaat WATHTE observations for the configured city location.
- `water_signal.weekly_levels_cm` generation from recent stored water observations.
- Optional near-term water forecast ingestion using Rijkswaterstaat `ProcesType: "verwachting"` where the configured location supports it.
- Tests with mocked provider responses.
- Documentation updates for data sources, attribution, commands, and manual verification.

Required city coverage:

```text
amsterdam
utrecht
rotterdam
```

Required data fields to become live-derived where possible:

```text
briefing
current.condition_label
current.warning_level
current.rain_probability
ui_summary.best_window
ui_summary.main_risk
ui_summary.changed
outlook.hourly
outlook.weekly
air_quality.trend
water_signal.trend
water_signal.weekly_levels_cm
```

## Non-Goals

The following are intentionally out of scope:

- Browser-side calls to Open-Meteo, KNMI, Luchtmeetnet, Rijkswaterstaat, RIVM, or any other external provider.
- Decoding official KNMI HARMONIE GRIB/tar files in this first pass.
- Full meteorological model comparison.
- Adding cities beyond Amsterdam, Utrecht, and Rotterdam.
- AI-generated briefing text.
- User-specific recommendations.
- Push notifications or warning subscriptions.
- Production scheduler provisioning.
- Long-term historical trend analysis beyond the recent windows needed for dashboard trends.
- Replacing the existing live current-observation adapters for KNMI, Luchtmeetnet, or Rijkswaterstaat.

## Acceptance Criteria

- `/api/dashboard?city=<slug>` returns non-empty `outlook.hourly` for Amsterdam, Utrecht, and Rotterdam after running documented live ingestion/regeneration commands.
- `/api/dashboard?city=<slug>` returns non-empty `outlook.weekly` for Amsterdam, Utrecht, and Rotterdam after running documented live ingestion/regeneration commands.
- Forecast-backed `rain_probability` is present when the selected forecast source returns precipitation probability or a supported derived equivalent.
- Weather condition labels are derived from forecast/current weather codes and are not hardcoded placeholder values.
- KNMI warning status is populated from official warning data when a relevant province warning is active, and explicitly `none` or unavailable when no matching warning data exists.
- `summaryPayload.ui_summary` contains deterministic non-null `best_window`, `outdoor_window_detail`, `main_risk`, `risk_detail`, `changed`, and `changed_detail` values when enough source data exists.
- `/api/dashboard` returns a deterministic briefing fallback when no `AiBriefing` exists.
- Air-quality trend is derived from recent Luchtmeetnet measurements and is no longer `unknown` when enough current and prior measurements exist.
- Water-level trend is derived from recent Rijkswaterstaat measurements and is no longer `unknown` when enough current and prior measurements exist.
- `water_signal.weekly_levels_cm` contains a seven-point recent-level series for each city when enough water observations exist.
- All new provider calls happen in server-side ingestion/job code, not page render code or client components.
- Failed forecast/warning/trend ingestion preserves the last good dashboard snapshot and records missing/stale source state.
- All external HTTP calls are mocked in automated tests.
- The reference dashboard UI keeps using its existing images, symbols, and visual layout while rendering the newly wired data.
- Documentation describes data source attribution requirements, provider limits, local commands, and the manual live verification flow.

## Constraints

- Use the existing Next.js App Router application.
- Use TypeScript.
- Use Prisma/PostgreSQL persistence where durable source snapshots are needed.
- Keep provider-specific parsing isolated under `lib/ingestion/*` or a closely named ingestion module.
- Keep dashboard calculations out of UI components.
- Keep public dashboard latency independent from provider latency.
- Preserve current live weather, air, and water ingestion behavior.
- Do not expose API keys or provider raw payloads in browser bundles or public JSON response shapes.
- Do not prefix server-only provider keys with `NEXT_PUBLIC_`.
- Respect Luchtmeetnet's published fair-use limit of 100 requests per 5 minutes.
- Attribute Open-Meteo and its underlying providers where forecast data is shown or documented.
- Treat Open-Meteo forecast data as a pragmatic JSON point forecast source, not as an official KNMI warning source.
- Treat KNMI Data Platform warning data as the authoritative warning source for warning labels.

## Implementation Notes

### Current Repo Seams

Build on the existing live-data pipeline rather than creating a parallel dashboard API:

```text
lib/ingestion/base.ts
lib/ingestion/knmi.ts
lib/ingestion/luchtmeetnet.ts
lib/ingestion/rijkswaterstaat.ts
lib/ingestion/jobs.ts
lib/ingestion/source-config.ts
lib/dashboard-regeneration.ts
lib/dashboard.ts
app/api/dashboard/route.ts
app/api/jobs/regenerate-dashboard-snapshots/route.ts
scripts/ingest.ts
prisma/schema.prisma
docs/commands.md
docs/database.md
docs/architecture.md
```

### Forecast Source

Use Open-Meteo's KNMI endpoint for the first forecast implementation because it provides JSON point data and avoids introducing GRIB decoding.

Use two forecast products from the same provider:

- Short-range hourly outlook: prefer KNMI HARMONIE AROME Netherlands for the next 24 to 60 hours.
- Seven-day outlook: prefer the KNMI seamless model path, which uses KNMI HARMONIE for the short range and ECMWF IFS HRES after the KNMI horizon; if the exact model selector is unavailable in the API response at implementation time, omit `models` and store the returned model metadata from Open-Meteo's best-match response.

```text
GET https://api.open-meteo.com/v1/forecast
```

Recommended short-range query shape:

```text
latitude=<city-lat>
longitude=<city-lon>
timezone=Europe/Amsterdam
models=knmi_harmonie_arome_netherlands
forecast_hours=60
hourly=temperature_2m,apparent_temperature,precipitation,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m
```

Recommended seven-day query shape:

```text
latitude=<city-lat>
longitude=<city-lon>
timezone=Europe/Amsterdam
models=knmi_seamless
forecast_days=7
daily=weather_code,temperature_2m_max,temperature_2m_min,apparent_temperature_max,apparent_temperature_min,precipitation_sum,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max
```

If `knmi_seamless` or `precipitation_probability` are not available for the selected model at implementation time, store the provider-supported model and precipitation variables and make unsupported probability fields explicitly unavailable instead of inventing values.

### Warning Source

Use KNMI Data Platform Open Data API for official warnings:

```text
GET https://api.dataplatform.knmi.nl/open-data/v1/datasets/waarschuwingen_nederland_48h/versions/1.0/files?sorting=desc&orderBy=lastModified&maxKeys=1
Authorization: <KNMI_API_KEY>
```

Then download the newest file through the documented file download flow and normalize warnings by province/region into city-level warning state.

City mapping:

```text
amsterdam -> Noord-Holland
rotterdam -> Zuid-Holland
utrecht -> Utrecht
```

Warning labels should use a constrained internal enum:

```typescript
type WeatherWarningLevel = "none" | "yellow" | "orange" | "red" | "unknown";
```

### Air Trend

Keep the current Luchtmeetnet station-measurements endpoint:

```text
GET https://api.luchtmeetnet.nl/open_api/stations/{stationId}/measurements
```

Normalize the latest pollutant values as today, then derive trend by comparing the latest selected main pollutant value against an earlier value from the recent available series:

```typescript
type TrendLabel = "rising" | "falling" | "stable" | "unknown";
```

Recommended first-pass rule:

- Compare latest value to the closest value 6 hours earlier.
- If 6-hour comparison is unavailable, compare to the oldest value in the previous 24 hours.
- `rising` when the value increased by at least 10%.
- `falling` when the value decreased by at least 10%.
- `stable` when the absolute change is below 10%.
- `unknown` when no valid comparison exists.

### Water Trend And Weekly Series

Extend the current Rijkswaterstaat WATHTE request window from the short live lookback to enough observations for both trend and weekly display:

```text
POST https://ddapi20-waterwebservices.rijkswaterstaat.nl/ONLINEWAARNEMINGENSERVICES/OphalenWaarnemingen
```

Measurement request shape:

```json
{
  "Locatie": { "Code": "<configured location code>" },
  "AquoPlusWaarnemingMetadata": {
    "AquoMetadata": {
      "Compartiment": { "Code": "OW" },
      "Grootheid": { "Code": "WATHTE" },
      "ProcesType": "meting"
    },
    "WaarnemingMetadata": {
      "KwaliteitswaardecodeLijst": ["00", "10", "20", "25", "30", "40"]
    }
  },
  "Periode": {
    "Begindatumtijd": "<now minus 7 days>",
    "Einddatumtijd": "<now>"
  }
}
```

Recommended first-pass water trend rule:

- Compare latest WATHTE value to the closest value 6 hours earlier.
- `rising` when the level increased by at least 5 cm.
- `falling` when the level decreased by at least 5 cm.
- `stable` when the absolute change is below 5 cm.
- `unknown` when no valid comparison exists.

Generate `weekly_levels_cm` as seven daily representative values, using the latest valid measurement per local date.

### Optional Water Forecast

Where the configured location supports forecast observations, add a separate Rijkswaterstaat request with:

```json
{
  "AquoMetadata": {
    "Grootheid": { "Code": "WATHTE" },
    "ProcesType": "verwachting"
  }
}
```

Use this only as supplemental outlook data. If the selected city location does not return forecast records, mark the water forecast unavailable and keep measured weekly levels.

### Dashboard Summary

Generate `summaryPayload.ui_summary` during dashboard regeneration from stored snapshots and forecast data.

Recommended first-pass deterministic rules:

- `best_window`: pick the lowest-risk 3-hour daytime window in the next 24 hours using apparent temperature, precipitation, wind gusts, and air-quality category.
- `main_risk`: choose the highest severity among active warning, heavy rain, high gusts, poor air, and abnormal water trend.
- `changed`: compare the latest dashboard state to the previous dashboard snapshot for the same city; fall back to "new live snapshot" when no previous snapshot exists.
- Details fields should be short display strings, not provider raw text.

The public API may continue to return `briefing` from `AiBriefing` first, but must fall back to a deterministic string derived from `ui_summary` when no `AiBriefing` exists.

### Persistence

Implementation may choose either:

- Add a dedicated `WeatherForecastSnapshot` table for normalized forecast rows and metadata, then include forecast data during dashboard regeneration.
- Store normalized forecast outlook directly inside `DashboardSnapshot.summaryPayload` if no other feature needs raw forecast replay yet.

If forecast provider payloads are stored, keep them out of the public API by default and include only compact normalized forecast fields in `summaryPayload`.

## Test Expectations

Automated checks:

- Forecast client tests cover Open-Meteo KNMI response normalization with fixture data.
- Forecast client tests cover missing unsupported variables without inventing values.
- Warning client tests cover KNMI warning file list/download normalization with fixture data.
- Warning normalization tests cover Amsterdam/Noord-Holland, Rotterdam/Zuid-Holland, and Utrecht/Utrecht mapping.
- Air trend tests cover rising, falling, stable, and unknown trend outcomes.
- Water trend tests cover rising, falling, stable, and unknown trend outcomes.
- Weekly water series tests cover seven local-date values from unordered provider observations.
- Dashboard regeneration tests cover complete forecast, warning, air trend, and water trend data.
- Dashboard regeneration tests cover forecast unavailable while preserving current live source data.
- Dashboard API tests verify non-empty `outlook.hourly`, `outlook.weekly`, deterministic `ui_summary`, deterministic briefing fallback, and source status metadata.
- UI/component tests verify the reference dashboard renders forecast, warning, trend, and weekly water data without replacing its reference images or symbols.
- All provider HTTP calls are mocked; tests pass offline.

Manual checks:

- Run live current ingestion for all cities.
- Run forecast/warning/trend ingestion for all cities.
- Regenerate dashboard snapshots for all cities.
- Call `/api/dashboard?city=amsterdam`, `/api/dashboard?city=utrecht`, and `/api/dashboard?city=rotterdam`.
- Verify all three responses have live weather, air, water, forecast outlook, warning status, deterministic summary, air trend, water trend, and weekly water levels.
- Open the local dashboard and verify the reference design still renders with images/symbols and the newly populated live data.

## Open Questions

- None.
