import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  prisma: {},
  ensureSupportedCities: vi.fn(),
  isAuthorizedJobRequest: vi.fn(),
  regenerateAllDashboardSnapshots: vi.fn(),
  runAllSourcesIngestion: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  prisma: mocks.prisma,
}));

vi.mock("@/lib/ingestion/jobs", () => ({
  isAuthorizedJobRequest: mocks.isAuthorizedJobRequest,
  runAllSourcesIngestion: mocks.runAllSourcesIngestion,
}));

vi.mock("@/lib/supported-cities", () => ({
  ensureSupportedCities: mocks.ensureSupportedCities,
}));

vi.mock("@/lib/dashboard-regeneration", () => ({
  regenerateAllDashboardSnapshots: mocks.regenerateAllDashboardSnapshots,
}));

describe("production live refresh automation", () => {
  beforeEach(() => {
    vi.resetModules();
    mocks.isAuthorizedJobRequest.mockReset();
    mocks.ensureSupportedCities.mockReset();
    mocks.regenerateAllDashboardSnapshots.mockReset();
    mocks.runAllSourcesIngestion.mockReset();
  });

  it("protects the refresh route and bootstraps supported cities before live ingestion", async () => {
    const routePath = path.join(process.cwd(), "app/api/jobs/refresh-live/route.ts");

    expect(existsSync(routePath)).toBe(true);

    const { GET } = await import("@/app/api/jobs/refresh-live/route");

    mocks.isAuthorizedJobRequest.mockReturnValueOnce(false);
    const unauthorized = await GET(new Request("https://example.test/api/jobs/refresh-live"));

    expect(unauthorized.status).toBe(401);
    expect(mocks.runAllSourcesIngestion).not.toHaveBeenCalled();
    expect(mocks.regenerateAllDashboardSnapshots).not.toHaveBeenCalled();

    mocks.isAuthorizedJobRequest.mockReturnValueOnce(true);
    mocks.ensureSupportedCities.mockResolvedValueOnce({
      count: 10,
      slugs: [
        "amsterdam",
        "arnhem",
        "breda",
        "den-haag",
        "dordrecht",
        "groningen",
        "maastricht",
        "nijmegen",
        "rotterdam",
        "utrecht",
      ],
    });
    mocks.runAllSourcesIngestion.mockResolvedValueOnce([{ type: "weather", results: [] }]);
    mocks.regenerateAllDashboardSnapshots.mockResolvedValueOnce([{ city: "amsterdam", created: true }]);

    const authorized = await GET(
      new Request("https://example.test/api/jobs/refresh-live?force=true", {
        headers: { Authorization: "Bearer cron-secret" },
      }),
    );
    const body = await authorized.json();

    expect(authorized.status).toBe(200);
    expect(mocks.ensureSupportedCities).toHaveBeenCalledWith(mocks.prisma);
    expect(mocks.runAllSourcesIngestion).toHaveBeenCalledWith({
      prisma: mocks.prisma,
      mode: "live",
    });
    expect(mocks.regenerateAllDashboardSnapshots).toHaveBeenCalledWith({
      prisma: mocks.prisma,
      force: true,
    });
    expect(body).toMatchObject({
      status: "success",
      mode: "live",
      cityBootstrap: { count: 10 },
      ingestion: [{ type: "weather", results: [] }],
      regeneration: [{ city: "amsterdam", created: true }],
    });
  });

  it("returns a non-2xx status when any live ingestion result fails", async () => {
    const { GET } = await import("@/app/api/jobs/refresh-live/route");

    mocks.isAuthorizedJobRequest.mockReturnValueOnce(true);
    mocks.ensureSupportedCities.mockResolvedValueOnce({ count: 10, slugs: [] });
    mocks.runAllSourcesIngestion.mockResolvedValueOnce([
      {
        type: "weather",
        results: [
          {
            city: "amsterdam",
            result: {
              status: "failed",
              recordsFetched: 0,
              recordsStored: 0,
              error: "KNMI unavailable",
            },
          },
        ],
      },
    ]);
    mocks.regenerateAllDashboardSnapshots.mockResolvedValueOnce([{ city: "amsterdam", created: false }]);

    const response = await GET(new Request("https://example.test/api/jobs/refresh-live"));
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(mocks.regenerateAllDashboardSnapshots).toHaveBeenCalledWith({
      prisma: mocks.prisma,
      force: false,
    });
    expect(body).toMatchObject({
      status: "failed",
      mode: "live",
      ingestion: [
        {
          type: "weather",
          results: [
            {
              city: "amsterdam",
              result: { status: "failed", error: "KNMI unavailable" },
            },
          ],
        },
      ],
      regeneration: [{ city: "amsterdam", created: false }],
    });
  });

  it("registers a daily Vercel Cron for the production refresh route", () => {
    const vercelConfigPath = path.join(process.cwd(), "vercel.json");

    expect(existsSync(vercelConfigPath)).toBe(true);

    const config = JSON.parse(readFileSync(vercelConfigPath, "utf8")) as {
      crons?: Array<{ path: string; schedule: string }>;
    };

    expect(config.crons).toContainEqual({
      path: "/api/jobs/refresh-live",
      schedule: "0 5 * * *",
    });
  });
});
