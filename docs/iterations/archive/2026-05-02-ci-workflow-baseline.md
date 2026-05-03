# CI Workflow Baseline - 2026-05-02

Completed session archived from `TODO.md`.

Spec: `docs/specs/project-scaffold-local-dev.md`

- [x] Add GitHub Actions workflow for `uv lock --check`, pre-commit hooks, and dependency import smoke tests. Commit: `099317e`

Validation:

- `uv lock --check` passed.
- `uv run --group dev pre-commit run --all-files` passed.

Notes:

- The workflow intentionally stays limited to root-scaffold guarantees until backend, frontend, and infrastructure entrypoints exist.
- Path filters include future `apps/`, `infra/`, and `packages/` areas so the same workflow can grow with the repo.
