import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

type HourlyOutlook = {
  h: string;
  rain: number;
  wind: number;
  temp: number;
};

type WeeklyOutlook = {
  day: string;
  hi: number;
  lo: number;
  rain: number;
};

type CitySeed = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  weather: {
    temperatureC: number;
    feelsLikeC: number;
    rainMm: number;
    rainProbability: number;
    windSpeedKmh: number;
    windGustKmh: number;
    windDirection: string;
    weatherCode: string;
    warningLevel: string;
  };
  air: {
    aqiValue: number;
    aqiLabel: string;
    pm25: number;
    pm10: number;
    no2: number;
    o3: number;
    so2: number;
    mainPollutant: string;
    trendLabel: string;
  };
  water: {
    stationId: string;
    stationName: string;
    waterLevelCm: number;
    trendLabel: string;
    riskLabel: string;
    weeklyLevelsCm: number[];
  };
  cycleComfortScore: number;
  cycleComfortLabel: string;
  bestOutdoorWindow: string;
  worstOutdoorWindow: string;
  briefingText: string;
  uiSummary: {
    bestWindow: string;
    mainRisk: string;
    changed: string;
    outdoorWindowDetail: string;
    riskDetail: string;
    changedDetail: string;
  };
  outlook: {
    hourly: HourlyOutlook[];
    weekly: WeeklyOutlook[];
  };
};

type AdditionalCitySeedOptions = {
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  weather: CitySeed["weather"];
  air: CitySeed["air"];
  water: CitySeed["water"];
  cycleComfortScore: number;
  cycleComfortLabel: string;
  bestOutdoorWindow: string;
  worstOutdoorWindow: string;
  mainRisk: string;
  changed: string;
};

function makeHourlyOutlook(baseTemp: number, baseRain: number, baseWind: number): HourlyOutlook[] {
  return [
    { h: "00", rain: Math.max(0, baseRain - 0.2), wind: baseWind - 3, temp: baseTemp - 4 },
    { h: "03", rain: Math.max(0, baseRain - 0.1), wind: baseWind - 4, temp: baseTemp - 5 },
    { h: "06", rain: Math.max(0, baseRain - 0.3), wind: baseWind - 5, temp: baseTemp - 4 },
    { h: "09", rain: Math.max(0, baseRain - 0.2), wind: baseWind - 2, temp: baseTemp - 2 },
    { h: "12", rain: baseRain, wind: baseWind, temp: baseTemp },
    { h: "15", rain: baseRain + 0.2, wind: baseWind + 3, temp: baseTemp + 1 },
    { h: "18", rain: baseRain + 0.5, wind: baseWind + 5, temp: baseTemp },
    { h: "21", rain: baseRain + 0.7, wind: baseWind + 7, temp: baseTemp - 2 },
    { h: "24", rain: baseRain + 0.4, wind: baseWind + 4, temp: baseTemp - 3 },
  ];
}

function makeWeeklyOutlook(baseHi: number, baseLo: number, baseRain: number): WeeklyOutlook[] {
  return [
    { day: "Mon", hi: baseHi - 1, lo: baseLo, rain: baseRain + 20 },
    { day: "Tue", hi: baseHi, lo: baseLo + 1, rain: baseRain },
    { day: "Wed", hi: baseHi + 1, lo: baseLo + 1, rain: Math.max(5, baseRain - 15) },
    { day: "Thu", hi: baseHi, lo: baseLo, rain: baseRain + 5 },
    { day: "Fri", hi: baseHi + 1, lo: baseLo, rain: Math.max(5, baseRain - 10) },
    { day: "Sat", hi: baseHi - 2, lo: baseLo - 1, rain: baseRain + 25 },
    { day: "Sun", hi: baseHi - 3, lo: baseLo - 2, rain: baseRain + 35 },
  ];
}

