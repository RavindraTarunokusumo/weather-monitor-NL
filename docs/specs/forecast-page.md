# Forecast Page Spec

Status: Accepted
Spec path: `docs/specs/forecast-page.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-06-04

## Goal

Create a dedicated Forecast page that gives users a deeper, source-backed view of upcoming weather conditions for supported Dutch cities.

The page should go beyond the dashboard's compact outlook by showing richer hourly and daily forecast analytics, risk context, source freshness, and useful provider/reference links. It should help a user understand what is expected, when conditions change, why the app is flagging risks, and where the forecast data came from.

## Scope

This spec includes:

- Dedicated public Forecast page route:

```text
/forecast
```

- City-aware forecast experience for the supported city catalog.
- Reuse of the existing city selector pattern and supported-city metadata.
- Initial city selection derived from the current dashboard default, query string, or supported-city fallback.
- Deep forecast sections for:
  - next 24 hours
  - next 48 to 60 hours where provider data exists
  - 7-day outlook
  - rain timing and probability
  - wind speed and gust risk
  - temperature and apparent temperature
  - weather condition labels or weather codes normalized to display labels
  - active or upcoming KNMI warning state
  - best and worst outdoor windows
- Forecast risk timeline that combines precipitation, gusts, temperature comfort, warnings, and source availability into a compact human-readable sequence.
- Source and methodology section with:
  - source freshness for forecast, weather, warnings, air, and water where available
  - provider names
  - links to relevant provider or project documentation
  - clear distinction between official warnings and forecast interpretation
- Data availability and stale-data states for partial or missing forecast data.
- Forecast-specific frontend components under `app/forecast/` or a closely named route/module boundary.
- Forecast-specific shared types and formatting helpers where the existing dashboard types are too compact.
- A server-side API path or response shape that supplies the Forecast page without browser-side external provider calls.
- Tests for page rendering, city switching, missing data, source links, and forecast analytics display.
- Documentation updates for commands, architecture, and data-source attribution if implementation adds or changes API/data behavior.

Recommended public API route if the existing dashboard response is not rich enough:

```http
GET /api/forecast?city=<slug>
```

The implementation may start by deriving this response from existing dashboard snapshots and only add durable persistence if richer forecast fields are not already available in stored snapshot payloads.

## Non-Goals

The following are intentionally out of scope:

- Browser-side calls to Open-Meteo, KNMI, Luchtmeetnet, Rijkswaterstaat, RIVM, or other external providers.
- User accounts, saved locations, notification preferences, or personalized forecast settings.
- Forecasts for unsupported cities.
- Long-range seasonal, climate, or historical trend analysis.
- Raw GRIB decoding or direct KNMI HARMONIE domain-file processing.
- Full model comparison across multiple forecast providers.
- User-editable thresholds for risk scoring.
- Export, download, or printable report workflows.
- Replacing the dashboard page or removing the existing dashboard outlook panel.
- Presenting the app as an official warning or safety authority.

## Acceptance Criteria

- `/forecast` loads without requiring sign-in.
- The page displays the selected supported city and lets the user switch to another supported city.
- Forecast data is fetched from same-app server routes or server-rendered data, never directly from external provider APIs in the browser.
- The page shows a richer hourly forecast than the dashboard panel, including time, condition, temperature, apparent temperature where available, precipitation amount or probability, wind speed, and gusts.
- The page shows a 7-day forecast with day labels, high/low temperature, precipitation probability or amount, and condition labels where available.
- The page clearly distinguishes available, unavailable, and stale forecast fields instead of filling unknown values with invented data.
- The page includes a risk timeline or equivalent analytic view that highlights meaningful forecast changes and upcoming risk windows.
- The page includes best and worst outdoor windows derived from stored forecast/dashboard data.
- The page shows KNMI warning state when available and labels unavailable warning data distinctly from "no warning".
- The page includes source freshness and provider links for the displayed forecast and warning data.
- The source/methodology copy makes clear that official warnings come from KNMI warning data and that app risk labels are deterministic interpretation.
- Existing dashboard behavior at `/` remains unchanged except for intentional navigation links to the Forecast page.
- City switching preserves a usable loading state and handles failed forecast loads without crashing the page.
- Missing forecast data renders useful empty states and points users to source freshness rather than showing blank panels.
- Automated tests cover rendering, city switching, missing data, stale source display, and risk timeline output.
- Documentation is updated if a new API route, response type, command, or source attribution requirement is added.

## Constraints

- Use the existing Next.js App Router application.
- Use TypeScript.
- Use Tailwind/global CSS conventions already present in the app; do not introduce a new styling framework.
- Use the supported-city catalog as the source of city options.
- Keep provider calls in server-side ingestion or route handler code.
- Keep forecast calculations and risk derivation out of UI components.
- Keep public page latency independent from live provider latency by reading persisted snapshots or normalized server-side data.
- Preserve the existing dashboard response contract unless a deliberate, tested extension is needed.
- Do not expose provider API keys, raw provider payloads, or secrets in browser bundles.
- Do not prefix server-only keys with `NEXT_PUBLIC_`.
- Treat Open-Meteo forecast data as a pragmatic forecast source, not as an official warning source.
- Treat KNMI warning data as the authoritative source for warning labels.
- The product remains an interpretation layer, not an official weather, flood, or emergency warning service.
- Use accessible semantic markup and readable contrast.
- UI must handle partial city data because supported cities may not all have equally complete source coverage.

## Implementation Notes

### Current Repo Seams

Likely implementation areas:

```text
app/page.tsx
app/dashboard/components/TopNav.tsx
app/dashboard/components/OutlookPanel.tsx
app/dashboard/types.ts
app/dashboard/format.ts
lib/api/dashboard-client.ts
lib/dashboard.ts
lib/dashboard-regeneration.ts
lib/supported-cities.ts
lib/types/dashboard.ts
app/api/dashboard/route.ts
app/api/cities/route.ts
docs/architecture.md
docs/commands.md
docs/database.md
docs/testing.md
```

Recommended new areas if the page needs its own boundary:

```text
app/forecast/page.tsx
app/forecast/components/*
app/forecast/format.ts
app/forecast/types.ts
app/api/forecast/route.ts
lib/types/forecast.ts
lib/forecast.ts
tests/forecast.test.ts
```

### Page Structure

Recommended layout:

```text
Top navigation
  product name
  Dashboard link
  Forecast link
  city selector

Forecast header
  city name
  generated timestamp
  short condition summary
  active warning pill

Forecast intelligence
  best window
  main risk
  next meaningful change
  data confidence/freshness summary

Hourly analytics
  24-hour chart/table
  48-60 hour extended hourly list when available
  metric toggles for rain, temperature, apparent temperature, wind, gusts

Risk timeline
  notable rain, gust, warning, temperature, and comfort windows

7-day outlook
  daily cards or dense table with high/low, rain, wind/gust, condition

Sources and methodology
  source freshness
  provider links
  brief deterministic methodology notes
```

The page should feel denser and more analytical than the home dashboard while remaining readable for non-specialist users. Avoid a marketing-style landing page; the first viewport should be the usable forecast experience.

### Data Shape

If adding `GET /api/forecast`, use a compact normalized response rather than raw provider payloads.

Suggested first-pass shape:

```typescript
type ForecastResponse = {
  city: {
    slug: string;
    name: string;
    timezone: string;
  };
  generated_at: string;
  summary: {
    condition_label: string | null;
    best_window: string | null;
    worst_window: string | null;
    main_risk: string | null;
    next_change: string | null;
    warning_level: string | null;
  };
  hourly: ForecastHour[];
  daily: ForecastDay[];
  risk_timeline: ForecastRiskEvent[];
  source_freshness: ForecastFreshnessEntry[];
  links: ForecastSourceLink[];
};
```

Suggested normalized forecast rows:

```typescript
type ForecastHour = {
  starts_at: string;
  label: string;
  condition_label: string | null;
  weather_code: string | null;
  temperature_c: number | null;
  apparent_temperature_c: number | null;
  precipitation_mm: number | null;
  precipitation_probability: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  risk_label: string | null;
};

type ForecastDay = {
  date: string;
  label: string;
  condition_label: string | null;
  temperature_max_c: number | null;
  temperature_min_c: number | null;
  apparent_temperature_max_c: number | null;
  apparent_temperature_min_c: number | null;
  precipitation_sum_mm: number | null;
  precipitation_probability_max: number | null;
  wind_speed_max_kmh: number | null;
  wind_gust_max_kmh: number | null;
  risk_label: string | null;
};
```

Suggested risk event shape:

```typescript
type ForecastRiskEvent = {
  starts_at: string;
  ends_at: string | null;
  severity: "info" | "watch" | "warning" | "severe";
  category: "rain" | "wind" | "temperature" | "warning" | "comfort" | "data";
  title: string;
  detail: string;
};
```

### Data Derivation

Prefer deriving the Forecast page from existing persisted forecast/dashboard snapshot data introduced by `docs/specs/forecast-summary-trend-data-wiring.md`.

If the current persisted shape only exposes dashboard-level `outlook.hourly` and `outlook.weekly`, implementation should either:

- extend dashboard snapshot normalization to retain the needed forecast details, or
- add a forecast-specific normalized API that reads from stored forecast payloads or forecast-enriched summary payloads.

The Forecast page must not block on live provider calls during render.

Recommended first-pass risk derivation:

- `warning` when an active KNMI warning is yellow, orange, or red.
- `wind` when gusts exceed deterministic thresholds defined in shared forecast logic.
- `rain` when precipitation amount or probability crosses deterministic thresholds.
- `temperature` when apparent temperature is unusually low or high for outdoor activity.
- `comfort` when combined rain, wind, and apparent temperature make outdoor conditions poor.
- `data` when forecast or warning sources are stale or unavailable.

Thresholds should be defined in server-side/shared calculation helpers and covered by unit tests.

### Source Links

Recommended links:

```text
Open-Meteo KNMI forecast documentation
KNMI Data Platform warnings dataset
Project data-source documentation
```

Provider links should be normal links on the Forecast page, not hidden only in documentation. Links should not expose secrets, query tokens, or raw internal payload URLs.

## Test Expectations

Automated checks:

- Forecast API or data-shaping tests cover complete forecast data.
- Forecast API or data-shaping tests cover missing hourly values without inventing values.
- Forecast risk derivation tests cover rain, wind, temperature, warning, comfort, and stale-data events.
- Forecast page/component tests render selected city, summary, hourly analytics, daily outlook, risk timeline, source freshness, and source links.
- Forecast page/component tests cover city switching and failed forecast loads.
- Forecast page/component tests cover partial data empty states.
- Navigation tests cover access from dashboard to forecast if dashboard navigation changes.
- Existing dashboard tests continue to pass.
- All external provider HTTP calls remain mocked in automated tests.

Manual checks:

- Run the local app.
- Open `http://localhost:3000/forecast`.
- Verify the default city forecast loads.
- Switch between supported cities and verify forecast sections update.
- Verify missing or stale source states are readable and do not collapse layout.
- Verify provider/source links are visible and open expected public documentation pages.
- Verify the dashboard at `http://localhost:3000/` still works.
- On production validation, verify backing source identifiers through:

```text
/api/dashboard?city=amsterdam
/api/dashboard?city=utrecht
/api/dashboard?city=rotterdam
```

before trusting rendered source labels.

Not applicable:

- Auth flow tests.
- Notification delivery tests.
- Raw provider payload export tests.
- Long-range climate analysis tests.

## Open Questions

- None.
