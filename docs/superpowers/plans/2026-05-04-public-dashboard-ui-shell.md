# Public Dashboard UI Shell Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the monolithic `app/page.tsx` with a decomposed, polished Dutch-inspired dashboard that auto-refreshes from `/api/dashboard?city=<slug>` and correctly displays all seeded Amsterdam data.

**Architecture:** A Server Component (`app/page.tsx`) fetches initial dashboard data and the city list, then renders a `LiveDashboard` client component that owns city-selector state, auto-polls the API every 30 s, and composes six pure display card components. All business logic stays server-side; the client component only manages UI state and refresh timing.

**Tech Stack:** Next.js 15 App Router, TypeScript 5, Tailwind CSS v4, Vitest 3, React Testing Library 16, happy-dom

**Active spec:** `docs/specs/public-dashboard-ui-shell.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `lib/types/dashboard.ts` | Create | `DashboardResponse` type shared by server and client |
| `lib/utils/format.ts` | Create | Pure formatters: date, temp, wind, percent, AQI, water level |
| `lib/api/dashboard-client.ts` | Create | Client-side `getDashboard(city)` fetch helper |
| `app/components/briefing-card.tsx` | Create | Pure display: briefing text card |
| `app/components/weather-card.tsx` | Create | Pure display: current weather metrics |
| `app/components/cycle-comfort-card.tsx` | Create | Pure display: cycle comfort score + windows |
| `app/components/air-quality-card.tsx` | Create | Pure display: AQI + pollutant |
| `app/components/water-signal-card.tsx` | Create | Pure display: water level + risk |
| `app/components/source-freshness.tsx` | Create | Pure display: freshness timestamps footer |
| `app/components/live-dashboard.tsx` | Create | `'use client'`: city selector, 30s auto-poll, composes cards |
| `app/page.tsx` | Modify | SSR: fetch initial data + cities, render `<LiveDashboard>` |
| `app/layout.tsx` | Modify | Metadata uses `NEXT_PUBLIC_APP_NAME` env var |
| `app/globals.css` | Modify | Redesign: Dutch palette, nav bar, grid layout, typography |
| `vitest.config.ts` | Modify | Add `environmentMatchGlobs` for `.test.tsx` (happy-dom) |
| `package.json` | Modify | Add `@testing-library/react`, `@testing-library/user-event`, `happy-dom` |
| `tests/format.test.ts` | Create | Unit tests for all pure formatters |
| `tests/live-dashboard.test.tsx` | Create | Render + interaction tests for `LiveDashboard` |

---

### Task 1: Shared types

**Files:**
- Create: `lib/types/dashboard.ts`

- [ ] **Step 1: Create `lib/types/dashboard.ts`**

```typescript
export type DashboardCity = {
  slug: string;
  name: string;
  timezone: string;
};

export type DashboardCurrent = {
  temperature_c: number | null;
  feels_like_c: number | null;
  rain_mm: number | null;
  rain_probability: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  wind_direction: string | null;
  warning_level: string | null;
};

export type DashboardCycleComfort = {
  score: number | null;
  label: string | null;
  best_outdoor_window: string | null;
  worst_outdoor_window: string | null;
};

export type DashboardAirQuality = {
  aqi_value: number | null;
  label: string | null;
  main_pollutant: string | null;
  trend: string | null;
};

export type DashboardWaterSignal = {
  station_name: string | null;
  water_level_cm: number | null;
  trend: string | null;
  risk_label: string | null;
};

export type DashboardFreshnessEntry = {
  source: string;
  updated_at: string | null;
};

export type DashboardResponse = {
  city: DashboardCity;
  generated_at: string;
  briefing: string | null;
  current: DashboardCurrent;
  cycle_comfort: DashboardCycleComfort;
  air_quality: DashboardAirQuality;
  water_signal: DashboardWaterSignal;
  source_freshness: DashboardFreshnessEntry[];
  summary_payload: unknown;
};

