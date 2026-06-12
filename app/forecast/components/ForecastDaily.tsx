import React from "react";
import type { ForecastDay } from "@/lib/types/forecast";
import {
  displayMillimeters,
  displayPercent,
  displayTemperature,
  displayValue,
  displayWind,
} from "../format";

type ForecastDailyProps = {
  daily: ForecastDay[];
};

function displayDailyRain(day: ForecastDay) {
  if (typeof day.precipitation_sum_mm === "number") {
    return displayMillimeters(day.precipitation_sum_mm);
  }

  return displayPercent(day.precipitation_probability_max);
}

export function ForecastDaily({ daily }: ForecastDailyProps) {
  return (
    <section className="forecast-panel forecast-daily-panel" aria-label="7-day forecast">
      <div className="forecast-section-heading">
        <h2>7-day forecast</h2>
        <p>Daily high and low, rain signal, max wind, gusts, and deterministic risk label.</p>
      </div>
      {daily.length === 0 ? (
        <p className="forecast-empty">Daily forecast data is unavailable.</p>
      ) : (
        <div className="forecast-day-grid">
          {daily.map((day) => (
            <article key={`${day.date}-${day.label}`} className="forecast-day-card">
              <div>
                <h3>{displayValue(day.label)}</h3>
                <p>{displayValue(day.condition_label)}</p>
              </div>
              <strong>
                {displayTemperature(day.temperature_max_c)} / {displayTemperature(day.temperature_min_c)}
              </strong>
              <dl>
                <div>
                  <dt>Feels</dt>
                  <dd>
                    {displayTemperature(day.apparent_temperature_max_c)} /{" "}
                    {displayTemperature(day.apparent_temperature_min_c)}
                  </dd>
                </div>
                <div>
                  <dt>Rain</dt>
                  <dd>{displayDailyRain(day)}</dd>
                </div>
                <div>
                  <dt>Wind</dt>
                  <dd>{displayWind(day.wind_speed_max_kmh)}</dd>
                </div>
                <div>
                  <dt>Gust</dt>
                  <dd>{displayWind(day.wind_gust_max_kmh)}</dd>
                </div>
                <div>
                  <dt>Risk</dt>
                  <dd>{displayValue(day.risk_label, "None flagged")}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
