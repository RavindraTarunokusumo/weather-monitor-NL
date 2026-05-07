import { createHash } from "node:crypto";
import type { Prisma, PrismaClient } from "@prisma/client";

type DbCity = {
  id: string;
  slug: string;
  name: string;
  isActive: boolean;
};

type Snapshot = {
  id: string;
  observedAt: Date | string;
  sourceName: string;
};

type WeatherSnapshot = Snapshot & {
  temperatureC: number | null;
  feelsLikeC: number | null;
  rainMm: number | null;
  rainProbability: number | null;
  windSpeedKmh: number | null;
  windGustKmh: number | null;
  windDirection: string | null;
};

type AirQualitySnapshot = Snapshot & {
  aqiValue: number | null;
  aqiLabel: string | null;
  mainPollutant: string | null;
  trendLabel: string | null;
};

type WaterSnapshot = Snapshot & {
  stationName: string | null;
  waterLevelCm: number | null;
  trendLabel: string | null;
  riskLabel: string | null;
};

type SourceStatus = {
  source: string;
  status: "fresh" | "stale" | "missing";
  observed_at: string | null;
  detail: string | null;
};

export type RegenerateDashboardResult = {
  city: string;
  created: boolean;
  dashboardSnapshotId: string;
  stateHash: string;
};

export async function regenerateDashboardSnapshot(options: {
  prisma: PrismaClient;
  citySlug: string;
  now?: Date;
  force?: boolean;
}): Promise<RegenerateDashboardResult> {
  const city = await getActiveCity(options.prisma, options.citySlug);
  return regenerateForCity({
    prisma: options.prisma,
    city,
    now: options.now ?? new Date(),
    force: options.force ?? false,
  });
}

export async function regenerateAllDashboardSnapshots(options: {
  prisma: PrismaClient;
  now?: Date;
  force?: boolean;
}): Promise<RegenerateDashboardResult[]> {
  const cities = (await options.prisma.city.findMany({
    where: { isActive: true },
    orderBy: { slug: "asc" },
  })) as DbCity[];
  const results: RegenerateDashboardResult[] = [];

  for (const city of cities) {
    results.push(
      await regenerateForCity({
        prisma: options.prisma,
        city,
        now: options.now ?? new Date(),
        force: options.force ?? false,
      }),
    );
  }

  return results;
}

async function regenerateForCity(options: {
  prisma: PrismaClient;
  city: DbCity;
  now: Date;
  force: boolean;
}) {
  const { prisma, city, now, force } = options;
  const [weather, airQuality, water] = await Promise.all([
    findPreferredSourceSnapshot<WeatherSnapshot>(prisma.weatherSnapshot, city.id),
    findPreferredSourceSnapshot<AirQualitySnapshot>(prisma.airQualitySnapshot, city.id),
    findPreferredSourceSnapshot<WaterSnapshot>(prisma.waterSnapshot, city.id),
  ]);
  const sourceStatus = {
    weather: buildSourceStatus("weather", weather, now, 2),
    air_quality: buildSourceStatus("air quality", airQuality, now, 6),
    water: buildSourceStatus("water", water, now, 24),
  };
  const comfort = computeCycleComfort(weather, airQuality);
  const summaryPayload = {
    source_status: sourceStatus,
    current: {
      temperature_c: weather?.temperatureC ?? null,
      rain_mm: weather?.rainMm ?? null,
      wind_speed_kmh: weather?.windSpeedKmh ?? null,
      wind_gust_kmh: weather?.windGustKmh ?? null,
      wind_direction: weather?.windDirection ?? null,
    },
    cycle_comfort: {
      score: comfort.score,
      category: comfort.label,
      drivers: comfort.drivers,
    },
    air_quality: {
      category: airQuality?.aqiLabel ?? null,
      main_pollutant: airQuality?.mainPollutant ?? null,
      trend: airQuality?.trendLabel ?? null,
    },
    water_signal: {
      station: water?.stationName ?? null,
      trend: water?.trendLabel ?? null,
      risk_label: water?.riskLabel ?? null,
    },
  };
  const stateHash = hashState({
    weatherSnapshotId: weather?.id ?? null,
    airQualitySnapshotId: airQuality?.id ?? null,
    waterSnapshotId: water?.id ?? null,
    comfort,
    sourceStatus,
  });
  const existing = await prisma.dashboardSnapshot.findFirst({
    where: { cityId: city.id, stateHash },
    orderBy: { generatedAt: "desc" },
  });

  if (existing && !force) {
    await prisma.dashboardSnapshot.update({
      where: { id: existing.id },
      data: { generatedAt: now },
    });

    return {
      city: city.slug,
      created: false,
      dashboardSnapshotId: existing.id,
      stateHash,
    };
  }

  const created = await prisma.dashboardSnapshot.create({
    data: {
      cityId: city.id,
      generatedAt: now,
      stateHash,
      weatherSnapshotId: weather?.id ?? null,
      airQualitySnapshotId: airQuality?.id ?? null,
      waterSnapshotId: water?.id ?? null,
      cycleComfortScore: comfort.score,
      cycleComfortLabel: comfort.label,
      bestOutdoorWindow: comfort.score === null ? null : "10:00-16:00",
      worstOutdoorWindow: comfort.score === null ? null : "18:00-21:00",
      summaryPayload: summaryPayload as Prisma.InputJsonObject,
    },
  });

  return {
    city: city.slug,
    created: true,
    dashboardSnapshotId: created.id,
    stateHash,
  };
}

