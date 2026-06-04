export type CitySourceConfig = {
  citySlug:
    | "amsterdam"
    | "arnhem"
    | "breda"
    | "den-haag"
    | "dordrecht"
    | "groningen"
    | "maastricht"
    | "nijmegen"
    | "rotterdam"
    | "utrecht";
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
    citySlug: "den-haag",
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
  },
  {
    citySlug: "groningen",
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
  },
  {
    citySlug: "arnhem",
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
  },
  {
    citySlug: "maastricht",
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
  },
  {
    citySlug: "breda",
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
  },
  {
    citySlug: "nijmegen",
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
  {
    citySlug: "dordrecht",
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
  },
];

export function getSourceConfig(citySlug: string) {
  const config = SEEDED_CITY_SOURCE_CONFIGS.find((item) => item.citySlug === citySlug);

  if (!config) {
    throw new Error(`No source configuration for city: ${citySlug}`);
  }

  return config;
}