function makeAdditionalCitySeed(options: AdditionalCitySeedOptions): CitySeed {
  return {
    slug: options.slug,
    name: options.name,
    latitude: options.latitude,
    longitude: options.longitude,
    weather: options.weather,
    air: options.air,
    water: options.water,
    cycleComfortScore: options.cycleComfortScore,
    cycleComfortLabel: options.cycleComfortLabel,
    bestOutdoorWindow: options.bestOutdoorWindow,
    worstOutdoorWindow: options.worstOutdoorWindow,
    briefingText: `${options.name} has a reliable seeded dashboard today. The best outdoor window is ${options.bestOutdoorWindow}, with ${options.mainRisk.toLowerCase()} as the main condition to watch.`,
    uiSummary: {
      bestWindow: options.bestOutdoorWindow,
      mainRisk: options.mainRisk,
      changed: options.changed,
      outdoorWindowDetail: `${options.name} has its most comfortable outdoor conditions during ${options.bestOutdoorWindow}.`,
      riskDetail: `${options.mainRisk} is the main seeded risk signal for ${options.name}.`,
      changedDetail: `${options.changed} in the seeded ${options.name} dashboard profile.`,
    },
    outlook: {
      hourly: makeHourlyOutlook(
        options.weather.temperatureC,
        options.weather.rainMm,
        options.weather.windSpeedKmh,
      ),
      weekly: makeWeeklyOutlook(
        Math.round(options.weather.temperatureC + 1),
        Math.round(options.weather.temperatureC - 6),
        Math.round(options.weather.rainProbability * 100),
      ),
    },
  };
}

