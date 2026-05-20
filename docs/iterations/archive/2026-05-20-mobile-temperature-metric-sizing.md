# 2026-05-20 - Mobile Temperature Metric Sizing

Spec: `docs/specs/briefing-panel-glass-overlay.md`

## Completed

- [x] Mobile-only compact temperature metric — commit `2a3c65c`
  - Added compact sizing for the top-left Temperature metric card at mobile widths only.
  - Preserved tablet and desktop metric card sizing.
  - Mirrored the behavior in the standalone dashboard HTML and the React dashboard component.
  - Kept the React mobile hero image rule after broader phone overrides so the accepted mobile non-cropping behavior remains in force.

## Validation

- `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`
- `npm test -- tests/dashboard.test.ts`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser screenshots:
  - Mobile: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-mobile-compact-20260520-170917/mobile-390x1200.png`
  - Tablet: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-mobile-compact-20260520-170917/tablet-834x1112.png`
  - Desktop: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-mobile-compact-20260520-170917/desktop-1440x1100.png`
