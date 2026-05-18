# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Active Session - 2026-05-18 - Production Blank Dashboard Hotfix

Spec: `docs/specs/briefing-panel-glass-overlay.md`

- [x] Move the public dashboard shell hero image lookup behind the `city` loading guard so production does not crash before dashboard data loads. Commit: `cedf22b`.
- [x] Add a contract test covering the loading guard order for the public HTML shell. Commit: `cedf22b`.
- [ ] Validate locally and verify production renders after deployment. Local validation: PASS.

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
