/* eslint-disable @next/next/no-img-element */

import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import {
  comfortLabel,
  displayTemperature,
  displayValue,
  heroImageSrc,
  heroTemperature,
  maxRainChance,
  narrativeSentences,
} from "../format";

type ForecastHeroProps = {
  forecast: ForecastResponse;
};

function ConditionIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
      <path
        d="M6 14a4 4 0 1 1 0-8 5 5 0 0 1 9.3 1.5A3.5 3.5 0 1 1 15 14H6z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function ComfortIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <circle cx="8" cy="8" r="7" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="5.5" cy="6.5" r="0.8" fill="currentColor" />
      <circle cx="10.5" cy="6.5" r="0.8" fill="currentColor" />
      <path
        d="M5.5 10.5c1 1.2 4 1.2 5 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function DropletIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M9 2.5c2.8 3.8 4.5 6.2 4.5 8.6A4.5 4.5 0 1 1 4.5 11.1C4.5 8.7 6.2 6.3 9 2.5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function StatIcon({ variant }: { variant: "window" | "risk" | "change" }) {
  if (variant === "window") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <circle cx="9" cy="9" r="4" fill="none" stroke="currentColor" strokeWidth="1.4" />
        <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
    );
  }

  if (variant === "risk") {
    return (
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
        <path
          d="M5 13a4 4 0 1 1 0-7 4.5 4.5 0 0 1 8.4 1.2A3 3 0 1 1 13 13H5z"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.4"
        />
      </svg>
    );
  }

  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        d="M4 9h8M9 5l4 4-4 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function RainSparkline({ hourly }: { hourly: ForecastResponse["hourly"] }) {
  const slice = hourly.slice(0, 24);
  const values = slice.map((hour) =>
    typeof hour.precipitation_probability === "number" && Number.isFinite(hour.precipitation_probability)
      ? hour.precipitation_probability
      : null,
  );
  const validValues = values.filter((value): value is number => value !== null);
  const width = 120;
  const height = 36;
  const padding = 4;

  if (validValues.length === 0) {
    return (
      <div className="forecast-hero-sparkline forecast-hero-sparkline-empty" aria-hidden="true">
        <span>Unavailable</span>
      </div>
    );
  }

  const maxValue = Math.max(...validValues, 1);
  const points = values.map((value, index) => {
    const x = padding + (index / Math.max(values.length - 1, 1)) * (width - padding * 2);
    const y =
      value === null
        ? height - padding
        : height - padding - (value / maxValue) * (height - padding * 2);
    return `${x},${y}`;
  });

  const label = `Rain chance trend over the next ${slice.length} hours, peaking at ${Math.round(
    Math.max(...validValues),
  )} percent`;

  return (
    <div className="forecast-hero-sparkline">
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={label}
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
      <div className="forecast-hero-sparkline-labels" aria-hidden="true">
        <span>00:00</span>
        <span>12:00</span>
        <span>24:00</span>
      </div>
    </div>
  );
}

export function ForecastHero({ forecast }: ForecastHeroProps) {
  const currentHour = forecast.hourly[0];
  const currentDay = forecast.daily[0];
  const comfort = comfortLabel(forecast.hourly);
  const rainChance = maxRainChance(forecast.hourly);
  const sentences = narrativeSentences(forecast.summary);

  const stats = [
    { variant: "window" as const, label: "Best window", value: displayValue(forecast.summary.best_window) },
    { variant: "risk" as const, label: "Main risk", value: displayValue(forecast.summary.main_risk) },
    { variant: "change" as const, label: "Next change", value: displayValue(forecast.summary.next_change) },
  ];

  return (
    <section className="forecast-hero" aria-labelledby="forecast-heading">
      <img
        src={heroImageSrc(forecast.city.slug)}
        alt=""
        className="forecast-hero-photo"
      />
      <div className="forecast-hero-overlay" />
      <div className="forecast-hero-content">
        <div className="forecast-hero-comfort-pill">
          <ComfortIcon />
          <span>Comfort {comfort}</span>
        </div>

        <div className="forecast-hero-main">
          <div className="forecast-hero-left">
            <h1 id="forecast-heading">Forecast intelligence for {forecast.city.name}</h1>
            <p className="forecast-hero-condition">
              <ConditionIcon />
              <span>{displayValue(forecast.summary.condition_label)}</span>
            </p>
            <div className="forecast-hero-narrative">
              {sentences.length > 0 ? (
                sentences.map((sentence) => <p key={sentence}>{sentence}</p>)
              ) : (
                <p>{displayValue(null)}</p>
              )}
            </div>
            <div className="forecast-hero-stats" aria-label="Forecast summary stats">
              {stats.map((stat) => (
                <article key={stat.label} className="forecast-hero-stat">
                  <StatIcon variant={stat.variant} />
                  <div>
                    <p className="forecast-hero-stat-eyebrow">{stat.label}</p>
                    <p className="forecast-hero-stat-value">{stat.value}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <div className="forecast-hero-right">
            <div className="forecast-hero-temp-block">
              <p className="forecast-hero-temp-current">{heroTemperature(currentHour?.temperature_c ?? null)}</p>
              <p className="forecast-hero-temp-feels">
                Feels like {heroTemperature(currentHour?.apparent_temperature_c ?? null)}
              </p>
              <p className="forecast-hero-temp-range">
                <span>↑ {displayTemperature(currentDay?.temperature_max_c ?? null).replace("°C", "°")}</span>
                <span>↓ {displayTemperature(currentDay?.temperature_min_c ?? null).replace("°C", "°")}</span>
              </p>
            </div>
            <div className="forecast-hero-rain-block">
              <DropletIcon />
              <p className="forecast-hero-rain-value">
                {rainChance === null ? "Unavailable" : `${Math.round(rainChance)}%`}
              </p>
              <p className="forecast-hero-rain-label">Rain chance</p>
              <RainSparkline hourly={forecast.hourly} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}