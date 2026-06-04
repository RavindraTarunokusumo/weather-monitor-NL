import { describe, expect, it, vi } from "vitest";
import {
  ensureSupportedCities,
  getConfiguredCityFallback,
  SUPPORTED_CITY_ROWS,
} from "@/lib/supported-cities";

describe("supported city bootstrap", () => {
  it("upserts the accepted 10-city catalog as active Dutch cities", async () => {
    const prisma = {
      city: {
        upsert: vi.fn().mockResolvedValue({}),
      },
    };

    const result = await ensureSupportedCities(prisma);

    expect(result).toEqual({
      count: 10,
      slugs: [
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
      ],
    });
    expect(SUPPORTED_CITY_ROWS).toHaveLength(10);
    expect(prisma.city.upsert).toHaveBeenCalledTimes(10);
    expect(prisma.city.upsert).toHaveBeenCalledWith({
      where: { slug: "den-haag" },
      update: expect.objectContaining({
        name: "Den Haag",
        countryCode: "NL",
        timezone: "Europe/Amsterdam",
        isActive: true,
      }),
      create: expect.objectContaining({
        slug: "den-haag",
        name: "Den Haag",
        countryCode: "NL",
        timezone: "Europe/Amsterdam",
        isActive: true,
      }),
    });
  });

  it("defines complete deterministic fallback dashboard data for every supported city", () => {
    for (const city of SUPPORTED_CITY_ROWS) {
      const fallback = getConfiguredCityFallback(city.slug);

      expect(fallback.weather).toMatchObject({
        rainProbability: expect.any(Number),
        weatherCode: expect.any(String),
        warningLevel: expect.any(String),
      });
      expect(fallback.outlook.hourly).toHaveLength(9);
      expect(fallback.outlook.hourly.map((item) => item.h)).toEqual([
        "00",
        "03",
        "06",
        "09",
        "12",
        "15",
        "18",
        "21",
        "24",
      ]);
      expect(fallback.outlook.weekly).toHaveLength(7);
      expect(fallback.uiSummary.bestWindow).toMatch(/^\d{2}:00-\d{2}:00$/);
    }
  });
});
