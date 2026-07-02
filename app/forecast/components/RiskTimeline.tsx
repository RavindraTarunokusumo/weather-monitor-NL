"use client";

import React, { useMemo, useState } from "react";
import type { ForecastHour, ForecastRiskEvent } from "@/lib/types/forecast";
import {
  comfortLabel,
  formatHourClock,
  radarScores,
  severityToScore,
  type RadarScores,
} from "../format";

type RiskTimelineProps = {
  hourly: ForecastHour[];
  risk_timeline: ForecastRiskEvent[];
  timezone: string;
};

type RiskRow = {
  key: string;
  icon: string;
  name: string;
  severityWord: string;
  timeRange: string;
  score: number;
  barTone: "blue" | "orange" | "green";
  derived?: boolean;
};

const RADAR_AXES: { key: keyof RadarScores; label: string }[] = [
  { key: "rain", label: "Rain" },
  { key: "wind", label: "Wind" },
  { key: "gusts", label: "Gusts" },
  { key: "comfort", label: "Comfort" },
  { key: "visibility", label: "Visibility" },
  { key: "thunder", label: "Thunder" },
];

const SEVERITY_WORDS: Record<ForecastRiskEvent["severity"], string> = {
  info: "Info",
  watch: "Watch",
  warning: "Warning",
  severe: "Severe",
};

function categoryIcon(category: ForecastRiskEvent["category"]): string {
  switch (category) {
    case "rain":
      return "🌧";
    case "wind":
      return "💨";
    case "temperature":
      return "🌡";
    case "warning":
      return "⚠";
    case "comfort":
      return "😊";
    case "data":
      return "📡";
    default:
      return "·";
  }
}

function barToneForCategory(category: ForecastRiskEvent["category"]): RiskRow["barTone"] {
  switch (category) {
    case "rain":
    case "wind":
      return "blue";
    case "temperature":
      return "orange";
    case "comfort":
      return "green";
    default:
      return "blue";
  }
}

function scoreToSeverityWord(score: number): string {
  if (score >= 76) {
    return "Severe";
  }
  if (score >= 51) {
    return "Warning";
  }
  if (score >= 26) {
    return "Watch";
  }
  if (score > 10) {
    return "Info";
  }
  return "Low";
}

function comfortSeverityWord(label: ReturnType<typeof comfortLabel>): string {
  switch (label) {
    case "Good":
      return "Low";
    case "Fair":
      return "Moderate";
    case "Poor":
      return "High";
    case "Unavailable":
    default:
      return "Unavailable";
  }
}

function formatEventTimeRange(
  startsAt: string,
  endsAt: string | null,
  timezone: string,
): string {
  const start = formatHourClock(startsAt, timezone);
  if (!endsAt) {
    return start;
  }
  return `${start} – ${formatHourClock(endsAt, timezone)}`;
}

function buildTimelineRows(events: ForecastRiskEvent[], timezone: string): RiskRow[] {
  return events.map((event, index) => ({
    key: `${event.starts_at}-${event.category}-${index}`,
    icon: categoryIcon(event.category),
    name: event.title,
    severityWord: SEVERITY_WORDS[event.severity],
    timeRange: formatEventTimeRange(event.starts_at, event.ends_at, timezone),
    score: severityToScore(event.severity),
    barTone: barToneForCategory(event.category),
  }));
}

function buildDerivedRows(
  comfort: ReturnType<typeof comfortLabel>,
  scores: RadarScores,
): RiskRow[] {
  return [
    {
      key: "derived-comfort",
      icon: "😊",
      name: "Comfort",
      severityWord: comfortSeverityWord(comfort),
      timeRange: "Next 12h · derived signal",
      score: scores.comfort,
      barTone: "green",
      derived: true,
    },
    {
      key: "derived-visibility",
      icon: "👁",
      name: "Visibility",
      severityWord: scoreToSeverityWord(scores.visibility),
      timeRange: "Derived signal",
      score: scores.visibility,
      barTone: "green",
      derived: true,
    },
  ];
}

function radarAriaLabel(scores: RadarScores): string {
  return `Risk radar derived signals: Rain ${scores.rain}, Wind ${scores.wind}, Gusts ${scores.gusts}, Comfort ${scores.comfort}, Visibility ${scores.visibility}, Thunder ${scores.thunder}.`;
}

function radarPoint(
  index: number,
  score: number,
  cx: number,
  cy: number,
  maxRadius: number,
): { x: number; y: number } {
  const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / RADAR_AXES.length;
  const radius = (score / 100) * maxRadius;
  return {
    x: cx + radius * Math.cos(angle),
    y: cy + radius * Math.sin(angle),
  };
}

