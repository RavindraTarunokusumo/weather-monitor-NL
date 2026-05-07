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

Live ingestion is server-side only. Set `KNMI_API_KEY` in `.env.local` before running live weather ingestion. Do not commit real keys.

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
LUCHTMEETNET_API_BASE_URL="https://api.luchtmeetnet.nl"
RIJKSWATERSTAAT_API_BASE_URL="https://ddapi20-waterwebservices.rijkswaterstaat.nl"
```

Never commit real secrets.
