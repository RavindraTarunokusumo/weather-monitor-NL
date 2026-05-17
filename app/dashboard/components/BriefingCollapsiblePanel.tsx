"use client";

/* eslint-disable @next/next/no-img-element */

import React, { useState } from "react";
import type { BriefingItem } from "./BriefingHero";

type BriefingCollapsiblePanelProps = {
  date: string;
  items: BriefingItem[];
};

export function BriefingCollapsiblePanel({ date, items }: BriefingCollapsiblePanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`briefing-collapsible glass-panel${open ? " open" : ""}`}>
      <button
        type="button"
        className="briefing-pill"
        aria-expanded={open}
        aria-controls="briefing-collapsible-content"
        onClick={() => setOpen(true)}
      >
        <img src="/dashboard-assets/icon-spark.png" alt="" />
        <span>Today&apos;s Briefing</span>
        <span className="briefing-chevron" aria-hidden="true">
          <svg viewBox="0 0 20 20" focusable="false">
            <path d="M7 5l5 5-5 5" />
          </svg>
        </span>
      </button>
      <div
        id="briefing-collapsible-content"
        className="briefing-expanded"
        role="region"
        aria-label="Expanded briefing"
        aria-hidden={!open}
      >
        <div className="briefing-expanded-header">
          <p className="eyebrow orange">Today&apos;s briefing</p>
          <button
            type="button"
            className="briefing-close"
            aria-label="Close briefing panel"
            tabIndex={open ? 0 : -1}
            onClick={() => setOpen(false)}
          >
            <svg viewBox="0 0 20 20" focusable="false">
              <path d="M5 5l10 10M15 5L5 15" />
            </svg>
          </button>
        </div>
        <div className="briefing-scroll">
          <h1>{date}</h1>
          <span className="ai-badge">
            <img src="/dashboard-assets/icon-spark.png" alt="" />
            AI summary
          </span>
          <div className="summary-list">
            {items.map((item) => (
              <div className="summary-item" key={item.label} style={{ "--briefing-dot-color": item.dotColor } as React.CSSProperties}>
                <span className="summary-icon" aria-hidden="true">
                  {item.icon}
                </span>
                <p>
                  <strong>{item.label}:</strong> {item.value}
                  {item.detail ? ` - ${item.detail}` : ""}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
