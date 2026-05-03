type PublicCity = {
  slug: string;
  name: string;
  timezone: string;
};

type SnapshotDate = Date | string | null;

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
    warningLevel: string | null;
    sourceName: string;
    ingestedAt: SnapshotDate;
  } | null;
  airQualitySnapshot: {
    aqiValue: number | null;
    aqiLabel: string | null;
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

export function buildDashboardResponse(
  city: PublicCity,
  snapshot: DashboardSnapshotForResponse,
) {
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
    },
    water_signal: {
      station_name: snapshot.waterSnapshot?.stationName ?? null,
      water_level_cm: snapshot.waterSnapshot?.waterLevelCm ?? null,
      trend: snapshot.waterSnapshot?.trendLabel ?? null,
      risk_label: snapshot.waterSnapshot?.riskLabel ?? null,
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
  };
}
