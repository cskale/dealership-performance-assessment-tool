

# Security Fixes Plan — 6 Critical Findings

## Summary

Six security findings need resolution. Here's the plan for each:

---

### 1. jsPDF Dependency Vulnerability (Supply Chain)

**Problem:** jsPDF <=3.0.4 has a path traversal vulnerability (CVE-2025-68428).
**Fix:** Upgrade `jspdf` from `^3.0.1` to `^4.0.0` in `package.json`. The advisory confirms v4.0.0 has no other breaking changes.

**Impact:** This vulnerability only affects Node.js builds, and our app runs client-side — so actual risk is low. But upgrading removes the scanner flag and is the correct practice.

**Files:** `package.json`

---

### 2. Missing Input Validation (Input Security)

**Problem:** User inputs go to Supabase without schema validation — no length limits, no type checks beyond DB constraints.
**Fix:** Create Zod validation schemas for all user-submitted forms and validate before Supabase calls:
- `ActionSheet.tsx` — validate title (max 500), description (max 5000), status, priority
- `OrganizationSettings.tsx` — validate name (max 200), city (max 100), country (max 100)
- `DealerContextForm.tsx` — validate all dealer fields with length and type constraints
- `src/hooks/useAssessmentNotes.tsx` — validate notes (max 5000)
- Profile fields in `Account.tsx` — validate display_name (max 100), bio (max 1000), job_title (max 100)

Create a shared `src/lib/validationSchemas.ts` with all Zod schemas. `zod` is already installed.

**Files:** `src/lib/validationSchemas.ts` (new), `src/components/ActionSheet.tsx`, `src/components/OrganizationSettings.tsx`, `src/components/DealerContextForm.tsx`, `src/hooks/useAssessmentNotes.tsx`, `src/pages/Account.tsx`

---

### 3. Over-Permissive Actions Table RLS (Data Protection — 2 findings combined)

**Problem:** Migration `20251120221722` replaced scoped policies with `USING (true)` on SELECT, UPDATE, and DELETE for the `actions` table. Any authenticated user can read/modify/delete any action.

**Fix:** New migration that drops the permissive policies and creates scoped ones using the existing `get_user_dealer_id()` and `has_role()` functions (both already defined):

```sql
DROP POLICY IF EXISTS "Authenticated users can view all actions" ON actions;
DROP POLICY IF EXISTS "Authenticated users can update actions" ON actions;
DROP POLICY IF EXISTS "Authenticated users can delete actions" ON actions;

CREATE POLICY "Users can view own dealer actions" ON actions FOR SELECT
  USING (dealer_id = public.get_user_dealer_id(auth.uid()) OR public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Users can update own dealer actions" ON actions FOR UPDATE
  USING (dealer_id = public.get_user_dealer_id(auth.uid()) OR public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Users can delete own actions" ON actions FOR DELETE
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'coach'));
```

**Files:** New migration SQL file

---

### 4. SECURITY DEFINER Auth Bypass (Function Security)

**Problem:** `export_user_data` and `delete_user_account` use `IF _user_id != auth.uid()` — when `auth.uid()` is NULL (unauthenticated), `!= NULL` evaluates to NULL, not TRUE, so the guard is silently bypassed.

**Fix:** New migration replacing both functions with a fixed auth guard:
```sql
IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
  RAISE EXCEPTION 'Access denied';
END IF;
```

**Files:** New migration SQL file

---

### 5. Missing Helper Functions for Membership RLS

**Problem:** `action_audit_log` RLS policies reference `is_org_member()` and `is_org_admin()` which were never created. These policies fail at runtime.

**Fix:** New migration creating both functions:
```sql
CREATE OR REPLACE FUNCTION public.is_org_admin(_org_id UUID) ...
CREATE OR REPLACE FUNCTION public.is_org_member(_org_id UUID) ...
```

Using `SECURITY INVOKER` since these are simple membership checks.

**Files:** New migration SQL file

---

## All Migrations in One File

To keep it clean, all three database fixes (items 3, 4, 5) will go into a single migration file.

## Files Changed

| File | Action |
|------|--------|
| `package.json` | Update jspdf ^3.0.1 → ^4.0.0 |
| `src/lib/validationSchemas.ts` | New — Zod schemas for all forms |
| `src/components/ActionSheet.tsx` | Add Zod validation before save |
| `src/components/OrganizationSettings.tsx` | Add Zod validation before save |
| `src/components/DealerContextForm.tsx` | Add Zod validation before save |
| `src/hooks/useAssessmentNotes.tsx` | Add length validation on notes |
| `src/pages/Account.tsx` | Add Zod validation on profile fields |
| New migration SQL | Fix actions RLS, auth guard NULL bypass, create missing helper functions |

