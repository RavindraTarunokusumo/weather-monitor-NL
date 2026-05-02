# Project Scaffold & Local Development Spec

Status: Accepted
Spec path: `docs/specs/project-scaffold-local-dev.md`
Accepted by: User
Accepted date: 2026-05-02

## Goal

Create the foundational monorepo, local development environment, and baseline project structure for Dutch Weather Intelligence.

This spec enables an engineer or agent to clone the repository, install dependencies, start the frontend, start the backend, run a local database, and verify that the system is alive before any real data ingestion or AI behavior is implemented.

## Scope

This spec includes:

* Monorepo structure
* Frontend app scaffold
* Backend app scaffold
* Root Python project configuration
* Pre-commit and linter configuration
* Root ignore rules for local development artifacts
* Local PostgreSQL setup
* Docker Compose setup
* Root environment template
* Basic backend health endpoint
* README setup instructions
* Local development commands
* Initial documentation folder structure

Required repository structure:

```text
dutch-weather-intelligence/
  apps/
    web/
    api/
  packages/
    shared/
  docs/
    specs/
  infra/
    docker/
    scripts/
  .env.example
  README.md
  AGENTS.md
```

Frontend foundation:

```text
apps/web/
  app/
  components/
  lib/
  styles/
  public/
  package.json
  next.config.ts
  tailwind.config.ts
  tsconfig.json
```

Backend foundation:

```text
apps/api/
  app/
    main.py
    api/
      v1/
        routes_health.py
    core/
      config.py
      logging.py
    db/
    schemas/
    services/
    ingestion/
    jobs/
    tests/
  pyproject.toml
```

Local infrastructure:

```text
infra/docker/docker-compose.yml
infra/docker/Dockerfile.api
infra/scripts/dev.sh
infra/scripts/migrate.sh
infra/scripts/seed.sh
```

Baseline API:

```http
GET /health
```

Expected health response:

```json
{
  "status": "ok",
  "service": "dutch-weather-api",
  "version": "0.1.0"
}
```

## Non-Goals

The following are intentionally out of scope:

* Live KNMI, Rijkswaterstaat, or Luchtmeetnet ingestion
* AI briefing generation
* AI Q&A
* Full account authentication
* Billing
* Production deployment automation
* Real dashboard data
* Weather scoring logic
* User preferences
* Saved locations

## Acceptance Criteria

* Repository uses the agreed monorepo structure.
* Root Python tooling is configured with `pyproject.toml`, `requirements.txt`, and `uv.lock`.
* Pre-commit and linting rules are defined in repository-managed config files.
* `.gitignore` excludes local environment, cache, build, and lockfile artifacts that should not be committed.
* `apps/web` starts locally as a Next.js app.
* `apps/api` starts locally as a FastAPI app.
* Local PostgreSQL starts through Docker Compose.
* `.env.example` documents required local and future production variables.
* `GET /health` returns a valid JSON health response.
* README contains local setup steps for frontend, backend, database, migrations, and seed command placeholders.
* Documentation folder `docs/specs/` exists and contains this spec.
* No real secrets are committed.
* Frontend does not call external weather APIs directly.
* Backend does not call external data or LLM providers in this foundation phase.

## Constraints

* Use Next.js with TypeScript for the frontend.
* Use FastAPI with Python 3.11+ for the backend.
* Use PostgreSQL as the database target.
* Local development should work from WSL/Linux-like environments.
* Do not require a VPS for local development.
* Do not hardcode local machine paths.
* Do not commit `.env.local`, `.env.production`, or real secrets.
* Keep frontend and backend separate.
* Backend must be the future source of truth for data normalization, scoring, AI Q&A, and quota enforcement.
* The frontend must consume backend API contracts rather than external weather APIs.

## Implementation Notes

Root configuration files to add first:

* `.gitignore`
* `.pre-commit-config.yaml`
* `pyproject.toml`
* `requirements.txt`
* `uv.lock`

Recommended commands:

```bash
# frontend
cd apps/web
npm install
npm run dev

# backend
cd apps/api
uv sync
uv run fastapi dev app/main.py

# database
docker compose -f infra/docker/docker-compose.yml up -d postgres
```

Suggested `.env.example` fields:

```bash
APP_ENV=development
APP_NAME=dutch-weather-intelligence
WEB_BASE_URL=http://localhost:3000
API_BASE_URL=http://localhost:8000
DATABASE_URL=postgresql+psycopg://postgres:postgres@localhost:5432/dutch_weather
CORS_ALLOWED_ORIGINS=http://localhost:3000
ENABLE_MOCK_DATA=true
ENABLE_AI_QNA=false
LOG_LEVEL=DEBUG
```

Recommended backend config pattern:

```python
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    app_env: str = "development"
    web_base_url: str = "http://localhost:3000"
    api_base_url: str = "http://localhost:8000"
    database_url: str
    cors_allowed_origins: str = "http://localhost:3000"
    enable_mock_data: bool = True
    enable_ai_qna: bool = False
    log_level: str = "INFO"

    class Config:
        env_file = ".env"
```

Recommended first README sections:

```text
Project overview
Prerequisites
Environment variables
Start local database
Start backend
Start frontend
Run tests
Troubleshooting
```

## Test Expectations

Automated checks:

* Backend health route test passes.
* Backend app imports successfully.
* Frontend TypeScript check passes.
* Frontend lint passes if linting is configured.
* Docker Compose config is valid.

Manual checks:

* Visiting `http://localhost:3000` loads the frontend app.
* Visiting `http://localhost:8000/health` returns status `ok`.
* PostgreSQL container starts without errors.
* README setup instructions can be followed from a fresh clone.

Not applicable:

* Live data ingestion tests.
* AI tests.
* Auth callback tests.
* Billing tests.

## Open Questions

* None.
