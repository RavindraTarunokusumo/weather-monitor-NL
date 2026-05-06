"use client";

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
      <div className="brand-lockup">
        <img src="/dashboard-assets/logo-mark.png" alt="" className="brand-mark" />
        <span>Dutch Weather Intelligence</span>
      </div>
      <nav className="nav-links" aria-label="Primary">
        {["Dashboard", "Forecast", "Maps", "Insights", "Alerts"].map((item) => (
          <span key={item} className={item === "Dashboard" ? "nav-link active" : "nav-link"}>
            {item}
          </span>
        ))}
      </nav>
      <div className="nav-actions">
        <div className="city-picker">
          <button
            type="button"
            className="city-picker-button"
            aria-label="Select city"
            aria-expanded={cityMenuOpen}
            onClick={onToggleCityMenu}
          >
            <span aria-hidden="true">⌖</span>
            {dashboard.city.name}
            <span aria-hidden="true">⌄</span>
          </button>
          {cityMenuOpen ? (
            <div className="city-menu" role="listbox" aria-label="Cities">
              {cities.map((city) => (
                <button
                  key={city.slug}
                  type="button"
                  role="option"
                  aria-selected={city.slug === dashboard.city.slug}
                  onClick={() => onSelectCity(city)}
                >
                  {city.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
        <div className="weather-chip" aria-label="Current weather">
          <img src="/dashboard-assets/icon-rain.png" alt="" />
        </div>
      </div>
    </header>
  );
}
