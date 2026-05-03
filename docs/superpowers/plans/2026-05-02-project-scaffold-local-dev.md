# Project Scaffold & Local Development Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the monorepo scaffold, frontend app shell, backend app shell, and local development tooling required by `docs/specs/project-scaffold-local-dev.md`.

**Architecture:** Keep the repo-level `uv` project as the shared Python tooling baseline, add a separate FastAPI runtime under `apps/api`, add a separate Next.js app under `apps/web`, and use `infra/docker` plus `infra/scripts` for local PostgreSQL and bootstrap helpers. The shared `packages/shared` area stays intentionally minimal so later specs can add cross-cutting code without reorganizing the tree.

**Tech Stack:** Python 3.11, FastAPI, Pydantic Settings, psycopg, SQLAlchemy, uvicorn, pytest, Next.js, TypeScript, npm, Docker Compose, bash.

---

### Task 1: Frontend Scaffold

**Files:**
- Create: `apps/web/package.json`
- Create: `apps/web/next.config.ts`
- Create: `apps/web/tsconfig.json`
- Create: `apps/web/next-env.d.ts`
- Create: `apps/web/app/layout.tsx`
- Create: `apps/web/app/page.tsx`
- Create: `apps/web/app/globals.css`
- Create: `apps/web/tailwind.config.ts`
- Create: `apps/web/components/.gitkeep`
- Create: `apps/web/lib/.gitkeep`
- Create: `apps/web/styles/.gitkeep`
- Create: `apps/web/public/.gitkeep`

- [ ] **Step 1: Create the Next.js app shell**

Add the minimal app-router layout, home page, and global stylesheet so `npm run dev` serves a visible local landing page.

- [ ] **Step 2: Wire lint and typecheck commands**

Make `npm run lint` and `npm test` validate the scaffold without introducing a frontend test framework yet.

- [ ] **Step 3: Validate locally**

Run:

```bash
cd apps/web
npm install
npm run lint
npm test
```

- [ ] **Step 4: Commit**

Commit only the frontend scaffold files and lockfile changes.

### Task 2: Backend Scaffold

**Files:**
- Create: `apps/api/pyproject.toml`
- Create: `apps/api/app/__init__.py`
- Create: `apps/api/app/main.py`
- Create: `apps/api/app/api/__init__.py`
- Create: `apps/api/app/api/v1/__init__.py`
- Create: `apps/api/app/api/v1/routes_health.py`
- Create: `apps/api/app/core/__init__.py`
- Create: `apps/api/app/core/config.py`
- Create: `apps/api/app/core/logging.py`
- Create: `apps/api/app/db/__init__.py`
- Create: `apps/api/app/schemas/__init__.py`
- Create: `apps/api/app/schemas/health.py`
- Create: `apps/api/app/services/__init__.py`
- Create: `apps/api/app/ingestion/__init__.py`
- Create: `apps/api/app/jobs/__init__.py`
- Create: `apps/api/app/tests/test_health.py`

- [ ] **Step 1: Create the FastAPI runtime**

Add the app factory, settings, logging bootstrap, and the `GET /health` route that returns the exact accepted payload.

- [ ] **Step 2: Add the health test**

Assert the health route returns:

```json
{
  "status": "ok",
  "service": "dutch-weather-api",
  "version": "0.1.0"
}
```

- [ ] **Step 3: Validate locally**

Run:

```bash
cd apps/api
uv sync --group dev
uv run pytest
uv run python -c "from app.main import app; print(app.title)"
```

- [ ] **Step 4: Commit**

Commit the API scaffold and health test together.

### Task 3: Local Infrastructure

**Files:**
- Create: `infra/docker/docker-compose.yml`
- Create: `infra/docker/Dockerfile.api`
- Create: `infra/scripts/dev.sh`
- Create: `infra/scripts/migrate.sh`
- Create: `infra/scripts/seed.sh`

- [ ] **Step 1: Add PostgreSQL compose support**

Define a local Postgres service that matches the `.env.example` database settings and can be started independently.

- [ ] **Step 2: Add bootstrap scripts**

Make the shell helpers safe to run from WSL/Linux-like environments and keep the migration/seed commands as explicit placeholders for later specs.

- [ ] **Step 3: Validate locally**

Run:

```bash
docker compose -f infra/docker/docker-compose.yml config
bash -n infra/scripts/dev.sh
bash -n infra/scripts/migrate.sh
bash -n infra/scripts/seed.sh
```

- [ ] **Step 4: Commit**

Commit the Docker and shell scaffolding separately from the app code.

### Task 4: Docs and Environment Template

**Files:**
- Create: `.env.example`
- Modify: `README.md`
- Modify: `docs/commands.md`
- Modify: `docs/architecture.md` if needed to remove outdated "not started yet" language
- Create: `packages/shared/.gitkeep`

- [ ] **Step 1: Document local setup**

Add clear setup steps for prerequisites, environment variables, database startup, backend startup, frontend startup, and placeholder migration/seed commands.

- [ ] **Step 2: Keep the docs truthful**

Make sure the docs describe the new scaffold paths and do not claim implementation has not started after the scaffold exists.

- [ ] **Step 3: Validate repo-level checks**

Run:

```bash
uv lock --check
uv sync --locked --group dev --no-install-project
uv run --group dev pre-commit run --all-files
uv run python -c "import fastapi, pydantic_settings, psycopg, sqlalchemy, uvicorn"
```

- [ ] **Step 4: Commit**

Commit docs and environment template updates last so the README matches the implemented scaffold.
