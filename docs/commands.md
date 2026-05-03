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
```

Never commit real secrets.
