# Enhancement Log — Small Improvements & Tweaks

Quick-reference log of incremental enhancements, UI fixes, and small quality-of-life improvements made outside of major feature sprints.

---

## 2026-06-22

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Sidebar expand button restyle | Moved collapse/expand toggle from absolute overlay to between header and nav. Full white background with dark icon — clear, visible click target. | pending |
| 2 | Fix dashboard score fonts | Dashboard hero scores (overall "63" and focus dept "59") were using `font-display` (Instrument Serif) instead of Inter. Changed to `font-sans` to match design system. | pending |
| 3 | Clean radial score ring | Removed 3 grey tick-mark rectangles at 46/70/85 positions on the SVG score ring in Results summary cards. Ring is now clean and professional. | pending |
| 4 | Fix score breakdown math display | When only 3/5 departments assessed, legend showed raw contributions summing to 41.1 while overall was 63. Now normalizes weights so contributions sum correctly to overall score (e.g. NVS 38%→25.1pts + UVS 31%→18.2pts + FIN 31%→19.7pts = 63). | pending |
| 5 | Remove duplicate Performance Radar from Summary tab | Radar chart on Summary tab was identical to the one on Maturity Level tab. Removed from Summary — single source on Maturity tab. | pending |
| 6 | Move Performance Data to KPI Analysis tab | Moved `PerformanceDataPanel` (user-entered KPI values) from Summary tab into KPI Analysis tab. Replaced generic `IndustrialKPIDashboard` which showed static benchmark info without user-specific data. KPI tab now shows actual dealer performance data. | pending |
| 7 | Remove Score Decomposition from Maturity tab | Removed collapsible score decomposition table (dept × weight × contribution) from Maturity tab. Redundant with stacked bar on Summary tab. Cleaned up unused `scoreDecompositionData` and `weightedSum` memos. | pending |
| 8 | Scope field notes to assessment | `useAssessmentNotes` now accepts optional `assessmentId` — filters notes to that assessment only. On assessment completion, all unlinked notes (assessment_id IS NULL) are stamped with the new assessment ID. Prevents old notes bleeding into new assessment results. | pending |
| 9 | Fix List/Kanban/Roadmap button radius | Container changed to `rounded-lg`, inner buttons to `rounded-[6px]`. Visually matched corners — no more mismatched radius between toggle buttons and their container. | pending |
| 10 | Collapsible filter sections in Action Plan | Filter popover now shows Priority/Department/Sort as collapsed `<details>` headers. Click to expand and see options. Cleaner initial view vs. all options visible at once. | pending |

---

## 2026-06-20

| # | Enhancement | Details | Commit |
|---|-------------|---------|--------|
| 1 | Deferred status in improvement tracker | Added `.s-deferred` CSS class, Deferred counter in summary bar, progress % excludes deferred items, filter support. 9 items deferred (#03, #12, #15, #51, #69, #75, #76, #82, #83). | `d2df185` |
| 2 | Language selector moved to Account profile | Removed globe icon from header. Language dropdown now in Account → Edit Profile → Preferences card. Single source of truth — instant apply, syncs to DB + localStorage + LanguageContext. | `748884e` |
| 3 | Remove duplicate profile bubble from stats bar | Dashboard top stats bar had a redundant user avatar circle (top-right) — removed. Sidebar footer already shows user identity. | pending |
| 4 | Improve sidebar collapse toggle visibility | Moved collapsed-state toggle button further right (`-right-3`) so it doesn't overlap "Dealer Diagnostic" text. Increased border to `white/30` and icon to `white/80` for better contrast. | `d952433` |
| 5 | Wire i18n into sidebar navigation | AppSidebar now uses `t()` for all nav labels + section headers. Added 12 new `nav.*` translation keys across all 5 languages (EN, DE, FR, ES, IT). Language change from Account → Preferences now visibly updates sidebar. | `8e0d0a4` |
| 6 | Fix i18n dual-system desync | `LanguageContext.setLanguage` now syncs both localStorage keys (`app_language` + `language`). `i18n.ts` init reads `app_language` first. Removed direct `i18next` import/calls from LanguageContext — localStorage sync is sufficient since only `ExportPDFModal` uses react-i18next. | `529c711` |
| 7 | Fix assessment crash (missing `cn` import) | Lovable CSS changes in `d952433` replaced inline styles with `cn()` calls in `CategoryAssessment.tsx` but omitted the import. Passed TypeScript but threw `ReferenceError: cn is not defined` in minified prod bundle. Added `import { cn } from '@/lib/utils'`. | `ba75522` |
