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
    const start = new Date(end.getTime() - 7 * 24 * 60 * 60_000);
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
              ProcesType: "meting",
            },
            WaarnemingMetadata: {
              KwaliteitswaardecodeLijst: ["00", "10", "20", "25", "30", "40"],
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

      const normalizedMeasurements = measurements
        .filter((item): item is Record<string, unknown> => typeof item === "object" && item !== null)
        .map((item) => ({
          timestamp: typeof item.Tijdstip === "string" ? item.Tijdstip : null,
          value: extractMeasurementValue(item),
        }))
        .filter((item): item is { timestamp: string; value: number } => item.timestamp !== null && item.value !== null)
        .sort((a, b) => a.timestamp.localeCompare(b.timestamp));
      const latest = normalizedMeasurements.at(-1);

      if (!latest) {
        return [];
      }

      return [
        {
          observedAt: new Date(latest.timestamp),
          stationId: typeof location?.Code === "string" ? location.Code : null,
          stationName:
            typeof location?.Naam === "string"
              ? location.Naam
              : typeof location?.Omschrijving === "string"
                ? location.Omschrijving
                : null,
          waterLevelCm: latest.value,
          trendLabel: deriveWaterTrend(normalizedMeasurements),
          riskLabel: "normal",
          sourceName: this.sourceName,
          sourcePayload: {
            weekly_levels_cm: buildWeeklyLevels(normalizedMeasurements),
          },
        },
      ];
    });
  }
}

function extractMeasurementValue(item: Record<string, unknown>) {
  const measurement = item.Meetwaarde as
    | { Waarde_Numeriek?: unknown; NumeriekeWaarde?: unknown }
    | undefined;
  const value = measurement?.Waarde_Numeriek ?? measurement?.NumeriekeWaarde;

  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

function deriveWaterTrend(measurements: Array<{ timestamp: string; value: number }>) {
  const latest = measurements.at(-1);
  if (!latest) {
    return "unknown";
  }

  const latestTime = new Date(latest.timestamp).getTime();
  const target = latestTime - 6 * 3_600_000;
  const candidates = measurements.filter((item) => {
    const timestamp = new Date(item.timestamp).getTime();
    return timestamp < latestTime && latestTime - timestamp <= 24 * 3_600_000;
  });

  if (candidates.length === 0) {
    return "unknown";
  }

  const reference = candidates.reduce((best, candidate) => {
    const bestDistance = Math.abs(new Date(best.timestamp).getTime() - target);
    const candidateDistance = Math.abs(new Date(candidate.timestamp).getTime() - target);
    return candidateDistance < bestDistance ? candidate : best;
  }, candidates[0]);
  const delta = latest.value - reference.value;

  if (delta >= 5) {
    return "rising";
  }
  if (delta <= -5) {
    return "falling";
  }
  return "stable";
}

function buildWeeklyLevels(measurements: Array<{ timestamp: string; value: number }>) {
  const byDate = new Map<string, { timestamp: string; value: number }>();

  for (const measurement of measurements) {
    const date = measurement.timestamp.slice(0, 10);
    const existing = byDate.get(date);
    if (!existing || measurement.timestamp.localeCompare(existing.timestamp) > 0) {
      byDate.set(date, measurement);
    }
  }

  return Array.from(byDate.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-7)
    .map(([, measurement]) => measurement.value);
}
