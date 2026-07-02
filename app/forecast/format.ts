import type { ForecastHour, ForecastSummary } from "@/lib/types/forecast";

export function displayValue(
  value: string | number | null | undefined,
  fallback = "Unavailable",
) {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export function displayTemperature(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}°C`
    : "Unavailable";
}

export function displayPercent(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}%`
    : "Unavailable";
}

export function displayMillimeters(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${value.toFixed(1)} mm`
    : "Unavailable";
}

export function displayWind(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)} km/h`
    : "Unavailable";
}

export function displayDateTime(value: string | null | undefined, timezone: string) {
  if (!value) {
    return "Unavailable";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return displayValue(value);
  }

  return new Intl.DateTimeFormat("en-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(date);
}

export function sourceLabel(source: string) {
  const labels: Record<string, string> = {
    air_quality: "Air quality",
    knmi: "KNMI",
    knmi_warnings: "KNMI warnings",
    luchtmeetnet: "Luchtmeetnet",
    open_meteo: "Open-Meteo",
    rijkswaterstaat: "Rijkswaterstaat",
    water: "Water",
    weather: "Weather",
  };

  return labels[source] ?? source.replaceAll("_", " ");
}

const HERO_IMAGE_SLUGS = new Set(["amsterdam", "rotterdam", "utrecht"]);

export function heroImageSrc(slug: string) {
  if (HERO_IMAGE_SLUGS.has(slug)) {
    return `/dashboard-assets/${slug}-day.png`;
  }

  return "/dashboard-assets/amsterdam-day.png";
}

export function maxRainChance(hourly: ForecastHour[], n = 24): number | null {
  const slice = hourly.slice(0, n);
  if (slice.length === 0) {
    return null;
  }

  let max: number | null = null;
  for (const hour of slice) {
    if (typeof hour.precipitation_probability === "number" && Number.isFinite(hour.precipitation_probability)) {
      max = max === null ? hour.precipitation_probability : Math.max(max, hour.precipitation_probability);
    }
  }

  return max;
}

export function comfortLabel(hourly: ForecastHour[]): "Good" | "Fair" | "Poor" | "Unavailable" {
  const slice = hourly.slice(0, 12);
  if (slice.length === 0) {
    return "Unavailable";
  }

  const apparentTemps = slice
    .map((hour) => hour.apparent_temperature_c)
    .filter((value): value is number => typeof value === "number" && Number.isFinite(value));

  if (apparentTemps.length === 0) {
    return "Unavailable";
  }

  let maxWind: number | null = null;
  let maxPrecip: number | null = null;

  for (const hour of slice) {
    if (typeof hour.wind_speed_kmh === "number" && Number.isFinite(hour.wind_speed_kmh)) {
      maxWind = maxWind === null ? hour.wind_speed_kmh : Math.max(maxWind, hour.wind_speed_kmh);
    }
    if (typeof hour.precipitation_probability === "number" && Number.isFinite(hour.precipitation_probability)) {
      maxPrecip = maxPrecip === null ? hour.precipitation_probability : Math.max(maxPrecip, hour.precipitation_probability);
    }
  }

  if (maxWind === null && maxPrecip === null) {
    return "Unavailable";
  }

  let exceeded = 0;
  const tempOutOfRange = apparentTemps.some((temp) => temp < 10 || temp > 26);
  if (tempOutOfRange) {
    exceeded += 1;
  }
  if (maxWind !== null && maxWind >= 30) {
    exceeded += 1;
  }
  if (maxPrecip !== null && maxPrecip >= 40) {
    exceeded += 1;
  }

  if (exceeded === 0) {
    return "Good";
  }
  if (exceeded === 1) {
    return "Fair";
  }
  return "Poor";
}

export function narrativeSentences(summary: ForecastSummary): string[] {
  const sentences: string[] = [];

  if (summary.best_window) {
    sentences.push(`Best window ${summary.best_window}.`);
  }
  if (summary.main_risk) {
    sentences.push(`Main risk: ${summary.main_risk}.`);
  }
  if (summary.next_change) {
    sentences.push(`Next change: ${summary.next_change}.`);
  }

  return sentences;
}

export function heroTemperature(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? `${Math.round(value)}°`
    : "Unavailable";
}
