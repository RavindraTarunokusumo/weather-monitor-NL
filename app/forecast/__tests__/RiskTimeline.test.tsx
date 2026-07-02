import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it } from "vitest";
import type { ForecastHour, ForecastRiskEvent } from "@/lib/types/forecast";
import { RiskTimeline } from "../components/RiskTimeline";

const hourly: ForecastHour[] = [
  {
    starts_at: "2026-06-11T09:00:00.000Z",
    label: "09",
    condition_label: "Partly cloudy",
    weather_code: "partly_cloudy",
    temperature_c: 16,
    apparent_temperature_c: 15,
    precipitation_mm: null,
    precipitation_probability: 10,
    wind_speed_kmh: 18,
    wind_gust_kmh: 28,
    risk_label: null,
  },
  {
    starts_at: "2026-06-11T18:00:00.000Z",
    label: "18",
    condition_label: "Heavy showers",
    weather_code: "heavy_showers",
    temperature_c: 15,
    apparent_temperature_c: 12,
    precipitation_mm: 3.4,
    precipitation_probability: 75,
    wind_speed_kmh: 38,
    wind_gust_kmh: 52,
    risk_label: "Rain risk",
  },
];

const riskTimeline: ForecastRiskEvent[] = [
  {
    starts_at: "2026-06-11T18:00:00.000Z",
    ends_at: null,
    severity: "warning",
    category: "rain",
    title: "Heavy shower risk",
    detail: "Precipitation probability reaches 75%.",
  },
];

afterEach(() => {
  cleanup();
});

describe("RiskTimeline", () => {
  it("switches between radar chart and score list when detail view is toggled", async () => {
    const user = userEvent.setup();
    render(
      <RiskTimeline hourly={hourly} risk_timeline={riskTimeline} timezone="Europe/Amsterdam" />,
    );

    const panel = screen.getByRole("region", { name: /risk radar/i });
    expect(
      within(panel).getByRole("img", { name: /risk radar derived signals/i }),
    ).toBeInTheDocument();
    expect(within(panel).queryByRole("list", { name: /radar axis scores/i })).not.toBeInTheDocument();

    await user.click(within(panel).getByRole("button", { name: "Detail view" }));

    expect(within(panel).getByRole("button", { name: "Detail view", pressed: true })).toBeInTheDocument();
    expect(
      within(panel).queryByRole("img", { name: /risk radar derived signals/i }),
    ).not.toBeInTheDocument();
    const scoreList = within(panel).getByRole("list", { name: /radar axis scores/i });
    expect(within(scoreList).getByText("Rain")).toBeInTheDocument();
    expect(within(scoreList).getByText("75")).toBeInTheDocument();
  });

  it("renders derived comfort and visibility rows when the timeline is empty", () => {
    render(<RiskTimeline hourly={hourly} risk_timeline={[]} timezone="Europe/Amsterdam" />);

    const panel = screen.getByRole("region", { name: /risk radar/i });
    const rows = within(panel).getByRole("list", { name: /risk signal rows/i });
    expect(within(rows).getByText("Comfort")).toBeInTheDocument();
    expect(within(rows).getByText("Visibility")).toBeInTheDocument();
    expect(within(rows).queryByText("Heavy shower risk")).not.toBeInTheDocument();
  });
});