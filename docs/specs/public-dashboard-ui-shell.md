# Public Dashboard UI Shell Spec

Status: Draft
Spec path: `docs/specs/public-dashboard-ui-shell.md`
Accepted by: TBD
Accepted date: TBD

## Goal

Create the first public, account-agnostic dashboard UI that renders seeded backend data in a clean Dutch-inspired interface.

This spec enables users to open the app, select a supported city, view current environmental conditions, read a mock briefing, inspect 24-hour outlook cards, and see source freshness without needing an account.

## Scope

This spec includes:

* Public dashboard page
* App shell and top navigation
* City selector
* Current condition cards
* AI briefing display card using seeded/mock text
* 24-hour outlook panel placeholder
* Cycle comfort card
* Air quality card
* Water signal card
* Source freshness footer
* Loading, error, and missing-data states
* Frontend API client for backend dashboard endpoint

Required frontend page:

```text
/
```

Optional route alias:

```text
/dashboard
```

Required components:

```text
components/app-shell.tsx
components/top-nav.tsx
components/city-selector.tsx
components/source-freshness.tsx
components/dashboard/ai-briefing-card.tsx
components/dashboard/current-condition-card.tsx
components/dashboard/cycle-comfort-card.tsx
components/dashboard/air-quality-card.tsx
components/dashboard/water-signal-card.tsx
components/dashboard/outlook-chart.tsx
components/dashboard/ask-dashboard-box.tsx
```

## Non-Goals

The following are intentionally out of scope:

* Full account authentication
* Saved user locations
* User settings
* Billing
* Real AI Q&A
* Live map panel
* Push notifications
* Client-side external weather API calls
* Real climate scenario explorer

## Acceptance Criteria

* Public dashboard page loads without requiring sign-in.
* Dashboard fetches data from backend `/api/v1/dashboard?city=<slug>`.
* City selector supports Amsterdam, Utrecht, and Rotterdam if returned by backend.
* Amsterdam seed data renders correctly.
* UI displays current weather, cycle comfort, air quality, water signal, outlook, briefing, and source freshness.
* Missing values render as unavailable instead of crashing.
* Backend API base URL is controlled by environment configuration.
* No external weather, water, air-quality, or AI provider keys are exposed in frontend code.
* The interface follows the intended mood: clean, minimal, Dutch-inspired, practical, calm, and slightly bold.

## Constraints

* Use Next.js App Router.
* Use TypeScript.
* Use Tailwind CSS.
* Keep business logic out of UI components.
* Do not calculate official scores in the frontend.
* Do not call KNMI, Rijkswaterstaat, Luchtmeetnet, or LLM APIs directly from the browser.
* Use accessible contrast and semantic markup where practical.
* Design must handle partial dashboard data.
* UI must clearly show source freshness.

## Implementation Notes

Recommended palette:

```text
Background: off-white
Primary text: deep navy
Primary panels: deep navy or white
Data accents: muted sky blue, soft teal, soft green
CTA/highlight: restrained vivid orange
Surfaces: light gray/off-white
Risk/warning: orange before red unless severe
```

Recommended layout:

```text
Top nav
  app name
  nav placeholders
  city selector

Main content
  briefing card
  current condition cards
  24-hour outlook panel
  cycle comfort card
  air quality card
  water signal card
  ask-dashboard placeholder
  source freshness footer
```

Recommended frontend data access:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function getDashboard(city: string) {
  const res = await fetch(`${API_BASE_URL}/api/v1/dashboard?city=${city}`, {
    cache: "no-store"
  });

  if (!res.ok) {
    throw new Error("Failed to load dashboard");
  }

  return res.json();
}
```

Recommended environment variable:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

Only non-secret frontend values should use `NEXT_PUBLIC_`.

## Test Expectations

Automated checks:

* TypeScript check passes.
* Lint passes if configured.
* Dashboard page renders with mocked API data.
* City selector changes selected city state.
* Missing card values render fallback labels.
* Source freshness component renders all available sources.

Manual checks:

* `http://localhost:3000` loads dashboard shell.
* Amsterdam seed data appears in the UI.
* Unsupported backend or failed request shows a user-friendly error state.
* UI works at common desktop widths.
* No secrets appear in browser devtools bundle or network calls.

Not applicable:

* Auth flow tests.
* Live ingestion tests.
* AI answer correctness tests.

## Open Questions

* None.