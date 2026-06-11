# Forecast Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the accepted source-backed Forecast page from `docs/specs/forecast-page.md`.

**Architecture:** Add a forecast-specific response layer that derives richer forecast analytics from existing dashboard snapshots and `summary_payload`, then expose it through a same-app `/api/forecast?city=<slug>` route. Build `/forecast` as a focused React route with client-side city switching, dense analytics, source links, and deterministic risk output while leaving the current iframe-backed home dashboard behavior intact.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Prisma, existing global CSS, Vitest, React Testing Library, happy-dom.

---

## Files and Responsibilities

- `TODO.md`: active Forecast page session checklist derived from `docs/specs/forecast-page.md`.
- `docs/specs/forecast-page.md`: accepted implementation contract to stage and include in the first commit.
- `docs/superpowers/plans/2026-06-11-forecast-page.md`: this implementation plan.
- `lib/types/forecast.ts`: public Forecast API response types shared by route and UI.
- `lib/forecast.ts`: server-side forecast response shaping, source links, and risk derivation from dashboard snapshots.
- `app/api/forecast/route.ts`: same-app Forecast API route; no external provider calls.
- `app/forecast/page.tsx`: server entry point for `/forecast`.
- `app/forecast/components/ForecastShell.tsx`: client-side city switching and page composition.
- `app/forecast/components/ForecastSummary.tsx`: selected-city header, best/worst windows, main risk, next change, and warning pill.
- `app/forecast/components/ForecastHourly.tsx`: 24-hour and 48-60-hour hourly analytics.
- `app/forecast/components/ForecastDaily.tsx`: 7-day outlook table/cards.
- `app/forecast/components/RiskTimeline.tsx`: deterministic risk event list.
- `app/forecast/components/ForecastSources.tsx`: source freshness and provider/project links.
- `app/forecast/format.ts`: display formatting helpers for forecast values and timestamps.
- `app/forecast/__tests__/ForecastShell.test.tsx`: Forecast page/component behavior tests.
- `tests/forecast.test.ts`: Forecast response shaping and risk derivation tests.
- `Dutch Weather Dashboard.html`: minimal static dashboard nav link from Forecast to `/forecast`.
- `app/dashboard/components/TopNav.tsx`: align dormant React dashboard nav link behavior if that shell is reused later.
- `docs/architecture.md`: document new Forecast API/page boundary.
- `docs/commands.md`: add local Forecast API/manual page checks.
- `docs/testing.md`: add Forecast page test command notes.
- `.github/git_notes_template.md`: source template for git notes after each commit.

---

### Task 1: Start the Accepted Spec Session

**Files:**
- Modify: `TODO.md`
- Stage later: `docs/specs/forecast-page.md`
- Stage later: `docs/superpowers/plans/2026-06-11-forecast-page.md`

- [ ] **Step 1: Confirm current branch and status**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/forecast-page`; `docs/specs/forecast-page.md` and this plan are untracked or modified. Existing untracked visual/reference files may remain untouched.

- [ ] **Step 2: Add the active session to `TODO.md` before implementation edits**

Add this session under the active section in `TODO.md`, preserving unrelated active or future work:

```markdown
<!-- forecast-page — spec: docs/specs/forecast-page.md -->

### Forecast Page

- [ ] Create normalized Forecast API response and deterministic risk derivation.
- [ ] Build the `/forecast` page with city switching and analytics sections.
- [ ] Add dashboard navigation links to the Forecast page.
- [ ] Update docs and run pre-PR validation.
```

- [ ] **Step 3: Run pre-commit checks before the first docs/session commit**

Run:

```bash
npm run lint
npm run typecheck
npm test
```

Expected: all three commands pass before committing the accepted spec, plan, and session checklist.

- [ ] **Step 4: Commit the accepted spec, plan, and session start**

Run specific staging only:

```bash
git add docs/specs/forecast-page.md docs/superpowers/plans/2026-06-11-forecast-page.md TODO.md
git commit -m "docs: accept forecast page spec"
```

Then attach a git note based on `.github/git_notes_template.md` that includes:

```text
Spec: docs/specs/forecast-page.md
Scope: Accepted Forecast page spec, implementation plan, and active TODO session.
Validation: npm run lint; npm run typecheck; npm test
```

Mark the session-start TODO sub-item with the resulting commit hash.

---

### Task 2: Create Forecast Response Shaping and API

**Files:**
- Create: `lib/types/forecast.ts`
- Create: `lib/forecast.ts`
- Create: `app/api/forecast/route.ts`
- Create: `tests/forecast.test.ts`
- Modify: `TODO.md`

- [ ] **Step 1: Write the failing Forecast response tests**

Create `tests/forecast.test.ts` with coverage for complete data, missing data, risk events, source links, and unsupported cities:

```typescript
import { describe, expect, it } from "vitest";
import { buildForecastResponse } from "@/lib/forecast";

const city = {
  id: "city-1",
  slug: "amsterdam",
  name: "Amsterdam",
  timezone: "Europe/Amsterdam",
};

const snapshot = {
  generatedAt: new Date("2026-06-11T08:00:00.000Z"),
  cycleComfortScore: 72,
  cycleComfortLabel: "good",
  bestOutdoorWindow: "10:00-13:00",
  worstOutdoorWindow: "18:00-21:00",
  summaryPayload: {
    ui_summary: {
      best_window: "10:00-13:00",
      main_risk: "Evening gusts and showers",
      changed: "Rain risk increases after 18:00",
      outdoor_window_detail: "Late morning has the lowest rain and wind risk.",
      risk_detail: "Gusts become more noticeable in the evening.",
      changed_detail: "The afternoon update increased rain chances after 18:00.",
    },
    current: {
      weather_code: "partly_cloudy",
      warning_level: "yellow",
      rain_probability: 0.35,
    },
    outlook: {
      hourly: [
        { h: "09", rain: 10, wind: 18, temp: 16, apparent_temperature: 15, weather_code: "partly_cloudy" },
        { h: "12", rain: 20, wind: 22, temp: 18, apparent_temperature: 17, weather_code: "partly_cloudy" },
        { h: "15", rain: 45, wind: 32, temp: 17, apparent_temperature: 15, weather_code: "showers" },
        { h: "18", rain: 75, wind: 38, temp: 15, apparent_temperature: 12, weather_code: "heavy_showers" },
      ],
      weekly: [
        { day: "Thu", hi: 18, lo: 11, rain: 75, weather_code: "showers", wind: 32 },
        { day: "Fri", hi: 19, lo: 12, rain: 30, weather_code: "partly_cloudy", wind: 21 },
      ],
    },
    source_status: {
      weather: {
        source: "knmi",
        status: "fresh",
        observed_at: "2026-06-11T07:50:00.000Z",
        detail: null,
      },
      air_quality: {
        source: "luchtmeetnet",
        status: "fresh",
        observed_at: "2026-06-11T07:00:00.000Z",
        detail: null,
      },
      water: {
        source: "rijkswaterstaat",
        status: "stale",
        observed_at: "2026-06-10T07:00:00.000Z",
        detail: "Latest water observation is older than 24 hours.",
      },
    },
  },
  weatherSnapshot: {
    observedAt: new Date("2026-06-11T07:50:00.000Z"),
    temperatureC: 16.2,
    feelsLikeC: 15.1,
    rainMm: 0.3,
    rainProbability: 0.35,
    windSpeedKmh: 18,
    windGustKmh: 42,
    windDirection: "WSW",
    weatherCode: "partly_cloudy",
    warningLevel: "yellow",
    sourceName: "knmi",
    ingestedAt: new Date("2026-06-11T07:58:00.000Z"),
  },
  airQualitySnapshot: {
    observedAt: new Date("2026-06-11T07:00:00.000Z"),
    sourceName: "luchtmeetnet",
    ingestedAt: new Date("2026-06-11T07:55:00.000Z"),
  },
  waterSnapshot: {
    observedAt: new Date("2026-06-10T07:00:00.000Z"),
    sourceName: "rijkswaterstaat",
    ingestedAt: new Date("2026-06-11T07:50:00.000Z"),
  },
  aiBriefings: [],
};

