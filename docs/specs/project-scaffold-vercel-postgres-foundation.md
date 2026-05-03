# Project Scaffold + Vercel/Postgres Foundation Spec

Status: Accepted
Spec path: `docs/specs/project-scaffold-vercel-postgres-foundation.md`
Accepted by: User
Accepted date: 2026-05-03

## Goal

Create a single full-stack Next.js App Router application that can run locally, connect to PostgreSQL through Prisma, seed mock dashboard data, expose Vercel-style Route Handler APIs, and render the Amsterdam dashboard from database-backed API data.

## Scope

This spec includes:

* Root-level Next.js application with TypeScript, ESLint, Tailwind, App Router, Turbopack-compatible dev command, and `@/*` import alias.
* Local PostgreSQL through `infra/docker/docker-compose.yml`.
* Prisma schema converted from the accepted foundation database schema.
* Initial Prisma migration.
* Seed data for Amsterdam, Utrecht, Rotterdam, and a mock Amsterdam dashboard snapshot.
* Mock AI briefing record for the seeded Amsterdam dashboard.
* Shared Prisma client helper.
* API Route Handlers:
  * `GET /api/health`
  * `GET /api/cities`
  * `GET /api/dashboard?city=amsterdam`
* Root homepage that fetches `/api/dashboard?city=amsterdam` and renders basic dashboard cards.
* `.env.example` and README setup instructions for local development, migration, seed, and validation.

## Non-Goals

The following are intentionally out of scope:

* Separate FastAPI backend.
* Monorepo structure for this milestone.
* Live KNMI, Rijkswaterstaat, or Luchtmeetnet ingestion.
* AI Q&A.
* Account authentication.
* VPS deployment.
* Vercel project creation or managed database creation from code.
* Vercel Cron implementation.

## Acceptance Criteria

* `npm run dev` starts the Next.js app.
* `docker compose -f infra/docker/docker-compose.yml up -d postgres` starts local PostgreSQL.
* `npx prisma migrate dev --name foundation_schema` creates the initial database schema.
* `npx prisma db seed` inserts Amsterdam, Utrecht, Rotterdam, and mock Amsterdam dashboard data.
* `GET /api/health` returns service health JSON.
* `GET /api/cities` returns active supported cities.
* `GET /api/dashboard?city=amsterdam` returns seeded Amsterdam dashboard data including briefing, current weather, cycle comfort, air quality, water signal, source freshness, and summary payload.
* Unsupported city slugs return a clear 404 from `/api/dashboard`.
* The homepage loads and displays Amsterdam data, briefing, cycle score, air quality, and water signal.
* Runtime secrets are not committed; `DATABASE_URL` remains server-only and only `NEXT_PUBLIC_*` values are exposed to the browser.

## Constraints

* Use a single Next.js App Router app at the repository root.
* Use PostgreSQL and Prisma.
* Use Route Handlers under `app/api`.
* Use `DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dutch_weather"` for local development.
* Use the provider's pooled connection string for Vercel Preview and Production deployments.
* If the provider supplies a separate direct connection string for migrations, keep it available outside the browser bundle for `prisma migrate deploy` and other CLI-only tasks.
* Keep dashboard data mocked and clearly seed-driven.
* Do not implement live ingestion, AI Q&A, account auth, or VPS-specific deployment.
* Use production migration command `prisma migrate deploy` for deployment docs, not `migrate dev`.
* Keep old FastAPI/monorepo assumptions out of the active runtime path for this milestone.

## Test Expectations

Automated checks:

* TypeScript typecheck passes.
* ESLint passes.
* Unit tests cover dashboard response shaping for an Amsterdam snapshot and unsupported city behavior where practical.
* Prisma schema validates.
* Docker Compose config validates when Docker is available.
* Next.js production build passes.

Manual checks:

* `http://localhost:3000` renders seeded Amsterdam dashboard data.
* `http://localhost:3000/api/health` returns status `ok`.
* `http://localhost:3000/api/cities` returns Amsterdam, Utrecht, and Rotterdam after seeding.
* `http://localhost:3000/api/dashboard?city=amsterdam` returns seeded dashboard JSON.

## Open Questions

* None.
