import React from "react";
import { fallbackLabel, formatNumber, formatPercent, formatTemperature } from "../format";
import type { DashboardResponse } from "../types";

type MetricStripProps = {
  dashboard: DashboardResponse;
};

export function MetricStrip({ dashboard }: MetricStripProps) {
  const metrics = [
    {
      label: "Temperature",
      icon: "/dashboard-assets/icon-temp.png",
      value: formatTemperature(dashboard.current.temperature_c),
      detail: `Feels like ${formatTemperature(dashboard.current.feels_like_c)}`,
    },
    {
      label: "Rain",
      icon: "/dashboard-assets/icon-rain.png",
      value:
        typeof dashboard.current.rain_mm === "number"
          ? `${dashboard.current.rain_mm.toFixed(1)} mm`
          : "Unavailable",
      detail: `${formatPercent(dashboard.current.rain_probability)} chance`,
    },
    {
      label: "Wind / Gusts",
      icon: "/dashboard-assets/icon-wind.png",
      value:
        typeof dashboard.current.wind_speed_kmh === "number"
          ? `${dashboard.current.wind_speed_kmh} km/h`
          : "Unavailable",
      detail:
        typeof dashboard.current.wind_gust_kmh === "number"
          ? `${fallbackLabel(dashboard.current.wind_direction)} · Gusts ${dashboard.current.wind_gust_kmh} km/h`
          : fallbackLabel(dashboard.current.wind_direction),
    },
    {
      label: "Air Quality",
      icon: "/dashboard-assets/icon-leaf.png",
      value: formatNumber(dashboard.air_quality.aqi_value),
      detail: fallbackLabel(dashboard.air_quality.label, "AQI unavailable"),
    },
    {
      label: "Water Signal",
      icon: "/dashboard-assets/icon-wave.png",
      value: fallbackLabel(dashboard.water_signal.risk_label, "Unknown"),
      detail:
        typeof dashboard.water_signal.water_level_cm === "number"
          ? `${dashboard.water_signal.water_level_cm} cm`
          : "No level data",
    },
    {
      label: "Cycle Comfort",
      icon: "/dashboard-assets/icon-trend.png",
      value:
        typeof dashboard.cycle_comfort.score === "number"
          ? `${dashboard.cycle_comfort.score}/100`
          : "Unavailable",
      detail: fallbackLabel(dashboard.cycle_comfort.label, "No score label"),
    },
  ];

  return (
    <section className="metric-strip" aria-label={`${dashboard.city.name} dashboard metrics`}>
      {metrics.map((metric) => (
        <article className="dashboard-card metric-tile" key={metric.label}>
          <div>
            <img src={metric.icon} alt="" className="metric-icon" />
          </div>
          <div>
            <h2>{metric.label}</h2>
            <p className="metric-main">{metric.value}</p>
            <p className="metric-sub">{metric.detail}</p>
          </div>
        </article>
      ))}
    </section>
  );
}
