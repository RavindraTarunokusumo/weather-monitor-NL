# Documentation Index

Use this file as the second layer after `AGENTS.md`. It points to deeper docs without repeating them.

## Core Docs

- [agent-harness.md](agent-harness.md): agent-facing documentation structure and harness rules
- [architecture.md](architecture.md): system design, module boundaries, entry points, request/data flow
- [database.md](database.md): schema, persistence model, migration rules
- [patterns.md](patterns.md): durable coding and state-management rules
- [testing.md](testing.md): test execution, fixtures, validation workflow
- [commands.md](commands.md): common local commands
- [specs/README.md](specs/README.md): spec-driven development workflow and acceptance rules
- [changelog.md](changelog.md): notable behavior and architecture changes
- [insights.md](insights.md): session lessons and reusable workflow observations

## Repo Areas

- `app/`: Next.js App Router pages and API Route Handlers
- `lib/`: server-side helpers and API response shaping
- `prisma/`: Prisma schema, migrations, and seed data
- `tests/`: Vitest test suite
- `public/`: static frontend assets
- `Onboarding/`: initial product plan, harness bootstrap, and supplied agent/skill material
- `.codex/skills/`: installed repo-local skill packages
- `.agents/`: installed repo-local agent configs and compatibility skill root
- `plugins/`: repo-local Codex plugin scaffolds
- `docs/specs/`: accepted per-feature implementation specs and templates
- `TODO.md`: active work only, derived from the active spec
- `docs/iterations/archive/`: completed TODO archive, including related spec paths

## Fast Path By Task

- Changing app behavior: read `architecture.md`, then relevant module docs
- Changing persistence: read `database.md` and `patterns.md`
- Changing tests: read `testing.md`
- Preparing for review: read `AGENTS.md`, `testing.md`, and PR template
- Adding agent workflow: read `agent-harness.md`
- Implementing a feature: start from the accepted spec under `docs/specs/`

## Core Invariants

- AI briefings and Q&A must use normalized dashboard JSON, not raw source files.
- The system must not invent weather measurements, KNMI warnings, station data, pollutant values, or flood-risk claims.
- Deterministic application code calculates scores and categories; the LLM explains them.
- Source freshness must be visible wherever dashboard data is shown.
- External data sources must be mocked in tests.
- Runtime secrets and API keys must never be logged or committed.
