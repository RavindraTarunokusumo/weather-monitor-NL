import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

export async function getDashboard(city: string): Promise<DashboardResponse> {
  const res = await fetch(`/api/dashboard?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Dashboard API returned ${res.status}`);
  }

  return res.json() as Promise<DashboardResponse>;
}

export async function getCities(): Promise<CityListEntry[]> {
  const res = await fetch("/api/cities", { cache: "no-store" });
  if (!res.ok) return [];
  const data = (await res.json()) as { cities?: CityListEntry[] };
  return data.cities ?? [];
}
