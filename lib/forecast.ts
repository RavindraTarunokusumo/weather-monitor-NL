import type {
  ForecastCity,
  ForecastDay,
  ForecastFreshnessEntry,
  ForecastHour,
  ForecastResponse,
  ForecastRiskEvent,
  ForecastSourceLink,
} from "@/lib/types/forecast";

type SnapshotDate = Date | string | null;
type JsonRecord = Record<string, unknown>;

type ForecastSnapshotForResponse = {
  generatedAt: Date | string;
  bestOutdoorWindow: string | null;
  worstOutdoorWindow: string | null;
  summaryPayload: unknown;
  weatherSnapshot: {
    observedAt: SnapshotDate;
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

type SourceStatus = {
  status?: unknown;
  observed_at?: unknown;
  detail?: unknown;
};

function toIsoString(value: SnapshotDate) {
  if (!value) {
    return null;
  }

  if (value instanceof Date) {
    return value.toISOString();
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
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

function readNumber(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readRecordArray(record: JsonRecord | null, key: string) {
  const value = record?.[key];
  return Array.isArray(value) ? value.map(asRecord).filter((item) => item !== null) : [];
}

function formatWeatherCode(value: string | null | undefined) {
  if (!value) {
    return null;
  }

  const label = value.split("_").join(" ");
  return label.charAt(0).toUpperCase() + label.slice(1);
}

function getSourceStatus(summaryPayload: unknown, key: string): SourceStatus | null {
  const summary = asRecord(summaryPayload);
  const sourceStatus = asRecord(summary?.source_status);
  const status = asRecord(sourceStatus?.[key]);
  return status;
}

function buildSourceFreshnessItem(options: {
  key: "weather" | "air_quality" | "water";
  fallbackSource: string;
  snapshot: { sourceName: string; observedAt: SnapshotDate; ingestedAt: SnapshotDate } | null;
  summaryPayload: unknown;
}): ForecastFreshnessEntry {
  const summaryStatus = getSourceStatus(options.summaryPayload, options.key);

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
    observed_at:
      typeof summaryStatus?.observed_at === "string"
        ? summaryStatus.observed_at
        : toIsoString(options.snapshot.observedAt),
    status: typeof summaryStatus?.status === "string" ? summaryStatus.status : "fresh",
    detail: typeof summaryStatus?.detail === "string" ? summaryStatus.detail : null,
  };
}

function buildWarningFreshness(
  weatherSnapshot: ForecastSnapshotForResponse["weatherSnapshot"],
  warningLevel: string,
): ForecastFreshnessEntry {
  if (!weatherSnapshot || warningLevel === "unknown") {
    return {
      source: "knmi_warnings",
      updated_at: null,
      observed_at: null,
      status: "missing",
      detail: "No KNMI warning state is available for this city.",
    };
  }

  return {
    source: "knmi_warnings",
    updated_at: toIsoString(weatherSnapshot.ingestedAt),
    observed_at: toIsoString(weatherSnapshot.observedAt),
    status: "fresh",
    detail: null,
  };
}

function buildForecastFreshness(
  weatherSnapshot: ForecastSnapshotForResponse["weatherSnapshot"],
  hourly: ForecastHour[],
): ForecastFreshnessEntry {
  if (!weatherSnapshot || hourly.length === 0) {
    return {
      source: "open_meteo",
      updated_at: null,
      observed_at: null,
      status: "missing",
      detail: "No Open-Meteo forecast outlook is available for this city.",
    };
  }

  return {
    source: "open_meteo",
    updated_at: toIsoString(weatherSnapshot.ingestedAt),
    observed_at: toIsoString(weatherSnapshot.observedAt),
    status: "fresh",
    detail: null,
  };
}

function hourRiskLabel(hour: ForecastHour) {
  if ((hour.precipitation_probability ?? 0) >= 70) {
    return "Rain risk";
  }

  if (Math.max(hour.wind_gust_kmh ?? 0, hour.wind_speed_kmh ?? 0) >= 35) {
    return "Wind watch";
  }

  return null;
}

function dayRiskLabel(day: ForecastDay) {
  if ((day.precipitation_probability_max ?? 0) >= 70) {
    return "Rain risk";
  }

  if (Math.max(day.wind_gust_max_kmh ?? 0, day.wind_speed_max_kmh ?? 0) >= 35) {
    return "Wind watch";
  }

  return null;
}

function buildForecastHour(row: JsonRecord): ForecastHour {
  const weatherCode = readString(row, "weather_code");
  const label = readString(row, "label") ?? readString(row, "h") ?? "";
  const hour = {
    starts_at: readString(row, "starts_at") ?? label,
    label,
    condition_label: formatWeatherCode(weatherCode),
    weather_code: weatherCode,
    temperature_c: readNumber(row, "temperature_c") ?? readNumber(row, "temp"),
    apparent_temperature_c:
      readNumber(row, "apparent_temperature_c") ?? readNumber(row, "apparent_temperature"),
    precipitation_mm: readNumber(row, "precipitation_mm"),
    precipitation_probability: readNumber(row, "precipitation_probability") ?? readNumber(row, "rain"),
    wind_speed_kmh: readNumber(row, "wind_speed_kmh") ?? readNumber(row, "wind"),
    wind_gust_kmh: readNumber(row, "wind_gust_kmh") ?? readNumber(row, "gust"),
    risk_label: null,
  };

  return {
    ...hour,
    risk_label: hourRiskLabel(hour),
  };
}

function buildForecastDay(row: JsonRecord): ForecastDay {
  const weatherCode = readString(row, "weather_code");
  const label = readString(row, "label") ?? readString(row, "day") ?? "";
  const day = {
    date: readString(row, "date") ?? label,
    label,
    condition_label: formatWeatherCode(weatherCode),
    weather_code: weatherCode,
    temperature_max_c: readNumber(row, "temperature_max_c") ?? readNumber(row, "hi"),
    temperature_min_c: readNumber(row, "temperature_min_c") ?? readNumber(row, "lo"),
    apparent_temperature_max_c:
      readNumber(row, "apparent_temperature_max_c") ?? readNumber(row, "apparent_temperature_max"),
    apparent_temperature_min_c:
      readNumber(row, "apparent_temperature_min_c") ?? readNumber(row, "apparent_temperature_min"),
    precipitation_sum_mm: readNumber(row, "precipitation_sum_mm"),
    precipitation_probability_max:
      readNumber(row, "precipitation_probability_max") ?? readNumber(row, "rain"),
    wind_speed_max_kmh: readNumber(row, "wind_speed_max_kmh") ?? readNumber(row, "wind"),
    wind_gust_max_kmh: readNumber(row, "wind_gust_max_kmh") ?? readNumber(row, "gust"),
    risk_label: null,
  };

  return {
    ...day,
    risk_label: dayRiskLabel(day),
  };
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
      source: "project",
    },
  ];
}

export function buildRiskTimeline(options: {
  generatedAt: string;
  warningLevel: string;
  hourly: ForecastHour[];
  sourceFreshness: ForecastFreshnessEntry[];
}): ForecastRiskEvent[] {
  if (options.hourly.length === 0) {
    return [
      {
        starts_at: options.generatedAt,
        ends_at: null,
        severity: "watch",
        category: "data",
        title: "Forecast data unavailable",
        detail: "No hourly forecast outlook is available for this city.",
      },
    ];
  }

  const events: ForecastRiskEvent[] = [];

  if (["yellow", "orange", "red"].includes(options.warningLevel)) {
    events.push({
      starts_at: options.generatedAt,
      ends_at: null,
      severity: options.warningLevel === "red" ? "severe" : "warning",
      category: "warning",
      title: "KNMI warning active",
      detail: `Current KNMI warning level is ${options.warningLevel}.`,
    });
  }

  const rainyHour = options.hourly.find((hour) => (hour.precipitation_probability ?? 0) >= 70);
  if (rainyHour) {
    events.push({
      starts_at: rainyHour.starts_at,
      ends_at: null,
      severity: "warning",
      category: "rain",
      title: "Heavy shower risk",
      detail: `Precipitation probability reaches ${rainyHour.precipitation_probability}%.`,
    });
  }

  const windyHour = options.hourly.find(
    (hour) => Math.max(hour.wind_gust_kmh ?? 0, hour.wind_speed_kmh ?? 0) >= 35,
  );
  if (windyHour) {
    const windValue = Math.max(windyHour.wind_gust_kmh ?? 0, windyHour.wind_speed_kmh ?? 0);
    events.push({
      starts_at: windyHour.starts_at,
      ends_at: null,
      severity: "watch",
      category: "wind",
      title: "Wind watch",
      detail: `Wind reaches ${windValue} km/h.`,
    });
  }

  const staleSource = options.sourceFreshness.find((entry) => entry.status !== "fresh");
  if (staleSource) {
    events.push({
      starts_at: options.generatedAt,
      ends_at: null,
      severity: "watch",
      category: "data",
      title: "Source freshness needs attention",
      detail: staleSource.detail ?? `${staleSource.source} status is ${staleSource.status}.`,
    });
  }

  if (events.length === 0) {
    events.push({
      starts_at: options.generatedAt,
      ends_at: null,
      severity: "info",
      category: "comfort",
      title: "No major forecast risks",
      detail: "No deterministic rain, wind, warning, or source freshness risk was detected.",
    });
  }

  return events;
}

export function buildForecastResponse(
  city: ForecastCity,
  snapshot: ForecastSnapshotForResponse,
): ForecastResponse {
  const summaryPayload = asRecord(snapshot.summaryPayload);
  const uiSummary = asRecord(summaryPayload?.ui_summary);
  const currentSummary = asRecord(summaryPayload?.current);
  const outlook = asRecord(summaryPayload?.outlook);
  const hourly = readRecordArray(outlook, "hourly").map(buildForecastHour);
  const daily = readRecordArray(outlook, "weekly").map(buildForecastDay);
  const weatherCode =
    snapshot.weatherSnapshot?.weatherCode ?? readString(currentSummary, "weather_code");
  const warningLevel =
    snapshot.weatherSnapshot?.warningLevel ?? readString(currentSummary, "warning_level") ?? "unknown";
  const generatedAt = toIsoString(snapshot.generatedAt) ?? "";
  const sourceFreshness = [
    buildSourceFreshnessItem({
      key: "weather",
      fallbackSource: "weather",
      snapshot: snapshot.weatherSnapshot,
      summaryPayload: snapshot.summaryPayload,
    }),
    buildSourceFreshnessItem({
      key: "air_quality",
      fallbackSource: "air_quality",
      snapshot: snapshot.airQualitySnapshot,
      summaryPayload: snapshot.summaryPayload,
    }),
    buildSourceFreshnessItem({
      key: "water",
      fallbackSource: "water",
      snapshot: snapshot.waterSnapshot,
      summaryPayload: snapshot.summaryPayload,
    }),
    buildWarningFreshness(snapshot.weatherSnapshot, warningLevel),
    buildForecastFreshness(snapshot.weatherSnapshot, hourly),
  ];

  return {
    city: {
      slug: city.slug,
      name: city.name,
      timezone: city.timezone,
    },
    generated_at: generatedAt,
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
    risk_timeline: buildRiskTimeline({
      generatedAt,
      warningLevel,
      hourly,
      sourceFreshness,
    }),
    source_freshness: sourceFreshness,
    links: forecastSourceLinks(),
  };
}
