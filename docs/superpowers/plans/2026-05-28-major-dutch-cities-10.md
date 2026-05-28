# Major Dutch Cities 10-City Rollout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the public dashboard to 10 total reliable Dutch cities with seeded dashboard data and explicit live source mappings.

**Architecture:** Keep the existing stored-snapshot architecture: Prisma seed data writes city/source/dashboard rows, API routes read stored snapshots, and ingestion adapters use explicit per-city source configuration. No request-time external provider calls or schema changes are required.

**Tech Stack:** Next.js App Router, TypeScript, Prisma/PostgreSQL, Vitest, React Testing Library.

---

## File Structure

| File | Responsibility |
| --- | --- |
| `TODO.md` | Active session tasks derived from `docs/specs/major-dutch-cities-10.md`. |
| `prisma/seed.ts` | Deterministic seed data for all 10 active city dashboards. |
| `lib/ingestion/source-config.ts` | Source station/location mapping for all 10 supported city slugs. |
| `tests/ingestion-live-adapters.test.ts` | Source-config coverage and adapter behavior tests. |
| `tests/ingestion-jobs.test.ts` | All-city mock ingestion coverage expectations. |
| `tests/dashboard-regeneration.test.ts` | All-active-city regeneration expectation. |
| `tests/dashboard.test.ts` | Public dashboard response and hero fallback contract. |
| `app/dashboard/__tests__/DashboardShell.test.tsx` | City switcher behavior with a larger city catalog. |
| `docs/commands.md` | Manual API examples for 10-city support. |
| `docs/database.md` | Seed rule documentation for 10 cities. |
| `docs/architecture.md` | Runtime invariant update from 3 to 10 seeded cities. |
| `docs/changelog.md` | User-visible change note. |
| `docs/iterations/archive/2026-05-28-major-dutch-cities-10.md` | Completed session archive after implementation. |
| `docs/insights.md` | Session lessons after validation. |

---

### Task 1: Log Spec-Derived TODO Items

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Add active session entry before implementation**

Add this entry above `## Backlog`:

```markdown
## Active: 2026-05-28 - Major Dutch Cities 10-City Rollout

Spec: `docs/specs/major-dutch-cities-10.md`

- [ ] Add tests for 10 supported city source-config and dashboard coverage.
- [ ] Add seven new reliable city seeds and source mappings.
- [ ] Update affected docs for the 10-city support contract.
- [ ] Run validation and archive the completed session.
```

- [ ] **Step 2: Run a no-code check**

Run: `git diff -- TODO.md`

Expected: the active entry references `docs/specs/major-dutch-cities-10.md` and contains only unchecked implementation items.

- [ ] **Step 3: Commit**

Run:

```bash
npm run lint
git add TODO.md
git commit -m "chore: log 10-city rollout tasks"
```

Attach a git note:

```text
Task: Log 10-city rollout TODOs
Summary: Added active TODO items derived from the accepted 10-city rollout spec.
Spec: docs/specs/major-dutch-cities-10.md
Docs: TODO.md
TODO: Active: 2026-05-28 - Major Dutch Cities 10-City Rollout
Validation: npm run lint
```

---

### Task 2: Write Failing Coverage Tests

**Files:**
- Modify: `tests/ingestion-live-adapters.test.ts`
- Modify: `tests/ingestion-jobs.test.ts`
- Modify: `tests/dashboard-regeneration.test.ts`
- Modify: `app/dashboard/__tests__/DashboardShell.test.tsx`

- [ ] **Step 1: Update source-config expectations**

In `tests/ingestion-live-adapters.test.ts`, extend the local `cities` fixture to the 10 accepted slugs and update the source configuration test to expect:

```ts
[
  "amsterdam",
  "arnhem",
  "breda",
  "den-haag",
  "dordrecht",
  "groningen",
  "maastricht",
  "nijmegen",
  "rotterdam",
  "utrecht",
]
```

Add explicit checks:

```ts
expect(getSourceConfig("den-haag").luchtmeetnet.stationId).toBe("NL10404");
expect(getSourceConfig("groningen").rijkswaterstaat.locationCode).toBe("groningen");
expect(getSourceConfig("arnhem").rijkswaterstaat.locationCode).toBe("arnhem.nederrijn");
expect(getSourceConfig("maastricht").rijkswaterstaat.locationCode).toBe(
  "maastricht.borgharen.julianakanaal",
);
expect(getSourceConfig("breda").luchtmeetnet.stationId).toBe("NL10241");
expect(getSourceConfig("nijmegen").rijkswaterstaat.locationCode).toBe("nijmegen.waal");
expect(getSourceConfig("dordrecht").luchtmeetnet.stationId).toBe("NL10442");
```

- [ ] **Step 2: Update all-city job expectations**

In `tests/ingestion-jobs.test.ts`, update fake active cities so `runAllIngestion()` returns all 10 accepted slugs in slug order.

- [ ] **Step 3: Update dashboard regeneration expectations**

In `tests/dashboard-regeneration.test.ts`, update `findMany` in `makePrismaStub()` so `regenerateAllDashboardSnapshots()` returns all 10 accepted slugs in slug order and expects 10 dashboard creates.

- [ ] **Step 4: Update city switcher test data**

In `app/dashboard/__tests__/DashboardShell.test.tsx`, include all 10 city entries in the `/api/cities` mock for the main switcher test and assert one new city, such as Den Haag, appears in the menu.

- [ ] **Step 5: Run tests to verify failure**

Run:

