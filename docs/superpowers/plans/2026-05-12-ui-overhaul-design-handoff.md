# UI Overhaul Design Handoff Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refit the existing Next.js dashboard to match the accepted high-fidelity Dutch Weather Intelligence design handoff.

**Architecture:** Keep `app/page.tsx` as the server entry and keep `DashboardShell` as the client state owner for city, chart view, and chart metric. Rework the existing focused dashboard components rather than importing the standalone HTML prototype, with chart logic isolated inside `OutlookPanel`.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind CSS entry plus global CSS classes, Vitest, Testing Library, same-app dashboard API.

---

## File Structure

- Modify `docs/specs/ui-overhaul-design-handoff.md`: accepted spec for this feature.
- Modify `TODO.md`: active session tasks derived from the accepted spec.
- Modify `app/dashboard/types.ts`: add `ChartMetric` if the chart metric state is shared across shell and panel.
- Modify `app/dashboard/components/DashboardShell.tsx`: add `chartMetric` state and adjust page layout wrappers.
- Modify `app/dashboard/components/TopNav.tsx`: sticky compact navigation and accessible city switcher.
- Modify `app/dashboard/components/BriefingHero.tsx`: compact 260px hero strip and weather overlay.
- Modify `app/dashboard/components/MetricStrip.tsx`: compact metric cards and cycle donut.
- Modify `app/dashboard/components/OutlookPanel.tsx`: metric toggle, SVG 24h chart, aligned 7d/7d+ views.
- Modify `app/dashboard/components/DetailPanels.tsx`: AQI, cycle, water panels in handoff order and density.
- Modify `app/dashboard/components/AskDashboardPanel.tsx`: handoff Q&A card, chips, message bubbles, send button.
- Modify `app/dashboard/components/SourceFreshnessFooter.tsx`: bordered source freshness strip.
- Modify `app/globals.css`: design tokens, component classes, responsive rules.
- Modify `app/dashboard/__tests__/DashboardShell.test.tsx`: chart metric, source footer, and preserved interaction coverage.

## Task 1: Spec And Session Setup

**Files:**
- Modify: `docs/specs/ui-overhaul-design-handoff.md`
- Modify: `TODO.md`
- Create: `docs/superpowers/plans/2026-05-12-ui-overhaul-design-handoff.md`

- [ ] **Step 1: Mark the spec accepted**

Set the spec header to:

```markdown
Status: Accepted
Spec path: `docs/specs/ui-overhaul-design-handoff.md`
Accepted by: User
Accepted date: 2026-05-12
```

- [ ] **Step 2: Log active TODO session**

Add a `UI Overhaul Design Handoff` active session to `TODO.md` with the spec path and task checkboxes for tests, layout refit, chart/panel behavior, Q&A/footer, validation, and screenshot comparison.

- [ ] **Step 3: Verify setup**

Run: `git status --short --branch`

Expected: branch is `codex/ui-overhaul`; spec, plan, and TODO are the only tracked-work candidates.

## Task 2: RED Tests For Handoff Behavior

**Files:**
- Modify: `app/dashboard/__tests__/DashboardShell.test.tsx`

- [ ] **Step 1: Add failing chart metric toggle assertions**

Add a test that renders `DashboardShell`, verifies the default Rain chart, clicks `Temp`, verifies the temperature chart is active, clicks `Wind`, and verifies the wind chart is active.

```tsx
it("switches the 24-hour chart metric between rain, temperature, and wind", async () => {
  const user = userEvent.setup();
  vi.stubGlobal("fetch", vi.fn(async () => Response.json({ cities: [amsterdamDashboard.city] })));

  render(<DashboardShell initialDashboard={amsterdamDashboard} />);

  expect(screen.getByLabelText("24-hour rain chart")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Temp" }));
  expect(screen.getByLabelText("24-hour temperature chart")).toBeInTheDocument();
  await user.click(screen.getByRole("button", { name: "Wind" }));
  expect(screen.getByLabelText("24-hour wind chart")).toBeInTheDocument();
});
```

- [ ] **Step 2: Add failing footer structure assertion**

Add an assertion to the existing shell test that source freshness is rendered as a footer and includes the visible timestamp/source text.

```tsx
expect(screen.getByRole("contentinfo", { name: /source freshness/i })).toBeInTheDocument();
expect(screen.getByText(/all times in cest/i)).toBeInTheDocument();
```

- [ ] **Step 3: Run tests and verify RED**

Run: `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`

Expected: FAIL because `24-hour temperature chart`, `24-hour wind chart`, or updated source footer text does not exist yet.

## Task 3: GREEN Chart State And Outlook Panel

**Files:**
- Modify: `app/dashboard/types.ts`
- Modify: `app/dashboard/components/DashboardShell.tsx`
- Modify: `app/dashboard/components/OutlookPanel.tsx`
- Modify: `app/dashboard/__tests__/DashboardShell.test.tsx`

- [ ] **Step 1: Add chart metric type and shell state**

Add:

```ts
export type ChartMetric = "rain" | "temp" | "wind";
```

