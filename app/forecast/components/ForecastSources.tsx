import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayDateTime, displayValue, sourceLabel } from "../format";

type ForecastSourcesProps = {
  forecast: ForecastResponse;
};

export function ForecastSources({ forecast }: ForecastSourcesProps) {
  return (
    <section className="forecast-panel forecast-sources" aria-label="Sources and methodology">
      <div className="forecast-section-heading">
        <h2>Sources and methodology</h2>
        <p>
          Official warnings come from KNMI warning data; app risk labels are deterministic
          interpretation of normalized forecast and source freshness values.
        </p>
      </div>
      <div className="forecast-source-grid">
        {forecast.source_freshness.map((source) => (
          <article key={`${source.source}-${source.status}`} className="forecast-source-card">
            <strong>{sourceLabel(source.source)}</strong>
            <span>{displayValue(source.status)}</span>
            <small>Observed {displayDateTime(source.observed_at, forecast.city.timezone)}</small>
            <small>Updated {displayDateTime(source.updated_at, forecast.city.timezone)}</small>
            {source.detail ? <p>{source.detail}</p> : null}
          </article>
        ))}
      </div>
      <div className="forecast-links" aria-label="Forecast source links">
        {forecast.links.map((link) => (
          <a key={link.href} href={link.href}>
            {link.label}
          </a>
        ))}
      </div>
    </section>
  );
}
