# Briefing Panel Glass Overlay Spec

Status: Draft
Spec path: `docs/specs/briefing-panel-glass-overlay.md`
Created: 2026-05-17

## Goal

Replace the current two-column `BriefingHero` layout with a full-bleed hero image and a responsive glass overlay panel that follows the `Briefing Panel Export.html` design exactly. The overlay has two CSS-responsive variants: a collapsible pill (< 1092 px) and a static 400 px panel (≥ 1092 px). No new backend data is required.

This spec extends `docs/specs/dashboard-ui-liquid-glass-panel-polish.md`. It is a focused UI refinement to the briefing hero and does not change weather data semantics, API routes, or dashboard response fields.

## Source Materials

- Design reference: `Briefing Panel Export.html`
- Component to rewrite: `app/dashboard/components/BriefingHero.tsx`
- New client component: `app/dashboard/components/BriefingCollapsiblePanel.tsx`
- Styles: `app/globals.css`
- Dashboard types: `app/dashboard/types.ts` (no changes)
- Existing tests: `app/dashboard/__tests__/DashboardShell.test.tsx`

## Scope

- Rewrite `BriefingHero.tsx` to a full-bleed hero with both variants in the DOM.
- Extract `BriefingCollapsiblePanel.tsx` as the sole `'use client'` component (Variant A).
- Implement Variant B (desktop static panel) as plain server JSX inside `BriefingHero`.
- Add all required CSS classes to `app/globals.css` using the export's exact design tokens.
- Keep the existing `current-weather-card` aside element; reposition it as a direct absolute child of the hero container.
- Add component-level tests for the collapsible pill behavior and summary item rendering.

## Non-Goals

- No new API routes, database fields, or dashboard response shape changes.
- No changes to `TopNav`, `MetricStrip`, `OutlookPanel`, `DetailPanels`, `AskDashboardPanel`, or `SourceFreshnessFooter`.
- No new charting, animation, or UI libraries.
- No dark mode, theming, or persisted panel state.
- No changes to the Q&A, city switching, or ingestion flows.

## Component Structure

`BriefingHero.tsx` is rewritten in-place as a server component. The two-column `.hero-briefing-panel` / `.hero-image-panel` structure is replaced by a single full-bleed container with positioned children:

```
BriefingHero (server component)
├── <img class="hero-image">             full-bleed, position absolute, object-fit cover
├── <BriefingCollapsiblePanel>           'use client', Variant A, hidden at ≥ 1092px via CSS
├── <div class="briefing-static">        Variant B, plain server JSX, hidden at < 1092px via CSS
└── <aside class="current-weather-card"> unchanged content, repositioned as direct absolute child
```

### BriefingCollapsiblePanel.tsx (new file)

```
'use client'
Props: date: string, items: BriefingItem[]
State: open: boolean
Renders:
  - Collapsed pill: spark icon + "Today's Briefing" label + chevron
  - Expanded panel: fixed header (eyebrow + close button) + scrollable body
    (date, AI badge, items list)
Transitions: width / max-height / border-radius via CSS cubic-bezier(0.4,0,0.2,1)
```

### BriefingItem type

Defined locally in `BriefingHero.tsx` (not added to `types.ts`; no shared use):

```ts
type BriefingItem = {
  dotColor: string;
  icon: React.ReactNode;
  label: string;
  value: string;
  detail: string | null;
};
```

`BriefingHero` constructs the `items` array and passes it to both `BriefingCollapsiblePanel` and the inline Variant B JSX.

## Data Flow

No new API fields. All panel content comes from the existing `DashboardResponse`.

| Panel element        | Source                                           |
|----------------------|--------------------------------------------------|
| Date heading         | `formatToday(dashboard.city.timezone)`           |
| Best outdoor window  | `ui_summary.best_window` + `ui_summary.outdoor_window_detail`   |
| Main risk            | `ui_summary.main_risk` + `ui_summary.risk_detail`               |
| What changed         | `ui_summary.changed` + `ui_summary.changed_detail`              |
| Dot colors           | Fixed per position: `#5eead4` / `#fb923c` / `#60a5fa`           |

`fallbackLabel` guards remain unchanged. "No known risk" renders when `main_risk` is null.

## Styling

All new classes are added to `app/globals.css`. Tokens are transcribed directly from the export.

### Hero container

```css
.briefing-hero {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
  height: 300px;
}
.briefing-hero .hero-image {
  position: absolute; inset: 0;
  width: 100%; height: 100%; object-fit: cover; z-index: 0;
}
```

### Shared glass base

```css
.glass-panel {
  background: rgba(255, 255, 255, 0.52);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.65);
  box-shadow: 0 8px 32px rgba(15,28,46,0.18), inset 0 1px 0 rgba(255,255,255,0.6);
  color: #0f1c2e;
}
```

### Variant A — collapsible (< 1092 px)

```css
.briefing-collapsible {
  position: absolute; top: 16px; left: 16px; z-index: 10;
  width: 210px; max-height: 46px; border-radius: 999px;
  overflow: hidden;
  transition: width .44s, max-height .46s, border-radius .38s
              cubic-bezier(0.4, 0, 0.2, 1);
}
.briefing-collapsible.open {
  width: calc(50% - 24px);
  max-height: calc(100% - 32px);
  border-radius: 14px;
}
.briefing-scroll {
  overflow-y: auto; max-height: 210px;
  scrollbar-width: none; -ms-overflow-style: none;
  -webkit-mask-image: linear-gradient(to bottom, transparent 0px, black 16px);
  mask-image: linear-gradient(to bottom, transparent 0px, black 16px);
}
.briefing-scroll::-webkit-scrollbar { display: none; }
```

