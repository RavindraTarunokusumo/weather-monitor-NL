import { describe, expect, it, vi } from "vitest";
import type { CityConfig } from "@/lib/ingestion/base";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";
import type { PrismaClient } from "@prisma/client";
import { runIngestionJob } from "@/lib/ingestion/run";

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

describe("RijkswaterstaatAdapter", () => {
  it("sourceName is mock_rijkswaterstaat", () => {
    expect(new RijkswaterstaatAdapter().sourceName).toBe("mock_rijkswaterstaat");
  });

  it("fetch returns at least one raw record", async () => {
    const adapter = new RijkswaterstaatAdapter();
    const records = await adapter.fetch(mockCity);
    expect(records.length).toBeGreaterThan(0);
  });

  it("normalize returns NormalizedWaterRecord shape", async () => {
    const adapter = new RijkswaterstaatAdapter();
    const raw = await adapter.fetch(mockCity);
    const normalized = await adapter.normalize(raw, mockCity);

    expect(normalized).toHaveLength(raw.length);
    const r = normalized[0];
    expect(r).toMatchObject({
      sourceName: "mock_rijkswaterstaat",
      stationId: expect.any(String),
      stationName: expect.any(String),
      waterLevelCm: expect.any(Number),
      trendLabel: expect.any(String),
      riskLabel: expect.any(String),
    });
    expect(r.observedAt).toBeInstanceOf(Date);
  });
});

function makePrismaStub() {
  return {
    sourceRun: {
      create: vi.fn().mockResolvedValue({ id: "run-abc" }),
      update: vi.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaClient;
}

describe("runIngestionJob", () => {
  it("records status=success and updates source_run on success", async () => {
    const prisma = makePrismaStub();
    const adapter = new KnmiAdapter();

    const result = await runIngestionJob({
      adapter,
      city: mockCity,
      jobType: "ingest-weather",
      store: async (records) => ({ recordsStored: records.length }),
      prisma,
    });

    expect(result.status).toBe("success");
    expect(result.recordsFetched).toBeGreaterThan(0);
    expect(result.recordsStored).toBeGreaterThan(0);
    expect(prisma.sourceRun.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        status: "running",
        sourceName: "mock_knmi",
        jobType: "ingest-weather",
      }),
    });
    expect(prisma.sourceRun.update).toHaveBeenCalledWith({
      where: { id: "run-abc" },
      data: expect.objectContaining({ status: "success" }),
    });
  });

  it("records status=failed and stores errorMessage when adapter throws", async () => {
    const prisma = makePrismaStub();
    const adapter = new KnmiAdapter();
    vi.spyOn(adapter, "fetch").mockRejectedValue(new Error("network timeout"));

    const result = await runIngestionJob({
      adapter,
      city: mockCity,
      jobType: "ingest-weather",
      store: async () => ({ recordsStored: 0 }),
      prisma,
    });

    expect(result.status).toBe("failed");
    expect(result.error).toBe("network timeout");
    expect(prisma.sourceRun.update).toHaveBeenCalledWith({
      where: { id: "run-abc" },
      data: expect.objectContaining({
        status: "failed",
        errorMessage: "network timeout",
      }),
    });
  });
});
