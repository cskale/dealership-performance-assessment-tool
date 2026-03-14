CREATE TABLE IF NOT EXISTS public.action_generation_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  assessment_id UUID,
  organization_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.action_generation_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own logs"
  ON public.action_generation_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own logs"
  ON public.action_generation_log FOR INSERT
  WITH CHECK (auth.uid() = user_id);