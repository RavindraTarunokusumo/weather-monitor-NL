import { describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import type { Mock } from "vitest";
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

const supportedCitySlugs = [
  "amsterdam",
  "arnhem",
  "breda",
  "den-haag",
  "dordrecht",
  "groningen",
  "maastricht",
  "nijmegen",
  "rotterdam",
  "utrecht",
];

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
  weatherCode: "partly_cloudy",
  warningLevel: "yellow",
  sourceName: "knmi",
  sourcePayload: {
    forecast: {
      hourly: [
        { h: "09", rain: 10, wind: 14, temp: 16 },
        { h: "12", rain: 15, wind: 18, temp: 18 },
        { h: "15", rain: 60, wind: 24, temp: 17 },
      ],
      weekly: [
        { day: "Wed", hi: 18, lo: 10, rain: 60 },
        { day: "Thu", hi: 17, lo: 11, rain: 30 },
        { day: "Fri", hi: 16, lo: 10, rain: 20 },
        { day: "Sat", hi: 15, lo: 9, rain: 40 },
        { day: "Sun", hi: 15, lo: 8, rain: 50 },
        { day: "Mon", hi: 14, lo: 8, rain: 70 },
        { day: "Tue", hi: 14, lo: 7, rain: 80 },
      ],
    },
    warning: {
      level: "yellow",
      region: "Noord-Holland",
    },
  },
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
  trendLabel: "falling",
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
  trendLabel: "rising",
  riskLabel: "normal",
  sourceName: "rijkswaterstaat",
  sourcePayload: {
    weekly_levels_cm: [9, 10, 10, 11, 12, 12, 13],
  },
};

type WeatherTestSnapshot = Omit<
  typeof weather,
  "rainProbability" | "weatherCode" | "warningLevel" | "sourcePayload"
> & {
  rainProbability: number | null;
  weatherCode: string | null;
  warningLevel: string | null;
  sourcePayload: unknown;
};

type WaterTestSnapshot = Omit<
  typeof water,
  "trendLabel" | "riskLabel" | "sourcePayload"
> & {
  trendLabel: string | null;
  riskLabel: string | null;
  sourcePayload: unknown;
};

