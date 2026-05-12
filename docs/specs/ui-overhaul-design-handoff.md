# UI Overhaul Design Handoff Spec

Status: Accepted
Spec path: `docs/specs/ui-overhaul-design-handoff.md`
Accepted by: User
Accepted date: 2026-05-12

## Goal

Recreate the supplied high-fidelity Dutch Weather Intelligence dashboard handoff in the existing Next.js dashboard, using the current app data model and component structure rather than shipping the standalone prototype.

The delivered dashboard should visually match `design_handoff_weather_dashboard/design/Dutch Weather Dashboard.html` closely enough that the handoff can be used as the visual source of truth for layout, spacing, colors, type scale, card density, icon usage, chart behavior, Q&A presentation, and source freshness.

## Source Materials

- Handoff README: `design_handoff_weather_dashboard/README.md`
- Handoff prototype: `design_handoff_weather_dashboard/design/Dutch Weather Dashboard.html`
- Handoff tweak panel: `design_handoff_weather_dashboard/design/tweaks-panel.jsx`
- Handoff assets: `design_handoff_weather_dashboard/design/assets/`
- Existing production dashboard entry: `app/page.tsx`
- Existing dashboard shell: `app/dashboard/components/DashboardShell.tsx`
- Existing dashboard components: `app/dashboard/components/`
- Existing dashboard styles and tokens: `app/globals.css`
- Existing dashboard data type: `app/dashboard/types.ts`

## Current UI Compared With Handoff

The current UI already has the right product modules and data flow: top navigation, city switching, briefing hero, six-metric strip, outlook panel, Q&A panel, detail panels, and source freshness footer. It also already reads from `/api/dashboard?city=<slug>` and `/api/cities`, and it keeps Q&A local and source-grounded through normalized dashboard JSON.

Key differences to close:

- Top navigation: current nav is a non-sticky grid with a larger brand mark and dropdown city picker. The handoff requires a sticky 56px white nav with max-width 1220px, compact 32px logo, centered tab nav, active underline, city switcher pill, and compact current-condition badge.
- Page frame: current page uses `max-width: 1440px`, 24px top padding, and larger gaps. The handoff uses a tighter `max-width: 1220px`, `0 24px` inner padding, and a more compact information-dense layout.
- Hero: current hero is taller, city-name led, and uses a gradient navy panel. The handoff uses a 260px strip, date-led briefing, dark `#111c2e` panel, 560px image column, compact AI summary pill, tinted icon squares, and a smaller glass weather overlay.
- Metric bar: current metric tiles are taller, two-column icon/value cards. The handoff requires compact six-column tiles with 36px icons, 10px uppercase labels, DM Mono values, smaller sub-lines, and a cycle comfort donut embedded in the cycle metric tile.
- Outlook: current 24h view only renders rain bars and 7d cards. The handoff requires a single SVG chart with two controls: metric toggle (`Rain`, `Temp`, `Wind`) and view toggle (`24H`, `7D`, `7D+`). The active metric must crossfade between rain bars, temperature line, and wind area, including active y-axis labels, value labels, and native SVG tooltips.
- Right panels: current cycle, AQI, and water panels are vertically stacked but less compact. The handoff requires AQI first, then cycle comfort, then water signal; AQI includes a score block plus pollutant mini-stats, cycle comfort combines donut plus explanatory label, and water uses a compact sparkline with source annotation.
- Q&A: current Q&A renders input first, then quick questions, then answer history as plain stacked articles. The handoff requires an icon+uppercase header, assistant/user message bubbles, compact input container with icon send button, and quick chips only when there are no messages.
- Source freshness: current footer is a simple flex row. The handoff requires a bordered muted strip laid out as three source cells plus a right-aligned "all times/last refreshed" cell, with green freshness dots.
- Tokens: current `app/globals.css` lacks several handoff tokens (`--accent`, `--accent-orange`, `--radius`, `--shadow-md`, `--mono`) and uses a different text/muted palette.
- Assets: current `public/dashboard-assets/` already matches the handoff dashboard assets except `scene.png`, which is present only in the extracted handoff and is not required by the README target layout.

## Proposed Approach

Use the existing `app/dashboard/` production components and refit them to the handoff, rather than importing the prototype or replacing the app with a single monolithic component.

Alternatives considered:

- Direct prototype port: fastest visual match, but it would duplicate local data, inline large style objects, bypass current API contracts, and make tests harder to maintain.
- Component-preserving refit: preserves the existing SSR entry, client shell, city switching, normalized types, Q&A helper, tests, and API boundaries while implementing the handoff as production React components. This is the recommended approach.
- Styling-only pass: lowest risk, but it would leave the chart behavior, Q&A presentation, footer structure, and compact panel ordering short of the supplied design.

## Scope

Update the public dashboard at `/` to match the handoff:

- Refine `DashboardShell` layout to use a 1220px content frame, compact vertical spacing, and chart/right-panel arrangement from the handoff.
- Rework `TopNav` into the sticky handoff nav while preserving accessible city selection and same-app city switching.
- Rework `BriefingHero` to match the 260px two-column strip, date-led briefing content, tinted icon squares, and compact weather overlay.
- Rework `MetricStrip` into compact handoff tiles with explicit unit styling and a cycle score donut in the cycle tile.
- Extend dashboard chart state with a `ChartMetric` state for `rain`, `temp`, and `wind`.
- Replace the current 24h rain bar chart with a reusable responsive SVG chart that renders rain, temperature, or wind from `dashboard.outlook.hourly`.
- Keep `7D` and `7D+` views functional, with `7D` visually aligned to the handoff and `7D+` retaining a clear unavailable state unless data exists.
- Rework `DetailPanels` to follow the handoff order and density: AQI, cycle comfort, water signal.
- Rework `AskDashboardPanel` to match the handoff message/input/chip presentation while keeping answers produced by `answerDashboardQuestion()`.
- Rework `SourceFreshnessFooter` into the bordered handoff source freshness strip.
- Update `app/globals.css` tokens and component classes to match the handoff colors, radii, shadows, compact typography, and responsive behavior.
- Use existing assets from `public/dashboard-assets/`; copy or reference additional handoff assets only if the implemented layout needs them.
- Preserve current API routes, database shape, ingestion flow, and dashboard response contract unless a visual requirement cannot be met without a type-only frontend extension.

