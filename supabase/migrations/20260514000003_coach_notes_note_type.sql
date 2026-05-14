ALTER TABLE public.coach_notes
  ADD COLUMN IF NOT EXISTS note_type text
    CHECK (note_type IN ('observation', 'action', 'follow-up'));
