"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import { buildRiskTimeline, forecastSourceLinks } from "@/lib/forecast";
import type {
  ForecastCity,
  ForecastFreshnessEntry,
  ForecastResponse,
} from "@/lib/types/forecast";
import { ForecastDaily } from "./ForecastDaily";
import { ForecastHourly } from "./ForecastHourly";
import { ForecastSources } from "./ForecastSources";
import { ForecastSummary } from "./ForecastSummary";
import { RiskTimeline } from "./RiskTimeline";

type ForecastShellProps = {
  initialForecast: ForecastResponse;
  initialCities: ForecastCity[];
};

type MissingSource = "weather" | "air_quality" | "water" | "knmi_warnings" | "open_meteo";

function missingFreshness(source: MissingSource): ForecastFreshnessEntry {
  return {
    source,
    updated_at: null,
    observed_at: null,
    status: "missing",
    detail: `No ${source.replaceAll("_", " ")} data is available for this city.`,
  };
}

function buildUnavailableForecast(city: ForecastCity): ForecastResponse {
  const generatedAt = new Date().toISOString();
  const sourceFreshness = [
    missingFreshness("weather"),
    missingFreshness("air_quality"),
    missingFreshness("water"),
    missingFreshness("knmi_warnings"),
    missingFreshness("open_meteo"),
  ];

  return {
    city,
    generated_at: generatedAt,
    summary: {
      condition_label: null,
      best_window: null,
      worst_window: null,
      main_risk: null,
      next_change: null,
      warning_level: "unknown",
    },
    hourly: [],
    daily: [],
    risk_timeline: buildRiskTimeline({
      generatedAt,
      warningLevel: "unknown",
      hourly: [],
      sourceFreshness,
    }),
    source_freshness: sourceFreshness,
    links: forecastSourceLinks(),
  };
}

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