export type CityListEntry = {
  slug: string;
  name: string;
};
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add lib/types/dashboard.ts
git commit -m "feat(dashboard-ui): add shared DashboardResponse type definitions"
```

---

### Task 2: Pure formatters + tests

**Files:**
- Create: `lib/utils/format.ts`
- Create: `tests/format.test.ts`

- [ ] **Step 1: Write failing tests — create `tests/format.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatTemp,
  formatFeelsLike,
  formatWind,
  formatPercent,
  formatAqi,
  formatWaterLevel,
  riskColor,
} from "@/lib/utils/format";

describe("formatDate", () => {
  it("formats an ISO string to Dutch locale", () => {
    const result = formatDate("2026-05-03T09:58:00.000Z");
    expect(result).toMatch(/\d/);
    expect(result).not.toBe("Unavailable");
  });

  it("returns Unavailable for null", () => {
    expect(formatDate(null)).toBe("Unavailable");
  });
});

describe("formatTemp", () => {
  it("formats a temperature with degree symbol", () => {
    expect(formatTemp(16.2)).toBe("16.2°C");
  });

  it("returns — for null", () => {
    expect(formatTemp(null)).toBe("—");
  });
});

describe("formatFeelsLike", () => {
  it("returns feels-like string with value", () => {
    expect(formatFeelsLike(15.4)).toBe("Feels like 15.4°C");
  });

  it("returns — for null", () => {
    expect(formatFeelsLike(null)).toBe("—");
  });
});

