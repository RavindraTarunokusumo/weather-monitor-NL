import { describe, expect, it } from "vitest";
import type { ForecastHour, ForecastSummary } from "@/lib/types/forecast";
import { comfortLabel, maxRainChance, narrativeSentences } from "../format";

function hour(overrides: Partial<ForecastHour> = {}): ForecastHour {
  return {
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
    ...overrides,
  };
}

describe("comfortLabel", () => {
  it("returns Unavailable for empty hourly input", () => {
    expect(comfortLabel([])).toBe("Unavailable");
  });

  it("returns Unavailable when apparent temperatures are missing", () => {
    expect(
      comfortLabel([
        hour({ apparent_temperature_c: null }),
        hour({ apparent_temperature_c: null }),
      ]),
    ).toBe("Unavailable");
  });

  it("returns Good when all comfort bounds are met", () => {
    expect(
      comfortLabel([
        hour({ apparent_temperature_c: 18, wind_speed_kmh: 20, precipitation_probability: 20 }),
        hour({ apparent_temperature_c: 22, wind_speed_kmh: 15, precipitation_probability: 10 }),
      ]),
    ).toBe("Good");
  });

  it("returns Fair when one bound is exceeded", () => {
    expect(
      comfortLabel([
        hour({ apparent_temperature_c: 18, wind_speed_kmh: 32, precipitation_probability: 20 }),
        hour({ apparent_temperature_c: 20, wind_speed_kmh: 18, precipitation_probability: 15 }),
      ]),
    ).toBe("Fair");
  });

  it("returns Poor when multiple bounds are exceeded", () => {
    expect(
      comfortLabel([
        hour({ apparent_temperature_c: 8, wind_speed_kmh: 35, precipitation_probability: 60 }),
        hour({ apparent_temperature_c: 30, wind_speed_kmh: 40, precipitation_probability: 75 }),
      ]),
    ).toBe("Poor");
  });
});

describe("maxRainChance", () => {
  it("returns null for empty hourly input", () => {
    expect(maxRainChance([])).toBeNull();
  });

  it("returns null when precipitation probability is missing", () => {
    expect(
      maxRainChance([
        hour({ precipitation_probability: null }),
        hour({ precipitation_probability: null }),
      ]),
    ).toBeNull();
  });

  it("returns the maximum probability across the next n hours", () => {
    expect(
      maxRainChance(
        [
          hour({ precipitation_probability: 10 }),
          hour({ precipitation_probability: 75 }),
          hour({ precipitation_probability: 40 }),
        ],
        2,
      ),
    ).toBe(75);
  });
});

describe("narrativeSentences", () => {
  it("returns an empty array when all summary fields are null", () => {
    const summary: ForecastSummary = {
      condition_label: null,
      best_window: null,
      worst_window: null,
      main_risk: null,
      next_change: null,
      warning_level: null,
    };

    expect(narrativeSentences(summary)).toEqual([]);
  });

  it("composes template sentences only for present summary fields", () => {
    const summary: ForecastSummary = {
      condition_label: "Partly cloudy",
      best_window: "10:00-13:00",
      worst_window: null,
      main_risk: "Evening gusts and showers",
      next_change: null,
      warning_level: "yellow",
    };

    expect(narrativeSentences(summary)).toEqual([
      "Best window 10:00-13:00.",
      "Main risk: Evening gusts and showers.",
    ]);
  });
});