describe("buildForecastResponse", () => {
  it("maps dashboard snapshot data into the Forecast API contract", () => {
    const response = buildForecastResponse(city, snapshot);

    expect(response.city).toEqual({
      slug: "amsterdam",
      name: "Amsterdam",
      timezone: "Europe/Amsterdam",
    });
    expect(response.summary).toMatchObject({
      condition_label: "Partly cloudy",
      best_window: "10:00-13:00",
      worst_window: "18:00-21:00",
      main_risk: "Evening gusts and showers",
      next_change: "Rain risk increases after 18:00",
      warning_level: "yellow",
    });
    expect(response.hourly).toHaveLength(4);
    expect(response.hourly[0]).toMatchObject({
      label: "09",
      condition_label: "Partly cloudy",
      temperature_c: 16,
      apparent_temperature_c: 15,
      precipitation_probability: 10,
      wind_speed_kmh: 18,
    });
    expect(response.daily).toHaveLength(2);
    expect(response.daily[0]).toMatchObject({
      label: "Thu",
      temperature_max_c: 18,
      temperature_min_c: 11,
      precipitation_probability_max: 75,
      wind_speed_max_kmh: 32,
    });
    expect(response.source_freshness.map((item) => item.source)).toEqual([
      "knmi",
      "luchtmeetnet",
      "rijkswaterstaat",
      "knmi_warnings",
      "open_meteo",
    ]);
    expect(response.links.map((item) => item.label)).toEqual([
      "Open-Meteo KNMI forecast documentation",
      "KNMI Data Platform warnings dataset",
      "Project commands and data-source notes",
    ]);
  });

  it("derives deterministic risk events without inventing missing values", () => {
    const response = buildForecastResponse(city, snapshot);

    expect(response.risk_timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ category: "warning", severity: "warning" }),
        expect.objectContaining({ category: "rain", severity: "warning" }),
        expect.objectContaining({ category: "wind", severity: "watch" }),
        expect.objectContaining({ category: "data", severity: "watch" }),
      ]),
    );
  });

  it("returns explicit unavailable states when forecast outlook data is missing", () => {
    const response = buildForecastResponse(city, {
      ...snapshot,
      summaryPayload: {
        ui_summary: {},
        source_status: {},
      },
      weatherSnapshot: null,
      airQualitySnapshot: null,
      waterSnapshot: null,
    });

    expect(response.summary.condition_label).toBeNull();
    expect(response.summary.warning_level).toBe("unknown");
    expect(response.hourly).toEqual([]);
    expect(response.daily).toEqual([]);
    expect(response.risk_timeline).toEqual([
      expect.objectContaining({
        category: "data",
        severity: "watch",
        title: "Forecast data unavailable",
      }),
    ]);
    expect(response.source_freshness[0]).toMatchObject({
      source: "weather",
      status: "missing",
    });
  });
});
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run:

```bash
npm test -- tests/forecast.test.ts
```

Expected: test fails because `@/lib/forecast` and forecast types do not exist.

- [ ] **Step 3: Create shared Forecast types**

Create `lib/types/forecast.ts`:

```typescript
export type ForecastCity = {
  slug: string;
  name: string;
  timezone: string;
};

export type ForecastSummary = {
  condition_label: string | null;
  best_window: string | null;
  worst_window: string | null;
  main_risk: string | null;
  next_change: string | null;
  warning_level: string | null;
};

export type ForecastHour = {
  starts_at: string | null;
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

export type ForecastDay = {
  date: string | null;
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

export type ForecastRiskEvent = {
  starts_at: string | null;
  ends_at: string | null;
  severity: "info" | "watch" | "warning" | "severe";
  category: "rain" | "wind" | "temperature" | "warning" | "comfort" | "data";
  title: string;
  detail: string;
};

export type ForecastFreshnessEntry = {
  source: string;
  updated_at: string | null;
  observed_at: string | null;
  status: string;
  detail: string | null;
};

export type ForecastSourceLink = {
  label: string;
  href: string;
  source: string;
};

export type ForecastResponse = {
  city: ForecastCity;
  generated_at: string;
  summary: ForecastSummary;
  hourly: ForecastHour[];
  daily: ForecastDay[];
  risk_timeline: ForecastRiskEvent[];
  source_freshness: ForecastFreshnessEntry[];
  links: ForecastSourceLink[];
};
```

- [ ] **Step 4: Implement forecast response shaping**

Create `lib/forecast.ts` with these exported functions:

