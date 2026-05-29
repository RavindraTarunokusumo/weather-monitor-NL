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
  {
    id: "city-den-haag",
    slug: "den-haag",
    name: "Den Haag",
    latitude: 52.0705,
    longitude: 4.3007,
  },
  {
    id: "city-groningen",
    slug: "groningen",
    name: "Groningen",
    latitude: 53.2194,
    longitude: 6.5665,
  },
  {
    id: "city-arnhem",
    slug: "arnhem",
    name: "Arnhem",
    latitude: 51.9851,
    longitude: 5.8987,
  },
  {
    id: "city-maastricht",
    slug: "maastricht",
    name: "Maastricht",
    latitude: 50.8514,
    longitude: 5.691,
  },
  {
    id: "city-breda",
    slug: "breda",
    name: "Breda",
    latitude: 51.5719,
    longitude: 4.7683,
  },
  {
    id: "city-nijmegen",
    slug: "nijmegen",
    name: "Nijmegen",
    latitude: 51.8126,
    longitude: 5.8372,
  },
  {
    id: "city-dordrecht",
    slug: "dordrecht",
    name: "Dordrecht",
    latitude: 51.8133,
    longitude: 4.6901,
  },
];

const supportedCitySlugs = [
  "amsterdam",
  "arnhem",
  "breda",
  "den-haag",
  "dordrecht",
  "groningen",
  "maastricht",
  "nijmegen",
  "rotterdam",
  "utrecht",
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
    expect(SEEDED_CITY_SOURCE_CONFIGS.map((config) => config.citySlug).sort()).toEqual(
      supportedCitySlugs,
    );

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
    expect(getSourceConfig("den-haag").luchtmeetnet.stationId).toBe("NL10404");
    expect(getSourceConfig("groningen").rijkswaterstaat.locationCode).toBe("groningen");
    expect(getSourceConfig("arnhem").rijkswaterstaat.locationCode).toBe("arnhem.nederrijn");
    expect(getSourceConfig("maastricht").rijkswaterstaat.locationCode).toBe(
      "maastricht.borgharen.julianakanaal",
    );
    expect(getSourceConfig("breda").luchtmeetnet.stationId).toBe("NL10241");
    expect(getSourceConfig("nijmegen").rijkswaterstaat.locationCode).toBe("nijmegen.waal");
    expect(getSourceConfig("dordrecht").luchtmeetnet.stationId).toBe("NL10442");
  });

  it("rejects unsupported city source configuration lookups", () => {
    expect(() => getSourceConfig("zwolle")).toThrow("No source configuration for city: zwolle");
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

  it("enriches live KNMI weather with forecast outlook and official warning data", async () => {
    const fetcher = vi.fn().mockImplementation((input: string) => {
      if (input.includes("/edr/")) {
        return Promise.resolve(
          jsonResponse({
            type: "CoverageCollection",
            coverages: [
              {
                domain: { axes: { t: { values: ["2026-05-05T10:20:00Z"] } } },
                ranges: {
                  ta: { values: [17.1] },
                  ff: { values: [6] },
                  dd: { values: [245] },
                  fx: { values: [8] },
                  R1H: { values: [0.1] },
                },
              },
            ],
          }),
        );
      }

      if (input.includes("api.open-meteo.com")) {
        return Promise.resolve(
          jsonResponse({
            hourly: {
              time: [
                "2026-05-05T12:00",
                "2026-05-05T15:00",
                "2026-05-05T18:00",
              ],
              temperature_2m: [17, 18, 16],
              precipitation_probability: [20, null, 80],
              precipitation: [0, 0.2, 2.4],
              weather_code: [2, 3, 61],
              wind_speed_10m: [18, 20, 26],
              wind_gusts_10m: [30, 34, 48],
            },
            daily: {
              time: [
                "2026-05-05",
                "2026-05-06",
                "2026-05-07",
                "2026-05-08",
                "2026-05-09",
                "2026-05-10",
                "2026-05-11",
              ],
              temperature_2m_max: [18, 17, 16, 16, 15, 15, 14],
              temperature_2m_min: [10, 11, 10, 9, 8, 8, 7],
              precipitation_probability_max: [80, null, 30, 20, 40, 60, 70],
              precipitation_sum: [2.6, 1.2, 0.2, 0, 0.4, 1.3, 2.1],
              weather_code: [61, 3, 2, 1, 3, 61, 63],
            },
          }),
        );
      }

      if (input.endsWith("/files/warnings.json/url")) {
        return Promise.resolve(
          jsonResponse({
            temporaryDownloadUrl: "https://download.test/warnings.json",
          }),
        );
      }

      if (input.includes("/datasets/waarschuwingen_nederland_48h/")) {
        return Promise.resolve(
          jsonResponse({
            files: [{ filename: "warnings.json" }],
          }),
        );
      }

      return Promise.resolve(
        jsonResponse({
          warnings: [{ region: "Noord-Holland", level: "yellow" }],
        }),
      );
    });
    const adapter = new KnmiAdapter({ mode: "live", apiKey: "test-key", fetcher });

    const raw = await adapter.fetch(cities[0]);
    const normalized = await adapter.normalize(raw, cities[0]);

    expect(normalized[0]).toMatchObject({
      rainProbability: 0.2,
      weatherCode: "partly_cloudy",
      warningLevel: "yellow",
    });
    const forecastRequest = fetcher.mock.calls.find(([input]) =>
      input.toString().includes("api.open-meteo.com"),
    )?.[0];
    expect(forecastRequest?.toString()).toContain("forecast_hours=60");
    expect(forecastRequest?.toString()).toContain("precipitation_probability");
    expect(normalized[0].sourcePayload).toMatchObject({
      forecast: {
        provider: "open-meteo",
        hourly: [
          { h: "12", rain: 20, wind: 18, temp: 17 },
          { h: "15", rain: null, wind: 20, temp: 18 },
          { h: "18", rain: 80, wind: 26, temp: 16 },
        ],
        weekly: expect.arrayContaining([
          { day: "Tue", hi: 18, lo: 10, rain: 80 },
          { day: "Wed", hi: 17, lo: 11, rain: null },
        ]),
      },
      warning: {
        level: "yellow",
        region: "Noord-Holland",
      },
    });
  });

  it.each([
    ["den-haag", "Zuid-Holland"],
    ["groningen", "Groningen"],
    ["arnhem", "Gelderland"],
    ["maastricht", "Limburg"],
    ["breda", "Noord-Brabant"],
    ["nijmegen", "Gelderland"],
    ["dordrecht", "Zuid-Holland"],
  ])("maps %s to the correct official KNMI warning region", async (citySlug, region) => {
    const city = cities.find((item) => item.slug === citySlug);
    if (!city) {
      throw new Error(`Missing test city fixture: ${citySlug}`);
    }
    const fetcher = vi.fn().mockImplementation((input: string) => {
      if (input.includes("/edr/")) {
        return Promise.resolve(
          jsonResponse({
            type: "CoverageCollection",
            coverages: [
              {
                domain: { axes: { t: { values: ["2026-05-05T10:20:00Z"] } } },
                ranges: {
                  ta: { values: [17.1] },
                  ff: { values: [6] },
                  dd: { values: [245] },
                  fx: { values: [8] },
                  R1H: { values: [0.1] },
                },
              },
            ],
          }),
        );
      }

      if (input.includes("api.open-meteo.com")) {
        return Promise.resolve(
          jsonResponse({
            hourly: {
              time: ["2026-05-05T12:00"],
              temperature_2m: [17],
              precipitation_probability: [20],
              weather_code: [2],
              wind_speed_10m: [18],
              wind_gusts_10m: [30],
            },
            daily: {
              time: ["2026-05-05"],
              temperature_2m_max: [18],
              temperature_2m_min: [10],
              precipitation_probability_max: [80],
              weather_code: [61],
            },
          }),
        );
      }

      if (input.endsWith("/files/warnings.json/url")) {
        return Promise.resolve(
          jsonResponse({
            temporaryDownloadUrl: "https://download.test/warnings.json",
          }),
        );
      }

      if (input.includes("/datasets/waarschuwingen_nederland_48h/")) {
        return Promise.resolve(jsonResponse({ files: [{ filename: "warnings.json" }] }));
      }

      return Promise.resolve(jsonResponse({ warnings: [{ region, level: "yellow" }] }));
    });
    const adapter = new KnmiAdapter({ mode: "live", apiKey: "test-key", fetcher });

    const raw = await adapter.fetch(city);
    const normalized = await adapter.normalize(raw, city);

    expect(normalized[0].warningLevel).toBe("yellow");
    expect(normalized[0].sourcePayload).toMatchObject({
      warning: {
        region,
        level: "yellow",
      },
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
      trendLabel: "falling",
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
                Tijdstip: "2026-04-29T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 10 },
              },
              {
                Tijdstip: "2026-04-30T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 12 },
              },
              {
                Tijdstip: "2026-05-01T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 14 },
              },
              {
                Tijdstip: "2026-05-02T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 15 },
              },
              {
                Tijdstip: "2026-05-03T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 16 },
              },
              {
                Tijdstip: "2026-05-05T14:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 11 },
              },
              {
                Tijdstip: "2026-05-04T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 17 },
              },
              {
                Tijdstip: "2026-05-05T20:00:00.000+01:00",
                Meetwaarde: { Waarde_Numeriek: 18 },
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
    const body = JSON.parse(String(vi.mocked(fetcher).mock.calls[0][1]?.body));
    expect(body.AquoPlusWaarnemingMetadata.AquoMetadata.ProcesType).toBe("meting");
    expect(body.AquoPlusWaarnemingMetadata.WaarnemingMetadata.KwaliteitswaardecodeLijst).toContain("00");
    expect(normalized[0]).toMatchObject({
      observedAt: new Date("2026-05-05T19:00:00.000Z"),
      stationId: "amsterdam.surinamekade",
      stationName: "Amsterdam, Surinamekade",
      waterLevelCm: 18,
      trendLabel: "rising",
      riskLabel: "normal",
      sourceName: "rijkswaterstaat",
    });
    expect(normalized[0].sourcePayload).toMatchObject({
      weekly_levels_cm: [10, 12, 14, 15, 16, 17, 18],
    });
  });
});
