# Forecast Page Dashboard Design Alignment Spec

Status: Draft
Spec path: `docs/specs/forecast-dashboard-design-alignment.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Bring the visual design of the Forecast page (`app/forecast/`) in line with the main dashboard's (`/`) established liquid-glass design language, so the two pages feel like one product instead of two differently styled prototypes bolted together. Apply the `redesign-existing-projects` skill's audit as a supplementary quality pass to catch generic AI-pattern issues on the Forecast page specifically. This is a visual/CSS alignment pass; it does not change forecast data, API contracts, or the page's content structure defined in `docs/specs/forecast-page.md`.

## Background

`docs/specs/dashboard-ui-liquid-glass-panel-polish.md` established the dashboard's current visual system: `Dutch Weather Dashboard.html` is the design source of truth, ported into `app/dashboard/components/{BriefingHero,DetailPanels,MetricStrip,OutlookPanel,TopNav}.tsx`, using liquid-glass hero panels, image-backed heroes, and shared tokens in `app/globals.css`.

The Forecast page (`app/forecast/components/{ForecastShell,ForecastSummary,ForecastHourly,ForecastDaily,RiskTimeline,ForecastSources}.tsx`) was built independently per `docs/specs/forecast-page.md`, with its own flat CSS system (`.forecast-*` selectors, `app/globals.css:1420-`), a plain header instead of the dashboard's `TopNav`, and no glass/hero treatment. It works, but visually reads as a separate, less-finished product.

## Scope

- Restyle Forecast page surfaces (nav/header, summary/hero area, panels for hourly/daily/risk-timeline/sources) to reuse the dashboard's visual tokens: color palette, glass-panel surface treatment, spacing scale, typography scale, hover/focus/active states, and border-radius conventions already defined in `app/globals.css` for the dashboard.
- Align the Forecast page's top navigation visually with `TopNav` (same brand mark, link styling, active-page indication, city selector treatment), reusing shared CSS rather than duplicating near-identical styles under a second `.forecast-nav` selector family.
- Apply the `redesign-existing-projects` audit checklist (typography, color/surfaces, layout, interactivity/states, component patterns) to the Forecast page's current implementation and fix concrete findings that don't require new dependencies or content restructuring.
- Preserve every content section and structural acceptance criterion already required by `docs/specs/forecast-page.md` (summary, hourly analytics, risk timeline, 7-day outlook, sources/methodology, city switching, unavailable/stale states).
- Extract genuinely shared CSS (e.g. glass-panel surface, focus ring, hover transition primitives) into reusable rules so both the dashboard and forecast pages consume the same declarations instead of parallel copies drifting apart over time.

## Non-Goals

- Any change to the main dashboard page (`/`), its components, or its tests.
- Any change to forecast data shape, `/api/forecast`, risk derivation logic, or persisted snapshot behavior.
- Merging `ForecastShell`'s city-switching logic into `DashboardShell`/`TopNav`'s component, or making the two pages share a single nav component — visual alignment only, not a component-sharing refactor.
- Introducing a new CSS framework, animation library, icon set, or font loader beyond what `app/globals.css` and the dashboard already use.
- Rewriting the Forecast page's content layout order defined in `docs/specs/forecast-page.md` (summary → hourly → risk timeline → daily → sources).
- Migrating `Dutch Weather Dashboard.html` or its role as a design/test fixture (see `docs/iterations/archive/2026-07-01-harness-housekeeping.md`).
- Dark/light theme toggle work, unless the dashboard already has one to match.

## Acceptance Criteria

- The Forecast page's header/nav visually matches the dashboard's `TopNav` (brand styling, link treatment, active-page styling, city selector look) using shared or visually equivalent CSS rules, not a redesigned nav concept.
- The Forecast summary/header area uses the dashboard's glass-panel surface treatment (background, blur, border, shadow conventions) instead of a flat plain panel.
- Hourly, daily, risk-timeline, and sources panels use the dashboard's card/panel visual conventions (surface, spacing, radius, typography) consistently with `DetailPanels`/`OutlookPanel`.
- Interactive elements on the Forecast page (city select, any buttons/toggles) have visible hover, active/pressed, and focus states consistent with the dashboard's existing interaction patterns.
- No content section, acceptance criterion, or data behavior from `docs/specs/forecast-page.md` regresses.
- `Dutch Weather Dashboard.html` and its dependent tests in `tests/dashboard.test.ts` are unaffected.
- All existing automated tests pass (`npm test`), plus `npm run lint`, `npm run typecheck`.
- A manual browser check confirms the Forecast page and dashboard page feel visually consistent at desktop, tablet, and mobile widths, with no overlap, clipped text, or broken layout introduced by shared CSS changes.
- Any newly shared CSS rules are consumed by both pages (no duplicated near-identical declarations left behind for the styles that were unified).

## Constraints

- Use the existing Next.js App Router, TypeScript, and the existing CSS conventions in `app/globals.css`; no new styling framework or library.
- Work with the existing tech stack per the `redesign-existing-projects` skill's rules: do not migrate frameworks, do not rewrite from scratch, small targeted improvements only.
- Keep forecast calculation/business logic (`lib/forecast.ts`, `app/forecast/format.ts`) untouched; this is a presentational change only.
- Do not introduce new external image/font network dependencies without checking `package.json` first, per the redesign skill's rule.
- Preserve accessibility: semantic landmarks, visible focus rings, and keyboard operability must not regress.
- Keep changes reviewable: prefer shared CSS extraction and targeted component className changes over a full component rewrite.

## Implementation Notes

Relevant files:

```text
app/forecast/components/ForecastShell.tsx
app/forecast/components/ForecastSummary.tsx
app/forecast/components/ForecastHourly.tsx
app/forecast/components/ForecastDaily.tsx
app/forecast/components/RiskTimeline.tsx
app/forecast/components/ForecastSources.tsx
app/dashboard/components/TopNav.tsx
app/dashboard/components/BriefingHero.tsx
app/dashboard/components/DetailPanels.tsx
app/dashboard/components/OutlookPanel.tsx
app/globals.css (dashboard tokens ~lines before 1420; forecast rules from line 1420)
app/forecast/__tests__/ForecastShell.test.tsx
.codex/skills/redesign-existing-projects/SKILL.md (audit checklist reference)
```

Suggested approach:

1. Read `app/globals.css`'s dashboard-section rules to identify the reusable primitives (glass-panel surface, hover/focus transitions, spacing scale, radius scale).
2. Extract those primitives into shared rules/utility classes if they are not already generically named, without touching dashboard-specific selectors' visual output.
3. Update `.forecast-*` selectors to consume the shared primitives, replacing bespoke flat styling.
4. Restyle `ForecastShell`'s header markup/classNames to match `TopNav`'s visual structure where reasonable, keeping the forecast-specific city `<select>` interaction model already accepted in `forecast-page.md`.
5. Run the `redesign-existing-projects` audit checklist against the resulting Forecast page and note any additional low-risk fixes (hover states, focus rings, spacing, typography scale) applied in the same pass.

## Test Expectations

Automated checks:

- `npm run lint`
- `npm run typecheck`
- `npm test` (all existing suites, including `tests/dashboard.test.ts` and `app/forecast/__tests__/ForecastShell.test.tsx`, must continue to pass unchanged)
- `npx prisma validate` if any dependency touches persisted data (not expected for this presentational-only spec)

Manual checks:

- `npm run dev`, open `http://localhost:3000/` and `http://localhost:3000/forecast` side by side.
- Confirm nav, hero/summary, and panel surfaces read as the same design system across both pages.
- Switch cities on both pages and confirm no visual regression.
- Check desktop, tablet, and mobile widths on both pages for overlap, clipping, or broken layout.

Not applicable:

- Backend/API contract tests (no API changes in scope).
- `Dutch Weather Dashboard.html` fixture changes.

## Open Questions

- None. (Default decision: align via shared CSS/visual tokens, not a merged nav component — see Non-Goals. Ravindra can override this default when accepting the spec if full nav-component sharing is preferred instead.)
