ALTER TABLE public.coach_visits
  ADD COLUMN IF NOT EXISTS dealer_proposed_date date,
  ADD COLUMN IF NOT EXISTS declined_by text
    CHECK (declined_by IN ('dealer', 'coach'));

COMMENT ON COLUMN public.coach_visits.dealer_proposed_date IS 'Date proposed by dealer in a counter-proposal';
COMMENT ON COLUMN public.coach_visits.declined_by IS 'Who declined: dealer or coach. status remains cancelled.';
