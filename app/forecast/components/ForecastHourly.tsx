"use client";

import React, { useMemo, useState } from "react";
import type { ForecastHour, ForecastSummary } from "@/lib/types/forecast";
import {
  displayPercent,
  displayTemperature,
  displayWind,
  formatHourClock,
  hourNumberFromEntry,
  parseHourRange,
  weatherConditionGlyph,
} from "../format";

type ForecastHourlyProps = {
  hourly: ForecastHour[];
  summary: ForecastSummary;
  timezone: string;
};

type HourlyMetric = "temperature" | "feels_like" | "precipitation" | "wind";

const METRICS: { id: HourlyMetric; label: string }[] = [
  { id: "temperature", label: "Temperature" },
  { id: "feels_like", label: "Feels like" },
  { id: "precipitation", label: "Precipitation" },
  { id: "wind", label: "Wind" },
];

const CANVAS_WIDTH = 640;
const PLOT_LEFT = 44;
const PLOT_RIGHT = 16;
const PLOT_TOP = 56;
const PLOT_HEIGHT = 112;
const SVG_HEIGHT = PLOT_TOP + PLOT_HEIGHT + 18;

function metricValue(hour: ForecastHour, metric: HourlyMetric): number | null {
  switch (metric) {
    case "temperature":
      return typeof hour.temperature_c === "number" && Number.isFinite(hour.temperature_c)
        ? hour.temperature_c
        : null;
    case "feels_like":
      return typeof hour.apparent_temperature_c === "number" &&
        Number.isFinite(hour.apparent_temperature_c)
        ? hour.apparent_temperature_c
        : null;
    case "precipitation":
      return typeof hour.precipitation_probability === "number" &&
        Number.isFinite(hour.precipitation_probability)
        ? hour.precipitation_probability
        : null;
    case "wind":
      return typeof hour.wind_speed_kmh === "number" && Number.isFinite(hour.wind_speed_kmh)
        ? hour.wind_speed_kmh
        : null;
    default:
      return null;
  }
}

function formatMetricValue(value: number | null, metric: HourlyMetric): string {
  if (value === null) {
    return "—";
  }

  switch (metric) {
    case "temperature":
    case "feels_like":
      return `${Math.round(value)}°`;
    case "precipitation":
      return `${Math.round(value)}%`;
    case "wind":
      return `${Math.round(value)}`;
    default:
      return String(value);
  }
}

function metricAriaLabel(metric: HourlyMetric): string {
  switch (metric) {
    case "temperature":
      return "Temperature";
    case "feels_like":
      return "Feels like";
    case "precipitation":
      return "Precipitation";
    case "wind":
      return "Wind";
    default:
      return "Hourly metric";
  }
}

function xForIndex(index: number, count: number, plotWidth: number): number {
  if (count <= 1) {
    return PLOT_LEFT;
  }

  return PLOT_LEFT + (index / (count - 1)) * plotWidth;
}

function findBandSpan(
  hours: ForecastHour[],
  range: { startHour: number; endHour: number },
  timezone: string,
): { startIndex: number; endIndex: number } | null {
  const indices: number[] = [];

  hours.forEach((hour, index) => {
    const hourNumber = hourNumberFromEntry(hour, timezone);
    if (
      hourNumber !== null &&
      hourNumber >= range.startHour &&
      hourNumber <= range.endHour
    ) {
      indices.push(index);
    }
  });

  if (indices.length === 0) {
    return null;
  }

  return { startIndex: indices[0], endIndex: indices[indices.length - 1] };
}

