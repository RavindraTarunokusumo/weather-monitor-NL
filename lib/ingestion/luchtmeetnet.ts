import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedAirQualityRecord } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  aqi: 42,
  aqi_label: "Good",
  pm25: 12,
  pm10: 22,
  no2: 18,
  o3: 46,
  so2: 6,
  main_pollutant: "O3",
  trend: "stable",
};

export class LuchtmeetnetAdapter extends SourceAdapter<NormalizedAirQualityRecord> {
  readonly sourceName = "mock_luchtmeetnet";

  // TODO: Decide station selection logic.
  // TODO: Decide pollutant mapping and AQI/category method.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    void _city;
    return [{ ...MOCK_FIXTURE }];
  }

  // TODO: When connecting to real Luchtmeetnet data, derive observedAt from the source timestamp field.
  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedAirQualityRecord[]> {
    void _city;
    return rawRecords.map((r) => ({
      observedAt: new Date(),
      aqiValue: (r.aqi as number) ?? null,
      aqiLabel: (r.aqi_label as string) ?? null,
      pm25: (r.pm25 as number) ?? null,
      pm10: (r.pm10 as number) ?? null,
      no2: (r.no2 as number) ?? null,
      o3: (r.o3 as number) ?? null,
      so2: (r.so2 as number) ?? null,
      mainPollutant: (r.main_pollutant as string) ?? null,
      trendLabel: (r.trend as string) ?? null,
      sourceName: this.sourceName,
    }));
  }
}
