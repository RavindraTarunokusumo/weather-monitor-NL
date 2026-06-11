export type ForecastCity = {
  slug: string;
  name: string;
  timezone: string;
};

export type ForecastSummary = {
  condition_label: string | null;
  best_window: string | null;
  worst_window: string | null;
  main_risk: string | null;
  next_change: string | null;
  warning_level: string | null;
};

export type ForecastHour = {
  starts_at: string;
  label: string;
  condition_label: string | null;
  weather_code: string | null;
  temperature_c: number | null;
  apparent_temperature_c: number | null;
  precipitation_mm: number | null;
  precipitation_probability: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  risk_label: string | null;
};

export type ForecastDay = {
  date: string;
  label: string;
  condition_label: string | null;
  weather_code: string | null;
  temperature_max_c: number | null;
  temperature_min_c: number | null;
  apparent_temperature_max_c: number | null;
  apparent_temperature_min_c: number | null;
  precipitation_sum_mm: number | null;
  precipitation_probability_max: number | null;
  wind_speed_max_kmh: number | null;
  wind_gust_max_kmh: number | null;
  risk_label: string | null;
};

export type ForecastRiskEvent = {
  starts_at: string;
  ends_at: string | null;
  severity: "info" | "watch" | "warning" | "severe";
  category: "rain" | "wind" | "temperature" | "warning" | "comfort" | "data";
  title: string;
  detail: string;
};

export type ForecastFreshnessEntry = {
  source: string;
  updated_at: string | null;
  observed_at: string | null;
  status: string;
  detail: string | null;
};

export type ForecastSourceLink = {
  label: string;
  href: string;
  source: string;
};

export type ForecastResponse = {
  city: ForecastCity;
  generated_at: string;
  summary: ForecastSummary;
  hourly: ForecastHour[];
  daily: ForecastDay[];
  risk_timeline: ForecastRiskEvent[];
  source_freshness: ForecastFreshnessEntry[];
  links: ForecastSourceLink[];
};
