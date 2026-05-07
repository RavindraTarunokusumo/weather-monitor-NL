import { headers } from "next/headers";
import { DashboardShell } from "./dashboard/components/DashboardShell";
import type { DashboardResponse } from "./dashboard/types";

export const dynamic = "force-dynamic";

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
    throw new Error(`Dashboard API returned ${res.status}`);
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
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1>Dashboard data could not be loaded</h1>
          <p>
            Start PostgreSQL, run the Prisma migration, ingest source data, regenerate dashboard
            snapshots, then refresh this page.
          </p>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }
}
