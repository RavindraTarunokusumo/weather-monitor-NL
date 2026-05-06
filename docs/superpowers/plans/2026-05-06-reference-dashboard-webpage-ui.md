# Reference Dashboard Webpage UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the accepted reference-aligned public dashboard webpage from `docs/specs/reference-dashboard-webpage-ui.md`.

**Architecture:** Keep backend response shaping in `lib/dashboard.ts`, seed deterministic dashboard snapshots for all supported cities, and move UI interactivity into focused client-side React components under `app/`. The browser only calls same-app API routes, while formatting, local Q&A, and chart view state stay in frontend helpers/components that can be tested with Vitest and Testing Library.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS/CSS modules via `app/globals.css`, Prisma, PostgreSQL seed data, Vitest, React Testing Library, jsdom.

---

## Files and Responsibilities

- `TODO.md`: active session checklist derived from `docs/specs/reference-dashboard-webpage-ui.md`.
- `public/dashboard-assets/*`: committed static copies of the supplied dashboard reference images/icons.
- `prisma/seed.ts`: deterministic seeded dashboard snapshots for Amsterdam, Utrecht, and Rotterdam.
- `lib/dashboard.ts`: normalized public dashboard API response, including pollutant values and UI summary payload.
- `tests/dashboard.test.ts`: backend response-shaping coverage.
- `app/page.tsx`: server entry point that renders the dashboard route.
- `app/dashboard/types.ts`: frontend API and view model types.
- `app/dashboard/format.ts`: formatting and fallback helpers.
- `app/dashboard/qa.ts`: local source-grounded mock Q&A helper.
- `app/dashboard/components/*.tsx`: focused dashboard UI components.
- `app/dashboard/__tests__/*.test.tsx`: interactive UI tests.
- `app/globals.css`: page-level dashboard styling and responsive layout.
- `package.json`, `package-lock.json`, `vitest.config.ts`: UI test dependencies and jsdom test setup.
- `docs/architecture.md`, `docs/testing.md`, `docs/changelog.md`: implementation notes after behavior changes.

---

### Task 1: Start the Accepted Spec Session

**Files:**
- Modify: `TODO.md`

- [ ] **Step 1: Confirm current branch and status**

Run:

```bash
git status --short --branch
```

Expected: branch is `codex/ui-webpage-spec`; existing uncommitted files include the accepted spec, supplied reference assets, and this plan.

- [ ] **Step 2: Add the active session to `TODO.md` before implementation edits**

Add this session under `## Active Session`:

```markdown
<!-- reference-dashboard-webpage-ui — spec: docs/specs/reference-dashboard-webpage-ui.md -->

### Reference Dashboard Webpage UI

- [ ] Copy supplied dashboard visual assets into the public asset tree.
- [ ] Extend seeded dashboard data and API response shaping for the reference UI.
- [ ] Add frontend test harness for React interaction tests.
- [ ] Build the reference-aligned dashboard page and components.
- [ ] Update docs and run pre-PR validation.
```

- [ ] **Step 3: Commit the accepted spec, plan, and session start**

Run:

```bash
npm run lint
npm run typecheck
npm test
git add docs/specs/reference-dashboard-webpage-ui.md docs/superpowers/plans/2026-05-06-reference-dashboard-webpage-ui.md TODO.md
git commit -m "docs: accept reference dashboard webpage spec"
```

Then attach a git note using `.github/git_notes_template.md` and include `Spec: docs/specs/reference-dashboard-webpage-ui.md`.

Expected: checks pass, commit succeeds, and the first TODO sub-item can be tagged with the commit hash.

---

### Task 2: Copy Public Dashboard Assets

**Files:**
- Create: `public/dashboard-assets/amsterdam-day.png`
- Create: `public/dashboard-assets/logo-mark.png`
- Create: `public/dashboard-assets/icon-temp.png`
- Create: `public/dashboard-assets/icon-rain.png`
- Create: `public/dashboard-assets/icon-wind.png`
- Create: `public/dashboard-assets/icon-leaf.png`
- Create: `public/dashboard-assets/icon-wave.png`
- Create: `public/dashboard-assets/icon-spark.png`
- Create: `public/dashboard-assets/icon-warn.png`
- Create: `public/dashboard-assets/icon-trend.png`
- Modify: `TODO.md`

