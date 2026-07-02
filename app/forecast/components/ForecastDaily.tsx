import React from "react";
import type { ForecastDay } from "@/lib/types/forecast";
import {
  displayPercent,
  displayValue,
  displayWind,
  weatherConditionGlyph,
} from "../format";

type ForecastDailyProps = {
  daily: ForecastDay[];
};

function compactTemperature(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value) ? `${Math.round(value)}°` : "Unavailable";
}

function displayDailyDate(date: string) {
  const parsed = new Date(`${date}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) {
    return displayValue(date);
  }

  return new Intl.DateTimeFormat("en-NL", {
    month: "short",
    day: "numeric",
  }).format(parsed);
}

function riskBadgeVariant(label: string | null | undefined): "low" | "moderate" | "high" {
  const text = (label ?? "low").toLowerCase();
  if (text.includes("severe") || text.includes("high")) {
    return "high";
  }
  if (text.includes("moderate")) {
    return "moderate";
  }
  return "low";
}

function riskBadgeLabel(label: string | null | undefined) {
  return displayValue(label, "Low");
}

function DropletIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="forecast-day-droplet">
      <path
        d="M7 2c2.2 3 3.5 4.8 3.5 6.7A3.5 3.5 0 1 1 3.5 8.7C3.5 6.8 4.8 5 7 2z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

function WindIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="forecast-day-wind-icon">
      <path
        d="M7 2.5v9M4.5 5.5 7 2.5 9.5 5.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DailyTemperatureSparkline({
  maxC,
  minC,
}: {
  maxC: number | null | undefined;
  minC: number | null | undefined;
}) {
  const width = 88;
  const height = 28;
  const padding = 4;

  const hasMax = typeof maxC === "number" && Number.isFinite(maxC);
  const hasMin = typeof minC === "number" && Number.isFinite(minC);

  if (!hasMax && !hasMin) {
    return (
      <div className="forecast-day-sparkline forecast-day-sparkline-empty" aria-hidden="true">
        <span>Unavailable</span>
      </div>
    );
  }

  const values = [hasMax ? maxC : minC!, hasMin ? minC : maxC!];
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const range = Math.max(maxValue - minValue, 1);

  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y = height - padding - ((value - minValue) / range) * (height - padding * 2);
    return `${x},${y}`;
  });

  const label = hasMax && hasMin
    ? `Temperature from ${Math.round(minC!)} to ${Math.round(maxC!)} degrees`
    : `Temperature around ${Math.round(values[0])} degrees`;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={label}
      className="forecast-day-sparkline"
    >
      <polyline
        points={points.join(" ")}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="2 3"
      />
    </svg>
  );
}

export function ForecastDaily({ daily }: ForecastDailyProps) {
  const outlookDays = daily.slice(0, 7);

  return (
    <section className="forecast-outlook" aria-label="7-day outlook">
      <h2 className="forecast-outlook-title">7-Day Outlook</h2>
      {outlookDays.length === 0 ? (
        <p className="forecast-empty">Daily forecast data is unavailable.</p>
      ) : (
        <div className="forecast-day-scroll">
          <div className="forecast-day-grid">
            {outlookDays.map((day, index) => {
              const riskVariant = riskBadgeVariant(day.risk_label);
              const glyph = weatherConditionGlyph(day.weather_code, day.condition_label);

              return (
                <article key={`${index}-${day.date}`} className="forecast-day-card">
                  <header className="forecast-day-card-head">
                    <div>
                      <h3 className="forecast-day-label">{displayValue(day.label)}</h3>
                      <p className="forecast-day-date">{displayDailyDate(day.date)}</p>
                    </div>
                    <span className="forecast-day-condition-icon" aria-hidden="true">
                      {glyph}
                    </span>
                  </header>

                  <p className="forecast-day-temps">
                    {compactTemperature(day.temperature_max_c)} / {compactTemperature(day.temperature_min_c)}
                  </p>

                  <DailyTemperatureSparkline
                    maxC={day.temperature_max_c}
                    minC={day.temperature_min_c}
                  />

                  <div className="forecast-day-metric">
                    <DropletIcon />
                    <span>{displayPercent(day.precipitation_probability_max)}</span>
                  </div>

                  <div className="forecast-day-metric">
                    <WindIcon />
                    <span>{displayWind(day.wind_speed_max_kmh)}</span>
                  </div>

                  <span className={`forecast-day-risk-badge forecast-day-risk-${riskVariant}`}>
                    {riskBadgeLabel(day.risk_label)}
                  </span>
                </article>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
}