"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getDashboard } from "@/lib/api/dashboard-client";
import { formatTime } from "@/lib/utils/format";
import { BriefingCard } from "./briefing-card";
import { WeatherCard } from "./weather-card";
import { CycleComfortCard } from "./cycle-comfort-card";
import { AirQualityCard } from "./air-quality-card";
import { WaterSignalCard } from "./water-signal-card";
import { SourceFreshness } from "./source-freshness";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

const POLL_INTERVAL_MS = 30_000;

type Props = {
  initialData: DashboardResponse;
  initialCity: string;
  cities: CityListEntry[];
};

export function LiveDashboard({ initialData, initialCity, cities }: Props) {
  const [city, setCity] = useState(initialCity);
  const [data, setData] = useState<DashboardResponse>(initialData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date());
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const refresh = useCallback(async (targetCity: string) => {
    setLoading(true);
    setError(null);
    try {
      const next = await getDashboard(targetCity);
      setData(next);
      setLastRefreshed(new Date());
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      refresh(city);
    }, POLL_INTERVAL_MS);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [city, refresh]);

  const handleCityChange = async (slug: string) => {
    setCity(slug);      // triggers useEffect to clear and restart the poll interval
    await refresh(slug); // immediate fetch for the newly selected city
  };

  return (
    <div className="dashboard-root">
      <nav className="top-nav">
        <span className="app-name">
          {process.env.NEXT_PUBLIC_APP_NAME ?? "Dutch Weather Intelligence"}
        </span>
        <div className="nav-actions">
          <select
            className="city-selector"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            aria-label="Select city"
          >
            {cities.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
          <button
            className="refresh-btn"
            onClick={() => refresh(city)}
            disabled={loading}
            aria-label="Refresh dashboard"
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>
      </nav>

      <main className="page-shell">
        <header className="dashboard-header">
          <div>
            <p className="eyebrow">Seeded dashboard</p>
            <h1>{data.city.name}</h1>
            <p className="subtitle">
              Environmental conditions from mock ingestion sources.
            </p>
          </div>
          <div className="generated-box">
            <strong>Last refreshed</strong>
            <br />
            <span suppressHydrationWarning>{formatTime(lastRefreshed)}</span>
          </div>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            {error}
          </div>
        )}

        <BriefingCard briefing={data.briefing} />

        <section className="card-grid" aria-label="Dashboard metrics">
          <WeatherCard data={data.current} />
          <CycleComfortCard data={data.cycle_comfort} />
          <AirQualityCard data={data.air_quality} />
          <WaterSignalCard data={data.water_signal} />
        </section>

        <SourceFreshness sources={data.source_freshness} />
      </main>
    </div>
  );
}
