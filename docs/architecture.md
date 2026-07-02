# System Architecture

Dutch Weather Intelligence is currently a single full-stack Next.js App Router application deployed in a Vercel-compatible shape.

## Entry Points

- Homepage (`/`): `app/page.tsx` — reads `Dutch Weather Dashboard.html` from disk server-side and renders it inside an `<iframe srcDoc={html}>`. That HTML file is a self-contained React app (in-browser JSX/Babel) that fetches `/api/cities` and `/api/dashboard?city=<slug>` client-side from within the iframe. It is the actual live homepage implementation, not a design reference or legacy fixture — this is also true on production.
- `app/dashboard/`: a fully built, unit-tested Next.js/React port of the dashboard UI (`DashboardShell` and its component tree) that mirrors `Dutch Weather Dashboard.html`'s design. **It is not mounted by any route** — there is no `app/dashboard/page.tsx` — so it is not part of the live request path. Kept for its tests and as a possible future migration target off the iframe.
- Live dashboard components from the earlier public shell: `app/components/` — also not mounted by any route.
- Forecast page: `app/forecast/page.tsx` — a real Next.js App Router page, server-rendered, not iframed.
- API routes: `app/api/*/route.ts`
- Database client: `lib/db.ts`
- Dashboard response shaping: `lib/dashboard.ts`
- Forecast API response shaping: `lib/forecast.ts`
- Shared dashboard types: `lib/types/dashboard.ts`
- Client-side fetch helpers: `lib/api/dashboard-client.ts`
- Display formatting utilities: `lib/utils/format.ts`
- Persistence schema and seed: `prisma/`
- Supported-city catalog: `lib/supported-cities.ts`
- Local infrastructure: `infra/docker/docker-compose.yml`

## Runtime Flow

1. Local PostgreSQL stores supported cities, source snapshots, dashboard snapshots, and mock briefings.
2. Prisma exposes a type-safe database client for server-side Next.js code.
3. Route Handlers serve health, city catalog, dashboard JSON, and forecast JSON from the database.
4. The homepage (`app/page.tsx`) serves `Dutch Weather Dashboard.html` inside an iframe; that HTML fetches `/api/cities` and `/api/dashboard?city=<slug>` client-side from within the iframe for initial load and city switching.
5. The Forecast page reads normalized forecast analytics from persisted dashboard snapshots through `/api/forecast`; it does not call external forecast or warning providers from the browser.
6. Source freshness travels with weather, air-quality, and water snapshot data.

## Frontend Boundary

`app/page.tsx` is the server entry point for `/`. It reads `Dutch Weather Dashboard.html` from disk and returns it inside an `<iframe srcDoc={...}>`; it does not fetch dashboard data itself and does not render any component from `app/dashboard/` or `app/components/`.

`app/dashboard/` contains an unmounted Next.js/React port of the public dashboard UI, built to match `Dutch Weather Dashboard.html`'s design and covered by its own tests, but not reachable through any route:

- `types.ts`: normalized dashboard and city response types.
- `format.ts`: display formatting and fallback labels.
- `qa.ts`: local source-grounded mock Q&A helper.
- `components/`: top navigation, briefing hero, metric strip, outlook panel, Q&A panel, detail panels, and source freshness footer.
- `__tests__/`: jsdom interaction tests for city switching, chart tabs, Q&A, and reload failures.

The `app/components/` live-dashboard shell from the earlier public shell work is likewise unmounted. If the homepage is ever migrated off the iframe onto one of these React ports, that migration needs its own spec under `docs/specs/` — see the BLOCKED item in `TODO.md`.

## Current API Surface

```http
GET /api/health
GET /api/cities
GET /api/dashboard?city=<slug>
GET /api/forecast?city=<slug>
```

## Planned Background Jobs

Live ingestion can run through protected Route Handlers under `app/api/jobs/*` or local CLI commands.
The routes require `CRON_SECRET` authorization and persist normalized snapshots before dashboard
regeneration links the latest available weather, air-quality, and water data.
The all-in `/api/jobs/refresh-live` route also upserts the accepted 10 active city rows before ingestion,
so production deployments that skip seed can still bootstrap the database-backed city catalog.

`lib/supported-cities.ts` is the canonical city expansion point. It owns supported city rows,
provider source mappings, and deterministic fallback dashboard defaults. Ingestion source config
is derived from this catalog, and dashboard regeneration uses the fallback defaults only when live
forecast enrichment is missing.

## External Integrations

- KNMI EDR API: near-real-time weather observations from the `10-minute-in-situ-meteorological-observations` collection, queried per configured seeded-city station ID.
- Open-Meteo KNMI forecast API: `knmi_seamless` model (Open-Meteo's blended KNMI HARMONIE-based forecast) with automatic fallback to Open-Meteo's default model, used to populate stored hourly/weekly outlook fields without browser-side external calls.
- KNMI Open Data API: the `waarschuwingen_nederland_48h` (v1.0) dataset, official Dutch 48-hour warning files normalized into city-level warning labels. See `docs/specs/knmi-dataset-selection.md` for the full dataset selection rationale.
- Luchtmeetnet API: station pollutant measurements for the 10 configured supported cities.
- Rijkswaterstaat ddapi20 WaterWebservices: WATHTE water-level observations from configured nearby locations.
- No LLM, auth, billing, or VPS integrations are implemented in this foundation phase.

## Invariants

- The product is an interpretation layer, not an official warning system.
- Seeded data must be distinguishable from live source data.
- AI may explain source-backed facts in later milestones but must not invent forecasts.
- The 10 supported cities have deterministic seeded dashboard snapshots for the public UI.
- Configured supported cities must have deterministic fallback outlook/current metadata so live observation-only refreshes do not publish blank forecast panels.
- Forecast outlooks, warning labels, air trends, and water trend/weekly-level displays are derived during ingestion/regeneration and persisted in stored snapshots before the public API reads them.
