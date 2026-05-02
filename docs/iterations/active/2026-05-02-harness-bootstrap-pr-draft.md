# PR Draft: Harness Bootstrap

## Summary

- Added the initial agent harness and documentation structure.
- Adapted the docs to the Dutch Weather Intelligence MVP plan.
- Added PR and git note templates.
- Created `.codex/skills/` and `.agents/skills/` directories without skill bodies.

## Root Cause (for fixes)

N/A.

## Scope of Changes

| Area | Description |
|------|-------------|
| Backend | Documented planned FastAPI/Pydantic backend only |
| Frontend | Documented planned Next.js/TypeScript frontend only |
| Data/DB | Documented planned PostgreSQL, TimescaleDB, and PostGIS storage only |
| Services / Integrations | Documented KNMI, Rijkswaterstaat Waterinfo, and Luchtmeetnet / RIVM expectations |
| Docs | Added repo contract, technical docs, templates, TODO, changelog, and insights |
| Tests | No tests added; no product code exists yet |

## Test Plan

- [ ] `git diff --check`
- [ ] Tool availability checks for `ruff`, `pytest`, and `npm`

Manual validation notes:

- Product implementation has not started, so stack-specific test commands are expected to be unavailable or not applicable.

## Risk and Rollback

- Risk level: low
- Main risk areas: harness policy may need adjustment after the first implementation milestone.
- Rollback plan: revert the harness bootstrap commit.

## Docs and Backlog

- [x] Updated docs for behavior/API/architecture changes
- [x] Updated `docs/changelog.md` for workflow setup
- [ ] Updated `TODO.md` / moved completed items to `docs/iterations/archive/`
- [ ] Added git notes per commit using `.github/git_notes_template.md`

## Related

- Issue(s): N/A
- TODO/Iteration item: Harness Bootstrap (2026-05-02)
- PR type: docs

## Targeted UI Checks

- [ ] N/A; no UI exists yet.

