import React from "react";
import type { ForecastRiskEvent } from "@/lib/types/forecast";
import { displayDateTime } from "../format";

type RiskTimelineProps = {
  events: ForecastRiskEvent[];
  timezone: string;
};

export function RiskTimeline({ events, timezone }: RiskTimelineProps) {
  return (
    <section className="forecast-panel" aria-label="Risk timeline">
      <div className="forecast-section-heading">
        <h2>Risk timeline</h2>
        <p>Ordered deterministic signals for warnings, rain, wind, comfort, and data freshness.</p>
      </div>
      {events.length === 0 ? (
        <p className="forecast-empty">Risk timeline data is unavailable.</p>
      ) : (
        <ol className="forecast-risk-list">
          {events.map((event, index) => (
            <li
              key={`${event.starts_at}-${event.category}-${event.title}-${index}`}
              className={`forecast-risk-event forecast-risk-${event.severity}`}
            >
              <span>{event.category}</span>
              <strong>{event.title}</strong>
              <p>{event.detail}</p>
              <small>
                {displayDateTime(event.starts_at, timezone)}
                {event.ends_at ? ` to ${displayDateTime(event.ends_at, timezone)}` : ""}
              </small>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
