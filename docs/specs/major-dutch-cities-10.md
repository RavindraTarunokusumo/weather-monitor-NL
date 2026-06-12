# Major Dutch Cities 10-City Rollout Spec

Status: Accepted
Spec path: `docs/specs/major-dutch-cities-10.md`
Accepted by: User
Accepted date: 2026-05-28

## Goal

Expand the public dashboard from 3 to 10 total selectable Dutch cities while keeping every added city backed by documented, reliable source mappings for weather, air quality, and water-level ingestion.

## Scope

- Keep the existing cities: Amsterdam, Rotterdam, and Utrecht.
- Add 7 cities for a 10-city total:
  - Den Haag
  - Groningen
  - Arnhem
  - Maastricht
  - Breda
  - Nijmegen
  - Dordrecht
- Prioritize provincial capitals when their source coverage is reliable. Den Haag, Groningen, Arnhem, and Maastricht are included. Provincial capitals without documented reliable mappings in this pass remain out of scope.
- Seed deterministic mock dashboard snapshots for all 10 cities so `/api/cities`, `/api/dashboard?city=<slug>`, and the dashboard city switcher work immediately in local, preview, and seeded environments.
- Add explicit live source configuration for all 10 supported cities in `lib/ingestion/source-config.ts`.
- Ensure the protected production live refresh can bootstrap the 10 supported active city rows before ingestion, so deployments that skip seed still expose the accepted city catalog after the documented refresh route runs.
- Ensure dashboard regeneration never publishes blank user-facing forecast data for a configured city: if live weather ingestion returns observation-only rows without forecast enrichment, regeneration must use deterministic configured fallback outlook, rain probability, condition, and warning metadata for that city.
- Keep supported-city metadata, source mappings, and fallback dashboard defaults in data/config modules so adding another verified city is a configuration edit plus validation, not new route logic, Vercel setup, or manual production database work.
- Keep public dashboard requests reading stored `DashboardSnapshot` rows only. Do not add request-time calls to KNMI, Open-Meteo, Luchtmeetnet, or Rijkswaterstaat.
- Preserve the existing hero-image fallback for cities without city-specific assets.
- Update tests and docs that enumerate supported seeded cities or live source configuration coverage.

## City Source Mapping

Reliability means each city has:

- a KNMI observation station that is a direct city station or a defensible nearby official station;
- a Luchtmeetnet station with a direct city station name and recent measurement behavior;
- a Rijkswaterstaat WATHTE location that appears in the ddapi20 catalog and returned recent multi-point observations during discovery, except existing Utrecht which keeps its established Hagestein representative location.

| City | KNMI weather station | Luchtmeetnet station | Rijkswaterstaat WATHTE location | Notes |
| --- | --- | --- | --- | --- |
| Amsterdam | `0-20000-0-06240` Schiphol | `NL49017` Amsterdam-Stadhouderskade | `amsterdam.surinamekade` Amsterdam, Surinamekade | Existing reliable mapping. |
| Rotterdam | `0-20000-0-06344` Rotterdam | `NL01493` Rotterdam-Statenweg | `rotterdam.nieuwemaas.boerengat` Rotterdam, Nieuwe Maas, Boerengat | Existing reliable mapping. |
| Utrecht | `0-20000-0-06260` De Bilt | `NL10636` Utrecht-Kardinaal de Jongweg | `hagestein.beneden` Hagestein beneden | Existing reliable mapping; water remains representative nearby Lek location. |
| Den Haag | `0-20000-0-06215` Voorschoten | `NL10404` Den Haag-Rebecquestraat | `scheveningen` Scheveningen | Direct city air station; nearest defensible KNMI and coastal RWS location for The Hague. |
| Groningen | `0-20000-0-06280` Eelde | `NL10938` Groningen-Nijensteinheerd | `groningen` Groningen | Provincial capital with direct air and RWS catalog matches. |
| Arnhem | `0-20000-0-06275` Deelen | `NL54010` Arnhem GelreDome | `arnhem.nederrijn` Arnhem, Nederrijn | Provincial capital with direct air and river water location. |
| Maastricht | `0-20000-0-06380` Maastricht | `NL50007` Maastricht-Hoge_Fronten | `maastricht.borgharen.julianakanaal` Maastricht, Borgharen, Julianakanaal | Provincial capital with direct air and reliable Maas/Julianakanaal water observations. |
| Breda | `0-20000-0-06350` Gilze-Rijen | `NL10241` Breda-Bastenakenstraat | `breda` Breda | Reliable major-city filler with direct air and RWS catalog match. |
| Nijmegen | `0-20000-0-06375` Volkel | `NL10741` Nijmegen-Graafseweg | `nijmegen.waal` Nijmegen, Waal | Reliable major-city filler with direct air and Waal water location. |
| Dordrecht | `0-20000-0-06344` Rotterdam | `NL10442` Dordrecht-Bamendaweg | `dordrecht.oudemaas.benedenmerwede` Dordrecht Oude Maas, Beneden Merwede | Reliable major-city filler with direct air and strong RWS location family. |

