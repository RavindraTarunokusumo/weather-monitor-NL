# TODO.md

This file contains active or future work only.

Completed sessions must be moved to `docs/iterations/archive/` and include the related spec path.

## Backlog

## Active: Complete City Data And Config-Only Expansion

Spec: `docs/specs/major-dutch-cities-10.md`

- [ ] Ensure every configured city has complete dashboard data after live refresh.
  - [ ] Add regression coverage for observation-only live weather without enriched forecast payloads.
  - [ ] Add deterministic configured fallback outlook/current metadata for supported cities.
  - [ ] Reuse the same supported-city config for city bootstrap and source mappings.
  - [ ] Repair production and verify all 10 city dashboards have forecast data.

## Future Backlog

- [ ] Select exact first KNMI datasets for current observations and forecasts.
