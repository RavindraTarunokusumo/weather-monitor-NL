# System Architecture

Dutch Weather Intelligence is currently a single full-stack Next.js App Router application deployed in a Vercel-compatible shape.

## Entry Points

- Frontend (SSR shell): `app/page.tsx`
- Client dashboard: `app/components/live-dashboard.tsx`
- Display components: `app/components/`
- API routes: `app/api/*/route.ts`
- Database client: `lib/db.ts`
- Dashboard response shaping: `lib/dashboard.ts`
- Shared dashboard types: `lib/types/dashboard.ts`
- Client-side fetch helpers: `lib/api/dashboard-client.ts`
- Display formatting utilities: `lib/utils/format.ts`
- Persistence schema and seed: `prisma/`
- Local infrastructure: `infra/docker/docker-compose.yml`

## Runtime Flow

1. Local PostgreSQL stores supported cities, source snapshots, dashboard snapshots, and mock briefings.
2. Prisma exposes a type-safe database client for server-side Next.js code.
3. Route Handlers serve health, city catalog, and dashboard JSON from the database.
4. `app/page.tsx` runs on the server: fetches initial dashboard data and the city list, then renders `LiveDashboard` with that data as props.
5. `LiveDashboard` is a `'use client'` component that owns city-selection state and auto-polls the dashboard API every 30 seconds. It composes all display cards.
6. Pure display components (`briefing-card`, `weather-card`, `cycle-comfort-card`, `air-quality-card`, `water-signal-card`, `source-freshness`) receive typed props and contain no fetch or business logic.
7. Source freshness travels with weather, air-quality, and water snapshot data and is rendered with Dutch locale formatting.

## LiveDashboard Pattern

`LiveDashboard` is the single stateful client component. It:

- Accepts initial data from the SSR parent to avoid a client-side loading flash.
- Exposes a city selector dropdown; changing city triggers a fresh `getDashboard()` call.
- Auto-refreshes every 30 seconds via `setInterval`.
- Provides a manual Refresh button.
- Passes shaped data down to pure display-only card components.

All business logic (score calculation, risk categories) stays server-side. Cards display only what they receive.

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
