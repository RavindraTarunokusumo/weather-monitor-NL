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
