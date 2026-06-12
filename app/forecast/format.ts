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
