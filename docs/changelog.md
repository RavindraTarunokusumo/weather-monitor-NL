# Changelog

Record notable behavior, architecture, API, persistence, or workflow changes.

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
