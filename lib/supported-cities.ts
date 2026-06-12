type CityFallbackOptions = {
  temperatureC: number;
  rainProbability: number;
  rainMm: number;
  windSpeedKmh: number;
  weatherCode: string;
  warningLevel: string;
  bestWindow: string;
  mainRisk: string;
};

type SourceConfig = {
  knmi: {
    stationId: string;
    stationName: string;
  };
  luchtmeetnet: {
    stationId: string;
    stationName: string;
    components: Array<"PM25" | "PM10" | "NO2" | "O3" | "SO2">;
  };
  rijkswaterstaat: {
    locationCode: string;
    locationName: string;
    measurementCode: "WATHTE";
  };
  selectionNotes: string;
};

export const SUPPORTED_CITY_CATALOG = [
  {
    slug: "amsterdam",
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    sources: {
      knmi: {
        stationId: "0-20000-0-06240",
        stationName: "Schiphol",
      },
      luchtmeetnet: {
        stationId: "NL49017",
        stationName: "Amsterdam-Stadhouderskade",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "amsterdam.surinamekade",
        locationName: "Amsterdam, Surinamekade",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Amsterdam uses Schiphol for KNMI weather, Stadhouderskade for urban air quality, and Surinamekade as a nearby Rijkswaterstaat WATHTE location with recent observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 16.2,
      rainProbability: 0.2,
      rainMm: 0.4,
      windSpeedKmh: 18,
      weatherCode: "partly_cloudy",
      warningLevel: "none",
      bestWindow: "10:00-16:00",
      mainRisk: "Evening showers",
    },
  },
  {
    slug: "arnhem",
    name: "Arnhem",
    latitude: 51.9851,
    longitude: 5.8987,
    sources: {
      knmi: {
        stationId: "0-20000-0-06275",
        stationName: "Deelen",
      },
      luchtmeetnet: {
        stationId: "NL54010",
        stationName: "Arnhem GelreDome",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "arnhem.nederrijn",
        locationName: "Arnhem, Nederrijn",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Arnhem uses Deelen for KNMI weather, GelreDome for direct city air quality, and Arnhem Nederrijn for nearby river water-level observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 16.5,
      rainProbability: 0.18,
      rainMm: 0.2,
      windSpeedKmh: 15,
      weatherCode: "mostly_sunny",
      warningLevel: "none",
      bestWindow: "09:00-17:00",
      mainRisk: "No significant risks",
    },
  },
  {
    slug: "breda",
    name: "Breda",
    latitude: 51.5719,
    longitude: 4.7683,
    sources: {
      knmi: {
        stationId: "0-20000-0-06350",
        stationName: "Gilze-Rijen",
      },
      luchtmeetnet: {
        stationId: "NL10241",
        stationName: "Breda-Bastenakenstraat",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "breda",
        locationName: "Breda",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Breda uses nearby Gilze-Rijen for KNMI weather, Bastenakenstraat for direct city air quality, and the Breda Rijkswaterstaat WATHTE location.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 16.8,
      rainProbability: 0.26,
      rainMm: 0.4,
      windSpeedKmh: 17,
      weatherCode: "partly_cloudy",
      warningLevel: "none",
      bestWindow: "10:00-15:00",
      mainRisk: "Patchy showers",
    },
  },
  {
    slug: "den-haag",
    name: "Den Haag",
    latitude: 52.0705,
    longitude: 4.3007,
    sources: {
      knmi: {
        stationId: "0-20000-0-06215",
        stationName: "Voorschoten",
      },
      luchtmeetnet: {
        stationId: "NL10404",
        stationName: "Den Haag-Rebecquestraat",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "scheveningen",
        locationName: "Scheveningen",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Den Haag uses nearby Voorschoten for KNMI weather, Rebecquestraat for direct city air quality, and Scheveningen as the representative coastal Rijkswaterstaat WATHTE location.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 15.4,
      rainProbability: 0.32,
      rainMm: 0.7,
      windSpeedKmh: 26,
      weatherCode: "cloudy_showers",
      warningLevel: "none",
      bestWindow: "09:00-13:00",
      mainRisk: "Coastal gusts",
    },
  },
  {
    slug: "dordrecht",
    name: "Dordrecht",
    latitude: 51.8133,
    longitude: 4.6901,
    sources: {
      knmi: {
        stationId: "0-20000-0-06344",
        stationName: "Rotterdam",
      },
      luchtmeetnet: {
        stationId: "NL10442",
        stationName: "Dordrecht-Bamendaweg",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "dordrecht.oudemaas.benedenmerwede",
        locationName: "Dordrecht Oude Maas, Beneden Merwede",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Dordrecht uses Rotterdam for KNMI weather, Bamendaweg for direct city air quality, and Oude Maas Beneden Merwede for reliable WATHTE observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 15.7,
      rainProbability: 0.3,
      rainMm: 0.6,
      windSpeedKmh: 23,
      weatherCode: "cloudy_showers",
      warningLevel: "none",
      bestWindow: "09:00-12:00",
      mainRisk: "Wind and showers",
    },
  },
  {
    slug: "groningen",
    name: "Groningen",
    latitude: 53.2194,
    longitude: 6.5665,
    sources: {
      knmi: {
        stationId: "0-20000-0-06280",
        stationName: "Eelde",
      },
      luchtmeetnet: {
        stationId: "NL10938",
        stationName: "Groningen-Nijensteinheerd",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "groningen",
        locationName: "Groningen",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Groningen uses Eelde for KNMI weather, Nijensteinheerd for direct city air quality, and the Groningen Rijkswaterstaat WATHTE location.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 14.8,
      rainProbability: 0.24,
      rainMm: 0.3,
      windSpeedKmh: 20,
      weatherCode: "partly_cloudy",
      warningLevel: "none",
      bestWindow: "10:00-16:00",
      mainRisk: "Late breeze",
    },
  },
  {
    slug: "maastricht",
    name: "Maastricht",
    latitude: 50.8514,
    longitude: 5.691,
    sources: {
      knmi: {
        stationId: "0-20000-0-06380",
        stationName: "Maastricht",
      },
      luchtmeetnet: {
        stationId: "NL50007",
        stationName: "Maastricht-Hoge_Fronten",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "maastricht.borgharen.julianakanaal",
        locationName: "Maastricht, Borgharen, Julianakanaal",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Maastricht uses the Maastricht KNMI station, Hoge Fronten for direct city air quality, and Borgharen Julianakanaal for reliable WATHTE observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 17.4,
      rainProbability: 0.16,
      rainMm: 0.1,
      windSpeedKmh: 13,
      weatherCode: "mostly_sunny",
      warningLevel: "none",
      bestWindow: "09:00-18:00",
      mainRisk: "Low evening shower chance",
    },
  },
  {
    slug: "nijmegen",
    name: "Nijmegen",
    latitude: 51.8126,
    longitude: 5.8372,
    sources: {
      knmi: {
        stationId: "0-20000-0-06375",
        stationName: "Volkel",
      },
      luchtmeetnet: {
        stationId: "NL10741",
        stationName: "Nijmegen-Graafseweg",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "nijmegen.waal",
        locationName: "Nijmegen, Waal",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Nijmegen uses Volkel for KNMI weather, Graafseweg for direct city air quality, and Nijmegen Waal for river water-level observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 16.1,
      rainProbability: 0.22,
      rainMm: 0.3,
      windSpeedKmh: 16,
      weatherCode: "partly_cloudy",
      warningLevel: "none",
      bestWindow: "09:00-16:00",
      mainRisk: "River breeze",
    },
  },
  {
    slug: "rotterdam",
    name: "Rotterdam",
    latitude: 51.9244,
    longitude: 4.4777,
    sources: {
      knmi: {
        stationId: "0-20000-0-06344",
        stationName: "Rotterdam",
      },
      luchtmeetnet: {
        stationId: "NL01493",
        stationName: "Rotterdam-Statenweg",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "rotterdam.nieuwemaas.boerengat",
        locationName: "Rotterdam, Nieuwe Maas, Boerengat",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Rotterdam uses the Rotterdam KNMI station, Statenweg for urban air quality, and Boerengat on the Nieuwe Maas as a nearby Rijkswaterstaat WATHTE location with recent observations.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 15.1,
      rainProbability: 0.35,
      rainMm: 0.8,
      windSpeedKmh: 24,
      weatherCode: "cloudy_showers",
      warningLevel: "none",
      bestWindow: "09:00-13:00",
      mainRisk: "Afternoon showers",
    },
  },
  {
    slug: "utrecht",
    name: "Utrecht",
    latitude: 52.0907,
    longitude: 5.1214,
    sources: {
      knmi: {
        stationId: "0-20000-0-06260",
        stationName: "De Bilt",
      },
      luchtmeetnet: {
        stationId: "NL10636",
        stationName: "Utrecht-Kardinaal de Jongweg",
        components: ["PM25", "PM10", "NO2", "O3", "SO2"],
      },
      rijkswaterstaat: {
        locationCode: "hagestein.beneden",
        locationName: "Hagestein beneden",
        measurementCode: "WATHTE",
      },
      selectionNotes:
        "Utrecht uses De Bilt for KNMI weather, Kardinaal de Jongweg for air quality, and Hagestein beneden as a representative nearby Lek water-level location.",
    } satisfies SourceConfig,
    fallback: {
      temperatureC: 17,
      rainProbability: 0.15,
      rainMm: 0.1,
      windSpeedKmh: 14,
      weatherCode: "mostly_sunny",
      warningLevel: "none",
      bestWindow: "09:00-18:00",
      mainRisk: "No significant risks",
    },
  },
] as const;

export const SUPPORTED_CITY_ROWS = SUPPORTED_CITY_CATALOG.map((city) => ({
  slug: city.slug,
  name: city.name,
  latitude: city.latitude,
  longitude: city.longitude,
}));

export const SUPPORTED_CITY_SOURCE_CONFIGS = SUPPORTED_CITY_CATALOG.map((city) => ({
  citySlug: city.slug,
  ...city.sources,
}));

function makeHourlyOutlook(options: CityFallbackOptions) {
  const rainPercent = Math.round(options.rainProbability * 100);
  const temp = options.temperatureC;
  const wind = options.windSpeedKmh;

  return [
    { h: "00", rain: Math.max(0, rainPercent - 20), wind: wind - 3, temp: Math.round(temp - 4) },
    { h: "03", rain: Math.max(0, rainPercent - 15), wind: wind - 4, temp: Math.round(temp - 5) },
    { h: "06", rain: Math.max(0, rainPercent - 25), wind: wind - 5, temp: Math.round(temp - 4) },
    { h: "09", rain: Math.max(0, rainPercent - 15), wind: wind - 2, temp: Math.round(temp - 2) },
    { h: "12", rain: rainPercent, wind, temp: Math.round(temp) },
    { h: "15", rain: Math.min(100, rainPercent + 10), wind: wind + 3, temp: Math.round(temp + 1) },
    { h: "18", rain: Math.min(100, rainPercent + 20), wind: wind + 5, temp: Math.round(temp) },
    { h: "21", rain: Math.min(100, rainPercent + 25), wind: wind + 7, temp: Math.round(temp - 2) },
    { h: "24", rain: Math.min(100, rainPercent + 15), wind: wind + 4, temp: Math.round(temp - 3) },
  ];
}

function makeWeeklyOutlook(options: CityFallbackOptions) {
  const hi = Math.round(options.temperatureC + 1);
  const lo = Math.round(options.temperatureC - 6);
  const rain = Math.round(options.rainProbability * 100);

  return [
    { day: "Mon", hi: hi - 1, lo, rain: Math.min(100, rain + 20) },
    { day: "Tue", hi, lo: lo + 1, rain },
    { day: "Wed", hi: hi + 1, lo: lo + 1, rain: Math.max(5, rain - 15) },
    { day: "Thu", hi, lo, rain: Math.min(100, rain + 5) },
    { day: "Fri", hi: hi + 1, lo, rain: Math.max(5, rain - 10) },
    { day: "Sat", hi: hi - 2, lo: lo - 1, rain: Math.min(100, rain + 25) },
    { day: "Sun", hi: hi - 3, lo: lo - 2, rain: Math.min(100, rain + 35) },
  ];
}

export function getConfiguredCityFallback(citySlug: string) {
  const city = SUPPORTED_CITY_CATALOG.find((item) => item.slug === citySlug);

  if (!city) {
    throw new Error(`No configured fallback for city: ${citySlug}`);
  }

  return {
    weather: {
      rainProbability: city.fallback.rainProbability,
      weatherCode: city.fallback.weatherCode,
      warningLevel: city.fallback.warningLevel,
    },
    uiSummary: {
      bestWindow: city.fallback.bestWindow,
      mainRisk: city.fallback.mainRisk,
      changed: "Configured fallback active",
      outdoorWindowDetail: `Configured fallback outdoor window for ${city.name} is ${city.fallback.bestWindow}.`,
      riskDetail: `${city.fallback.mainRisk} is the configured fallback risk signal for ${city.name}.`,
      changedDetail: "Live forecast enrichment is temporarily unavailable; configured city defaults keep the dashboard complete.",
    },
    outlook: {
      hourly: makeHourlyOutlook(city.fallback),
      weekly: makeWeeklyOutlook(city.fallback),
    },
  };
}

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
