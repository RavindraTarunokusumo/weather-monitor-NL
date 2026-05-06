import React from "react";
import type { ChartView, DashboardResponse } from "../types";

type OutlookPanelProps = {
  dashboard: DashboardResponse;
  chartView: ChartView;
  onChartViewChange: (view: ChartView) => void;
};

export function OutlookPanel({ dashboard, chartView, onChartViewChange }: OutlookPanelProps) {
  return (
    <section className="dashboard-card outlook-panel" aria-label="Weather outlook">
      <div className="panel-heading-row">
        <h2>{chartView === "7D" ? "7-day outlook" : "24-hour outlook"}</h2>
        <div className="segmented-control" aria-label="Chart view">
          {(["24H", "7D", "7D+"] as ChartView[]).map((view) => (
            <button
              key={view}
              type="button"
              className={chartView === view ? "selected" : ""}
              onClick={() => onChartViewChange(view)}
            >
              {view}
            </button>
          ))}
        </div>
      </div>
      {chartView === "24H" ? <HourlyChart dashboard={dashboard} /> : null}
      {chartView === "7D" ? <WeeklyCards dashboard={dashboard} /> : null}
      {chartView === "7D+" ? (
        <div className="empty-state">Extended forecast data is unavailable in this dashboard.</div>
      ) : null}
    </section>
  );
}

function HourlyChart({ dashboard }: { dashboard: DashboardResponse }) {
  const data = dashboard.outlook.hourly;
  if (data.length === 0) {
    return <div className="empty-state">Hourly outlook data is unavailable.</div>;
  }

  const maxRain = Math.max(...data.map((item) => item.rain ?? 0), 1);
  return (
    <div className="hourly-bars" aria-label="24-hour rain bars">
      {data.map((item, index) => (
        <div className="hourly-column" key={`${item.h}-${index}`}>
          <div
            className="rain-bar"
            style={{ height: `${Math.max(((item.rain ?? 0) / maxRain) * 120, 4)}px` }}
          />
          <span>{item.h ?? "--"}</span>
        </div>
      ))}
    </div>
  );
}

function WeeklyCards({ dashboard }: { dashboard: DashboardResponse }) {
  const data = dashboard.outlook.weekly;
  if (data.length === 0) {
    return <div className="empty-state">7-day outlook data is unavailable.</div>;
  }

  return (
    <div className="weekly-grid">
      {data.map((item) => (
        <div className="weekly-day" key={item.day}>
          <strong>{item.day ?? "--"}</strong>
          <span>
            {item.hi ?? "?"}/{item.lo ?? "?"} deg
          </span>
          <small>{item.rain ?? "?"}% rain</small>
        </div>
      ))}
    </div>
  );
}
