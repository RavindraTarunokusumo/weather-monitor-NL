# Forecast Page Visual Redesign Spec

Status: Accepted
Spec path: `docs/specs/forecast-visual-redesign.md`
Accepted by: User (mockup-driven redesign request, session 2026-07-02)
Accepted date: 2026-07-02
Design authority: `docs/specs/assets/forecast-visual-redesign-mockup.jpg` (user-supplied mockup)

## Goal

Redesign `/forecast` to match the supplied mockup: a hero image card with headline
forecast intelligence, an hourly signal timeline chart, a risk radar panel, a 7-day
outlook card row, and a sources-freshness footer. The page must remain fully usable
on mobile and tablet widths.

## Scope

- `app/forecast/components/*` — rebuild the component tree to the mockup layout.
- `app/forecast/format.ts` — add deterministic derivation helpers (comfort label,
  radar scores, narrative summary composition, sparkline points).
- `app/globals.css` — replace/extend the `.forecast-*` style block.
- `app/forecast/__tests__/ForecastShell.test.tsx` — update to the new structure.
- No changes to `app/forecast/page.tsx` data flow, `/api/forecast`, `lib/forecast.ts`,
  or `lib/types/forecast.ts`.

## Non-Goals

- No dashboard/homepage changes.
- No new data fields, API changes, or external calls.
- No new npm dependencies (charts are inline SVG).
- No dark mode.
- No bespoke hero photography: reuse the existing dashboard hero images.

## Page Layout (from mockup, top to bottom)

1. **Top nav** (keep existing): brand lockup left; centered links Dashboard /
   Forecast (Forecast active with underline accent); city `<select>` right.
2. **Generated line**: small muted text under the nav, clock glyph + "Generated
   {generated_at formatted in city timezone}".
3. **Hero card** (full-width, rounded ~20px, photo background):
   - Background image: reuse `/dashboard-assets/{slug}-day.png` when it exists
     (amsterdam, rotterdam, utrecht), otherwise `/dashboard-assets/amsterdam-day.png`.
     Left-to-right white-to-transparent gradient overlay so text stays readable.
   - Left column: H1 "Forecast intelligence for {city}" (two lines, dark navy,
     ~40px bold); condition row (icon + condition_label in teal/green accent);
     2–3 short sentences of narrative composed only from `summary` fields
     (best_window, main_risk, next_change) — never invented measurements.
   - Below-left: a frosted white strip of three stat chips, each icon + eyebrow
     label + value + sub-caption:
     - BEST WINDOW → summary.best_window
     - MAIN RISK → summary.main_risk
     - NEXT CHANGE → summary.next_change
   - Right side, over the photo: current temperature huge (from `hourly[0]`),
     "Feels like {apparent}", "↑ {daily[0].max}  ↓ {daily[0].min}".
   - Far right: rain-chance block — droplet icon, "{max precip probability next
     24h}%", "Rain chance", and a small dotted sparkline of hourly
     precipitation_probability with 00:00/12:00/24:00 axis labels.
   - Top-right corner: "COMFORT {label}" pill with smiley icon; comfort label is
     derived deterministically (see Derivations).
   - Any missing field renders the existing "Unavailable" fallback text instead
     of being dropped.
4. **Two-column analytics row** (~62% / ~38%; stacks to one column below 1024px):
   - **Hourly Signal Timeline panel** (white card):
     - Header: "HOURLY SIGNAL TIMELINE" + metric pill tabs: Temperature (active,
       filled teal), Feels like, Precipitation, Wind. Tabs switch which series
       the line chart plots.
     - Inline SVG line chart across the available hourly entries (up to 24):
       smooth polyline with point dots, value label per ~3h tick, warm color for
       daytime/high values fading to blue for cool/evening (a simple
       gradient stroke is acceptable). Weather condition icon + hour label above
       each ~3h tick.
     - Band annotations above the chart: a green band labeled "Best window" and
       a blue band labeled "Showers likely" — positioned from summary.best_window
       and summary.worst_window when those parse to hour ranges; omit a band when
       its source field is missing/unparseable.
     - A "Now {HH:mm}" marker: vertical dashed line at the current time in city
       timezone (first hourly entry is fine as the anchor).
     - Sub-rows beneath the chart, aligned to the same ~3h ticks: "Feels like"
       temps, "Rain chance" percents with a mini bar strip, "Wind (km/h)" values
       with direction arrows (arrow rotation only if a bearing exists in data;
       otherwise plain values — do not fabricate directions).
   - **Risk Radar panel** (white card):
     - Header: "RISK RADAR" + a decorative "Detail view" toggle (non-functional
       switch is out; instead render it as a real toggle that switches between
       radar chart and a plain-text list of the same six scores — cheap and real).
     - Inline SVG radar/spider chart with six axes: Rain, Wind, Gusts, Comfort,
       Visibility, Thunder; rings at 25/50/75/100; teal translucent fill polygon.
     - Right/below: stacked risk rows, each: category icon, name, severity word,
       time range, and a 10-segment intensity bar (colored segments = score/10,
       blue for rain/wind, orange for gusts, green for comfort/visibility).
       Rows come from `risk_timeline` events plus the derived comfort/visibility
       rows; when `risk_timeline` is empty show derived rows only.
