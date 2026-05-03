import { SourceAdapter } from "./base";
import type { CityConfig, NormalizedWaterRecord } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  station_id: "AMS-mock",
  station_name: "Amsterdam mock station",
  water_level_cm: 14,
  trend: "stable",
  risk_label: "normal",
};

export class RijkswaterstaatAdapter extends SourceAdapter<NormalizedWaterRecord> {
  readonly sourceName = "mock_rijkswaterstaat";

  // TODO: Decide nearest station matching logic.
  // TODO: Decide supported measurement type for water-level trend.

  async fetch(_city: CityConfig): Promise<Record<string, unknown>[]> {
    return [{ ...MOCK_FIXTURE }];
  }

  // TODO: When connecting to real Rijkswaterstaat data, derive observedAt from the source timestamp field.
  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWaterRecord[]> {
    return rawRecords.map((r) => ({
      observedAt: new Date(),
      stationId: (r.station_id as string) ?? null,
      stationName: (r.station_name as string) ?? null,
      waterLevelCm: (r.water_level_cm as number) ?? null,
      trendLabel: (r.trend as string) ?? null,
      riskLabel: (r.risk_label as string) ?? null,
      sourceName: this.sourceName,
    }));
  }
}
