import { SourceAdapter } from "./base";
import { fetchJson } from "./http";
import { getSourceConfig } from "./source-config";
import type { CityConfig, NormalizedAirQualityRecord, SourceAdapterOptions } from "./base";

type PollutantKey = "PM25" | "PM10" | "NO2" | "O3" | "SO2";

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
  private readonly mode: "mock" | "live";
  private readonly fetcher: SourceAdapterOptions["fetcher"];
  private readonly baseUrl: string;

  constructor(options: SourceAdapterOptions = {}) {
    super();
    this.mode = options.mode ?? "mock";
    this.fetcher = options.fetcher;
    this.baseUrl = options.baseUrl ?? "https://api.luchtmeetnet.nl";
  }

  get sourceName() {
    return this.mode === "live" ? "luchtmeetnet" : "mock_luchtmeetnet";
  }

  // TODO: Decide station selection logic.
  // TODO: Decide pollutant mapping and AQI/category method.

  async fetch(city: CityConfig): Promise<Record<string, unknown>[]> {
    if (this.mode === "mock") {
      return [{ ...MOCK_FIXTURE }];
    }

    const config = getSourceConfig(city.slug);
    const url = new URL(`${this.baseUrl}/open_api/stations/${config.luchtmeetnet.stationId}/measurements`);
    url.searchParams.set("page", "1");

    const payload = await fetchJson(url.toString(), { fetcher: this.fetcher });
    const data = (payload as { data?: Record<string, unknown>[] }).data;

    return Array.isArray(data) ? data : [];
  }

  // TODO: When connecting to real Luchtmeetnet data, derive observedAt from the source timestamp field.
  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedAirQualityRecord[]> {
    void _city;

    if (this.mode === "mock") {
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

    const latestTimestamp = rawRecords
      .map((record) => record.timestamp_measured)
      .filter((value): value is string => typeof value === "string")
      .sort()
      .at(-1);

    if (!latestTimestamp) {
      return [];
    }

    const latestRecords = rawRecords.filter(
      (record) => record.timestamp_measured === latestTimestamp,
    );
    const values = new Map<string, number>();

    for (const record of latestRecords) {
      const formula = typeof record.formula === "string" ? record.formula.toUpperCase() : null;
      const value = record.value;

      if (formula && typeof value === "number" && Number.isFinite(value)) {
        values.set(formula, value);
      }
    }

    const pollutants: Record<PollutantKey, number | null> = {
      PM25: values.get("PM25") ?? null,
      PM10: values.get("PM10") ?? null,
      NO2: values.get("NO2") ?? null,
      O3: values.get("O3") ?? null,
      SO2: values.get("SO2") ?? null,
    };
    const mainPollutant = pickMainPollutant(pollutants);
    const aqiValue = mainPollutant ? pollutants[mainPollutant] : null;

    return [
      {
        observedAt: new Date(latestTimestamp),
        aqiValue,
        aqiLabel: labelAirQuality(aqiValue),
        pm25: pollutants.PM25,
        pm10: pollutants.PM10,
        no2: pollutants.NO2,
        o3: pollutants.O3,
        so2: pollutants.SO2,
        mainPollutant,
        trendLabel: "unknown",
        sourceName: this.sourceName,
      },
    ];
  }
}

function pickMainPollutant(pollutants: Record<PollutantKey, number | null>) {
  let selected: PollutantKey | null = null;
  let selectedValue = Number.NEGATIVE_INFINITY;

  for (const [key, value] of Object.entries(pollutants) as Array<[PollutantKey, number | null]>) {
    if (value !== null && value > selectedValue) {
      selected = key;
      selectedValue = value;
    }
  }

  return selected;
}

function labelAirQuality(value: number | null) {
  if (value === null) {
    return "Unknown";
  }

  if (value <= 50) {
    return "Good";
  }

  if (value <= 100) {
    return "Moderate";
  }

  return "Poor";
}