- [ ] **Step 1: Copy the supplied files into `public/dashboard-assets/`**

Run:

```bash
New-Item -ItemType Directory -Force -Path public\dashboard-assets
Copy-Item -LiteralPath assets\amsterdam-day.png -Destination public\dashboard-assets\amsterdam-day.png
Copy-Item -LiteralPath assets\logo-mark.png -Destination public\dashboard-assets\logo-mark.png
Copy-Item -LiteralPath assets\icon-temp.png -Destination public\dashboard-assets\icon-temp.png
Copy-Item -LiteralPath assets\icon-rain.png -Destination public\dashboard-assets\icon-rain.png
Copy-Item -LiteralPath assets\icon-wind.png -Destination public\dashboard-assets\icon-wind.png
Copy-Item -LiteralPath assets\icon-leaf.png -Destination public\dashboard-assets\icon-leaf.png
Copy-Item -LiteralPath assets\icon-wave.png -Destination public\dashboard-assets\icon-wave.png
Copy-Item -LiteralPath assets\icon-spark.png -Destination public\dashboard-assets\icon-spark.png
Copy-Item -LiteralPath assets\icon-warn.png -Destination public\dashboard-assets\icon-warn.png
Copy-Item -LiteralPath assets\icon-trend.png -Destination public\dashboard-assets\icon-trend.png
```

Expected: files exist under `public/dashboard-assets/`.

- [ ] **Step 2: Verify asset paths**

Run:

```bash
Get-ChildItem -Path public\dashboard-assets | Select-Object Name,Length
```

Expected: ten PNG files are listed with non-zero lengths.

- [ ] **Step 3: Commit assets**

Run:

```bash
npm run lint
npm run typecheck
npm test
git add public/dashboard-assets/amsterdam-day.png public/dashboard-assets/logo-mark.png public/dashboard-assets/icon-temp.png public/dashboard-assets/icon-rain.png public/dashboard-assets/icon-wind.png public/dashboard-assets/icon-leaf.png public/dashboard-assets/icon-wave.png public/dashboard-assets/icon-spark.png public/dashboard-assets/icon-warn.png public/dashboard-assets/icon-trend.png TODO.md
git commit -m "feat(ui): add dashboard reference assets"
```

Attach a git note with `Spec: docs/specs/reference-dashboard-webpage-ui.md`, then mark the related TODO item with the commit hash.

---

### Task 3: Extend Seed Data and Dashboard Response

**Files:**
- Modify: `prisma/seed.ts`
- Modify: `lib/dashboard.ts`
- Modify: `tests/dashboard.test.ts`
- Modify: `TODO.md`

- [ ] **Step 1: Write failing response-shaping assertions**

In `tests/dashboard.test.ts`, extend the existing happy-path test to assert:

```typescript
expect(response.current).toMatchObject({
  condition_label: "Partly cloudy",
  warning_level: "none",
});
expect(response.air_quality.pollutants).toEqual({
  pm25: 12,
  pm10: 22,
  no2: 18,
  o3: 46,
  so2: 6,
});
expect(response.ui_summary).toMatchObject({
  best_window: "10:00-16:00",
  main_risk: "Evening showers and gusts",
  changed: "Warmer than yesterday",
});
expect(response.outlook.hourly).toHaveLength(9);
expect(response.outlook.weekly).toHaveLength(7);
expect(response.water_signal.weekly_levels_cm).toEqual([14, 13, 14, 15, 14, 16, 15]);
```

Add missing-data assertions:

```typescript
expect(response.current.condition_label).toBeNull();
expect(response.air_quality.pollutants).toEqual({
  pm25: null,
  pm10: null,
  no2: null,
  o3: null,
  so2: null,
});
expect(response.outlook.hourly).toEqual([]);
expect(response.outlook.weekly).toEqual([]);
expect(response.water_signal.weekly_levels_cm).toEqual([]);
```

- [ ] **Step 2: Run the targeted test and verify failure**

Run:

```bash
npm test -- tests/dashboard.test.ts
```

Expected: failure because `condition_label`, `pollutants`, `ui_summary`, `outlook`, and `weekly_levels_cm` are not implemented yet.

- [ ] **Step 3: Extend `buildDashboardResponse`**

