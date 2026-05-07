# Testing Guide

## Purpose

Testing includes route behavior, response shaping, Prisma schema validation, and production build checks.

## Prerequisites

- run commands from the repository root
- install Node dependencies with `npm install`
- use local PostgreSQL for migration, seed, and manual API checks
- avoid real credentials in tests

## Test Layout

- `tests/`: Vitest tests for TypeScript helpers, API contract behavior, formatter unit tests, and live dashboard component tests.
  - `tests/format.test.ts`: unit tests covering pure formatter functions in `lib/utils/format.ts`.
  - `tests/live-dashboard.test.tsx`: component render/interaction tests for `LiveDashboard` (data rendering, fallback labels, city selector, city-change fetch, manual Refresh button, 30s auto-poll).
  - `tests/setup.ts`: `@testing-library/jest-dom` matcher setup, imported by the Vitest config.
- `app/**/__tests__/`: Vitest + Testing Library tests for frontend helpers and interactive dashboard components.
- `prisma/`: schema validation and migration checks.
- Manual browser/API checks verify seeded data reaches the UI.

## React Component Tests

Component tests use `@testing-library/react` and `@testing-library/jest-dom`, run under `happy-dom` via Vitest.

The Vitest config (`vitest.config.ts`) sets `globals: true` and `setupFiles: ['tests/setup.ts']`. JSX is transpiled via esbuild (`jsx: 'automatic'`, `jsxImportSource: 'react'`).

Per-test-file environment selection uses the Vitest file-level annotation:

```ts
// @vitest-environment happy-dom
```

This is placed at the top of each `.test.tsx` file that needs a DOM environment. `.test.ts` files run in the default Node environment.

Component test conventions:

- Mock external fetch calls; do not hit the real API.
- Test observable behavior (rendered text, user interactions) rather than implementation details.
- Keep mocks minimal — only stub what is needed for the test to isolate correctly.

## Running Tests

Run all tests:

```bash
npm test
```

Run one file:

```bash
npm test -- tests/dashboard.test.ts
```

Typecheck:

```bash
npm run typecheck
```

Lint:

```bash
npm run lint
```

Run the dashboard UI tests:

```bash
npm test -- app/dashboard/__tests__/qa.test.ts app/dashboard/__tests__/DashboardShell.test.tsx
```

## Validation Workflow

Default sequence before commit:

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

When Docker is available, also run:

```bash
docker compose -f infra/docker/docker-compose.yml config
docker compose -f infra/docker/docker-compose.yml up -d postgres
npx prisma migrate dev --name foundation_schema
npx prisma db seed
```

## When To Invoke `test-plan-writer`

Invoke after implementation and before PR-ready when:

- behavior changed
- API changed
- persistence changed
- architecture changed
- acceptance criteria need coverage mapping

Do not invoke for trivial copy, docs-only, or tiny localized edits.

## Coverage Expectations

Meaningful changes should cover:

- happy path
- failure path
- boundary conditions
- persistence effects where practical
- public API response shape
- frontend interaction behavior for city switching, local Q&A, chart state, and failed dashboard reloads

## Manual UI Checks

For dashboard UI changes:

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
npx prisma migrate dev --name foundation_schema
npx prisma db seed
npm run dev
```

Then open `http://localhost:3000` and verify desktop, tablet, and mobile widths. Check that city switching stays on same-app API routes, source freshness is visible, and the Q&A panel returns local source-grounded answers only.
