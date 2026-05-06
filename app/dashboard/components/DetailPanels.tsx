import React from "react";
import { fallbackLabel, formatNumber } from "../format";
import type { DashboardResponse } from "../types";

type DetailPanelsProps = {
  dashboard: DashboardResponse;
};

export function DetailPanels({ dashboard }: DetailPanelsProps) {
  const score = dashboard.cycle_comfort.score ?? 0;
  const circumference = 2 * Math.PI * 42;
  const offset = circumference - (Math.min(Math.max(score, 0), 100) / 100) * circumference;

  return (
    <div className="detail-panels">
      <section className="dashboard-card cycle-panel" aria-label="Cycle comfort">
        <h2>Cycle comfort</h2>
        <div className="cycle-content">
          <svg viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="42" className="donut-track" />
            <circle
              cx="50"
              cy="50"
              r="42"
              className="donut-value"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
            />
          </svg>
          <div>
            <strong>{typeof dashboard.cycle_comfort.score === "number" ? score : "?"}</strong>
            <span>/100</span>
          </div>
        </div>
        <p>
          {fallbackLabel(dashboard.cycle_comfort.label, "Unknown")} conditions. Best window{" "}
          {fallbackLabel(dashboard.cycle_comfort.best_outdoor_window)}.
        </p>
      </section>

      <section className="dashboard-card air-panel" aria-label="Air quality details">
        <div className="panel-heading-row">
          <h2>Air quality</h2>
          <span>US AQI</span>
        </div>
        <div className="pollutant-grid">
          {[
            ["PM2.5", dashboard.air_quality.pollutants.pm25],
            ["PM10", dashboard.air_quality.pollutants.pm10],
            ["NO2", dashboard.air_quality.pollutants.no2],
            ["O3", dashboard.air_quality.pollutants.o3],
            ["SO2", dashboard.air_quality.pollutants.so2],
          ].map(([label, value]) => (
            <div key={label}>
              <span>{label}</span>
              <strong>{formatNumber(value as number | null)}</strong>
            </div>
          ))}
        </div>
        <p>{fallbackLabel(dashboard.air_quality.label, "Air quality unavailable")} air quality.</p>
      </section>

      <section className="dashboard-card water-panel" aria-label="Water signal details">
        <h2>Water signal</h2>
        <div className="water-content">
          <img src="/dashboard-assets/icon-wave.png" alt="" />
          <div>
            <strong>{fallbackLabel(dashboard.water_signal.risk_label, "Unknown")}</strong>
            <p>
              {fallbackLabel(dashboard.water_signal.station_name, "No station")} ·{" "}
              {fallbackLabel(dashboard.water_signal.trend, "No trend")}
            </p>
          </div>
        </div>
        <div className="water-sparkline" aria-label="Water level trend">
          {dashboard.water_signal.weekly_levels_cm.length > 0
            ? dashboard.water_signal.weekly_levels_cm.map((level, index) => (
                <span
                  key={`${level}-${index}`}
                  style={{ height: `${Math.max(level * 2, 8)}px` }}
                />
              ))
            : "Water trend unavailable."}
        </div>
      </section>
    </div>
  );
}
