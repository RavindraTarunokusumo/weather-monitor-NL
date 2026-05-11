import type { PrismaClient } from "@prisma/client";
import type {
  AdapterMode,
  CityConfig,
  NormalizedAirQualityRecord,
  NormalizedWaterRecord,
  NormalizedWeatherRecord,
  SourceAdapterOptions,
} from "./base";
import { KnmiAdapter } from "./knmi";
import { LuchtmeetnetAdapter } from "./luchtmeetnet";
import { RijkswaterstaatAdapter } from "./rijkswaterstaat";
import { runIngestionJob, type IngestionResult } from "./run";

export type IngestionType = "weather" | "air-quality" | "water";

export type CityIngestionResult = {
  city: string;
  result: IngestionResult;
};

type DbCity = {
  id: string;
  slug: string;
  name: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
};

type RunOptions = {
  prisma: PrismaClient;
  citySlug: string;
  mode: AdapterMode;
  adapterOptions?: Omit<SourceAdapterOptions, "mode">;
};

type RunAllOptions = {
  prisma: PrismaClient;
  type: IngestionType;
  mode: AdapterMode;
  adapterOptions?: Omit<SourceAdapterOptions, "mode">;
};

export type AllSourcesIngestionResult = {
  type: IngestionType;
  results: CityIngestionResult[];
};

export function getIngestionMode(searchParams: URLSearchParams): AdapterMode {
  if (searchParams.get("mode") === "live" || searchParams.get("live") === "true") {
    return "live";
  }

  return "mock";
}

export function isAuthorizedJobRequest(request: Request): boolean {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    return false;
  }

  const header = request.headers.get("authorization");

  return header === `Bearer ${secret}`;
}

export function isJobAuthorizationRequired(
  env: {
    CRON_SECRET?: string;
    NODE_ENV?: string;
    VERCEL_ENV?: string;
    [key: string]: string | undefined;
  } = process.env,
): boolean {
  return Boolean(
    env.CRON_SECRET ||
      env.VERCEL_ENV === "production" ||
      env.NODE_ENV === "production",
  );
}

export async function runWeatherIngestion(options: RunOptions): Promise<CityIngestionResult> {
  const city = await getActiveCity(options.prisma, options.citySlug);
  const result = await runIngestionJob({
    adapter: new KnmiAdapter({ ...options.adapterOptions, mode: options.mode }),
    city,
    jobType: "ingest-weather",
    store: async (records: NormalizedWeatherRecord[], cfg, db) => {
      for (const record of records) {
        await db.weatherSnapshot.create({ data: { cityId: cfg.id, ...record } });
      }

      return { recordsStored: records.length };
    },
    prisma: options.prisma,
  });

  return { city: city.slug, result };
}

export async function runAirQualityIngestion(options: RunOptions): Promise<CityIngestionResult> {
  const city = await getActiveCity(options.prisma, options.citySlug);
  const result = await runIngestionJob({
    adapter: new LuchtmeetnetAdapter({ ...options.adapterOptions, mode: options.mode }),
    city,
    jobType: "ingest-air-quality",
    store: async (records: NormalizedAirQualityRecord[], cfg, db) => {
      for (const record of records) {
        await db.airQualitySnapshot.create({ data: { cityId: cfg.id, ...record } });
      }

      return { recordsStored: records.length };
    },
    prisma: options.prisma,
  });

  return { city: city.slug, result };
}

export async function runWaterIngestion(options: RunOptions): Promise<CityIngestionResult> {
  const city = await getActiveCity(options.prisma, options.citySlug);
  const result = await runIngestionJob({
    adapter: new RijkswaterstaatAdapter({ ...options.adapterOptions, mode: options.mode }),
    city,
    jobType: "ingest-water",
    store: async (records: NormalizedWaterRecord[], cfg, db) => {
      for (const record of records) {
        await db.waterSnapshot.create({ data: { cityId: cfg.id, ...record } });
      }

      return { recordsStored: records.length };
    },
    prisma: options.prisma,
  });

  return { city: city.slug, result };
}

export async function runAllIngestion(options: RunAllOptions): Promise<CityIngestionResult[]> {
  const cities = await options.prisma.city.findMany({
    where: { isActive: true },
    orderBy: { slug: "asc" },
  });
  const results: CityIngestionResult[] = [];

  for (const city of cities) {
    results.push(
      await runIngestionForType({
        prisma: options.prisma,
        type: options.type,
        citySlug: city.slug,
        mode: options.mode,
        adapterOptions: options.adapterOptions,
      }),
    );
  }

  return results;
}

export async function runAllSourcesIngestion(options: {
  prisma: PrismaClient;
  mode: AdapterMode;
  adapterOptions?: Omit<SourceAdapterOptions, "mode">;
}): Promise<AllSourcesIngestionResult[]> {
  const types: IngestionType[] = ["weather", "air-quality", "water"];
  const results: AllSourcesIngestionResult[] = [];

  for (const type of types) {
    results.push({
      type,
      results: await runAllIngestion({
        prisma: options.prisma,
        type,
        mode: options.mode,
        adapterOptions: options.adapterOptions,
      }),
    });
  }

  return results;
}

export async function runIngestionForType(options: RunOptions & { type: IngestionType }) {
  if (options.type === "weather") {
    return runWeatherIngestion(options);
  }

  if (options.type === "air-quality") {
    return runAirQualityIngestion(options);
  }

  return runWaterIngestion(options);
}

async function getActiveCity(prisma: PrismaClient, citySlug: string): Promise<CityConfig> {
  const city = (await prisma.city.findUnique({
    where: { slug: citySlug },
  })) as DbCity | null;

  if (!city || !city.isActive) {
    throw new Error(`City not found or inactive: ${citySlug}`);
  }

  return {
    id: city.id,
    slug: city.slug,
    name: city.name,
    latitude: city.latitude,
    longitude: city.longitude,
  };
}
