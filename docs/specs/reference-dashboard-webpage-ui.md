# Reference Dashboard Webpage UI Spec

Status: Accepted
Spec path: `docs/specs/reference-dashboard-webpage-ui.md`
Accepted by: RavindraTarunokusumo
Accepted date: 2026-05-06

## Goal

Upgrade the public Dutch Weather Intelligence webpage from the current simple seeded dashboard into a polished, reference-aligned dashboard experience based on `Dutch Weather Dashboard.html` and `assets/reference-design.png`.

The upgraded page should make the first screen feel like a complete public weather intelligence product: users can choose a supported city, read the daily briefing, scan current conditions, inspect outdoor comfort, air quality, water signal, short-term outlook, source freshness, and ask a grounded dashboard question without signing in.

This spec extends the accepted `docs/specs/public-dashboard-ui-shell.md` spec. It does not replace the backend foundation or authorize browser-side calls to external source providers.

## Scope

This spec includes:

- Public dashboard webpage at `/`.
- Responsive implementation of the reference visual layout:
  - top navigation with logo, product name, nav placeholders, city selector, and current-condition control.
  - large briefing hero with dark navy summary panel and Amsterdam canal image panel.
  - floating current weather summary card inside the hero image area on desktop.
  - compact metric cards for temperature, rain, wind/gusts, air quality, water signal, and cycle comfort.
  - 24-hour outlook chart area with selectable `24H`, `7D`, and `7D+` views.
  - ask-the-dashboard panel with input, send action, quick question chips, and response history.
  - air-quality detail panel.
  - water-signal detail panel.
  - source freshness footer.
- City switching for supported seeded cities returned by the application.
- Client-side interactivity where appropriate for city selection, chart tabs, and ask-dashboard input.
- Reuse of supplied visual assets where they are committed into the app's public static asset tree:
  - `assets/amsterdam-day.png`
  - `assets/logo-mark.png`
  - `assets/icon-temp.png`
  - `assets/icon-rain.png`
  - `assets/icon-wind.png`
  - `assets/icon-leaf.png`
  - `assets/icon-wave.png`
  - `assets/icon-spark.png`
  - `assets/icon-warn.png`
  - `assets/icon-trend.png`
- API response shaping needed to support the visible UI with normalized dashboard JSON.
- Loading, empty, missing-data, and API error states.
- Targeted tests for response shaping and interactive UI behavior.

Required frontend route:

```text
/
```

Optional route alias:

```text
/dashboard
```

## Non-Goals

The following are intentionally out of scope:

- Authentication, accounts, saved user locations, or billing.
- Live external calls from the browser to KNMI, Rijkswaterstaat, Luchtmeetnet, RIVM, or LLM providers.
- Real production Q&A generation.
- Real map rendering.
- Alert subscription workflows.
- Push notifications.
- User preference persistence beyond in-page state.
- Dark mode implementation unless it falls out naturally from existing tokens without extra scope.
- Any official-warning or official-advice framing.

## Acceptance Criteria

- The public dashboard loads at `/` without requiring sign-in.
- The page follows the reference composition closely enough that the supplied `assets/reference-design.png` is recognizable in layout, hierarchy, palette, and density.
- The UI is implemented as Next.js App Router TypeScript components, not as a pasted standalone HTML/Babel artifact.
- The browser fetches only same-app API routes.
- Users can switch between seeded supported cities without a full page reload.
- City-specific current weather, cycle comfort, air quality, water signal, briefing, and source freshness render from normalized API data.
- Missing values render as clear fallback labels such as `Unavailable`, `Unknown`, or `No data` without crashing.
- Unsupported city requests return a user-facing error state.
- The dashboard makes source freshness visible for weather, air-quality, and water data.
- The ask-dashboard panel accepts typed and quick-chip questions and returns a local mock or source-grounded placeholder answer based only on normalized dashboard data.
- The ask-dashboard panel does not claim to be live AI unless the backend AI Q&A feature is enabled by a separate accepted spec.
- The 24-hour outlook renders with deterministic seeded data or normalized fallback data; if exact forecast series are unavailable, the UI must clearly show an unavailable state instead of fabricating measurements.
- The `7D` and `7D+` chart controls have deterministic behavior: either render available seeded/normalized data or show a clear unavailable state.
- The layout works without overlapping text or controls at common desktop, tablet, and mobile widths.
- Visual assets have useful `alt` text or are hidden from assistive technology when decorative.
- No secrets or provider keys are exposed to the frontend bundle.

