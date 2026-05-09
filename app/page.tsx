import { headers } from "next/headers";
import { DashboardShell } from "./dashboard/components/DashboardShell";
import type { DashboardResponse } from "./dashboard/types";

export const dynamic = "force-dynamic";

class DashboardLoadError extends Error {
  constructor(
    message: string,
    readonly status: number,
  ) {
    super(message);
  }
}

async function getBaseUrl(): Promise<string> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL === "1" ? "https" : "http";
  return `${protocol}://${host}`;
}

async function getServerDashboard(city: string): Promise<DashboardResponse> {
  const base = await getBaseUrl();
  const res = await fetch(
    `${base}/api/dashboard?city=${encodeURIComponent(city)}`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    throw new DashboardLoadError(`Dashboard API returned ${res.status}`, res.status);
  }

  return res.json() as Promise<DashboardResponse>;
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string }>;
}) {
  const params = await searchParams;

  try {
    const dashboard = await getServerDashboard(params?.city ?? "amsterdam");
    return <DashboardShell initialDashboard={dashboard} />;
  } catch (error) {
    const isUnsupportedCity = error instanceof DashboardLoadError && error.status === 404;

    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <p className="eyebrow">{isUnsupportedCity ? "Unsupported city" : "Dashboard unavailable"}</p>
          <h1>{isUnsupportedCity ? "This city is not available" : "Dashboard data could not be loaded"}</h1>
          {isUnsupportedCity ? (
            <p>Choose Amsterdam, Rotterdam, or Utrecht to view the dashboard.</p>
          ) : (
            <p>
              Start PostgreSQL, run the Prisma migration, ingest source data, regenerate dashboard
              snapshots, then refresh this page.
            </p>
          )}
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }
}
