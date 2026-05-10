-- supabase/migrations/20260510130000_coach_notes_fix.sql
-- Fixes for the initial coach_notes migration (20260510120000_coach_notes.sql):
--   Fix 1 (BLOCKER): Replace duplicate touch_updated_at() with project-standard update_updated_at_column()
--   Fix 2 (MEDIUM):  Tighten coach INSERT guard — require active coach_dealership_assignments row
--   Fix 3 (MEDIUM):  Align oem_can_read_coach_note() with project pattern (caller_is_verified_oem + null-auth guard)
--   Fix 4 (LOW):     Add indexes on coach_user_id and dealership_id
--   Fix 5 (LOW):     Fix search_path in SECURITY DEFINER function (public only, not public, private)

-- ─────────────────────────────────────────────────────────────────
-- Fix 1: Drop duplicate trigger function, re-wire trigger to project standard
-- ─────────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS coach_notes_updated_at ON public.coach_notes;

CREATE TRIGGER coach_notes_updated_at
  BEFORE UPDATE ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Drop the duplicate function that was created by the original migration.
-- Must happen AFTER the trigger is re-created (trigger would otherwise hold a dependency).
DROP FUNCTION IF EXISTS public.touch_updated_at();

-- ─────────────────────────────────────────────────────────────────
-- Fix 2: Tighten coach INSERT guard
-- Original WITH CHECK only verified coach_user_id = auth.uid().
-- New WITH CHECK also requires an active coach_dealership_assignments row for the target dealership.
-- ─────────────────────────────────────────────────────────────────
DROP POLICY IF EXISTS "coach_notes_coach_all" ON public.coach_notes;

CREATE POLICY "coach_notes_coach_all" ON public.coach_notes
  FOR ALL
  USING (coach_user_id = auth.uid())
  WITH CHECK (
    coach_user_id = auth.uid()
    AND EXISTS (
      SELECT 1
      FROM coach_dealership_assignments cda
      WHERE cda.coach_user_id = auth.uid()
        AND cda.dealership_id = coach_notes.dealership_id
        AND cda.is_active = true
    )
  );

-- ─────────────────────────────────────────────────────────────────
-- Fix 3 + Fix 5: Rewrite oem_can_read_coach_note()
--   - Delegate OEM verification to private.caller_is_verified_oem() (project pattern)
--   - Add auth.uid() IS NULL null-auth guard
--   - Fix search_path to public only (was: public, private)
-- ─────────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.oem_can_read_coach_note(p_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    auth.uid() IS NOT NULL
    AND private.caller_is_verified_oem()
    AND EXISTS (
      SELECT 1
      FROM oem_networks n
      JOIN dealer_network_memberships dnm ON dnm.network_id = n.id
      WHERE n.owner_org_id = (
              SELECT active_organization_id FROM profiles WHERE user_id = auth.uid()
            )
        AND dnm.dealership_id = p_dealership_id
        AND dnm.is_active = true
        AND n.status = 'active'
    )
$$;

-- ─────────────────────────────────────────────────────────────────
-- Fix 4: Add indexes for common query patterns
-- ─────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS coach_notes_coach_user_id_idx  ON public.coach_notes (coach_user_id);
CREATE INDEX IF NOT EXISTS coach_notes_dealership_id_idx  ON public.coach_notes (dealership_id);
