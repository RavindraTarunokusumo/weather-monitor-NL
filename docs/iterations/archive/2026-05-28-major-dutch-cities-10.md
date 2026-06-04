# 2026-05-28 - Major Dutch Cities 10-City Rollout

Spec: `docs/specs/major-dutch-cities-10.md`

## Completed

- [x] Added tests for 10 supported city source-config and dashboard coverage. Commit: `8627e2d`.
- [x] Added seven new reliable city seeds and source mappings. Commit: `8627e2d`.
- [x] Updated affected docs for the 10-city support contract. Commit: `1682e1a`.
- [x] Ran validation and archived the completed session.

## Summary

Expanded the dashboard from 3 to 10 total supported Dutch cities:

- Amsterdam
- Arnhem
- Breda
- Den Haag
- Dordrecht
- Groningen
- Maastricht
- Nijmegen
- Rotterdam
- Utrecht

The rollout keeps public dashboard reads snapshot-only, adds deterministic seeded dashboard rows for the seven new cities, and adds explicit source mappings for KNMI, Luchtmeetnet, and Rijkswaterstaat.

## Validation

- `npm run lint` - PASS.
- `npm run typecheck` - PASS.
- `npm test` - PASS, 115 tests.
- `npx prisma validate` - PASS.
- `npm run build` - PASS.
- `npx prisma db seed` - PASS.
- API smoke via temporary local Next dev server:
  - `GET /api/cities` returned 10 cities.
  - `GET /api/dashboard?city=den-haag` returned `Den Haag` with `mock_knmi`, `mock_luchtmeetnet`, and `mock_rijkswaterstaat`.

## Notes

- No schema migration was required.
- The temporary local dev server used for API smoke checks was stopped after validation.
- Further provincial capitals should be added only after their source mappings are verified.