## Constraints

- Use the existing Next.js App Router application.
- Use TypeScript.
- Use existing Tailwind CSS setup and local CSS tokens where practical.
- Keep business rules and response shaping outside UI components.
- Do not calculate official scores in the frontend.
- Do not invent weather measurements, pollutant values, water levels, source freshness, warnings, or flood-risk claims.
- Any synthetic demo-only time series must be clearly seeded/mock data from the backend or documented fallback data, not presented as live observations.
- Use stable city slugs for state and route/API parameters.
- Keep cards and panels compact; the dashboard is an operational product UI, not a marketing landing page.
- Preserve accessible contrast, keyboard-accessible controls, semantic sections, and form labels where practical.
- Avoid adding a broad component library unless it is already present or required by the implementation plan.

## Implementation Notes

Reference files:

```text
Dutch Weather Dashboard.html
assets/reference-design.png
assets/*.png
```

The supplied HTML is a visual and interaction reference, not production code to paste directly. Implementation should extract the product decisions and rebuild them in the app's component structure.

Expected component areas:

- `DashboardPage`: page-level server or client boundary that loads initial dashboard data.
- `DashboardShell`: client-side interactive shell for selected city, chart view, and Q&A state.
- `TopNav`: logo, product name, nav placeholders, city selector, and current condition control.
- `BriefingHero`: date, AI summary badge, summary bullets, city image, and current weather card.
- `MetricStrip`: compact cards for primary measurements.
- `OutlookPanel`: 24-hour and 7-day chart states.
- `AskDashboardPanel`: local Q&A interaction and quick prompts.
- `AirQualityPanel`: AQI summary and pollutant breakdown when data is available.
- `CycleComfortPanel`: score ring and recommendation text.
- `WaterSignalPanel`: status, station/source label, and water trend visualization when data is available.
- `SourceFreshnessFooter`: data source timestamps and timezone note.

API/data considerations:

- Existing `/api/dashboard?city=<slug>` already returns core values and `summary_payload`.
- The implementation plan should inspect seeded `summary_payload` before deciding whether to extend `buildDashboardResponse`.
- If supported city options are needed in the UI, fetch `/api/cities` from the same app.
- Additional visible values such as pollutant breakdown, hourly outlook, weekly outlook, AI summary bullets, weather condition text, and trend copy should come from normalized response fields where available.
- If data is not available in current schema/seed data, either add explicit seeded fields through an accepted backend scope item or show an unavailable state. Do not infer them in the browser from unrelated fields.

Visual direction:

- Background: off-white.
- Primary text: deep navy.
- Hero summary panel: deep navy.
- Surfaces: white with restrained borders and 8px to 10px radius.
- Accents: teal/green/sky for positive data, orange for risk and action.
- Typography: practical dashboard hierarchy with large date hero, compact card headings, and readable body copy.
- Use supplied icon images for brand-matching metric icons unless the implementation plan finds a better committed asset strategy.

## Test Expectations

Automated checks:

- `npm run lint`
- `npm run typecheck`
- `npm test`
- Component or integration tests cover:
  - dashboard response shaping for any new normalized fields.
  - successful dashboard render with seeded Amsterdam data.
  - city selector changes selected city and reloads dashboard data.
  - unsupported city or failed dashboard request shows an error state.
  - missing optional values render fallback labels.
  - ask-dashboard quick question and typed question append a response without external provider calls.
  - chart controls switch visible states without crashing.

Manual checks:

- Start local dependencies and dev server using documented commands.
- Open `http://localhost:3000`.
- Compare the rendered page against `assets/reference-design.png` at desktop width.
- Check mobile and tablet widths for no overlapping text, clipped buttons, or inaccessible controls.
- Confirm browser network requests stay within same-app API routes.
- Confirm source freshness remains visible.

Not applicable:

- Auth tests.
- Billing tests.
- Live ingestion correctness tests.
- Production LLM answer quality tests.

## Open Questions

- None.
