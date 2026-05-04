import { formatAqi } from "@/lib/utils/format";
import type { DashboardAirQuality } from "@/lib/types/dashboard";

type Props = { data: DashboardAirQuality };

export function AirQualityCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Air quality">
      <p className="card-label">Air quality</p>
      <p className="card-value">{data.label ?? "—"}</p>
      <p className="card-detail">{formatAqi(data.aqi_value, null)}</p>
      {data.main_pollutant && (
        <p className="card-detail">Main: {data.main_pollutant}</p>
      )}
      {data.trend && (
        <p className="card-detail">Trend: {data.trend}</p>
      )}
    </article>
  );
}
