# 2026-05-20 - Restore Mobile Temperature Metric Sizing

Spec: `docs/specs/briefing-panel-glass-overlay.md`

## Completed

- [x] Restore mobile Temperature metric original sizing — commit `e0b9b2a`
  - Removed the mobile-only compact treatment from the top-left Temperature metric card.
  - Restored original/default metric tile sizing in both the standalone dashboard HTML and the React dashboard component path.
  - Preserved the compact mobile current-weather overlay.

## Validation

- `npm test -- app/dashboard/__tests__/DashboardShell.test.tsx`
- `npm test -- tests/dashboard.test.ts`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser screenshots:
  - Review viewport: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-temperature-original-20260520-223453/review-580x777.png`
  - Mobile: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-temperature-original-20260520-223453/mobile-390x1200.png`
  - Tablet: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-temperature-original-20260520-223453/tablet-834x1112.png`
  - Desktop: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-temperature-original-20260520-223453/desktop-1440x1100.png`