Add normalized fields:

```typescript
current.condition_label
air_quality.pollutants
water_signal.weekly_levels_cm
ui_summary.best_window
ui_summary.main_risk
ui_summary.changed
ui_summary.outdoor_window_detail
ui_summary.risk_detail
ui_summary.changed_detail
outlook.hourly
outlook.weekly
```

Read those fields from `summaryPayload` only after validating that the payload value is an object. Fall back to `null` or empty arrays when fields are missing. Do not derive measurements in the frontend.

- [ ] **Step 4: Seed deterministic snapshots for Utrecht and Rotterdam**

Refactor `prisma/seed.ts` to use a local array of city dashboard seeds. Each city seed must include:

```typescript
slug
weather: temperatureC, feelsLikeC, rainMm, rainProbability, windSpeedKmh, windGustKmh, windDirection, weatherCode, warningLevel
air: aqiValue, aqiLabel, pm25, pm10, no2, o3, so2, mainPollutant, trendLabel
water: stationId, stationName, waterLevelCm, trendLabel, riskLabel
cycleComfortScore
cycleComfortLabel
bestOutdoorWindow
worstOutdoorWindow
briefingText
summaryPayload.ui_summary
summaryPayload.outlook.hourly
summaryPayload.outlook.weekly
summaryPayload.water_signal.weekly_levels_cm
```

Use the supplied HTML values for deterministic seeded Utrecht and Rotterdam dashboard data. Delete and recreate each city's matching mock snapshots by `cityId` and mock source names before insertion so repeated seeding is idempotent.

- [ ] **Step 5: Verify targeted tests pass**

Run:

```bash
npm test -- tests/dashboard.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit data/API work**

Run:

```bash
npm run lint
npm run typecheck
npm test
git add prisma/seed.ts lib/dashboard.ts tests/dashboard.test.ts TODO.md
git commit -m "feat(api): shape dashboard data for reference UI"
```

Attach a git note with `Spec: docs/specs/reference-dashboard-webpage-ui.md`, then mark the related TODO item with the commit hash.

---

### Task 4: Add Frontend Test Harness

**Files:**
- Modify: `package.json`
- Modify: `package-lock.json`
- Modify: `vitest.config.ts`
- Create: `app/dashboard/__tests__/qa.test.ts`
- Create: `app/dashboard/qa.ts`
- Modify: `TODO.md`

- [ ] **Step 1: Install UI test dependencies**

Run:

```bash
npm install -D @testing-library/react @testing-library/user-event @testing-library/jest-dom jsdom
```

Expected: `package.json` and `package-lock.json` include the new dev dependencies.

- [ ] **Step 2: Configure Vitest jsdom globals**

Update `vitest.config.ts`:

```typescript
import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: ["./tests/setup.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "."),
    },
  },
});
```

Create `tests/setup.ts`:

```typescript
import "@testing-library/jest-dom/vitest";
```

- [ ] **Step 3: Write the local Q&A helper test**

Create `app/dashboard/__tests__/qa.test.ts`:

```typescript
import { describe, expect, it } from "vitest";
import { answerDashboardQuestion } from "../qa";

const dashboard = {
  city: { name: "Amsterdam" },
  current: { rain_probability: 0.2, wind_speed_kmh: 18, wind_gust_kmh: 32 },
  cycle_comfort: { score: 78, label: "good", best_outdoor_window: "10:00-16:00" },
  briefing: "Today looks comfortable for Amsterdam.",
};

