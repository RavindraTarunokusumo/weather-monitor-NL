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

## 2026-05-02 - Install Onboarding Skills and Agents

- What worked: supplied skill packages mapped directly into `.codex/skills/`, and agent TOML configs mapped cleanly into `.agents/`.
- What failed: hidden harness directories required escalated filesystem permissions for copy operations.
- Useful commands: `find Onboarding -maxdepth 3 -type f`, `cp -R Onboarding/Skills/. .codex/skills/`, `cp Onboarding/Agents/*.toml .agents/`.
- Scripts created: none.
- Workflow improvement: after importing supplied skills, scan for source-project references before using the files operationally.
- Skill worth adding or updating: project-specific cleanup pass for imported `test-plan-writer`, `trace-inspect`, `security-review`, and `simplify` content.

## 2026-05-02 - Add Vercel Plugin Scaffold

- What worked: the bundled `plugin-creator` script created the plugin manifest and stub `.mcp.json` and `.app.json` files correctly.
- What failed: the script partially completed before hitting sandbox restrictions when creating `.agents/plugins/marketplace.json`, so the marketplace file had to be added afterward.
- Useful commands: `python3 /root/.codex/skills/.system/plugin-creator/scripts/create_basic_plugin.py --help`, `find plugins -maxdepth 4 -type f`.
- Scripts created: none.
- Workflow improvement: when scaffolding repo-local plugins in this workspace, expect hidden-path writes under `.agents/` to require escalation.
- Skill worth adding or updating: install `plugin-creator` into the repo-local skill roots if plugin scaffolding will be a recurring workflow here.