```typescript
import type {
  ForecastDay,
  ForecastFreshnessEntry,
  ForecastHour,
  ForecastResponse,
  ForecastRiskEvent,
  ForecastSourceLink,
} from "@/lib/types/forecast";

type PublicCity = {
  slug: string;
  name: string;
  timezone: string;
};

type SnapshotDate = Date | string | null;
type JsonRecord = Record<string, unknown>;

type ForecastSnapshotForResponse = {
  generatedAt: Date | string;
  cycleComfortLabel: string | null;
  bestOutdoorWindow: string | null;
  worstOutdoorWindow: string | null;
  summaryPayload: unknown;
  weatherSnapshot: {
    observedAt: SnapshotDate;
    temperatureC: number | null;
    feelsLikeC: number | null;
    rainMm: number | null;
    rainProbability: number | null;
    windSpeedKmh: number | null;
    windGustKmh: number | null;
    weatherCode: string | null;
    warningLevel: string | null;
    sourceName: string;
    ingestedAt: SnapshotDate;
  } | null;
  airQualitySnapshot: {
    observedAt: SnapshotDate;
    sourceName: string;
    ingestedAt: SnapshotDate;
  } | null;
  waterSnapshot: {
    observedAt: SnapshotDate;
    sourceName: string;
    ingestedAt: SnapshotDate;
  } | null;
};

function toIsoString(value: SnapshotDate) {
  if (!value) return null;
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asRecord(value: unknown): JsonRecord | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : null;
}

function readString(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function readNumber(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readRecordArray(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return Array.isArray(value) ? value.map(asRecord).filter((item): item is JsonRecord => item !== null) : [];
}

function formatWeatherCode(value: string | null | undefined) {
  if (!value) return null;
  const label = value.split("_").join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function sourceStatus(summaryPayload: unknown, key: string) {
  const root = asRecord(summaryPayload);
  const statuses = asRecord(root?.source_status);
  return asRecord(statuses?.[key]);
}

function freshnessItem(options: {
  key: "weather" | "air_quality" | "water";
  fallbackSource: string;
  snapshot: { sourceName: string; observedAt: SnapshotDate; ingestedAt: SnapshotDate } | null;
  summaryPayload: unknown;
}): ForecastFreshnessEntry {
  const status = sourceStatus(options.summaryPayload, options.key);
  if (!options.snapshot) {
    return {
      source: options.fallbackSource,
      updated_at: null,
      observed_at: null,
      status: "missing",
      detail: `No ${options.key.replace("_", " ")} snapshot is available for this city.`,
    };
  }

  return {
    source: options.snapshot.sourceName,
    updated_at: toIsoString(options.snapshot.ingestedAt),
    observed_at: readString(status, "observed_at") ?? toIsoString(options.snapshot.observedAt),
    status: readString(status, "status") ?? "fresh",
    detail: readString(status, "detail"),
  };
}

function normalizeHour(item: JsonRecord): ForecastHour {
  const weatherCode = readString(item, "weather_code");
  const rain = readNumber(item, "rain");
  const wind = readNumber(item, "wind");
  const temp = readNumber(item, "temp");

  return {
    starts_at: readString(item, "starts_at"),
    label: readString(item, "h") ?? readString(item, "label") ?? "--",
    condition_label: formatWeatherCode(weatherCode),
    weather_code: weatherCode,
    temperature_c: temp,
    apparent_temperature_c: readNumber(item, "apparent_temperature"),
    precipitation_mm: readNumber(item, "precipitation_mm"),
    precipitation_probability: rain,
    wind_speed_kmh: wind,
    wind_gust_kmh: readNumber(item, "gust"),
    risk_label: riskLabel({ rain, wind, warning: null }),
  };
}

function normalizeDay(item: JsonRecord): ForecastDay {
  const weatherCode = readString(item, "weather_code");
  const rain = readNumber(item, "rain");
  const wind = readNumber(item, "wind");

  return {
    date: readString(item, "date"),
    label: readString(item, "day") ?? readString(item, "label") ?? "--",
    condition_label: formatWeatherCode(weatherCode),
    temperature_max_c: readNumber(item, "hi"),
    temperature_min_c: readNumber(item, "lo"),
    apparent_temperature_max_c: readNumber(item, "apparent_temperature_max"),
    apparent_temperature_min_c: readNumber(item, "apparent_temperature_min"),
    precipitation_sum_mm: readNumber(item, "precipitation_sum_mm"),
    precipitation_probability_max: rain,
    wind_speed_max_kmh: wind,
    wind_gust_max_kmh: readNumber(item, "gust"),
    risk_label: riskLabel({ rain, wind, warning: null }),
  };
}

function riskLabel(values: { rain: number | null; wind: number | null; warning: string | null }) {
  if (values.warning && values.warning !== "none" && values.warning !== "unknown") return "warning";
  if ((values.rain ?? 0) >= 70) return "wet";
  if ((values.wind ?? 0) >= 35) return "windy";
  if ((values.rain ?? 0) >= 40 || (values.wind ?? 0) >= 28) return "watch";
  return "low";
}

export function buildRiskTimeline(options: {
  warningLevel: string | null;
  hourly: ForecastHour[];
  freshness: ForecastFreshnessEntry[];
}): ForecastRiskEvent[] {
  if (options.hourly.length === 0) {
    return [
      {
        starts_at: null,
        ends_at: null,
        severity: "watch",
        category: "data",
        title: "Forecast data unavailable",
        detail: "Hourly and daily forecast details are not available in the latest snapshot.",
      },
    ];
  }

  const events: ForecastRiskEvent[] = [];

  if (options.warningLevel && !["none", "unknown"].includes(options.warningLevel)) {
    events.push({
      starts_at: null,
      ends_at: null,
      severity: options.warningLevel === "red" ? "severe" : "warning",
      category: "warning",
      title: `${formatWeatherCode(options.warningLevel)} KNMI warning`,
      detail: "Official warning state is shown separately from app interpretation.",
    });
  }

  const rainy = options.hourly.find((item) => (item.precipitation_probability ?? 0) >= 70);
  if (rainy) {
    events.push({
      starts_at: rainy.starts_at,
      ends_at: null,
      severity: "warning",
      category: "rain",
      title: `Rain risk around ${rainy.label}`,
      detail: `${rainy.precipitation_probability}% precipitation probability is expected.`,
    });
  }

  const windy = options.hourly.find((item) => (item.wind_gust_kmh ?? item.wind_speed_kmh ?? 0) >= 35);
  if (windy) {
    events.push({
      starts_at: windy.starts_at,
      ends_at: null,
      severity: "watch",
      category: "wind",
      title: `Wind picks up around ${windy.label}`,
      detail: "Gust or wind-speed thresholds indicate less comfortable outdoor conditions.",
    });
  }

  const stale = options.freshness.find((item) => item.status !== "fresh");
  if (stale) {
    events.push({
      starts_at: stale.observed_at,
      ends_at: null,
      severity: "watch",
      category: "data",
      title: `${stale.source} data is ${stale.status}`,
      detail: stale.detail ?? "Source freshness should be checked before relying on this forecast.",
    });
  }

  if (events.length === 0 && options.hourly.length > 0) {
    events.push({
      starts_at: options.hourly[0].starts_at,
      ends_at: null,
      severity: "info",
      category: "comfort",
      title: "No major forecast risks",
      detail: "Rain, wind, and warning thresholds stay below watch levels in the available forecast.",
    });
  }

  return events;
}

export function forecastSourceLinks(): ForecastSourceLink[] {
  return [
    {
      label: "Open-Meteo KNMI forecast documentation",
      href: "https://open-meteo.com/en/docs/knmi-api",
      source: "open_meteo",
    },
    {
      label: "KNMI Data Platform warnings dataset",
      href: "https://dataplatform.knmi.nl/dataset/access/waarschuwingen-nederland-48h-1-0",
      source: "knmi_warnings",
    },
    {
      label: "Project commands and data-source notes",
      href: "https://github.com/RavindraTarunokusumo/weather-monitor-NL/blob/main/docs/commands.md",
      source: "project_docs",
    },
  ];
}

export function buildForecastResponse(city: PublicCity, snapshot: ForecastSnapshotForResponse): ForecastResponse {
  const summaryPayload = asRecord(snapshot.summaryPayload);
  const uiSummary = asRecord(summaryPayload?.ui_summary);
  const outlook = asRecord(summaryPayload?.outlook);
  const current = asRecord(summaryPayload?.current);
  const weatherCode = snapshot.weatherSnapshot?.weatherCode ?? readString(current, "weather_code");
  const warningLevel = snapshot.weatherSnapshot?.warningLevel ?? readString(current, "warning_level") ?? "unknown";
  const freshness = [
    freshnessItem({ key: "weather", fallbackSource: "weather", snapshot: snapshot.weatherSnapshot, summaryPayload: snapshot.summaryPayload }),
    freshnessItem({ key: "air_quality", fallbackSource: "air_quality", snapshot: snapshot.airQualitySnapshot, summaryPayload: snapshot.summaryPayload }),
    freshnessItem({ key: "water", fallbackSource: "water", snapshot: snapshot.waterSnapshot, summaryPayload: snapshot.summaryPayload }),
    { source: "knmi_warnings", updated_at: snapshot.weatherSnapshot ? toIsoString(snapshot.weatherSnapshot.ingestedAt) : null, observed_at: null, status: warningLevel === "unknown" ? "missing" : "fresh", detail: null },
    { source: "open_meteo", updated_at: snapshot.weatherSnapshot ? toIsoString(snapshot.weatherSnapshot.ingestedAt) : null, observed_at: null, status: snapshot.weatherSnapshot ? "fresh" : "missing", detail: null },
  ];
  const hourly = readRecordArray(outlook, "hourly").map(normalizeHour);
  const daily = readRecordArray(outlook, "weekly").map(normalizeDay);

  return {
    city: { slug: city.slug, name: city.name, timezone: city.timezone },
    generated_at: toIsoString(snapshot.generatedAt) ?? new Date(0).toISOString(),
    summary: {
      condition_label: formatWeatherCode(weatherCode),
      best_window: readString(uiSummary, "best_window") ?? snapshot.bestOutdoorWindow,
      worst_window: snapshot.worstOutdoorWindow,
      main_risk: readString(uiSummary, "main_risk"),
      next_change: readString(uiSummary, "changed"),
      warning_level: warningLevel,
    },
    hourly,
    daily,
    risk_timeline: buildRiskTimeline({ warningLevel, hourly, freshness }),
    source_freshness: freshness,
    links: forecastSourceLinks(),
  };
}
```

