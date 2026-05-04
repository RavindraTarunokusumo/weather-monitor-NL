import { formatTemp, formatFeelsLike, formatWind, formatPercent } from "@/lib/utils/format";
import type { DashboardCurrent } from "@/lib/types/dashboard";

type Props = { data: DashboardCurrent };

export function WeatherCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Current weather">
      <p className="card-label">Current weather</p>
      <p className="card-value">{formatTemp(data.temperature_c)}</p>
      <p className="card-detail">{formatFeelsLike(data.feels_like_c)}</p>
      <p className="card-detail">{formatPercent(data.rain_probability)}</p>
      <p className="card-detail">
        Wind {formatWind(data.wind_speed_kmh, data.wind_direction)}
      </p>
      {data.warning_level && data.warning_level !== "none" && (
        <p className="card-warning">⚠ {data.warning_level}</p>
      )}
    </article>
  );
}
