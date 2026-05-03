import { describe, expect, it } from "vitest";
import type { CityConfig } from "@/lib/ingestion/base";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";

const mockCity: CityConfig = {
  id: "city-1",
  slug: "amsterdam",
  name: "Amsterdam",
  latitude: 52.3676,
  longitude: 4.9041,
};

describe("KnmiAdapter", () => {
  it("sourceName is mock_knmi", () => {
    expect(new KnmiAdapter().sourceName).toBe("mock_knmi");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new KnmiAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedWeatherRecord shape", async () => {
    const adapter = new KnmiAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_knmi",
      temperatureC: expect.any(Number),
      feelsLikeC: expect.any(Number),
      rainMm: expect.any(Number),
      rainProbability: expect.any(Number),
      windSpeedKmh: expect.any(Number),
      windGustKmh: expect.any(Number),
      windDirection: expect.any(String),
      weatherCode: expect.any(String),
      warningLevel: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});

describe("LuchtmeetnetAdapter", () => {
  it("sourceName is mock_luchtmeetnet", () => {
    expect(new LuchtmeetnetAdapter().sourceName).toBe("mock_luchtmeetnet");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new LuchtmeetnetAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedAirQualityRecord shape", async () => {
    const adapter = new LuchtmeetnetAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_luchtmeetnet",
      aqiValue: expect.any(Number),
      aqiLabel: expect.any(String),
      pm25: expect.any(Number),
      pm10: expect.any(Number),
      no2: expect.any(Number),
      o3: expect.any(Number),
      so2: expect.any(Number),
      mainPollutant: expect.any(String),
      trendLabel: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});
