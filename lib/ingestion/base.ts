export type CityConfig = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
};

export type NormalizedWeatherRecord = {
  observedAt: Date;
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
  sourcePayload?: Prisma.InputJsonObject;
};

export type NormalizedAirQualityRecord = {
  observedAt: Date;
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
  sourcePayload?: Prisma.InputJsonObject;
};

export type NormalizedWaterRecord = {
  observedAt: Date;
  stationId: string | null;
  stationName: string | null;
  waterLevelCm: number | null;
  trendLabel: string | null;
  riskLabel: string | null;
  sourceName: string;
  sourcePayload?: Prisma.InputJsonObject;
};

export type AdapterMode = "mock" | "live";

export type JsonFetcher = (input: string, init?: RequestInit) => Promise<Response>;

export type SourceAdapterOptions = {
  mode?: AdapterMode;
  fetcher?: JsonFetcher;
  baseUrl?: string;
  apiKey?: string;
  forecastBaseUrl?: string;
  openDataBaseUrl?: string;
};

export abstract class SourceAdapter<T> {
  abstract readonly sourceName: string;
  abstract fetch(city: CityConfig): Promise<Record<string, unknown>[]>;
  abstract normalize(rawRecords: Record<string, unknown>[], city: CityConfig): Promise<T[]>;
}
import type { Prisma } from "@prisma/client";
