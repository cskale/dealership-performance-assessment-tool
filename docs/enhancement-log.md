# Enhancement Log — Small Improvements & Tweaks

Quick-reference log of incremental enhancements, UI fixes, and small quality-of-life improvements made outside of major feature sprints.

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
