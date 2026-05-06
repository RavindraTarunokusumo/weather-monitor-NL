import type { DashboardResponse, CityListEntry } from "@/lib/types/dashboard";

export async function getDashboard(city: string): Promise<DashboardResponse> {
  const res = await fetch(`/api/dashboard?city=${encodeURIComponent(city)}`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Could not load dashboard data. Try refreshing in a moment.");
  }

  return res.json() as Promise<DashboardResponse>;
}

export async function getCities(): Promise<CityListEntry[] | null> {
  const res = await fetch("/api/cities", { cache: "no-store" });
  if (!res.ok) return null;
  const data = (await res.json()) as { cities?: CityListEntry[] };
  return data.cities ?? null;
}
