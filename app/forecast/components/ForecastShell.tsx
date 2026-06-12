"use client";

import Link from "next/link";
import React, { useState } from "react";
import type { ForecastCity, ForecastResponse } from "@/lib/types/forecast";
import { ForecastDaily } from "./ForecastDaily";
import { ForecastHourly } from "./ForecastHourly";
import { ForecastSources } from "./ForecastSources";
import { ForecastSummary } from "./ForecastSummary";
import { RiskTimeline } from "./RiskTimeline";

type ForecastShellProps = {
  initialForecast: ForecastResponse;
  initialCities: ForecastCity[];
};

export function ForecastShell({ initialForecast, initialCities }: ForecastShellProps) {
  const [forecast, setForecast] = useState(initialForecast);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function selectCity(event: React.ChangeEvent<HTMLSelectElement>) {
    const slug = event.target.value;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        throw new Error("Forecast data could not be loaded.");
      }
      const nextForecast = (await response.json()) as ForecastResponse;
      setForecast(nextForecast);
    } catch {
      setError("Forecast data could not be loaded.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="forecast-page">
      <header className="forecast-nav">
        <Link className="forecast-brand" href="/">
          Dutch Weather Intelligence
        </Link>
        <nav aria-label="Primary">
          <Link href="/">Dashboard</Link>
          <Link href="/forecast" aria-current="page">
            Forecast
          </Link>
        </nav>
        <label className="forecast-city-select">
          <span>Select forecast city</span>
          <select value={forecast.city.slug} onChange={selectCity} disabled={loading}>
            {initialCities.map((city) => (
              <option key={city.slug} value={city.slug}>
                {city.name}
              </option>
            ))}
          </select>
        </label>
      </header>

      {error ? <div className="forecast-error">{error}</div> : null}
      {loading ? <div className="forecast-loading">Loading forecast data...</div> : null}

      <ForecastSummary forecast={forecast} />

      <div className="forecast-layout">
        <ForecastHourly hourly={forecast.hourly} />
        <RiskTimeline events={forecast.risk_timeline} timezone={forecast.city.timezone} />
        <ForecastDaily daily={forecast.daily} />
        <ForecastSources forecast={forecast} />
      </div>
    </main>
  );
}
