import { describe, expect, it, vi } from "vitest";
import type { CityConfig } from "@/lib/ingestion/base";
import { fetchJson } from "@/lib/ingestion/http";
import { getSourceConfig, SEEDED_CITY_SOURCE_CONFIGS } from "@/lib/ingestion/source-config";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";

const cities: CityConfig[] = [
  {
    id: "city-amsterdam",
    slug: "amsterdam",
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
  },
  {
    id: "city-utrecht",
    slug: "utrecht",
    name: "Utrecht",
    latitude: 52.0907,
    longitude: 5.1214,
  },
  {
    id: "city-rotterdam",
    slug: "rotterdam",
    name: "Rotterdam",
    latitude: 51.9244,
    longitude: 4.4777,
  },
];

function jsonResponse(data: unknown, init: ResponseInit = {}) {
  return new Response(JSON.stringify(data), {
    status: init.status ?? 200,
    statusText: init.statusText,
    headers: { "content-type": "application/json" },
  });
}

describe("source configuration", () => {
  it("defines explicit source configuration for all seeded cities", () => {
    expect(SEEDED_CITY_SOURCE_CONFIGS.map((config) => config.citySlug).sort()).toEqual([
      "amsterdam",
      "rotterdam",
      "utrecht",
    ]);

    for (const city of cities) {
      const config = getSourceConfig(city.slug);
      expect(config.knmi.stationId).toMatch(/^0-20000-0-06\d{3}$/);
      expect(config.luchtmeetnet.stationId).toMatch(/^NL\d{5}$/);
      expect(config.rijkswaterstaat.locationCode.length).toBeGreaterThan(3);
      expect(config.selectionNotes.length).toBeGreaterThan(20);
    }

    expect(getSourceConfig("amsterdam").rijkswaterstaat.locationCode).toBe(
      "amsterdam.surinamekade",
    );
    expect(getSourceConfig("rotterdam").rijkswaterstaat.locationCode).toBe(
      "rotterdam.nieuwemaas.boerengat",
    );
  });

  it("rejects unsupported city source configuration lookups", () => {
    expect(() => getSourceConfig("den-haag")).toThrow("No source configuration for city: den-haag");
  });
});

describe("fetchJson", () => {
  it("returns parsed JSON for successful responses", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ ok: true }));

    await expect(fetchJson("https://example.test/data", { fetcher })).resolves.toEqual({
      ok: true,
    });
  });

  it("throws secret-safe errors for failed responses", async () => {
    const fetcher = vi.fn().mockResolvedValue(jsonResponse({ error: "bad key" }, { status: 401 }));

    await expect(
      fetchJson("https://example.test/data?token=secret", {
        fetcher,
        headers: { Authorization: "secret-key" },
      }),
    ).rejects.toThrow("HTTP 401 from https://example.test/data");
  });
});

