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
    url.searchParams.set("parameter-name", "ta,ff,dd,rr");

    const payload = await fetchJson(url.toString(), {
      fetcher: this.fetcher,
      headers: {
        Authorization: this.apiKey,
      },
    });

    return [payload as Record<string, unknown>];
  }

  // TODO: When connecting to real KNMI data, derive observedAt from the source timestamp field.
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
      const windDegrees = getCoverageNumber(record, "dd");

      return {
        observedAt,
        temperatureC,
        feelsLikeC: temperatureC,
        rainMm: getCoverageNumber(record, "rr"),
        rainProbability: null,
        windSpeedKmh,
        windGustKmh: null,
        windDirection: degreesToCompass(windDegrees),
        weatherCode: null,
        warningLevel: null,
        sourceName: this.sourceName,
      };
    });
  }
}

function getCoverageNumber(record: Record<string, unknown>, key: string) {
  const ranges = record.ranges as Record<string, { values?: unknown[] }> | undefined;
  const directValue = record[key];
  const value = ranges?.[key]?.values?.[0] ?? directValue;

  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function extractCoverageTime(record: Record<string, unknown>) {
  const domain = record.domain as
    | { axes?: { t?: { values?: unknown[] } } }
    | undefined;
  const value = domain?.axes?.t?.values?.[0] ?? record.observedAt ?? record.datetime;

  return typeof value === "string" ? new Date(value) : new Date();
}

function degreesToCompass(value: number | null) {
  if (value === null) {
    return null;
  }

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(value / 22.5) % directions.length;
  return directions[index];
}