## Non-Goals

- Do not expand to 20 cities in this pass.
- Do not add unsupported provincial capitals until source mappings are verified.
- Do not add new external providers.
- Do not redesign the city switcher, top navigation, dashboard layout, or hero imagery.
- Do not introduce browser-side provider calls.
- Do not migrate historical data or alter the Prisma schema unless tests reveal an unavoidable persistence requirement.

## Acceptance Criteria

- `/api/cities` returns exactly 10 active cities in name order after seeding.
- `/api/dashboard?city=<slug>` returns a dashboard response for each supported city after seeding.
- City switching in the dashboard can select any supported city without a 404 when seeded snapshots exist.
- The protected `/api/jobs/refresh-live` route ensures all 10 supported active city rows exist before running all-source live ingestion and dashboard regeneration.
- Every supported city dashboard has non-empty 24-hour and weekly outlook arrays after seed or live refresh, even when the latest live weather row is observation-only.
- Every supported city dashboard has non-null user-facing rain probability and weather condition metadata after seed or live refresh.
- `SEEDED_CITY_SOURCE_CONFIGS` contains exactly the 10 supported city slugs.
- `getSourceConfig()` succeeds for all 10 supported city slugs and still throws for unsupported cities.
- Live ingestion in mock mode still works for all active cities through the existing all-city job flow.
- Existing source identifiers remain unchanged: live source names are `knmi`, `luchtmeetnet`, and `rijkswaterstaat`; seeded source names remain `mock_knmi`, `mock_luchtmeetnet`, and `mock_rijkswaterstaat`.
- Tests cover city catalog size, seed/source config coverage, and representative dashboard response availability.
- Docs mention the 10-city support target and identify that further provincial capitals require verified source mappings.

## Constraints

- Follow the 7-step workflow in `AGENTS.md`.
- Use `docs/specs/major-dutch-cities-10.md` as the active spec for TODOs, commits, git notes, archive entry, and PR.
- Keep changes focused on city data, source config, tests, and directly affected docs.
- Do not modify or delete unrelated untracked files in the repo root.
- Use specific staging; never use `git add -A`.
- Public API responses must continue to read stored dashboard snapshots only.
- Production builds must continue to skip automatic seeding; city-row bootstrap belongs behind the authorized refresh job and must not replace existing snapshots by itself.
- Configured fallback outlooks must be deterministic and must not make request-time external API calls.
- Tests must mock external providers and must not require live KNMI, Luchtmeetnet, Rijkswaterstaat, or Open-Meteo network access.

## Implementation Notes

- `prisma/seed.ts` currently stores city seed data inline. Add the 7 new cities with deterministic snapshot values and distinct mock state hashes.
- `lib/ingestion/source-config.ts` currently narrows `citySlug` to the existing 3 slugs. Extend the type and source config array to the 10 supported slugs.
- `tests/ingestion-live-adapters.test.ts` currently expects exactly Amsterdam, Rotterdam, and Utrecht. Update it to assert the 10-city config set and station metadata rules.
- `tests/dashboard.test.ts` includes hero-image fallback assertions for the 3 existing city assets. Preserve fallback behavior for the new cities.
- `app/dashboard/components/BriefingHero.tsx` can keep its existing fallback image map unless tests require adding explicit entries.
- The RWS metadata catalog endpoint used during discovery was `https://ddapi20-waterwebservices.rijkswaterstaat.nl/METADATASERVICES/OphalenCatalogus`.
- The Luchtmeetnet station catalog endpoint used during discovery was `https://api.luchtmeetnet.nl/open_api/stations`.

## Test Expectations

- Run targeted tests while implementing:
  - `npm test -- tests/ingestion-live-adapters.test.ts`
  - `npm test -- tests/dashboard.test.ts`
  - `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`
- Run pre-PR validation:
  - `npm run lint`
  - `npm run typecheck`
  - `npm test`
  - `npx prisma validate`
  - `npm run build`
- If local PostgreSQL is available, run:
  - `npx prisma db seed`
  - `curl http://localhost:3000/api/cities`
  - `curl "http://localhost:3000/api/dashboard?city=den-haag"`

## Open Questions

- None.
