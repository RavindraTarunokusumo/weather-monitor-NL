import React from "react";
import { formatDateTime } from "../format";
import type { DashboardResponse } from "../types";

type SourceFreshnessFooterProps = {
  dashboard: DashboardResponse;
};

export function SourceFreshnessFooter({ dashboard }: SourceFreshnessFooterProps) {
  return (
    <footer className="source-footer" aria-label="Source freshness">
      <span>Data sources</span>
      {dashboard.source_freshness.map((source) => (
        <div key={source.source}>
          <strong>{source.source}</strong>
          <span>Updated {formatDateTime(source.updated_at, dashboard.city.timezone)}</span>
        </div>
      ))}
      <span>All times in Europe/Amsterdam</span>
    </footer>
  );
}
