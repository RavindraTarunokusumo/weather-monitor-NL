import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const amsterdam = await prisma.city.upsert({
    where: { slug: "amsterdam" },
    update: {
      name: "Amsterdam",
      countryCode: "NL",
      latitude: 52.3676,
      longitude: 4.9041,
      timezone: "Europe/Amsterdam",
      isActive: true,
    },
    create: {
      slug: "amsterdam",
      name: "Amsterdam",
      countryCode: "NL",
      latitude: 52.3676,
      longitude: 4.9041,
      timezone: "Europe/Amsterdam",
    },
  });

  await prisma.city.upsert({
    where: { slug: "utrecht" },
    update: {
      name: "Utrecht",
      countryCode: "NL",
      latitude: 52.0907,
      longitude: 5.1214,
      timezone: "Europe/Amsterdam",
      isActive: true,
    },
    create: {
      slug: "utrecht",
      name: "Utrecht",
      countryCode: "NL",
      latitude: 52.0907,
      longitude: 5.1214,
      timezone: "Europe/Amsterdam",
    },
  });

  await prisma.city.upsert({
    where: { slug: "rotterdam" },
    update: {
      name: "Rotterdam",
      countryCode: "NL",
      latitude: 51.9244,
      longitude: 4.4777,
      timezone: "Europe/Amsterdam",
      isActive: true,
    },
    create: {
      slug: "rotterdam",
      name: "Rotterdam",
      countryCode: "NL",
      latitude: 51.9244,
      longitude: 4.4777,
      timezone: "Europe/Amsterdam",
    },
  });

  const now = new Date();

  await prisma.aiBriefing.deleteMany({
    where: { cityId: amsterdam.id, stateHash: "mock-amsterdam-v1" },
  });

  await prisma.dashboardSnapshot.deleteMany({
    where: { cityId: amsterdam.id, stateHash: "mock-amsterdam-v1" },
  });

  await prisma.weatherSnapshot.deleteMany({
    where: { cityId: amsterdam.id, sourceName: "mock_knmi" },
  });

  await prisma.airQualitySnapshot.deleteMany({
    where: { cityId: amsterdam.id, sourceName: "mock_luchtmeetnet" },
  });

  await prisma.waterSnapshot.deleteMany({
    where: { cityId: amsterdam.id, sourceName: "mock_rijkswaterstaat" },
  });

  const weather = await prisma.weatherSnapshot.create({
    data: {
      cityId: amsterdam.id,
      observedAt: now,
      temperatureC: 16.2,
      feelsLikeC: 15.4,
      rainMm: 0.4,
      rainProbability: 0.2,
      windSpeedKmh: 18,
      windGustKmh: 32,
      windDirection: "WSW",
      weatherCode: "partly_cloudy",
      warningLevel: "none",
      sourceName: "mock_knmi",
    },
  });

  const air = await prisma.airQualitySnapshot.create({
    data: {
      cityId: amsterdam.id,
      observedAt: now,
      aqiValue: 42,
      aqiLabel: "Good",
      pm25: 12,
      pm10: 22,
      no2: 18,
      o3: 46,
      so2: 6,
      mainPollutant: "O3",
      trendLabel: "stable",
      sourceName: "mock_luchtmeetnet",
    },
  });

  const water = await prisma.waterSnapshot.create({
    data: {
      cityId: amsterdam.id,
      stationId: "mock-amsterdam-water",
      stationName: "Amsterdam mock station",
      observedAt: now,
      waterLevelCm: 14,
      trendLabel: "stable",
      riskLabel: "normal",
      sourceName: "mock_rijkswaterstaat",
    },
  });

  const dashboard = await prisma.dashboardSnapshot.create({
    data: {
      cityId: amsterdam.id,
      stateHash: "mock-amsterdam-v1",
      weatherSnapshotId: weather.id,
      airQualitySnapshotId: air.id,
      waterSnapshotId: water.id,
      cycleComfortScore: 78,
      cycleComfortLabel: "good",
      bestOutdoorWindow: "10:00-16:00",
      worstOutdoorWindow: "18:00-21:00",
      summaryPayload: {
        current: {
          temperature_c: 16.2,
          rain_mm: 0.4,
          wind_speed_kmh: 18,
          wind_gust_kmh: 32,
          wind_direction: "WSW",
        },
        next_24h: {
          best_outdoor_window: "10:00-16:00",
          worst_outdoor_window: "18:00-21:00",
          rainiest_window: "18:00-21:00",
          windiest_window: "15:00-19:00",
        },
        cycle_comfort: {
          score: 78,
          category: "good",
          drivers: ["low rain chance", "manageable wind", "good air quality"],
        },
        air_quality: {
          category: "good",
          main_pollutant: "O3",
          trend: "stable",
        },
        water_signal: {
          station: "Amsterdam mock station",
          trend: "stable",
          risk_label: "normal",
        },
      },
    },
  });

  await prisma.aiBriefing.create({
    data: {
      cityId: amsterdam.id,
      dashboardSnapshotId: dashboard.id,
      stateHash: "mock-amsterdam-v1",
      modelName: "mock",
      briefingText:
        "Today looks comfortable for Amsterdam. The best outdoor window is 10:00-16:00. Evening conditions are less ideal because rain and gusts may increase.",
      structuredBriefing: {
        main_takeaway: "Comfortable day, weaker evening window.",
        best_window: "10:00-16:00",
        main_risk: "Evening showers and gusts",
      },
    },
  });
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
