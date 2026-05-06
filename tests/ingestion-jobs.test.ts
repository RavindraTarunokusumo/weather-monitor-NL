import { afterEach, describe, expect, it, vi } from "vitest";
import type { PrismaClient } from "@prisma/client";
import {
  getIngestionMode,
  isAuthorizedJobRequest,
  runAllSourcesIngestion,
  runAllIngestion,
  runWeatherIngestion,
} from "@/lib/ingestion/jobs";

const city = {
  id: "city-amsterdam",
  slug: "amsterdam",
  name: "Amsterdam",
  countryCode: "NL",
  latitude: 52.3676,
  longitude: 4.9041,
  timezone: "Europe/Amsterdam",
  isActive: true,
  createdAt: new Date("2026-05-05T00:00:00.000Z"),
};

function makePrismaStub() {
  const cities = [
    city,
    {
      ...city,
      id: "city-utrecht",
      slug: "utrecht",
      name: "Utrecht",
    },
  ];

  return {
    city: {
      findUnique: vi.fn().mockImplementation(({ where }: { where: { slug: string } }) =>
        Promise.resolve(cities.find((item) => item.slug === where.slug) ?? null),
      ),
      findMany: vi.fn().mockResolvedValue(cities),
    },
    sourceRun: {
      create: vi.fn().mockResolvedValue({ id: "run-1" }),
      update: vi.fn().mockResolvedValue({}),
    },
    weatherSnapshot: {
      create: vi.fn().mockResolvedValue({}),
    },
    airQualitySnapshot: {
      create: vi.fn().mockResolvedValue({}),
    },
    waterSnapshot: {
      create: vi.fn().mockResolvedValue({}),
    },
  } as unknown as PrismaClient;
}

describe("ingestion job helpers", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("parses live and mock ingestion modes from search params", () => {
    expect(getIngestionMode(new URLSearchParams("mode=live"))).toBe("live");
    expect(getIngestionMode(new URLSearchParams("live=true"))).toBe("live");
    expect(getIngestionMode(new URLSearchParams("mode=mock"))).toBe("mock");
    expect(getIngestionMode(new URLSearchParams(""))).toBe("mock");
  });

  it("authorizes job requests with bearer token only", () => {
    vi.stubEnv("CRON_SECRET", "cron-secret");

    expect(
      isAuthorizedJobRequest(
        new Request("https://example.test/api/jobs/ingest-weather", {
          headers: { Authorization: "Bearer cron-secret" },
        }),
      ),
    ).toBe(true);
    expect(
      isAuthorizedJobRequest(
        new Request("https://example.test/api/jobs/ingest-weather?secret=cron-secret"),
      ),
    ).toBe(false);
    expect(
      isAuthorizedJobRequest(
        new Request("https://example.test/api/jobs/ingest-weather?secret=wrong"),
      ),
    ).toBe(false);
  });

  it("runs one-city weather ingestion through the shared helper", async () => {
    const prisma = makePrismaStub();

    const result = await runWeatherIngestion({
      prisma,
      citySlug: "amsterdam",
      mode: "mock",
    });

    expect(result.city).toBe("amsterdam");
    expect(result.result.status).toBe("success");
    expect(prisma.weatherSnapshot.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        cityId: "city-amsterdam",
        sourceName: "mock_knmi",
      }),
    });
  });

  it("rejects inactive or missing cities", async () => {
    const prisma = makePrismaStub();
    vi.mocked(prisma.city.findUnique).mockResolvedValue({ ...city, isActive: false });

    await expect(
      runWeatherIngestion({
        prisma,
        citySlug: "amsterdam",
        mode: "mock",
      }),
    ).rejects.toThrow("City not found or inactive: amsterdam");
  });

  it("runs all active cities for a source type", async () => {
    const prisma = makePrismaStub();

    const result = await runAllIngestion({
      prisma,
      type: "weather",
      mode: "mock",
    });

    expect(result).toHaveLength(2);
    expect(result.map((item) => item.city)).toEqual(["amsterdam", "utrecht"]);
    expect(prisma.weatherSnapshot.create).toHaveBeenCalledTimes(2);
  });

  it("runs all source types for all active cities", async () => {
    const prisma = makePrismaStub();

    const result = await runAllSourcesIngestion({
      prisma,
      mode: "mock",
    });

    expect(result.map((item) => item.type)).toEqual(["weather", "air-quality", "water"]);
    expect(result.flatMap((item) => item.results.map((entry) => entry.city))).toEqual([
      "amsterdam",
      "utrecht",
      "amsterdam",
      "utrecht",
      "amsterdam",
      "utrecht",
    ]);
    expect(prisma.weatherSnapshot.create).toHaveBeenCalledTimes(2);
    expect(prisma.airQualitySnapshot.create).toHaveBeenCalledTimes(2);
    expect(prisma.waterSnapshot.create).toHaveBeenCalledTimes(2);
  });
});
