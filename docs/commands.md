# Commands Reference

## Setup

Root Python tooling:

```bash
uv lock --check
uv sync --locked --group dev --no-install-project
```

Backend:

```bash
cd apps/api
uv sync
uv run alembic upgrade head
uv run python -m app.jobs.seed_dev
```

Frontend:

```bash
cd apps/web
npm install
```

## Development Server

Local PostgreSQL:

```bash
bash infra/scripts/validate-docker.sh
docker compose -f infra/docker/docker-compose.yml up -d postgres
```

Backend:

```bash
cd apps/api
uv run fastapi dev app/main.py
```

Frontend:

```bash
cd apps/web
npm run dev
```

## Testing

Backend:

```bash
cd apps/api
uv sync --group dev
uv run pytest
```

Frontend:

```bash
cd apps/web
npm run lint
npm test
```

Repo-level validation:

```bash
uv run --group dev pre-commit run --all-files
uv run python -c "import fastapi, pydantic_settings, psycopg, sqlalchemy, uvicorn"
```

## Database

Apply migrations and seed mock dashboard data:

```bash
cd apps/api
uv run alembic upgrade head
uv run python -m app.jobs.seed_dev
```

Compose bootstrap helpers for local PostgreSQL:

```bash
bash infra/scripts/validate-docker.sh
bash infra/scripts/dev.sh
bash infra/scripts/migrate.sh
bash infra/scripts/seed.sh
```

## Environment Variables

```bash
APP_ENV=development
APP_NAME=dutch-weather-intelligence
WEB_BASE_URL=http://localhost:3000
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
API_BASE_URL=http://localhost:8000
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/dutch_weather
CORS_ALLOWED_ORIGINS=http://localhost:3000
ENABLE_MOCK_DATA=true
ENABLE_AI_QNA=false
LOG_LEVEL=DEBUG
```

Never commit real secrets.

## Git Notes

Add a structured note for the latest commit:

```bash
git log -1 --format="%H"
git notes add -m "Task: <task name>
Summary: <brief what changed and why>
Spec: <docs/specs/<feature-slug>.md, or N/A>
Docs: <docs paths updated, comma-separated, or N/A>
TODO: <TODO.md section/item reference>
Validation: <checks run>" <commit_hash>
```
