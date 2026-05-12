/* eslint-disable @next/next/no-img-element */

import React from "react";
import { fallbackLabel, formatDateTime, formatTemperature, formatToday } from "../format";
import type { DashboardResponse } from "../types";

type BriefingHeroProps = {
  dashboard: DashboardResponse;
};

export function BriefingHero({ dashboard }: BriefingHeroProps) {
  const summaryItems = [
    {
      icon: "/dashboard-assets/icon-temp.png",
      className: "best",
      label: "Best outdoor window",
      value: fallbackLabel(dashboard.ui_summary.best_window),
      text: dashboard.ui_summary.outdoor_window_detail,
    },
    {
      icon: "/dashboard-assets/icon-warn.png",
      className: "risk",
      label: "Main risk",
      value: fallbackLabel(dashboard.ui_summary.main_risk, "No known risk"),
      text: dashboard.ui_summary.risk_detail,
    },
    {
      icon: "/dashboard-assets/icon-trend.png",
      className: "trend",
      label: "What changed",
      value: fallbackLabel(dashboard.ui_summary.changed, "No change data"),
      text: dashboard.ui_summary.changed_detail,
    },
  ];

  return (
    <section className="briefing-hero" aria-label="Today briefing">
      <div className="hero-briefing-panel">
        <p className="eyebrow orange">Today&apos;s briefing</p>
        <h1>{formatToday(dashboard.city.timezone)}</h1>
        <h2 className="sr-only">{dashboard.city.name}</h2>
        <span className="ai-badge">
          <img src="/dashboard-assets/icon-spark.png" alt="" />
          AI summary
        </span>
        <div className="summary-list">
          {summaryItems.map((item) => (
            <div className="summary-item" key={item.label}>
              <span className={`summary-icon ${item.className}`}>
                <img src={item.icon} alt="" />
              </span>
              <p>
                <strong>{item.label}:</strong> {item.value}
                {item.text ? ` - ${item.text}` : ""}
              </p>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-image-panel">
        <img
          src="/dashboard-assets/amsterdam-day.png"
          alt={`${dashboard.city.name} weather scene`}
          className="hero-image"
        />
        <aside className="current-weather-card" aria-label="Current weather summary">
          <div className="weather-card-top">
            <img src="/dashboard-assets/icon-rain.png" alt="" />
            <strong>{formatTemperature(dashboard.current.temperature_c).replace("°C", "°")}</strong>
          </div>
          <p>Feels like {formatTemperature(dashboard.current.feels_like_c).replace("°C", "°")}</p>
          <p className="condition-label">{fallbackLabel(dashboard.current.condition_label, "Condition unavailable")}</p>
          <p className="updated-line">
            <span aria-hidden="true" />
            Updated {formatDateTime(dashboard.generated_at, dashboard.city.timezone)}
          </p>
        </aside>
      </div>
    </section>
  );
}
