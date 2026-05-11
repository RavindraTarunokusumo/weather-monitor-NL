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
  weatherCode: string | null;
  warningLevel: string | null;
  sourcePayload: unknown;
};

type AirQualitySnapshot = Snapshot & {
  aqiValue: number | null;
  aqiLabel: string | null;
  mainPollutant: string | null;
  trendLabel: string | null;
  sourcePayload: unknown;
};

type WaterSnapshot = Snapshot & {
  stationName: string | null;
  waterLevelCm: number | null;
  trendLabel: string | null;
  riskLabel: string | null;
  sourcePayload: unknown;
};

type SourceStatus = {
  source: string;
  status: "fresh" | "stale" | "missing";
  observed_at: string | null;
  detail: string | null;
};

type PreviousDashboardSnapshot = {
  stateHash: string;
  summaryPayload: unknown;
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
  const [weather, enrichedWeather, airQuality, water, enrichedWater] = await Promise.all([
    findPreferredSourceSnapshot<WeatherSnapshot>(prisma.weatherSnapshot, city.id),
    findLatestEnrichedWeatherSnapshot(prisma.weatherSnapshot, city.id),
    findPreferredSourceSnapshot<AirQualitySnapshot>(prisma.airQualitySnapshot, city.id),
    findPreferredSourceSnapshot<WaterSnapshot>(prisma.waterSnapshot, city.id),
    findLatestEnrichedWaterSnapshot(prisma.waterSnapshot, city.id),
  ]);
  const weatherForSummary = mergeWeatherMetadata(weather, enrichedWeather);
  const waterForSummary = mergeWaterMetadata(water, enrichedWater);
  const sourceStatus = {
    weather: buildSourceStatus("weather", weather, now, 2),
    air_quality: buildSourceStatus("air quality", airQuality, now, 6),
    water: buildSourceStatus("water", water, now, 24),
  };
  const comfort = computeCycleComfort(weatherForSummary, airQuality);
  const forecast = extractForecast(weatherForSummary?.sourcePayload);
  const weeklyLevels = extractWeeklyLevels(waterForSummary?.sourcePayload);
  const stateForHash = {
    weatherSnapshotId: weather?.id ?? null,
    airQualitySnapshotId: airQuality?.id ?? null,
    waterSnapshotId: water?.id ?? null,
    comfort,
    sourceStatus,
    forecast,
    weeklyLevels,
  };
  const stateHash = hashState(stateForHash);
  const previousDashboard = (await prisma.dashboardSnapshot.findFirst({
    where: { cityId: city.id },
    orderBy: { generatedAt: "desc" },
  })) as PreviousDashboardSnapshot | null;
  const uiSummary = buildUiSummary({
    weather: weatherForSummary,
    airQuality,
    water: waterForSummary,
    forecast,
    sourceStatus,
    previousDashboard,
    currentStateHash: stateHash,
  });
  const summaryPayload = {
    source_status: sourceStatus,
    current: {
      temperature_c: weather?.temperatureC ?? null,
      rain_mm: weather?.rainMm ?? null,
      rain_probability: weatherForSummary?.rainProbability ?? null,
      wind_speed_kmh: weather?.windSpeedKmh ?? null,
      wind_gust_kmh: weather?.windGustKmh ?? null,
      wind_direction: weather?.windDirection ?? null,
      weather_code: weatherForSummary?.weatherCode ?? null,
      warning_level: weatherForSummary?.warningLevel ?? null,
    },
    ui_summary: uiSummary,
    outlook: forecast,
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
      station: water?.stationName ?? waterForSummary?.stationName ?? null,
      trend: waterForSummary?.trendLabel ?? null,
      risk_label: waterForSummary?.riskLabel ?? null,
      weekly_levels_cm: weeklyLevels,
    },
  };
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
      bestOutdoorWindow: uiSummary.best_window,
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

async function findLatestEnrichedWeatherSnapshot(
  delegate: {
    findMany: (args: {
      where: {
        cityId: string;
        sourceName: { not: { startsWith: string } };
      };
      orderBy: Array<{ observedAt: "desc" } | { ingestedAt: "desc" }>;
      take: number;
    }) => Promise<WeatherSnapshot[]>;
  },
  cityId: string,
) {
  const candidates = await delegate.findMany({
    where: { cityId, sourceName: { not: { startsWith: "mock_" } } },
    orderBy: [{ observedAt: "desc" }, { ingestedAt: "desc" }],
    take: 12,
  });

  return candidates.find(hasWeatherMetadata) ?? null;
}

async function findLatestEnrichedWaterSnapshot(
  delegate: {
    findMany: (args: {
      where: {
        cityId: string;
        sourceName: { not: { startsWith: string } };
      };
      orderBy: Array<{ observedAt: "desc" } | { ingestedAt: "desc" }>;
      take: number;
    }) => Promise<WaterSnapshot[]>;
  },
  cityId: string,
) {
  const candidates = await delegate.findMany({
    where: { cityId, sourceName: { not: { startsWith: "mock_" } } },
    orderBy: [{ observedAt: "desc" }, { ingestedAt: "desc" }],
    take: 12,
  });

  return candidates.find(hasWaterMetadata) ?? null;
}

