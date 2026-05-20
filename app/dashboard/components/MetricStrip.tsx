/* eslint-disable @next/next/no-img-element */

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
      value: formatTemperatureValue(dashboard.current.temperature_c),
      unit: "°C",
      showUnit: typeof dashboard.current.temperature_c === "number",
      detail:
        typeof dashboard.current.feels_like_c === "number"
          ? `Feels like ${dashboard.current.feels_like_c.toFixed(1)}°C`
          : "Feels-like unavailable",
      compactOnMobile: true,
    },
    {
      label: "Rain",
      icon: "/dashboard-assets/icon-rain.png",
      value:
        typeof dashboard.current.rain_mm === "number"
          ? dashboard.current.rain_mm.toFixed(1)
          : "Unavailable",
      unit: "mm",
      showUnit: typeof dashboard.current.rain_mm === "number",
      detail: `${formatPercent(dashboard.current.rain_probability)} chance`,
    },
    {
      label: "Wind / Gusts",
      icon: "/dashboard-assets/icon-wind.png",
      value:
        typeof dashboard.current.wind_speed_kmh === "number"
          ? String(dashboard.current.wind_speed_kmh)
          : "Unavailable",
      unit: "km/h",
      showUnit: typeof dashboard.current.wind_speed_kmh === "number",
      detail:
        typeof dashboard.current.wind_gust_kmh === "number"
          ? `${fallbackLabel(dashboard.current.wind_direction)} · Gusts ${dashboard.current.wind_gust_kmh} km/h`
          : fallbackLabel(dashboard.current.wind_direction),
    },
    {
      label: "Air Quality",
      icon: "/dashboard-assets/icon-leaf.png",
      value: formatNumber(dashboard.air_quality.aqi_value),
      unit: "",
      detail: fallbackLabel(dashboard.air_quality.label, "AQI unavailable"),
    },
    {
      label: "Water Signal",
      icon: "/dashboard-assets/icon-wave.png",
      value: fallbackLabel(dashboard.water_signal.risk_label, "Unknown"),
      unit: "",
      detail: fallbackLabel(dashboard.water_signal.risk_label, "No level data"),
    },
    {
      label: "Cycle Comfort",
      icon: "/dashboard-assets/icon-trend.png",
      value:
        typeof dashboard.cycle_comfort.score === "number"
          ? String(dashboard.cycle_comfort.score)
          : "Unavailable",
      unit: "/100",
      showUnit: typeof dashboard.cycle_comfort.score === "number",
      detail: fallbackLabel(dashboard.cycle_comfort.label, "No score label"),
      ring: dashboard.cycle_comfort.score,
    },
  ];

  return (
    <section className="metric-strip" aria-label="Dashboard metrics">
      {metrics.map((metric) => (
        <article
          className={`dashboard-card metric-tile${metric.compactOnMobile ? " metric-tile-compact-mobile" : ""}`}
          key={metric.label}
        >
          <div className="metric-heading">
            <img src={metric.icon} alt="" className="metric-icon" />
            <h2>{metric.label}</h2>
          </div>
          <div className="metric-main">
            <span>{metric.value}</span>
            {metric.unit && metric.showUnit ? <small>{metric.unit}</small> : null}
            {typeof metric.ring === "number" ? <CycleMiniRing score={metric.ring} /> : null}
          </div>
          <p className="metric-sub">{metric.detail}</p>
        </article>
      ))}
    </section>
  );
}

function formatTemperatureValue(value: number | null) {
  return typeof value === "number" ? formatTemperature(value).replace("°C", "") : "Unavailable";
}

function CycleMiniRing({ score }: { score: number }) {
  const circumference = 2 * Math.PI * 16;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;
  return (
    <svg className="metric-ring" viewBox="0 0 40 40" aria-hidden="true">
      <circle cx="20" cy="20" r="16" className="donut-track" />
      <circle
        cx="20"
        cy="20"
        r="16"
        className="donut-value"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
      />
    </svg>
  );
}