describe("answerDashboardQuestion", () => {
  it("answers rain questions from normalized dashboard data", () => {
    expect(answerDashboardQuestion(dashboard, "Will it rain this evening?")).toContain("20%");
  });

  it("answers cycling questions from cycle comfort data", () => {
    expect(answerDashboardQuestion(dashboard, "Is cycling good today?")).toContain("78/100");
  });

  it("falls back to the briefing for broad questions", () => {
    expect(answerDashboardQuestion(dashboard, "What should I know?")).toBe(
      "Today looks comfortable for Amsterdam.",
    );
  });
});
```

- [ ] **Step 4: Implement `answerDashboardQuestion`**

Create `app/dashboard/qa.ts` with a pure helper that lowercases the question, detects rain/cycling/wind keywords, and returns sentences using only values present on the dashboard argument. If a needed value is missing, return `That detail is unavailable in the current dashboard data.`

- [ ] **Step 5: Run targeted test**

Run:

```bash
npm test -- app/dashboard/__tests__/qa.test.ts
```

Expected: pass.

- [ ] **Step 6: Commit test harness**

Run:

```bash
npm run lint
npm run typecheck
npm test
git add package.json package-lock.json vitest.config.ts tests/setup.ts app/dashboard/qa.ts app/dashboard/__tests__/qa.test.ts TODO.md
git commit -m "test(ui): add dashboard interaction test harness"
```

Attach a git note with `Spec: docs/specs/reference-dashboard-webpage-ui.md`, then mark the related TODO item with the commit hash.

---

### Task 5: Build the Reference Dashboard UI

**Files:**
- Modify: `app/page.tsx`
- Create: `app/dashboard/types.ts`
- Create: `app/dashboard/format.ts`
- Create: `app/dashboard/components/DashboardShell.tsx`
- Create: `app/dashboard/components/TopNav.tsx`
- Create: `app/dashboard/components/BriefingHero.tsx`
- Create: `app/dashboard/components/MetricStrip.tsx`
- Create: `app/dashboard/components/OutlookPanel.tsx`
- Create: `app/dashboard/components/AskDashboardPanel.tsx`
- Create: `app/dashboard/components/DetailPanels.tsx`
- Create: `app/dashboard/components/SourceFreshnessFooter.tsx`
- Create: `app/dashboard/__tests__/DashboardShell.test.tsx`
- Modify: `app/globals.css`
- Modify: `TODO.md`

- [ ] **Step 1: Write failing interaction tests**

Create `app/dashboard/__tests__/DashboardShell.test.tsx` with mocked `fetch` responses for `/api/cities` and `/api/dashboard?city=<slug>`. Cover:

```typescript
render(<DashboardShell initialDashboard={amsterdamDashboard} />);
expect(screen.getByRole("heading", { name: /amsterdam/i })).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: /select city/i }));
await user.click(screen.getByRole("option", { name: /utrecht/i }));
expect(await screen.findByRole("heading", { name: /utrecht/i })).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: "7D" }));
expect(screen.getByText(/7-day/i)).toBeInTheDocument();
await user.click(screen.getByRole("button", { name: /will it rain/i }));
expect(screen.getByText(/rain/i)).toBeInTheDocument();
```

Add a second test where the dashboard fetch returns `404` and assert an error message is shown.

- [ ] **Step 2: Run the UI test and verify failure**

Run:

```bash
npm test -- app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: failure because components do not exist.

- [ ] **Step 3: Replace `app/page.tsx` with the dashboard entry**

Keep the existing same-app server fetch pattern, but render:

```tsx
<DashboardShell initialDashboard={dashboard} />
```

Keep the unavailable-dashboard fallback for initial server fetch errors.

- [ ] **Step 4: Implement typed frontend helpers**

Create `app/dashboard/types.ts` for the normalized dashboard, city, source freshness, hourly outlook, weekly outlook, and chart view types. Create `app/dashboard/format.ts` with `formatDateTime`, `formatPercent`, `formatNumber`, `formatTemperature`, and `fallbackLabel` helpers.

- [ ] **Step 5: Implement dashboard components**

Build the component set listed in this task's file list. Required behavior:

- `DashboardShell` owns selected city, city list, dashboard fetch state, chart view, and ask-dashboard messages.
- `TopNav` exposes a keyboard-accessible city selector and uses `/dashboard-assets/logo-mark.png`.
- `BriefingHero` uses `/dashboard-assets/amsterdam-day.png`, shows the date in Europe/Amsterdam, and renders unavailable summary bullets when `ui_summary` fields are missing.
- `MetricStrip` renders six compact metric cards with supplied icon assets and fallback labels.
- `OutlookPanel` renders SVG bars/lines for `24H`, weekly cards for `7D`, and an unavailable state for `7D+` unless data is present.
- `AskDashboardPanel` uses `answerDashboardQuestion` and never calls an external provider.
- `DetailPanels` renders cycle comfort, air quality pollutant values, and water trend values with fallbacks.
- `SourceFreshnessFooter` renders all source timestamps and a Europe/Amsterdam timezone note.

