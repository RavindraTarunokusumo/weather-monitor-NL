/* eslint-disable @next/next/no-img-element */

import React from "react";
import type { ChartMetric, ChartView, DashboardResponse, HourlyOutlook } from "../types";

type OutlookPanelProps = {
  dashboard: DashboardResponse;
  chartView: ChartView;
  chartMetric: ChartMetric;
  onChartViewChange: (view: ChartView) => void;
  onChartMetricChange: (metric: ChartMetric) => void;
};

const metricOptions: Array<{ key: ChartMetric; label: string; color: string }> = [
  { key: "rain", label: "Rain", color: "#3b82f6" },
  { key: "temp", label: "Temp", color: "#f97316" },
  { key: "wind", label: "Wind", color: "#22c55e" },
];

const chartLabels: Record<ChartMetric, string> = {
  rain: "Rain",
  temp: "Temperature",
  wind: "Wind",
};

export function OutlookPanel({
  dashboard,
  chartView,
  chartMetric,
  onChartViewChange,
  onChartMetricChange,
}: OutlookPanelProps) {
  return (
    <section className="dashboard-card outlook-panel" aria-label="Weather outlook">
      <div className="panel-heading-row outlook-heading">
        <h2>{chartView === "7D" ? "7-day outlook" : "24-hour outlook"}</h2>
        <div className="outlook-controls">
          <div className="segmented-control metric-toggle" aria-label="Chart metric">
            {metricOptions.map((metric) => (
              <button
                key={metric.key}
                type="button"
                aria-pressed={chartMetric === metric.key}
                className={chartMetric === metric.key ? `selected ${metric.key}` : ""}
                onClick={() => onChartMetricChange(metric.key)}
              >
                {metric.label}
              </button>
            ))}
          </div>
          <div className="segmented-control view-toggle" aria-label="Chart view">
            {(["24H", "7D", "7D+"] as ChartView[]).map((view) => (
              <button
                key={view}
                type="button"
                aria-pressed={chartView === view}
                className={chartView === view ? "selected" : ""}
                onClick={() => onChartViewChange(view)}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>
      {chartView === "24H" ? (
        <HourlyMetricChart data={dashboard.outlook.hourly.slice(0, 24)} metric={chartMetric} />
      ) : null}
      {chartView === "7D" ? <WeeklyCards dashboard={dashboard} /> : null}
      {chartView === "7D+" ? (
        <div className="empty-state">Extended forecast data is unavailable in this dashboard.</div>
      ) : null}
    </section>
  );
}

function HourlyMetricChart({ data, metric }: { data: HourlyOutlook[]; metric: ChartMetric }) {
  const points = data
    .map((item, index) => ({
      h: item.h ?? `H${index.toString().padStart(2, "0")}`,
      rain: item.rain,
      temp: item.temp,
      wind: item.wind,
    }))
    .filter((item) => hasAnyMetric(item));

  if (points.length === 0) {
    return <div className="empty-state">Hourly outlook data is unavailable.</div>;
  }

  const W = 580;
  const H = 170;
  const PAD = { top: 22, right: 20, bottom: 32, left: 56 };
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const xScale = (index: number) =>
    PAD.left + (points.length === 1 ? innerW / 2 : (index / (points.length - 1)) * innerW);

  const rainValues = numericValues(points.map((item) => item.rain));
  const tempSeries = series(points, "temp");
  const windSeries = series(points, "wind");
  const rainMax = Math.max(...rainValues, 1);
  const windMax = Math.max(...windSeries.map((item) => item.value), 10);
  const [tempMin, tempMax] = extent(
    tempSeries.length > 0 ? tempSeries.map((item) => item.value) : [0],
    1,
  );

  const yWind = (value: number) => PAD.top + innerH - (value / windMax) * innerH;
  const yTemp = (value: number) =>
    PAD.top + innerH - ((value - tempMin) / (tempMax - tempMin)) * innerH;

  const linePath = (metricValues: NumericPoint[], yScale: (value: number) => number) =>
    metricValues
      .map((item, index) => `${index === 0 ? "M" : "L"} ${xScale(item.index)} ${yScale(item.value)}`)
      .join(" ");

  const areaPath = (metricValues: NumericPoint[], yScale: (value: number) => number) => {
    const top = metricValues.map((item) => `${xScale(item.index)} ${yScale(item.value)}`).join(" L ");
    return `M ${xScale(metricValues[0].index)} ${PAD.top + innerH} L ${top} L ${
      xScale(metricValues[metricValues.length - 1].index)
    } ${PAD.top + innerH} Z`;
  };

  const barWidth = Math.max(4, (innerW / points.length) * 0.55);
  const activeLabel = chartLabels[metric].toLowerCase();

  return (
    <svg
      aria-label={`24-hour ${activeLabel} chart`}
      viewBox={`0 0 ${W} ${H}`}
      className="metric-chart"
      role="img"
    >
      <defs>
        <linearGradient id="rainGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.02" />
        </linearGradient>
        <linearGradient id="windGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#22c55e" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#22c55e" stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0, 0.25, 0.5, 0.75, 1].map((tick) => {
        const y = PAD.top + innerH * (1 - tick);
        return (
          <line
            key={tick}
            x1={PAD.left}
            y1={y}
            x2={PAD.left + innerW}
            y2={y}
            className="chart-grid-line"
          />
        );
      })}

      <g className={metric === "rain" ? "chart-series active" : "chart-series"} aria-hidden={metric !== "rain"}>
        {points.map((item, index) => {
          if (typeof item.rain !== "number") {
            return null;
          }

          const value = item.rain;
          const barHeight = (value / rainMax) * innerH;
          const barY = PAD.top + innerH - barHeight;
          return (
            <g key={`${item.h}-rain`}>
              <rect
                x={xScale(index) - barWidth / 2}
                y={barY}
                width={barWidth}
                height={Math.max(barHeight, 1)}
                rx="2"
                className="rain-chart-bar"
              >
                <title>{`${item.h} - ${value.toFixed(1)} mm`}</title>
              </rect>
              <text x={xScale(index)} y={barY - 4} className="chart-value rain">
                {value.toFixed(1)}
              </text>
            </g>
          );
        })}
      </g>

      <g className={metric === "temp" ? "chart-series active" : "chart-series"} aria-hidden={metric !== "temp"}>
        {tempSeries.length > 0 ? <path d={areaPath(tempSeries, yTemp)} className="temp-chart-area" /> : null}
        {tempSeries.length > 0 ? <path d={linePath(tempSeries, yTemp)} className="temp-chart-line" /> : null}
        {tempSeries.map((item) => (
          <g key={`${item.h}-temp`}>
            <circle cx={xScale(item.index)} cy={yTemp(item.value)} r="3" className="temp-chart-dot">
              <title>{`${item.h} - ${item.value.toFixed(1)}°C`}</title>
            </circle>
            <text x={xScale(item.index)} y={yTemp(item.value) - 7} className="chart-value temp">
              {item.value.toFixed(0)}
            </text>
          </g>
        ))}
      </g>

      <g className={metric === "wind" ? "chart-series active" : "chart-series"} aria-hidden={metric !== "wind"}>
        {windSeries.length > 0 ? <path d={areaPath(windSeries, yWind)} className="wind-chart-area" /> : null}
        {windSeries.length > 0 ? <path d={linePath(windSeries, yWind)} className="wind-chart-line" /> : null}
        {windSeries.map((item) => (
          <g key={`${item.h}-wind`}>
            <circle cx={xScale(item.index)} cy={yWind(item.value)} r="3" className="wind-chart-dot">
              <title>{`${item.h} - ${Math.round(item.value)} km/h`}</title>
            </circle>
            <text x={xScale(item.index)} y={yWind(item.value) - 7} className="chart-value wind">
              {Math.round(item.value)}
            </text>
          </g>
        ))}
      </g>

      {points.map((item, index) => (
        <text key={`${item.h}-label`} x={xScale(index)} y={H - 6} className="chart-x-label">
          {item.h}
        </text>
      ))}

      <Axis metric={metric} padLeft={PAD.left} padTop={PAD.top} innerH={innerH} rainMax={rainMax} windMax={windMax} tempMin={tempMin} tempMax={tempMax} />
    </svg>
  );
}

