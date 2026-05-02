# Insights

Record reusable lessons from completed sessions.

## 2026-05-02 - Harness Bootstrap

- What worked: the onboarding bootstrap and product plan were enough to create project-specific harness docs before implementation started.
- What failed: hidden `.codex` and `.agents` directory creation required escalated filesystem permissions in this workspace.
- Useful commands: `rg --files`, `git status --short --branch`, `git switch -c harness-bootstrap`.
- Scripts created: none.
- Workflow improvement: keep bootstrap instructions and product plan together so harness docs can avoid generic placeholders.
- Skill worth adding or updating: copy supplied onboarding skill bodies into `.codex/skills/` only after the user explicitly approves installing those skills.
- Validation note: `git diff --check` was sufficient for the docs-only bootstrap; `ruff` and `pytest` were unavailable, and no package manifest existed for `npm` commands.
