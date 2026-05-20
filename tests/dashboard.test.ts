import { describe, expect, it } from "vitest";
import { buildDashboardResponse } from "@/lib/dashboard";
import { readFileSync } from "node:fs";
import path from "node:path";

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
    ui_summary: {
      best_window: "10:00-16:00",
      main_risk: "Evening showers and gusts",
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
        { h: "09", rain: 0, wind: 15, temp: 14 },
        { h: "12", rain: 0.1, wind: 17, temp: 16 },
        { h: "15", rain: 0.2, wind: 20, temp: 17 },
        { h: "18", rain: 0.9, wind: 26, temp: 16 },
        { h: "21", rain: 1.8, wind: 30, temp: 14 },
        { h: "00", rain: 1.1, wind: 28, temp: 13 },
      ],
      weekly: [
        { day: "Mon", hi: 14, lo: 9, rain: 80 },
        { day: "Tue", hi: 15, lo: 10, rain: 40 },
        { day: "Wed", hi: 17, lo: 11, rain: 20 },
        { day: "Thu", hi: 16, lo: 11, rain: 30 },
        { day: "Fri", hi: 16, lo: 10, rain: 20 },
        { day: "Sat", hi: 13, lo: 8, rain: 70 },
        { day: "Sun", hi: 12, lo: 7, rain: 90 },
      ],
    },
    water_signal: {
      weekly_levels_cm: [14, 13, 14, 15, 14, 16, 15],
    },
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
    weatherCode: "partly_cloudy",
    warningLevel: "none",
    sourceName: "mock_knmi",
    ingestedAt: new Date("2026-05-03T09:58:00.000Z"),
  },
  airQualitySnapshot: {
    observedAt: new Date("2026-05-03T09:00:00.000Z"),
    aqiValue: 42,
    aqiLabel: "Good",
    pm25: 12,
    pm10: 22,
    no2: 18,
    o3: 46,
    so2: 6,
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
        condition_label: "Partly cloudy",
        warning_level: "none",
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
        pollutants: {
          pm25: 12,
          pm10: 22,
          no2: 18,
          o3: 46,
          so2: 6,
        },
      },
      water_signal: {
        station_name: "Amsterdam mock station",
        water_level_cm: 14,
        risk_label: "normal",
        weekly_levels_cm: [14, 13, 14, 15, 14, 16, 15],
      },
      summary_payload: {
        source: "seed",
      },
      ui_summary: {
        best_window: "10:00-16:00",
        main_risk: "Evening showers and gusts",
        changed: "Warmer than yesterday",
      },
    });
    expect(response.outlook.hourly).toHaveLength(9);
    expect(response.outlook.weekly).toHaveLength(7);
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

    expect(response.briefing).toBe(
      "Best outdoor window: 10:00-16:00. Main risk: Evening showers and gusts. What changed: Warmer than yesterday.",
    );
    expect(response.current.temperature_c).toBeNull();
    expect(response.current.condition_label).toBeNull();
    expect(response.air_quality.aqi_value).toBeNull();
    expect(response.air_quality.pollutants).toEqual({
      pm25: null,
      pm10: null,
      no2: null,
      o3: null,
      so2: null,
    });
    expect(response.water_signal.station_name).toBeNull();
    expect(response.water_signal.weekly_levels_cm).toEqual([]);
    expect(response.outlook.hourly).toEqual([]);
    expect(response.outlook.weekly).toEqual([]);
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

  it("returns a deterministic briefing fallback from ui summary when no AI briefing exists", () => {
    const response = buildDashboardResponse(city, {
      ...snapshot,
      aiBriefings: [],
    });

    expect(response.briefing).toBe(
      "Best outdoor window: 10:00-16:00. Main risk: Evening showers and gusts. What changed: Warmer than yesterday.",
    );
  });

  it("uses summary current metadata when the linked weather row has observation-only fields", () => {
    const response = buildDashboardResponse(city, {
      ...snapshot,
      summaryPayload: {
        ...(snapshot.summaryPayload as Record<string, unknown>),
        current: {
          weather_code: "partly_cloudy",
          warning_level: "yellow",
          rain_probability: 0.1,
        },
      },
      weatherSnapshot: {
        ...snapshot.weatherSnapshot,
        weatherCode: null,
        warningLevel: null,
        rainProbability: null,
      },
    });

    expect(response.current).toMatchObject({
      condition_label: "Partly cloudy",
      warning_level: "yellow",
      rain_probability: 0.1,
    });
  });

  it("uses summary water metadata when the linked water row has observation-only fields", () => {
    const response = buildDashboardResponse(city, {
      ...snapshot,
      summaryPayload: {
        ...(snapshot.summaryPayload as Record<string, unknown>),
        water_signal: {
          trend: "rising",
          risk_label: "normal",
          weekly_levels_cm: [9, 10, 10, 11, 12, 12, 13],
        },
      },
      waterSnapshot: {
        ...snapshot.waterSnapshot,
        trendLabel: "unknown",
        riskLabel: null,
      },
    });

    expect(response.water_signal).toMatchObject({
      water_level_cm: 14,
      trend: "rising",
      risk_label: "normal",
      weekly_levels_cm: [9, 10, 10, 11, 12, 12, 13],
    });
  });
});

