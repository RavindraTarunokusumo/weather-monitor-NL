# Commands Reference

## Setup

```bash
npm install
```

## Development Server

```bash
npm run dev
```

## Local PostgreSQL

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
docker ps
```

## Database

```bash
npx prisma validate
npx prisma migrate dev --name foundation_schema
npx prisma db seed
npx prisma studio
```

Production migration command:

```bash
npx prisma migrate deploy
```

Builds run migrations but skip `prisma db seed` by default so local, preview, or production builds cannot replace newer live dashboard snapshots with seeded mock data. Seed manually only when intentionally resetting sample data.

To explicitly seed after a local build:

```bash
RUN_DB_SEED_AFTER_BUILD=true npm run build
```

## API Checks

```bash
curl http://localhost:3000/api/health
curl http://localhost:3000/api/cities
curl "http://localhost:3000/api/dashboard?city=amsterdam"
curl "http://localhost:3000/api/dashboard?city=utrecht"
curl "http://localhost:3000/api/dashboard?city=rotterdam"
```

## Ingestion And Dashboard Refresh

Mock ingestion remains the default and requires no external credentials:

```bash
npm run ingest:weather -- --city amsterdam
npm run ingest:air-quality -- --city amsterdam
npm run ingest:water -- --city amsterdam
npm run ingest:all
npm run dashboard:regenerate -- --all
```

Live ingestion is server-side only. Set `KNMI_API_KEY` in `.env.local` before running live weather ingestion. Weather ingestion also calls Open-Meteo for point forecasts and KNMI Open Data for official warning files. Do not commit real keys.

```bash
npm run ingest:weather -- --city amsterdam --live
npm run ingest:air-quality -- --city amsterdam --live
npm run ingest:water -- --city amsterdam --live
npm run ingest:all -- --live
npm run dashboard:regenerate -- --all
```

Protected route examples for scheduled jobs:

```bash
curl -X POST "http://localhost:3000/api/jobs/ingest-weather?city=amsterdam&mode=live" -H "Authorization: Bearer $CRON_SECRET"
curl -X POST "http://localhost:3000/api/jobs/ingest-air-quality?all=true&mode=live" -H "Authorization: Bearer $CRON_SECRET"
curl -X POST "http://localhost:3000/api/jobs/ingest-water?all=true&mode=live" -H "Authorization: Bearer $CRON_SECRET"
curl -X POST "http://localhost:3000/api/jobs/regenerate-dashboard-snapshots?all=true" -H "Authorization: Bearer $CRON_SECRET"
```

Production job routes require `CRON_SECRET` authorization even for mock-mode calls. A production refresh that should show live sources needs `CRON_SECRET` and `KNMI_API_KEY` configured in Vercel, then live ingestion and dashboard regeneration must run after deploy.

Production also exposes one all-in refresh route for Vercel Cron and manual post-deploy repair. It always runs live ingestion for all active cities, then regenerates all dashboard snapshots:

```bash
curl -X POST "https://weather-monitor-nl.vercel.app/api/jobs/refresh-live?force=true" -H "Authorization: Bearer $CRON_SECRET"
```

`vercel.json` registers `/api/jobs/refresh-live` as a daily Vercel Cron at `05:00 UTC`. Vercel automatically sends `Authorization: Bearer $CRON_SECRET` to cron invocations when `CRON_SECRET` is configured in the project environment.

Future production checks must verify source identifiers from the dashboard API, not only the rendered footer:

```bash
curl "https://weather-monitor-nl.vercel.app/api/dashboard?city=amsterdam"
curl "https://weather-monitor-nl.vercel.app/api/dashboard?city=utrecht"
curl "https://weather-monitor-nl.vercel.app/api/dashboard?city=rotterdam"
```

Live production dashboards should report `knmi`, `luchtmeetnet`, and `rijkswaterstaat` in `source_freshness`. Any `mock_*` source means the dashboard snapshot is mock-backed and should be repaired with `/api/jobs/refresh-live`.

## Testing and Validation

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

## Environment Variables

```bash
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/dutch_weather"
NEXT_PUBLIC_APP_NAME="Dutch Weather Intelligence"
ENABLE_AI_QNA="false"
ANON_DAILY_QA_LIMIT="3"
CRON_SECRET="replace_me"
KNMI_API_KEY="replace_me"
LIVE_INGESTION_ENABLED="false"
KNMI_API_BASE_URL="https://api.dataplatform.knmi.nl/edr/v1"
KNMI_OPEN_DATA_API_BASE_URL="https://api.dataplatform.knmi.nl/open-data/v1"
OPEN_METEO_API_BASE_URL="https://api.open-meteo.com/v1/forecast"
LUCHTMEETNET_API_BASE_URL="https://api.luchtmeetnet.nl"
RIJKSWATERSTAAT_API_BASE_URL="https://ddapi20-waterwebservices.rijkswaterstaat.nl"
```

Never commit real secrets.