### Variant B — desktop static (≥ 1092 px)

```css
.briefing-static {
  position: absolute; top: 24px; left: 24px; z-index: 2;
  width: 400px; border-radius: 16px; padding: 22px 24px;
  display: flex; flex-direction: column; gap: 12px;
  background: rgba(255, 255, 255, 0.42);
  backdrop-filter: blur(28px) saturate(180%);
  -webkit-backdrop-filter: blur(28px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.55);
  box-shadow: 0 12px 40px rgba(15,28,46,0.18), inset 0 1px 0 rgba(255,255,255,0.55);
  color: #0f1c2e;
}
```

### Responsive visibility (CSS-only, SSR-safe)

```css
@media (min-width: 1092px) { .briefing-collapsible { display: none; } }
@media (max-width: 1091px) { .briefing-static { display: none; } }
```

### Shared tokens

| Token            | Value                                   | Used by           |
|------------------|-----------------------------------------|-------------------|
| Eyebrow color    | `#ea580c`                               | Both              |
| Blur             | `blur(28px) saturate(180%)`             | Both              |
| Transition easing| `cubic-bezier(0.4, 0, 0.2, 1)`         | Variant A         |
| Dot — item 0     | `#5eead4` (teal-300)                    | Both              |
| Dot — item 1     | `#fb923c` (orange-400)                  | Both              |
| Dot — item 2     | `#60a5fa` (blue-400)                    | Both              |
| Breakpoint       | `1092px`                                | CSS media query   |
| Scroll fade      | `16px` top mask                         | Variant A scroll  |

### Current weather card

`.current-weather-card` moves from being inside `.hero-image-panel` to a direct child of `.briefing-hero`. Its `position: absolute` placement CSS retains its current visual position in the hero.

## Acceptance Criteria

- At ≥ 1092 px: the static glass panel (Variant B) is visible; the collapsible pill is hidden; the weather card remains in its current position.
- At < 1092 px: the glass pill is visible; the static panel is hidden; clicking the pill morphs it to an expanded scrollable panel; the close button collapses it back.
- The hero image fills the full container at all widths via `object-fit: cover`.
- The expanded Variant A panel does not overlap the weather card.
- All three summary items render with correct labels, values, and fallback text.
- `fallbackLabel` renders "No known risk" when `main_risk` is null.
- No text overlap, glass panel overflow, or clipped content at desktop, tablet, and mobile widths.
- The implementation uses the export's exact CSS tokens for blur, shadow, transition easing, dot colors, and breakpoint.
- `npm run lint`, `npm run typecheck`, `npm run build`, and `npm test` all pass.

## Constraints

- Use the existing Next.js App Router and TypeScript component structure.
- Keep `BriefingCollapsiblePanel.tsx` as the only new file; keep `'use client'` contained to it.
- Do not add new external libraries, fonts, or runtime browser dependencies.
- Do not derive or invent weather values in the browser.
- Keep `fallbackLabel` guards intact.
- Use CSS classes in `globals.css`; minimize inline style objects.

## Implementation Notes

- Remove the `.hero-briefing-panel` and `.hero-image-panel` wrapper divs from `BriefingHero.tsx`.
- The `.briefing-pill` opacity cross-fade and `.briefing-expanded` opacity cross-fade are pure CSS transitions keyed off the `open` class toggled by React state in `BriefingCollapsiblePanel`.
- The `open` state is local to `BriefingCollapsiblePanel`; no lifting to `DashboardShell` is needed.
- Icons in the summary dots are inline SVGs transcribed from the export; no new icon library is needed.
- Verify that existing global class names shared with `app/components/` (legacy shell) are not broken by removing the old hero wrapper classes.

## Test Expectations

### Automated

New file: `app/dashboard/__tests__/BriefingHero.test.tsx`

- Pill renders with "Today's Briefing" label in collapsed state.
- Clicking the pill sets `open` and shows the expanded panel content.
- Clicking the close button removes `open` and hides the expanded panel.
- All three summary item labels render correctly from mock dashboard data.
- `fallbackLabel` guard renders "No known risk" when `main_risk` is null.

Existing tests:
- `app/dashboard/__tests__/DashboardShell.test.tsx` remains green (no data contract changes).
- `npm run lint`, `npm run typecheck`, `npm run build`, `npm test` all pass.

### Manual

- Start local PostgreSQL: `docker compose -f infra/docker/docker-compose.yml up -d postgres`
- Seed if needed: `npx prisma db seed`
- Start dev server: `npm run dev`
- Open `http://localhost:3000/`
- At ≥ 1092 px: confirm static panel visible, pill hidden, weather card in place.
- At < 1092 px: confirm pill visible, tap to expand, close to collapse.
- Compare hero against `Briefing Panel Export.html` for glass treatment, spacing, and typography.
- Verify no overlap between briefing panel and weather card at any width.
- Confirm city switching still updates the date and summary items.

## Open Questions

- None.
