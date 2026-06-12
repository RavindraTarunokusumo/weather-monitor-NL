import { buildRiskTimeline, forecastSourceLinks } from "@/lib/forecast";
import type { ForecastCity, ForecastFreshnessEntry, ForecastResponse } from "@/lib/types/forecast";

type MissingSource = "weather" | "air_quality" | "water" | "knmi_warnings" | "open_meteo";

function missingFreshness(source: MissingSource): ForecastFreshnessEntry {
  return {
    source,
    updated_at: null,
    observed_at: null,
    status: "missing",
    detail: `No ${source.replaceAll("_", " ")} data is available for this city.`,
  };
}

export function buildUnavailableForecast(city: ForecastCity): ForecastResponse {
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
