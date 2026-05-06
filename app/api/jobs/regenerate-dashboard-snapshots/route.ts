import { prisma } from "@/lib/db";
import {
  regenerateAllDashboardSnapshots,
  regenerateDashboardSnapshot,
} from "@/lib/dashboard-regeneration";
import { isAuthorizedJobRequest } from "@/lib/ingestion/jobs";

export async function POST(request: Request) {
  if (process.env.CRON_SECRET && !isAuthorizedJobRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";
  const force = searchParams.get("force") === "true";

  try {
    const result =
      searchParams.get("all") === "true"
        ? await regenerateAllDashboardSnapshots({ prisma, force })
        : await regenerateDashboardSnapshot({ prisma, citySlug, force });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown regeneration error";
    const status = message.startsWith("City not found") ? 404 : 500;

    return Response.json({ error: message }, { status });
  }
}
