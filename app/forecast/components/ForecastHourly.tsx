import React from "react";
import type { ForecastHour } from "@/lib/types/forecast";
import {
  displayMillimeters,
  displayPercent,
  displayTemperature,
  displayValue,
  displayWind,
} from "../format";

type ForecastHourlyProps = {
  hourly: ForecastHour[];
};

function displayRain(hour: ForecastHour) {
  if (typeof hour.precipitation_mm === "number") {
    return displayMillimeters(hour.precipitation_mm);
  }

  return displayPercent(hour.precipitation_probability);
}

export function ForecastHourly({ hourly }: ForecastHourlyProps) {
  return (
    <section className="forecast-panel" aria-label="Hourly forecast analytics">
      <div className="forecast-section-heading">
        <h2>Hourly forecast analytics</h2>
        <p>Next available forecast rows with rain, temperature, wind, gust, and risk context.</p>
      </div>
      {hourly.length === 0 ? (
        <p className="forecast-empty">Hourly forecast data is unavailable.</p>
      ) : (
        <div className="forecast-table" role="table" aria-label="Hourly forecast table">
          <div className="forecast-row forecast-row-head" role="row">
            <span role="columnheader">Time</span>
            <span role="columnheader">Condition</span>
            <span role="columnheader">Temp</span>
            <span role="columnheader">Feels</span>
            <span role="columnheader">Rain</span>
            <span role="columnheader">Wind</span>
            <span role="columnheader">Gust</span>
          </div>
          {hourly.map((hour) => (
            <div className="forecast-row" role="row" key={`${hour.starts_at}-${hour.label}`}>
              <span role="cell" data-label="Time">{displayValue(hour.label)}</span>
              <span role="cell" data-label="Condition">{displayValue(hour.condition_label)}</span>
              <span role="cell" data-label="Temp">{displayTemperature(hour.temperature_c)}</span>
              <span role="cell" data-label="Feels">{displayTemperature(hour.apparent_temperature_c)}</span>
              <span role="cell" data-label="Rain">{displayRain(hour)}</span>
              <span role="cell" data-label="Wind">{displayWind(hour.wind_speed_kmh)}</span>
              <span role="cell" data-label="Gust">{displayWind(hour.wind_gust_kmh)}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
