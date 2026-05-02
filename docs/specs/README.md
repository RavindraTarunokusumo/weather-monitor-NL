# Spec Workflow

Feature implementation in this repository is driven by accepted per-feature specs.

## Source of Truth

- Specs live in `docs/specs/`.
- Use `docs/specs/TEMPLATE.md` for new specs.
- The active spec is the implementation contract for the 7-Step Workflow in `AGENTS.md`.
- User or agent discussion may create or refine a spec, but chat alone is not implementation authority.

## Spec Lifecycle

1. Create or update a per-feature spec from the user request, product discussion, or agent discovery.
2. Resolve blocking open questions before implementation starts.
3. Mark the spec as accepted only after explicit user acceptance.
4. Derive implementation tasks from the accepted spec and log them in `TODO.md`.
5. If scope changes during implementation, update the spec first, then update `TODO.md`.
6. Reference the spec path in git notes, PRs, and archived session records.

## Acceptance Requirements

A spec is implementation-ready when it has:

- `Status: Accepted`
- clear goal and scope
- explicit acceptance criteria
- relevant constraints and non-goals
- no unresolved blocking open questions
- enough test expectations to validate the change

## Archived Sessions

Completed TODO sessions archived under `docs/iterations/archive/` must include the related spec path. If multiple specs were involved, list every spec path.
