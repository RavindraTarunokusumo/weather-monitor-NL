import React from "react";
import { fallbackLabel, formatNumber } from "../format";
import type { DashboardResponse } from "../types";

type DetailPanelsProps = {
  dashboard: DashboardResponse;
};

export function DetailPanels({ dashboard }: DetailPanelsProps) {
  const score = dashboard.cycle_comfort.score;
  const pollutants = [
    ["PM2.5", dashboard.air_quality.pollutants.pm25],
    ["PM10", dashboard.air_quality.pollutants.pm10],
    ["NO2", dashboard.air_quality.pollutants.no2],
    ["O3", dashboard.air_quality.pollutants.o3],
    ["SO2", dashboard.air_quality.pollutants.so2],
  ].filter((item): item is [string, number] => typeof item[1] === "number");

  return (
    <aside className="detail-panels" aria-label="Weather detail panels">
      <section className="dashboard-card air-panel" aria-label="Air quality details">
        <div className="panel-heading-row compact">
          <h2>Air quality <span aria-hidden="true">ⓘ</span></h2>
          <span>US AQI</span>
        </div>
        <div className="aqi-content">
          <div className="aqi-score">
            <strong>{formatNumber(dashboard.air_quality.aqi_value)}</strong>
            <span>{fallbackLabel(dashboard.air_quality.label, "AQI unavailable")}</span>
          </div>
          <div className="pollutant-grid">
            {pollutants.length > 0 ? (
              pollutants.map(([label, value]) => (
                <div key={label}>
                  <span className="pollutant-dot" aria-hidden="true" />
                  <span>{label}</span>
                  <strong>{formatNumber(value)}</strong>
                </div>
              ))
            ) : (
              <div className="empty-state">Pollutant data unavailable.</div>
            )}
          </div>
        </div>
        <p>{airQualityCopy(dashboard.air_quality.label)}</p>
      </section>

      <section className="dashboard-card cycle-panel" aria-label="Cycle comfort">
        <div className="panel-heading-row compact">
          <h2>Cycle comfort <span aria-hidden="true">ⓘ</span></h2>
        </div>
        <div className="cycle-panel-content">
          <CycleDonut score={score} />
          <div>
            <strong className="cycle-label">
              {fallbackLabel(dashboard.cycle_comfort.label, "Cycle score unavailable")}
            </strong>
            <p>{cycleCopy(score)}</p>
            <span className="cycle-status">⌘ {cycleStatus(score)}</span>
          </div>
        </div>
      </section>

      <section className="dashboard-card water-panel" aria-label="Water signal details">
        <div className="panel-heading-row compact">
          <h2>Water signal <span aria-hidden="true">ⓘ</span></h2>
          <span>⌖ Rijkswaterstaat</span>
        </div>
        <div className="water-summary">
          <strong>{fallbackLabel(dashboard.water_signal.risk_label, "Unknown")}</strong>
          <span>
            Water level:{" "}
            {typeof dashboard.water_signal.water_level_cm === "number"
              ? `${dashboard.water_signal.water_level_cm}cm`
              : "Unavailable"}
          </span>
        </div>
        <WaterSparkline levels={dashboard.water_signal.weekly_levels_cm} />
        <p>{waterCopy(dashboard.water_signal.risk_label)}</p>
      </section>
    </aside>
  );
}

function CycleDonut({ score }: { score: number | null }) {
  const circumference = 2 * Math.PI * 36;
  const numericScore = typeof score === "number" ? Math.min(Math.max(score, 0), 100) : null;
  const offset =
    numericScore === null ? circumference : circumference - (numericScore / 100) * circumference;
  return (
    <div className="cycle-content">
      <svg viewBox="0 0 92 92" aria-hidden="true">
        <circle cx="46" cy="46" r="36" className="donut-track" />
        <circle
          cx="46"
          cy="46"
          r="36"
          className="donut-value"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div>
        <strong>{typeof score === "number" ? score : "?"}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function WaterSparkline({ levels }: { levels: number[] }) {
  if (levels.length === 0) {
    return <div className="empty-state">Water trend unavailable.</div>;
  }

  const width = 260;
  const height = 62;
  const min = Math.min(...levels);
  const max = Math.max(...levels);
  const spread = max === min ? 1 : max - min;
  const points = levels.map((level, index) => {
    const x = 12 + (index / Math.max(levels.length - 1, 1)) * (width - 24);
    const y = 12 + ((max - level) / spread) * 26;
    return { x, y, level };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`).join(" ");
  const days = ["Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Mon"];

  return (
    <svg className="water-sparkline" viewBox={`0 0 ${width} ${height}`} aria-label="Water level trend">
      <path d={path} />
      {points.map((point, index) => (
        <g key={`${point.level}-${index}`}>
          <circle cx={point.x} cy={point.y} r="3" />
          <text x={point.x} y={height - 4}>
            {days[index % days.length]}
          </text>
        </g>
      ))}
    </svg>
  );
}

function airQualityCopy(label: string | null) {
  if (!label) {
    return "Air quality data unavailable.";
  }

  const normalized = label.toLowerCase();
  if (normalized === "good") {
    return "Clean air. Great for outdoor activities.";
  }
  if (normalized === "moderate" || normalized === "fair") {
    return "Moderate air quality. Sensitive groups take care.";
  }
  return `${label} air quality. Plan outdoor activity with care.`;
}

function cycleCopy(score: number | null) {
  if (typeof score !== "number") {
    return "Cycle comfort data unavailable.";
  }
  if (score >= 75) {
    return "Light wind, low rain chance and good air quality make for a comfortable ride.";
  }
  if (score >= 50) {
    return "Manageable conditions. Watch for afternoon gusts.";
  }
  return "Challenging conditions. Consider alternative transport.";
}

function cycleStatus(score: number | null) {
  if (typeof score !== "number") {
    return "No cycling score";
  }
  if (score >= 75) {
    return "Great conditions";
  }
  if (score >= 50) {
    return "Fair conditions";
  }
  return "Poor conditions";
}

function waterCopy(risk: string | null) {
  if (!risk) {
    return "Water signal data unavailable.";
  }

  const normalized = risk.toLowerCase();
  if (normalized === "normal") {
    return "No flood or high water risks in the area.";
  }
  if (["elevated", "high", "alert", "warning", "severe"].includes(normalized)) {
    return "Elevated water level - monitoring closely.";
  }
  return `Water signal is ${risk}. Monitoring continues.`;
}
