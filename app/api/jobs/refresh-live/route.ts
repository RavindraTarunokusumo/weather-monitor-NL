import { prisma } from "@/lib/db";
import { regenerateAllDashboardSnapshots } from "@/lib/dashboard-regeneration";
import { isAuthorizedJobRequest, runAllSourcesIngestion } from "@/lib/ingestion/jobs";

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
    const ingestion = await runAllSourcesIngestion({ prisma, mode: "live" });
    const regeneration = await regenerateAllDashboardSnapshots({ prisma, force });

    return Response.json({
      mode: "live",
      ingestion,
      regeneration,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown production refresh error";

    return Response.json({ error: message }, { status: 500 });
  }
}
