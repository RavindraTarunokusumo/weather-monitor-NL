import React from "react";
import { formatDateTime } from "../format";
import type { DashboardResponse } from "../types";

type SourceFreshnessFooterProps = {
  dashboard: DashboardResponse;
};

const sourceLabels: Record<string, string> = {
  knmi: "KNMI",
  luchtmeetnet: "Luchtmeetnet",
  rijkswaterstaat: "Rijkswaterstaat",
};

export function SourceFreshnessFooter({ dashboard }: SourceFreshnessFooterProps) {
  return (
    <footer className="source-footer" aria-label="Source freshness">
      {dashboard.source_freshness.map((source) => (
        <div
          className="source-cell"
          key={source.source}
          aria-label={`${formatSourceName(source.source)} source freshness`}
        >
          <strong>{formatSourceName(source.source)}</strong>
          <span>Updated {formatDateTime(source.updated_at, dashboard.city.timezone)}</span>
          <span className="freshness-dot" aria-hidden="true" />
        </div>
      ))}
      <div className="source-cell source-timezone">All times in CEST</div>
    </footer>
  );
}

function formatSourceName(source: string) {
  const normalized = source.replace(/^mock_/, "").toLowerCase();
  return sourceLabels[normalized] ?? source;
}