- [ ] **Step 6: Style the page**

Update `app/globals.css` to match the reference layout: off-white page background, deep navy hero, white cards with restrained borders, orange action button, responsive grid, and mobile stacking. Keep card radius at 8px to 10px and verify text does not overlap at 390px, 768px, and desktop widths.

- [ ] **Step 7: Run targeted UI tests**

Run:

```bash
npm test -- app/dashboard/__tests__/DashboardShell.test.tsx app/dashboard/__tests__/qa.test.ts
```

Expected: pass.

- [ ] **Step 8: Commit UI work**

Run:

```bash
npm run lint
npm run typecheck
npm test
git add app/page.tsx app/globals.css app/dashboard/types.ts app/dashboard/format.ts app/dashboard/components/DashboardShell.tsx app/dashboard/components/TopNav.tsx app/dashboard/components/BriefingHero.tsx app/dashboard/components/MetricStrip.tsx app/dashboard/components/OutlookPanel.tsx app/dashboard/components/AskDashboardPanel.tsx app/dashboard/components/DetailPanels.tsx app/dashboard/components/SourceFreshnessFooter.tsx app/dashboard/__tests__/DashboardShell.test.tsx TODO.md
git commit -m "feat(ui): build reference dashboard webpage"
```

Attach a git note with `Spec: docs/specs/reference-dashboard-webpage-ui.md`, then mark the related TODO item with the commit hash.

---

### Task 6: Documentation, Validation, and Pre-PR Review

**Files:**
- Modify: `docs/architecture.md`
- Modify: `docs/testing.md`
- Modify: `docs/changelog.md`
- Modify: `docs/insights.md`
- Modify: `TODO.md`

- [ ] **Step 1: Update docs**

Document the new dashboard component boundary in `docs/architecture.md`, the UI test harness/manual browser checks in `docs/testing.md`, and the user-visible dashboard upgrade in `docs/changelog.md`.

- [ ] **Step 2: Run simplification review**

Use the `simplify` skill against the current diff. Apply only behavior-preserving improvements.

- [ ] **Step 3: Run doc updater**

Use the available doc-updater agent or skill to check docs against the implemented changes. Apply required corrections.

- [ ] **Step 4: Run test-plan writer**

Invoke `test-plan-writer` because behavior, API response shape, tests, and frontend architecture changed. Save or summarize the resulting test plan according to the active workflow.

- [ ] **Step 5: Security review decision**

Do not invoke `security-review` unless the implementation adds auth, secrets, external network calls, privileged operations, or new user-input persistence. The planned UI keeps Q&A local and calls only same-app API routes, so a security review is not required by default.

- [ ] **Step 6: Run full validation**

Run:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

Expected: all pass. If local PostgreSQL is unavailable for build/migration, record the exact failure and run the strongest available subset.

- [ ] **Step 7: Manual browser verification**

Run:

```bash
npm run dev
```

Open `http://localhost:3000` and verify:

- desktop page visually matches `assets/reference-design.png` in layout, hierarchy, palette, and density.
- mobile/tablet layouts have no overlapping text or clipped controls.
- city switching works for Amsterdam, Utrecht, and Rotterdam.
- source freshness remains visible.
- browser network requests stay on same-app routes.

- [ ] **Step 8: Commit docs and validation updates**

Run:

```bash
git add docs/architecture.md docs/testing.md docs/changelog.md docs/insights.md TODO.md
git commit -m "docs: document reference dashboard webpage"
```

Attach a git note with `Spec: docs/specs/reference-dashboard-webpage-ui.md`, then mark the related TODO item with the commit hash.

---

## Self-Review

- Spec coverage: all accepted spec sections map to tasks. Assets are Task 2, API/seed response data is Task 3, UI/test harness is Tasks 4 and 5, docs/validation/pre-PR work is Task 6.
- Placeholder scan: no unresolved placeholder text remains in the plan.
- Type consistency: planned normalized fields are introduced in `lib/dashboard.ts`, then consumed through `app/dashboard/types.ts` and tested in `DashboardShell.test.tsx`.
- Scope check: the plan avoids auth, live provider calls, real AI Q&A, maps, subscriptions, and dark mode.
