import { headers } from "next/headers";
import { LiveDashboard } from "@/app/components/live-dashboard";
import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

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

async function getServerCities(): Promise<CityListEntry[]> {
  const base = await getBaseUrl();

  try {
    const res = await fetch(`${base}/api/cities`, { cache: "no-store" });
    if (!res.ok) return [{ slug: "amsterdam", name: "Amsterdam" }];
    const data = (await res.json()) as { cities?: CityListEntry[] | null };
    return data.cities ?? [{ slug: "amsterdam", name: "Amsterdam" }];
  } catch {
    return [{ slug: "amsterdam", name: "Amsterdam" }];
  }
}

export default async function Home({
  searchParams,
}: {
  searchParams?: Promise<{ city?: string }>;
}) {
  let dashboard: DashboardResponse;
  let cities: CityListEntry[];
  const params = await searchParams;

  try {
    cities = await getServerCities();
    const selectedCity = cities.some((city) => city.slug === params?.city)
      ? params?.city ?? "amsterdam"
      : "amsterdam";
    dashboard = await getServerDashboard(selectedCity);
  } catch (error) {
    return (
      <main className="page-shell">
        <div className="error-box">
          <p className="eyebrow">Dashboard unavailable</p>
          <h1>Dashboard data could not be loaded</h1>
          <p className="subtitle">
            Start PostgreSQL, run the Prisma migration, ingest source data, regenerate dashboard
            snapshots, then refresh this page.
          </p>
          <p className="card-detail">
            {error instanceof Error ? error.message : "Unknown error"}
          </p>
        </div>
      </main>
    );
  }

  return (
    <LiveDashboard
      initialData={dashboard}
      initialCity={dashboard.city.slug}
      cities={cities}
    />
  );
}
