import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  regenerateAllDashboardSnapshots,
  regenerateDashboardSnapshot,
} from "@/lib/dashboard-regeneration";

const now = new Date("2026-05-06T10:00:00.000Z");

const city = {
  id: "city-amsterdam",
  slug: "amsterdam",
  name: "Amsterdam",
  countryCode: "NL",
  latitude: 52.3676,
  longitude: 4.9041,
  timezone: "Europe/Amsterdam",
  isActive: true,
  createdAt: new Date("2026-05-05T00:00:00.000Z"),
};

const weather = {
  id: "weather-1",
  cityId: city.id,
  observedAt: new Date("2026-05-06T09:50:00.000Z"),
  ingestedAt: new Date("2026-05-06T09:52:00.000Z"),
  temperatureC: 17,
  feelsLikeC: 16,
  rainMm: 0.2,
  rainProbability: 0.1,
  windSpeedKmh: 18,
  windGustKmh: 28,
  windDirection: "WSW",
  weatherCode: null,
  warningLevel: null,
  sourceName: "knmi",
  sourcePayload: null,
};

const air = {
  id: "air-1",
  cityId: city.id,
  observedAt: new Date("2026-05-06T09:00:00.000Z"),
  ingestedAt: new Date("2026-05-06T09:05:00.000Z"),
  aqiValue: 18,
  aqiLabel: "Good",
  pm25: 5,
  pm10: 18,
  no2: 12,
  o3: null,
  so2: null,
  mainPollutant: "PM10",
  trendLabel: "unknown",
  sourceName: "luchtmeetnet",
  sourcePayload: null,
};

const water = {
  id: "water-1",
  cityId: city.id,
  stationId: "zijkanaal.h",
  stationName: "Zijkanaal, H",
  observedAt: new Date("2026-05-06T08:45:00.000Z"),
  ingestedAt: new Date("2026-05-06T08:46:00.000Z"),
  waterLevelCm: 12.4,
  trendLabel: "unknown",
  riskLabel: "normal",
  sourceName: "rijkswaterstaat",
  sourcePayload: null,
};

function makePrismaStub(overrides: {
  weather?: typeof weather | null;
  air?: typeof air | null;
  water?: typeof water | null;
  existingDashboard?: { id: string; stateHash: string } | null;
} = {}) {
  return {
    city: {
      findUnique: vi.fn().mockResolvedValue(city),
      findMany: vi.fn().mockResolvedValue([
        city,
        { ...city, id: "city-utrecht", slug: "utrecht", name: "Utrecht" },
      ]),
    },
    weatherSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.weather === undefined ? weather : overrides.weather),
    },
    airQualitySnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.air === undefined ? air : overrides.air),
    },
    waterSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.water === undefined ? water : overrides.water),
    },
    dashboardSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.existingDashboard ?? null),
      create: vi.fn().mockResolvedValue({ id: "dashboard-1", stateHash: "created-hash" }),
    },
  } as unknown as PrismaClient;
}

describe("regenerateDashboardSnapshot", () => {
  it("creates a dashboard snapshot from latest complete source data", async () => {
    const prisma = makePrismaStub();

    const result = await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    expect(result).toMatchObject({
      city: "amsterdam",
      created: true,
      dashboardSnapshotId: "dashboard-1",
    });
    expect(prisma.dashboardSnapshot.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cityId: "city-amsterdam",
        weatherSnapshotId: "weather-1",
        airQualitySnapshotId: "air-1",
        waterSnapshotId: "water-1",
        cycleComfortLabel: "good",
      }),
    });
    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.summaryPayload).toMatchObject({
      source_status: {
        weather: { status: "fresh", source: "knmi" },
        air_quality: { status: "fresh", source: "luchtmeetnet" },
        water: { status: "fresh", source: "rijkswaterstaat" },
      },
    });
  });

  it("records missing and stale source states without inventing values", async () => {
    const prisma = makePrismaStub({
      air: null,
      water: { ...water, observedAt: new Date("2026-05-04T08:45:00.000Z") },
    });

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.airQualitySnapshotId).toBeNull();
    expect(data.summaryPayload).toMatchObject({
      source_status: {
        air_quality: {
          status: "missing",
          detail: "No air quality snapshot is available for this city.",
        },
        water: {
          status: "stale",
          detail: "Latest water observation is older than 24 hours.",
        },
      },
    });
  });

  it("does not create a duplicate dashboard snapshot for an unchanged state hash", async () => {
    const firstPrisma = makePrismaStub();
    const first = await regenerateDashboardSnapshot({ prisma: firstPrisma, citySlug: "amsterdam", now });
    const createdData = vi.mocked(firstPrisma.dashboardSnapshot.create).mock.calls[0][0].data;
    const secondPrisma = makePrismaStub({
      existingDashboard: { id: "dashboard-existing", stateHash: String(createdData.stateHash) },
    });

    const second = await regenerateDashboardSnapshot({
      prisma: secondPrisma,
      citySlug: "amsterdam",
      now,
    });

    expect(first.created).toBe(true);
    expect(second).toEqual({
      city: "amsterdam",
      created: false,
      dashboardSnapshotId: "dashboard-existing",
      stateHash: createdData.stateHash,
    });
    expect(secondPrisma.dashboardSnapshot.create).not.toHaveBeenCalled();
  });
});

describe("regenerateAllDashboardSnapshots", () => {
  it("regenerates snapshots for all active cities", async () => {
    const prisma = makePrismaStub();

    const result = await regenerateAllDashboardSnapshots({ prisma, now });

    expect(result.map((item) => item.city)).toEqual(["amsterdam", "utrecht"]);
    expect(prisma.dashboardSnapshot.create).toHaveBeenCalledTimes(2);
  });
});
