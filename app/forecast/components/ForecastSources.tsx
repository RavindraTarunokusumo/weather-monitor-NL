"use client";

import React, { useState } from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayDateTime, displayValue, sourceLabel } from "../format";

type ForecastSourcesProps = {
  forecast: ForecastResponse;
};

function isSourceFresh(status: string) {
  return status.toLowerCase().includes("fresh");
}

function SourceChipIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="forecast-source-chip-icon">
      <circle cx="7" cy="7" r="5.5" fill="none" stroke="currentColor" strokeWidth="1.2" />
      <circle cx="7" cy="7" r="2" fill="currentColor" />
    </svg>
  );
}

export function ForecastSources({ forecast }: ForecastSourcesProps) {
  const [aboutOpen, setAboutOpen] = useState(false);

  return (
    <footer className="forecast-sources-bar" aria-label="Sources freshness">
      <div className="forecast-sources-main">
        <div className="forecast-sources-heading">
          <span className="forecast-sources-label">Sources fresh</span>
          <span className="forecast-sources-status-dot" aria-hidden="true" />
          <span className="forecast-sources-updated">
            Updated {displayDateTime(forecast.generated_at, forecast.city.timezone)}
          </span>
        </div>
        <div className="forecast-sources-chips">
          {forecast.source_freshness.map((source) => (
            <span
              key={`${source.source}-${source.status}`}
              className={`forecast-source-chip${isSourceFresh(source.status) ? " is-fresh" : ""}`}
            >
              <SourceChipIcon />
              <span className="forecast-source-chip-name">{sourceLabel(source.source)}</span>
              <span className="forecast-source-chip-status">{displayValue(source.status)}</span>
            </span>
          ))}
        </div>
      </div>

      <button
        type="button"
        className={`forecast-sources-about-toggle${aboutOpen ? " is-active" : ""}`}
        aria-expanded={aboutOpen}
        onClick={() => setAboutOpen((open) => !open)}
      >
        About sources
      </button>

      {aboutOpen ? (
        <div className="forecast-sources-links" aria-label="Forecast source links">
          {forecast.links.map((link) => (
            <a key={link.href} href={link.href}>
              {link.label}
            </a>
          ))}
        </div>
      ) : null}
    </footer>
  );
}
