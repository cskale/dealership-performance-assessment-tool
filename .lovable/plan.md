
I can see from the console logs that there are HMR (Hot Module Reload) failures affecting several KPI Encyclopedia components:

- `KPIStudio.tsx`
- `KPIExplorer.tsx` 
- `RootCauseIntelligenceBoard.tsx`

The error indicates "importing non-existent modules" which suggests import path issues.

Looking at the context, I can see that during the recent Stage 1 Harmonization Refactor, `departmentConfig.ts` was moved from `src/components/kpi-encyclopedia/departmentConfig.ts` to `src/lib/departmentConfig.ts`. The KPI Encyclopedia components are likely still trying to import from the old path.

**Root Cause Analysis:**
1. The file `departmentConfig.ts` was relocated during the harmonization refactor
2. KPI Encyclopedia components still have import statements pointing to the old location
3. This creates broken imports causing HMR failures
4. The app can't hot reload these components, leading to internal errors

**Fix Strategy:**
1. Audit all KPI Encyclopedia components for import statements referencing the old `departmentConfig.ts` path
2. Update import paths to point to the new location: `src/lib/departmentConfig.ts`
3. Check for any other import path issues caused by the refactoring
4. Ensure all components can import their dependencies correctly

**Files to inspect and fix:**
- `src/components/kpi-encyclopedia/KPIStudio.tsx`
- `src/components/kpi-encyclopedia/KPIExplorer.tsx`
- `src/components/kpi-encyclopedia/RootCauseIntelligenceBoard.tsx`
- Any other KPI Encyclopedia components that import `departmentConfig`

**Implementation:**
1. Search for all occurrences of the old import path `./departmentConfig` or `../departmentConfig`
2. Replace with the correct path `@/lib/departmentConfig`
3. Verify that all imports resolve correctly
4. Test that HMR works properly after the fixes