async function getActiveCity(prisma: PrismaClient, citySlug: string) {
  const city = (await prisma.city.findUnique({
    where: { slug: citySlug },
  })) as DbCity | null;

  if (!city || !city.isActive) {
    throw new Error(`City not found or inactive: ${citySlug}`);
  }

  return city;
}

async function findPreferredSourceSnapshot<T extends Snapshot>(
  delegate: {
    findFirst: (args: {
      where: {
        cityId: string;
        sourceName?: { not: { startsWith: string } };
      };
      orderBy: Array<{ observedAt: "desc" } | { ingestedAt: "desc" }>;
    }) => Promise<T | null>;
  },
  cityId: string,
) {
  const orderBy: Array<{ observedAt: "desc" } | { ingestedAt: "desc" }> = [
    { observedAt: "desc" },
    { ingestedAt: "desc" },
  ];
  const liveSnapshot = await delegate.findFirst({
    where: { cityId, sourceName: { not: { startsWith: "mock_" } } },
    orderBy,
  });

  if (liveSnapshot) {
    return liveSnapshot;
  }

  return delegate.findFirst({
    where: { cityId },
    orderBy,
  });
}

function buildSourceStatus(
  label: string,
  snapshot: Snapshot | null,
  now: Date,
  staleAfterHours: number,
): SourceStatus {
  if (!snapshot) {
    return {
      source: label,
      status: "missing",
      observed_at: null,
      detail: `No ${label} snapshot is available for this city.`,
    };
  }

  const observedAt = toDate(snapshot.observedAt);
  const ageMs = now.getTime() - observedAt.getTime();
  const stale = ageMs > staleAfterHours * 60 * 60 * 1000;

  return {
    source: snapshot.sourceName,
    status: stale ? "stale" : "fresh",
    observed_at: observedAt.toISOString(),
    detail: stale ? `Latest ${label} observation is older than ${staleAfterHours} hours.` : null,
  };
}

function computeCycleComfort(weather: WeatherSnapshot | null, airQuality: AirQualitySnapshot | null) {
  if (!weather) {
    return { score: null, label: null, drivers: ["weather data unavailable"] };
  }

  let score = 100;
  const drivers: string[] = [];

  if (weather.temperatureC !== null && (weather.temperatureC < 8 || weather.temperatureC > 28)) {
    score -= 20;
    drivers.push("less comfortable temperature");
  }

  if ((weather.rainProbability ?? 0) > 0.5 || (weather.rainMm ?? 0) > 2) {
    score -= 25;
    drivers.push("rain risk");
  }

  if ((weather.windGustKmh ?? weather.windSpeedKmh ?? 0) > 45) {
    score -= 25;
    drivers.push("strong wind gusts");
  }

  if ((airQuality?.aqiValue ?? 0) > 100) {
    score -= 15;
    drivers.push("reduced air quality");
  }

  const boundedScore = Math.max(0, Math.min(100, score));
  const label = boundedScore >= 75 ? "good" : boundedScore >= 50 ? "fair" : "poor";

  return {
    score: boundedScore,
    label,
    drivers: drivers.length > 0 ? drivers : ["comfortable weather window"],
  };
}

function hashState(value: unknown) {
  return createHash("sha256").update(JSON.stringify(value)).digest("hex");
}

function toDate(value: Date | string) {
  return value instanceof Date ? value : new Date(value);
}
