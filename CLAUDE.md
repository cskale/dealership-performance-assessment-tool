# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # Start dev server on port 8080
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # ESLint
npm run preview      # Preview production build

# Testing (Vitest)
npx vitest                        # Run all tests
npx vitest run                    # Run once (no watch)
npx vitest run src/__tests__/scoringEngine.test.ts  # Run single test file
npx vitest --coverage             # With coverage (80% threshold enforced)
```

## Environment Setup

Copy `.env.example` to `.env` and fill in:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_ENABLE_AUTO_ACTIONS=true
```

## Architecture

**Stack**: React 18 + TypeScript + Vite + Supabase + Tailwind + shadcn/ui

**Path alias**: `@/` maps to `./src/`

### Provider Stack (App.tsx)

Providers are nested in this order — understand this when adding new context-dependent features:
```
QueryClientProvider (TanStack React Query)
  AuthProvider → MultiTenantProvider → LanguageProvider → RoleProvider
    → TooltipProvider → Router
```

### Routing

All app routes are under `/app/*` and protected by `ProtectedRoute`. Public routes: `/auth`, `/auth/callback`, `/methodology`, `/invite/:token`.

### Data Architecture

- **Supabase** handles auth, database (PostgreSQL with RLS), and real-time. Client is in `src/integrations/supabase/client.ts`. TypeScript types (auto-generated) are in `src/integrations/supabase/types.ts`.
- **Multi-tenancy**: Organization-scoped via `useMultiTenant`. All data queries should be scoped to the active organization.
- **RBAC**: 5 roles (Owner, Admin, Manager, Analyst, Viewer) managed via `RoleContext` and `useActiveRole`.

### Assessment Engine

The core business logic lives in `src/lib/`:
- `scoringEngine.ts` — calculates scores from questionnaire answers
- `signalEngine.ts` — generates insights/signals from scores
- `contextIntelligence.ts` — context-aware recommendations
- `kpiDefinitions.ts` — KPI metadata (355KB, largest file — treat as data, not logic)
- `actionRationaleMap.ts` — action plan templates

`src/data/questionnaire.ts` (100KB) contains all assessment questions. `src/data/actionTemplates.ts` contains action plan templates.

### State Pattern

- **Server state**: TanStack React Query (5-min stale time)
- **Auth/multi-tenant/role state**: React Context with custom hooks (`useAuth`, `useMultiTenant`, `useActiveRole`)
- **Forms**: React Hook Form + Zod validation schemas in `src/lib/validationSchemas.ts`

### UI Components

Base components come from shadcn/ui (`src/components/ui/`) — don't edit these directly; re-generate via `npx shadcn@latest add <component>`. Custom components live in `src/components/`.

### Exports

- PDF: `src/lib/pdfReportGenerator.ts` (html2canvas + jsPDF)
- Excel: `src/lib/excelExportGenerator.ts` (xlsx)

### Internationalization

`src/contexts/LanguageContext.tsx` (44KB) contains translations. English and German are complete; other languages (ES, FR, IT) are stubs. Use `useLanguage()` hook for translations.

## Testing

Tests live in `src/__tests__/`. The test setup is in `src/test-setup.ts`. Coverage thresholds are 80% for branches, functions, lines, and statements. Vitest uses jsdom environment.
