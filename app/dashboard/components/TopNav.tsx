"use client";

/* eslint-disable @next/next/no-html-link-for-pages, @next/next/no-img-element */

import React from "react";
import type { CityOption, DashboardResponse } from "../types";

type TopNavProps = {
  cities: CityOption[];
  dashboard: DashboardResponse;
  cityMenuOpen: boolean;
  onToggleCityMenu: () => void;
  onSelectCity: (city: CityOption) => void;
};

export function TopNav({
  cities,
  dashboard,
  cityMenuOpen,
  onToggleCityMenu,
  onSelectCity,
}: TopNavProps) {
  return (
    <header className="top-nav">
      <div className="top-nav-inner">
        <div className="brand-lockup">
          <img src="/dashboard-assets/logo-mark.png" alt="" className="brand-mark" />
          <span>Dutch Weather Intelligence</span>
        </div>
        <nav className="nav-links" aria-label="Primary">
          <a href="/" aria-current="page" className="nav-link active">Dashboard</a>
          <a href="/forecast" className="nav-link">Forecast</a>
          <span className="nav-link">Maps</span>
          <span className="nav-link">Insights</span>
          <span className="nav-link">Alerts</span>
        </nav>
        <div className="nav-actions">
          <div className="city-picker">
            <button
              type="button"
              className="city-picker-button"
              aria-label="Select city"
              aria-expanded={cityMenuOpen}
              aria-haspopup="menu"
              onClick={onToggleCityMenu}
            >
              <span aria-hidden="true" className="city-pin">⌖</span>
              {dashboard.city.name}
              <span aria-hidden="true">⌄</span>
            </button>
            {cityMenuOpen ? (
              <div className="city-menu" role="menu" aria-label="Cities">
                {cities.map((city) => (
                  <button
                    key={city.slug}
                    type="button"
                    role="menuitemradio"
                    aria-checked={city.slug === dashboard.city.slug}
                    onClick={() => onSelectCity(city)}
                  >
                    {city.name}
                  </button>
                ))}
              </div>
            ) : null}
          </div>
          <div className="weather-chip" aria-label="Current weather">
            <img src={dashboard.current.rain_probability && dashboard.current.rain_probability > 0.3 ? "/dashboard-assets/icon-rain.png" : "/dashboard-assets/icon-temp.png"} alt="" />
          </div>
        </div>
      </div>
    </header>
  );
}
