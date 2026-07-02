# KNMI Dataset Selection Documentation Session

Spec: `docs/specs/knmi-dataset-selection.md` (Accepted, documents an already-implemented and already-tested decision — no code or test changes).

## Completed

- Investigated `lib/ingestion/knmi.ts` and `tests/ingestion-live-adapters.test.ts` and confirmed the KNMI dataset choices for current observations, forecasts, and warnings were already implemented and tested, just never formally documented as a resolved decision.
- Drafted and committed `docs/specs/knmi-dataset-selection.md`, resolving Open Question 1 from `Onboarding/PLAN.md`: `5d670d8`
- Updated `docs/architecture.md` External Integrations with exact dataset/collection identifiers: `5d670d8`
- Marked the Open Question resolved in `Onboarding/PLAN.md` with a pointer to the spec: `5d670d8`
- While investigating the paired "delete Dutch Weather Dashboard.html" backlog item, discovered `app/page.tsx` directly iframes that file as the live production homepage (confirmed on the deployed site too), and that `app/dashboard/components/DashboardShell.tsx`'s entire component tree is built/tested but never mounted by any route. Logged this as a BLOCKED item in `TODO.md` rather than proceeding to delete a file production depends on.
- Corrected `docs/architecture.md`'s Entry Points, Runtime Flow, and Frontend Boundary sections to accurately describe the iframe-based homepage instead of the previous (incorrect) claim that it renders `DashboardShell`: `bd3c424`

## Validation

- `npm run lint`: passed.
- `npm test`: passed, 15 files and 130 tests (docs-only changes, no test impact expected or observed).

## Follow-Up

- The BLOCKED item (migrate `dashboard.test.ts`'s HTML-contract tests, delete `Dutch Weather Dashboard.html`) remains open in `TODO.md`, awaiting a user decision on whether/how to migrate the live homepage off the iframe.
