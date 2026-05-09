type DashboardQuestionData = {
  city?: {
    name?: string | null;
  };
  current?: {
    rain_probability?: number | null;
    wind_speed_kmh?: number | null;
    wind_gust_kmh?: number | null;
  };
  cycle_comfort?: {
    score?: number | null;
    label?: string | null;
    best_outdoor_window?: string | null;
  };
  briefing?: string | null;
};

const unavailable = "That detail is unavailable in the current dashboard data.";

function formatPercent(value: number | null | undefined) {
  return typeof value === "number" ? `${Math.round(value * 100)}%` : null;
}

export function answerDashboardQuestion(dashboard: DashboardQuestionData, question: string) {
  const normalized = question.toLowerCase();
  const cityName = dashboard.city?.name ?? "this city";

  if (normalized.includes("rain") || normalized.includes("umbrella")) {
    const chance = formatPercent(dashboard.current?.rain_probability);
    return chance
      ? `${cityName} has a ${chance} rain chance in the current dashboard data.`
      : unavailable;
  }

  if (
    normalized.includes("cycl") ||
    normalized.includes("bike") ||
    normalized.includes("biking")
  ) {
    const score = dashboard.cycle_comfort?.score;
    const window = dashboard.cycle_comfort?.best_outdoor_window;
    if (typeof score !== "number") {
      return unavailable;
    }

    return window
      ? `Cycle comfort is ${score}/100. Best outdoor window: ${window}.`
      : `Cycle comfort is ${score}/100.`;
  }

  if (normalized.includes("wind") || normalized.includes("gust")) {
    const wind = dashboard.current?.wind_speed_kmh;
    const gust = dashboard.current?.wind_gust_kmh;
    if (typeof wind !== "number") {
      return unavailable;
    }

    return typeof gust === "number"
      ? `Wind is ${wind} km/h with gusts up to ${gust} km/h.`
      : `Wind is ${wind} km/h.`;
  }

  return dashboard.briefing ?? unavailable;
}
