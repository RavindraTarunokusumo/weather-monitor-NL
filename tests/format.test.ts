import { describe, expect, it } from "vitest";
import {
  formatDate,
  formatTemp,
  formatFeelsLike,
  formatWind,
  formatPercent,
  formatAqi,
  formatWaterLevel,
  riskColor,
} from "@/lib/utils/format";

describe("formatDate", () => {
  it("formats an ISO string to Dutch locale", () => {
    const result = formatDate("2026-05-03T09:58:00.000Z");
    expect(result).toMatch(/\d/);
    expect(result).not.toBe("Unavailable");
  });

  it("returns Unavailable for null", () => {
    expect(formatDate(null)).toBe("Unavailable");
  });
});

describe("formatTemp", () => {
  it("formats a temperature with degree symbol", () => {
    expect(formatTemp(16.2)).toBe("16.2°C");
  });

  it("returns — for null", () => {
    expect(formatTemp(null)).toBe("—");
  });
});

describe("formatFeelsLike", () => {
  it("returns feels-like string with value", () => {
    expect(formatFeelsLike(15.4)).toBe("Feels like 15.4°C");
  });

  it("returns — for null", () => {
    expect(formatFeelsLike(null)).toBe("—");
  });
});

describe("formatWind", () => {
  it("combines speed and direction", () => {
    expect(formatWind(18, "WSW")).toBe("18 km/h WSW");
  });

  it("returns just speed when no direction", () => {
    expect(formatWind(18, null)).toBe("18 km/h");
  });

  it("returns — when speed is null", () => {
    expect(formatWind(null, "WSW")).toBe("—");
  });
});

describe("formatPercent", () => {
  it("formats 0.2 as 20%", () => {
    expect(formatPercent(0.2)).toBe("20% rain chance");
  });

  it("returns no-data string for null", () => {
    expect(formatPercent(null)).toBe("—");
  });
});

describe("formatAqi", () => {
  it("combines value and label", () => {
    expect(formatAqi(42, "Good")).toBe("42 – Good");
  });

  it("returns just value when label is null", () => {
    expect(formatAqi(42, null)).toBe("42");
  });

  it("returns — for null value", () => {
    expect(formatAqi(null, "Good")).toBe("—");
  });
});

describe("formatWaterLevel", () => {
  it("appends cm unit", () => {
    expect(formatWaterLevel(14)).toBe("14 cm");
  });

  it("returns — for null", () => {
    expect(formatWaterLevel(null)).toBe("—");
  });
});

describe("riskColor", () => {
  it("returns orange for elevated", () => {
    expect(riskColor("elevated")).toBe("text-orange-600");
  });

  it("returns red for high risk", () => {
    expect(riskColor("high")).toBe("text-red-600");
  });

  it("returns green for normal", () => {
    expect(riskColor("normal")).toBe("text-emerald-600");
  });

  it("returns muted for null", () => {
    expect(riskColor(null)).toBe("text-gray-400");
  });
});
