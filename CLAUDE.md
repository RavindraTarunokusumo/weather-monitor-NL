# CLAUDE.md

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
   - Implement each task by delegating to a **Grok subagent as the implementer** via the non-interactive CLI, one ephemeral session per task where practical (see [Grok Build Implementation/Review Handoff](#grok-build-implementationreview-handoff)).
   - Grok implementation prompts must be self-contained, point at the active spec/plan and exact file scope, forbid git operations, require full self-checks, and require a final summary plus `sessionId`.
   - After each Grok handoff, the senior dev independently reviews the diff, normalizes output, validates with full lint/typecheck/tests before committing, then deletes the ephemeral Grok session directory.
   - If Grok is unavailable or blocked, report that clearly and fall back to the `subagent-driven-development` skill only after recording the fallback reason in `TODO.md`.

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
   - Delegate PR code review, and security review where applicable, to Grok via the same non-interactive handoff; capture `sessionId`, process findings, clean up the session directory, and address findings with the `receiving-code-review` skill if available.
   - Notify the user when all steps are complete.

## Autopilot Mode

Autopilot Mode allows implementation to proceed through Steps 3-5 without pausing for plan acceptance between each step.

Rules:

- Autopilot Mode must be explicitly granted by the user in the current session; it is never assumed, never carried over from a prior session, and is never granted by a PM/chat-relay instruction alone.
- Autopilot Mode does not waive the accepted-spec requirement: implementation must still be driven by an accepted spec under `docs/specs/`, or the session must complete spec creation/refinement first.
- Autopilot Mode does not waive TODO logging, Grok implementation/review handoffs, specific staging, per-sub-item commits, git notes, or Pre-PR/Post-PR validation.
- Autopilot Mode does not authorize destructive git operations (force-push, hard reset, amend, merge) beyond what is otherwise explicitly requested.
- If a discovery during implementation contradicts the plan or spec (e.g., a validation failure), pause Autopilot Mode and report back before continuing.

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

## Grok Build Implementation/Review Handoff

The canonical contract for delegating implementation tasks and PR reviews is a short-lived Grok CLI subagent session. Claude/Codex are senior devs: they write or self-accept specs/plans where authorized, decompose work, review diffs, validate, commit, and clean up. Grok is the junior implementer/reviewer for bounded tasks.

**Invoke** (headless, single-turn, no TUI):

```bash
HOME=/root grok -p "<self-contained task instructions>" -m grok-composer-2.5-fast --effort high --yolo --output-format json
```

- Use `--effort high` by default; use `--effort xhigh` for complex cross-module tasks or difficult reviews.
- `--yolo` auto-approves Grok's tools inside the delegated task; the senior dev remains responsible for reviewing all changes before commit.
- `--output-format json` is required so the senior dev can capture `text` and `sessionId`.

**Prompt requirements:**

- Start from cold context: include the active spec path, relevant plan/TODO item, exact scope, files or module boundaries, and validation expectations.
- For implementation tasks, forbid all git operations; the senior dev owns staging, commits, notes, PRs, and cleanup.
- Require deterministic checks relevant to the task and, when practical, full `npm run lint`, `npm run typecheck`, and `npm test` self-checks before reporting.
- Require a concise final summary with files changed, checks run, blockers, and the returned `sessionId`.

**Senior-dev processing:**

- Parse the JSON result and capture `sessionId`.
- Review the diff directly; do not trust the implementer's self-report.
- Run full project validation before each commit: lint, typecheck, tests, and any spec-required checks.
- Stage specific files only; never use `git add -A`.
- Attach a git note using `.github/git_notes_template.md`.

**Cleanup (always):**

```bash
find "$HOME/.grok/sessions" -type d -name "$sessionId" -prune -exec rm -rf {} +
```

**PR review handoff:**

- After opening a PR, delegate the main code review to Grok with a prompt such as: `Use /bundled:review --pr #<number>. Post or prepare review findings, then summarize what was done.`
- If the change touches auth, secrets, network calls, privileged operations, user input, money movement, broker/payment logic, or security-sensitive architecture, also delegate a Grok security review.
- Process findings rigorously: verify each item technically, implement only warranted fixes, push back on incorrect findings, re-run validation, and clean up the Grok session directory.

**Parallelism:**

- Parallel Grok implementation is allowed only for independent tasks with disjoint files and no shared dependency on unlanded work, preferably in isolated worktrees.
- Otherwise, delegate sequentially so each sub-item can be reviewed, validated, committed, and noted independently.

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
