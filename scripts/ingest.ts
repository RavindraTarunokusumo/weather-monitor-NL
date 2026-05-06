import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { PrismaClient } from "@prisma/client";
import {
  regenerateAllDashboardSnapshots,
  regenerateDashboardSnapshot,
} from "@/lib/dashboard-regeneration";
import {
  runAllSourcesIngestion,
  runAllIngestion,
  runIngestionForType,
  type IngestionType,
} from "@/lib/ingestion/jobs";
import type { AdapterMode } from "@/lib/ingestion/base";

const VALID_TYPES = ["weather", "air-quality", "water", "all", "dashboard"] as const;

function parseArgs() {
  const args = process.argv.slice(2);
  const type = args[0] as IngestionType | "all" | "dashboard" | undefined;
  const cityIndex = args.indexOf("--city");
  const city = cityIndex !== -1 ? args[cityIndex + 1] : "amsterdam";
  const all = args.includes("--all");
  const mode: AdapterMode = args.includes("--live") ? "live" : "mock";

  return { type, city, all, mode };
}

async function main() {
  const { type, city: citySlug, all, mode } = parseArgs();

  if (!type || !(VALID_TYPES as readonly string[]).includes(type)) {
    console.error("Usage: tsx scripts/ingest.ts <weather|air-quality|water|all|dashboard> [--city <slug>|--all] [--mock|--live]");
    process.exit(1);
  }

  const prisma = new PrismaClient();

  try {
    const result =
      type === "dashboard"
        ? all
          ? await regenerateAllDashboardSnapshots({ prisma })
          : await regenerateDashboardSnapshot({ prisma, citySlug })
        : type === "all"
          ? await runAllSourcesIngestion({ prisma, mode })
        : all
          ? await runAllIngestion({ prisma, type, mode })
          : await runIngestionForType({ prisma, type, citySlug, mode });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
