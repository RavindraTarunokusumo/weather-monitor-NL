# System Architecture

Dutch Weather Intelligence is currently a single full-stack Next.js App Router application deployed in a Vercel-compatible shape.

## Entry Points

- Frontend (SSR shell): `app/page.tsx`
- Reference dashboard UI: `app/dashboard/`
- Live dashboard components from the earlier public shell: `app/components/`
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
4. The homepage fetches `/api/dashboard?city=<slug>` server-side and hands normalized data to the interactive dashboard shell.
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

The `app/components/` live-dashboard shell remains available from the public dashboard UI shell work, but the active homepage uses the reference dashboard UI so the image-backed hero, symbol panels, local Q&A, outlook views, and reference-aligned layout stay intact.

## Current API Surface

```http
GET /api/health
GET /api/cities
GET /api/dashboard?city=<slug>
```

## Planned Background Jobs

Live ingestion can run through protected Route Handlers under `app/api/jobs/*` or local CLI commands.
The routes require `CRON_SECRET` authorization and persist normalized snapshots before dashboard
regeneration links the latest available weather, air-quality, and water data.

## External Integrations

- KNMI EDR API: near-real-time weather observations from the configured seeded-city stations.
- Open-Meteo KNMI forecast API: JSON point forecasts used to populate stored hourly/weekly outlook fields without browser-side external calls.
- KNMI Open Data API: official Dutch 48-hour warning files normalized into city-level warning labels.
- Luchtmeetnet API: station pollutant measurements for Amsterdam, Utrecht, and Rotterdam.
- Rijkswaterstaat ddapi20 WaterWebservices: WATHTE water-level observations from configured nearby locations.
- No LLM, auth, billing, or VPS integrations are implemented in this foundation phase.

## Invariants

- The product is an interpretation layer, not an official warning system.
- Seeded data must be distinguishable from live source data.
- AI may explain source-backed facts in later milestones but must not invent forecasts.
- Amsterdam, Utrecht, and Rotterdam have deterministic seeded dashboard snapshots for the public UI.
- Forecast outlooks, warning labels, air trends, and water trend/weekly-level displays are derived during ingestion/regeneration and persisted in stored snapshots before the public API reads them.
