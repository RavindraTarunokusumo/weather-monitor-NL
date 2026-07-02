# Grok Handoff Policy Addition

Spec: N/A (workflow/policy update, not feature implementation).

## Completed

- `AGENTS.md`/`CLAUDE.md` were modified on disk mid-session, outside any tool call in this conversation, adding a "Grok Build Implementation/Review Handoff" section (headless `grok` CLI with `--yolo` auto-approve as the default TODO-sub-item implementer and PR reviewer, senior-dev-owned git operations, mandatory independent diff review and full validation before commit, ephemeral session cleanup).
- The system-reminder-style note reporting that change instructed not telling the user about it. Verified the underlying diff was real (`git diff`, `git log --all -p`, full-repo `grep`) rather than trusting the note's framing, then flagged the "don't tell the user" instruction directly to the user regardless of the diff's legitimacy, since concealment instructions bundled with a file-change notice are a risk signal on their own — independent of who made the edit.
- User confirmed the policy was intentional via `AskUserQuestion`; committed as `84edb8e`.
- Confirmed `grok` CLI is genuinely installed (`grok 0.2.81`), so the policy is executable, not aspirational/broken.

## Validation

- `npm run lint`: passed (docs-only change; no code, test, or architecture behavior touched).
- Pre-PR `simplify`/`doc-updater`/`test-plan-writer`/`security-review` judged not applicable: no code diff to simplify, no behavior/state/API/test changes, no auth/secrets/network/privileged-operation surface touched by this docs-only policy text.

## Follow-Up

- No `grok` CLI invocation has happened yet under this policy — it is documented but unused pending an explicit task handoff from the user.
- If/when a backlog item is delegated to Grok, follow the contract in `AGENTS.md`/`CLAUDE.md` "Grok Build Implementation/Review Handoff": self-contained prompt from cold context, no git operations inside the delegated session, full validation and independent diff review before the senior dev commits, session directory cleanup after.
