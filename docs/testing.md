# Testing Guide

## Purpose

Testing includes route behavior, response shaping, Prisma schema validation, and production build checks.

## Prerequisites

- run commands from the repository root
- install Node dependencies with `npm install`
- use local PostgreSQL for migration, seed, and manual API checks
- avoid real credentials in tests

## Test Layout

- `tests/`: Vitest tests for TypeScript helpers and API contract behavior.
- `prisma/`: schema validation and migration checks.
- Manual browser/API checks verify seeded data reaches the UI.

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
