export function formatDate(value: string | null): string {
  if (!value) return "Unavailable";
  return new Intl.DateTimeFormat("nl-NL", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Europe/Amsterdam",
  }).format(new Date(value));
}

export function formatTemp(value: number | null): string {
  if (value === null) return "—";
  return `${value}°C`;
}

export function formatFeelsLike(value: number | null): string {
  if (value === null) return "—";
  return `Feels like ${value}°C`;
}

export function formatWind(speed: number | null, direction: string | null): string {
  if (speed === null) return "—";
  return direction ? `${speed} km/h ${direction}` : `${speed} km/h`;
}

export function formatPercent(value: number | null): string {
  if (value === null) return "—";
  return `${Math.round(value * 100)}% rain chance`;
}

export function formatAqi(value: number | null, label: string | null): string {
  if (value === null) return "—";
  return label ? `${value} – ${label}` : `${value}`;
}

export function formatWaterLevel(value: number | null): string {
  if (value === null) return "—";
  return `${value} cm`;
}

export function riskColor(riskLabel: string | null): string {
  if (!riskLabel) return "text-gray-400";
  const lower = riskLabel.toLowerCase();
  if (lower.includes("high") || lower.includes("danger")) return "text-red-600";
  if (lower.includes("elevated") || lower.includes("warning") || lower.includes("orange")) return "text-orange-600";
  if (lower.includes("normal") || lower.includes("low") || lower.includes("good")) return "text-emerald-600";
  return "text-gray-500";
}
