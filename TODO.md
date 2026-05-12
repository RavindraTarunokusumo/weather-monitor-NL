# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Session: 2026-05-12 Production Live Refresh Guardrails

Active spec: `docs/specs/production-live-refresh-guardrails.md`

- [x] Implement production live refresh guardrails: explicit mock source labels, authenticated all-sources live refresh route, Vercel Cron registration, docs, and tests. Commit: `671358c`

Verification notes:

- 2026-05-12: Manually refreshed production through existing protected live ingestion routes and dashboard regeneration. `/api/dashboard` now reports live `knmi`, `luchtmeetnet`, and `rijkswaterstaat` source identifiers for Amsterdam, Utrecht, and Rotterdam.

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
