import { buildForecastResponse } from "@/lib/forecast";
import { prisma } from "@/lib/db";
import { ForecastShell } from "./components/ForecastShell";

export const dynamic = "force-dynamic";

type ForecastPageProps = {
  searchParams?: Promise<{
    city?: string | string[];
  }>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function ForecastPage({ searchParams }: ForecastPageProps) {
  const params = await searchParams;
  const citySlug = firstParam(params?.city) ?? "amsterdam";

  const selectedCity =
    (await prisma.city.findFirst({
      where: { slug: citySlug, isActive: true },
    })) ??
    (await prisma.city.findFirst({
      where: { slug: "amsterdam", isActive: true },
    }));

  const cities = await prisma.city.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
    select: {
      slug: true,
      name: true,
      timezone: true,
    },
  });

  if (!selectedCity) {
    throw new Error("No active forecast city is configured.");
  }

  const snapshot = await prisma.dashboardSnapshot.findFirst({
    where: { cityId: selectedCity.id },
    orderBy: { generatedAt: "desc" },
    include: {
      weatherSnapshot: true,
      airQualitySnapshot: true,
      waterSnapshot: true,
    },
  });

  if (!snapshot) {
    throw new Error(`No forecast snapshot is available for ${selectedCity.slug}.`);
  }

  if (cities.length === 0) {
    throw new Error("No active forecast cities are configured.");
  }

  return (
    <ForecastShell
      initialForecast={buildForecastResponse(selectedCity, snapshot)}
      initialCities={cities}
    />
  );
}
