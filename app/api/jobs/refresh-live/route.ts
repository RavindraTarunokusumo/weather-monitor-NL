import { prisma } from "@/lib/db";
import { regenerateAllDashboardSnapshots } from "@/lib/dashboard-regeneration";
import { isAuthorizedJobRequest, runAllSourcesIngestion } from "@/lib/ingestion/jobs";
import { ensureSupportedCities } from "@/lib/supported-cities";

export async function GET(request: Request) {
  return refreshLiveDashboardData(request);
}

export async function POST(request: Request) {
  return refreshLiveDashboardData(request);
}

async function refreshLiveDashboardData(request: Request) {
  if (!isAuthorizedJobRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const force = searchParams.get("force") === "true";

  try {
    const cityBootstrap = await ensureSupportedCities(prisma);
    const ingestion = await runAllSourcesIngestion({ prisma, mode: "live" });
    const regeneration = await regenerateAllDashboardSnapshots({ prisma, force });
    const status = hasFailedIngestion(ingestion) ? "failed" : "success";

    return Response.json(
      {
        status,
        mode: "live",
        cityBootstrap,
        ingestion,
        regeneration,
      },
      { status: status === "failed" ? 502 : 200 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown production refresh error";

    return Response.json({ error: message }, { status: 500 });
  }
}

function hasFailedIngestion(
  ingestion: Awaited<ReturnType<typeof runAllSourcesIngestion>>,
) {
  return ingestion.some((sourceResult) =>
    sourceResult.results.some((cityResult) => cityResult.result.status === "failed"),
  );
}
