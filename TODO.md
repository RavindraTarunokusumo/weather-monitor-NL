# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Session: KNMI Dataset Selection Documentation (2026-07-02)

Spec: `docs/specs/knmi-dataset-selection.md` (Status: Accepted — documents an already-implemented, already-tested decision, no code change).

- [ ] Update `docs/architecture.md` External Integrations with exact KNMI collection/dataset identifiers
- [ ] Mark Open Question 1 resolved in `Onboarding/PLAN.md` with a pointer to the spec
- [ ] Full validation (lint, test) and commit

## BLOCKED: Migrate dashboard.test.ts HTML-contract tests / delete Dutch Weather Dashboard.html

**Do not proceed on the "delete the file" part of this backlog item as originally written — it was based on a wrong premise.**

Discovery: `app/page.tsx` (the live `/` route) directly `readFile`s `Dutch Weather Dashboard.html` and renders it in an `<iframe srcDoc={html}>`. Confirmed this is also true on production (`https://weather-monitor-nl.vercel.app/` serves the same iframe). `app/dashboard/components/DashboardShell.tsx` and its entire component tree (TopNav, BriefingHero, MetricStrip, OutlookPanel, DetailPanels, etc.) are fully built and unit-tested but are **never rendered by any route** — there is no `app/dashboard/page.tsx`. `Dutch Weather Dashboard.html` is not a legacy design fixture; it is the current production homepage implementation. Deleting it would break the live site.

This also means `docs/architecture.md`'s current wording ("the active homepage uses the reference dashboard UI so the image-backed hero... stay intact") is misleading relative to the actual `app/page.tsx` code and should be corrected.

- [ ] Awaiting user decision: (a) close this backlog item as invalid/no-op, (b) scope a real migration spec to move the live homepage off the iframe onto the `app/dashboard/` React port (a much larger project — new route, data fetching, parity testing, removing the iframe), or (c) something else.
- [ ] Separately: `docs/architecture.md`'s description of the active homepage implementation needs correcting regardless of which option is chosen.

## Future Backlog

- [ ] Investigate a pre-existing React duplicate-key console warning ("00-00") on the Forecast page's hourly analytics list (confirmed present on `main` before the design-alignment session; not caused by it).
