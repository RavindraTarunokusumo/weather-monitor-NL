"use client";

import React from "react";
import { useEffect, useState } from "react";
import { AskDashboardPanel } from "./AskDashboardPanel";
import { BriefingHero } from "./BriefingHero";
import { DetailPanels } from "./DetailPanels";
import { MetricStrip } from "./MetricStrip";
import { OutlookPanel } from "./OutlookPanel";
import { SourceFreshnessFooter } from "./SourceFreshnessFooter";
import { TopNav } from "./TopNav";
import type { ChartView, CityOption, DashboardResponse } from "../types";

type DashboardShellProps = {
  initialDashboard: DashboardResponse;
};

export function DashboardShell({ initialDashboard }: DashboardShellProps) {
  const [dashboard, setDashboard] = useState(initialDashboard);
  const [cities, setCities] = useState<CityOption[]>([initialDashboard.city]);
  const [cityMenuOpen, setCityMenuOpen] = useState(false);
  const [chartView, setChartView] = useState<ChartView>("24H");
  const [error, setError] = useState<string | null>(null);
  const [loadingCity, setLoadingCity] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadCities() {
      try {
        const response = await fetch("/api/cities");
        if (!response.ok) {
          return;
        }
        const body = (await response.json()) as { cities?: CityOption[] };
        if (!cancelled && Array.isArray(body.cities) && body.cities.length > 0) {
          setCities(body.cities);
        }
      } catch {
        // The current dashboard remains usable if city metadata is unavailable.
      }
    }

    void loadCities();

    return () => {
      cancelled = true;
    };
  }, []);

  async function selectCity(city: CityOption) {
    setCityMenuOpen(false);
    setLoadingCity(city.slug);
    setError(null);

    try {
      const response = await fetch(`/api/dashboard?city=${encodeURIComponent(city.slug)}`);
      if (!response.ok) {
        throw new Error("Dashboard data could not be loaded.");
      }
      const nextDashboard = (await response.json()) as DashboardResponse;
      setDashboard(nextDashboard);
    } catch {
      setError("Dashboard data could not be loaded.");
    } finally {
      setLoadingCity(null);
    }
  }

  return (
    <main className="dashboard-page">
      <TopNav
        cities={cities}
        dashboard={dashboard}
        cityMenuOpen={cityMenuOpen}
        onToggleCityMenu={() => setCityMenuOpen((open) => !open)}
        onSelectCity={selectCity}
      />
      {error ? <div className="dashboard-error">{error}</div> : null}
      {loadingCity ? <div className="loading-line">Loading {loadingCity}...</div> : null}
      <BriefingHero dashboard={dashboard} />
      <MetricStrip dashboard={dashboard} />
      <div className="dashboard-grid">
        <div className="main-column">
          <OutlookPanel
            dashboard={dashboard}
            chartView={chartView}
            onChartViewChange={setChartView}
          />
          <AskDashboardPanel dashboard={dashboard} />
        </div>
        <DetailPanels dashboard={dashboard} />
      </div>
      <SourceFreshnessFooter dashboard={dashboard} />
    </main>
  );
}
