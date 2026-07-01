# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Session: Harness Housekeeping (2026-07-01)

Spec: N/A — repo housekeeping, not feature implementation (leftover from `docs/iterations/archive/2026-05-21-*` onboarding install pass, no `docs/specs/` entry applies).

- [x] Finish genericizing installed skill/agent configs (`.agents/doc-updater.toml`, `.codex/skills/security-review`, `simplify`, `test-plan-writer`) and drop unused `trace-inspect` skill — `2838e52`
- [ ] Track `Onboarding/` harness bootstrap material (already referenced in `docs/index.md`). Excludes `Onboarding/Harness Bootstrap.md`: per PM instruction, the bootstrap-only file is removed once bootstrap is complete and is not tracked.
- [x] ~~Remove superseded legacy static prototype `Dutch Weather Dashboard.html`~~ — **Reverted.** `tests/dashboard.test.ts` ("provided dashboard HTML chart contract" / "hero contract", 11 tests) reads this file directly as a design-contract fixture; there is no equivalent test against the React `BriefingHero.tsx` port. `npm test` fails without it. Retain the file until those tests are migrated to assert against the React component instead, then delete both together.
- [ ] Revert accidental real-looking credential pasted into tracked `.env.example` (done in working tree, no commit needed — file matches HEAD)
- [ ] Add Autopilot Mode section to `AGENTS.md` and `CLAUDE.md` (mirrored policy formalizing the existing "explicitly granted autonomous execution" language in Step 3)

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
- [ ] Redesign forecast page UI to match the main dashboard design — use the `/redesign-existing-projects` skill (taste-skill). Skill is not currently installed under `.codex/skills/`, `.agents/skills/`, or `Onboarding/Skills/` in this repo; locate/install it before implementation.