In `DashboardShell`, add:

```tsx
const [chartMetric, setChartMetric] = useState<ChartMetric>("rain");
```

Pass `chartMetric` and `onChartMetricChange={setChartMetric}` to `OutlookPanel`.

- [ ] **Step 2: Replace the 24h bar chart with an SVG metric chart**

Implement `HourlyMetricChart` inside `OutlookPanel.tsx`. It must render one active `<g>` with an accessible label:

```tsx
<svg aria-label={`24-hour ${metricLabel.toLowerCase()} chart`} viewBox="0 0 580 170">
```

It must guard empty, one-point, all-null, and equal min/max data before calculating paths.

- [ ] **Step 3: Add metric and view controls**

Render `Rain`, `Temp`, and `Wind` buttons with `aria-pressed`, plus the existing `24H`, `7D`, and `7D+` view buttons.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`

Expected: PASS for the updated dashboard shell tests.

## Task 4: RED/GREEN Layout Refit

**Files:**
- Modify: `app/dashboard/components/TopNav.tsx`
- Modify: `app/dashboard/components/BriefingHero.tsx`
- Modify: `app/dashboard/components/MetricStrip.tsx`
- Modify: `app/dashboard/components/DetailPanels.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Add focused assertions before production edits**

Extend tests to assert the handoff classes or landmarks that matter for behavior:

```tsx
expect(screen.getByRole("navigation", { name: /primary/i })).toBeInTheDocument();
expect(screen.getByRole("region", { name: /today briefing/i })).toBeInTheDocument();
expect(screen.getByRole("region", { name: /dashboard metrics/i })).toBeInTheDocument();
```

Run: `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`

Expected: FAIL until landmarks/labels are aligned.

- [ ] **Step 2: Refit top nav and hero**

Make `TopNav` sticky and compact. Make `BriefingHero` render the date-led briefing, three icon rows, and compact weather overlay from existing dashboard data.

- [ ] **Step 3: Refit metric strip and detail panels**

Make `MetricStrip` compact with separate value/unit spans and cycle donut. Make `DetailPanels` render AQI, cycle, and water panels in the handoff order.

- [ ] **Step 4: Verify GREEN**

Run: `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`

Expected: PASS for dashboard shell tests.

## Task 5: Q&A, Footer, And Responsive Styling

**Files:**
- Modify: `app/dashboard/components/AskDashboardPanel.tsx`
- Modify: `app/dashboard/components/SourceFreshnessFooter.tsx`
- Modify: `app/globals.css`

- [ ] **Step 1: Preserve Q&A behavior under new presentation**

Run existing Q&A assertions after the card refit:

```bash
npm test -- app/dashboard/__tests__/qa.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

Expected: PASS after implementation.

- [ ] **Step 2: Refit Q&A panel**

Render icon+uppercase header, user/AI message bubbles, compact input, send icon button, and quick chips only before messages exist.

- [ ] **Step 3: Refit footer**

Render source cells plus the right-aligned `All times in CEST` cell, keeping each `dashboard.source_freshness` item visible.

- [ ] **Step 4: Update responsive CSS**

Add desktop/tablet/mobile rules so the 1220px frame, hero, metric grid, chart/right panels, Q&A, and footer do not overlap at 1440px, 1220px, 900px, and 390px widths.

## Task 6: Full Validation And Screenshot Comparison

**Files:**
- Modify: `docs/insights.md` if a useful session lesson emerges.

- [ ] **Step 1: Run automated validation**

Run:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
```

Expected: all commands pass.

- [ ] **Step 2: Start local app for visual verification**

Run:

```bash
npm run dev
```

Expected: dashboard serves on a local port.

- [ ] **Step 3: Capture browser screenshot**

Open the local dashboard, capture a desktop screenshot, and compare it against the concept image from the planning thread for layout, spacing, hierarchy, card density, chart treatment, and footer placement.

- [ ] **Step 4: Document visual comparison result**

Record the screenshot comparison outcome in the final handoff and, if gaps remain, either fix them or list them as explicit residual differences.

## Task 7: Commit And Pre-PR Workflow

**Files:**
- Modify: `TODO.md`
- Read: `.github/git_notes_template.md`
- Read: `.github/pull_request_template.md`

- [ ] **Step 1: Run pre-commit checks**

Run the validation commands from Task 6 before each commit.

- [ ] **Step 2: Commit meaningful sub-items with specific staging**

Use specific staging, for example:

```bash
git add docs/specs/ui-overhaul-design-handoff.md docs/superpowers/plans/2026-05-12-ui-overhaul-design-handoff.md TODO.md
git commit -m "docs: accept ui overhaul spec"
```

Then commit implementation groups separately.

- [ ] **Step 3: Attach git note**

Use `.github/git_notes_template.md` and include `docs/specs/ui-overhaul-design-handoff.md`.

- [ ] **Step 4: Complete Step 6 and Step 7 checks**

Run simplification review, doc update review, test plan writer if behavior coverage needs mapping, full validation, and prepare PR text from `.github/pull_request_template.md`.

