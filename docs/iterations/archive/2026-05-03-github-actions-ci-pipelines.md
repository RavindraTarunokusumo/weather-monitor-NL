# GitHub Actions CI Pipelines - 2026-05-03

Completed session archived from `TODO.md`.

Spec: `docs/specs/project-scaffold-vercel-postgres-foundation.md`

- [x] Replace the stale Python-oriented CI workflow with Node/Prisma quality checks. Commit: `edb5082`
- [x] Add a PostgreSQL-backed smoke workflow that runs the seeded build and API checks. Commit: `728c11d`

Validation:

- `pre-commit run --all-files` passed.

Notes:

- The workflow update aligns the repository automation with the current root Next.js + Prisma stack.
- The CI path now keeps a fast pre-commit/lint/typecheck/test/Prisma gate separate from the PostgreSQL-backed bootstrap smoke test.
- `docs/insights.md`, `docs/changelog.md`, and `docs/specs/project-scaffold-vercel-postgres-foundation.md` were updated during session closeout to document the pipeline behavior.