function hasWeatherMetadata(snapshot: WeatherSnapshot | null) {
  if (!snapshot) {
    return false;
  }

  const forecast = extractForecast(snapshot.sourcePayload);
  return (
    forecast.hourly.length > 0 ||
    forecast.weekly.length > 0 ||
    snapshot.weatherCode !== null ||
    snapshot.warningLevel !== null ||
    snapshot.rainProbability !== null
  );
}

function mergeWeatherMetadata(
  current: WeatherSnapshot | null,
  enriched: WeatherSnapshot | null,
): WeatherSnapshot | null {
  if (!current) {
    return enriched;
  }

  if (!enriched || current.id === enriched.id) {
    return current;
  }

  return {
    ...current,
    rainProbability: current.rainProbability ?? enriched.rainProbability,
    weatherCode: current.weatherCode ?? enriched.weatherCode,
    warningLevel: current.warningLevel ?? enriched.warningLevel,
    sourcePayload: current.sourcePayload ?? enriched.sourcePayload,
  };
}

function hasWaterMetadata(snapshot: WaterSnapshot | null) {
  if (!snapshot) {
    return false;
  }

  return (
    extractWeeklyLevels(snapshot.sourcePayload).length > 0 ||
    (snapshot.trendLabel !== null && snapshot.trendLabel !== "unknown") ||
    (snapshot.riskLabel !== null && snapshot.riskLabel !== "normal")
  );
}

