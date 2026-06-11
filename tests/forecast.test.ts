import { describe, expect, it } from "vitest";
import { buildForecastResponse } from "@/lib/forecast";

const city = {
  id: "city-1",
  slug: "amsterdam",
  name: "Amsterdam",
  timezone: "Europe/Amsterdam",
};

const snapshot = {
  generatedAt: new Date("2026-06-11T08:00:00.000Z"),
  cycleComfortScore: 72,
  cycleComfortLabel: "fair",
  bestOutdoorWindow: "10:00-13:00",
  worstOutdoorWindow: "18:00-21:00",
  summaryPayload: {
    ui_summary: {
      best_window: "10:00-13:00",
      main_risk: "Evening gusts and showers",
      changed: "Rain risk increases after 18:00",
    },
    current: {
      weather_code: "partly_cloudy",
      warning_level: "yellow",
      rain_probability: 0.35,
    },
    outlook: {
      hourly: [
        {
          h: "09",
          rain: 10,
          wind: 18,
          temp: 16,
          apparent_temperature: 15,
          weather_code: "partly_cloudy",
        },
        {
          h: "12",
          rain: 20,
          wind: 22,
          temp: 18,
          apparent_temperature: 17,
          weather_code: "partly_cloudy",
        },
        {
          h: "15",
          rain: 45,
          wind: 28,
          temp: 17,
          apparent_temperature: 16,
          weather_code: "showers",
        },
        {
          h: "18",
          rain: 75,
          wind: 38,
          gust: 30,
          temp: 15,
          apparent_temperature: 12,
          weather_code: "heavy_showers",
        },
      ],
      weekly: [
        {
          day: "Thu",
          hi: 18,
          lo: 11,
          apparent_temperature_max: 17,
          apparent_temperature_min: 9,
          rain: 75,
          weather_code: "showers",
          wind: 32,
        },
        {
          day: "Fri",
          hi: 17,
          lo: 10,
          rain: 45,
          weather_code: "partly_cloudy",
          wind: 24,
        },
      ],
    },
    source_status: {
      weather: {
        source: "knmi",
        status: "fresh",
        observed_at: "2026-06-11T07:55:00.000Z",
        detail: null,
      },
      air_quality: {
        source: "luchtmeetnet",
        status: "fresh",
        observed_at: "2026-06-11T07:00:00.000Z",
        detail: null,
      },
      water: {
        source: "rijkswaterstaat",
        status: "stale",
        observed_at: "2026-06-10T07:50:00.000Z",
        detail: "Latest water observation is older than 24 hours.",
      },
    },
  },
  weatherSnapshot: {
    observedAt: new Date("2026-06-11T07:55:00.000Z"),
    temperatureC: 16,
    feelsLikeC: 15,
    rainMm: 0,
    rainProbability: 0.35,
    windSpeedKmh: 18,
    windGustKmh: 28,
    windDirection: "SW",
    weatherCode: "partly_cloudy",
    warningLevel: "yellow",
    sourceName: "knmi",
    ingestedAt: new Date("2026-06-11T07:58:00.000Z"),
  },
  airQualitySnapshot: {
    observedAt: new Date("2026-06-11T07:00:00.000Z"),
    sourceName: "luchtmeetnet",
    ingestedAt: new Date("2026-06-11T07:40:00.000Z"),
  },
  waterSnapshot: {
    observedAt: new Date("2026-06-10T07:50:00.000Z"),
    sourceName: "rijkswaterstaat",
    ingestedAt: new Date("2026-06-11T07:30:00.000Z"),
  },
};

describe("buildForecastResponse", () => {
  it("maps a dashboard snapshot into the Forecast API contract", () => {
    const response = buildForecastResponse(city, snapshot);

    expect(response.city).toEqual({
      slug: "amsterdam",
      name: "Amsterdam",
      timezone: "Europe/Amsterdam",
    });
    expect(response.generated_at).toBe("2026-06-11T08:00:00.000Z");
    expect(response.summary).toEqual({
      condition_label: "Partly cloudy",
      best_window: "10:00-13:00",
      worst_window: "18:00-21:00",
      main_risk: "Evening gusts and showers",
      next_change: "Rain risk increases after 18:00",
      warning_level: "yellow",
    });
    expect(response.hourly).toHaveLength(4);
    expect(response.hourly[0]).toMatchObject({
      label: "09",
      condition_label: "Partly cloudy",
      temperature_c: 16,
      apparent_temperature_c: 15,
      precipitation_probability: 10,
      wind_speed_kmh: 18,
    });
    expect(response.daily).toHaveLength(2);
    expect(response.daily[0]).toMatchObject({
      label: "Thu",
      temperature_max_c: 18,
      temperature_min_c: 11,
      apparent_temperature_max_c: 17,
      apparent_temperature_min_c: 9,
      precipitation_probability_max: 75,
      wind_speed_max_kmh: 32,
    });
    expect(response.source_freshness.map((entry) => entry.source)).toEqual([
      "knmi",
      "luchtmeetnet",
      "rijkswaterstaat",
      "knmi_warnings",
      "open_meteo",
    ]);
    expect(response.links.map((link) => link.label)).toEqual([
      "Open-Meteo KNMI forecast documentation",
      "KNMI Data Platform warnings dataset",
      "Project commands and data-source notes",
    ]);
  });

  it("derives deterministic warning, rain, wind, and stale-data risk events", () => {
    const response = buildForecastResponse(city, snapshot);

    expect(response.risk_timeline).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          category: "warning",
          severity: "warning",
        }),
        expect.objectContaining({
          category: "rain",
          severity: "warning",
          starts_at: "18",
        }),
        expect.objectContaining({
          category: "wind",
          severity: "watch",
          starts_at: "18",
        }),
        expect.objectContaining({
          category: "data",
          severity: "watch",
        }),
      ]),
    );
  });

  it("returns explicit unavailable states when forecast outlook is missing", () => {
    const response = buildForecastResponse(city, {
      ...snapshot,
      summaryPayload: {},
      weatherSnapshot: null,
      airQualitySnapshot: null,
      waterSnapshot: null,
    });

    expect(response.summary.condition_label).toBeNull();
    expect(response.summary.warning_level).toBe("unknown");
    expect(response.hourly).toEqual([]);
    expect(response.daily).toEqual([]);
    expect(response.risk_timeline).toEqual([
      expect.objectContaining({
        category: "data",
        severity: "watch",
        title: "Forecast data unavailable",
      }),
    ]);
    expect(response.source_freshness[0]).toMatchObject({
      source: "weather",
      status: "missing",
    });
  });

  it("normalizes persisted outlook rows even when the weather snapshot relation is missing", () => {
    const response = buildForecastResponse(city, {
      ...snapshot,
      weatherSnapshot: null,
    });

    expect(response.hourly).toHaveLength(4);
    expect(response.daily).toHaveLength(2);
    expect(response.daily[0]).toMatchObject({
      apparent_temperature_max_c: 17,
      apparent_temperature_min_c: 9,
    });
    expect(response.risk_timeline.map((event) => event.title)).not.toContain(
      "Forecast data unavailable",
    );
  });
});
