import type { ForecastHour, ForecastRiskEvent, ForecastSummary } from "@/lib/types/forecast";

export type RadarScores = {
  rain: number;
  wind: number;
  gusts: number;
  comfort: number;
  visibility: number;
  thunder: number;
};

const RADAR_DEFAULT_SCORE = 10;

function severityToRadarScore(severity: ForecastRiskEvent["severity"]): number {
  switch (severity) {
    case "info":
      return 25;
    case "watch":
      return 50;
    case "warning":
      return 75;
    case "severe":
      return 100;
    default:
      return RADAR_DEFAULT_SCORE;
  }
}

export type ComfortLabel = "Good" | "Fair" | "Poor" | "Unavailable";

function comfortLabelToRadarScore(label: ComfortLabel): number {
  switch (label) {
    case "Good":
      return 20;
    case "Fair":
      return 50;
    case "Poor":
      return 80;
    case "Unavailable":
    default:
      return RADAR_DEFAULT_SCORE;
  }
}

function maxNumericValue(
  hourly: ForecastHour[],
  n: number,
  read: (hour: ForecastHour) => number | null,
): number | null {
  const slice = hourly.slice(0, n);
  if (slice.length === 0) {
    return null;
  }

  let max: number | null = null;
  for (const hour of slice) {
    const value = read(hour);
    if (typeof value === "number" && Number.isFinite(value)) {
      max = max === null ? value : Math.max(max, value);
    }
  }

  return max;
}

function radarScoreFromTimeline(
  events: ForecastRiskEvent[],
  category: ForecastRiskEvent["category"] | "visibility" | "thunder",
): number {
  const matches = events.filter((event) => event.category === category);
  if (matches.length === 0) {
    return RADAR_DEFAULT_SCORE;
  }

  return Math.max(...matches.map((event) => severityToRadarScore(event.severity)));
}

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

export function comfortLabel(hourly: ForecastHour[]): ComfortLabel {
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

export function radarScores(
  hourly: ForecastHour[],
  riskTimeline: ForecastRiskEvent[],
  comfort: ComfortLabel,
): RadarScores {
  const rainMax = maxNumericValue(hourly, 24, (hour) => hour.precipitation_probability);
  const windMax = maxNumericValue(hourly, 24, (hour) => hour.wind_speed_kmh);
  const gustMax = maxNumericValue(hourly, 24, (hour) => hour.wind_gust_kmh);

  return {
    rain: rainMax === null ? RADAR_DEFAULT_SCORE : rainMax,
    wind: windMax === null ? RADAR_DEFAULT_SCORE : Math.min(100, windMax * 2),
    gusts: gustMax === null ? RADAR_DEFAULT_SCORE : Math.min(100, gustMax * 1.5),
    comfort: comfortLabelToRadarScore(comfort),
    visibility: radarScoreFromTimeline(riskTimeline, "visibility"),
    thunder: radarScoreFromTimeline(riskTimeline, "thunder"),
  };
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

export function parseHourRange(
  value: string | null | undefined,
): { startHour: number; endHour: number } | null {
  if (!value || typeof value !== "string") {
    return null;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*-\s*(\d{1,2}):(\d{2})$/);
  if (!match) {
    return null;
  }

  const startHour = Number.parseInt(match[1], 10);
  const startMinute = Number.parseInt(match[2], 10);
  const endHour = Number.parseInt(match[3], 10);
  const endMinute = Number.parseInt(match[4], 10);

  if (
    !Number.isInteger(startHour) ||
    !Number.isInteger(startMinute) ||
    !Number.isInteger(endHour) ||
    !Number.isInteger(endMinute) ||
    startHour < 0 ||
    startHour > 23 ||
    endHour < 0 ||
    endHour > 23 ||
    startMinute < 0 ||
    startMinute > 59 ||
    endMinute < 0 ||
    endMinute > 59
  ) {
    return null;
  }

  return { startHour, endHour };
}

export function formatHourClock(value: string, timezone: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: timezone,
  }).format(date);
}

export function hourNumberFromEntry(hour: ForecastHour, timezone: string): number | null {
  const date = new Date(hour.starts_at);
  if (!Number.isNaN(date.getTime())) {
    const parts = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: timezone,
    }).formatToParts(date);
    const hourPart = parts.find((part) => part.type === "hour");
    if (hourPart) {
      const parsed = Number.parseInt(hourPart.value, 10);
      if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 23) {
        return parsed;
      }
    }
  }

  const labelMatch = hour.label.trim().match(/^(\d{1,2})$/);
  if (labelMatch) {
    const parsed = Number.parseInt(labelMatch[1], 10);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed <= 23) {
      return parsed;
    }
  }

  return null;
}

export function weatherConditionGlyph(
  weatherCode: string | null | undefined,
  conditionLabel: string | null | undefined,
): string {
  const code = (weatherCode ?? "").toLowerCase();
  if (code.includes("clear") || code.includes("sunny")) {
    return "☀";
  }
  if (code.includes("partly")) {
    return "⛅";
  }
  if (code.includes("cloud") || code.includes("overcast")) {
    return "☁";
  }
  if (code.includes("shower") || code.includes("rain") || code.includes("drizzle")) {
    return "🌧";
  }
  if (code.includes("thunder") || code.includes("storm")) {
    return "⛈";
  }
  if (code.includes("fog") || code.includes("mist")) {
    return "🌫";
  }
  if (code.includes("wind")) {
    return "💨";
  }

  const label = (conditionLabel ?? "").toLowerCase();
  if (label.includes("sun") || label.includes("clear")) {
    return "☀";
  }
  if (label.includes("partly")) {
    return "⛅";
  }
  if (label.includes("cloud")) {
    return "☁";
  }
  if (label.includes("shower") || label.includes("rain")) {
    return "🌧";
  }
  if (label.includes("thunder") || label.includes("storm")) {
    return "⛈";
  }
  if (label.includes("fog") || label.includes("mist")) {
    return "🌫";
  }
  if (label.includes("wind")) {
    return "💨";
  }

  return "·";
}
