import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import { BriefingHero } from "../components/BriefingHero";
import type { DashboardResponse } from "../types";

const dashboard: DashboardResponse = {
  city: { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  generated_at: "2026-05-03T10:00:00.000Z",
  briefing: "Today looks comfortable for Amsterdam.",
  current: {
    temperature_c: 16.2,
    feels_like_c: 15.4,
    rain_mm: 0.4,
    rain_probability: 0.2,
    wind_speed_kmh: 18,
    wind_gust_kmh: 32,
    wind_direction: "WSW",
    condition_label: "Partly cloudy",
    warning_level: "none",
  },
  cycle_comfort: {
    score: 78,
    label: "good",
    best_outdoor_window: "10:00-16:00",
    worst_outdoor_window: "18:00-21:00",
  },
  air_quality: {
    aqi_value: 42,
    label: "Good",
    main_pollutant: "O3",
    trend: "stable",
    pollutants: { pm25: 12, pm10: 22, no2: 18, o3: 46, so2: 6 },
  },
  water_signal: {
    station_name: "Amsterdam station",
    water_level_cm: 14,
    trend: "stable",
    risk_label: "normal",
    weekly_levels_cm: [14, 13, 14, 15, 14, 16, 15],
  },
  source_freshness: [
    { source: "mock_knmi", updated_at: "2026-05-03T09:58:00.000Z" },
    { source: "mock_luchtmeetnet", updated_at: "2026-05-03T09:55:00.000Z" },
    { source: "mock_rijkswaterstaat", updated_at: "2026-05-03T09:50:00.000Z" },
  ],
  summary_payload: { source: "seed" },
  ui_summary: {
    best_window: "10:00-16:00",
    main_risk: "Evening showers",
    changed: "Warmer than yesterday",
    outdoor_window_detail: "Dry, brighter spells and comfortable temperatures.",
    risk_detail: "Heavier rain possible after 18:00 with gusty winds.",
    changed_detail: "Temperatures up about 3C. More sun in the first half.",
  },
  outlook: {
    hourly: [
      { h: "00", rain: 0.1, wind: 14, temp: 13 },
      { h: "03", rain: 0.1, wind: 13, temp: 12 },
    ],
    weekly: [
      { day: "Mon", hi: 14, lo: 9, rain: 80 },
      { day: "Tue", hi: 15, lo: 10, rain: 40 },
    ],
  },
};

afterEach(() => {
  cleanup();
});

describe("BriefingHero", () => {
  it("renders a collapsed briefing pill that expands and closes", async () => {
    const user = userEvent.setup();
    render(<BriefingHero dashboard={dashboard} />);

    const pill = screen.getByRole("button", { name: /today's briefing/i });
    expect(pill).toHaveAttribute("aria-expanded", "false");
    expect(pill.closest(".briefing-collapsible")).not.toHaveClass("open");

    await user.click(pill);

    expect(pill).toHaveAttribute("aria-expanded", "true");
    expect(pill.closest(".briefing-collapsible")).toHaveClass("open");
    const expandedPanel = screen.getByRole("region", { name: /expanded briefing/i });
    expect(within(expandedPanel).getByText("AI summary")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /close briefing panel/i }));

    expect(pill).toHaveAttribute("aria-expanded", "false");
    expect(pill.closest(".briefing-collapsible")).not.toHaveClass("open");
    expect(screen.queryByRole("region", { name: /expanded briefing/i })).not.toBeInTheDocument();
  });

  it("renders all summary item labels and values", () => {
    render(<BriefingHero dashboard={dashboard} />);

    expect(screen.getAllByText("Best outdoor window:")).toHaveLength(2);
    expect(screen.getAllByText("Main risk:")).toHaveLength(2);
    expect(screen.getAllByText("What changed:")).toHaveLength(2);
    expect(screen.getAllByText(/10:00-16:00/)).toHaveLength(2);
    expect(screen.getAllByText(/Evening showers/)).toHaveLength(2);
    expect(screen.getAllByText(/Warmer than yesterday/)).toHaveLength(2);
  });

  it("uses the city-specific hero image for supported city slugs", () => {
    render(
      <BriefingHero
        dashboard={{
          ...dashboard,
          city: { ...dashboard.city, slug: "rotterdam", name: "Rotterdam" },
        }}
      />,
    );

    expect(screen.getByAltText("Rotterdam weather scene")).toHaveAttribute(
      "src",
      "/dashboard-assets/rotterdam-day.png",
    );
  });

  it("renders the no known risk fallback when main risk is unavailable", () => {
    render(
      <BriefingHero
        dashboard={{
          ...dashboard,
          ui_summary: {
            ...dashboard.ui_summary,
            main_risk: null,
            risk_detail: null,
          },
        }}
      />,
    );

    expect(screen.getAllByText(/No known risk/)).toHaveLength(2);
  });
});