function makePrismaStub(overrides: {
  weather?: WeatherTestSnapshot | null;
  air?: typeof air | null;
  water?: WaterTestSnapshot | null;
  existingDashboard?: { id: string; stateHash: string } | null;
} = {}) {
  return {
    city: {
      findUnique: vi.fn().mockResolvedValue(city),
      findMany: vi.fn().mockResolvedValue(
        supportedCitySlugs.map((slug) => ({
          ...city,
          id: `city-${slug}`,
          slug,
          name: slug
            .split("-")
            .map((part) => part[0].toUpperCase() + part.slice(1))
            .join(" "),
        })),
      ),
    },
    weatherSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.weather === undefined ? weather : overrides.weather),
      findMany: vi.fn().mockResolvedValue([]),
    },
    airQualitySnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.air === undefined ? air : overrides.air),
    },
    waterSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.water === undefined ? water : overrides.water),
      findMany: vi.fn().mockResolvedValue([]),
    },
    dashboardSnapshot: {
      findFirst: vi.fn().mockResolvedValue(overrides.existingDashboard ?? null),
      update: vi.fn().mockResolvedValue({}),
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
      ui_summary: {
        best_window: expect.any(String),
        main_risk: "Yellow weather warning",
        changed: expect.any(String),
        outdoor_window_detail: expect.any(String),
        risk_detail: expect.stringContaining("Noord-Holland"),
        changed_detail: expect.any(String),
      },
      outlook: {
        hourly: [
          { h: "09", rain: 10, wind: 14, temp: 16 },
          { h: "12", rain: 15, wind: 18, temp: 18 },
          { h: "15", rain: 60, wind: 24, temp: 17 },
        ],
        weekly: expect.arrayContaining([{ day: "Wed", hi: 18, lo: 10, rain: 60 }]),
      },
      water_signal: {
        weekly_levels_cm: [9, 10, 10, 11, 12, 12, 13],
      },
    });
  });

  it("chooses the lowest-risk 3-hour daytime window from the first 24 forecast entries", async () => {
    const hourly = Array.from({ length: 30 }, (_, index) => ({
      h: (index % 24).toString().padStart(2, "0"),
      rain: index >= 24 ? 0 : 80,
      wind: index >= 24 ? 0 : 40,
      temp: 16,
    }));
    hourly[9] = { h: "09", rain: 5, wind: 8, temp: 16 };
    hourly[10] = { h: "10", rain: 4, wind: 8, temp: 16 };
    hourly[11] = { h: "11", rain: 5, wind: 8, temp: 16 };
    const prisma = makePrismaStub({
      weather: {
        ...weather,
        sourcePayload: {
          ...weather.sourcePayload,
          forecast: {
            ...weather.sourcePayload.forecast,
            hourly,
          },
        },
      },
    });

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.summaryPayload).toMatchObject({
      ui_summary: {
        best_window: "09:00-12:00",
        outdoor_window_detail: "Best available 3-hour outdoor window is 09:00-12:00.",
      },
    });
  });

  it("describes what changed from the previous dashboard snapshot", async () => {
    const prisma = makePrismaStub();

    (prisma.dashboardSnapshot.findFirst as unknown as Mock).mockImplementation(({ where }) => {
      if ("stateHash" in where) {
        return Promise.resolve(null);
      }

      return Promise.resolve({
        id: "dashboard-previous",
        stateHash: "previous-hash",
        summaryPayload: {
          current: {
            temperature_c: 12,
            rain_probability: 0.7,
          },
          air_quality: {
            trend: "stable",
          },
          water_signal: {
            trend: "falling",
          },
        },
      });
    });

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.summaryPayload).toMatchObject({
      ui_summary: {
        changed: "Temperature changed",
        changed_detail: "Temperature changed from 12.0°C to 17.0°C.",
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

  it("prefers live source snapshots over newer mock snapshots", async () => {
    const mockWeather = {
      ...weather,
      id: "weather-mock-newer",
      observedAt: new Date("2026-05-06T09:59:00.000Z"),
      sourceName: "mock_knmi",
    };
    const mockAir = {
      ...air,
      id: "air-mock-newer",
      observedAt: new Date("2026-05-06T09:59:00.000Z"),
      sourceName: "mock_luchtmeetnet",
    };
    const mockWater = {
      ...water,
      id: "water-mock-newer",
      observedAt: new Date("2026-05-06T09:59:00.000Z"),
      sourceName: "mock_rijkswaterstaat",
    };
    const prisma = makePrismaStub({
      weather: mockWeather,
      air: mockAir,
      water: mockWater,
    });

    (prisma.weatherSnapshot.findFirst as unknown as Mock).mockImplementation(({ where }) =>
      Promise.resolve("sourceName" in where ? weather : mockWeather),
    );
    (prisma.airQualitySnapshot.findFirst as unknown as Mock).mockImplementation(({ where }) =>
      Promise.resolve("sourceName" in where ? air : mockAir),
    );
    (prisma.waterSnapshot.findFirst as unknown as Mock).mockImplementation(({ where }) =>
      Promise.resolve("sourceName" in where ? water : mockWater),
    );

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    expect(prisma.dashboardSnapshot.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        weatherSnapshotId: "weather-1",
        airQualitySnapshotId: "air-1",
        waterSnapshotId: "water-1",
      }),
    });
    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.summaryPayload).toMatchObject({
      source_status: {
        weather: { source: "knmi" },
        air_quality: { source: "luchtmeetnet" },
        water: { source: "rijkswaterstaat" },
      },
    });
  });

  it("uses the latest enriched weather payload when the newest live weather row has observations only", async () => {
    const currentWeatherOnly = {
      ...weather,
      id: "weather-current-observation",
      observedAt: new Date("2026-05-06T09:59:00.000Z"),
      temperatureC: 18,
      weatherCode: null,
      warningLevel: null,
      rainProbability: null,
      sourcePayload: null,
    };
    const prisma = makePrismaStub({ weather: currentWeatherOnly });

    (prisma.weatherSnapshot.findMany as unknown as Mock).mockResolvedValue([
      currentWeatherOnly,
      weather,
    ]);

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.weatherSnapshotId).toBe("weather-current-observation");
    expect(data.summaryPayload).toMatchObject({
      current: {
        temperature_c: 18,
        rain_probability: 0.1,
        weather_code: "partly_cloudy",
        warning_level: "yellow",
      },
      ui_summary: {
        best_window: expect.any(String),
        main_risk: "Yellow weather warning",
        outdoor_window_detail: expect.not.stringContaining("unavailable"),
      },
      outlook: {
        hourly: [
          { h: "09", rain: 10, wind: 14, temp: 16 },
          { h: "12", rain: 15, wind: 18, temp: 18 },
          { h: "15", rain: 60, wind: 24, temp: 17 },
        ],
      },
    });
  });

  it("uses the latest enriched water payload when the newest live water row has observations only", async () => {
    const currentWaterOnly = {
      ...water,
      id: "water-current-observation",
      observedAt: new Date("2026-05-06T09:59:00.000Z"),
      waterLevelCm: 18,
      trendLabel: "unknown",
      riskLabel: "normal",
      sourcePayload: null,
    };
    const prisma = makePrismaStub({ water: currentWaterOnly });

    (prisma.waterSnapshot.findMany as unknown as Mock).mockResolvedValue([
      currentWaterOnly,
      water,
    ]);

    await regenerateDashboardSnapshot({ prisma, citySlug: "amsterdam", now });

    const data = vi.mocked(prisma.dashboardSnapshot.create).mock.calls[0][0].data;
    expect(data.waterSnapshotId).toBe("water-current-observation");
    expect(data.summaryPayload).toMatchObject({
      water_signal: {
        trend: "rising",
        risk_label: "normal",
        weekly_levels_cm: [9, 10, 10, 11, 12, 12, 13],
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
    expect(secondPrisma.dashboardSnapshot.update).toHaveBeenCalledWith({
      where: { id: "dashboard-existing" },
      data: { generatedAt: now },
    });
  });
});

describe("regenerateAllDashboardSnapshots", () => {
  it("regenerates snapshots for all active cities", async () => {
    const prisma = makePrismaStub();

    const result = await regenerateAllDashboardSnapshots({ prisma, now });

    expect(result.map((item) => item.city)).toEqual(supportedCitySlugs);
    expect(prisma.dashboardSnapshot.create).toHaveBeenCalledTimes(10);
  });
});
