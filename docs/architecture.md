# System Architecture

Dutch Weather Intelligence is currently a single full-stack Next.js App Router application deployed in a Vercel-compatible shape.

## Entry Points

- Frontend: `app/page.tsx`
- Dashboard UI components: `app/dashboard/`
- API routes: `app/api/*/route.ts`
- Database client: `lib/db.ts`
- Dashboard response shaping: `lib/dashboard.ts`
- Persistence schema and seed: `prisma/`
- Local infrastructure: `infra/docker/docker-compose.yml`

## Runtime Flow

1. Local PostgreSQL stores supported cities, source snapshots, dashboard snapshots, and mock briefings.
2. Prisma exposes a type-safe database client for server-side Next.js code.
3. Route Handlers serve health, city catalog, and dashboard JSON from the database.
4. The homepage fetches `/api/dashboard?city=amsterdam` server-side and hands normalized data to the interactive dashboard shell.
5. The dashboard shell fetches `/api/cities` and same-app `/api/dashboard?city=<slug>` for city switching.
6. Source freshness travels with weather, air-quality, and water snapshot data.

## Frontend Boundary

`app/page.tsx` is the server entry point. It performs the initial same-app dashboard fetch and renders `DashboardShell`.

`app/dashboard/` contains the public dashboard UI:

- `types.ts`: normalized dashboard and city response types.
- `format.ts`: display formatting and fallback labels.
- `qa.ts`: local source-grounded mock Q&A helper.
- `components/`: top navigation, briefing hero, metric strip, outlook panel, Q&A panel, detail panels, and source freshness footer.
- `__tests__/`: jsdom interaction tests for city switching, chart tabs, Q&A, and reload failures.

## Current API Surface

```http
GET /api/health
GET /api/cities
GET /api/dashboard?city=<slug>
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
- Amsterdam, Utrecht, and Rotterdam have deterministic seeded dashboard snapshots for the public UI.