function HourlyChart({
  hours,
  metric,
  timezone,
  summary,
}: {
  hours: ForecastHour[];
  metric: HourlyMetric;
  timezone: string;
  summary: ForecastSummary;
}) {
  const plotWidth = CANVAS_WIDTH - PLOT_LEFT - PLOT_RIGHT;
  const tickIndices = useMemo(
    () => hours.map((_, index) => index).filter((index) => index % 3 === 0),
    [hours],
  );

  const values = hours.map((hour) => metricValue(hour, metric));
  const numericValues = values.filter((value): value is number => value !== null);

  const yScale = useMemo(() => {
    if (numericValues.length === 0) {
      return { min: 0, max: 1 };
    }

    if (metric === "precipitation") {
      return { min: 0, max: 100 };
    }

    const min = Math.min(...numericValues);
    const max = Math.max(...numericValues);
    const padding = Math.max((max - min) * 0.15, 1);
    return { min: min - padding, max: max + padding };
  }, [metric, numericValues]);

  const points = values.map((value, index) => {
    const x = xForIndex(index, hours.length, plotWidth);
    if (value === null) {
      return { x, y: PLOT_TOP + PLOT_HEIGHT, value: null };
    }

    const range = yScale.max - yScale.min || 1;
    const y = PLOT_TOP + PLOT_HEIGHT - ((value - yScale.min) / range) * PLOT_HEIGHT;
    return { x, y, value };
  });

  const polylinePoints = points
    .filter((point) => point.value !== null)
    .map((point) => `${point.x},${point.y}`)
    .join(" ");

  const firstHour = hours[0];
  const lastHour = hours[hours.length - 1];
  const chartLabel = `${metricAriaLabel(metric)} from ${formatHourClock(firstHour.starts_at, timezone)} to ${formatHourClock(lastHour.starts_at, timezone)} across ${hours.length} hours`;

  const bestRange = parseHourRange(summary.best_window);
  const worstRange = parseHourRange(summary.worst_window);
  const bestSpan = bestRange ? findBandSpan(hours, bestRange, timezone) : null;
  const worstSpan = worstRange ? findBandSpan(hours, worstRange, timezone) : null;

  const nowX = xForIndex(0, hours.length, plotWidth);
  const nowLabel = formatHourClock(firstHour.starts_at, timezone);

  return (
    <div className="forecast-hourly-chart-wrap">
      <div className="forecast-hourly-bands" aria-hidden="true">
        {bestSpan ? (
          <div
            className="forecast-hourly-band forecast-hourly-band-best"
            style={{
              left: `${(xForIndex(bestSpan.startIndex, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
              width: `${((xForIndex(bestSpan.endIndex, hours.length, plotWidth) - xForIndex(bestSpan.startIndex, hours.length, plotWidth)) / CANVAS_WIDTH) * 100}%`,
            }}
          >
            Best window
          </div>
        ) : null}
        {worstSpan ? (
          <div
            className="forecast-hourly-band forecast-hourly-band-showers"
            style={{
              left: `${(xForIndex(worstSpan.startIndex, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
              width: `${((xForIndex(worstSpan.endIndex, hours.length, plotWidth) - xForIndex(worstSpan.startIndex, hours.length, plotWidth)) / CANVAS_WIDTH) * 100}%`,
            }}
          >
            Showers likely
          </div>
        ) : null}
      </div>

      <svg
        className="forecast-hourly-chart"
        width={CANVAS_WIDTH}
        height={SVG_HEIGHT}
        viewBox={`0 0 ${CANVAS_WIDTH} ${SVG_HEIGHT}`}
        role="img"
        aria-label={chartLabel}
      >
        {tickIndices.map((index) => {
          const hour = hours[index];
          const x = xForIndex(index, hours.length, plotWidth);
          const value = values[index];
          return (
            <g key={`tick-${hour.starts_at}`}>
              <text
                x={x}
                y={14}
                className="forecast-hourly-tick-glyph"
                textAnchor="middle"
              >
                {weatherConditionGlyph(hour.weather_code, hour.condition_label)}
              </text>
              <text
                x={x}
                y={30}
                className="forecast-hourly-tick-hour"
                textAnchor="middle"
              >
                {formatHourClock(hour.starts_at, timezone)}
              </text>
              <text
                x={x}
                y={PLOT_TOP - 8}
                className="forecast-hourly-tick-value"
                textAnchor="middle"
              >
                {formatMetricValue(value, metric)}
              </text>
            </g>
          );
        })}

        {polylinePoints ? (
          <polyline
            className="forecast-hourly-line"
            points={polylinePoints}
            fill="none"
            stroke="var(--accent)"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ) : null}

        {points.map((point, index) =>
          point.value !== null ? (
            <circle
              key={`dot-${hours[index].starts_at}`}
              cx={point.x}
              cy={point.y}
              r="4"
              className="forecast-hourly-dot"
            />
          ) : null,
        )}

        <line
          x1={nowX}
          x2={nowX}
          y1={PLOT_TOP}
          y2={PLOT_TOP + PLOT_HEIGHT}
          className="forecast-hourly-now-line"
        />
        <text
          x={nowX}
          y={PLOT_TOP + PLOT_HEIGHT + 14}
          className="forecast-hourly-now-label"
          textAnchor="middle"
        >
          Now {nowLabel}
        </text>
      </svg>

      <div className="forecast-hourly-subrows">
        <div className="forecast-hourly-subrow">
          <span className="forecast-hourly-subrow-label">Feels like</span>
          <div className="forecast-hourly-subrow-track">
            {tickIndices.map((index) => (
              <span
                key={`feels-${hours[index].starts_at}`}
                className="forecast-hourly-subrow-value"
                style={{
                  left: `${(xForIndex(index, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
                }}
              >
                {displayTemperature(hours[index].apparent_temperature_c).replace("°C", "°")}
              </span>
            ))}
          </div>
        </div>

        <div className="forecast-hourly-subrow">
          <span className="forecast-hourly-subrow-label">Rain chance</span>
          <div className="forecast-hourly-subrow-track">
            {tickIndices.map((index) => (
              <span
                key={`rain-${hours[index].starts_at}`}
                className="forecast-hourly-subrow-value"
                style={{
                  left: `${(xForIndex(index, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
                }}
              >
                {displayPercent(hours[index].precipitation_probability)}
              </span>
            ))}
          </div>
          <div className="forecast-hourly-rain-bars" aria-hidden="true">
            {hours.map((hour, index) => {
              const probability = hour.precipitation_probability;
              const height =
                typeof probability === "number" && Number.isFinite(probability)
                  ? `${Math.max(probability, 4)}%`
                  : "4%";
              return (
                <span
                  key={`bar-${hour.starts_at}`}
                  className="forecast-hourly-rain-bar"
                  style={{
                    left: `${(xForIndex(index, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
                    height,
                  }}
                />
              );
            })}
          </div>
        </div>

        <div className="forecast-hourly-subrow">
          <span className="forecast-hourly-subrow-label">Wind (km/h)</span>
          <div className="forecast-hourly-subrow-track">
            {tickIndices.map((index) => (
              <span
                key={`wind-${hours[index].starts_at}`}
                className="forecast-hourly-subrow-value"
                style={{
                  left: `${(xForIndex(index, hours.length, plotWidth) / CANVAS_WIDTH) * 100}%`,
                }}
              >
                {displayWind(hours[index].wind_speed_kmh).replace(" km/h", "")}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function ForecastHourly({ hourly, summary, timezone }: ForecastHourlyProps) {
  const [activeMetric, setActiveMetric] = useState<HourlyMetric>("temperature");
  const plottedHours = hourly.slice(0, 24);

  return (
    <section className="forecast-panel forecast-hourly-panel" aria-label="Hourly signal timeline">
      <div className="forecast-hourly-header">
        <h2 className="forecast-hourly-title">Hourly signal timeline</h2>
        <div className="forecast-hourly-tabs" role="group" aria-label="Chart metric">
          {METRICS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              className={`forecast-hourly-tab${activeMetric === tab.id ? " is-active" : ""}`}
              aria-pressed={activeMetric === tab.id}
              onClick={() => setActiveMetric(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {plottedHours.length === 0 ? (
        <p className="forecast-empty">Hourly forecast data is unavailable.</p>
      ) : (
        <div className="forecast-hourly-scroll">
          <HourlyChart
            hours={plottedHours}
            metric={activeMetric}
            timezone={timezone}
            summary={summary}
          />
        </div>
      )}
    </section>
  );
}