-- supabase/migrations/20260510120000_coach_notes.sql

CREATE TABLE public.coach_notes (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id     uuid NOT NULL REFERENCES auth.users(id),
  dealership_id     uuid NOT NULL REFERENCES dealerships(id) ON DELETE CASCADE,
  assessment_id     uuid REFERENCES assessments(id) ON DELETE SET NULL,
  action_id         uuid REFERENCES improvement_actions(id) ON DELETE SET NULL,
  note_text         text NOT NULL CHECK (char_length(note_text) <= 2000),
  created_at        timestamptz NOT NULL DEFAULT now(),
  updated_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

-- Coach: full CRUD on own notes
CREATE POLICY "coach_notes_coach_all" ON public.coach_notes
  FOR ALL
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Dealer: read notes where this is their active dealership
CREATE POLICY "coach_notes_dealer_read" ON public.coach_notes
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT active_dealership_id
      FROM profiles
      WHERE user_id = auth.uid()
        AND active_dealership_id IS NOT NULL
    )
  );

-- OEM: read notes for dealerships in their network
-- SECURITY DEFINER required — avoids RLS recursion (same pattern as get_dealership_details)
CREATE OR REPLACE FUNCTION private.oem_can_read_coach_note(p_dealership_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
SET search_path = public, private
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM profiles p
    JOIN oem_networks n ON n.owner_org_id = p.active_organization_id
    JOIN dealer_network_memberships dnm ON dnm.network_id = n.id
    WHERE p.user_id = auth.uid()
      AND p.actor_type = 'oem'
      AND dnm.dealership_id = p_dealership_id
      AND dnm.is_active = true
      AND n.status = 'active'
  )
$$;

CREATE POLICY "coach_notes_oem_read" ON public.coach_notes
  FOR SELECT
  USING (private.oem_can_read_coach_note(dealership_id));

-- Auto-update updated_at on row change
-- Use a unique name to avoid conflict if touch_updated_at() already exists from a prior migration
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER coach_notes_updated_at
  BEFORE UPDATE ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
