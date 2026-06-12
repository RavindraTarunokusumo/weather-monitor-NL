import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { ForecastResponse } from "@/lib/types/forecast";
import { ForecastShell } from "../components/ForecastShell";

const amsterdamForecast: ForecastResponse = {
  city: { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  generated_at: "2026-06-11T08:00:00.000Z",
  summary: {
    condition_label: "Partly cloudy",
    best_window: "10:00-13:00",
    worst_window: "18:00-21:00",
    main_risk: "Evening gusts and showers",
    next_change: "Rain risk increases after 18:00",
    warning_level: "yellow",
  },
  hourly: [
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
  ],
  daily: [
    {
      date: "2026-06-11",
      label: "Thu",
      condition_label: "Showers",
      weather_code: "showers",
      temperature_max_c: 18,
      temperature_min_c: 11,
      apparent_temperature_max_c: 17,
      apparent_temperature_min_c: 9,
      precipitation_sum_mm: 4.2,
      precipitation_probability_max: 75,
      wind_speed_max_kmh: 32,
      wind_gust_max_kmh: 48,
      risk_label: "Rain risk",
    },
    {
      date: "2026-06-12",
      label: "Fri",
      condition_label: "Partly cloudy",
      weather_code: "partly_cloudy",
      temperature_max_c: 19,
      temperature_min_c: 12,
      apparent_temperature_max_c: null,
      apparent_temperature_min_c: null,
      precipitation_sum_mm: null,
      precipitation_probability_max: 30,
      wind_speed_max_kmh: 21,
      wind_gust_max_kmh: 34,
      risk_label: null,
    },
  ],
  risk_timeline: [
    {
      starts_at: "2026-06-11T08:00:00.000Z",
      ends_at: null,
      severity: "warning",
      category: "warning",
      title: "KNMI warning active",
      detail: "Current KNMI warning level is yellow.",
    },
    {
      starts_at: "2026-06-11T18:00:00.000Z",
      ends_at: null,
      severity: "warning",
      category: "rain",
      title: "Heavy shower risk",
      detail: "Precipitation probability reaches 75%.",
    },
  ],
  source_freshness: [
    {
      source: "knmi",
      updated_at: "2026-06-11T07:58:00.000Z",
      observed_at: "2026-06-11T07:55:00.000Z",
      status: "fresh",
      detail: null,
    },
    {
      source: "open_meteo",
      updated_at: "2026-06-11T07:58:00.000Z",
      observed_at: "2026-06-11T07:55:00.000Z",
      status: "fresh",
      detail: null,
    },
  ],
  links: [
    {
      label: "Open-Meteo KNMI forecast documentation",
      href: "https://open-meteo.com/en/docs/knmi-api",
      source: "open_meteo",
    },
    {
      label: "KNMI Data Platform warnings dataset",
      href: "https://dataplatform.knmi.nl/dataset/access/waarschuwingen-nederland-48h-1-0",
      source: "knmi_warnings",
    },
  ],
};

const utrechtForecast: ForecastResponse = {
  ...amsterdamForecast,
  city: { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
  summary: {
    ...amsterdamForecast.summary,
    condition_label: "Cloudy",
    main_risk: "Late drizzle",
  },
};

const emptyForecast: ForecastResponse = {
  ...amsterdamForecast,
  hourly: [],
  daily: [],
  risk_timeline: [],
};

const cities = [
  { slug: "amsterdam", name: "Amsterdam", timezone: "Europe/Amsterdam" },
  { slug: "utrecht", name: "Utrecht", timezone: "Europe/Amsterdam" },
];

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("ForecastShell", () => {
  it("renders deeper forecast analytics and source links", () => {
    render(<ForecastShell initialForecast={amsterdamForecast} initialCities={cities} />);

    expect(
      screen.getByRole("heading", { name: /forecast intelligence for amsterdam/i }),
    ).toBeInTheDocument();
    expect(screen.getAllByText("Partly cloudy").length).toBeGreaterThan(0);
    expect(screen.getByText("10:00-13:00")).toBeInTheDocument();
    expect(screen.getByText("Evening gusts and showers")).toBeInTheDocument();

    expect(screen.getByRole("region", { name: /hourly forecast analytics/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /risk timeline/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /7-day forecast/i })).toBeInTheDocument();
    expect(screen.getByRole("region", { name: /sources and methodology/i })).toBeInTheDocument();

    const hourly = screen.getByRole("region", { name: /hourly forecast analytics/i });
    expect(within(hourly).getByText("Feels")).toBeInTheDocument();
    expect(within(hourly).getByText("3.4 mm")).toBeInTheDocument();
    expect(within(hourly).getByText("52 km/h")).toBeInTheDocument();

    expect(
      screen.getByRole("link", { name: /open-meteo knmi forecast documentation/i }),
    ).toHaveAttribute("href", "https://open-meteo.com/en/docs/knmi-api");
  });

  it("switches cities through the same-app Forecast API", async () => {
    const user = userEvent.setup();
    let resolveForecast!: (response: Response) => void;
    const forecastPromise = new Promise<Response>((resolve) => {
      resolveForecast = resolve;
    });
    const fetchMock = vi.fn(() => forecastPromise);
    vi.stubGlobal("fetch", fetchMock);

    render(<ForecastShell initialForecast={amsterdamForecast} initialCities={cities} />);

    await user.selectOptions(screen.getByLabelText(/select forecast city/i), "utrecht");

    expect(fetchMock).toHaveBeenCalledWith("/api/forecast?city=utrecht");
    expect(screen.getByRole("status")).toHaveTextContent("Loading forecast data...");

    resolveForecast(Response.json(utrechtForecast));

    expect(
      await screen.findByRole("heading", { name: /forecast intelligence for utrecht/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Late drizzle")).toBeInTheDocument();
  });

  it("syncs displayed forecast when the initialForecast prop changes", () => {
    const { rerender } = render(
      <ForecastShell initialForecast={amsterdamForecast} initialCities={cities} />,
    );

    expect(
      screen.getByRole("heading", { name: /forecast intelligence for amsterdam/i }),
    ).toBeInTheDocument();

    rerender(<ForecastShell initialForecast={utrechtForecast} initialCities={cities} />);

    expect(
      screen.getByRole("heading", { name: /forecast intelligence for utrecht/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Late drizzle")).toBeInTheDocument();
  });

  it("renders usable states for empty data and unavailable city loads", async () => {
    const user = userEvent.setup();
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => Response.json({ error: "No forecast data available" }, { status: 404 })),
    );

    render(<ForecastShell initialForecast={emptyForecast} initialCities={cities} />);

    expect(screen.getByText("Hourly forecast data is unavailable.")).toBeInTheDocument();
    expect(screen.getByText("Daily forecast data is unavailable.")).toBeInTheDocument();
    expect(screen.getByText("Risk timeline data is unavailable.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText(/select forecast city/i), "utrecht");

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Forecast data could not be loaded. Showing unavailable forecast for Utrecht.",
    );
    expect(
      screen.getByRole("heading", { name: /forecast intelligence for utrecht/i }),
    ).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: /forecast intelligence for amsterdam/i })).not.toBeInTheDocument();
    expect(screen.getByText("Forecast data unavailable")).toBeInTheDocument();
    expect(screen.getByText("Hourly forecast data is unavailable.")).toBeInTheDocument();
    expect(screen.getByText("Daily forecast data is unavailable.")).toBeInTheDocument();
  });
});