describe("provided dashboard HTML chart contract", () => {
  it("normalizes the 24-hour outlook chart to 24 bins with thinned axis labels", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("function buildHourlyBins");
    expect(html).toContain("Array.from({ length: 24 }");
    expect(html).toContain("const labelHours = new Set([0, 3, 6, 9, 12, 15, 18, 21, 23])");
    expect(html).toContain("function niceAxisMax(value, tickCount = 4)");
    expect(html).toContain("function paddedDomain(values, padding = 1, minimumSpan = 4)");
    expect(html).toContain("const rMax = niceAxisMax(Math.max(...rains, 0), 4)");
    expect(html).toContain("const wMax = niceAxisMax(Math.max(...winds, 0), 4)");
    expect(html).toContain("return Math.max(step * tickCount, Math.ceil(value / step) * step)");
    expect(html).toContain("const rainTicks = chartTicks(0, rMax, 4)");
    expect(html).toContain("const windTicks = chartTicks(0, wMax, 4)");
    expect(html).toContain("const tempTicks = chartTicks(tMin, tMax, 4)");
    expect(html).toContain("Rain chance (%)");
    expect(html).toContain("rain chance");
    expect(html).toContain("const PAD = { top: 14, right: 62, bottom: 30, left: 36 }");
    expect(html).toContain("x={PAD.left - 14}");
    expect(html).toContain("x={PAD.left + innerW + 14}");
    expect(html).toContain("x={PAD.left + innerW + 44}");
    expect(html).toContain("height: 228");
  });
});

