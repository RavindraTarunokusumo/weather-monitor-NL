import { formatWaterLevel, riskColor } from "@/lib/utils/format";
import type { DashboardWaterSignal } from "@/lib/types/dashboard";

type Props = { data: DashboardWaterSignal };

export function WaterSignalCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Water signal">
      <p className="card-label">Water signal</p>
      <p className={`card-value ${riskColor(data.risk_label)}`}>
        {data.risk_label ?? "—"}
      </p>
      {data.station_name && (
        <p className="card-detail">{data.station_name}</p>
      )}
      <p className="card-detail">
        {formatWaterLevel(data.water_level_cm)}
        {data.trend ? `, trend: ${data.trend}` : ""}
      </p>
    </article>
  );
}
