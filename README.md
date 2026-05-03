# weather-monitor-NL

Dutch Weather Intelligence is a local-first scaffold for Dutch weather, water, and air-quality intelligence.

Start with [AGENTS.md](AGENTS.md), [docs/index.md](docs/index.md), and the accepted spec in [docs/specs/project-scaffold-local-dev.md](docs/specs/project-scaffold-local-dev.md).

## Project Overview

- `apps/web/`: Next.js frontend shell
- `apps/api/`: FastAPI backend shell
- `infra/docker/`: local PostgreSQL Compose configuration and API container image
- `infra/scripts/`: bootstrap helpers for local development
- `packages/shared/`: reserved space for future shared utilities
- `docs/specs/`: accepted per-feature specs that drive implementation

## Prerequisites

- Python 3.11 or newer
- Node.js 20 or newer
- `uv`
- Docker and Docker Compose

## Environment Variables

Copy `.env.example` to `.env` when you need local overrides.

Important values:

- `DATABASE_URL`
- `CORS_ALLOWED_ORIGINS`
- `APP_ENV`
- `ENABLE_MOCK_DATA`
- `ENABLE_AI_QNA`
- `LOG_LEVEL`

## Start Local Database

Validate the Compose file first:

```bash
bash infra/scripts/validate-docker.sh
```

```bash
docker compose -f infra/docker/docker-compose.yml up -d postgres
```

Or use the helper:

```bash
bash infra/scripts/dev.sh
```

## Start Backend

```bash
cd apps/api
uv sync
uv run alembic upgrade head
uv run python -m app.jobs.seed_dev
uv run fastapi dev app/main.py
```

For backend tests:

```bash
cd apps/api
uv sync --group dev
uv run pytest
```

Seeded backend routes after migration and seeding:

- `GET /api/v1/cities`
- `GET /api/v1/dashboard?city=amsterdam`
- `GET /api/v1/source-status`

## Start Frontend

```bash
cd apps/web
npm install
npm run dev
```

For frontend validation:

```bash
cd apps/web
npm run lint
npm test
```

## Run Tests

From the repo root:

```bash
uv lock --check
uv sync --locked --group dev --no-install-project
uv run --group dev pre-commit run --all-files
uv run python -c "import fastapi, pydantic_settings, psycopg, sqlalchemy, uvicorn"
```

Then run the app-level checks:

```bash
cd apps/api
uv run pytest

cd ../web
npm run lint
npm test
```

## Troubleshooting

- If `fastapi dev` complains about the CLI, make sure `apps/api` dependencies were synced from `apps/api/pyproject.toml`.
- If supported dashboard cities return 404, rerun `uv run alembic upgrade head` and `uv run python -m app.jobs.seed_dev` in `apps/api`.
- If the frontend typecheck fails, rerun `npm install` in `apps/web/`.
- If PostgreSQL fails to start, run `bash infra/scripts/validate-docker.sh`, check that Docker is running, and confirm port `5432` is free.
