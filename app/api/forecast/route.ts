import { buildForecastResponse } from "@/lib/forecast";
import { prisma } from "@/lib/db";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const citySlug = searchParams.get("city") ?? "amsterdam";

  const city = await prisma.city.findUnique({
    where: { slug: citySlug },
  });

  if (!city || !city.isActive) {
    return Response.json({ error: "Unsupported city", city: citySlug }, { status: 404 });
  }

  const snapshot = await prisma.dashboardSnapshot.findFirst({
    where: { cityId: city.id },
    orderBy: { generatedAt: "desc" },
    include: {
      weatherSnapshot: true,
      airQualitySnapshot: true,
      waterSnapshot: true,
    },
  });

  if (!snapshot) {
    return Response.json(
      { error: "No forecast data available", city: citySlug },
      { status: 404 },
    );
  }

  return Response.json(buildForecastResponse(city, snapshot));
}
