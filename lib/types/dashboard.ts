export type DashboardCity = {
  slug: string;
  name: string;
  timezone: string;
};

export type DashboardCurrent = {
  temperature_c: number | null;
  feels_like_c: number | null;
  rain_mm: number | null;
  rain_probability: number | null;
  wind_speed_kmh: number | null;
  wind_gust_kmh: number | null;
  wind_direction: string | null;
  condition_label?: string | null;
  warning_level: string | null;
};

export type DashboardCycleComfort = {
  score: number | null;
  label: string | null;
  best_outdoor_window: string | null;
  worst_outdoor_window: string | null;
};

export type DashboardAirQuality = {
  aqi_value: number | null;
  label: string | null;
  main_pollutant: string | null;
  trend: string | null;
  pollutants?: {
    pm25: number | null;
    pm10: number | null;
    no2: number | null;
    o3: number | null;
    so2: number | null;
  };
};

export type DashboardWaterSignal = {
  station_name: string | null;
  water_level_cm: number | null;
  trend: string | null;
  risk_label: string | null;
  weekly_levels_cm?: number[];
};

export type DashboardFreshnessEntry = {
  source: string;
  updated_at: string | null;
  observed_at: string | null;
  status: string;
  detail: string | null;
};

export type DashboardResponse = {
  city: DashboardCity;
  generated_at: string;
  briefing: string | null;
  current: DashboardCurrent;
  cycle_comfort: DashboardCycleComfort;
  air_quality: DashboardAirQuality;
  water_signal: DashboardWaterSignal;
  source_freshness: DashboardFreshnessEntry[];
  summary_payload: unknown;
  ui_summary?: {
    best_window: string | null;
    main_risk: string | null;
    changed: string | null;
    outdoor_window_detail: string | null;
    risk_detail: string | null;
    changed_detail: string | null;
  };
  outlook?: {
    hourly: Array<Record<string, unknown>>;
    weekly: Array<Record<string, unknown>>;
  };
};

export type CityListEntry = {
  slug: string;
  name: string;
};
