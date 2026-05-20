ALTER TABLE public.coach_visits
  ADD COLUMN IF NOT EXISTS visit_type       text
    CHECK (visit_type IN ('in-person', 'remote', 'phone')),
  ADD COLUMN IF NOT EXISTS modules_reviewed text[]  NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS summary          text,
  ADD COLUMN IF NOT EXISTS next_visit_date  date,
  ADD COLUMN IF NOT EXISTS agreed_action_ids uuid[] NOT NULL DEFAULT '{}';

COMMENT ON COLUMN public.coach_visits.visit_type IS 'How the visit was conducted';
COMMENT ON COLUMN public.coach_visits.modules_reviewed IS 'Array of section IDs reviewed, e.g. new-vehicle-sales';
COMMENT ON COLUMN public.coach_visits.summary IS 'Coach narrative summary of the session';
COMMENT ON COLUMN public.coach_visits.next_visit_date IS 'Proposed date for next visit';
COMMENT ON COLUMN public.coach_visits.agreed_action_ids IS 'IDs of improvement_actions agreed in this visit';
