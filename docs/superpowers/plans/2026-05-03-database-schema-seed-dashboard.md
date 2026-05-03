# Database Schema & Seed Dashboard Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the first persisted dashboard foundation so the backend can return seeded city, dashboard, and source freshness data without any live external ingestion.

**Architecture:** Extend the existing FastAPI scaffold with a small SQLAlchemy/Alembic data layer, seed deterministic mock snapshot records into PostgreSQL-compatible tables, and expose read-only API routes that serialize seeded dashboard state through dedicated response schemas. Keep the database models, API schemas, and seeding logic separate so later ingestion and scoring specs can replace the mock data path without rewriting the API contract.

**Tech Stack:** Python 3.11, FastAPI, SQLAlchemy 2.x, Alembic, psycopg, Pydantic, pytest, PostgreSQL, JSON fixtures.

---

### Task 1: Database Foundation

**Files:**
- Modify: `apps/api/pyproject.toml`
- Create: `apps/api/alembic.ini`
- Create: `apps/api/alembic/env.py`
- Create: `apps/api/alembic/script.py.mako`
- Create: `apps/api/alembic/versions/20260503_0001_create_foundation_tables.py`
- Create: `apps/api/app/db/base.py`
- Create: `apps/api/app/db/models.py`
- Create: `apps/api/app/db/session.py`
- Test: `apps/api/app/tests/test_migrations.py`

- [ ] **Step 1: Write the failing migration test**
- [ ] **Step 2: Run the migration test to verify it fails before the database layer exists**
- [ ] **Step 3: Add SQLAlchemy metadata, session helpers, and Alembic configuration**
- [ ] **Step 4: Add the first Alembic revision for the foundation tables**
- [ ] **Step 5: Re-run the migration test and related checks until they pass**

### Task 2: Seed Data and Snapshot Services

**Files:**
- Create: `apps/api/app/services/dashboard_seed.py`
- Create: `apps/api/app/jobs/seed_dev.py`
- Test: `apps/api/app/tests/test_seed_dev.py`

- [ ] **Step 1: Write the failing seed test for city creation and repeatable seeding**
- [ ] **Step 2: Run the seed test to verify it fails before the seed job exists**
- [ ] **Step 3: Implement the minimal seed service and CLI entrypoint**
- [ ] **Step 4: Re-run the seed test and make it pass**

### Task 3: Public Dashboard API

**Files:**
- Create: `apps/api/app/api/v1/routes_dashboard.py`
- Create: `apps/api/app/schemas/dashboard.py`
- Modify: `apps/api/app/main.py`
- Test: `apps/api/app/tests/test_dashboard_routes.py`

- [ ] **Step 1: Write failing route tests for `/api/v1/cities`, `/api/v1/dashboard`, and `/api/v1/source-status`**
- [ ] **Step 2: Run the route tests to verify they fail before the routes exist**
- [ ] **Step 3: Implement the minimal read-only query layer and response schemas**
- [ ] **Step 4: Re-run the route tests and make them pass**

### Task 4: Shared Fixture and Docs

**Files:**
- Create: `packages/shared/fixtures/dashboard-amsterdam.json`
- Modify: `README.md`
- Modify: `docs/commands.md`
- Modify: `docs/database.md`
- Test: `apps/api/app/tests/test_dashboard_fixture.py`

- [ ] **Step 1: Write the failing fixture validation test**
- [ ] **Step 2: Run the fixture test to verify it fails before the shared fixture exists**
- [ ] **Step 3: Add the shared Amsterdam fixture and align docs with the implemented database flow**
- [ ] **Step 4: Re-run the fixture test and the targeted validation commands until they pass**
