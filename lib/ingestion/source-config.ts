import { SUPPORTED_CITY_SOURCE_CONFIGS } from "@/lib/supported-cities";

export type CitySourceConfig = (typeof SUPPORTED_CITY_SOURCE_CONFIGS)[number];

export const SEEDED_CITY_SOURCE_CONFIGS: CitySourceConfig[] = SUPPORTED_CITY_SOURCE_CONFIGS;

export function getSourceConfig(citySlug: string) {
  const config = SEEDED_CITY_SOURCE_CONFIGS.find((item) => item.citySlug === citySlug);

  if (!config) {
    throw new Error(`No source configuration for city: ${citySlug}`);
  }

  return config;
}
