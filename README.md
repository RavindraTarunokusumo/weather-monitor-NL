# Dutch Weather Intelligence

Dutch Weather Intelligence is a single full-stack Next.js app for a seeded Amsterdam weather, air-quality, and water dashboard.

Start with [AGENTS.md](AGENTS.md), [docs/index.md](docs/index.md), and the active spec in [docs/specs/project-scaffold-vercel-postgres-foundation.md](docs/specs/project-scaffold-vercel-postgres-foundation.md).

## Project Overview

- `app/`: Next.js App Router pages and API Route Handlers.
- `lib/`: server-side helpers, including Prisma and dashboard response shaping.
- `prisma/`: Prisma schema, migrations, and seed data.
- `infra/docker/`: local PostgreSQL Compose configuration.
- `tests/`: focused TypeScript tests for API response behavior.
- `docs/specs/`: accepted per-feature specs that drive implementation.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker and Docker Compose for local PostgreSQL

## Environment Variables

Copy `.env.example` to `.env` for local development.

Important values:

- `DATABASE_URL`: server-only PostgreSQL connection string.
- `NEXT_PUBLIC_APP_NAME`: optional browser-safe display value.
- `ENABLE_AI_QNA`, `ANON_DAILY_QA_LIMIT`, `CRON_SECRET`: reserved for later milestones.

Only variables prefixed with `NEXT_PUBLIC_` are exposed to the browser.

## Start Local Database

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
```

Check the container:

```bash
docker ps
```

## Install Dependencies

```bash
npm install
```

## Migrate and Seed

```bash
npx prisma migrate dev --name foundation_schema
npx prisma db seed
```

Useful database commands:

```bash
npm run db:migrate
npm run db:seed
npm run db:studio
```

Use production migration deploys outside local development:

```bash
npx prisma migrate deploy
```

## Start the App

```bash
npm run dev
```

Open:

- `http://localhost:3000`
- `http://localhost:3000/api/health`
- `http://localhost:3000/api/cities`
- `http://localhost:3000/api/dashboard?city=amsterdam`

## Validation

```bash
npm run lint
npm run typecheck
npm test
npx prisma validate
npm run build
```

## Troubleshooting

- If dashboard data is missing, start PostgreSQL and rerun `npx prisma migrate dev --name foundation_schema` and `npx prisma db seed`.
- If Prisma cannot connect, confirm `DATABASE_URL` points to `postgresql://postgres:postgres@localhost:5432/dutch_weather`.
- If port `5432` is already used, stop the conflicting service or set `POSTGRES_PORT` before starting Compose.
- If Docker is unavailable, API and homepage database checks cannot run locally until PostgreSQL is available.
