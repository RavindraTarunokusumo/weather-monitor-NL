import type { DashboardCycleComfort } from "@/lib/types/dashboard";

type Props = { data: DashboardCycleComfort };

export function CycleComfortCard({ data }: Props) {
  return (
    <article className="metric-card" aria-label="Cycle comfort">
      <p className="card-label">Cycle comfort</p>
      <p className="card-value">{data.score ?? "—"}</p>
      <p className="card-detail">{data.label ?? "Unknown conditions"}</p>
      {data.best_outdoor_window && (
        <p className="card-detail">Best: {data.best_outdoor_window}</p>
      )}
      {data.worst_outdoor_window && (
        <p className="card-detail">Avoid: {data.worst_outdoor_window}</p>
      )}
    </article>
  );
}
