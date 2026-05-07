import { SourceAdapter } from "./base";
import { fetchJson } from "./http";
import { getSourceConfig } from "./source-config";
import type { CityConfig, NormalizedWaterRecord, SourceAdapterOptions } from "./base";

const MOCK_FIXTURE: Record<string, unknown> = {
  station_id: "AMS-mock",
  station_name: "Amsterdam mock station",
  water_level_cm: 14,
  trend: "stable",
  risk_label: "normal",
};

export class RijkswaterstaatAdapter extends SourceAdapter<NormalizedWaterRecord> {
  private readonly mode: "mock" | "live";
  private readonly fetcher: SourceAdapterOptions["fetcher"];
  private readonly baseUrl: string;

  constructor(options: SourceAdapterOptions = {}) {
    super();
    this.mode = options.mode ?? "mock";
    this.fetcher = options.fetcher;
    this.baseUrl =
      options.baseUrl ?? "https://ddapi20-waterwebservices.rijkswaterstaat.nl";
  }

  get sourceName() {
    return this.mode === "live" ? "rijkswaterstaat" : "mock_rijkswaterstaat";
  }

  // TODO: Decide nearest station matching logic.
  // TODO: Decide supported measurement type for water-level trend.

  async fetch(city: CityConfig): Promise<Record<string, unknown>[]> {
    if (this.mode === "mock") {
      return [{ ...MOCK_FIXTURE }];
    }

    const config = getSourceConfig(city.slug);
    const end = new Date();
    const start = new Date(end.getTime() - 6 * 60 * 60_000);
    const payload = await fetchJson(
      `${this.baseUrl}/ONLINEWAARNEMINGENSERVICES/OphalenWaarnemingen`,
      {
        method: "POST",
        fetcher: this.fetcher,
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          Locatie: { Code: config.rijkswaterstaat.locationCode },
          AquoPlusWaarnemingMetadata: {
            AquoMetadata: {
              Compartiment: { Code: "OW" },
              Grootheid: { Code: config.rijkswaterstaat.measurementCode },
            },
          },
          Periode: {
            Begindatumtijd: start.toISOString(),
            Einddatumtijd: end.toISOString(),
          },
        }),
      },
    );

    const data = (payload as { WaarnemingenLijst?: Record<string, unknown>[] })
      .WaarnemingenLijst;

    return Array.isArray(data) ? data : [];
  }

  // TODO: When connecting to real Rijkswaterstaat data, derive observedAt from the source timestamp field.
  async normalize(
    rawRecords: Record<string, unknown>[],
    _city: CityConfig,
  ): Promise<NormalizedWaterRecord[]> {
    void _city;

    if (this.mode === "mock") {
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

    return rawRecords.flatMap((record) => {
      const location = record.Locatie as
        | { Code?: unknown; Naam?: unknown; Omschrijving?: unknown }
        | undefined;
      const measurements = record.MetingenLijst;

      if (!Array.isArray(measurements) || measurements.length === 0) {
        return [];
      }

      const latest = measurements
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .sort((a, b) => String(a.Tijdstip ?? "").localeCompare(String(b.Tijdstip ?? "")))
        .at(-1);

      if (!latest) {
        return [];
      }

      const measurement = latest.Meetwaarde as
        | { Waarde_Numeriek?: unknown; NumeriekeWaarde?: unknown }
        | undefined;
      const value = measurement?.Waarde_Numeriek ?? measurement?.NumeriekeWaarde;

      return [
        {
          observedAt: typeof latest.Tijdstip === "string" ? new Date(latest.Tijdstip) : new Date(),
          stationId: typeof location?.Code === "string" ? location.Code : null,
          stationName:
            typeof location?.Naam === "string"
              ? location.Naam
              : typeof location?.Omschrijving === "string"
                ? location.Omschrijving
                : null,
          waterLevelCm: typeof value === "number" && Number.isFinite(value) ? value : null,
          trendLabel: "unknown",
          riskLabel: "normal",
          sourceName: this.sourceName,
        },
      ];
    });
  }
}
