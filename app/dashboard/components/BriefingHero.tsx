/* eslint-disable @next/next/no-img-element */

import React from "react";
import { fallbackLabel, formatDateTime, formatTemperature, formatToday } from "../format";
import type { DashboardResponse } from "../types";
import { BriefingCollapsiblePanel } from "./BriefingCollapsiblePanel";

type BriefingHeroProps = {
  dashboard: DashboardResponse;
};

export type BriefingItem = {
  dotColor: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string | null;
};

export function BriefingHero({ dashboard }: BriefingHeroProps) {
  const date = formatToday(dashboard.city.timezone);
  const summaryItems: BriefingItem[] = [
    {
      dotColor: "#5eead4",
      icon: <OutdoorWindowIcon />,
      label: "Best outdoor window",
      value: fallbackLabel(dashboard.ui_summary.best_window),
      detail: dashboard.ui_summary.outdoor_window_detail,
    },
    {
      dotColor: "#fb923c",
      icon: <RiskIcon />,
      label: "Main risk",
      value: fallbackLabel(dashboard.ui_summary.main_risk, "No known risk"),
      detail: dashboard.ui_summary.risk_detail,
    },
    {
      dotColor: "#60a5fa",
      icon: <TrendIcon />,
      label: "What changed",
      value: fallbackLabel(dashboard.ui_summary.changed, "No change data"),
      detail: dashboard.ui_summary.changed_detail,
    },
  ];

  return (
    <section className="briefing-hero" aria-label="Today briefing">
      <img
        src="/dashboard-assets/amsterdam-day.png"
        alt={`${dashboard.city.name} weather scene`}
        className="hero-image"
      />
      <h2 className="sr-only">{dashboard.city.name}</h2>
      <BriefingCollapsiblePanel date={date} items={summaryItems} />
      <div className="briefing-static">
        <p className="eyebrow orange">Today&apos;s briefing</p>
        <h1>{date}</h1>
        <span className="ai-badge">
          <img src="/dashboard-assets/icon-spark.png" alt="" />
          AI summary
        </span>
        <SummaryList items={summaryItems} />
      </div>
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
    </section>
  );
}

function SummaryList({ items }: { items: BriefingItem[] }) {
  return (
    <div className="summary-list">
      {items.map((item) => (
        <div className="summary-item" key={item.label} style={{ "--briefing-dot-color": item.dotColor } as React.CSSProperties}>
          <span className="summary-icon" aria-hidden="true">
            {item.icon}
          </span>
          <p>
            <strong>{item.label}:</strong> {item.value}
            {item.detail ? ` - ${item.detail}` : ""}
          </p>
        </div>
      ))}
    </div>
  );
}

function OutdoorWindowIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 4v2.4M12 17.6V20M4 12h2.4M17.6 12H20M6.4 6.4l1.7 1.7M15.9 15.9l1.7 1.7M17.6 6.4l-1.7 1.7M8.1 15.9l-1.7 1.7" />
      <circle cx="12" cy="12" r="3.7" />
    </svg>
  );
}

function RiskIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M12 4.2 3.8 18.5h16.4L12 4.2Z" />
      <path d="M12 9v4" />
      <path d="M12 16.6h.01" />
    </svg>
  );
}

function TrendIcon() {
  return (
    <svg viewBox="0 0 24 24" focusable="false">
      <path d="M4 16.5 9 11l3.6 3.2L20 6.5" />
      <path d="M15 6.5h5v5" />
    </svg>
  );
}