## Non-Goals

- Do not ship `design_handoff_weather_dashboard/design/Dutch Weather Dashboard.html` as production code.
- Do not import `tweaks-panel.jsx` or expose the handoff tweak controls in the app.
- Do not add browser-side external weather, water, air-quality, font, or AI calls.
- Do not change Prisma schema, source ingestion, or dashboard regeneration behavior for this visual overhaul.
- Do not implement real navigation pages for Forecast, Maps, Insights, or Alerts; nav items may remain visual tabs unless a separate accepted spec defines those pages.
- Do not add dark mode or accent-color customization from the prototype tweak panel.

## Acceptance Criteria

- The `/` dashboard uses the existing normalized dashboard API data and visually follows the handoff at desktop width: sticky compact nav, 260px hero strip, compact six-metric bar, chart plus 340px right column, Q&A card, and source freshness strip.
- City switching still fetches `/api/dashboard?city=<slug>` and updates all dashboard sections without a full page reload.
- The 24h chart has a metric toggle for Rain, Temp, and Wind, with only the active series interactive and visible.
- Rain bars, temperature line/dots, wind area/dots, active y-axis labels, point/bar value labels, and native SVG tooltips render from `dashboard.outlook.hourly`.
- The 7D view remains available and uses `dashboard.outlook.weekly`; the 7D+ view handles unavailable extended data explicitly.
- Q&A quick chips, typed submit, and message history still work with `answerDashboardQuestion()` and do not invent data outside the normalized dashboard response.
- Source freshness remains visible and includes each source timestamp from `dashboard.source_freshness`.
- Missing dashboard values render explicit unavailable labels rather than fabricated measurements.
- The page remains usable and non-overlapping at desktop, tablet, and mobile widths.
- Implementation validation includes a screenshot comparison between the finished dashboard and the concept image supplied in the planning thread, with differences documented before PR handoff.
- The implementation keeps component boundaries readable; no production component should become a direct dump of the standalone handoff prototype.

## Constraints

- Follow the repository spec workflow in `AGENTS.md`; implementation cannot begin until this spec is accepted and TODO items are logged.
- Keep runtime data grounded in `DashboardResponse`; do not add raw source calls to UI components.
- Preserve server-side initial dashboard loading in `app/page.tsx`.
- Keep external data sources mocked in tests.
- Keep secrets and API keys out of client code and logs.
- Use sparse comments and clear component names.
- Prefer CSS classes and existing tokens in `app/globals.css` over large inline style blocks.
- The handoff uses DM Mono for metric/chart values. Implement this through a stable Next.js-compatible font setup or a CSS `--mono` fallback without adding a runtime browser dependency.

## Implementation Notes

- Add `type ChartMetric = "rain" | "temp" | "wind"` near the existing `ChartView` type in `app/dashboard/types.ts` or localize it to the chart component if no shared use exists.
- Keep `DashboardShell` as the state owner for city, `ChartView`, and likely `ChartMetric`.
- Consider splitting `OutlookPanel` into smaller internal units: metric toggle, view toggle, `HourlyMetricChart`, and weekly forecast view.
- Preserve current formatter helpers in `app/dashboard/format.ts` and extend only where the handoff needs a missing display format.
- Use `dashboard.outlook.hourly` values directly for chart series: `rain`, `temp`, and `wind`.
- Guard chart scale calculations for empty arrays, one-point arrays, all-null values, and equal min/max values.
- Use accessible native controls for toggles and city selection; active states should be reflected through text, `aria-pressed`, `aria-current`, or equivalent semantics.
- Use existing PNG icons from `/dashboard-assets/` for handoff metric icons.
- Review whether `app/components/` legacy dashboard cards are still referenced before changing shared global class names that might affect them.

## Test Expectations

Automated checks:

- Update `app/dashboard/__tests__/DashboardShell.test.tsx` to cover metric toggle behavior for Rain, Temp, and Wind.
- Preserve existing tests for city switching, failed dashboard reloads, chart view tabs, and Q&A.
- Add or update component tests for source freshness visibility if the footer structure changes.
- Run `npm run lint`.
- Run `npm run typecheck`.
- Run `npm test`.

Manual checks:

- Start the app with seeded dashboard data and open `/`.
- Verify desktop layout around 1440px and 1220px wide.
- Capture a desktop screenshot of the implemented dashboard and compare it against the supplied concept image for layout, spacing, hierarchy, card density, chart treatment, and source footer placement.
- Verify tablet layout around 900px wide.
- Verify mobile layout around 390px wide.
- Verify no text overlaps, no chart labels spill out incoherently, and the hero/weather overlay remains legible.
- Verify city switching across Amsterdam, Rotterdam, and Utrecht.
- Verify Q&A quick chips and typed questions.
- Verify source freshness remains visible after city changes.

## Open Questions

- None.
