# Project Scaffold & Local Development - 2026-05-03

Completed session archived from `TODO.md`.

Spec: `docs/specs/project-scaffold-local-dev.md`

- [x] Scaffold `apps/web` as a Next.js TypeScript app with local dev, lint, and typecheck commands.
- [x] Scaffold `apps/api` as a FastAPI app with settings, logging, and `GET /health`.
- [x] Add local infrastructure under `infra/docker/` and `infra/scripts/` for PostgreSQL and bootstrap helpers.
- [x] Update `README.md`, `.env.example`, and supporting docs for local setup and validation.

Validation:

- `uv run pytest` passed in `apps/api`.
- `npm run lint` passed in `apps/web`.
- `npm test` passed in `apps/web`.
- `docker compose -f infra/docker/docker-compose.yml config` could not be run in this environment because `docker` was not installed on the PATH.

Notes:

- The scaffold session was archived after the user confirmed the spec was complete.
- The Compose validation gap should be rechecked on a machine with Docker available.