- [ ] **Step 5: Add the Forecast API route**

Create `app/api/forecast/route.ts`:

```typescript
import { buildForecastResponse } from "@/lib/forecast";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
  });

  if (!city || !city.isActive) {
    return Response.json({ error: "Unsupported city", city: citySlug }, { status: 404 });
  }

  const snapshot = await prisma.dashboardSnapshot.findFirst({
    where: { cityId: city.id },
    orderBy: { generatedAt: "desc" },
    include: {
      weatherSnapshot: true,
      airQualitySnapshot: true,
      waterSnapshot: true,
    },
  });

  if (!snapshot) {
    return Response.json({ error: "No forecast data available", city: citySlug }, { status: 404 });
  }

  return Response.json(buildForecastResponse(city, snapshot));
}
```

- [ ] **Step 6: Run the targeted Forecast tests**

Run:

```bash
npm test -- tests/forecast.test.ts
```

Expected: all tests in `tests/forecast.test.ts` pass.

- [ ] **Step 7: Run typecheck for the new API boundary**

Run:

```bash
npm run typecheck
```

Expected: TypeScript passes with the new route and forecast types.

- [ ] **Step 8: Commit the Forecast API work**

Run:

```bash
npm run lint
npm run typecheck
npm test -- tests/forecast.test.ts tests/dashboard.test.ts
git add lib/types/forecast.ts lib/forecast.ts app/api/forecast/route.ts tests/forecast.test.ts TODO.md
git commit -m "feat(forecast): add forecast API response"
```

Attach a git note with:

```text
Spec: docs/specs/forecast-page.md
Scope: Forecast API response shaping, source links, and deterministic risk timeline.
Validation: npm run lint; npm run typecheck; npm test -- tests/forecast.test.ts tests/dashboard.test.ts
```

Mark the Forecast API TODO sub-item with the commit hash.

---

### Task 3: Build the `/forecast` Page

**Files:**
- Create: `app/forecast/page.tsx`
- Create: `app/forecast/format.ts`
- Create: `app/forecast/components/ForecastShell.tsx`
- Create: `app/forecast/components/ForecastSummary.tsx`
- Create: `app/forecast/components/ForecastHourly.tsx`
- Create: `app/forecast/components/ForecastDaily.tsx`
- Create: `app/forecast/components/RiskTimeline.tsx`
- Create: `app/forecast/components/ForecastSources.tsx`
- Create: `app/forecast/__tests__/ForecastShell.test.tsx`
- Modify: `app/globals.css`
- Modify: `TODO.md`

- [ ] **Step 1: Write failing component tests**

Create `app/forecast/__tests__/ForecastShell.test.tsx`:

```typescript
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ForecastShell } from "../components/ForecastShell";
import type { ForecastResponse } from "@/lib/types/forecast";

const amsterdamForecast: ForecastResponse = {
  city: { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  generated_at: "2026-06-11T08:00:00.000Z",
  summary: {
    condition_label: "Partly cloudy",
    best_window: "10:00-13:00",
    worst_window: "18:00-21:00",
    main_risk: "Evening gusts and showers",
    next_change: "Rain risk increases after 18:00",
    warning_level: "yellow",
  },
  hourly: [
    { starts_at: null, label: "09", condition_label: "Partly cloudy", weather_code: "partly_cloudy", temperature_c: 16, apparent_temperature_c: 15, precipitation_mm: null, precipitation_probability: 10, wind_speed_kmh: 18, wind_gust_kmh: 28, risk_label: "low" },
    { starts_at: null, label: "18", condition_label: "Heavy showers", weather_code: "heavy_showers", temperature_c: 15, apparent_temperature_c: 12, precipitation_mm: null, precipitation_probability: 75, wind_speed_kmh: 38, wind_gust_kmh: 46, risk_label: "wet" },
  ],
  daily: [
    { date: null, label: "Thu", condition_label: "Showers", temperature_max_c: 18, temperature_min_c: 11, apparent_temperature_max_c: null, apparent_temperature_min_c: null, precipitation_sum_mm: null, precipitation_probability_max: 75, wind_speed_max_kmh: 32, wind_gust_max_kmh: null, risk_label: "wet" },
    { date: null, label: "Fri", condition_label: "Partly cloudy", temperature_max_c: 19, temperature_min_c: 12, apparent_temperature_max_c: null, apparent_temperature_min_c: null, precipitation_sum_mm: null, precipitation_probability_max: 30, wind_speed_max_kmh: 21, wind_gust_max_kmh: null, risk_label: "low" },
  ],
  risk_timeline: [
    { starts_at: null, ends_at: null, severity: "warning", category: "warning", title: "Yellow KNMI warning", detail: "Official warning state is shown separately from app interpretation." },
    { starts_at: null, ends_at: null, severity: "warning", category: "rain", title: "Rain risk around 18", detail: "75% precipitation probability is expected." },
  ],
  source_freshness: [
    { source: "knmi", updated_at: "2026-06-11T07:58:00.000Z", observed_at: "2026-06-11T07:50:00.000Z", status: "fresh", detail: null },
    { source: "open_meteo", updated_at: "2026-06-11T07:58:00.000Z", observed_at: null, status: "fresh", detail: null },
  ],
  links: [
    { label: "Open-Meteo KNMI forecast documentation", href: "https://open-meteo.com/en/docs/knmi-api", source: "open_meteo" },
    { label: "KNMI Data Platform warnings dataset", href: "https://dataplatform.knmi.nl/dataset/access/waarschuwingen-nederland-48h-1-0", source: "knmi_warnings" },
  ],
};

const utrechtForecast: ForecastResponse = {
  ...amsterdamForecast,
  city: { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
  summary: { ...amsterdamForecast.summary, condition_label: "Mostly sunny", warning_level: "none" },
};

const cities = [
  { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ForecastShell", () => {
  it("renders deeper forecast analytics and source links", () => {
    render(<ForecastShell initialForecast={amsterdamForecast} initialCities={cities} />);

    expect(screen.getByRole("heading", { name: /forecast intelligence for amsterdam/i })).toBeInTheDocument();
    expect(screen.getByText("Partly cloudy")).toBeInTheDocument();
    expect(screen.getByText("10:00-13:00")).toBeInTheDocument();
    expect(screen.getByText("Evening gusts and showers")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /hourly forecast analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /risk timeline/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /7-day forecast/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /open-meteo knmi forecast documentation/i })).toHaveAttribute("href", "https://open-meteo.com/en/docs/knmi-api");
  });

  it("switches city through the same-app Forecast API", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = input.toString();
        if (url.includes("/api/forecast?city=utrecht")) return Response.json(utrechtForecast);
        return Response.json(amsterdamForecast);
      }),
    );

    render(<ForecastShell initialForecast={amsterdamForecast} initialCities={cities} />);

    await user.selectOptions(screen.getByLabelText(/select forecast city/i), "utrecht");
    expect(await screen.findByRole("heading", { name: /forecast intelligence for utrecht/i })).toBeInTheDocument();
    expect(screen.getByText("Mostly sunny")).toBeInTheDocument();
  });

  it("shows empty states and load failures without crashing", async () => {
    const user = userEvent.setup();
    vi.stubGlobal("fetch", vi.fn(async () => Response.json({ error: "No forecast data available" }, { status: 404 })));

    render(
      <ForecastShell
        initialForecast={{ ...amsterdamForecast, hourly: [], daily: [], risk_timeline: [] }}
        initialCities={cities}
      />,
    );

    expect(screen.getByText("Hourly forecast data is unavailable.")).toBeInTheDocument();
    expect(screen.getByText("Daily forecast data is unavailable.")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText(/select forecast city/i), "utrecht");
    expect(await screen.findByText("Forecast data could not be loaded.")).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run the component test and verify failure**

Run:

```bash
npm test -- app/forecast/__tests__/ForecastShell.test.tsx
```

Expected: test fails because Forecast components do not exist.

- [ ] **Step 3: Add Forecast formatting helpers**

Create `app/forecast/format.ts`:

```typescript
export function displayValue(value: string | number | null | undefined, fallback = "Unavailable") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export function displayTemperature(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}°C` : "Unavailable";
}

export function displayPercent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)}%` : "Unavailable";
}

export function displayWind(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value)} km/h` : "Unavailable";
}

export function displayDateTime(value: string | null | undefined, timezone = "Europe/Amsterdam") {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("en-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function sourceLabel(source: string) {
  return source
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}
```

- [ ] **Step 4: Add the server page**

Create `app/forecast/page.tsx`:

```typescript
import { buildForecastResponse } from "@/lib/forecast";
import { prisma } from "@/lib/db";
import { ForecastShell } from "./components/ForecastShell";

export const dynamic = "force-dynamic";

type ForecastPageProps = {
  searchParams?: Promise<{ city?: string }>;
};

export default async function ForecastPage({ searchParams }: ForecastPageProps) {
  const params = await searchParams;
  const citySlug = params?.city ?? "amsterdam";
  const city = await prisma.city.findFirst({
    where: { slug: citySlug, isActive: true },
  });
  const selectedCity = city ?? (await prisma.city.findFirst({ where: { slug: "amsterdam", isActive: true } }));

  if (!selectedCity) {
    throw new Error("No supported cities are available.");
  }

  const [snapshot, cities] = await Promise.all([
    prisma.dashboardSnapshot.findFirst({
      where: { cityId: selectedCity.id },
      orderBy: { generatedAt: "desc" },
      include: {
        weatherSnapshot: true,
        airQualitySnapshot: true,
        waterSnapshot: true,
      },
    }),
    prisma.city.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      select: { slug: true, name: true, timezone: true },
    }),
  ]);

  if (!snapshot) {
    throw new Error(`No forecast data is available for ${selectedCity.name}.`);
  }

  return (
    <ForecastShell
      initialForecast={buildForecastResponse(selectedCity, snapshot)}
      initialCities={cities}
    />
  );
}
```

- [ ] **Step 5: Add the Forecast shell and section components**

Create focused components that match the tests:

```typescript
// app/forecast/components/ForecastShell.tsx
"use client";

import React, { useState } from "react";
import type { ForecastCity, ForecastResponse } from "@/lib/types/forecast";
import { ForecastDaily } from "./ForecastDaily";
import { ForecastHourly } from "./ForecastHourly";
import { ForecastSources } from "./ForecastSources";
import { ForecastSummary } from "./ForecastSummary";
import { RiskTimeline } from "./RiskTimeline";

type ForecastShellProps = {
  initialForecast: ForecastResponse;
  initialCities: ForecastCity[];
};

export function ForecastShell({ initialForecast, initialCities }: ForecastShellProps) {
  const [forecast, setForecast] = useState(initialForecast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function selectCity(slug: string) {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(slug)}`);
      if (!response.ok) throw new Error("Forecast data could not be loaded.");
      setForecast((await response.json()) as ForecastResponse);
    } catch {
      setError("Forecast data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forecast-page">
      <header className="forecast-nav">
        <a href="/" className="forecast-brand">Dutch Weather Intelligence</a>
        <nav aria-label="Primary forecast navigation">
          <a href="/">Dashboard</a>
          <a href="/forecast" aria-current="page">Forecast</a>
        </nav>
        <label>
          <span className="sr-only">Select forecast city</span>
          <select
            aria-label="Select forecast city"
            value={forecast.city.slug}
            onChange={(event) => void selectCity(event.target.value)}
          >
            {initialCities.map((city) => (
              <option key={city.slug} value={city.slug}>{city.name}</option>
            ))}
          </select>
        </label>
      </header>
      {error ? <div className="forecast-error">{error}</div> : null}
      {loading ? <div className="forecast-loading">Loading forecast...</div> : null}
      <ForecastSummary forecast={forecast} />
      <div className="forecast-layout">
        <ForecastHourly forecast={forecast} />
        <RiskTimeline events={forecast.risk_timeline} />
        <ForecastDaily forecast={forecast} />
        <ForecastSources forecast={forecast} />
      </div>
    </main>
  );
}
```

Create the remaining components with these observable landmarks:

```typescript
// app/forecast/components/ForecastSummary.tsx
import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayDateTime, displayValue } from "../format";