const additionalCitySeeds: CitySeed[] = [
  makeAdditionalCitySeed({
    slug: "den-haag",
    name: "Den Haag",
    latitude: 52.0705,
    longitude: 4.3007,
    weather: {
      temperatureC: 15.4,
      feelsLikeC: 13.9,
      rainMm: 0.7,
      rainProbability: 0.32,
      windSpeedKmh: 26,
      windGustKmh: 44,
      windDirection: "SW",
      weatherCode: "cloudy_showers",
      warningLevel: "none",
    },
    air: {
      aqiValue: 49,
      aqiLabel: "Good",
      pm25: 13,
      pm10: 25,
      no2: 22,
      o3: 41,
      so2: 6,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "scheveningen",
      stationName: "Scheveningen",
      waterLevelCm: 18,
      trendLabel: "rising",
      riskLabel: "normal",
      weeklyLevelsCm: [14, 15, 15, 16, 17, 18, 18],
    },
    cycleComfortScore: 60,
    cycleComfortLabel: "fair",
    bestOutdoorWindow: "09:00-13:00",
    worstOutdoorWindow: "16:00-21:00",
    mainRisk: "Coastal gusts",
    changed: "Wind stronger near the coast",
  }),
  makeAdditionalCitySeed({
    slug: "groningen",
    name: "Groningen",
    latitude: 53.2194,
    longitude: 6.5665,
    weather: {
      temperatureC: 14.8,
      feelsLikeC: 13.6,
      rainMm: 0.3,
      rainProbability: 0.24,
      windSpeedKmh: 20,
      windGustKmh: 34,
      windDirection: "W",
      weatherCode: "partly_cloudy",
      warningLevel: "none",
    },
    air: {
      aqiValue: 34,
      aqiLabel: "Good",
      pm25: 8,
      pm10: 16,
      no2: 11,
      o3: 48,
      so2: 4,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "groningen",
      stationName: "Groningen",
      waterLevelCm: 8,
      trendLabel: "stable",
      riskLabel: "normal",
      weeklyLevelsCm: [7, 8, 8, 8, 9, 8, 8],
    },
    cycleComfortScore: 74,
    cycleComfortLabel: "good",
    bestOutdoorWindow: "10:00-16:00",
    worstOutdoorWindow: "19:00-22:00",
    mainRisk: "Late breeze",
    changed: "Air quality steady",
  }),
  makeAdditionalCitySeed({
    slug: "arnhem",
    name: "Arnhem",
    latitude: 51.9851,
    longitude: 5.8987,
    weather: {
      temperatureC: 16.5,
      feelsLikeC: 15.7,
      rainMm: 0.2,
      rainProbability: 0.18,
      windSpeedKmh: 15,
      windGustKmh: 25,
      windDirection: "WNW",
      weatherCode: "mostly_sunny",
      warningLevel: "none",
    },
    air: {
      aqiValue: 39,
      aqiLabel: "Good",
      pm25: 10,
      pm10: 19,
      no2: 15,
      o3: 50,
      so2: 5,
      mainPollutant: "O3",
      trendLabel: "falling",
    },
    water: {
      stationId: "arnhem.nederrijn",
      stationName: "Arnhem, Nederrijn",
      waterLevelCm: 31,
      trendLabel: "falling",
      riskLabel: "normal",
      weeklyLevelsCm: [35, 34, 33, 32, 32, 31, 31],
    },
    cycleComfortScore: 82,
    cycleComfortLabel: "excellent",
    bestOutdoorWindow: "09:00-17:00",
    worstOutdoorWindow: "20:00-22:00",
    mainRisk: "No significant risks",
    changed: "River level easing",
  }),
  makeAdditionalCitySeed({
    slug: "maastricht",
    name: "Maastricht",
    latitude: 50.8514,
    longitude: 5.691,
    weather: {
      temperatureC: 17.4,
      feelsLikeC: 16.8,
      rainMm: 0.1,
      rainProbability: 0.16,
      windSpeedKmh: 13,
      windGustKmh: 22,
      windDirection: "S",
      weatherCode: "mostly_sunny",
      warningLevel: "none",
    },
    air: {
      aqiValue: 45,
      aqiLabel: "Good",
      pm25: 12,
      pm10: 21,
      no2: 17,
      o3: 53,
      so2: 5,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "maastricht.borgharen.julianakanaal",
      stationName: "Maastricht, Borgharen, Julianakanaal",
      waterLevelCm: 42,
      trendLabel: "stable",
      riskLabel: "normal",
      weeklyLevelsCm: [41, 42, 42, 43, 42, 42, 41],
    },
    cycleComfortScore: 86,
    cycleComfortLabel: "excellent",
    bestOutdoorWindow: "09:00-18:00",
    worstOutdoorWindow: "20:00-22:00",
    mainRisk: "Low evening shower chance",
    changed: "Warmest seeded city",
  }),
  makeAdditionalCitySeed({
    slug: "breda",
    name: "Breda",
    latitude: 51.5719,
    longitude: 4.7683,
    weather: {
      temperatureC: 16.8,
      feelsLikeC: 15.8,
      rainMm: 0.4,
      rainProbability: 0.26,
      windSpeedKmh: 17,
      windGustKmh: 29,
      windDirection: "SW",
      weatherCode: "partly_cloudy",
      warningLevel: "none",
    },
    air: {
      aqiValue: 47,
      aqiLabel: "Good",
      pm25: 13,
      pm10: 24,
      no2: 20,
      o3: 44,
      so2: 6,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "breda",
      stationName: "Breda",
      waterLevelCm: 16,
      trendLabel: "stable",
      riskLabel: "normal",
      weeklyLevelsCm: [15, 15, 16, 16, 17, 16, 16],
    },
    cycleComfortScore: 72,
    cycleComfortLabel: "good",
    bestOutdoorWindow: "10:00-15:00",
    worstOutdoorWindow: "18:00-21:00",
    mainRisk: "Patchy showers",
    changed: "Comfort holding steady",
  }),
  makeAdditionalCitySeed({
    slug: "nijmegen",
    name: "Nijmegen",
    latitude: 51.8126,
    longitude: 5.8372,
    weather: {
      temperatureC: 16.1,
      feelsLikeC: 15.2,
      rainMm: 0.3,
      rainProbability: 0.22,
      windSpeedKmh: 16,
      windGustKmh: 27,
      windDirection: "W",
      weatherCode: "partly_cloudy",
      warningLevel: "none",
    },
    air: {
      aqiValue: 41,
      aqiLabel: "Good",
      pm25: 11,
      pm10: 20,
      no2: 16,
      o3: 47,
      so2: 5,
      mainPollutant: "O3",
      trendLabel: "falling",
    },
    water: {
      stationId: "nijmegen.waal",
      stationName: "Nijmegen, Waal",
      waterLevelCm: 38,
      trendLabel: "falling",
      riskLabel: "normal",
      weeklyLevelsCm: [42, 41, 40, 39, 39, 38, 38],
    },
    cycleComfortScore: 79,
    cycleComfortLabel: "good",
    bestOutdoorWindow: "09:00-16:00",
    worstOutdoorWindow: "19:00-22:00",
    mainRisk: "River breeze",
    changed: "Waal level easing",
  }),
  makeAdditionalCitySeed({
    slug: "dordrecht",
    name: "Dordrecht",
    latitude: 51.8133,
    longitude: 4.6901,
    weather: {
      temperatureC: 15.7,
      feelsLikeC: 14.3,
      rainMm: 0.6,
      rainProbability: 0.3,
      windSpeedKmh: 23,
      windGustKmh: 39,
      windDirection: "WSW",
      weatherCode: "cloudy_showers",
      warningLevel: "none",
    },
    air: {
      aqiValue: 54,
      aqiLabel: "Moderate",
      pm25: 16,
      pm10: 29,
      no2: 24,
      o3: 38,
      so2: 7,
      mainPollutant: "PM10",
      trendLabel: "stable",
    },
    water: {
      stationId: "dordrecht.oudemaas.benedenmerwede",
      stationName: "Dordrecht Oude Maas, Beneden Merwede",
      waterLevelCm: 24,
      trendLabel: "rising",
      riskLabel: "normal",
      weeklyLevelsCm: [20, 21, 22, 23, 23, 24, 24],
    },
    cycleComfortScore: 58,
    cycleComfortLabel: "fair",
    bestOutdoorWindow: "09:00-12:00",
    worstOutdoorWindow: "15:00-20:00",
    mainRisk: "Wind and showers",
    changed: "Water level rising",
  }),
];

