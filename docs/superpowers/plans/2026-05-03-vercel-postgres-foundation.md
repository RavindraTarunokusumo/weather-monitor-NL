# Vercel/Postgres Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a root-level full-stack Next.js app backed by Prisma/PostgreSQL that renders seeded Amsterdam dashboard data.

**Architecture:** The repository root becomes the active Next.js App Router application. Route Handlers in `app/api` read from PostgreSQL through Prisma, while the homepage fetches the dashboard API and renders a simple server-rendered dashboard. Local infrastructure remains under `infra/docker`.

**Tech Stack:** Next.js, TypeScript, Tailwind CSS, Prisma, PostgreSQL, Docker Compose, Vitest.

---

### Task 1: Root Next.js Scaffold

**Files:**
- Create/modify root Next.js files: `package.json`, `app/layout.tsx`, `app/page.tsx`, `app/globals.css`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `eslint.config.mjs`, `public/*`
- Remove active monorepo runtime files from `apps/` only if they conflict with the single-app milestone.

- [ ] Create root Next.js package and install dependencies.
- [ ] Add TypeScript, Tailwind, ESLint, and test scripts.
- [ ] Verify `npm run lint` and `npm run typecheck` can execute.

### Task 2: Database Foundation

**Files:**
- Create/modify: `infra/docker/docker-compose.yml`
- Create/modify: `.env.example`, `.env`
- Create/modify: `prisma/schema.prisma`, `prisma/seed.ts`
- Create: `lib/db.ts`

- [ ] Configure local Postgres compose service.
- [ ] Add Prisma schema for foundation tables from the active spec.
- [ ] Add repeatable seed for Amsterdam, Utrecht, Rotterdam, dashboard snapshot, and mock briefing.
- [ ] Run Prisma validation and migration.
- [ ] Run Prisma seed.

### Task 3: API Route Handlers

**Files:**
- Create: `app/api/health/route.ts`
- Create: `app/api/cities/route.ts`
- Create: `app/api/dashboard/route.ts`
- Create: `lib/dashboard.ts`
- Create tests: `tests/dashboard.test.ts`

- [ ] Write failing tests for dashboard response shaping.
- [ ] Implement health, cities, and dashboard route handlers.
- [ ] Verify tests pass.

### Task 4: Homepage Dashboard

**Files:**
- Modify: `app/page.tsx`
- Modify as needed: `app/globals.css`

- [ ] Render briefing, current conditions, cycle comfort, air quality, water signal, and source freshness.
- [ ] Keep UI simple and functional.
- [ ] Verify the page builds.

### Task 5: Docs and Validation

**Files:**
- Modify: `README.md`, `docs/architecture.md`, `docs/database.md`, `docs/commands.md`, `docs/testing.md`, `docs/index.md`, `TODO.md`

- [ ] Update setup instructions for single Next.js app.
- [ ] Remove stale FastAPI-first command references from active docs.
- [ ] Run lint, typecheck, tests, Prisma validation, and build.
- [ ] Run simplify, docs update review, test plan, and applicable pre-PR checks.
