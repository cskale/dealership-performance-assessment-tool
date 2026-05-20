ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS source_visit_id    uuid
    REFERENCES public.coach_visits(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS source_question_id text;

COMMENT ON COLUMN public.improvement_actions.source_visit_id IS 'Visit in which this action was agreed — enables provenance badge';
COMMENT ON COLUMN public.improvement_actions.source_question_id IS 'Question ID that triggered this action — set by signal engine (future wiring)';