const citySeeds: CitySeed[] = [
  {
    slug: "amsterdam",
    name: "Amsterdam",
    latitude: 52.3676,
    longitude: 4.9041,
    weather: {
      temperatureC: 16.2,
      feelsLikeC: 15.4,
      rainMm: 0.4,
      rainProbability: 0.2,
      windSpeedKmh: 18,
      windGustKmh: 32,
      windDirection: "WSW",
      weatherCode: "partly_cloudy",
      warningLevel: "none",
    },
    air: {
      aqiValue: 42,
      aqiLabel: "Good",
      pm25: 12,
      pm10: 22,
      no2: 18,
      o3: 46,
      so2: 6,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "mock-amsterdam-water",
      stationName: "Amsterdam mock station",
      waterLevelCm: 14,
      trendLabel: "stable",
      riskLabel: "normal",
      weeklyLevelsCm: [14, 13, 14, 15, 14, 16, 15],
    },
    cycleComfortScore: 78,
    cycleComfortLabel: "good",
    bestOutdoorWindow: "10:00-16:00",
    worstOutdoorWindow: "18:00-21:00",
    briefingText:
      "Today looks comfortable for Amsterdam. The best outdoor window is 10:00-16:00. Evening conditions are less ideal because rain and gusts may increase after 18:00.",
    uiSummary: {
      bestWindow: "10:00-16:00",
      mainRisk: "Evening showers",
      changed: "Warmer than yesterday",
      outdoorWindowDetail: "Dry, brighter spells and comfortable temperatures.",
      riskDetail: "Heavier rain possible after 18:00 with gusty winds.",
      changedDetail: "Temperatures up ~3C. More sun in the first half.",
    },
    outlook: {
      hourly: [
        { h: "00", rain: 0.1, wind: 14, temp: 13 },
        { h: "03", rain: 0.1, wind: 13, temp: 12 },
        { h: "06", rain: 0, wind: 12, temp: 12 },
        { h: "09", rain: 0, wind: 15, temp: 14 },
        { h: "12", rain: 0.1, wind: 17, temp: 16 },
        { h: "15", rain: 0.2, wind: 20, temp: 17 },
        { h: "18", rain: 0.9, wind: 26, temp: 16 },
        { h: "21", rain: 1.8, wind: 30, temp: 14 },
        { h: "00", rain: 1.1, wind: 28, temp: 13 },
      ],
      weekly: [
        { day: "Mon", hi: 14, lo: 9, rain: 80 },
        { day: "Tue", hi: 15, lo: 10, rain: 40 },
        { day: "Wed", hi: 17, lo: 11, rain: 20 },
        { day: "Thu", hi: 16, lo: 11, rain: 30 },
        { day: "Fri", hi: 16, lo: 10, rain: 20 },
        { day: "Sat", hi: 13, lo: 8, rain: 70 },
        { day: "Sun", hi: 12, lo: 7, rain: 90 },
      ],
    },
  },
  {
    slug: "rotterdam",
    name: "Rotterdam",
    latitude: 51.9244,
    longitude: 4.4777,
    weather: {
      temperatureC: 15.1,
      feelsLikeC: 13.8,
      rainMm: 0.8,
      rainProbability: 0.35,
      windSpeedKmh: 24,
      windGustKmh: 41,
      windDirection: "SW",
      weatherCode: "cloudy_showers",
      warningLevel: "none",
    },
    air: {
      aqiValue: 58,
      aqiLabel: "Moderate",
      pm25: 18,
      pm10: 31,
      no2: 26,
      o3: 39,
      so2: 9,
      mainPollutant: "PM10",
      trendLabel: "stable",
    },
    water: {
      stationId: "mock-rotterdam-water",
      stationName: "Rotterdam mock station",
      waterLevelCm: 22,
      trendLabel: "rising",
      riskLabel: "elevated",
      weeklyLevelsCm: [19, 20, 21, 22, 22, 24, 23],
    },
    cycleComfortScore: 52,
    cycleComfortLabel: "fair",
    bestOutdoorWindow: "09:00-13:00",
    worstOutdoorWindow: "14:00-20:00",
    briefingText:
      "Rotterdam sees stronger winds and higher rain probability today. Morning hours are best for outdoor activities before afternoon showers develop.",
    uiSummary: {
      bestWindow: "09:00-13:00",
      mainRisk: "Afternoon showers",
      changed: "Water level rising",
      outdoorWindowDetail: "Lighter winds and drier conditions in the morning.",
      riskDetail: "Rain develops from 14:00 and may be gusty at times.",
      changedDetail: "Water level is 22 cm with a rising trend.",
    },
    outlook: {
      hourly: [
        { h: "00", rain: 0.3, wind: 20, temp: 12 },
        { h: "03", rain: 0.4, wind: 19, temp: 11 },
        { h: "06", rain: 0.2, wind: 18, temp: 11 },
        { h: "09", rain: 0.1, wind: 20, temp: 13 },
        { h: "12", rain: 0.4, wind: 24, temp: 15 },
        { h: "15", rain: 1.1, wind: 30, temp: 15 },
        { h: "18", rain: 1.6, wind: 38, temp: 14 },
        { h: "21", rain: 2.1, wind: 41, temp: 12 },
        { h: "00", rain: 1.5, wind: 35, temp: 11 },
      ],
      weekly: [
        { day: "Mon", hi: 13, lo: 8, rain: 85 },
        { day: "Tue", hi: 14, lo: 9, rain: 60 },
        { day: "Wed", hi: 16, lo: 10, rain: 35 },
        { day: "Thu", hi: 15, lo: 10, rain: 40 },
        { day: "Fri", hi: 15, lo: 9, rain: 25 },
        { day: "Sat", hi: 12, lo: 7, rain: 80 },
        { day: "Sun", hi: 11, lo: 6, rain: 95 },
      ],
    },
  },
  {
    slug: "utrecht",
    name: "Utrecht",
    latitude: 52.0907,
    longitude: 5.1214,
    weather: {
      temperatureC: 17,
      feelsLikeC: 16.2,
      rainMm: 0.1,
      rainProbability: 0.15,
      windSpeedKmh: 14,
      windGustKmh: 22,
      windDirection: "E",
      weatherCode: "mostly_sunny",
      warningLevel: "none",
    },
    air: {
      aqiValue: 36,
      aqiLabel: "Good",
      pm25: 9,
      pm10: 17,
      no2: 14,
      o3: 51,
      so2: 4,
      mainPollutant: "O3",
      trendLabel: "stable",
    },
    water: {
      stationId: "mock-utrecht-water",
      stationName: "Utrecht mock station",
      waterLevelCm: 10,
      trendLabel: "stable",
      riskLabel: "normal",
      weeklyLevelsCm: [10, 10, 11, 10, 10, 11, 10],
    },
    cycleComfortScore: 88,
    cycleComfortLabel: "excellent",
    bestOutdoorWindow: "09:00-18:00",
    worstOutdoorWindow: "19:00-22:00",
    briefingText:
      "Utrecht enjoys the best conditions in the Netherlands today. Light easterly winds and low rain probability make for an excellent outdoor day.",
    uiSummary: {
      bestWindow: "09:00-18:00",
      mainRisk: "No significant risks",
      changed: "Best cycle comfort",
      outdoorWindowDetail: "Mostly sunny with light winds, ideal all day.",
      riskDetail: "Clean air and stable water levels.",
      changedDetail: "Cycle comfort is 88/100, the strongest seeded city today.",
    },
    outlook: {
      hourly: [
        { h: "00", rain: 0, wind: 10, temp: 11 },
        { h: "03", rain: 0, wind: 9, temp: 10 },
        { h: "06", rain: 0, wind: 10, temp: 11 },
        { h: "09", rain: 0, wind: 12, temp: 14 },
        { h: "12", rain: 0, wind: 14, temp: 17 },
        { h: "15", rain: 0.1, wind: 16, temp: 18 },
        { h: "18", rain: 0.1, wind: 15, temp: 17 },
        { h: "21", rain: 0.2, wind: 14, temp: 14 },
        { h: "00", rain: 0.3, wind: 13, temp: 12 },
      ],
      weekly: [
        { day: "Mon", hi: 15, lo: 9, rain: 40 },
        { day: "Tue", hi: 16, lo: 10, rain: 20 },
        { day: "Wed", hi: 18, lo: 11, rain: 5 },
        { day: "Thu", hi: 17, lo: 11, rain: 15 },
        { day: "Fri", hi: 17, lo: 10, rain: 10 },
        { day: "Sat", hi: 14, lo: 8, rain: 50 },
        { day: "Sun", hi: 13, lo: 7, rain: 70 },
      ],
    },
  },
  ...additionalCitySeeds,
];

