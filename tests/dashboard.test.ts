import { describe, expect, it } from "vitest";
import { buildDashboardResponse } from "@/lib/dashboard";

const city = {
  slug: "amsterdam",
  name: "Amsterdam",
  timezone: "Europe/Amsterdam",
};

const snapshot = {
  generatedAt: new Date("2026-05-03T10:00:00.000Z"),
  cycleComfortScore: 78,
  cycleComfortLabel: "good",
  bestOutdoorWindow: "10:00-16:00",
  worstOutdoorWindow: "18:00-21:00",
  summaryPayload: {
    source: "seed",
    source_status: {
      weather: {
        source: "knmi",
        status: "fresh",
        observed_at: "2026-05-03T09:50:00.000Z",
        detail: null,
      },
      air_quality: {
        source: "luchtmeetnet",
        status: "fresh",
        observed_at: "2026-05-03T09:00:00.000Z",
        detail: null,
      },
      water: {
        source: "rijkswaterstaat",
        status: "stale",
        observed_at: "2026-05-02T09:50:00.000Z",
        detail: "Latest water observation is older than 24 hours.",
      },
    },
  },
  weatherSnapshot: {
    observedAt: new Date("2026-05-03T09:50:00.000Z"),
    temperatureC: 16.2,
    feelsLikeC: 15.4,
    rainMm: 0.4,
    rainProbability: 0.2,
    windSpeedKmh: 18,
    windGustKmh: 32,
    windDirection: "WSW",
    warningLevel: "none",
    sourceName: "mock_knmi",
    ingestedAt: new Date("2026-05-03T09:58:00.000Z"),
  },
  airQualitySnapshot: {
    observedAt: new Date("2026-05-03T09:00:00.000Z"),
    aqiValue: 42,
    aqiLabel: "Good",
    mainPollutant: "O3",
    trendLabel: "stable",
    sourceName: "mock_luchtmeetnet",
    ingestedAt: new Date("2026-05-03T09:55:00.000Z"),
  },
  waterSnapshot: {
    observedAt: new Date("2026-05-02T09:50:00.000Z"),
    stationName: "Amsterdam mock station",
    waterLevelCm: 14,
    trendLabel: "stable",
    riskLabel: "normal",
    sourceName: "mock_rijkswaterstaat",
    ingestedAt: new Date("2026-05-03T09:50:00.000Z"),
  },
  aiBriefings: [
    {
      briefingText: "Today looks comfortable for Amsterdam.",
    },
  ],
};

describe("buildDashboardResponse", () => {
  it("maps the latest dashboard snapshot into the public API contract", () => {
    const response = buildDashboardResponse(city, snapshot);

    expect(response).toMatchObject({
      city: {
        slug: "amsterdam",
        name: "Amsterdam",
        timezone: "Europe/Amsterdam",
      },
      generated_at: "2026-05-03T10:00:00.000Z",
      briefing: "Today looks comfortable for Amsterdam.",
      current: {
        temperature_c: 16.2,
        rain_probability: 0.2,
        wind_direction: "WSW",
      },
      cycle_comfort: {
        score: 78,
        label: "good",
        best_outdoor_window: "10:00-16:00",
      },
      air_quality: {
        aqi_value: 42,
        label: "Good",
        main_pollutant: "O3",
      },
      water_signal: {
        station_name: "Amsterdam mock station",
        water_level_cm: 14,
        risk_label: "normal",
      },
      summary_payload: { source: "seed" },
    });
    expect(response.source_freshness).toHaveLength(3);
    expect(response.source_freshness[0]).toEqual({
      source: "mock_knmi",
      updated_at: "2026-05-03T09:58:00.000Z",
      observed_at: "2026-05-03T09:50:00.000Z",
      status: "fresh",
      detail: null,
    });
    expect(response.source_freshness[2]).toMatchObject({
      status: "stale",
      detail: "Latest water observation is older than 24 hours.",
    });
  });

  it("uses nulls and fallback source labels when related snapshots are missing", () => {
    const response = buildDashboardResponse(city, {
      ...snapshot,
      weatherSnapshot: null,
      airQualitySnapshot: null,
      waterSnapshot: null,
      aiBriefings: [],
    });

    expect(response.briefing).toBeNull();
    expect(response.current.temperature_c).toBeNull();
    expect(response.air_quality.aqi_value).toBeNull();
    expect(response.water_signal.station_name).toBeNull();
    expect(response.source_freshness).toEqual([
      {
        source: "weather",
        updated_at: null,
        observed_at: null,
        status: "missing",
        detail: "No weather snapshot is available for this city.",
      },
      {
        source: "air_quality",
        updated_at: null,
        observed_at: null,
        status: "missing",
        detail: "No air quality snapshot is available for this city.",
      },
      {
        source: "water",
        updated_at: null,
        observed_at: null,
        status: "missing",
        detail: "No water snapshot is available for this city.",
      },
    ]);
  });
});
