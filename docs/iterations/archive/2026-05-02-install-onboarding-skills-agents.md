# Install Onboarding Skills and Agents - 2026-05-02

Completed session archived from `TODO.md`.

Spec: N/A (completed before spec-driven workflow).

- [x] Copy supplied skill packages into `.codex/skills/`. Commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`
- [x] Copy supplied agent configs into `.agents/`. Commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`
- [x] Update harness docs with installed locations. Commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`
- [x] Validate and commit the installed files. Commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`

Validation:

- `git diff --check` passed.
- `ruff` was not available.
- `pytest` was not available.
- No `package.json`, `pyproject.toml`, `requirements.txt`, or `pytest.ini` exists yet.

Installed locations:

- Skills: `.codex/skills/`
- Agent configs: `.agents/*.toml`

Notes:

- Imported files were copied from `Onboarding/` without editing their bodies.
- Some imported content still references the source project and needs a later project-specific cleanup pass before operational use.
