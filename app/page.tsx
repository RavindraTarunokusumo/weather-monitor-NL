import { headers } from "next/headers";
import { DashboardShell } from "./dashboard/components/DashboardShell";
import type { DashboardResponse } from "./dashboard/types";

export const dynamic = "force-dynamic";

async function getDashboard(): Promise<DashboardResponse> {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol = process.env.VERCEL === "1" ? "https" : "http";
  const response = await fetch(`${protocol}://${host}/api/dashboard?city=amsterdam`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Dashboard API returned ${response.status}`);
  }

  return response.json();
}

export default async function Home() {
  try {
    const dashboard = await getDashboard();
    return <DashboardShell initialDashboard={dashboard} />;
  } catch (error) {
    return (
      <main className="dashboard-page">
        <div className="dashboard-error">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1>Amsterdam data could not be loaded</h1>
          <p>
            Start PostgreSQL, run the Prisma migration and seed command, then refresh this page.
          </p>
          <p>{error instanceof Error ? error.message : "Unknown error"}</p>
        </div>
      </main>
    );
  }
}
