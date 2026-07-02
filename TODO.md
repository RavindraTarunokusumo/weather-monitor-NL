# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Session: Forecast Dashboard Design Alignment (2026-07-01)

Spec: `docs/specs/forecast-dashboard-design-alignment.md` (Status: Accepted by RavindraTarunokusumo, 2026-07-01; Autopilot Mode explicitly granted by the user in-session for this task).

- [x] Locate/install `redesign-existing-projects` skill under `.codex/skills/` (canonical root) and `.agents/skills/` (mirror placeholder) — `d131c6a`
- [x] Draft `docs/specs/forecast-dashboard-design-alignment.md` covering scope, non-goals, acceptance criteria, and default decisions for open questions
- [x] Get explicit spec acceptance from Ravindra — granted in-session, spec marked Accepted
- [x] Restyle Forecast nav/header to reuse `.top-nav`/`.brand-lockup`/`.nav-links`/`.nav-link` instead of bespoke `.forecast-nav` — pending commit
- [x] Restyle Forecast hero/summary/panel surfaces to reuse `var(--radius)`/`var(--shadow)`/`var(--shadow-md)` instead of hardcoded 8px/flat values — pending commit
- [x] Restyle Forecast hourly/daily/risk-timeline/sources panels and add hover transitions per the `redesign-existing-projects` audit — pending commit
- [x] Simplify review (4-agent pass): removed a redundant mobile width override, fixed a real regression where Forecast lost its nav links entirely at 761-1180px (dashboard's breakpoint is tuned for a 5-item nav; forecast's 2-item nav still fits) — pending commit
- [x] Full validation (lint, typecheck, test, build) and manual browser check of `/` and `/forecast` at desktop/tablet/mobile widths via Playwright screenshots — all passed; city switching confirmed working
- [x] Pre-PR: simplify review complete; no API/data/architecture change, so doc-updater/test-plan-writer/security-review are not applicable

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
- [ ] Migrate `tests/dashboard.test.ts`'s "provided dashboard HTML chart/hero contract" cases onto the React `BriefingHero.tsx` port, then delete the legacy `Dutch Weather Dashboard.html` fixture.