describe("formatWind", () => {
  it("combines speed and direction", () => {
    expect(formatWind(18, "WSW")).toBe("18 km/h WSW");
  });

  it("returns just speed when no direction", () => {
    expect(formatWind(18, null)).toBe("18 km/h");
  });

  it("returns — when speed is null", () => {
    expect(formatWind(null, "WSW")).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats 0.2 as 20%", () => {
    expect(formatPercent(0.2)).toBe("20% rain chance");
  });

  it("returns no-data string for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatAqi", () => {
  it("combines value and label", () => {
    expect(formatAqi(42, "Good")).toBe("42 – Good");
  });

  it("returns just value when label is null", () => {
    expect(formatAqi(42, null)).toBe("42");
  });

  it("returns — for null value", () => {
    expect(formatAqi(null, "Good")).toBe("—");
  });
});

describe("formatWaterLevel", () => {
  it("appends cm unit", () => {
    expect(formatWaterLevel(14)).toBe("14 cm");
  });

  it("returns — for null", () => {
    expect(formatWaterLevel(null)).toBe("—");
  });
});

describe("riskColor", () => {
  it("returns orange for elevated", () => {
    expect(riskColor("elevated")).toBe("text-orange-600");
  });

  it("returns red for high risk", () => {
    expect(riskColor("high")).toBe("text-red-600");
  });

  it("returns green for normal", () => {
    expect(riskColor("normal")).toBe("text-emerald-600");
  });

  it("returns muted for null", () => {
    expect(riskColor(null)).toBe("text-gray-400");
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npm test -- tests/format.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/utils/format'`

- [ ] **Step 3: Create `lib/utils/format.ts`**

```typescript
export function formatDate(value: string | null): string {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(value));
}

export function formatTemp(value: number | null): string {
  if (value === null) return "—";
  return `${value}°C`;
}

export function formatFeelsLike(value: number | null): string {
  if (value === null) return "—";
  return `Feels like ${value}°C`;
}

export function formatWind(speed: number | null, direction: string | null): string {
  if (speed === null) return "—";
  return direction ? `${speed} km/h ${direction}` : `${speed} km/h`;
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}% rain chance`;
}

export function formatAqi(value: number | null, label: string | null): string {
  if (value === null) return "—";
  return label ? `${value} – ${label}` : `${value}`;
}

export function formatWaterLevel(value: number | null): string {
  if (value === null) return "—";
  return `${value} cm`;
}

export function riskColor(riskLabel: string | null): string {
  if (!riskLabel) return "text-gray-400";
  const lower = riskLabel.toLowerCase();
  if (lower.includes("high") || lower.includes("danger")) return "text-red-600";
  if (lower.includes("elevated") || lower.includes("warning") || lower.includes("orange")) return "text-orange-600";
  if (lower.includes("normal") || lower.includes("low") || lower.includes("good")) return "text-emerald-600";
  return "text-gray-500";
}
```

- [ ] **Step 4: Run tests to confirm they pass**

```
npm test -- tests/format.test.ts
```

Expected: All format tests PASS

- [ ] **Step 5: Commit**

```bash
git add lib/utils/format.ts tests/format.test.ts
git commit -m "feat(dashboard-ui): add pure formatting utilities and tests"
```

---

### Task 3: API client + tests

**Files:**
- Create: `lib/api/dashboard-client.ts`

- [ ] **Step 1: Create `lib/api/dashboard-client.ts`**

```typescript
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

export async function getDashboard(city: string): Promise<DashboardResponse> {
  const res = await fetch(`/api/dashboard?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Dashboard API returned ${res.status}`);
  }

  return res.json() as Promise<DashboardResponse>;
}

export async function getCities(): Promise<CityListEntry[]> {
  const res = await fetch("/api/cities", { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json() as { cities?: CityListEntry[] };
  return data.cities ?? [];
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add lib/api/dashboard-client.ts
git commit -m "feat(dashboard-ui): add client-side getDashboard and getCities API helpers"
```

---

### Task 4: Testing infrastructure for React components

**Files:**
- Modify: `package.json`
- Modify: `vitest.config.ts`

- [ ] **Step 1: Install testing dependencies**

```bash
npm install --save-dev @testing-library/react @testing-library/user-event @testing-library/jest-dom happy-dom @vitejs/plugin-react
```

Expected: installs without errors; `package.json` devDependencies updated

- [ ] **Step 2: Update `vitest.config.ts`**

Replace the entire file content with:

```typescript
import { fileURLToPath } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL(".", import.meta.url)),
    },
  },
  test: {
    include: ["tests/**/*.test.{ts,tsx}"],
    pool: "forks",
    environmentMatchGlobs: [
      ["tests/**/*.test.tsx", "happy-dom"],
    ],
    setupFiles: ["tests/setup.ts"],
  },
});
```

- [ ] **Step 3: Create `tests/setup.ts`**

```typescript
import "@testing-library/jest-dom";
```

- [ ] **Step 4: Run existing tests to confirm baseline still passes**

```
npm test
```

Expected: 14 PASS, 0 failures

- [ ] **Step 5: Commit**

```bash
git add vitest.config.ts tests/setup.ts package.json package-lock.json
git commit -m "test(dashboard-ui): add React Testing Library and happy-dom for component tests"
```

---

### Task 5: Pure display components

**Files:**
- Create: `app/components/briefing-card.tsx`
- Create: `app/components/weather-card.tsx`
- Create: `app/components/cycle-comfort-card.tsx`
- Create: `app/components/air-quality-card.tsx`
- Create: `app/components/water-signal-card.tsx`
- Create: `app/components/source-freshness.tsx`

- [ ] **Step 1: Create `app/components/briefing-card.tsx`**

```tsx
type Props = { briefing: string | null };

export function BriefingCard({ briefing }: Props) {
  return (
    <section className="briefing-card" aria-label="Daily briefing">
      <p className="eyebrow">Today&#39;s briefing</p>
      <p className="briefing-text">
        {briefing ?? "No briefing is available for this snapshot."}
      </p>
    </section>
  );
}
```

- [ ] **Step 2: Create `app/components/weather-card.tsx`**

```tsx
import { formatTemp, formatFeelsLike, formatWind, formatPercent } from "@/lib/utils/format";
import type { DashboardCurrent } from "@/lib/types/dashboard";

type Props = { data: DashboardCurrent };

export function WeatherCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Current weather">
      <p className="card-label">Current weather</p>
      <p className="card-value">{formatTemp(data.temperature_c)}</p>
      <p className="card-detail">{formatFeelsLike(data.feels_like_c)}</p>
      <p className="card-detail">{formatPercent(data.rain_probability)}</p>
      <p className="card-detail">
        Wind {formatWind(data.wind_speed_kmh, data.wind_direction)}
      </p>
      {data.warning_level && data.warning_level !== "none" && (
        <p className="card-warning">⚠ {data.warning_level}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 3: Create `app/components/cycle-comfort-card.tsx`**

```tsx
import type { DashboardCycleComfort } from "@/lib/types/dashboard";

type Props = { data: DashboardCycleComfort };

export function CycleComfortCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Cycle comfort">
      <p className="card-label">Cycle comfort</p>
      <p className="card-value">{data.score ?? "—"}</p>
      <p className="card-detail">{data.label ?? "Unknown conditions"}</p>
      {data.best_outdoor_window && (
        <p className="card-detail">Best: {data.best_outdoor_window}</p>
      )}
      {data.worst_outdoor_window && (
        <p className="card-detail">Avoid: {data.worst_outdoor_window}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 4: Create `app/components/air-quality-card.tsx`**

```tsx
import { formatAqi } from "@/lib/utils/format";
import type { DashboardAirQuality } from "@/lib/types/dashboard";

type Props = { data: DashboardAirQuality };

export function AirQualityCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Air quality">
      <p className="card-label">Air quality</p>
      <p className="card-value">{data.label ?? "—"}</p>
      <p className="card-detail">{formatAqi(data.aqi_value, null)}</p>
      {data.main_pollutant && (
        <p className="card-detail">Main: {data.main_pollutant}</p>
      )}
      {data.trend && (
        <p className="card-detail">Trend: {data.trend}</p>
      )}
    </article>
  );
}
```

- [ ] **Step 5: Create `app/components/water-signal-card.tsx`**

```tsx
import { formatWaterLevel, riskColor } from "@/lib/utils/format";
import type { DashboardWaterSignal } from "@/lib/types/dashboard";

type Props = { data: DashboardWaterSignal };

export function WaterSignalCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Water signal">
      <p className="card-label">Water signal</p>
      <p className={`card-value ${riskColor(data.risk_label)}`}>
        {data.risk_label ?? "—"}
      </p>
      {data.station_name && (
        <p className="card-detail">{data.station_name}</p>
      )}
      <p className="card-detail">
        {formatWaterLevel(data.water_level_cm)}
        {data.trend ? `, trend: ${data.trend}` : ""}
      </p>
    </article>
  );
}
```

- [ ] **Step 6: Create `app/components/source-freshness.tsx`**

```tsx
import { formatDate } from "@/lib/utils/format";
import type { DashboardFreshnessEntry } from "@/lib/types/dashboard";