async function seedCity(seed: CitySeed, observedAt: Date) {
  const city = await prisma.city.upsert({
    where: { slug: seed.slug },
    update: {
      name: seed.name,
      countryCode: "NL",
      latitude: seed.latitude,
      longitude: seed.longitude,
      timezone: "Europe/Amsterdam",
      isActive: true,
    },
    create: {
      slug: seed.slug,
      name: seed.name,
      countryCode: "NL",
      latitude: seed.latitude,
      longitude: seed.longitude,
      timezone: "Europe/Amsterdam",
    },
  });

  const stateHash = `mock-${seed.slug}-v2`;
  const mockStateHashPrefix = `mock-${seed.slug}-`;

  await prisma.aiBriefing.deleteMany({
    where: { cityId: city.id, stateHash: { startsWith: mockStateHashPrefix } },
  });
  await prisma.dashboardSnapshot.deleteMany({
    where: { cityId: city.id, stateHash: { startsWith: mockStateHashPrefix } },
  });
  await prisma.weatherSnapshot.deleteMany({ where: { cityId: city.id, sourceName: "mock_knmi" } });
  await prisma.airQualitySnapshot.deleteMany({
    where: { cityId: city.id, sourceName: "mock_luchtmeetnet" },
  });
  await prisma.waterSnapshot.deleteMany({
    where: { cityId: city.id, sourceName: "mock_rijkswaterstaat" },
  });

  const weather = await prisma.weatherSnapshot.create({
    data: {
      cityId: city.id,
      observedAt,
      ...seed.weather,
      sourceName: "mock_knmi",
    },
  });

  const air = await prisma.airQualitySnapshot.create({
    data: {
      cityId: city.id,
      observedAt,
      ...seed.air,
      sourceName: "mock_luchtmeetnet",
    },
  });

  const water = await prisma.waterSnapshot.create({
    data: {
      cityId: city.id,
      observedAt,
      stationId: seed.water.stationId,
      stationName: seed.water.stationName,
      waterLevelCm: seed.water.waterLevelCm,
      trendLabel: seed.water.trendLabel,
      riskLabel: seed.water.riskLabel,
      sourceName: "mock_rijkswaterstaat",
    },
  });

  const dashboard = await prisma.dashboardSnapshot.create({
    data: {
      cityId: city.id,
      stateHash,
      weatherSnapshotId: weather.id,
      airQualitySnapshotId: air.id,
      waterSnapshotId: water.id,
      cycleComfortScore: seed.cycleComfortScore,
      cycleComfortLabel: seed.cycleComfortLabel,
      bestOutdoorWindow: seed.bestOutdoorWindow,
      worstOutdoorWindow: seed.worstOutdoorWindow,
      summaryPayload: {
        current: {
          temperature_c: seed.weather.temperatureC,
          rain_mm: seed.weather.rainMm,
          wind_speed_kmh: seed.weather.windSpeedKmh,
          wind_gust_kmh: seed.weather.windGustKmh,
          wind_direction: seed.weather.windDirection,
        },
        next_24h: {
          best_outdoor_window: seed.bestOutdoorWindow,
          worst_outdoor_window: seed.worstOutdoorWindow,
        },
        cycle_comfort: {
          score: seed.cycleComfortScore,
          category: seed.cycleComfortLabel,
        },
        air_quality: {
          category: seed.air.aqiLabel,
          main_pollutant: seed.air.mainPollutant,
          trend: seed.air.trendLabel,
        },
        water_signal: {
          station: seed.water.stationName,
          trend: seed.water.trendLabel,
          risk_label: seed.water.riskLabel,
          weekly_levels_cm: seed.water.weeklyLevelsCm,
        },
        ui_summary: {
          best_window: seed.uiSummary.bestWindow,
          main_risk: seed.uiSummary.mainRisk,
          changed: seed.uiSummary.changed,
          outdoor_window_detail: seed.uiSummary.outdoorWindowDetail,
          risk_detail: seed.uiSummary.riskDetail,
          changed_detail: seed.uiSummary.changedDetail,
        },
        outlook: seed.outlook,
      },
    },
  });

  await prisma.aiBriefing.create({
    data: {
      cityId: city.id,
      dashboardSnapshotId: dashboard.id,
      stateHash,
      modelName: "mock",
      briefingText: seed.briefingText,
      structuredBriefing: {
        main_takeaway: seed.uiSummary.changed,
        best_window: seed.uiSummary.bestWindow,
        main_risk: seed.uiSummary.mainRisk,
      },
    },
  });
}

async function main() {
  const now = new Date();

  for (const seed of citySeeds) {
    await seedCity(seed, now);
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
