import { describe, expect, it } from "vitest";
import { answerDashboardQuestion } from "../qa";

const dashboard = {
  city: { name: "Amsterdam" },
  current: { rain_probability: 0.2, wind_speed_kmh: 18, wind_gust_kmh: 32 },
  cycle_comfort: { score: 78, label: "good", best_outdoor_window: "10:00-16:00" },
  briefing: "Today looks comfortable for Amsterdam.",
};

describe("answerDashboardQuestion", () => {
  it("answers rain questions from normalized dashboard data", () => {
    expect(answerDashboardQuestion(dashboard, "Will it rain this evening?")).toContain("20%");
  });

  it("answers cycling questions from cycle comfort data", () => {
    expect(answerDashboardQuestion(dashboard, "Is cycling good today?")).toContain("78/100");
  });

  it("falls back to the briefing for broad questions", () => {
    expect(answerDashboardQuestion(dashboard, "What should I know?")).toBe(
      "Today looks comfortable for Amsterdam.",
    );
  });
});