```bash
npm test -- tests/ingestion-live-adapters.test.ts tests/ingestion-jobs.test.ts tests/dashboard-regeneration.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: FAIL because `lib/ingestion/source-config.ts` and `prisma/seed.ts` still support only 3 cities.

---

### Task 3: Implement City Seeds and Source Mappings

**Files:**
- Modify: `lib/ingestion/source-config.ts`
- Modify: `prisma/seed.ts`

- [ ] **Step 1: Extend city source config type and array**

Add the seven new config entries exactly from the accepted spec:

```ts
{
  citySlug: "den-haag",
  knmi: { stationId: "0-20000-0-06215", stationName: "Voorschoten" },
  luchtmeetnet: {
    stationId: "NL10404",
    stationName: "Den Haag-Rebecquestraat",
    components: ["PM25", "PM10", "NO2", "O3", "SO2"],
  },
  rijkswaterstaat: {
    locationCode: "scheveningen",
    locationName: "Scheveningen",
    measurementCode: "WATHTE",
  },
  selectionNotes:
    "Den Haag uses nearby Voorschoten for KNMI weather, Rebecquestraat for direct city air quality, and Scheveningen as the representative coastal Rijkswaterstaat WATHTE location.",
}
```

Repeat with the accepted spec values for Groningen, Arnhem, Maastricht, Breda, Nijmegen, and Dordrecht.

- [ ] **Step 2: Add deterministic seed data**

In `prisma/seed.ts`, add `CitySeed` objects for:

```ts
"den-haag" | "groningen" | "arnhem" | "maastricht" | "breda" | "nijmegen" | "dordrecht"
```

Use realistic but deterministic mock values. For every new seed:

- `countryCode` remains `NL` through `seedCity()`;
- `timezone` remains `Europe/Amsterdam`;
- `sourceName` values stay `mock_knmi`, `mock_luchtmeetnet`, and `mock_rijkswaterstaat`;
- `stateHash` remains generated as `mock-${seed.slug}-v2`;
- `outlook.hourly` has 9 entries;
- `outlook.weekly` has 7 entries;
- `water.weeklyLevelsCm` has 7 values;
- `briefingText` and `uiSummary` mention the city by name.

- [ ] **Step 3: Run targeted tests**

Run:

```bash
npm test -- tests/ingestion-live-adapters.test.ts tests/ingestion-jobs.test.ts tests/dashboard-regeneration.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: PASS.

- [ ] **Step 4: Commit**

Run:

```bash
npm run lint
npm run typecheck
git add lib/ingestion/source-config.ts prisma/seed.ts tests/ingestion-live-adapters.test.ts tests/ingestion-jobs.test.ts tests/dashboard-regeneration.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
git commit -m "feat: add reliable 10-city dashboard coverage"
```

Attach a git note:

```text
Task: Add reliable 10-city dashboard coverage
Summary: Added seven supported Dutch cities with deterministic seed snapshots, explicit live source mappings, and updated coverage tests.
Spec: docs/specs/major-dutch-cities-10.md
Docs: N/A
TODO: Add tests for 10 supported city source-config and dashboard coverage; Add seven new reliable city seeds and source mappings
Validation: npm run lint; npm run typecheck; targeted vitest files
```

---

### Task 4: Update Docs and Run Full Validation

**Files:**
- Modify: `docs/architecture.md`
- Modify: `docs/database.md`
- Modify: `docs/commands.md`
- Modify: `docs/changelog.md`
- Modify: `TODO.md`
- Modify: `docs/insights.md`
- Create: `docs/iterations/archive/2026-05-28-major-dutch-cities-10.md`

- [ ] **Step 1: Update docs**

Update docs to say the seeded catalog contains 10 reliable supported cities, not only Amsterdam/Utrecht/Rotterdam.

- [ ] **Step 2: Mark TODO implementation items complete**

In `TODO.md`, mark completed items with commit hashes after commits exist, then move the completed active session into `docs/iterations/archive/2026-05-28-major-dutch-cities-10.md`.

- [ ] **Step 3: Record session lessons**

Append a short `2026-05-28 - Major Dutch Cities 10-City Rollout` entry to `docs/insights.md` covering provider catalog checks and source mapping discipline.

- [ ] **Step 4: Run full validation**

Run:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

Expected: all commands pass. If build cannot reach a configured database, report the exact failure and run all validation commands that do not depend on that unavailable service.

- [ ] **Step 5: Commit docs and archive**

Run:

```bash
git add docs/architecture.md docs/database.md docs/commands.md docs/changelog.md TODO.md docs/insights.md docs/iterations/archive/2026-05-28-major-dutch-cities-10.md
git commit -m "docs: document 10-city rollout"
```

Attach a git note:

```text
Task: Document 10-city rollout
Summary: Updated docs, archived the completed TODO session, and recorded session lessons for the 10-city dashboard rollout.
Spec: docs/specs/major-dutch-cities-10.md
Docs: docs/architecture.md, docs/database.md, docs/commands.md, docs/changelog.md, docs/iterations/archive/2026-05-28-major-dutch-cities-10.md, docs/insights.md
TODO: Active: 2026-05-28 - Major Dutch Cities 10-City Rollout
Validation: npm run lint; npm run typecheck; npm test; npx prisma validate; npm run build
```

---

## Self-Review

- Spec coverage: the plan covers 10-city seed support, explicit source config coverage, API/city switcher behavior through stored snapshots, docs, TODO logging, validation, archive, and git notes.
- Placeholder scan: no implementation step uses TBD/TODO/fill-in language; each task names exact files, commands, and expected outcomes.
- Type consistency: city slugs match the accepted spec and should be reused consistently in tests, seed data, and source config.
