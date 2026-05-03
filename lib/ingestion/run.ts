import type { PrismaClient } from "@prisma/client";
import type { SourceAdapter, CityConfig } from "./base";

export type IngestionResult = {
  status: "success" | "failed";
  recordsFetched: number;
  recordsStored: number;
  error?: string;
};

export async function runIngestionJob<T>(options: {
  adapter: SourceAdapter<T>;
  city: CityConfig;
  jobType: string;
  store: (records: T[], city: CityConfig, prisma: PrismaClient) => Promise<{ recordsStored: number }>;
  prisma: PrismaClient;
}): Promise<IngestionResult> {
  const { adapter, city, jobType, store, prisma } = options;

  const run = await prisma.sourceRun.create({
    data: {
      sourceName: adapter.sourceName,
      jobType,
      status: "running",
    },
  });

  let fetchedCount = 0;

  try {
    const rawRecords = await adapter.fetch(city);
    fetchedCount = rawRecords.length;
    const normalized = await adapter.normalize(rawRecords, city);
    const { recordsStored } = await store(normalized, city, prisma);

    await prisma.sourceRun.update({
      where: { id: run.id },
      data: {
        status: "success",
        finishedAt: new Date(),
        recordsFetched: rawRecords.length,
        recordsStored,
      },
    });

    return { status: "success", recordsFetched: rawRecords.length, recordsStored };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);

    try {
      await prisma.sourceRun.update({
        where: { id: run.id },
        data: {
          status: "failed",
          finishedAt: new Date(),
          errorMessage: message,
        },
      });
    } catch (updateErr) {
      console.error(
        `[ingestion] Failed to record failure state for run ${run.id}: ${String(updateErr)}`,
      );
    }

    console.error(`[ingestion] ${adapter.sourceName} failed: ${message}`);

    return { status: "failed", recordsFetched: fetchedCount, recordsStored: 0, error: message };
  }
}
