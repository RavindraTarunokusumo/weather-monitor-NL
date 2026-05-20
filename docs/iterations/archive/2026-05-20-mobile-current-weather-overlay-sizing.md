# 2026-05-20 - Mobile Current Weather Overlay Sizing

Spec: `docs/specs/briefing-panel-glass-overlay.md`

## Completed

- [x] Mobile-only compact current-weather overlay — commit `ad7fabc`
  - Added compact sizing for the top-right current-weather overlay at mobile widths only.
  - Preserved tablet and desktop overlay sizing.
  - Mirrored the behavior in the standalone dashboard HTML and the React dashboard CSS path.

## Validation

- `npm test -- tests/dashboard.test.ts`
- `npm run lint`
- `npm run typecheck`
- `npm test`
- `npm run build`
- Browser screenshots:
  - Review viewport: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-current-weather-compact-20260520-222440/review-536x777.png`
  - Mobile: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-current-weather-compact-20260520-222440/mobile-390x1200.png`
  - Tablet: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-current-weather-compact-20260520-222440/tablet-834x1112.png`
  - Desktop: `C:/Users/rvind/AppData/Local/Temp/weather-dashboard-current-weather-compact-20260520-222440/desktop-1440x1100.png`
