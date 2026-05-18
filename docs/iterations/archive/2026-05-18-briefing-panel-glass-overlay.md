# Briefing Panel Glass Overlay - 2026-05-18

Completed session archived from `TODO.md`.

Spec: `docs/specs/briefing-panel-glass-overlay.md`

Parent spec: `docs/specs/dashboard-ui-liquid-glass-panel-polish.md`

PR: pending Step 7 submission.

## Completed tasks

- [x] Add component tests for the collapsible briefing panel behavior and summary fallbacks. Commit: `45a2216`.
- [x] Rewrite the briefing hero as a full-bleed image with responsive glass briefing variants. Commits: `45a2216`, `22d9e6d`.
- [x] Add export-matched responsive CSS tokens for the glass overlay and repositioned weather card. Commit: `45a2216`.
- [x] Apply the responsive briefing pill to the public `Dutch Weather Dashboard.html` shell served at `/`. Commit: `627548c`.
- [x] Move the expanded briefing header up by removing the hidden collapsed pill from layout flow. Commit: `449c2af`.
- [x] Match the public briefing panel shell exactly to the provided HTML export while preserving API-driven briefing data. Commit: `1f735ab`.
- [x] Add the smartphone circular briefing pill and replace the star glyph with the AI sparkle icon. Commit: `a18e7fe`.
- [x] Use city-specific Rotterdam and Utrecht hero images from public assets. Commit: `71b6d58`.

## Validation

- `npm test -- app/dashboard/__tests__/BriefingHero.test.tsx` - PASS.
- `npm test -- tests/dashboard.test.ts` - PASS.
- `npm run lint` - PASS.
- `npm run typecheck` - PASS.
- `npm test` - PASS, 12 files and 99 tests.
- `npm run build` with local PostgreSQL `DATABASE_URL` - PASS.
- In-app browser `srcdoc` check for `/` - PASS: city image map includes Rotterdam and Utrecht, dynamic `src={heroImageSrc}` is served, and hard-coded Amsterdam hero `src` is absent.
- In-app browser smartphone check - PASS: the collapsed pill has no visible label text and uses `/dashboard-assets/icon-spark.png`.

## Notes

- `rotterdam-day.png` and `utrecht-day.png` were copied from the original workspace `public/dashboard-assets` into this feature worktree.
- The public HTML shell remains the visible `/` entry point; React component updates keep the dashboard component path consistent with the public shell.
