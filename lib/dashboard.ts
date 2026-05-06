type PublicCity = {
  slug: string;
  name: string;
  timezone: string;
};

type SnapshotDate = Date | string | null;

type JsonRecord = Record<string, unknown>;

type DashboardSnapshotForResponse = {
  generatedAt: Date | string;
  cycleComfortScore: number | null;
  cycleComfortLabel: string | null;
  bestOutdoorWindow: string | null;
  worstOutdoorWindow: string | null;
  summaryPayload: unknown;
  weatherSnapshot: {
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
    ingestedAt: SnapshotDate;
  } | null;
  airQualitySnapshot: {
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
    ingestedAt: SnapshotDate;
  } | null;
  waterSnapshot: {
    stationName: string | null;
    waterLevelCm: number | null;
    trendLabel: string | null;
    riskLabel: string | null;
    sourceName: string;
    ingestedAt: SnapshotDate;
  } | null;
  aiBriefings: Array<{
    briefingText: string;
  }>;
};

function toIsoString(value: SnapshotDate) {
  if (!value) {
    return null;
  }

  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function asRecord(value: unknown): JsonRecord | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  return value as JsonRecord;
}

function readString(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function readNumberArray(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return Array.isArray(value) && value.every((item) => typeof item === "number")
    ? value
    : [];
}

function readRecordArray(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return Array.isArray(value) && value.every((item) => asRecord(item) !== null)
    ? value
    : [];
}

function formatWeatherCode(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const label = value.split("_").join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

export function buildDashboardResponse(
  city: PublicCity,
  snapshot: DashboardSnapshotForResponse,
) {
  const summaryPayload = asRecord(snapshot.summaryPayload);
  const uiSummary = asRecord(summaryPayload?.ui_summary);
  const outlook = asRecord(summaryPayload?.outlook);
  const waterSignalSummary = asRecord(summaryPayload?.water_signal);

  return {
    city: {
      slug: city.slug,
      name: city.name,
      timezone: city.timezone,
    },
    generated_at: toIsoString(snapshot.generatedAt),
    briefing: snapshot.aiBriefings[0]?.briefingText ?? null,
    current: {
      temperature_c: snapshot.weatherSnapshot?.temperatureC ?? null,
      feels_like_c: snapshot.weatherSnapshot?.feelsLikeC ?? null,
      rain_mm: snapshot.weatherSnapshot?.rainMm ?? null,
      rain_probability: snapshot.weatherSnapshot?.rainProbability ?? null,
      wind_speed_kmh: snapshot.weatherSnapshot?.windSpeedKmh ?? null,
      wind_gust_kmh: snapshot.weatherSnapshot?.windGustKmh ?? null,
      wind_direction: snapshot.weatherSnapshot?.windDirection ?? null,
      condition_label: formatWeatherCode(snapshot.weatherSnapshot?.weatherCode),
      warning_level: snapshot.weatherSnapshot?.warningLevel ?? null,
    },
    cycle_comfort: {
      score: snapshot.cycleComfortScore,
      label: snapshot.cycleComfortLabel,
      best_outdoor_window: snapshot.bestOutdoorWindow,
      worst_outdoor_window: snapshot.worstOutdoorWindow,
    },
    air_quality: {
      aqi_value: snapshot.airQualitySnapshot?.aqiValue ?? null,
      label: snapshot.airQualitySnapshot?.aqiLabel ?? null,
      main_pollutant: snapshot.airQualitySnapshot?.mainPollutant ?? null,
      trend: snapshot.airQualitySnapshot?.trendLabel ?? null,
      pollutants: {
        pm25: snapshot.airQualitySnapshot?.pm25 ?? null,
        pm10: snapshot.airQualitySnapshot?.pm10 ?? null,
        no2: snapshot.airQualitySnapshot?.no2 ?? null,
        o3: snapshot.airQualitySnapshot?.o3 ?? null,
        so2: snapshot.airQualitySnapshot?.so2 ?? null,
      },
    },
    water_signal: {
      station_name: snapshot.waterSnapshot?.stationName ?? null,
      water_level_cm: snapshot.waterSnapshot?.waterLevelCm ?? null,
      trend: snapshot.waterSnapshot?.trendLabel ?? null,
      risk_label: snapshot.waterSnapshot?.riskLabel ?? null,
      weekly_levels_cm: snapshot.waterSnapshot
        ? readNumberArray(waterSignalSummary, "weekly_levels_cm")
        : [],
    },
    source_freshness: [
      {
        source: snapshot.weatherSnapshot?.sourceName ?? "weather",
        updated_at: toIsoString(snapshot.weatherSnapshot?.ingestedAt ?? null),
      },
      {
        source: snapshot.airQualitySnapshot?.sourceName ?? "air_quality",
        updated_at: toIsoString(snapshot.airQualitySnapshot?.ingestedAt ?? null),
      },
      {
        source: snapshot.waterSnapshot?.sourceName ?? "water",
        updated_at: toIsoString(snapshot.waterSnapshot?.ingestedAt ?? null),
      },
    ],
    summary_payload: snapshot.summaryPayload,
    ui_summary: {
      best_window: readString(uiSummary, "best_window"),
      main_risk: readString(uiSummary, "main_risk"),
      changed: readString(uiSummary, "changed"),
      outdoor_window_detail: readString(uiSummary, "outdoor_window_detail"),
      risk_detail: readString(uiSummary, "risk_detail"),
      changed_detail: readString(uiSummary, "changed_detail"),
    },
    outlook: {
      hourly: snapshot.weatherSnapshot ? readRecordArray(outlook, "hourly") : [],
      weekly: snapshot.weatherSnapshot ? readRecordArray(outlook, "weekly") : [],
    },
  };
}
