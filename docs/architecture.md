# System Architecture

Dutch Weather Intelligence is currently a single full-stack Next.js App Router application deployed in a Vercel-compatible shape.

## Entry Points

- Frontend: `app/page.tsx`
- API routes: `app/api/*/route.ts`
- Database client: `lib/db.ts`
- Dashboard response shaping: `lib/dashboard.ts`
- Persistence schema and seed: `prisma/`
- Local infrastructure: `infra/docker/docker-compose.yml`

## Runtime Flow

1. Local PostgreSQL stores supported cities, source snapshots, dashboard snapshots, and mock briefings.
2. Prisma exposes a type-safe database client for server-side Next.js code.
3. Route Handlers serve health, city catalog, and dashboard JSON from the database.
4. The homepage fetches `/api/dashboard?city=amsterdam` and renders the seeded Amsterdam dashboard.
5. Source freshness travels with weather, air-quality, and water snapshot data.

## Current API Surface

```http
GET /api/health
GET /api/cities
GET /api/dashboard?city=amsterdam
```

## Planned Background Jobs

Future ingestion should use Vercel Cron calling protected Route Handlers under `app/api/jobs/*`.

No live ingestion job exists in this milestone.

## External Integrations

No external weather, water, air-quality, LLM, auth, billing, or VPS integrations are implemented in this foundation phase.

## Invariants

- The product is an interpretation layer, not an official warning system.
- Seeded data must be distinguishable from live source data.
- AI may explain source-backed facts in later milestones but must not invent forecasts.
- Amsterdam is the first dashboard city; Utrecht and Rotterdam exist as seeded supported cities.
