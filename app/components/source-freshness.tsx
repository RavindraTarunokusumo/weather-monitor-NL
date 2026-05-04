import { formatDate } from "@/lib/utils/format";
import type { DashboardFreshnessEntry } from "@/lib/types/dashboard";

type Props = { sources: DashboardFreshnessEntry[] };

export function SourceFreshness({ sources }: Props) {
  return (
    <section className="freshness-section" aria-label="Source freshness">
      <p className="freshness-label">Source freshness</p>
      <div className="freshness-grid">
        {sources.map((item) => (
          <div key={item.source} className="freshness-item">
            <span className="freshness-source">{item.source}</span>
            <span className="freshness-time">{formatDate(item.updated_at)}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
