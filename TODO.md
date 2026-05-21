# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

- [ ] Revert the production refresh cron schedule to daily — active spec: `docs/specs/production-live-refresh-guardrails.md`
  - Change the Vercel Cron registration for `/api/jobs/refresh-live` back to `0 5 * * *`.
  - Restore the docs and contract test to the daily Hobby/free-plan-compatible cadence.
  - Keep the refresh route behavior and authorization unchanged.

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