function IntensityBar({ score, tone }: { score: number; tone: RiskRow["barTone"] }) {
  const filled = Math.min(10, Math.max(0, Math.round(score / 10)));

  return (
    <div
      className={`forecast-risk-intensity forecast-risk-intensity-${tone}`}
      role="img"
      aria-label={`Intensity ${filled} of 10`}
    >
      {Array.from({ length: 10 }, (_, index) => (
        <span
          key={index}
          className={`forecast-risk-intensity-segment${index < filled ? " is-filled" : ""}`}
        />
      ))}
    </div>
  );
}

function RadarChart({ scores }: { scores: RadarScores }) {
  const cx = 120;
  const cy = 120;
  const maxRadius = 72;
  const labelRadius = maxRadius + 22;
  const rings = [25, 50, 75, 100];

  const polygonPoints = RADAR_AXES.map((axis, index) => {
    const point = radarPoint(index, scores[axis.key], cx, cy, maxRadius);
    return `${point.x},${point.y}`;
  }).join(" ");

  return (
    <svg
      className="forecast-risk-radar-chart"
      viewBox="-28 0 296 240"
      role="img"
      aria-label={radarAriaLabel(scores)}
    >
      {rings.map((ring) => (
        <circle
          key={ring}
          cx={cx}
          cy={cy}
          r={(ring / 100) * maxRadius}
          className="forecast-risk-radar-ring"
        />
      ))}

      {RADAR_AXES.map((axis, index) => {
        const angle = -Math.PI / 2 + (index * (2 * Math.PI)) / RADAR_AXES.length;
        const x2 = cx + maxRadius * Math.cos(angle);
        const y2 = cy + maxRadius * Math.sin(angle);
        const labelX = cx + labelRadius * Math.cos(angle);
        const labelY = cy + labelRadius * Math.sin(angle);
        const anchor =
          Math.abs(Math.cos(angle)) < 0.2 ? "middle" : Math.cos(angle) > 0 ? "start" : "end";

        return (
          <g key={axis.key}>
            <line x1={cx} y1={cy} x2={x2} y2={y2} className="forecast-risk-radar-axis" />
            <text
              x={labelX}
              y={labelY}
              textAnchor={anchor}
              dominantBaseline="middle"
              className="forecast-risk-radar-label"
            >
              {axis.label}
            </text>
          </g>
        );
      })}

      <polygon points={polygonPoints} className="forecast-risk-radar-polygon" />
    </svg>
  );
}

function ScoreList({ scores }: { scores: RadarScores }) {
  return (
    <ul className="forecast-risk-score-list" aria-label="Radar axis scores">
      {RADAR_AXES.map((axis) => (
        <li key={axis.key}>
          <span>{axis.label}</span>
          <strong className="forecast-risk-score-value">{scores[axis.key]}</strong>
        </li>
      ))}
    </ul>
  );
}

export function RiskTimeline({ hourly, risk_timeline, timezone }: RiskTimelineProps) {
  const [detailView, setDetailView] = useState(false);
  const comfort = useMemo(() => comfortLabel(hourly), [hourly]);
  const scores = useMemo(
    () => radarScores(hourly, risk_timeline, comfort),
    [hourly, risk_timeline, comfort],
  );
  const rows = useMemo(() => {
    const timelineRows = buildTimelineRows(risk_timeline, timezone);
    const derivedRows = buildDerivedRows(comfort, scores);
    return risk_timeline.length === 0
      ? derivedRows
      : [...timelineRows, ...derivedRows];
  }, [comfort, risk_timeline, scores, timezone]);

  return (
    <section className="forecast-panel forecast-risk-panel" aria-label="Risk radar">
      <div className="forecast-risk-header">
        <h2 className="forecast-risk-title">Risk radar</h2>
        <button
          type="button"
          className={`forecast-risk-detail-toggle${detailView ? " is-active" : ""}`}
          aria-pressed={detailView}
          onClick={() => setDetailView((current) => !current)}
        >
          Detail view
        </button>
      </div>

      <p className="forecast-risk-derived-note">Derived interpretation signals, not official measurements.</p>

      <div className="forecast-risk-body">
        <div className="forecast-risk-visual">
          {detailView ? <ScoreList scores={scores} /> : <RadarChart scores={scores} />}
        </div>

        <ul className="forecast-risk-rows" aria-label="Risk signal rows">
          {rows.map((row) => (
            <li key={row.key} className="forecast-risk-row">
              <div className="forecast-risk-row-main">
                <span className="forecast-risk-row-icon" aria-hidden="true">
                  {row.icon}
                </span>
                <div className="forecast-risk-row-copy">
                  <div className="forecast-risk-row-title">
                    <strong>{row.name}</strong>
                    <span className="forecast-risk-row-severity">{row.severityWord}</span>
                  </div>
                  <span className="forecast-risk-row-time">{row.timeRange}</span>
                </div>
              </div>
              <IntensityBar score={row.score} tone={row.barTone} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}