function Axis({
  metric,
  padLeft,
  padTop,
  innerH,
  rainMax,
  windMax,
  tempMin,
  tempMax,
}: {
  metric: ChartMetric;
  padLeft: number;
  padTop: number;
  innerH: number;
  rainMax: number;
  windMax: number;
  tempMin: number;
  tempMax: number;
}) {
  const axis = {
    rain: { unit: "mm", colorClass: "rain", values: [0, rainMax / 2, rainMax] },
    temp: { unit: "°C", colorClass: "temp", values: [tempMin, tempMin + (tempMax - tempMin) / 2, tempMax] },
    wind: { unit: "km/h", colorClass: "wind", values: [0, windMax / 2, windMax] },
  }[metric];

  return (
    <g className={`chart-axis ${axis.colorClass}`}>
      <text x={padLeft - 16} y={padTop - 8} className="chart-axis-unit">
        {axis.unit}
      </text>
      {axis.values.map((value, index) => {
        const y = padTop + innerH - innerH * (index / 2);
        return (
          <text key={`${axis.unit}-${index}`} x={padLeft - 16} y={y + 3} className="chart-axis-label">
            {axis.unit === "mm" && value < 2 ? value.toFixed(1) : Math.round(value)}
          </text>
        );
      })}
    </g>
  );
}

function WeeklyCards({ dashboard }: { dashboard: DashboardResponse }) {
  const data = dashboard.outlook.weekly;
  if (data.length === 0) {
    return <div className="empty-state">7-day outlook data is unavailable.</div>;
  }

  return (
    <div className="weekly-grid">
      {data.map((item, index) => (
        <div className="weekly-day" key={`${item.day ?? "day"}-${index}`}>
          <span>{item.hi ?? "?"}°</span>
          <img src={weatherIconForRain(item.rain)} alt="" />
          <strong>{item.day ?? "--"}</strong>
          <small>{item.rain ?? "?"}%</small>
        </div>
      ))}
    </div>
  );
}

function weatherIconForRain(rain: number | null | undefined) {
  if (typeof rain === "number" && rain > 50) {
    return "/dashboard-assets/icon-rain.png";
  }
  return "/dashboard-assets/icon-temp.png";
}

type NumericPoint = {
  h: string;
  index: number;
  value: number;
};

function numericValues(input: Array<number | null | undefined>) {
  const result = input.filter((value): value is number => typeof value === "number");
  return result.length > 0 ? result : [0];
}

function series(points: Array<HourlyOutlook & { h: string }>, key: "temp" | "wind"): NumericPoint[] {
  return points.flatMap((item, index) =>
    typeof item[key] === "number" ? [{ h: item.h, index, value: item[key] }] : [],
  );
}

function extent(input: number[], padding: number): [number, number] {
  const min = Math.min(...input);
  const max = Math.max(...input);
  if (min === max) {
    return [min - padding, max + padding];
  }
  return [min - padding, max + padding];
}

function hasAnyMetric(item: HourlyOutlook) {
  return (
    typeof item.rain === "number" || typeof item.temp === "number" || typeof item.wind === "number"
  );
}
