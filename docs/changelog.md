# Changelog

Record notable behavior, architecture, API, persistence, or workflow changes.

## 2026-05-02 - Adopted Spec-Driven Workflow

Summary:

- What changed: updated the agent workflow so feature implementation is driven by accepted per-feature specs under `docs/specs/`.
- Why: make implementation scope explicit and durable before agents create TODO items, commits, PRs, or archived session records.
- User-visible impact: feature work now starts from an accepted spec instead of direct chat prompts.
- Migration notes: new workflow items should reference the related spec path in `TODO.md`, git notes, PRs, and archived sessions.
- Related PR/commit: pending.

## 2026-05-02 - Added Vercel Plugin Scaffold

Summary:

- What changed: added a repo-local `vercel` plugin scaffold under `plugins/vercel` and registered it in `.agents/plugins/marketplace.json`.
- Why: make a Vercel plugin available from the repository's local Codex plugin catalog.
- User-visible impact: the repo now includes a discoverable local plugin scaffold with placeholder manifest values.
- Migration notes: plugin manifest metadata is still placeholder content and needs project-specific values before real distribution or use.
- Related PR/commit: `639606825f2d7b1175ce6fdf67fcd13eeab830fb`.

## 2026-05-02 - Installed Onboarding Skills and Agents

Summary:

- What changed: copied supplied onboarding skill packages into `.codex/skills/` and agent TOML configs into `.agents/`.
- Why: make the supplied workflow instructions available from repo-local harness locations.
- User-visible impact: no product behavior exists yet.
- Migration notes: imported skill and agent bodies should be reviewed for project-specific references before operational use.
- Related PR/commit: `b972e5dae74474ee02ea7815f1c7fdbb4b69768f`.

## 2026-05-02 - Agent Harness Bootstrap

Summary:

- What changed: added the initial agent harness, documentation map, workflow rules, PR templates, and skill roots.
- Why: prepare the repository for safe agentic development.
- User-visible impact: no product behavior exists yet.
- Migration notes: none.
- Related PR/commit: `b2714014dc46591dfb0f42b4d28e7ffac2138051`.
