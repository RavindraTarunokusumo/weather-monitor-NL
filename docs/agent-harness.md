# Agent Documentation Harness

This repository uses a layered documentation and skill harness for safe agentic development.

## Purpose

Give every agent one clear path to:

- understand repo rules
- understand architecture
- pick the right skill
- execute safely
- validate changes
- keep docs synchronized
- preserve session memory

## Layered Documentation Model

### Layer A - Repo Contract

Files:

- `AGENTS.md`

Responsibilities:

- allowed and forbidden actions
- branch/worktree workflow
- commit/test/lint expectations
- PR expectations
- links to deeper docs

### Layer B - Domain and System Context

Files:

- `docs/architecture.md`
- `docs/database.md`
- `docs/patterns.md`
- `docs/testing.md`
- `docs/commands.md`
- `docs/utils/*.md`

Responsibilities:

- technical truth
- data model
- invariants
- commands
- debugging workflows

### Layer C - Task Skills

Canonical root:

- `.codex/skills/<skill-name>/`

Compatibility root:

- `.agents/skills/<skill-name>/`

Skill package structure:

- `SKILL.md` required only when supplied by the user
- `references/` optional
- `scripts/` optional
- `assets/` optional
- `agents/` optional

Responsibilities:

- task-specific execution steps
- input conventions
- output expectations
- validation rules
- safety boundaries

Installed skills:

- `brainstorming`
- `dispatching-parallel-agents`
- `receiving-code-review`
- `security-review`
- `simplify`
- `subagent-driven-development`
- `test-driven-development`
- `test-plan-writer`
- `trace-inspect`
- `writing-plans`

### Layer C.1 - Subagent Configs

Installed agent configs:

- `.agents/doc-updater.toml`
- `.agents/test-plan-writer.toml`

These configs are repository-local agent definitions. Review imported config bodies before relying on them for project-specific work.

### Layer C.2 - Repo Plugins

Repo-local plugin root:

- `plugins/<plugin-name>/`

Marketplace index:

- `.agents/plugins/marketplace.json`

Installed repo-local plugins:

- `vercel`

### Layer D - Work Tracking and Change History

Files:

- `TODO.md`
- `docs/iterations/active/*.md`
- `docs/iterations/archive/*.md`
- `docs/changelog.md`
- `docs/insights.md`

Responsibilities:

- active work
- completed work
- why changes happened
- session lessons

## Recommended Navigation Order

1. Read `AGENTS.md`.
2. Read `docs/index.md`.
3. Read relevant technical docs.
4. Select the matching skill if available.
5. Implement through `TODO.md`.
6. Validate.
7. Update docs.
8. Prepare PR.
9. Archive completed work.

## Ownership and Source of Truth

- Policy source of truth: `AGENTS.md`
- Work source of truth: `TODO.md`
- Technical source of truth: `docs/`
- Skill source of truth: `.codex/skills/`
- Agent config source of truth: `.agents/*.toml`
- Repo plugin source of truth: `plugins/*/.codex-plugin/plugin.json`
- Repo plugin marketplace source of truth: `.agents/plugins/marketplace.json`

If duplicates exist, update canonical content first, then mirror.

## Update Rules

- If source behavior changes, update relevant docs in the same iteration.
- If workflow changes, update `AGENTS.md`.
- If repeated tasks emerge, create or revise a skill.
- Keep skills focused and composable.
