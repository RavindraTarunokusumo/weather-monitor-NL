import { describe, expect, it } from "vitest";
import type { ForecastHour, ForecastRiskEvent, ForecastSummary } from "@/lib/types/forecast";
import {
  comfortLabel,
  formatHourClock,
  hourNumberFromEntry,
  maxRainChance,
  narrativeSentences,
  parseHourRange,
  radarScores,
} from "../format";

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

  it("returns Unavailable when wind or precipitation data is wholly missing", () => {
    expect(
      comfortLabel([
        hour({ wind_speed_kmh: null }),
        hour({ wind_speed_kmh: null }),
      ]),
    ).toBe("Unavailable");
    expect(
      comfortLabel([
        hour({ precipitation_probability: null }),
        hour({ precipitation_probability: null }),
      ]),
    ).toBe("Unavailable");
  });
});

describe("formatHourClock", () => {
  it("formats ISO timestamps in the city timezone", () => {
    expect(formatHourClock("2026-06-11T09:00:00.000Z", "Europe/Amsterdam")).toBe("11:00");
  });

  it("formats production label-style hours instead of misparsing them as years", () => {
    expect(formatHourClock("09", "Europe/Amsterdam")).toBe("09:00");
    expect(formatHourClock("18", "Europe/Amsterdam")).toBe("18:00");
    expect(formatHourClock("18:00", "Europe/Amsterdam")).toBe("18:00");
  });

  it("returns Unavailable for unparseable values", () => {
    expect(formatHourClock("Mon", "Europe/Amsterdam")).toBe("Unavailable");
    expect(formatHourClock("", "Europe/Amsterdam")).toBe("Unavailable");
    expect(formatHourClock("31", "Europe/Amsterdam")).toBe("Unavailable");
  });
});

describe("hourNumberFromEntry", () => {
  it("derives the hour from ISO starts_at in the city timezone", () => {
    expect(hourNumberFromEntry(hour(), "Europe/Amsterdam")).toBe(11);
  });

  it("falls back to bare-hour starts_at and labels without Date misparsing", () => {
    expect(hourNumberFromEntry(hour({ starts_at: "09" }), "Europe/Amsterdam")).toBe(9);
    expect(hourNumberFromEntry(hour({ starts_at: "18", label: "18" }), "Europe/Amsterdam")).toBe(18);
    expect(hourNumberFromEntry(hour({ starts_at: "n/a", label: "07" }), "Europe/Amsterdam")).toBe(7);
  });

  it("returns null when nothing parses", () => {
    expect(hourNumberFromEntry(hour({ starts_at: "n/a", label: "Mon" }), "Europe/Amsterdam")).toBeNull();
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

describe("parseHourRange", () => {
  it("parses valid HH:MM-HH:MM ranges", () => {
    expect(parseHourRange("10:00-13:00")).toEqual({ startHour: 10, endHour: 13 });
    expect(parseHourRange("9:30-21:45")).toEqual({ startHour: 9, endHour: 21 });
    expect(parseHourRange(" 08:00 - 11:00 ")).toEqual({ startHour: 8, endHour: 11 });
  });

  it("returns null for invalid or missing inputs", () => {
    expect(parseHourRange(null)).toBeNull();
    expect(parseHourRange(undefined)).toBeNull();
    expect(parseHourRange("")).toBeNull();
    expect(parseHourRange("10-13")).toBeNull();
    expect(parseHourRange("10:00–13:00")).toBeNull();
    expect(parseHourRange("25:00-13:00")).toBeNull();
    expect(parseHourRange("10:60-13:00")).toBeNull();
    expect(parseHourRange("best window")).toBeNull();
  });
});

function riskEvent(overrides: Partial<ForecastRiskEvent> = {}): ForecastRiskEvent {
  return {
    starts_at: "2026-06-11T08:00:00.000Z",
    ends_at: null,
    severity: "warning",
    category: "rain",
    title: "Heavy shower risk",
    detail: "Precipitation probability reaches 75%.",
    ...overrides,
  };
}

describe("radarScores", () => {
  it("returns default scores for empty hourly and timeline inputs", () => {
    expect(radarScores([], [], "Unavailable")).toEqual({
      rain: 10,
      wind: 10,
      gusts: 10,
      comfort: 10,
      visibility: 10,
      thunder: 10,
    });
  });

  it("derives rain, wind, and gust scores from hourly data", () => {
    expect(
      radarScores(
        [
          hour({ precipitation_probability: 75, wind_speed_kmh: 38, wind_gust_kmh: 52 }),
          hour({ precipitation_probability: 20, wind_speed_kmh: 18, wind_gust_kmh: 28 }),
        ],
        [],
        "Fair",
      ),
    ).toEqual({
      rain: 75,
      wind: 76,
      gusts: 78,
      comfort: 50,
      visibility: 10,
      thunder: 10,
    });
  });

  it("caps wind and gust scores at 100", () => {
    expect(
      radarScores(
        [hour({ wind_speed_kmh: 80, wind_gust_kmh: 90 })],
        [],
        "Poor",
      ),
    ).toEqual({
      rain: 10,
      wind: 100,
      gusts: 100,
      comfort: 80,
      visibility: 10,
      thunder: 10,
    });
  });

  it("maps comfort labels to risk scores", () => {
    const hourly = [hour()];
    expect(radarScores(hourly, [], "Good").comfort).toBe(20);
    expect(radarScores(hourly, [], "Fair").comfort).toBe(50);
    expect(radarScores(hourly, [], "Poor").comfort).toBe(80);
    expect(radarScores(hourly, [], "Unavailable").comfort).toBe(10);
  });

  it("maps matching timeline severities onto visibility and thunder axes", () => {
    expect(
      radarScores(
        [hour()],
        [
          riskEvent({ category: "visibility" as ForecastRiskEvent["category"], severity: "watch" }),
          riskEvent({ category: "thunder" as ForecastRiskEvent["category"], severity: "severe" }),
        ],
        "Good",
      ),
    ).toEqual({
      rain: 10,
      wind: 36,
      gusts: 42,
      comfort: 20,
      visibility: 50,
      thunder: 100,
    });
  });

  it("uses the highest severity when multiple timeline events share a category", () => {
    expect(
      radarScores(
        [hour()],
        [
          riskEvent({ category: "visibility" as ForecastRiskEvent["category"], severity: "info" }),
          riskEvent({ category: "visibility" as ForecastRiskEvent["category"], severity: "warning" }),
        ],
        "Good",
      ).visibility,
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