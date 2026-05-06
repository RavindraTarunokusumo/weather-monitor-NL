export type CitySourceConfig = {
  citySlug: "amsterdam" | "utrecht" | "rotterdam";
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

export const SEEDED_CITY_SOURCE_CONFIGS: CitySourceConfig[] = [
  {
    citySlug: "amsterdam",
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
  },
  {
    citySlug: "utrecht",
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
  },
  {
    citySlug: "rotterdam",
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
  },
];

export function getSourceConfig(citySlug: string) {
  const config = SEEDED_CITY_SOURCE_CONFIGS.find((item) => item.citySlug === citySlug);

  if (!config) {
    throw new Error(`No source configuration for city: ${citySlug}`);
  }

  return config;
}