export function ForecastSummary({ forecast }: { forecast: ForecastResponse }) {
  return (
    <section className="forecast-hero" aria-label="Forecast summary">
      <p className="eyebrow">Forecast intelligence</p>
      <h1>Forecast intelligence for {forecast.city.name}</h1>
      <p>{displayValue(forecast.summary.condition_label, "Condition unavailable")}</p>
      <div className="forecast-summary-grid">
        <article><h2>Best window</h2><strong>{displayValue(forecast.summary.best_window)}</strong></article>
        <article><h2>Worst window</h2><strong>{displayValue(forecast.summary.worst_window)}</strong></article>
        <article><h2>Main risk</h2><strong>{displayValue(forecast.summary.main_risk, "No known risk")}</strong></article>
        <article><h2>Next change</h2><strong>{displayValue(forecast.summary.next_change, "No change data")}</strong></article>
      </div>
      <p>Generated {displayDateTime(forecast.generated_at, forecast.city.timezone)}</p>
      <span className={`warning-pill ${forecast.summary.warning_level ?? "unknown"}`}>
        KNMI warning: {displayValue(forecast.summary.warning_level, "unknown")}
      </span>
    </section>
  );
}
```

```typescript
// app/forecast/components/ForecastHourly.tsx
import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayPercent, displayTemperature, displayValue, displayWind } from "../format";