describe("provided dashboard HTML hero contract", () => {
  it("keeps the desktop briefing panel content-fit instead of fixed to half the hero", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain(".briefing-static {");
    expect(html).toContain("width: 400px;");
    expect(html).toContain("padding: 22px 24px;");
    expect(html).toContain("display: flex; flex-direction: column; gap: 12px;");
    expect(html).not.toContain("height: isMobile ? 'auto' : 'calc(50% - 20px)'");
    expect(html).not.toContain("height: isMobile ? 'auto' : 'fit-content'");
  });

  it("renders the responsive briefing pill in the public dashboard HTML", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("const [briefingOpen, setBriefingOpen] = useState(false)");
    expect(html).toContain(".briefing-collapsible.open {");
    expect(html).toContain("--sans: 'DM Sans', Arial, sans-serif;");
    expect(html).toContain("width: calc(50% - 24px);");
    expect(html).toContain("max-height: calc(100% - 32px);");
    expect(html).toContain(".briefing-pill {");
    expect(html).toContain("position: absolute; top: 0; left: 0;");
    expect(html).toContain("height: 46px;");
    expect(html).toContain(".briefing-header {");
    expect(html).toContain("padding: 10px 14px 5px;");
    expect(html).toContain(".briefing-scroll {");
    expect(html).toContain("padding: 2px 14px 10px;");
    expect(html).toContain("<BriefingItems items={city.aiSummary} size=\"sm\" />");
    expect(html).toContain("<BriefingItems items={city.aiSummary} size=\"md\" />");
    expect(html).not.toContain("isBriefingPill");
    expect(html).not.toContain("height: briefingOpen ? 0 : 44");
  });

  it("renders the smartphone briefing panel below the non-cropping hero image", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("@media (max-width: 639px) {");
    expect(html).toContain(".briefing-collapsible { display: none; }");
    expect(html).toContain(".briefing-mobile-panel { display: flex; }");
    expect(html).toContain("className=\"briefing-mobile-panel\"");
    expect(html).toContain("aria-label=\"Today's mobile briefing\"");
    expect(html).toContain("className=\"ai-sparkle-icon\"");
    expect(html).toContain("className=\"briefing-chevron\"");
    expect(html).toContain("<MetricIcon type=\"spark\" size={16} className=\"ai-sparkle-icon\" alt=\"\" />");
    expect(html).not.toContain("M12 2l2.4 7.4H22");
  });

  it("uses city-specific public hero images in the dashboard shell", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("const HERO_IMAGE_SRC = {");
    expect(html).toContain("amsterdam: '/dashboard-assets/amsterdam-day.png'");
    expect(html).toContain("rotterdam: '/dashboard-assets/rotterdam-day.png'");
    expect(html).toContain("utrecht: '/dashboard-assets/utrecht-day.png'");
    expect(html).toContain("src={heroImageSrc}");
    expect(html).not.toContain("src=\"/dashboard-assets/amsterdam-day.png\"");
    expect(html).not.toContain("src='/dashboard-assets/amsterdam-day.png'");
    expect(html).not.toContain("src={'/dashboard-assets/amsterdam-day.png'}");
  });

  it("shows the full hero image and keeps enough height for the briefing panel", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("aspectRatio: '1672 / 941'");
    expect(html).toContain("objectFit: 'contain'");
    expect(html).not.toContain("height: isMobile ? 480 : undefined");
    expect(html).not.toContain("objectFit: isMobile ? 'cover' : 'contain'");
    expect(html).not.toContain("height: 300, background: '#2a3a50'");
    expect(html).not.toContain("minHeight: isMobile ? 480 : undefined");
  });

  it("keeps the React mobile hero image rule after broader phone overrides", () => {
    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    const phoneOverrideIndex = css.indexOf("@media (max-width: 760px)");
    const finalMobileIndex = css.lastIndexOf("@media (max-width: 639px)");
    const finalMobileCss = css.slice(finalMobileIndex);

    expect(phoneOverrideIndex).toBeGreaterThan(-1);
    expect(finalMobileIndex).toBeGreaterThan(phoneOverrideIndex);
    expect(finalMobileCss).toContain(".briefing-hero .hero-image");
    expect(finalMobileCss).toContain("object-fit: contain;");
  });

  it("collapses the React current-weather overlay into an aligned mobile chip only in final mobile CSS", () => {
    const css = readFileSync(path.join(process.cwd(), "app/globals.css"), "utf8");
    const finalMobileIndex = css.lastIndexOf("@media (max-width: 639px)");
    const finalMobileCss = css.slice(finalMobileIndex);

    expect(finalMobileCss).toContain(".current-weather-card {");
    expect(finalMobileCss).toContain("width: 76px;");
    expect(finalMobileCss).toContain("min-width: 0;");
    expect(finalMobileCss).toContain("right: 8px;");
    expect(finalMobileCss).not.toContain("right: auto;");
    expect(finalMobileCss).not.toContain("left: min(calc(100% - 112px), calc(100vw - 126px));");
    expect(finalMobileCss).toContain(".current-weather-card .weather-card-top img");
    expect(finalMobileCss).toContain("font-size: 18px;");
    expect(finalMobileCss).toContain("justify-content: center;");
    expect(finalMobileCss).toContain("display: none;");
    expect(finalMobileCss).not.toContain(".metric-tile-compact-mobile");
  });

  it("keeps mobile hero and metric cards from forcing horizontal overflow", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("width: '100%', maxWidth: '100%'");
    expect(html).toContain("repeat(2, minmax(0, 1fr))");
    expect(html).toContain("repeat(3, minmax(0, 1fr))");
    expect(html).toContain("repeat(5, minmax(0, 1fr))");
    expect(html).toContain("flexDirection: 'column', minWidth: 0");
  });

  it("keeps the top-left temperature metric at the original size on mobile", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).not.toContain("compactMobile: true");
    expect(html).not.toContain("isMobile && m.compactMobile");
    expect(html).toContain("padding: '14px 14px 12px'");
    expect(html).toContain("MetricIcon type={m.icon} size={24}");
    expect(html).toContain("fontSize: 26");
  });

  it("collapses the current weather overlay into an aligned mobile chip in the public dashboard HTML", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");

    expect(html).toContain("const compactWeatherCard = isMobile;");
    expect(html).not.toContain("calc(100vw - 124px)");
    expect(html).toContain("right: compactWeatherCard ? 10 : 20");
    expect(html).toContain("left: undefined");
    expect(html).toContain("padding: compactWeatherCard ? '6px 8px' : '12px 14px'");
    expect(html).toContain("minWidth: compactWeatherCard ? 0 : 140");
    expect(html).toContain("width: compactWeatherCard ? 76 : undefined");
    expect(html).toContain("maxWidth: compactWeatherCard ? 76 : undefined");
    expect(html).toContain("justifyContent: compactWeatherCard ? 'center' : undefined");
    expect(html).toContain("marginBottom: compactWeatherCard ? 0 : 3");
    expect(html).toContain("WeatherIcon condition={city.rainProb > 50 ? 'rain' : city.rainProb > 25 ? 'partly' : 'sunny'} size={compactWeatherCard ? 18 : 28}");
    expect(html).toContain("fontSize: compactWeatherCard ? 20 : 26");
    expect(html).toContain("{!compactWeatherCard && <React.Fragment>");
  });

  it("does not read city-specific hero fields before the loading guard", () => {
    const html = readFileSync(path.join(process.cwd(), "Dutch Weather Dashboard.html"), "utf8");
    const guardIndex = html.indexOf("if (!city) {");
    const heroLookupIndex = html.indexOf("const heroImageSrc = HERO_IMAGE_SRC[city.slug]");

    expect(guardIndex).toBeGreaterThan(-1);
    expect(heroLookupIndex).toBeGreaterThan(-1);
    expect(heroLookupIndex).toBeGreaterThan(guardIndex);
  });
});