type Props = { sources: DashboardFreshnessEntry[] };

export function SourceFreshness({ sources }: Props) {
  return (
    <section className="freshness-section" aria-label="Source freshness">
      <p className="freshness-label">Source freshness</p>
      <div className="freshness-grid">
        {sources.map((item) => (
          <div key={item.source} className="freshness-item">
            <span className="freshness-source">{item.source}</span>
            <span className="freshness-time">{formatDate(item.updated_at)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 7: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 8: Commit**

```bash
git add app/components/briefing-card.tsx app/components/weather-card.tsx app/components/cycle-comfort-card.tsx app/components/air-quality-card.tsx app/components/water-signal-card.tsx app/components/source-freshness.tsx
git commit -m "feat(dashboard-ui): add pure display card components"
```

---

### Task 6: LiveDashboard client component + tests

**Files:**
- Create: `app/components/live-dashboard.tsx`
- Create: `tests/live-dashboard.test.tsx`

- [ ] **Step 1: Write failing tests — create `tests/live-dashboard.test.tsx`**

```tsx
// @vitest-environment happy-dom
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LiveDashboard } from "@/app/components/live-dashboard";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

const mockDashboard: DashboardResponse = {
  city: { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  generated_at: "2026-05-04T10:00:00.000Z",
  briefing: "Today is a good day for cycling.",
  current: {
    temperature_c: 16.2,
    feels_like_c: 15.4,
    rain_mm: 0.4,
    rain_probability: 0.2,
    wind_speed_kmh: 18,
    wind_gust_kmh: 32,
    wind_direction: "WSW",
    warning_level: "none",
  },
  cycle_comfort: {
    score: 78,
    label: "good",
    best_outdoor_window: "10:00-16:00",
    worst_outdoor_window: "18:00-21:00",
  },
  air_quality: {
    aqi_value: 42,
    label: "Good",
    main_pollutant: "O3",
    trend: "stable",
  },
  water_signal: {
    station_name: "Amsterdam mock station",
    water_level_cm: 14,
    trend: "stable",
    risk_label: "normal",
  },
  source_freshness: [
    { source: "mock_knmi", updated_at: "2026-05-04T09:58:00.000Z" },
    { source: "mock_luchtmeetnet", updated_at: "2026-05-04T09:55:00.000Z" },
    { source: "mock_rijkswaterstaat", updated_at: "2026-05-04T09:50:00.000Z" },
  ],
  summary_payload: {},
};

const nullDashboard: DashboardResponse = {
  ...mockDashboard,
  briefing: null,
  current: {
    temperature_c: null,
    feels_like_c: null,
    rain_mm: null,
    rain_probability: null,
    wind_speed_kmh: null,
    wind_gust_kmh: null,
    wind_direction: null,
    warning_level: null,
  },
  cycle_comfort: { score: null, label: null, best_outdoor_window: null, worst_outdoor_window: null },
  air_quality: { aqi_value: null, label: null, main_pollutant: null, trend: null },
  water_signal: { station_name: null, water_level_cm: null, trend: null, risk_label: null },
  source_freshness: [
    { source: "weather", updated_at: null },
    { source: "air_quality", updated_at: null },
    { source: "water", updated_at: null },
  ],
};

const mockCities: CityListEntry[] = [
  { slug: "amsterdam", name: "Amsterdam" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "rotterdam", name: "Rotterdam" },
];

vi.mock("@/lib/api/dashboard-client", () => ({
  getDashboard: vi.fn(),
}));

import { getDashboard } from "@/lib/api/dashboard-client";

beforeEach(() => {
  vi.clearAllMocks();
  vi.useFakeTimers();
});

describe("LiveDashboard", () => {
  it("renders dashboard data from initial props", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />
    );

    expect(screen.getByText("Today is a good day for cycling.")).toBeInTheDocument();
    expect(screen.getByText("16.2°C")).toBeInTheDocument();
    expect(screen.getByText("good")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("normal")).toBeInTheDocument();
  });

  it("renders all three source freshness entries", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />
    );

    expect(screen.getByText("mock_knmi")).toBeInTheDocument();
    expect(screen.getByText("mock_luchtmeetnet")).toBeInTheDocument();
    expect(screen.getByText("mock_rijkswaterstaat")).toBeInTheDocument();
  });

  it("renders fallback labels when values are null", () => {
    render(
      <LiveDashboard
        initialData={nullDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />
    );

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  });

  it("shows city selector with all cities", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Amsterdam" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Utrecht" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Rotterdam" })).toBeInTheDocument();
  });

  it("fetches new data when city selector changes", async () => {
    const utrechtData: DashboardResponse = {
      ...mockDashboard,
      city: { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
      briefing: "Utrecht today looks calm.",
    };
    vi.mocked(getDashboard).mockResolvedValue(utrechtData);

    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "utrecht");

    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith("utrecht");
    });
  });
});
```

- [ ] **Step 2: Run tests to confirm they fail**

```
npm test -- tests/live-dashboard.test.tsx
```

Expected: FAIL — `Cannot find module '@/app/components/live-dashboard'`

- [ ] **Step 3: Create `app/components/live-dashboard.tsx`**

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboard } from "@/lib/api/dashboard-client";
import { BriefingCard } from "./briefing-card";
import { WeatherCard } from "./weather-card";
import { CycleComfortCard } from "./cycle-comfort-card";
import { AirQualityCard } from "./air-quality-card";
import { WaterSignalCard } from "./water-signal-card";
import { SourceFreshness } from "./source-freshness";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

const POLL_INTERVAL_MS = 30_000;

type Props = {
  initialData: DashboardResponse;
  initialCity: string;
  cities: CityListEntry[];
};

export function LiveDashboard({ initialData, initialCity, cities }: Props) {
  const [city, setCity] = useState(initialCity);
  const [data, setData] = useState<DashboardResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(
    async (targetCity: string) => {
      setLoading(true);
      setError(null);
      try {
        const next = await getDashboard(targetCity);
        setData(next);
        setLastRefreshed(new Date());
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  useEffect(() => {
    timerRef.current = setInterval(() => {
      refresh(city);
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [city, refresh]);

  const handleCityChange = async (slug: string) => {
    setCity(slug);
    if (timerRef.current) clearInterval(timerRef.current);
    await refresh(slug);
    timerRef.current = setInterval(() => {
      refresh(slug);
    }, POLL_INTERVAL_MS);
  };

  return (
    <div className="dashboard-root">
      <nav className="top-nav">
        <span className="app-name">{process.env.NEXT_PUBLIC_APP_NAME ?? "Dutch Weather Intelligence"}</span>
        <div className="nav-actions">
          <select
            className="city-selector"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            aria-label="Select city"
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className="refresh-btn"
            onClick={() => refresh(city)}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </nav>

      <main className="page-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Seeded dashboard</p>
            <h1>{data.city.name}</h1>
            <p className="subtitle">
              Environmental conditions from mock ingestion sources.
            </p>
          </div>
          <div className="generated-box">
            <strong>Last refreshed</strong>
            <br />
            <span suppressHydrationWarning>
              {lastRefreshed.toLocaleTimeString("nl-NL", { timeZone: "Europe/Amsterdam" })}
            </span>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <BriefingCard briefing={data.briefing} />

        <section className="card-grid" aria-label="Dashboard metrics">
          <WeatherCard data={data.current} />
          <CycleComfortCard data={data.cycle_comfort} />
          <AirQualityCard data={data.air_quality} />
          <WaterSignalCard data={data.water_signal} />
        </section>

        <SourceFreshness sources={data.source_freshness} />
      </main>
    </div>
  );
}
```

- [ ] **Step 4: Run component tests**

```
npm test -- tests/live-dashboard.test.tsx
```

Expected: All 5 `LiveDashboard` tests PASS

- [ ] **Step 5: Run full test suite**

```
npm test
```

Expected: All tests PASS (14 existing + new format tests + new component tests)

- [ ] **Step 6: Commit**

```bash
git add app/components/live-dashboard.tsx tests/live-dashboard.test.tsx
git commit -m "feat(dashboard-ui): add LiveDashboard client component with city selector and auto-refresh"
```

---

### Task 7: Update page.tsx, layout, and CSS

**Files:**
- Modify: `app/page.tsx`
- Modify: `app/layout.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Update `app/page.tsx`**

Replace the entire file with:

```tsx
import { headers } from "next/headers";
import { LiveDashboard } from "@/app/components/live-dashboard";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

export const dynamic = "force-dynamic";

async function getServerDashboard(city: string): Promise<DashboardResponse> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL === "1" ? "https" : "http";
  const res = await fetch(`${protocol}://${host}/api/dashboard?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Dashboard API returned ${res.status}`);
  }

  return res.json() as Promise<DashboardResponse>;
}

async function getServerCities(): Promise<CityListEntry[]> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL === "1" ? "https" : "http";

  try {
    const res = await fetch(`${protocol}://${host}/api/cities`, { cache: "no-store" });
    if (!res.ok) return [{ slug: "amsterdam", name: "Amsterdam" }];
    const data = await res.json() as { cities?: CityListEntry[] };
    return data.cities ?? [{ slug: "amsterdam", name: "Amsterdam" }];
  } catch {
    return [{ slug: "amsterdam", name: "Amsterdam" }];
  }
}

export default async function Home() {
  let dashboard: DashboardResponse;
  let cities: CityListEntry[];

  try {
    [dashboard, cities] = await Promise.all([
      getServerDashboard("amsterdam"),
      getServerCities(),
    ]);
  } catch (error) {
    return (
      <main className="page-shell">
        <div className="error-box">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1>Amsterdam data could not be loaded</h1>
          <p className="subtitle">
            Start PostgreSQL, run the Prisma migration and seed command, then refresh this page.
          </p>
          <p className="card-detail">{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }

  return (
    <LiveDashboard
      initialData={dashboard}
      initialCity="amsterdam"
      cities={cities}
    />
  );
}
```

- [ ] **Step 2: Update `app/layout.tsx`**

Replace the entire file with:

```tsx
import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

const appName = process.env.NEXT_PUBLIC_APP_NAME ?? "Dutch Weather Intelligence";

export const metadata: Metadata = {
  title: appName,
  description: "Amsterdam environmental conditions from mock ingestion sources.",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="nl">
      <body>{children}</body>
    </html>
  );
}
```

- [ ] **Step 3: Redesign `app/globals.css`**

Replace the entire file with:

```css
@import "tailwindcss";

:root {
  color-scheme: light;
  --bg: #f5f6f1;
  --surface: #ffffff;
  --surface-muted: #eef0ea;
  --border: #d4d9d0;
  --navy: #162032;
  --navy-mid: #1e3050;
  --text: #162032;
  --muted: #5a6b60;
  --accent: #0e7490;
  --accent-light: #cffafe;
  --orange: #c2410c;
  --orange-light: #fed7aa;
  --green: #15803d;
  --shadow-sm: 0 1px 3px rgba(22, 32, 50, 0.08);
  --shadow-md: 0 4px 16px rgba(22, 32, 50, 0.10);
}

* {
  box-sizing: border-box;
}

body {
  min-height: 100vh;
  margin: 0;
  color: var(--text);
  background: var(--bg);
  font-family: system-ui, -apple-system, "Segoe UI", Arial, sans-serif;
  font-size: 15px;
  line-height: 1.5;
}

/* ── Nav ── */
.top-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px;
  background: var(--navy);
  box-shadow: var(--shadow-md);
}

.app-name {
  color: #fff;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 0.03em;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.city-selector {
  padding: 6px 10px;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 0.875rem;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='white' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 8px center;
  padding-right: 28px;
}

.city-selector option {
  background: var(--navy);
  color: #fff;
}

.refresh-btn {
  padding: 6px 14px;
  border: 1px solid var(--orange);
  border-radius: 6px;
  background: var(--orange);
  color: #fff;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: opacity 0.15s;
}

.refresh-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.refresh-btn:hover:not(:disabled) {
  opacity: 0.88;
}

/* ── Shell ── */
.dashboard-root {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-shell {
  flex: 1;
  width: min(1160px, calc(100% - 32px));
  margin: 0 auto;
  padding: 32px 0 64px;
}

/* ── Header ── */
.dashboard-header {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 24px;
  align-items: end;
  padding-bottom: 24px;
  border-bottom: 2px solid var(--border);
  margin-bottom: 24px;
}

.eyebrow {
  margin: 0 0 6px;
  color: var(--accent);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

h1,
h2,
h3,
p {
  margin-top: 0;
}

h1 {
  margin-bottom: 8px;
  font-size: clamp(2rem, 5vw, 3.75rem);
  font-weight: 800;
  line-height: 1.05;
  color: var(--navy);
  letter-spacing: -0.02em;
}

.subtitle {
  max-width: 60ch;
  margin-bottom: 0;
  color: var(--muted);
  font-size: 0.95rem;
  line-height: 1.6;
}

.generated-box {
  min-width: 180px;
  padding: 14px 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface);
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.5;
  box-shadow: var(--shadow-sm);
}

/* ── Briefing ── */
.briefing-card {
  margin-bottom: 24px;
  padding: 24px 28px;
  border-left: 4px solid var(--accent);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-md);
}

.briefing-card .eyebrow {
  margin-bottom: 10px;
}

.briefing-text {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--navy-mid);
}

/* ── Metric cards ── */
.card-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.metric-card {
  padding: 20px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-label {
  margin: 0 0 10px;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.card-value {
  margin: 0 0 4px;
  font-size: 2.1rem;
  font-weight: 800;
  line-height: 1;
  letter-spacing: -0.02em;
  color: var(--navy);
}

.card-detail {
  margin: 0;
  color: var(--muted);
  font-size: 0.875rem;
  line-height: 1.5;
}

.card-warning {
  margin: 6px 0 0;
  padding: 4px 8px;
  border-radius: 4px;
  background: var(--orange-light);
  color: var(--orange);
  font-size: 0.8rem;
  font-weight: 600;
}

/* ── Source freshness ── */
.freshness-section {
  padding: 18px 22px;
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-muted);
  box-shadow: var(--shadow-sm);
}

.freshness-label {
  margin: 0 0 12px;
  color: var(--muted);
  font-size: 0.78rem;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.freshness-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.freshness-item {
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid var(--border);
}

.freshness-source {
  display: block;
  margin-bottom: 4px;
  font-weight: 600;
  font-size: 0.875rem;
  color: var(--navy-mid);
}

.freshness-time {
  color: var(--muted);
  font-size: 0.825rem;
}

/* ── Error states ── */
.error-box {
  padding: 28px;
  border: 1px solid #fca5a5;
  border-radius: 10px;
  background: #fff5f5;
  box-shadow: var(--shadow-sm);
}

.error-banner {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: 8px;
  background: var(--orange-light);
  color: var(--orange);
  font-size: 0.9rem;
  font-weight: 600;
}

/* ── Responsive ── */
@media (max-width: 900px) {
  .top-nav {
    padding: 0 16px;
  }

  .dashboard-header {
    grid-template-columns: 1fr;
  }

  .card-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .freshness-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 520px) {
  .card-grid {
    grid-template-columns: 1fr;
  }

  .nav-actions {
    gap: 6px;
  }

  .app-name {
    font-size: 0.875rem;
  }
}
```

- [ ] **Step 4: Run typecheck and lint**

```
npm run typecheck
npm run lint
```

Expected: both exit 0

- [ ] **Step 5: Commit**

```bash
git add app/page.tsx app/layout.tsx app/globals.css
git commit -m "feat(dashboard-ui): redesign page with Dutch-inspired layout and LiveDashboard integration"
```

---

### Task 8: Full validation

**Files:** none (validation only)

- [ ] **Step 1: Run full test suite**

```
npm test
```

Expected: All tests PASS (14 original + format tests + component tests)

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: 0 errors

- [ ] **Step 3: Run lint**

```
npm run lint
```

Expected: 0 errors

- [ ] **Step 4: Start dev server and verify manually**

```
npm run dev
```

Open `http://localhost:3000` and verify:
- Nav bar visible with app name and city selector
- Amsterdam data rendered correctly: temperature, wind, AQI, water signal
- Briefing text visible
- Source freshness shows 3 entries with timestamps
- Missing values show "—" or "Unavailable"
- Refresh button works
- Responsive layout at narrower widths

- [ ] **Step 5: Update TODO.md with completed sub-items**

In `TODO.md`, mark the active session items with commit hashes once all commits are done.
