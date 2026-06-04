import { describe, expect, it, vi } from "vitest";
import { ensureSupportedCities, SUPPORTED_CITY_ROWS } from "@/lib/supported-cities";

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
});
