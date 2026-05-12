import { describe, expect, it } from "vitest";
import { getSeedSkipReason, shouldRunSeedAfterBuild } from "@/scripts/postbuild";

describe("postbuild seed guard", () => {
  it("skips db seed on Vercel production builds", () => {
    expect(shouldRunSeedAfterBuild({ VERCEL_ENV: "production" })).toBe(false);
  });

  it("skips db seed on any Vercel deployment", () => {
    expect(shouldRunSeedAfterBuild({ VERCEL: "1", VERCEL_ENV: "preview" })).toBe(
      false,
    );
    expect(shouldRunSeedAfterBuild({ VERCEL: "1", VERCEL_ENV: "production" })).toBe(
      false,
    );
  });

  it("keeps db seed for local builds and isolated CI smoke builds", () => {
    expect(shouldRunSeedAfterBuild({})).toBe(true);
    expect(shouldRunSeedAfterBuild({ VERCEL_ENV: "preview" })).toBe(true);
  });

  it("reports the reason when db seed is skipped", () => {
    expect(getSeedSkipReason({ SKIP_DB_SEED: "true" })).toBe("SKIP_DB_SEED=true");
    expect(getSeedSkipReason({ VERCEL_ENV: "production" })).toBe(
      "VERCEL_ENV=production",
    );
    expect(getSeedSkipReason({ VERCEL: "1", VERCEL_ENV: "preview" })).toBe(
      "VERCEL=1",
    );
    expect(getSeedSkipReason({ VERCEL_ENV: "preview" })).toBeNull();
  });
});
