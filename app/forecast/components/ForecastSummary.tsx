import React from "react";
import type { ForecastResponse } from "@/lib/types/forecast";
import { displayDateTime, displayValue } from "../format";

type ForecastSummaryProps = {
  forecast: ForecastResponse;
};

function warningClass(warningLevel: string | null) {
  if (warningLevel === "red") {
    return "forecast-warning-pill forecast-warning-severe";
  }

  if (warningLevel === "orange") {
    return "forecast-warning-pill forecast-warning-orange";
  }

  if (warningLevel === "yellow") {
    return "forecast-warning-pill forecast-warning-yellow";
  }

  return "forecast-warning-pill";
}

export function ForecastSummary({ forecast }: ForecastSummaryProps) {
  return (
    <section className="forecast-hero" aria-labelledby="forecast-heading">
      <div className="forecast-hero-topline">
        <p className="forecast-eyebrow">Generated {displayDateTime(forecast.generated_at, forecast.city.timezone)}</p>
        <span className={warningClass(forecast.summary.warning_level)}>
          KNMI {displayValue(forecast.summary.warning_level, "unknown")}
        </span>
      </div>
      <h1 id="forecast-heading">Forecast intelligence for {forecast.city.name}</h1>
      <p className="forecast-condition">{displayValue(forecast.summary.condition_label)}</p>
      <div className="forecast-summary-grid" aria-label="Forecast summary">
        <article>
          <h2>Best window</h2>
          <p>{displayValue(forecast.summary.best_window)}</p>
        </article>
        <article>
          <h2>Worst window</h2>
          <p>{displayValue(forecast.summary.worst_window)}</p>
        </article>
        <article>
          <h2>Main risk</h2>
          <p>{displayValue(forecast.summary.main_risk)}</p>
        </article>
        <article>
          <h2>Next change</h2>
          <p>{displayValue(forecast.summary.next_change)}</p>
        </article>
      </div>
    </section>
  );
}
