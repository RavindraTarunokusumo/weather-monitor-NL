# AGENTS.md

Project: `weather-monitor-NL` / Dutch Weather Intelligence

Feature implementation is spec-driven. User or agent queries may create, refine, or supply specs, but implementation work must be driven by an accepted per-feature spec under `docs/specs/`, not by chat prompts alone. Follow the 7-Step Workflow strictly against the active spec. Do not start implementation until Steps 1-3 are complete and Step 4 has logged spec-derived TODO items unless the user explicitly authorizes a different flow. Before editing, state which step you are on. Before finishing, confirm Step 6 and Step 7.

## Project Map

- Architecture: [docs/architecture.md](docs/architecture.md)
- Database / Persistence: [docs/database.md](docs/database.md)
- Patterns: [docs/patterns.md](docs/patterns.md)
- Testing: [docs/testing.md](docs/testing.md)
- Commands: [docs/commands.md](docs/commands.md)
- Agent Harness: [docs/agent-harness.md](docs/agent-harness.md)
- Spec Workflow: [docs/specs/README.md](docs/specs/README.md)
- Full Index: [docs/index.md](docs/index.md)

## Code Graph / Repo Map

If a code graph, dependency map, or architecture index exists, use it before touching unfamiliar code.

Rules:

- Do not rebuild the graph while files are being modified.
- Only rebuild on a clean working tree.
- Use the graph as a snapshot, not a live source of truth.
- Query the graph first, then read files directly.

## 7-Step Workflow

1. **Preamble**
   - Work in a dedicated local branch or worktree.
   - Activate the project environment.
   - Confirm repo status before editing.
   - Identify the active accepted spec path under `docs/specs/`.

2. **Repo Map**
   - Run or query the available code graph/index if present.
   - Use docs and graph output to understand the areas named by the active spec.

3. **Planning**
   - Read `AGENTS.md`, `docs/index.md`, the active spec, and relevant technical docs.
   - If no accepted spec exists, use the `brainstorming` skill to create or refine one before implementation planning.
   - Produce a concise plan and scope derived from the accepted spec.
   - Do not edit until the plan is accepted unless the user explicitly granted autonomous execution.

4. **Implementation**
   - Log spec-derived tasks and sub-items in `TODO.md` before editing.
   - Include the active spec path in the `TODO.md` session entry.
   - Use the `subagent-driven-development` skill where applicable.
   - Keep edits focused.

5. **Commit**
   - Run pre-commit checks before each commit.
   - Each meaningful TODO sub-item should land as its own commit.
   - Use specific staging; never use `git add -A`.
   - Attach a git note using `.github/git_notes_template.md`.
   - Include the active spec path in the git note.
   - Mark completed TODO sub-items with the commit hash.

6. **Pre-PR**
   - Confirm the implementation still matches the accepted spec.
   - Run the `simplify` skill if available.
   - Run the `doc-updater` skill or subagent if available.
   - Invoke `test-plan-writer` if behavior, state, API, tests, or architecture changed.
   - Invoke `security-review` if the change touches auth, secrets, network calls, privileged operations, user input, money movement, broker/payment logic, or security-sensitive architecture.
   - Run full validation.

7. **Submit PR**
   - Use `.github/pull_request_template.md`.
   - Fill out summary, spec path, scope, test plan, risk, rollback, docs, backlog, and targeted UI checks.
   - Address automated review with the `receiving-code-review` skill if available.
   - Notify the user when all steps are complete.

## Workflow Rules

1. Every TODO sub-item should land as its own commit.
2. Any extension or modification to the task must update the active spec first, then be logged in `TODO.md`.
3. Use specific staging, never `git add -A`.
4. Never force-push, reset `--hard`, merge, or amend unless explicitly asked.
5. Keep comments sparse.
6. Prefer clear naming over clever abstractions.
7. Avoid compatibility shims unless explicitly required.
8. Do not leave important conclusions only in chat memory; write them to docs.
9. A chat prompt is not implementation authority by itself; it either supplies an accepted spec or starts spec creation/refinement.
10. Do not implement from a spec with unresolved blocking open questions.

## Pre-Commit Checks

Adapt these commands to the active stack:

```bash
# Python backend
ruff check . --fix
ruff format .
pytest

# JavaScript / TypeScript frontend
npm run lint
npm test
```

If a tool is missing or unavailable, report it clearly at the end of the session.

## Pre-PR

Before submitting a PR:

- confirm the implementation matches the accepted spec
- run simplification review
- update docs
- run relevant tests
- run full tests when shared state, architecture, or cross-module behavior changed
- run security review where applicable
- ensure `TODO.md` is current

## Post-PR

- `TODO.md` contains active or future work only.
- Archive completed TODO sessions into `docs/iterations/archive/`, including the related spec path.
- Tag completed sub-items with commit hashes.
- Add session lessons to `docs/insights.md`.

## Reflection

After every completed session, record useful lessons in `docs/insights.md`:

- tools used
- scripts created
- workflow improvements
- recurring failure modes
- skills worth adding or improving
