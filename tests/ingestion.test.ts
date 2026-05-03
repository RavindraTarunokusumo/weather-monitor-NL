import { describe, expect, it } from "vitest";
import { KnmiAdapter } from "@/lib/ingestion/knmi";

const mockCity = {
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
      windSpeedKmh: expect.any(Number),
      windDirection: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});
