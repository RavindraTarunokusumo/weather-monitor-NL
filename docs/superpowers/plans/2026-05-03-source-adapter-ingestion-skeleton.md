# Source Adapter & Ingestion Skeleton Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the ingestion pipeline with mock adapters for KNMI, Luchtmeetnet, and Rijkswaterstaat, source run tracking, and working CLI/HTTP job entrypoints.

**Architecture:** Three source adapter classes extend a shared abstract base in `lib/ingestion/`. A generic `runIngestionJob` function in `lib/ingestion/run.ts` wraps the try/catch and SourceRun log pattern and accepts a typed `store` callback so routes stay thin and the runner stays testable. Tests cover adapter output shape and source run state transitions using a mock prisma stub — no real DB needed.

**Tech Stack:** TypeScript 5, Next.js 15 App Router, Prisma 6, PostgreSQL, Vitest 3, tsx 4 (CLI runner), dotenv

**Active spec:** `docs/specs/source-adapter-ingestion-skeleton.md`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/ingestion/base.ts` | Create | `SourceAdapter<T>` abstract class + `CityConfig` + three normalized record types |
| `lib/ingestion/knmi.ts` | Create | `KnmiAdapter` stub with hardcoded mock weather fixture |
| `lib/ingestion/luchtmeetnet.ts` | Create | `LuchtmeetnetAdapter` stub with hardcoded mock air quality fixture |
| `lib/ingestion/rijkswaterstaat.ts` | Create | `RijkswaterstaatAdapter` stub with hardcoded mock water fixture |
| `lib/ingestion/run.ts` | Create | `runIngestionJob`: SourceRun create/update + adapter orchestration + error logging |
| `app/api/jobs/ingest-weather/route.ts` | Create | POST handler — reads `?city=`, calls KnmiAdapter via runIngestionJob, stores WeatherSnapshot |
| `app/api/jobs/ingest-air-quality/route.ts` | Create | POST handler — reads `?city=`, calls LuchtmeetnetAdapter, stores AirQualitySnapshot |
| `app/api/jobs/ingest-water/route.ts` | Create | POST handler — reads `?city=`, calls RijkswaterstaatAdapter, stores WaterSnapshot |
| `app/api/jobs/regenerate-dashboard-snapshots/route.ts` | Create | POST stub returning 501 with TODO comment |
| `scripts/ingest.ts` | Create | CLI: parses `<type> --city <slug> --mock`, calls runIngestionJob, prints JSON result |
| `tests/ingestion.test.ts` | Create | Adapter shape tests (9) + source run state tests (2) — no DB required |
| `package.json` | Modify | Add `ingest:weather`, `ingest:air-quality`, `ingest:water` scripts |

---

### Task 1: Base adapter interface

**Files:**
- Create: `lib/ingestion/base.ts`

- [ ] **Step 1: Create `lib/ingestion/base.ts`**

```typescript
export type CityConfig = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type NormalizedWeatherRecord = {
  observedAt: Date;
  temperatureC: number | null;
  feelsLikeC: number | null;
  rainMm: number | null;
  rainProbability: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirection: string | null;
  weatherCode: string | null;
  warningLevel: string | null;
  sourceName: string;
};

export type NormalizedAirQualityRecord = {
  observedAt: Date;
  aqiValue: number | null;
  aqiLabel: string | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  o3: number | null;
  so2: number | null;
  mainPollutant: string | null;
  trendLabel: string | null;
  sourceName: string;
};

export type NormalizedWaterRecord = {
  observedAt: Date;
  stationId: string | null;
  stationName: string | null;
  waterLevelCm: number | null;
  trendLabel: string | null;
  riskLabel: string | null;
  sourceName: string;
};

export abstract class SourceAdapter<T> {
  abstract readonly sourceName: string;
  abstract fetch(city: CityConfig): Promise<Record<string, unknown>[]>;
  abstract normalize(rawRecords: Record<string, unknown>[], city: CityConfig): Promise<T[]>;
}
```

- [ ] **Step 2: Run typecheck to confirm base compiles**

```
npm run typecheck
```

Expected: exits 0, no errors related to `lib/ingestion/base.ts`

- [ ] **Step 3: Commit**

```bash
git add lib/ingestion/base.ts
git commit -m "feat(ingestion): add source adapter base interface and normalized record types"
```

---

### Task 2: KNMI adapter stub + tests

**Files:**
- Create: `lib/ingestion/knmi.ts`
- Create: `tests/ingestion.test.ts`

- [ ] **Step 1: Write failing test — create `tests/ingestion.test.ts`**

```typescript
import { describe, expect, it } from "vitest";
import { KnmiAdapter } from "@/lib/ingestion/knmi";

