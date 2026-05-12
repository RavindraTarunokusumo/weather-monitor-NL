import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { DashboardShell } from "../components/DashboardShell";
import { DetailPanels } from "../components/DetailPanels";
import { OutlookPanel } from "../components/OutlookPanel";
import type { DashboardResponse } from "../types";

const amsterdamDashboard: DashboardResponse = {
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
    station_name: "Amsterdam mock station",
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
    changed_detail: "Temperatures up ~3C. More sun in the first half.",
  },
  outlook: {
    hourly: [
      { h: "00", rain: 0.1, wind: 14, temp: 13 },
      { h: "03", rain: 0.1, wind: 13, temp: 12 },
      { h: "06", rain: 0, wind: 12, temp: 12 },
    ],
    weekly: [
      { day: "Mon", hi: 14, lo: 9, rain: 80 },
      { day: "Tue", hi: 15, lo: 10, rain: 40 },
    ],
  },
};

const utrechtDashboard: DashboardResponse = {
  ...amsterdamDashboard,
  city: { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
  briefing: "Utrecht enjoys the best conditions in the Netherlands today.",
};

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("DashboardShell", () => {
  it("renders dashboard data, switches city, changes chart view, and answers a quick question", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = input.toString();
        if (url.includes("/api/cities")) {
          return Response.json({
            cities: [
              { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
              { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
            ],
          });
        }
        if (url.includes("city=utrecht")) {
          return Response.json(utrechtDashboard);
        }
        return Response.json(amsterdamDashboard);
      }),
    );

    render(<DashboardShell initialDashboard={amsterdamDashboard} />);

    expect(screen.getByRole("heading", { name: /amsterdam/i })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: /select city/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: /utrecht/i }));
    expect(await screen.findByRole("heading", { name: /utrecht/i })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "7D" }));
    expect(screen.getByText(/7-day outlook/i)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /will it rain/i }));
    expect(screen.getByText(/Utrecht has a 20% rain chance/i)).toBeInTheDocument();
    expect(screen.getByRole("contentinfo", { name: /source freshness/i })).toBeInTheDocument();
    expect(screen.getByText(/all times in cest/i)).toBeInTheDocument();
  });

  it("switches the 24-hour chart metric between rain, temperature, and wind", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          cities: [amsterdamDashboard.city],
        }),
      ),
    );

    render(<DashboardShell initialDashboard={amsterdamDashboard} />);

    expect(screen.getByLabelText("24-hour rain chart")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Temp" }));
    expect(screen.getByLabelText("24-hour temperature chart")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Wind" }));
    expect(screen.getByLabelText("24-hour wind chart")).toBeInTheDocument();
  });

  it("exposes handoff dashboard landmarks", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        Response.json({
          cities: [amsterdamDashboard.city],
        }),
      ),
    );

    render(<DashboardShell initialDashboard={amsterdamDashboard} />);

    expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /today briefing/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /dashboard metrics/i })).toBeInTheDocument();
    await screen.findByRole("button", { name: /select city/i });
  });

  it("shows an error state when dashboard reload fails", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async (input: string | URL | Request) => {
        const url = input.toString();
        if (url.includes("/api/cities")) {
          return Response.json({
            cities: [
              { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
              { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
            ],
          });
        }
        return Response.json({ error: "Unsupported city" }, { status: 404 });
      }),
    );

    render(<DashboardShell initialDashboard={amsterdamDashboard} />);

    await user.click(screen.getByRole("button", { name: /select city/i }));
    await user.click(await screen.findByRole("menuitemradio", { name: /utrecht/i }));
    expect(await screen.findByText(/dashboard data could not be loaded/i)).toBeInTheDocument();
  });

  it("limits the 24-hour chart to one day of hourly forecast entries", () => {
    const hourly = Array.from({ length: 30 }, (_, index) => ({
      h: `H${index.toString().padStart(2, "0")}`,
      rain: index,
      wind: 12,
      temp: 14,
    }));

    render(
      <OutlookPanel
        chartView="24H"
        chartMetric="rain"
        onChartViewChange={vi.fn()}
        onChartMetricChange={vi.fn()}
        dashboard={{
          ...amsterdamDashboard,
          outlook: {
            ...amsterdamDashboard.outlook,
            hourly,
          },
        }}
      />,
    );

    const chart = screen.getByLabelText("24-hour rain chart");
    expect(within(chart).getByText("H23")).toBeInTheDocument();
    expect(within(chart).queryByText("H24")).not.toBeInTheDocument();
  });

  it("does not render unavailable pollutant rows", () => {
    render(
      <DetailPanels
        dashboard={{
          ...amsterdamDashboard,
          air_quality: {
            ...amsterdamDashboard.air_quality,
            pollutants: { pm25: 8.5, pm10: 15.1, no2: 16.9, o3: null, so2: null },
          },
        }}
      />,
    );

    expect(screen.getByText("PM2.5")).toBeInTheDocument();
    expect(screen.getByText("PM10")).toBeInTheDocument();
    expect(screen.getByText("NO2")).toBeInTheDocument();
    expect(screen.queryByText("O3")).not.toBeInTheDocument();
    expect(screen.queryByText("SO2")).not.toBeInTheDocument();
  });
});
