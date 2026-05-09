import React from "react";
import { fallbackLabel, formatDateTime, formatTemperature, formatToday } from "../format";
import type { DashboardResponse } from "../types";

type BriefingHeroProps = {
  dashboard: DashboardResponse;
};

export function BriefingHero({ dashboard }: BriefingHeroProps) {
  const summaryItems = [
    {
      icon: "/dashboard-assets/icon-spark.png",
      title: `Best outdoor window: ${fallbackLabel(dashboard.ui_summary.best_window)}`,
      text: dashboard.ui_summary.outdoor_window_detail,
    },
    {
      icon: "/dashboard-assets/icon-warn.png",
      title: `Main risk: ${fallbackLabel(dashboard.ui_summary.main_risk, "No known risk")}`,
      text: dashboard.ui_summary.risk_detail,
    },
    {
      icon: "/dashboard-assets/icon-trend.png",
      title: `What changed: ${fallbackLabel(dashboard.ui_summary.changed, "No change data")}`,
      text: dashboard.ui_summary.changed_detail,
    },
  ];

  return (
    <section className="briefing-hero" aria-label="Today briefing">
      <div className="hero-briefing-panel">
        <p className="eyebrow orange">Today&apos;s briefing</p>
        <h1>{dashboard.city.name}</h1>
        <p className="hero-date">{formatToday(dashboard.city.timezone)}</p>
        <span className="ai-badge">AI summary</span>
        <div className="summary-list">
          {summaryItems.map((item) => (
            <div className="summary-item" key={item.title}>
              <img src={item.icon} alt="" />
              <div>
                <strong>{item.title}</strong>
                <p>{item.text ?? "Unavailable in the current dashboard data."}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="hero-image-panel">
        <img
          src="/dashboard-assets/amsterdam-day.png"
          alt="Amsterdam canal houses on a bright day"
          className="hero-image"
        />
        <aside className="current-weather-card" aria-label="Current weather summary">
          <div className="weather-card-top">
            <img src="/dashboard-assets/icon-rain.png" alt="" />
            <strong>{formatTemperature(dashboard.current.temperature_c)}</strong>
          </div>
          <p>Feels like {formatTemperature(dashboard.current.feels_like_c)}</p>
          <p>{fallbackLabel(dashboard.current.condition_label, "Condition unavailable")}</p>
          <p className="updated-line">Updated {formatDateTime(dashboard.generated_at)}</p>
        </aside>
      </div>
    </section>
  );
}
