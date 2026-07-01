# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Session: Forecast Dashboard Design Alignment (2026-07-01)

Spec: `docs/specs/forecast-dashboard-design-alignment.md` (Status: Draft — awaiting explicit user acceptance before implementation starts, per `AGENTS.md`/`CLAUDE.md` Step 3).

- [x] Locate/install `redesign-existing-projects` skill under `.codex/skills/` (canonical root) and `.agents/skills/` (mirror placeholder) — `d131c6a`
- [x] Draft `docs/specs/forecast-dashboard-design-alignment.md` covering scope, non-goals, acceptance criteria, and default decisions for open questions
- [ ] Get explicit spec acceptance from Ravindra (or confirmed autonomous-execution grant) before logging implementation sub-items and editing `app/forecast/*` / `app/globals.css`

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
- [ ] Migrate `tests/dashboard.test.ts`'s "provided dashboard HTML chart/hero contract" cases onto the React `BriefingHero.tsx` port, then delete the legacy `Dutch Weather Dashboard.html` fixture.