function mergeWaterMetadata(
  current: WaterSnapshot | null,
  enriched: WaterSnapshot | null,
): WaterSnapshot | null {
  if (!current) {
    return enriched;
  }

  if (!enriched || current.id === enriched.id) {
    return current;
  }

  return {
    ...current,
    trendLabel:
      current.trendLabel && current.trendLabel !== "unknown"
        ? current.trendLabel
        : enriched.trendLabel,
    riskLabel: current.riskLabel ?? enriched.riskLabel,
    sourcePayload:
      extractWeeklyLevels(current.sourcePayload).length > 0
        ? current.sourcePayload
        : enriched.sourcePayload,
  };
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

function extractForecast(sourcePayload: unknown) {
  const payload = asRecord(sourcePayload);
  const forecast = asRecord(payload?.forecast);

  return {
    hourly: readRecordArray(forecast, "hourly"),
    weekly: readRecordArray(forecast, "weekly"),
  };
}

function extractWeeklyLevels(sourcePayload: unknown) {
  const payload = asRecord(sourcePayload);
  const value = payload?.weekly_levels_cm;
  return Array.isArray(value) && value.every((item) => typeof item === "number") ? value : [];
}

function buildUiSummary(options: {
  weather: WeatherSnapshot | null;
  airQuality: AirQualitySnapshot | null;
  water: WaterSnapshot | null;
  forecast: { hourly: Record<string, unknown>[]; weekly: Record<string, unknown>[] };
  sourceStatus: Record<string, SourceStatus>;
  previousDashboard: PreviousDashboardSnapshot | null;
  currentStateHash: string;
}) {
  const { weather, airQuality, water, forecast, sourceStatus, previousDashboard, currentStateHash } = options;
  const bestWindow = pickBestWindow(forecast.hourly);
  const changedSummary = buildChangedSummary({
    previousDashboard,
    currentStateHash,
    weather,
    airQuality,
    water,
  });
  const warning = asRecord(asRecord(weather?.sourcePayload)?.warning);
  const warningLevel = weather?.warningLevel ?? readString(warning, "level");
  const warningRegion = readString(warning, "region");
  const mainRisk = pickMainRisk({ warningLevel, weather, airQuality, water });
  const riskDetail =
    warningLevel && warningLevel !== "none" && warningLevel !== "unknown"
      ? `${capitalize(warningLevel)} weather warning is active${warningRegion ? ` for ${warningRegion}` : ""}.`
      : buildNonWarningRiskDetail(weather, airQuality, water);

  return {
    best_window: bestWindow,
    outdoor_window_detail: bestWindow
      ? `Best available 3-hour outdoor window is ${bestWindow}.`
      : sourceStatus.weather.detail ?? "Weather outlook data is unavailable.",
    main_risk: mainRisk,
    risk_detail: riskDetail,
    changed: changedSummary.changed,
    changed_detail: changedSummary.changed_detail,
  };
}

function pickBestWindow(hourly: Record<string, unknown>[]) {
  const firstDay = hourly.slice(0, 24);
  if (firstDay.length < 3) {
    return null;
  }

  const scored = firstDay
    .map((item, index) => {
      const window = firstDay.slice(index, index + 3);
      if (window.length < 3) {
        return null;
      }

      const hour = readString(item, "h");
      const hourNumber = hour ? Number(hour) : null;
      if (hourNumber === null || hourNumber < 7 || hourNumber > 19) {
        return null;
      }

      const score = window.reduce((sum, windowItem) => {
        const rain = readNumber(windowItem, "rain") ?? 0;
        const wind = readNumber(windowItem, "wind") ?? 0;
        const temp = readNumber(windowItem, "temp") ?? 15;
        const tempPenalty = temp < 8 || temp > 28 ? 20 : 0;
        return sum + rain + wind + tempPenalty;
      }, 0);

      return { hour, score };
    })
    .filter((item): item is { hour: string; score: number } => item !== null)
    .sort((a, b) => a.score - b.score);

  if (!scored[0]?.hour) {
    return null;
  }

  const startHour = Number(scored[0].hour);
  const endHour = (startHour + 3).toString().padStart(2, "0");
  return `${scored[0].hour}:00-${endHour}:00`;
}

function buildChangedSummary(options: {
  previousDashboard: PreviousDashboardSnapshot | null;
  currentStateHash: string;
  weather: WeatherSnapshot | null;
  airQuality: AirQualitySnapshot | null;
  water: WaterSnapshot | null;
}) {
  const { previousDashboard, currentStateHash, weather, airQuality, water } = options;
  if (!previousDashboard) {
    return {
      changed: "New live snapshot",
      changed_detail: "Dashboard regenerated from the latest available source snapshots.",
    };
  }

  if (previousDashboard.stateHash === currentStateHash) {
    return {
      changed: "No material change",
      changed_detail: "Source-backed dashboard state matches the previous snapshot.",
    };
  }

  const previousPayload = asRecord(previousDashboard.summaryPayload);
  const previousCurrent = asRecord(previousPayload?.current);
  const previousAir = asRecord(previousPayload?.air_quality);
  const previousWater = asRecord(previousPayload?.water_signal);
  const previousTemperature = readNumber(previousCurrent, "temperature_c");
  if (previousTemperature !== null && weather?.temperatureC !== null && weather?.temperatureC !== undefined) {
    return {
      changed: "Temperature changed",
      changed_detail: `Temperature changed from ${previousTemperature.toFixed(1)}°C to ${weather.temperatureC.toFixed(1)}°C.`,
    };
  }

  const previousRainProbability = readNumber(previousCurrent, "rain_probability");
  if (
    previousRainProbability !== null &&
    weather?.rainProbability !== null &&
    weather?.rainProbability !== undefined &&
    previousRainProbability !== weather.rainProbability
  ) {
    return {
      changed: "Rain chance changed",
      changed_detail: `Rain probability changed from ${Math.round(previousRainProbability * 100)}% to ${Math.round(weather.rainProbability * 100)}%.`,
    };
  }

  const previousAirTrend = readString(previousAir, "trend");
  if (previousAirTrend && airQuality?.trendLabel && previousAirTrend !== airQuality.trendLabel) {
    return {
      changed: "Air quality trend changed",
      changed_detail: `Air quality trend changed from ${previousAirTrend} to ${airQuality.trendLabel}.`,
    };
  }

  const previousWaterTrend = readString(previousWater, "trend");
  if (previousWaterTrend && water?.trendLabel && previousWaterTrend !== water.trendLabel) {
    return {
      changed: "Water trend changed",
      changed_detail: `Water level trend changed from ${previousWaterTrend} to ${water.trendLabel}.`,
    };
  }

  return {
    changed: "Source state changed",
    changed_detail: "Dashboard source snapshots changed since the previous regeneration.",
  };
}

function pickMainRisk(options: {
  warningLevel: string | null;
  weather: WeatherSnapshot | null;
  airQuality: AirQualitySnapshot | null;
  water: WaterSnapshot | null;
}) {
  const warningLevel = options.warningLevel;
  if (warningLevel && warningLevel !== "none" && warningLevel !== "unknown") {
    return `${capitalize(warningLevel)} weather warning`;
  }

  if ((options.weather?.rainProbability ?? 0) >= 0.6 || (options.weather?.rainMm ?? 0) > 2) {
    return "Rain risk";
  }

  if ((options.weather?.windGustKmh ?? 0) >= 45) {
    return "Wind gusts";
  }

  if ((options.airQuality?.aqiValue ?? 0) > 100) {
    return "Reduced air quality";
  }

  if (options.water?.trendLabel && options.water.trendLabel !== "stable" && options.water.trendLabel !== "unknown") {
    return `Water level ${options.water.trendLabel}`;
  }

  return "No known risk";
}

function buildNonWarningRiskDetail(
  weather: WeatherSnapshot | null,
  airQuality: AirQualitySnapshot | null,
  water: WaterSnapshot | null,
) {
  const details = [
    weather?.rainProbability !== null && weather?.rainProbability !== undefined
      ? `Rain probability ${Math.round(weather.rainProbability * 100)}%.`
      : null,
    airQuality?.trendLabel ? `Air quality trend ${airQuality.trendLabel}.` : null,
    water?.trendLabel ? `Water level trend ${water.trendLabel}.` : null,
  ].filter((item): item is string => item !== null);

  return details.length > 0 ? details.join(" ") : "No elevated source-backed risk is available.";
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function readRecordArray(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return Array.isArray(value) && value.every((item) => asRecord(item) !== null)
    ? (value as Record<string, unknown>[])
    : [];
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function readNumber(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function capitalize(value: string) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}
