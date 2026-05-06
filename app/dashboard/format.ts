export function fallbackLabel(value: string | number | null | undefined, fallback = "Unavailable") {
  return value === null || value === undefined || value === "" ? fallback : String(value);
}

export function formatNumber(value: number | null | undefined, digits = 0) {
  return typeof value === "number" ? value.toFixed(digits) : "Unavailable";
}

export function formatTemperature(value: number | null | undefined) {
  return typeof value === "number" ? `${value.toFixed(1)} deg` : "Unavailable";
}

export function formatPercent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : "Unavailable";
}

export function formatDateTime(value: string | null | undefined, timezone = "Europe/Amsterdam") {
  if (!value) {
    return "Unavailable";
  }

  return new Intl.DateTimeFormat("en-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: timezone,
  }).format(new Date(value));
}

export function formatToday(timezone = "Europe/Amsterdam") {
  return new Intl.DateTimeFormat("en-NL", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: timezone,
  }).format(new Date());
}
