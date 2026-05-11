import { describe, expect, it } from "vitest";
import { shouldRunSeedAfterBuild } from "@/scripts/postbuild";

describe("postbuild seed guard", () => {
  it("skips db seed on Vercel production builds", () => {
    expect(shouldRunSeedAfterBuild({ VERCEL_ENV: "production" })).toBe(false);
  });

  it("keeps db seed for local and preview builds", () => {
    expect(shouldRunSeedAfterBuild({})).toBe(true);
    expect(shouldRunSeedAfterBuild({ VERCEL_ENV: "preview" })).toBe(true);
  });
});
