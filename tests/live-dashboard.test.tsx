// @vitest-environment happy-dom
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi, beforeEach } from "vitest";
import { LiveDashboard } from "@/app/components/live-dashboard";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

const mockDashboard: DashboardResponse = {
  city: { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  generated_at: "2026-05-04T10:00:00.000Z",
  briefing: "Today is a good day for cycling.",
  current: {
    temperature_c: 16.2,
    feels_like_c: 15.4,
    rain_mm: 0.4,
    rain_probability: 0.2,
    wind_speed_kmh: 18,
    wind_gust_kmh: 32,
    wind_direction: "WSW",
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
  },
  water_signal: {
    station_name: "Amsterdam mock station",
    water_level_cm: 14,
    trend: "stable",
    risk_label: "normal",
  },
  source_freshness: [
    { source: "mock_knmi", updated_at: "2026-05-04T09:58:00.000Z" },
    { source: "mock_luchtmeetnet", updated_at: "2026-05-04T09:55:00.000Z" },
    { source: "mock_rijkswaterstaat", updated_at: "2026-05-04T09:50:00.000Z" },
  ],
  summary_payload: {},
};

const nullDashboard: DashboardResponse = {
  ...mockDashboard,
  briefing: null,
  current: {
    temperature_c: null,
    feels_like_c: null,
    rain_mm: null,
    rain_probability: null,
    wind_speed_kmh: null,
    wind_gust_kmh: null,
    wind_direction: null,
    warning_level: null,
  },
  cycle_comfort: { score: null, label: null, best_outdoor_window: null, worst_outdoor_window: null },
  air_quality: { aqi_value: null, label: null, main_pollutant: null, trend: null },
  water_signal: { station_name: null, water_level_cm: null, trend: null, risk_label: null },
  source_freshness: [
    { source: "weather", updated_at: null },
    { source: "air_quality", updated_at: null },
    { source: "water", updated_at: null },
  ],
};

const mockCities: CityListEntry[] = [
  { slug: "amsterdam", name: "Amsterdam" },
  { slug: "utrecht", name: "Utrecht" },
  { slug: "rotterdam", name: "Rotterdam" },
];

vi.mock("@/lib/api/dashboard-client", () => ({
  getDashboard: vi.fn(),
}));

import { getDashboard } from "@/lib/api/dashboard-client";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("LiveDashboard", () => {
  it("renders dashboard data from initial props", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    expect(screen.getByText("Today is a good day for cycling.")).toBeInTheDocument();
    expect(screen.getByText("16.2°C")).toBeInTheDocument();
    expect(screen.getByText("good")).toBeInTheDocument();
    expect(screen.getByText("Good")).toBeInTheDocument();
    expect(screen.getByText("normal")).toBeInTheDocument();
  });

  it("renders all three source freshness entries", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    expect(screen.getByText("mock_knmi")).toBeInTheDocument();
    expect(screen.getByText("mock_luchtmeetnet")).toBeInTheDocument();
    expect(screen.getByText("mock_rijkswaterstaat")).toBeInTheDocument();
  });

  it("renders fallback labels when values are null", () => {
    render(
      <LiveDashboard
        initialData={nullDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    const dashes = screen.getAllByText("—");
    expect(dashes.length).toBeGreaterThan(0);
    expect(screen.getAllByText("Unavailable").length).toBeGreaterThan(0);
  });

  it("shows city selector with all cities", () => {
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    const select = screen.getByRole("combobox");
    expect(select).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Amsterdam" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Utrecht" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Rotterdam" })).toBeInTheDocument();
  });

  it("fetches new data when city selector changes", async () => {
    const utrechtData: DashboardResponse = {
      ...mockDashboard,
      city: { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
      briefing: "Utrecht today looks calm.",
    };
    vi.mocked(getDashboard).mockResolvedValue(utrechtData);

    const user = userEvent.setup();
    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    const select = screen.getByRole("combobox");
    await user.selectOptions(select, "utrecht");

    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith("utrecht");
    });
  });

  it("calls getDashboard when Refresh button is clicked", async () => {
    vi.mocked(getDashboard).mockResolvedValue(mockDashboard);
    const user = userEvent.setup();

    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    const btn = screen.getByRole("button", { name: /refresh/i });
    await user.click(btn);

    await waitFor(() => {
      expect(getDashboard).toHaveBeenCalledWith("amsterdam");
    });
  });

  it("polls getDashboard after 30 seconds", async () => {
    vi.useFakeTimers();
    vi.mocked(getDashboard).mockResolvedValue(mockDashboard);

    render(
      <LiveDashboard
        initialData={mockDashboard}
        initialCity="amsterdam"
        cities={mockCities}
      />,
    );

    expect(getDashboard).not.toHaveBeenCalled();

    await act(async () => {
      vi.advanceTimersByTime(30_001);
    });

    expect(getDashboard).toHaveBeenCalledWith("amsterdam");

    vi.useRealTimers();
  });
});
