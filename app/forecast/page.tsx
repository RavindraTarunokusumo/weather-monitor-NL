import { buildForecastResponse, buildRiskTimeline, forecastSourceLinks } from "@/lib/forecast";
import { prisma } from "@/lib/db";
import type { ForecastCity, ForecastFreshnessEntry, ForecastResponse } from "@/lib/types/forecast";
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

function missingFreshness(
  source: "weather" | "air_quality" | "water" | "knmi_warnings" | "open_meteo",
): ForecastFreshnessEntry {
  return {
    source,
    updated_at: null,
    observed_at: null,
    status: "missing",
    detail: `No ${source.replaceAll("_", " ")} data is available for this city.`,
  };
}

function buildUnavailableForecastResponse(city: ForecastCity): ForecastResponse {
  const generatedAt = new Date().toISOString();
  const sourceFreshness = [
    missingFreshness("weather"),
    missingFreshness("air_quality"),
    missingFreshness("water"),
    missingFreshness("knmi_warnings"),
    missingFreshness("open_meteo"),
  ];

  return {
    city: {
      slug: city.slug,
      name: city.name,
      timezone: city.timezone,
    },
    generated_at: generatedAt,
    summary: {
      condition_label: null,
      best_window: null,
      worst_window: null,
      main_risk: null,
      next_change: null,
      warning_level: "unknown",
    },
    hourly: [],
    daily: [],
    risk_timeline: buildRiskTimeline({
      generatedAt,
      warningLevel: "unknown",
      hourly: [],
      sourceFreshness,
    }),
    source_freshness: sourceFreshness,
    links: forecastSourceLinks(),
  };
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

  if (cities.length === 0) {
    throw new Error("No active forecast cities are configured.");
  }

  const initialForecast = snapshot
    ? buildForecastResponse(selectedCity, snapshot)
    : buildUnavailableForecastResponse(selectedCity);

  return (
    <ForecastShell
      initialForecast={initialForecast}
      initialCities={cities}
    />
  );
}