describe("live-capable adapters", () => {
  it("keeps mock source names by default", () => {
    expect(new KnmiAdapter().sourceName).toBe("mock_knmi");
    expect(new LuchtmeetnetAdapter().sourceName).toBe("mock_luchtmeetnet");
    expect(new RijkswaterstaatAdapter().sourceName).toBe("mock_rijkswaterstaat");
  });

  it("uses live source names in live mode", () => {
    expect(new KnmiAdapter({ mode: "live", apiKey: "test-key" }).sourceName).toBe("knmi");
    expect(new LuchtmeetnetAdapter({ mode: "live" }).sourceName).toBe("luchtmeetnet");
    expect(new RijkswaterstaatAdapter({ mode: "live" }).sourceName).toBe("rijkswaterstaat");
  });

  it("fetches and normalizes KNMI CoverageJSON observations without network access", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        type: "CoverageCollection",
        coverages: [
          {
            type: "Coverage",
            domain: {
              axes: {
                t: {
                  values: [
                    "2026-05-05T10:00:00Z",
                    "2026-05-05T10:10:00Z",
                    "2026-05-05T10:20:00Z",
                  ],
                },
              },
            },
            ranges: {
              ta: { values: [16.2, 16.8, 17.1] },
              ff: { values: [5, 5.5, 6] },
              dd: { values: [240, 242, 245] },
              fx: { values: [7, 7.5, 8] },
              R1H: { values: [0.4, 0.2, 0.1] },
            },
          },
        ],
      }),
    );
    const adapter = new KnmiAdapter({ mode: "live", apiKey: "test-key", fetcher });

    const raw = await adapter.fetch(cities[0]);
    const normalized = await adapter.normalize(raw, cities[0]);

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/collections/10-minute-in-situ-meteorological-observations/locations/0-20000-0-06240"),
      expect.objectContaining({
        headers: expect.objectContaining({ Authorization: "test-key" }),
      }),
    );
    const requestedUrl = vi.mocked(fetcher).mock.calls[0][0] as string;
    expect(requestedUrl).toContain("datetime=");
    expect(requestedUrl).toContain("parameter-name=ta%2Cff%2Cdd%2Cfx%2CR1H");
    expect(requestedUrl).not.toContain("rr");
    expect(normalized[0]).toMatchObject({
      observedAt: new Date("2026-05-05T10:20:00.000Z"),
      temperatureC: 17.1,
      feelsLikeC: 17.1,
      rainMm: 0.1,
      windSpeedKmh: 21.6,
      windGustKmh: 28.8,
      windDirection: "WSW",
      sourceName: "knmi",
    });
  });

  it("fetches and normalizes latest Luchtmeetnet pollutant values", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        data: [
          {
            value: 10.3,
            timestamp_measured: "2026-05-05T22:00:00+02:00",
            formula: "PM10",
          },
          {
            value: 4.2,
            timestamp_measured: "2026-05-05T22:00:00+02:00",
            formula: "PM25",
          },
          {
            value: 9.3,
            timestamp_measured: "2026-05-05T22:00:00+02:00",
            formula: "NO2",
          },
          {
            value: 99,
            timestamp_measured: "2026-05-05T21:00:00+02:00",
            formula: "PM10",
          },
        ],
      }),
    );
    const adapter = new LuchtmeetnetAdapter({ mode: "live", fetcher });

    const raw = await adapter.fetch(cities[0]);
    const normalized = await adapter.normalize(raw, cities[0]);

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/open_api/stations/NL49017/measurements"),
      expect.any(Object),
    );
    expect(normalized[0]).toMatchObject({
      observedAt: new Date("2026-05-05T20:00:00.000Z"),
      pm10: 10.3,
      pm25: 4.2,
      no2: 9.3,
      mainPollutant: "PM10",
      aqiLabel: "Good",
      sourceName: "luchtmeetnet",
    });
  });

  it("fetches and normalizes Rijkswaterstaat water-level observations", async () => {
    const fetcher = vi.fn().mockResolvedValue(
      jsonResponse({
        WaarnemingenLijst: [
          {
            Locatie: {
              Code: "amsterdam.surinamekade",
              Naam: "Amsterdam, Surinamekade",
            },
            MetingenLijst: [
              {
                Tijdstip: "2026-05-05T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 12.4 },
              },
            ],
          },
        ],
      }),
    );
    const adapter = new RijkswaterstaatAdapter({ mode: "live", fetcher });

    const raw = await adapter.fetch(cities[0]);
    const normalized = await adapter.normalize(raw, cities[0]);

    expect(fetcher).toHaveBeenCalledWith(
      expect.stringContaining("/ONLINEWAARNEMINGENSERVICES/OphalenWaarnemingen"),
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining('"Locatie":{"Code":"amsterdam.surinamekade"}'),
      }),
    );
    expect(normalized[0]).toMatchObject({
      observedAt: new Date("2026-05-05T19:00:00.000Z"),
      stationId: "amsterdam.surinamekade",
      stationName: "Amsterdam, Surinamekade",
      waterLevelCm: 12.4,
      trendLabel: "unknown",
      riskLabel: "normal",
      sourceName: "rijkswaterstaat",
    });
  });
});
