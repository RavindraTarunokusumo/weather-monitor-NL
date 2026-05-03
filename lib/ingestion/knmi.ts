import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedWeatherRecord } from "./base";

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
  readonly sourceName = "mock_knmi";

  // TODO: Decide exact current observation and forecast datasets.
  // TODO: Decide file/API access pattern.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    void _city;
    return [{ ...MOCK_FIXTURE }];
  }

  // TODO: When connecting to real KNMI data, derive observedAt from the source timestamp field.
  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWeatherRecord[]> {
    void _city;
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
}