const mockCity = {
  id: "city-1",
  slug: "amsterdam",
  name: "Amsterdam",
  latitude: 52.3676,
  longitude: 4.9041,
};

describe("KnmiAdapter", () => {
  it("sourceName is mock_knmi", () => {
    expect(new KnmiAdapter().sourceName).toBe("mock_knmi");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new KnmiAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedWeatherRecord shape", async () => {
    const adapter = new KnmiAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_knmi",
      temperatureC: expect.any(Number),
      windSpeedKmh: expect.any(Number),
      windDirection: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run test to confirm it fails**

```
npm test -- tests/ingestion.test.ts
```

Expected: FAIL — `Cannot find module '@/lib/ingestion/knmi'`

- [ ] **Step 3: Create `lib/ingestion/knmi.ts`**

```typescript
import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedWeatherRecord } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  temperature: 16.2,
  feels_like: 15.4,
  rain_mm: 0.4,
  rain_probability: 0.2,
  wind_speed_kmh: 18,
  wind_gust_kmh: 32,
  wind_direction: "WSW",
  weather_code: "partly_cloudy",
  warning_level: "none",
};

export class KnmiAdapter extends SourceAdapter<NormalizedWeatherRecord> {
  readonly sourceName = "mock_knmi";

  // TODO: Decide exact current observation and forecast datasets.
  // TODO: Decide file/API access pattern.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    return [{ ...MOCK_FIXTURE }];
  }

  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWeatherRecord[]> {
    return rawRecords.map((r) => ({
      observedAt: new Date(),
      temperatureC: (r.temperature as number) ?? null,
      feelsLikeC: (r.feels_like as number) ?? null,
      rainMm: (r.rain_mm as number) ?? null,
      rainProbability: (r.rain_probability as number) ?? null,
      windSpeedKmh: (r.wind_speed_kmh as number) ?? null,
      windGustKmh: (r.wind_gust_kmh as number) ?? null,
      windDirection: (r.wind_direction as string) ?? null,
      weatherCode: (r.weather_code as string) ?? null,
      warningLevel: (r.warning_level as string) ?? null,
      sourceName: this.sourceName,
    }));
  }
}
```

- [ ] **Step 4: Run test to confirm 3 tests pass**

```
npm test -- tests/ingestion.test.ts
```

Expected: 3 PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/knmi.ts tests/ingestion.test.ts
git commit -m "feat(ingestion): add KnmiAdapter stub with mock weather fixture"
```

---

### Task 3: Luchtmeetnet adapter stub + tests

**Files:**
- Create: `lib/ingestion/luchtmeetnet.ts`
- Modify: `tests/ingestion.test.ts`

- [ ] **Step 1: Add failing tests — add to `tests/ingestion.test.ts`**

At the top of the file, add this import after the existing KnmiAdapter import:

```typescript
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
```

At the bottom of the file, append:

```typescript
describe("LuchtmeetnetAdapter", () => {
  it("sourceName is mock_luchtmeetnet", () => {
    expect(new LuchtmeetnetAdapter().sourceName).toBe("mock_luchtmeetnet");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new LuchtmeetnetAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedAirQualityRecord shape", async () => {
    const adapter = new LuchtmeetnetAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_luchtmeetnet",
      aqiValue: expect.any(Number),
      aqiLabel: expect.any(String),
      mainPollutant: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run test to confirm new tests fail**

```
npm test -- tests/ingestion.test.ts
```

Expected: 3 KNMI tests PASS, 3 Luchtmeetnet tests FAIL with `Cannot find module '@/lib/ingestion/luchtmeetnet'`

- [ ] **Step 3: Create `lib/ingestion/luchtmeetnet.ts`**

```typescript
import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedAirQualityRecord } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  aqi: 42,
  aqi_label: "Good",
  pm25: 12,
  pm10: 22,
  no2: 18,
  o3: 46,
  so2: 6,
  main_pollutant: "O3",
  trend: "stable",
};

export class LuchtmeetnetAdapter extends SourceAdapter<NormalizedAirQualityRecord> {
  readonly sourceName = "mock_luchtmeetnet";

  // TODO: Decide station selection logic.
  // TODO: Decide pollutant mapping and AQI/category method.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    return [{ ...MOCK_FIXTURE }];
  }

  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedAirQualityRecord[]> {
    return rawRecords.map((r) => ({
      observedAt: new Date(),
      aqiValue: (r.aqi as number) ?? null,
      aqiLabel: (r.aqi_label as string) ?? null,
      pm25: (r.pm25 as number) ?? null,
      pm10: (r.pm10 as number) ?? null,
      no2: (r.no2 as number) ?? null,
      o3: (r.o3 as number) ?? null,
      so2: (r.so2 as number) ?? null,
      mainPollutant: (r.main_pollutant as string) ?? null,
      trendLabel: (r.trend as string) ?? null,
      sourceName: this.sourceName,
    }));
  }
}
```

- [ ] **Step 4: Run test to confirm 6 tests pass**

```
npm test -- tests/ingestion.test.ts
```

Expected: 6 PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/luchtmeetnet.ts tests/ingestion.test.ts
git commit -m "feat(ingestion): add LuchtmeetnetAdapter stub with mock air quality fixture"
```

---

### Task 4: Rijkswaterstaat adapter stub + tests

**Files:**
- Create: `lib/ingestion/rijkswaterstaat.ts`
- Modify: `tests/ingestion.test.ts`

- [ ] **Step 1: Add failing tests — add to `tests/ingestion.test.ts`**

At the top of the file, add this import after the LuchtmeetnetAdapter import:

```typescript
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";
```

At the bottom of the file, append:

```typescript
describe("RijkswaterstaatAdapter", () => {
  it("sourceName is mock_rijkswaterstaat", () => {
    expect(new RijkswaterstaatAdapter().sourceName).toBe("mock_rijkswaterstaat");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new RijkswaterstaatAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedWaterRecord shape", async () => {
    const adapter = new RijkswaterstaatAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_rijkswaterstaat",
      stationName: expect.any(String),
      waterLevelCm: expect.any(Number),
      trendLabel: expect.any(String),
      riskLabel: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});
```

- [ ] **Step 2: Run test to confirm new tests fail**

```
npm test -- tests/ingestion.test.ts
```

Expected: 6 PASS, 3 Rijkswaterstaat FAIL with `Cannot find module '@/lib/ingestion/rijkswaterstaat'`

- [ ] **Step 3: Create `lib/ingestion/rijkswaterstaat.ts`**

```typescript
import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedWaterRecord } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  station_id: "AMS-mock",
  station_name: "Amsterdam mock station",
  water_level_cm: 14,
  trend: "stable",
  risk_label: "normal",
};

export class RijkswaterstaatAdapter extends SourceAdapter<NormalizedWaterRecord> {
  readonly sourceName = "mock_rijkswaterstaat";

  // TODO: Decide nearest station matching logic.
  // TODO: Decide supported measurement type for water-level trend.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    return [{ ...MOCK_FIXTURE }];
  }

  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWaterRecord[]> {
    return rawRecords.map((r) => ({
      observedAt: new Date(),
      stationId: (r.station_id as string) ?? null,
      stationName: (r.station_name as string) ?? null,
      waterLevelCm: (r.water_level_cm as number) ?? null,
      trendLabel: (r.trend as string) ?? null,
      riskLabel: (r.risk_label as string) ?? null,
      sourceName: this.sourceName,
    }));
  }
}
```

- [ ] **Step 4: Run test to confirm 9 tests pass**

```
npm test -- tests/ingestion.test.ts
```

Expected: 9 PASS

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/rijkswaterstaat.ts tests/ingestion.test.ts
git commit -m "feat(ingestion): add RijkswaterstaatAdapter stub with mock water fixture"
```

---

### Task 5: Ingestion run function + source run tests

**Files:**
- Create: `lib/ingestion/run.ts`
- Modify: `tests/ingestion.test.ts`

- [ ] **Step 1: Add failing tests — modify `tests/ingestion.test.ts`**

Change the existing first import line from:
```typescript
import { describe, expect, it } from "vitest";
```
to:
```typescript
import { describe, expect, it, vi } from "vitest";
```

Add these imports at the top of the file (after the adapter imports):
```typescript
import type { PrismaClient } from "@prisma/client";
import { runIngestionJob } from "@/lib/ingestion/run";
```

Append this at the bottom of the file:

```typescript
function makePrismaStub() {
  return {
    sourceRun: {
      create: vi.fn().mockResolvedValue({ id: "run-abc" }),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaClient;
}

describe("runIngestionJob", () => {
  it("records status=success and updates source_run on success", async () => {
    const prisma = makePrismaStub();
    const adapter = new KnmiAdapter();

    const result = await runIngestionJob({
      adapter,
      city: mockCity,
      jobType: "ingest-weather",
      store: async (records) => ({ recordsStored: records.length }),
      prisma,
    });

    expect(result.status).toBe("success");
    expect(result.recordsFetched).toBeGreaterThan(0);
    expect(result.recordsStored).toBeGreaterThan(0);
    expect(prisma.sourceRun.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "running",
        sourceName: "mock_knmi",
        jobType: "ingest-weather",
      }),
    });
    expect(prisma.sourceRun.update).toHaveBeenCalledWith({
      where: { id: "run-abc" },
      data: expect.objectContaining({ status: "success" }),
    });
  });

  it("records status=failed and stores errorMessage when adapter throws", async () => {
    const prisma = makePrismaStub();
    const adapter = new KnmiAdapter();
    vi.spyOn(adapter, "fetch").mockRejectedValue(new Error("network timeout"));

    const result = await runIngestionJob({
      adapter,
      city: mockCity,
      jobType: "ingest-weather",
      store: async () => ({ recordsStored: 0 }),
      prisma,
    });

    expect(result.status).toBe("failed");
    expect(result.error).toBe("network timeout");
    expect(prisma.sourceRun.update).toHaveBeenCalledWith({
      where: { id: "run-abc" },
      data: expect.objectContaining({
        status: "failed",
        errorMessage: "network timeout",
      }),
    });
  });
});
```

- [ ] **Step 2: Run test to confirm new tests fail**

```
npm test -- tests/ingestion.test.ts
```

Expected: 9 PASS, 2 FAIL with `Cannot find module '@/lib/ingestion/run'`

- [ ] **Step 3: Create `lib/ingestion/run.ts`**

```typescript
import type { PrismaClient } from "@prisma/client";
import type { SourceAdapter, CityConfig } from "./base";

export type IngestionResult = {
  status: "success" | "failed";
  recordsFetched: number;
  recordsStored: number;
  error?: string;
};

export async function runIngestionJob<T>(options: {
  adapter: SourceAdapter<T>;
  city: CityConfig;
  jobType: string;
  store: (records: T[], city: CityConfig, prisma: PrismaClient) => Promise<{ recordsStored: number }>;
  prisma: PrismaClient;
}): Promise<IngestionResult> {
  const { adapter, city, jobType, store, prisma } = options;

  const run = await prisma.sourceRun.create({
    data: {
      sourceName: adapter.sourceName,
      jobType,
      status: "running",
    },
  });

  try {
    const rawRecords = await adapter.fetch(city);
    const normalized = await adapter.normalize(rawRecords, city);
    const { recordsStored } = await store(normalized, city, prisma);

    await prisma.sourceRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        recordsFetched: rawRecords.length,
        recordsStored,
      },
    });

    return { status: "success", recordsFetched: rawRecords.length, recordsStored };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    await prisma.sourceRun.update({
      where: { id: run.id },
      data: {
        status: "failed",
        finishedAt: new Date(),
        errorMessage: message,
      },
    });

    console.error(`[ingestion] ${adapter.sourceName} failed: ${message}`);

    return { status: "failed", recordsFetched: 0, recordsStored: 0, error: message };
  }
}
```

- [ ] **Step 4: Run all tests to confirm 11 pass**

```
npm test
```

Expected: 11 PASS total (2 existing dashboard tests + 9 adapter tests + 2 run tests)

- [ ] **Step 5: Commit**

```bash
git add lib/ingestion/run.ts tests/ingestion.test.ts
git commit -m "feat(ingestion): add runIngestionJob with source_run tracking and error handling"
```

---

### Task 6: Weather ingestion API route

**Files:**
- Create: `app/api/jobs/ingest-weather/route.ts`

- [ ] **Step 1: Create `app/api/jobs/ingest-weather/route.ts`**

```typescript
import { prisma } from "@/lib/db";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedWeatherRecord, CityConfig } from "@/lib/ingestion/base";
import type { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) {
    return Response.json({ error: "City not found", city: citySlug }, { status: 404 });
  }

  const cityConfig: CityConfig = {
    id: city.id,
    slug: city.slug,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  const result = await runIngestionJob({
    adapter: new KnmiAdapter(),
    city: cityConfig,
    jobType: "ingest-weather",
    store: async (records: NormalizedWeatherRecord[], cfg: CityConfig, db: PrismaClient) => {
      for (const r of records) {
        await db.weatherSnapshot.create({ data: { cityId: cfg.id, ...r } });
      }
      return { recordsStored: records.length };
    },
    prisma,
  });

  return Response.json(result, { status: result.status === "success" ? 200 : 500 });
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add app/api/jobs/ingest-weather/route.ts
git commit -m "feat(ingestion): add ingest-weather API route"
```

---

### Task 7: Air quality ingestion API route

**Files:**
- Create: `app/api/jobs/ingest-air-quality/route.ts`

- [ ] **Step 1: Create `app/api/jobs/ingest-air-quality/route.ts`**

```typescript
import { prisma } from "@/lib/db";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedAirQualityRecord, CityConfig } from "@/lib/ingestion/base";
import type { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) {
    return Response.json({ error: "City not found", city: citySlug }, { status: 404 });
  }

  const cityConfig: CityConfig = {
    id: city.id,
    slug: city.slug,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  const result = await runIngestionJob({
    adapter: new LuchtmeetnetAdapter(),
    city: cityConfig,
    jobType: "ingest-air-quality",
    store: async (records: NormalizedAirQualityRecord[], cfg: CityConfig, db: PrismaClient) => {
      for (const r of records) {
        await db.airQualitySnapshot.create({ data: { cityId: cfg.id, ...r } });
      }
      return { recordsStored: records.length };
    },
    prisma,
  });

  return Response.json(result, { status: result.status === "success" ? 200 : 500 });
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add app/api/jobs/ingest-air-quality/route.ts
git commit -m "feat(ingestion): add ingest-air-quality API route"
```

---

### Task 8: Water ingestion API route

**Files:**
- Create: `app/api/jobs/ingest-water/route.ts`

- [ ] **Step 1: Create `app/api/jobs/ingest-water/route.ts`**

```typescript
import { prisma } from "@/lib/db";
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedWaterRecord, CityConfig } from "@/lib/ingestion/base";
import type { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) {
    return Response.json({ error: "City not found", city: citySlug }, { status: 404 });
  }

  const cityConfig: CityConfig = {
    id: city.id,
    slug: city.slug,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  const result = await runIngestionJob({
    adapter: new RijkswaterstaatAdapter(),
    city: cityConfig,
    jobType: "ingest-water",
    store: async (records: NormalizedWaterRecord[], cfg: CityConfig, db: PrismaClient) => {
      for (const r of records) {
        await db.waterSnapshot.create({ data: { cityId: cfg.id, ...r } });
      }
      return { recordsStored: records.length };
    },
    prisma,
  });

  return Response.json(result, { status: result.status === "success" ? 200 : 500 });
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add app/api/jobs/ingest-water/route.ts
git commit -m "feat(ingestion): add ingest-water API route"
```

---

### Task 9: Dashboard snapshot regeneration stub

**Files:**
- Create: `app/api/jobs/regenerate-dashboard-snapshots/route.ts`

- [ ] **Step 1: Create `app/api/jobs/regenerate-dashboard-snapshots/route.ts`**

```typescript
export async function POST() {
  // TODO: Implement dashboard snapshot regeneration:
  // 1. Parse ?city= param and look up city.
  // 2. Find latest WeatherSnapshot, AirQualitySnapshot, WaterSnapshot for city.
  // 3. Compute cycleComfortScore, cycleComfortLabel, bestOutdoorWindow, worstOutdoorWindow.
  // 4. Create DashboardSnapshot linking the latest snapshots.
  // 5. Trigger AI briefing generation (separate spec).
  return Response.json(
    {
      error: "not_implemented",
      message: "Dashboard snapshot regeneration is not yet implemented.",
    },
    { status: 501 },
  );
}
```

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 3: Commit**

```bash
git add app/api/jobs/regenerate-dashboard-snapshots/route.ts
git commit -m "feat(ingestion): add regenerate-dashboard-snapshots stub (501)"
```

---

### Task 10: CLI entrypoint + package.json scripts

**Files:**
- Create: `scripts/ingest.ts`
- Modify: `package.json`

- [ ] **Step 1: Create `scripts/ingest.ts`**

Note: dotenv must be called before `new PrismaClient()` but after importing the class. Static imports only load class definitions — no DB connection is made until `new PrismaClient()` runs inside `main()`.

```typescript
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedWeatherRecord, NormalizedAirQualityRecord, NormalizedWaterRecord, CityConfig } from "@/lib/ingestion/base";

const VALID_TYPES = ["weather", "air-quality", "water"] as const;
type IngestType = (typeof VALID_TYPES)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const type = args[0] as IngestType | undefined;
  const cityIndex = args.indexOf("--city");
  const city = cityIndex !== -1 ? args[cityIndex + 1] : "amsterdam";
  const mock = args.includes("--mock");
  return { type, city, mock };
}

async function main() {
  const { type, city: citySlug } = parseArgs();

  if (!type || !(VALID_TYPES as readonly string[]).includes(type)) {
    console.error("Usage: tsx scripts/ingest.ts <weather|air-quality|water> --city <slug> [--mock]");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const dbCity = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!dbCity) {
    console.error(`City not found: ${citySlug}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const city: CityConfig = {
    id: dbCity.id,
    slug: dbCity.slug,
    name: dbCity.name,
    latitude: dbCity.latitude,
    longitude: dbCity.longitude,
  };

  let result;

  if (type === "weather") {
    result = await runIngestionJob({
      adapter: new KnmiAdapter(),
      city,
      jobType: "ingest-weather",
      store: async (records: NormalizedWeatherRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.weatherSnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  } else if (type === "air-quality") {
    result = await runIngestionJob({
      adapter: new LuchtmeetnetAdapter(),
      city,
      jobType: "ingest-air-quality",
      store: async (records: NormalizedAirQualityRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.airQualitySnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  } else {
    result = await runIngestionJob({
      adapter: new RijkswaterstaatAdapter(),
      city,
      jobType: "ingest-water",
      store: async (records: NormalizedWaterRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.waterSnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  }

  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
```

- [ ] **Step 2: Add scripts to `package.json`**

In the `"scripts"` object, after `"db:studio": "prisma studio"`, add:

```json
"ingest:weather": "tsx scripts/ingest.ts weather",
"ingest:air-quality": "tsx scripts/ingest.ts air-quality",
"ingest:water": "tsx scripts/ingest.ts water"
```

- [ ] **Step 3: Run typecheck**

```
npm run typecheck
```

Expected: exits 0

- [ ] **Step 4: Commit**

```bash
git add scripts/ingest.ts package.json
git commit -m "feat(ingestion): add CLI ingest entrypoint and npm scripts"
```

---

### Task 11: Full validation

**Files:** none (validation only)

- [ ] **Step 1: Run all tests**

```
npm test
```

Expected: 11 PASS (2 dashboard + 9 adapter + 2 run)

- [ ] **Step 2: Run typecheck**

```
npm run typecheck
```

Expected: 0 errors

- [ ] **Step 3: Run lint**

```
npm run lint
```

Expected: 0 errors or warnings

- [ ] **Step 4: Commit if lint auto-fixed anything; otherwise done**

```bash
git status
# if any files changed from lint --fix:
git add <changed files>
git commit -m "chore: lint fixes after ingestion scaffold"
```
