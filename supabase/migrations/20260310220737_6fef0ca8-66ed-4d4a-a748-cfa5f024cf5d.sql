
-- Add new nullable columns to improvement_actions for triage model and context intelligence
-- All nullable with safe defaults, backwards-compatible

ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS impact_score integer NULL,
  ADD COLUMN IF NOT EXISTS effort_score integer NULL,
  ADD COLUMN IF NOT EXISTS urgency_score integer NULL,
  ADD COLUMN IF NOT EXISTS action_context text NULL,
  ADD COLUMN IF NOT EXISTS business_impact text NULL,
  ADD COLUMN IF NOT EXISTS recommendation text NULL,
  ADD COLUMN IF NOT EXISTS expected_benefit text NULL,
  ADD COLUMN IF NOT EXISTS linked_kpis jsonb NULL,
  ADD COLUMN IF NOT EXISTS likely_drivers jsonb NULL,
  ADD COLUMN IF NOT EXISTS likely_consequences jsonb NULL;
