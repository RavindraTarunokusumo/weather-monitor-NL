import type { Prisma } from "@prisma/client";
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
  private readonly forecastBaseUrl: string;
  private readonly openDataBaseUrl: string;
  private readonly apiKey?: string;

  constructor(options: SourceAdapterOptions = {}) {
    super();
    this.mode = options.mode ?? "mock";
    this.fetcher = options.fetcher;
    this.baseUrl =
      options.baseUrl ??
      "https://api.dataplatform.knmi.nl/edr/v1";
    this.forecastBaseUrl =
      options.forecastBaseUrl ?? process.env.OPEN_METEO_API_BASE_URL ?? "https://api.open-meteo.com/v1/forecast";
    this.openDataBaseUrl =
      options.openDataBaseUrl ?? process.env.KNMI_OPEN_DATA_API_BASE_URL ?? "https://api.dataplatform.knmi.nl/open-data/v1";
    this.apiKey = options.apiKey ?? process.env.KNMI_API_KEY;
  }

  get sourceName() {
    return this.mode === "live" ? "knmi" : "mock_knmi";
  }

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

    const records = Array.isArray(coverages)
      ? coverages.filter(isRecord)
      : [payload].filter(isRecord);
    const [forecastResult, warningResult] = await Promise.allSettled([
      this.fetchForecast(city),
      this.fetchWarning(city),
    ]);
    const forecast = forecastResult.status === "fulfilled" ? forecastResult.value : null;
    const warning =
      warningResult.status === "fulfilled"
        ? warningResult.value
        : { level: "unknown", region: warningRegionForCity(city.slug), source: "knmi" };

    return records.map((record) => ({
      ...record,
      __forecast: forecast,
      __warning: warning,
    }));
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
      const forecast = isRecord(record.__forecast) ? record.__forecast : null;
      const warning = isRecord(record.__warning) ? record.__warning : null;
      const hourly = Array.isArray(forecast?.hourly) ? forecast.hourly : [];
      const firstForecast = hourly.find(isRecord) ?? null;
      const rainPercent = readNumber(firstForecast, "rain");
      const weatherCode = readString(firstForecast, "weather_code") ?? null;
      const warningLevel = readString(warning, "level") ?? "unknown";

      return {
        observedAt,
        temperatureC,
        feelsLikeC: temperatureC,
        rainMm: getCoverageNumber(record, "R1H"),
        rainProbability: rainPercent === null ? null : Math.round((rainPercent / 100) * 100) / 100,
        windSpeedKmh,
        windGustKmh,
        windDirection: degreesToCompass(windDegrees),
        weatherCode,
        warningLevel,
        sourceName: this.sourceName,
        sourcePayload: {
          forecast,
          warning,
        } as Prisma.InputJsonObject,
      };
    });
  }

  private async fetchForecast(city: CityConfig) {
    const buildUrl = (model: string | null) => {
      const url = new URL(this.forecastBaseUrl);
      url.searchParams.set("latitude", String(city.latitude));
      url.searchParams.set("longitude", String(city.longitude));
      url.searchParams.set("timezone", "Europe/Amsterdam");
      url.searchParams.set("forecast_days", "7");
      url.searchParams.set("forecast_hours", "60");
      url.searchParams.set(
        "hourly",
        "temperature_2m,precipitation_probability,weather_code,wind_speed_10m,wind_gusts_10m",
      );
      url.searchParams.set(
        "daily",
        "weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max,wind_gusts_10m_max",
      );
      if (model) {
        url.searchParams.set("models", model);
      }
      return url;
    };

    try {
      return normalizeOpenMeteoForecast(
        await fetchJson(buildUrl("knmi_seamless").toString(), { fetcher: this.fetcher }),
      );
    } catch {
      return normalizeOpenMeteoForecast(
        await fetchJson(buildUrl(null).toString(), { fetcher: this.fetcher }),
      );
    }
  }

  private async fetchWarning(city: CityConfig) {
    const listUrl = new URL(
      `${this.openDataBaseUrl}/datasets/waarschuwingen_nederland_48h/versions/1.0/files`,
    );
    listUrl.searchParams.set("sorting", "desc");
    listUrl.searchParams.set("orderBy", "lastModified");
    listUrl.searchParams.set("maxKeys", "1");
    const listPayload = await fetchJson(listUrl.toString(), {
      fetcher: this.fetcher,
      headers: { Authorization: this.apiKey ?? "" },
    });
    const fileName = extractWarningFilename(listPayload);

    if (!fileName) {
      return { level: "none", region: warningRegionForCity(city.slug), source: "knmi" };
    }

    const urlPayload = await fetchJson(
      `${this.openDataBaseUrl}/datasets/waarschuwingen_nederland_48h/versions/1.0/files/${encodeURIComponent(fileName)}/url`,
      {
        fetcher: this.fetcher,
        headers: { Authorization: this.apiKey ?? "" },
      },
    );
    const temporaryDownloadUrl =
      readString(isRecord(urlPayload) ? urlPayload : null, "temporaryDownloadUrl") ??
      readString(isRecord(urlPayload) ? urlPayload : null, "url");

    if (!temporaryDownloadUrl) {
      return { level: "unknown", region: warningRegionForCity(city.slug), source: "knmi" };
    }

    const warningPayload = await fetchJson(temporaryDownloadUrl, { fetcher: this.fetcher });
    return normalizeWarningPayload(warningPayload, city.slug);
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

function normalizeOpenMeteoForecast(payload: unknown) {
  const record = isRecord(payload) ? payload : {};
  const hourlyRecord = isRecord(record.hourly) ? record.hourly : {};
  const dailyRecord = isRecord(record.daily) ? record.daily : {};
  const hourlyTimes = readArray(hourlyRecord, "time").filter((value): value is string => typeof value === "string");
  const dailyTimes = readArray(dailyRecord, "time").filter((value): value is string => typeof value === "string");
  const hourly = hourlyTimes.slice(0, 60).map((time, index) => {
    const weatherCode = wmoToWeatherCode(readNumberAt(hourlyRecord, "weather_code", index));
    return {
      h: time.length >= 13 ? time.slice(11, 13) : time,
      rain: readNumberAt(hourlyRecord, "precipitation_probability", index),
      wind: readNumberAt(hourlyRecord, "wind_speed_10m", index),
      temp: readNumberAt(hourlyRecord, "temperature_2m", index),
      weather_code: weatherCode,
    };
  });
  const weekly = dailyTimes.map((time, index) => ({
    day: weekdayLabel(time),
    hi: readNumberAt(dailyRecord, "temperature_2m_max", index),
    lo: readNumberAt(dailyRecord, "temperature_2m_min", index),
    rain: readNumberAt(dailyRecord, "precipitation_probability_max", index),
  }));

  return {
    provider: "open-meteo",
    hourly,
    weekly,
  };
}

function extractWarningFilename(payload: unknown) {
  if (!isRecord(payload)) {
    return null;
  }

  const files = Array.isArray(payload.files) ? payload.files : [];
  const first = files.find(isRecord);
  return readString(first ?? null, "filename") ?? readString(first ?? null, "name");
}

function normalizeWarningPayload(payload: unknown, citySlug: string) {
  const region = warningRegionForCity(citySlug);
  const warnings = collectRecords(payload);
  const match = warnings.find((warning) => {
    const candidate =
      readString(warning, "region") ??
      readString(warning, "province") ??
      readString(warning, "provincie") ??
      readString(warning, "name") ??
      readString(warning, "gebied");
    return candidate?.toLowerCase() === region.toLowerCase();
  });
  const level = normalizeWarningLevel(
    readString(match ?? null, "level") ??
      readString(match ?? null, "color") ??
      readString(match ?? null, "kleur") ??
      readString(match ?? null, "code"),
  );

  return {
    level: level ?? "none",
    region,
    source: "knmi",
  };
}

function collectRecords(value: unknown): Record<string, unknown>[] {
  if (Array.isArray(value)) {
    return value.flatMap(collectRecords);
  }

  if (!isRecord(value)) {
    return [];
  }

  const nested = Object.values(value).flatMap(collectRecords);
  return [value, ...nested];
}

function normalizeWarningLevel(value: string | null) {
  const normalized = value?.toLowerCase();
  if (!normalized) {
    return null;
  }

  if (normalized.includes("red") || normalized.includes("rood")) {
    return "red";
  }
  if (normalized.includes("orange") || normalized.includes("oranje")) {
    return "orange";
  }
  if (normalized.includes("yellow") || normalized.includes("geel")) {
    return "yellow";
  }
  if (normalized.includes("none") || normalized.includes("green") || normalized.includes("groen")) {
    return "none";
  }

  return "unknown";
}

function warningRegionForCity(citySlug: string) {
  if (citySlug === "amsterdam") {
    return "Noord-Holland";
  }
  if (citySlug === "rotterdam") {
    return "Zuid-Holland";
  }
  return "Utrecht";
}

function readArray(record: Record<string, unknown>, key: string) {
  const value = record[key];
  return Array.isArray(value) ? value : [];
}

function readNumberAt(record: Record<string, unknown>, key: string, index: number) {
  const value = readArray(record, key)[index];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readNumber(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function readString(record: Record<string, unknown> | null, key: string) {
  const value = record?.[key];
  return typeof value === "string" ? value : null;
}

function weekdayLabel(value: string) {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const date = new Date(`${value.slice(0, 10)}T00:00:00`);
  return days[date.getDay()] ?? value;
}

function wmoToWeatherCode(value: number | null) {
  if (value === null) {
    return null;
  }

  if (value === 0) {
    return "clear";
  }
  if (value <= 2) {
    return "partly_cloudy";
  }
  if (value === 3) {
    return "overcast";
  }
  if (value >= 51 && value <= 67) {
    return "light_rain";
  }
  if (value >= 71 && value <= 77) {
    return "snow";
  }
  if (value >= 80 && value <= 82) {
    return "showers";
  }
  if (value >= 95) {
    return "thunderstorm";
  }

  return "unknown";
}

function degreesToCompass(value: number | null) {
  if (value === null) {
    return null;
  }

  const directions = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  const index = Math.round(value / 22.5) % directions.length;
  return directions[index];
}
