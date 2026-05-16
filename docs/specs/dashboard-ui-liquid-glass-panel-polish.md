# Dashboard UI Liquid Glass Panel Polish Spec

Status: Accepted
Spec path: `docs/specs/dashboard-ui-liquid-glass-panel-polish.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-05-15

## Goal

Polish the public Dutch Weather Intelligence dashboard by using the supplied `Dutch Weather Dashboard.html` as the source UI and changing only its data plumbing so the visual template is driven by the existing dashboard APIs.

This spec extends `docs/specs/reference-dashboard-webpage-ui.md`. It is a focused UI refinement pass and does not change weather data semantics.

## Scope

This spec includes:

- Public dashboard route `/`.
- The top briefing hero from `Dutch Weather Dashboard.html`, with API-backed content.
- The right-column detail panels:
  - Cycle Comfort.
  - Air Quality.
  - Water Level / Water Signal.
- The Weather outlook panel and 24-hour graph controls for Rain, Temp, and Wind.
- Responsive behavior for the hero, right column, and graph at desktop, tablet, and mobile widths.
- Automated component regression coverage for meaningful chart and panel behavior.
- Manual browser verification of the API-backed `Dutch Weather Dashboard.html` UI.
- Local build reliability for this UI pass, including the postbuild seed wrapper on Windows.

## Non-Goals

The following are intentionally out of scope:

- New backend data sources, ingestion jobs, or database schema changes.
- Changes to normalized dashboard API fields unless a missing fallback state needs a display-only guard.
- New charting, animation, or UI component libraries.
- Authentication, saved preferences, account features, subscriptions, or notifications.
- Real AI Q&A behavior.
- Official warning/advice language beyond the already-normalized dashboard fields.
- Persisting chart or panel UI state across sessions.
- Full redesign of navigation, metric cards, Ask the Dashboard, or source freshness unless needed to prevent overlap with the scoped panels.

## Acceptance Criteria

- The dashboard uses the provided `Dutch Weather Dashboard.html` UI structure and styling rather than a separately invented implementation.
- The provided HTML fetches city and dashboard data from the existing same-origin API endpoints.
- The dashboard first viewport keeps the provided liquid-glass hero treatment readable over the city image and does not obscure the current weather card.
- On desktop, the hero briefing box uses content-fit height rather than a fixed half-hero height, keeping the liquid-glass panel compact around its title, badge, and briefing bullets.
- The hero briefing text, summary bullets, and current weather card remain legible with accessible contrast.
- The right column presents Cycle Comfort, Air Quality, and Water Level / Water Signal as visually distinct, compact operational panels.
- The right column spans the main dashboard content from the top metric row through the lower panels instead of starting below the metric cards.
- Within the right column, Cycle Comfort, Air Quality, and Water Signal keep the sizing and stacking behavior from the provided HTML.
- Cycle Comfort is not duplicated in the top metric card strip when the right-column Cycle Comfort panel is present.
- The Cycle Comfort panel shows the score/ring, label, and best-window context when available, and clear unavailable copy when not.
- The Air Quality panel shows the AQI summary and pollutant values only when values are available, without rendering fabricated rows.
- The Water Level / Water Signal panel shows status, level/trend context, and a sparkline when data is available, and clear unavailable copy when not.
- The Weather outlook panel remains inside its card at common desktop and narrow widths.
- Rain, Temp, and Wind metric controls are visible, keyboard-accessible buttons and switch the visible 24-hour graph state without a full page reload.
- The 24-hour graph renders exactly 24 hourly bins, `00` through `23`, even when the API provides sparse three-hour outlook points.
- Dense 24-hour graph data uses compact labels so hour/value text does not collapse into an unreadable row; the visible x-axis labels should be thinned to avoid overlap.
- The first and final visible hourly labels remain available for orientation when graph labels are thinned, with `23:00` as the final bin label.
- The 24-hour graph uses compact horizontal plotting gutters so the grid, bars, and lines fill the outlook panel without large unused space to the left or right of the axes.
- The 24-hour graph keeps enough breathing room between plotted marks and left/right y-axis labels so labels do not feel attached to the grid or final data marks on desktop.
- The 24-hour graph dynamically derives rain, wind, and temperature axis ranges from the current data so bars and lines stay inside the plot area for both seeded and live-backed snapshots.
- Dynamic chart axes use rounded readable tick values with a small headroom buffer instead of clipping or flattening the live data.
- The combined 24-hour chart labels rain as chance/probability when the underlying outlook series is percentage-based live forecast data.
- Missing scoped data renders existing unavailable-state copy rather than invented measurements.
- The page has no incoherent text, control, or graph overlap at common desktop, tablet, and mobile widths.
- A local `npm run build` completes without requiring a manual `SKIP_DB_SEED=true` workaround when PostgreSQL is available.
- A local `npm run build` must not reseed mock dashboard snapshots by default, so building the UI cannot replace live-backed API data with fake data.

## Constraints

- Use the existing Next.js App Router and TypeScript components.
- Use existing dashboard CSS tokens and styling in `app/globals.css`.
- Keep business rules and response shaping outside presentational UI components.
- Do not derive or invent weather, air-quality, water-level, score, warning, or source-freshness values in the browser.
- Keep the dashboard compact and operational; do not turn this into a marketing landing page.
- Preserve semantic landmarks and accessible labels for the hero, detail panels, and weather outlook.
- Preserve keyboard-accessible controls with visible selected state and `aria-pressed` or equivalent semantics.
- Avoid broad refactors unless a local component is already doing too much for the scoped UI change.

## Implementation Notes

Relevant files:

```text
Dutch Weather Dashboard.html
docs/specs/reference-dashboard-webpage-ui.md
app/dashboard/components/BriefingHero.tsx
app/dashboard/components/DetailPanels.tsx
app/dashboard/components/OutlookPanel.tsx
app/dashboard/components/DashboardShell.tsx
app/dashboard/components/MetricStrip.tsx
app/dashboard/types.ts
app/globals.css
app/dashboard/__tests__/DashboardShell.test.tsx
```

Reference areas in `Dutch Weather Dashboard.html`:

- Liquid-glass briefing panel around the main hero.
- Right-column Cycle Comfort, Air Quality, and Water Signal sections.
- Short-term outlook graph with Rain, Wind, and Temperature signals.

Expected implementation direction:

- Preserve the provided HTML layout and inline visual styling.
- Replace hard-coded city/weather values with values mapped from `/api/cities` and `/api/dashboard?city=...`.
- Keep the top metric strip focused on Temperature, Rain, Wind / Gusts, Air Quality, and Water Signal as in the provided HTML.
- Keep the 24-hour graph implementation from the provided HTML and feed it normalized API hourly data.
- Normalize sparse API outlook entries into 24 bins before rendering the chart.
- Thin dense graph labels predictably rather than rendering every label when 24 hourly bins are present.
- Keep the combined chart left/right padding tight enough for axis labels while maximizing the plot width inside the existing panel.
- Keep tooltip/title text on plotted graph marks so hidden dense labels do not remove the underlying data.
- Preserve existing fallback behavior for missing chart, pollutant, cycle, and water values.

## Test Expectations

Automated checks:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Component coverage verifies:
  - the metric controls switch between Rain, Temp, and Wind 24-hour graph states.
  - the graph limits displayed hourly data to one day.
  - dense 24-hour data uses compact labels while keeping first and final labels visible.
  - missing selected graph metric data renders unavailable copy.
  - unavailable Cycle Comfort, Air Quality, and Water Level states render clear fallback copy.
  - unavailable pollutant values do not render fabricated pollutant rows.

Manual checks:

- Start local PostgreSQL with `docker compose -f infra/docker/docker-compose.yml up -d postgres`.
- Seed local data with `npx prisma db seed` if the dashboard API is empty.
- Start the dev server with `npm run dev`.
- Open `http://127.0.0.1:3000/` or `http://localhost:3000/`.
- Compare the hero, right column, and outlook graph against `Dutch Weather Dashboard.html`.
- Click Rain, Temp, and Wind and confirm each graph remains readable inside the panel.
- Check desktop, tablet, and mobile widths for no overlapping controls, clipped text, or graph spill.
- Confirm browser network requests remain same-app API requests.

Not applicable:

- Auth tests.
- Billing tests.
- Live ingestion correctness tests.
- Production LLM answer quality tests.

## Open Questions

- None.
