import { prisma } from "@/lib/db";
import { KnmiAdapter } from "@/lib/ingestion/knmi";
import { runIngestionJob } from "@/lib/ingestion/run";
import type { NormalizedWeatherRecord, CityConfig } from "@/lib/ingestion/base";
import type { PrismaClient } from "@prisma/client";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({ where: { slug: citySlug } });
  if (!city) {
    return Response.json({ error: "City not found", city: citySlug }, { status: 404 });
  }

  const cityConfig: CityConfig = {
    id: city.id,
    slug: city.slug,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };

  const result = await runIngestionJob({
    adapter: new KnmiAdapter(),
    city: cityConfig,
    jobType: "ingest-weather",
    store: async (records: NormalizedWeatherRecord[], cfg: CityConfig, db: PrismaClient) => {
      for (const r of records) {
        await db.weatherSnapshot.create({ data: { cityId: cfg.id, ...r } });
      }
      return { recordsStored: records.length };
    },
    prisma,
  });

  return Response.json(result, { status: result.status === "success" ? 200 : 500 });
}