5. **7-Day Outlook**: section heading + one card per `daily` entry (up to 7).
   Card: day label + date, condition icon, "max° / min°", a small temperature
   sparkline (SVG, dotted), droplet + precip probability, wind arrow + max wind,
   and a risk badge pill (Low = green outline, Moderate = orange, High/Severe =
   red) from `risk_label` (fallback "Low"). Desktop: 7-across grid; below
   1200px: horizontal scroll-snap row; mobile: same scroll row with wider cards.
6. **Sources footer** (white bar): "SOURCES FRESH" + green dot + "Updated
   {generated_at}"; one chip per `source_freshness` entry (icon, source label,
   status word in green when fresh); right-aligned "About sources" button that
   toggles a small list of `links` anchors. Do not hardcode the mockup's source
   names — render whatever `source_freshness` contains.

## Responsive Requirements

- ≥1200px: layout as mockup.
- 768–1199px: hero right-side temperature block moves below the headline block;
  analytics row stacks; 7-day becomes horizontal scroll.
- <768px: single column; hero paddings tighten, H1 ~28px; stat chips stack
  vertically full-width; chart panels scroll horizontally inside the card
  (min-width chart canvas ~640px) instead of squeezing; nav collapses per the
  existing `.forecast-page .top-nav-inner` pattern.
- No horizontal page overflow at 360px width.

## Derivations (all deterministic, in `app/forecast/format.ts`)

- **Comfort label**: from `hourly` next 12h — "Good" when apparent temp 10–26°C,
  wind < 30 km/h, max precip prob < 40%; "Fair" when one bound is exceeded;
  "Poor" otherwise; "Unavailable" when inputs are missing.
- **Radar scores (0–100)**: Rain = max precipitation_probability next 24h;
  Wind = min(100, max wind_speed_kmh × 2); Gusts = min(100, max wind_gust_kmh × 1.5);
  Comfort = 100 − (comfort: Good→80, Fair→50, Poor→20 inverted appropriately);
  Visibility and Thunder = mapped from matching `risk_timeline` categories
  (severity info→25, watch→50, warning→75, severe→100) else 10.
  These are interpretation-layer signals, not official measurements — keep the
  existing "interpretation layer" framing and never present them as source data.
- **Narrative sentences**: template-composed strictly from summary fields, e.g.
  "Best window {best_window}." / "Main risk: {main_risk}." / "Next change:
  {next_change}." Skip sentences whose field is null.

## Constraints

- Follow existing conventions: plain CSS classes in `app/globals.css` with the
  existing custom properties, `"use client"` components under
  `app/forecast/components/`, formatting helpers in `app/forecast/format.ts`.
- Keep `ForecastShell` as the stateful root (city switching, error/loading states
  and their existing behavior/`role` attributes must survive).
- Accessibility: charts get `role="img"` + `aria-label` summaries; tabs and the
  detail-view toggle are keyboard-operable buttons with `aria-pressed`/
  `aria-selected`; text over the hero photo keeps ≥4.5:1 contrast via the overlay.
- Core invariant: never invent weather measurements; every displayed number must
  trace to a `ForecastResponse` field or a documented derivation above.
- External sources stay mocked in tests; tests must not fetch.

## Test Expectations

- Update `ForecastShell.test.tsx`: city switching, error fallback, and loading
  states still pass against the new DOM.
- Add unit tests for the new `format.ts` derivations (comfort label, radar
  scores, narrative composition) including null-input fallbacks.
- Add interaction tests: hourly metric tab switching changes the plotted series
  label; risk radar detail-view toggle swaps radar/list.
- `npm run lint`, `npm run typecheck` (if present), `npm test` all green.

## Open Questions

- None blocking. Visibility/Thunder radar axes have no dedicated data source;
  the low-default derivation above is the accepted interim behavior.
