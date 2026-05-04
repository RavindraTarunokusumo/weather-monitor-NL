import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { LuchtmeetnetAdapter } from "@/lib/ingestion/luchtmeetnet";
import { RijkswaterstaatAdapter } from "@/lib/ingestion/rijkswaterstaat";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedWeatherRecord, NormalizedAirQualityRecord, NormalizedWaterRecord, CityConfig } from "@/lib/ingestion/base";

const VALID_TYPES = ["weather", "air-quality", "water"] as const;
type IngestType = (typeof VALID_TYPES)[number];

function parseArgs() {
  const args = process.argv.slice(2);
  const type = args[0] as IngestType | undefined;
  const cityIndex = args.indexOf("--city");
  const city = cityIndex !== -1 ? args[cityIndex + 1] : "amsterdam";
  const mock = args.includes("--mock");
  return { type, city, mock };
}

async function main() {
  // mock is accepted for forward compatibility; all adapters currently return mock data
  const { type, city: citySlug } = parseArgs();

  if (!type || !(VALID_TYPES as readonly string[]).includes(type)) {
    console.error("Usage: tsx scripts/ingest.ts <weather|air-quality|water> --city <slug> [--mock]");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  const dbCity = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!dbCity) {
    console.error(`City not found: ${citySlug}`);
    await prisma.$disconnect();
    process.exit(1);
  }

  const city: CityConfig = {
    id: dbCity.id,
    slug: dbCity.slug,
    name: dbCity.name,
    latitude: dbCity.latitude,
    longitude: dbCity.longitude,
  };

  let result;

  if (type === "weather") {
    result = await runIngestionJob({
      adapter: new KnmiAdapter(),
      city,
      jobType: "ingest-weather",
      store: async (records: NormalizedWeatherRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.weatherSnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  } else if (type === "air-quality") {
    result = await runIngestionJob({
      adapter: new LuchtmeetnetAdapter(),
      city,
      jobType: "ingest-air-quality",
      store: async (records: NormalizedAirQualityRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.airQualitySnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  } else {
    result = await runIngestionJob({
      adapter: new RijkswaterstaatAdapter(),
      city,
      jobType: "ingest-water",
      store: async (records: NormalizedWaterRecord[], cfg: CityConfig, db: PrismaClient) => {
        for (const r of records) {
          await db.waterSnapshot.create({ data: { cityId: cfg.id, ...r } });
        }
        return { recordsStored: records.length };
      },
      prisma,
    });
  }

  console.log(JSON.stringify(result, null, 2));
  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
