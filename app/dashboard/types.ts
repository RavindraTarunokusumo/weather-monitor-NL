export type CityOption = {
  slug: string;
  name: string;
  timezone: string;
};

export type HourlyOutlook = {
  h?: string;
  rain?: number;
  wind?: number;
  temp?: number;
};

export type WeeklyOutlook = {
  day?: string;
  hi?: number;
  lo?: number;
  rain?: number;
};

export type ChartView = "24H" | "7D" | "7D+";
export type ChartMetric = "rain" | "temp" | "wind";

export type DashboardResponse = {
  city: CityOption;
  generated_at: string | null;
  briefing: string | null;
  current: {
    temperature_c: number | null;
    feels_like_c: number | null;
    rain_mm: number | null;
    rain_probability: number | null;
    wind_speed_kmh: number | null;
    wind_gust_kmh: number | null;
    wind_direction: string | null;
    condition_label: string | null;
    warning_level: string | null;
  };
  cycle_comfort: {
    score: number | null;
    label: string | null;
    best_outdoor_window: string | null;
    worst_outdoor_window: string | null;
  };
  air_quality: {
    aqi_value: number | null;
    label: string | null;
    main_pollutant: string | null;
    trend: string | null;
    pollutants: {
      pm25: number | null;
      pm10: number | null;
      no2: number | null;
      o3: number | null;
      so2: number | null;
    };
  };
  water_signal: {
    station_name: string | null;
    water_level_cm: number | null;
    trend: string | null;
    risk_label: string | null;
    weekly_levels_cm: number[];
  };
  source_freshness: Array<{
    source: string;
    updated_at: string | null;
  }>;
  summary_payload: unknown;
  ui_summary: {
    best_window: string | null;
    main_risk: string | null;
    changed: string | null;
    outdoor_window_detail: string | null;
    risk_detail: string | null;
    changed_detail: string | null;
  };
  outlook: {
    hourly: HourlyOutlook[];
    weekly: WeeklyOutlook[];
  };
};
