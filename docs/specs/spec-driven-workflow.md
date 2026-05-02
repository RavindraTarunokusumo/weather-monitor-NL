# Spec-Driven Workflow Spec

Status: Accepted
Spec path: `docs/specs/spec-driven-workflow.md`
Accepted by: User
Accepted date: 2026-05-02

## Goal

Change the repository workflow so feature implementation is driven by accepted per-feature specs instead of direct user queries or prompts.

## Scope

Update the agent workflow contract, documentation index, harness documentation, PR template, git note template, changelog, insights, and TODO tracking to treat `docs/specs/` specs as the implementation input.

## Non-Goals

- Do not add application code.
- Do not add automated product tests.
- Do not introduce a root `SPEC.md`; specs are per-feature files under `docs/specs/`.

## Acceptance Criteria

- `AGENTS.md` preserves the 7-Step Workflow but applies it to an accepted active spec.
- New spec workflow documentation and a reusable spec template exist under `docs/specs/`.
- `TODO.md`, git notes, PRs, and archived session records must reference the related spec path.
- Documentation source-of-truth language distinguishes specs from execution tracking and technical docs.
- Validation confirms there is no stale prompt-driven workflow wording in changed workflow files.

## Constraints

- Keep the change docs-only.
- Keep the 7-Step Workflow structure intact.
- User-authored and agent-authored specs are both valid only after explicit user acceptance.
- Any implementation scope change must update the active spec before `TODO.md`.

## Implementation Notes

Relevant files include `AGENTS.md`, `docs/index.md`, `docs/agent-harness.md`, `.github/git_notes_template.md`, `.github/pull_request_template.md`, `docs/changelog.md`, `docs/insights.md`, and `TODO.md`.

## Test Expectations

- Run `git diff --check`.
- Manually review internal Markdown links and workflow wording.
- Search for stale prompt/query language in workflow docs.

## Open Questions

- None.