export function ForecastHourly({ forecast }: { forecast: ForecastResponse }) {
  if (forecast.hourly.length === 0) {
    return <section className="forecast-panel" aria-label="Hourly forecast analytics"><h2>Hourly forecast analytics</h2><p>Hourly forecast data is unavailable.</p></section>;
  }

  return (
    <section className="forecast-panel" aria-label="Hourly forecast analytics">
      <h2>Hourly forecast analytics</h2>
      <div className="forecast-table" role="table" aria-label="Hourly forecast table">
        {forecast.hourly.map((hour) => (
          <div className="forecast-row" role="row" key={`${hour.label}-${hour.weather_code ?? "code"}`}>
            <span>{hour.label}</span>
            <span>{displayValue(hour.condition_label)}</span>
            <span>{displayTemperature(hour.temperature_c)}</span>
            <span>{displayTemperature(hour.apparent_temperature_c)}</span>
            <span>{displayPercent(hour.precipitation_probability)}</span>
            <span>{displayWind(hour.wind_speed_kmh)}</span>
            <span>{displayWind(hour.wind_gust_kmh)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

```typescript
// app/forecast/components/ForecastDaily.tsx
import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayPercent, displayTemperature, displayValue, displayWind } from "../format";

export function ForecastDaily({ forecast }: { forecast: ForecastResponse }) {
  if (forecast.daily.length === 0) {
    return <section className="forecast-panel" aria-label="7-day forecast"><h2>7-day forecast</h2><p>Daily forecast data is unavailable.</p></section>;
  }

  return (
    <section className="forecast-panel" aria-label="7-day forecast">
      <h2>7-day forecast</h2>
      <div className="forecast-day-grid">
        {forecast.daily.map((day) => (
          <article key={day.label}>
            <h3>{day.label}</h3>
            <p>{displayValue(day.condition_label)}</p>
            <strong>{displayTemperature(day.temperature_max_c)} / {displayTemperature(day.temperature_min_c)}</strong>
            <span>{displayPercent(day.precipitation_probability_max)} rain</span>
            <span>{displayWind(day.wind_speed_max_kmh)} wind</span>
          </article>
        ))}
      </div>
    </section>
  );
}
```

```typescript
// app/forecast/components/RiskTimeline.tsx
import React from "react";
import type { ForecastRiskEvent } from "@/lib/types/forecast";

export function RiskTimeline({ events }: { events: ForecastRiskEvent[] }) {
  return (
    <section className="forecast-panel" aria-label="Risk timeline">
      <h2>Risk timeline</h2>
      {events.length === 0 ? <p>No risk timeline events are available.</p> : null}
      <ol className="risk-timeline">
        {events.map((event, index) => (
          <li key={`${event.category}-${event.title}-${index}`} className={`risk-event ${event.severity}`}>
            <strong>{event.title}</strong>
            <p>{event.detail}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
```

```typescript
// app/forecast/components/ForecastSources.tsx
import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayDateTime, sourceLabel } from "../format";

export function ForecastSources({ forecast }: { forecast: ForecastResponse }) {
  return (
    <section className="forecast-panel forecast-sources" aria-label="Sources and methodology">
      <h2>Sources and methodology</h2>
      <p>Official warnings come from KNMI warning data. Risk labels are deterministic app interpretation.</p>
      <div className="forecast-source-grid">
        {forecast.source_freshness.map((source) => (
          <article key={source.source}>
            <strong>{sourceLabel(source.source)}</strong>
            <span>{source.status}</span>
            <small>{displayDateTime(source.updated_at, forecast.city.timezone)}</small>
          </article>
        ))}
      </div>
      <div className="forecast-links">
        {forecast.links.map((link) => (
          <a key={link.href} href={link.href}>{link.label}</a>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 6: Add focused Forecast CSS**

Append scoped Forecast styles to `app/globals.css`:

```css
.forecast-page {
  min-height: 100vh;
  padding: 18px 24px 32px;
  background: #f7f8f4;
}

.forecast-nav,
.forecast-hero,
.forecast-layout {
  width: min(1440px, 100%);
  margin: 0 auto;
}

.forecast-nav {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 20px;
  align-items: center;
  min-height: 56px;
}

.forecast-brand,
.forecast-nav a {
  color: #0f1c2e;
  font-weight: 700;
  text-decoration: none;
}

.forecast-nav nav {
  display: flex;
  justify-content: center;
  gap: 20px;
}

.forecast-nav select {
  min-width: 160px;
  height: 36px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: white;
  color: var(--text);
  font-weight: 700;
}

.forecast-hero,
.forecast-panel,
.forecast-error,
.forecast-loading {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: white;
  box-shadow: var(--shadow);
}

.forecast-hero {
  padding: clamp(22px, 3vw, 40px);
  margin-top: 12px;
}

.forecast-hero h1 {
  max-width: 760px;
  margin-bottom: 10px;
  color: #06111f;
  font-size: clamp(32px, 5vw, 64px);
  line-height: 1;
}

.forecast-summary-grid,
.forecast-layout,
.forecast-day-grid,
.forecast-source-grid {
  display: grid;
  gap: 12px;
}

.forecast-summary-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
  margin: 22px 0;
}

.forecast-summary-grid article,
.forecast-day-grid article,
.forecast-source-grid article {
  min-width: 0;
  padding: 14px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-muted);
}

.forecast-summary-grid h2,
.forecast-panel h2 {
  margin-bottom: 8px;
  color: var(--muted);
  font-size: 11px;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.warning-pill {
  display: inline-flex;
  padding: 6px 10px;
  border-radius: 999px;
  background: #fef3c7;
  color: #92400e;
  font-weight: 800;
}

.forecast-layout {
  grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.8fr);
  margin-top: 14px;
}

.forecast-panel {
  padding: 18px;
}

.forecast-table {
  display: grid;
  gap: 6px;
}

.forecast-row {
  display: grid;
  grid-template-columns: 54px 1.2fr repeat(5, minmax(72px, 1fr));
  gap: 8px;
  align-items: center;
  padding: 10px 0;
  border-bottom: 1px solid var(--border);
}

.risk-timeline {
  display: grid;
  gap: 10px;
  padding-left: 0;
  list-style: none;
}

.risk-event {
  padding: 12px;
  border-left: 4px solid var(--accent);
  border-radius: 8px;
  background: var(--surface-muted);
}

.risk-event.warning {
  border-left-color: var(--warning);
}

.risk-event.severe {
  border-left-color: #b91c1c;
}

.forecast-day-grid {
  grid-template-columns: repeat(7, minmax(0, 1fr));
}

.forecast-sources {
  grid-column: 1 / -1;
}

.forecast-source-grid {
  grid-template-columns: repeat(5, minmax(0, 1fr));
  margin: 14px 0;
}

.forecast-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.forecast-links a {
  color: var(--accent);
  font-weight: 700;
}

.forecast-error,
.forecast-loading {
  width: min(1440px, 100%);
  padding: 12px 14px;
  margin: 12px auto 0;
}

.forecast-error {
  border-color: #f2c0b7;
  background: #fff4f2;
  color: #8a2c1a;
}

@media (max-width: 900px) {
  .forecast-nav,
  .forecast-layout,
  .forecast-summary-grid,
  .forecast-day-grid,
  .forecast-source-grid {
    grid-template-columns: 1fr;
  }

  .forecast-nav nav {
    justify-content: flex-start;
  }

  .forecast-row {
    grid-template-columns: 1fr 1fr;
  }
}
```

- [ ] **Step 7: Run Forecast UI tests**

Run:

```bash
npm test -- app/forecast/__tests__/ForecastShell.test.tsx
```

Expected: all Forecast UI tests pass.

- [ ] **Step 8: Run related UI test coverage**

Run:

```bash
npm test -- app/forecast/__tests__/ForecastShell.test.tsx app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: Forecast tests and existing dashboard shell tests pass.

- [ ] **Step 9: Commit the Forecast page work**

Run:

```bash
npm run lint
npm run typecheck
npm test -- tests/forecast.test.ts app/forecast/__tests__/ForecastShell.test.tsx app/dashboard/__tests__/DashboardShell.test.tsx
git add app/forecast/page.tsx app/forecast/format.ts app/forecast/components/ForecastShell.tsx app/forecast/components/ForecastSummary.tsx app/forecast/components/ForecastHourly.tsx app/forecast/components/ForecastDaily.tsx app/forecast/components/RiskTimeline.tsx app/forecast/components/ForecastSources.tsx app/forecast/__tests__/ForecastShell.test.tsx app/globals.css TODO.md
git commit -m "feat(forecast): add forecast analytics page"
```

Attach a git note with:

```text
Spec: docs/specs/forecast-page.md
Scope: Public /forecast route with city switching, hourly/daily analytics, risk timeline, and source links.
Validation: npm run lint; npm run typecheck; npm test -- tests/forecast.test.ts app/forecast/__tests__/ForecastShell.test.tsx app/dashboard/__tests__/DashboardShell.test.tsx
```

Mark the Forecast page TODO sub-item with the commit hash.

---

### Task 4: Add Navigation Links From Dashboard Surfaces

**Files:**
- Modify: `Dutch Weather Dashboard.html`
- Modify: `app/dashboard/components/TopNav.tsx`
- Add or modify: `tests/dashboard.test.ts`
- Modify: `TODO.md`

- [ ] **Step 1: Add failing navigation contract assertions**

In `tests/dashboard.test.ts`, add an assertion to the provided dashboard HTML contract:

```typescript
it("links the static dashboard navigation to the Forecast page", () => {
  const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

  expect(html).toContain("href=\"/forecast\"");
  expect(html).toContain(">Forecast<");
});
```

In `app/dashboard/__tests__/DashboardShell.test.tsx`, extend the handoff landmarks test:

```typescript
expect(screen.getByRole("link", { name: /forecast/i })).toHaveAttribute("href", "/forecast");
```

- [ ] **Step 2: Run targeted tests and verify failure**

Run:

```bash
npm test -- tests/dashboard.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: tests fail until both navigation surfaces expose real links.

- [ ] **Step 3: Update dormant React dashboard navigation**

In `app/dashboard/components/TopNav.tsx`, replace the mapped `span` nav items with explicit links:

```typescript
<nav className="nav-links" aria-label="Primary">
  <a href="/" aria-current="page" className="nav-link active">Dashboard</a>
  <a href="/forecast" className="nav-link">Forecast</a>
  <span className="nav-link">Maps</span>
  <span className="nav-link">Insights</span>
  <span className="nav-link">Alerts</span>
</nav>
```

- [ ] **Step 4: Update the iframe-backed static dashboard HTML navigation**

In `Dutch Weather Dashboard.html`, find the rendered `Forecast` navigation label in the dashboard header and change it to an anchor with `href="/forecast"`. Preserve existing classes and visual styling. The target markup should include:

```html
<a href="/forecast" className="nav-link">Forecast</a>
```

If that file uses inline React createElement syntax rather than JSX for this nav area, make the equivalent change so the built HTML source contains `href="/forecast"` and displays `Forecast`.

- [ ] **Step 5: Run navigation tests**

Run:

```bash
npm test -- tests/dashboard.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: dashboard HTML contract and React shell navigation tests pass.

- [ ] **Step 6: Commit navigation work**

Run:

```bash
npm run lint
npm run typecheck
npm test -- tests/dashboard.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
git add "Dutch Weather Dashboard.html" app/dashboard/components/TopNav.tsx tests/dashboard.test.ts app/dashboard/__tests__/DashboardShell.test.tsx TODO.md
git commit -m "feat(forecast): link dashboard to forecast page"
```

Attach a git note with:

```text
Spec: docs/specs/forecast-page.md
Scope: Dashboard navigation links to the Forecast page.
Validation: npm run lint; npm run typecheck; npm test -- tests/dashboard.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Mark the navigation TODO sub-item with the commit hash.

---

### Task 5: Update Docs and Manual Verification Notes

**Files:**
- Modify: `docs/architecture.md`
- Modify: `docs/commands.md`
- Modify: `docs/testing.md`
- Modify: `TODO.md`

- [ ] **Step 1: Update architecture docs**

In `docs/architecture.md`, update the entry points and API surface sections with:

```markdown
- Forecast page: `app/forecast/page.tsx`
- Forecast API response shaping: `lib/forecast.ts`
```

Add to current API surface:

```http
GET /api/forecast?city=<slug>
```

Add a runtime-flow sentence:

```markdown
The Forecast page reads normalized forecast analytics from persisted dashboard snapshots through `/api/forecast`; it does not call external forecast or warning providers from the browser.
```

- [ ] **Step 2: Update command docs**

In `docs/commands.md`, add a Forecast API check:

```bash
curl "http://localhost:3000/api/forecast?city=amsterdam"
curl "http://localhost:3000/api/forecast?city=utrecht"
curl "http://localhost:3000/api/forecast?city=rotterdam"
```

Add manual page check:

```bash
npm run dev
# open http://localhost:3000/forecast
```

- [ ] **Step 3: Update testing docs**

In `docs/testing.md`, add:

```markdown
Run Forecast page tests:

```bash
npm test -- tests/forecast.test.ts app/forecast/__tests__/ForecastShell.test.tsx
```

Forecast tests must verify the same-app API shape, missing-data states, city switching, source links, and deterministic risk timeline output.
```

- [ ] **Step 4: Run docs-adjacent validation**

Run:

```bash
npm run lint
npm run typecheck
npm test -- tests/forecast.test.ts app/forecast/__tests__/ForecastShell.test.tsx
```

Expected: validation still passes after docs updates.

- [ ] **Step 5: Commit docs work**

Run:

```bash
git add docs/architecture.md docs/commands.md docs/testing.md TODO.md
git commit -m "docs: document forecast page API"
```

Attach a git note with:

```text
Spec: docs/specs/forecast-page.md
Scope: Architecture, commands, and testing documentation for the Forecast page.
Validation: npm run lint; npm run typecheck; npm test -- tests/forecast.test.ts app/forecast/__tests__/ForecastShell.test.tsx
```

Mark the docs TODO sub-item with the commit hash.

---

### Task 6: Pre-PR Validation and Handoff

**Files:**
- Modify: `TODO.md`
- Modify: `docs/insights.md`
- Create or modify: `docs/iterations/archive/2026-06-11-forecast-page.md`
- Use template: `.github/pull_request_template.md`

- [ ] **Step 1: Confirm implementation still matches the accepted spec**

Check `docs/specs/forecast-page.md` against the implemented behavior:

```bash
Get-Content docs/specs/forecast-page.md
```

Expected: `/forecast`, city switching, same-app forecast API, hourly/daily analytics, risk timeline, source links, source freshness, missing-data states, and documentation updates are all covered.

- [ ] **Step 2: Run the `simplify` skill**

Use the `simplify` skill against the current diff and apply only behavior-preserving improvements. Do not broaden scope beyond the Forecast page implementation.

- [ ] **Step 3: Run `test-plan-writer`**

Use `test-plan-writer` because behavior, API, tests, and docs changed. The test plan should map acceptance criteria from `docs/specs/forecast-page.md` to changed files and validation commands.

- [ ] **Step 4: Run security review only if scope expanded**

Invoke `security-review` if implementation added new external network calls, secret handling, user input beyond city slug selection, privileged routes, or auth/security-sensitive code. If the implementation stays within persisted same-app forecast reads and public route rendering, record:

```text
Security review not invoked: Forecast page reads existing persisted public dashboard snapshot data and adds no external provider calls, secrets, auth, privileged operations, money movement, broker/payment logic, or security-sensitive architecture.
```

- [ ] **Step 5: Run full validation**

Run:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

Expected: all validation commands pass. If `npm run build` cannot run because a production `DATABASE_URL` or database is unavailable, report the exact failure and run all non-blocked checks.

- [ ] **Step 6: Run local manual UI verification**

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:3000/forecast
http://localhost:3000/
```

Verify:

```text
/forecast loads.
City switching updates Forecast page sections.
Hourly analytics, 7-day outlook, risk timeline, and source links render.
Missing or stale data states are readable.
Dashboard home page still renders.
Dashboard navigation links to /forecast.
```

- [ ] **Step 7: Archive completed TODO session and record lessons**

After all commits are complete, move completed session details from `TODO.md` into:

```text
docs/iterations/archive/2026-06-11-forecast-page.md
```

Include:

```markdown
# Forecast Page Session

Spec: `docs/specs/forecast-page.md`

## Completed

- Forecast API response and risk derivation: `<commit hash>`
- Forecast page UI: `<commit hash>`
- Dashboard navigation links: `<commit hash>`
- Documentation updates: `<commit hash>`

## Validation

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx prisma validate`
- `npm run build`
```

Add a concise lesson to `docs/insights.md`:

```markdown
- 2026-06-11: The Forecast page was implemented as a same-app normalized API and React route on top of persisted dashboard snapshots, keeping provider calls out of browser render paths and avoiding new persistence for the first slice.
```

- [ ] **Step 8: Commit archive and insights**

Run:

```bash
git add TODO.md docs/iterations/archive/2026-06-11-forecast-page.md docs/insights.md
git commit -m "docs: archive forecast page session"
```

Attach a git note with:

```text
Spec: docs/specs/forecast-page.md
Scope: Forecast page session archive and lessons.
Validation: npm run lint; npm run typecheck; npm test; npx prisma validate; npm run build
```

- [ ] **Step 9: Draft the PR body**

Use `.github/pull_request_template.md` and include:

```markdown
## Summary
- Added normalized Forecast API response and deterministic risk timeline.
- Added `/forecast` page with city switching, hourly/daily analytics, source freshness, and provider links.
- Linked dashboard navigation to Forecast and updated docs.

## Spec
- `docs/specs/forecast-page.md`

## Test Plan
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npx prisma validate`
- `npm run build`
- Manual: `http://localhost:3000/forecast`
- Manual: `http://localhost:3000/`

## Risk
- Public read-only API and UI additions; no browser-side provider calls or secrets.

## Rollback
- Revert Forecast API/page/navigation commits.
```

Expected: Step 6 and Step 7 are complete before PR submission or handoff.
