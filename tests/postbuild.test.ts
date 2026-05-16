import { describe, expect, it } from "vitest";
import {
  getSeedSkipReason,
  getSeedSpawnOptions,
  shouldRunSeedAfterBuild,
} from "@/scripts/postbuild";

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

  it("skips db seed for local builds unless explicitly requested", () => {
    expect(shouldRunSeedAfterBuild({})).toBe(false);
    expect(shouldRunSeedAfterBuild({ VERCEL_ENV: "preview" })).toBe(false);
    expect(shouldRunSeedAfterBuild({ RUN_DB_SEED_AFTER_BUILD: "true" })).toBe(true);
  });

  it("reports the reason when db seed is skipped", () => {
    expect(getSeedSkipReason({ SKIP_DB_SEED: "true" })).toBe("SKIP_DB_SEED=true");
    expect(getSeedSkipReason({ VERCEL_ENV: "production" })).toBe(
      "VERCEL_ENV=production",
    );
    expect(getSeedSkipReason({ VERCEL: "1", VERCEL_ENV: "preview" })).toBe(
      "VERCEL=1",
    );
    expect(getSeedSkipReason({ VERCEL_ENV: "preview" })).toBe(
      "RUN_DB_SEED_AFTER_BUILD is not true",
    );
    expect(getSeedSkipReason({ RUN_DB_SEED_AFTER_BUILD: "true" })).toBeNull();
  });

  it("runs the seed command through cmd on Windows", () => {
    expect(getSeedSpawnOptions("win32")).toMatchObject({
      executable: "cmd.exe",
      args: ["/d", "/s", "/c", "npx.cmd", "prisma", "db", "seed"],
      options: { shell: false },
    });
  });
});
