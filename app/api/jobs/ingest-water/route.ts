import { prisma } from "@/lib/db";
import {
  getIngestionMode,
  isAuthorizedJobRequest,
  isJobAuthorizationRequired,
  runAllIngestion,
  runWaterIngestion,
} from "@/lib/ingestion/jobs";

export async function POST(request: Request) {
  const { searchParams } = new URL(request.url);
  const mode = getIngestionMode(searchParams);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  if ((mode === "live" || isJobAuthorizationRequired()) && !isAuthorizedJobRequest(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result =
      searchParams.get("all") === "true"
        ? await runAllIngestion({ prisma, type: "water", mode })
        : await runWaterIngestion({ prisma, citySlug, mode });

    return Response.json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown ingestion error";
    const status = message.startsWith("City not found") ? 404 : 500;

    return Response.json({ error: message }, { status });
  }
}
