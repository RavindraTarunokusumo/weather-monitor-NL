"use client";

/* eslint-disable @next/next/no-img-element */

import Link from "next/link";
import React, { useEffect, useState } from "react";
import type { ForecastCity, ForecastResponse } from "@/lib/types/forecast";
import { buildUnavailableForecast } from "../unavailable";
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

  useEffect(() => {
    setForecast(initialForecast);
    setError(null);
    setLoading(false);
  }, [initialForecast]);

  async function selectCity(event: React.ChangeEvent<HTMLSelectElement>) {
    const slug = event.target.value;
    const selectedCity = initialCities.find((city) => city.slug === slug);
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/forecast?city=${encodeURIComponent(slug)}`);
      if (!response.ok) {
        if (response.status === 404 && selectedCity) {
          setForecast(buildUnavailableForecast(selectedCity));
          setError(
            `Forecast data could not be loaded. Showing unavailable forecast for ${selectedCity.name}.`,
          );
          return;
        }

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
      <header className="top-nav">
        <div className="top-nav-inner">
          <div className="brand-lockup">
            <img src="/dashboard-assets/logo-mark.png" alt="" className="brand-mark" />
            <span>Dutch Weather Intelligence</span>
          </div>
          <nav className="nav-links" aria-label="Primary">
            <Link href="/" className="nav-link">
              Dashboard
            </Link>
            <Link href="/forecast" aria-current="page" className="nav-link active">
              Forecast
            </Link>
          </nav>
          <div className="nav-actions">
            <label className="forecast-city-select">
              <span className="sr-only">Select forecast city</span>
              <select value={forecast.city.slug} onChange={selectCity} disabled={loading}>
                {initialCities.map((city) => (
                  <option key={city.slug} value={city.slug}>
                    {city.name}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </header>

      {error ? (
        <div className="forecast-error" role="alert">
          {error}
        </div>
      ) : null}
      {loading ? (
        <div className="forecast-loading" role="status">
          Loading forecast data...
        </div>
      ) : null}

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
