export const SUPPORTED_CITY_ROWS = [
  { slug: "amsterdam", name: "Amsterdam", latitude: 52.3676, longitude: 4.9041 },
  { slug: "arnhem", name: "Arnhem", latitude: 51.9851, longitude: 5.8987 },
  { slug: "breda", name: "Breda", latitude: 51.5719, longitude: 4.7683 },
  { slug: "den-haag", name: "Den Haag", latitude: 52.0705, longitude: 4.3007 },
  { slug: "dordrecht", name: "Dordrecht", latitude: 51.8133, longitude: 4.6901 },
  { slug: "groningen", name: "Groningen", latitude: 53.2194, longitude: 6.5665 },
  { slug: "maastricht", name: "Maastricht", latitude: 50.8514, longitude: 5.691 },
  { slug: "nijmegen", name: "Nijmegen", latitude: 51.8126, longitude: 5.8372 },
  { slug: "rotterdam", name: "Rotterdam", latitude: 51.9244, longitude: 4.4777 },
  { slug: "utrecht", name: "Utrecht", latitude: 52.0907, longitude: 5.1214 },
] as const;

type CityUpsertClient = {
  city: {
    upsert: (args: {
      where: { slug: string };
      update: {
        name: string;
        countryCode: "NL";
        latitude: number;
        longitude: number;
        timezone: "Europe/Amsterdam";
        isActive: true;
      };
      create: {
        slug: string;
        name: string;
        countryCode: "NL";
        latitude: number;
        longitude: number;
        timezone: "Europe/Amsterdam";
        isActive: true;
      };
    }) => Promise<unknown>;
  };
};

export async function ensureSupportedCities(prisma: CityUpsertClient) {
  for (const city of SUPPORTED_CITY_ROWS) {
    const sharedData = {
      name: city.name,
      countryCode: "NL" as const,
      latitude: city.latitude,
      longitude: city.longitude,
      timezone: "Europe/Amsterdam" as const,
      isActive: true as const,
    };

    await prisma.city.upsert({
      where: { slug: city.slug },
      update: sharedData,
      create: {
        slug: city.slug,
        ...sharedData,
      },
    });
  }

  return {
    count: SUPPORTED_CITY_ROWS.length,
    slugs: SUPPORTED_CITY_ROWS.map((city) => city.slug),
  };
}
