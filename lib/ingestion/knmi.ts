import { SourceAdapter } from "./base";
import { fetchJson } from "./http";
import { getSourceConfig } from "./source-config";
import type { CityConfig, NormalizedWeatherRecord, SourceAdapterOptions } from "./base";

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
  private readonly mode: "mock" | "live";
  private readonly fetcher: SourceAdapterOptions["fetcher"];
  private readonly baseUrl: string;
  private readonly apiKey?: string;

  constructor(options: SourceAdapterOptions = {}) {
    super();
    this.mode = options.mode ?? "mock";
    this.fetcher = options.fetcher;
    this.baseUrl =
      options.baseUrl ??
      "https://api.dataplatform.knmi.nl/edr/v1";
    this.apiKey = options.apiKey ?? process.env.KNMI_API_KEY;
  }

  get sourceName() {
    return this.mode === "live" ? "knmi" : "mock_knmi";
  }

  // TODO: Decide exact current observation and forecast datasets.
  // TODO: Decide file/API access pattern.

  async fetch(city: CityConfig): Promise<Record<string, unknown>[]> {
    if (this.mode === "mock") {
      return [{ ...MOCK_FIXTURE }];
    }

    if (!this.apiKey) {
      throw new Error("KNMI_API_KEY is required for live KNMI ingestion");
    }

    const config = getSourceConfig(city.slug);
    const url = new URL(
      `${this.baseUrl}/collections/10-minute-in-situ-meteorological-observations/locations/${config.knmi.stationId}`,
    );
    const { start, end } = buildRecentObservationWindow();
    url.searchParams.set("datetime", `${start.toISOString()}/${end.toISOString()}`);
    url.searchParams.set("parameter-name", "ta,ff,dd,fx,R1H");

    const payload = await fetchJson(url.toString(), {
      fetcher: this.fetcher,
      headers: {
        Authorization: this.apiKey,
      },
    });
    const coverages = (payload as { coverages?: unknown }).coverages;

    return Array.isArray(coverages)
      ? coverages.filter(isRecord)
      : [payload].filter(isRecord);
  }

  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWeatherRecord[]> {
    void _city;

    if (this.mode === "mock") {
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

    return rawRecords.map((record) => {
      const observedAt = extractCoverageTime(record);
      const temperatureC = getCoverageNumber(record, "ta");
      const windMs = getCoverageNumber(record, "ff");
      const windSpeedKmh = windMs === null ? null : Math.round(windMs * 36) / 10;
      const windGustMs = getCoverageNumber(record, "fx");
      const windGustKmh = windGustMs === null ? null : Math.round(windGustMs * 36) / 10;
      const windDegrees = getCoverageNumber(record, "dd");

      return {
        observedAt,
        temperatureC,
        feelsLikeC: temperatureC,
        rainMm: getCoverageNumber(record, "R1H"),
        rainProbability: null,
        windSpeedKmh,
        windGustKmh,
        windDirection: degreesToCompass(windDegrees),
        weatherCode: null,
        warningLevel: null,
        sourceName: this.sourceName,
      };
    });
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function buildRecentObservationWindow() {
  const now = new Date();
  const end = new Date(Math.floor(now.getTime() / 600_000) * 600_000 - 20 * 60_000);
  const start = new Date(end.getTime() - 2 * 60 * 60_000);

  return { start, end };
}

function getCoverageNumber(record: Record<string, unknown>, key: string) {
  const ranges = record.ranges as Record<string, { values?: unknown[] }> | undefined;
  const directValue = record[key];
  const rangeValues = ranges?.[key]?.values;
  const value = Array.isArray(rangeValues) ? findLatestFiniteNumber(rangeValues) : directValue;

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractCoverageTime(record: Record<string, unknown>) {
  const domain = record.domain as
    | { axes?: { t?: { values?: unknown[] } } }
    | undefined;
  const values = domain?.axes?.t?.values;
  const value = Array.isArray(values)
    ? values.filter((item): item is string => typeof item === "string").at(-1)
    : record.observedAt ?? record.datetime;

  return typeof value === "string" ? new Date(value) : new Date();
}

function findLatestFiniteNumber(values: unknown[]) {
  for (let index = values.length - 1; index >= 0; index -= 1) {
    const value = values[index];
    if (typeof value === "number" && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function degreesToCompass(value: number | null) {
  if (value === null) {
    return null;
  }

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(value / 22.5) % directions.length;
  return directions[index];
}
