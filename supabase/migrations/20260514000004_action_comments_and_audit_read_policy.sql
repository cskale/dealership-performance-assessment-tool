-- action_comments: coach/dealer notes attached to a specific action
CREATE TABLE public.action_comments (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  action_id    uuid REFERENCES public.improvement_actions(id) ON DELETE CASCADE NOT NULL,
  user_id      uuid REFERENCES auth.users(id) NOT NULL,
  author_email text NOT NULL,
  comment_text text NOT NULL,
  created_at   timestamptz DEFAULT now()
);

ALTER TABLE public.action_comments ENABLE ROW LEVEL SECURITY;

-- Read: org member OR coach assigned to the dealership
CREATE POLICY "action_comments_select" ON public.action_comments
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.improvement_actions ia
      JOIN public.assessments a ON a.id = ia.assessment_id
      WHERE ia.id = action_comments.action_id
        AND (
          a.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = a.organization_id
              AND m.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.coach_dealership_assignments cda
            WHERE cda.dealership_id = a.dealership_id
              AND cda.coach_user_id = auth.uid()
              AND cda.is_active = true
          )
        )
    )
  );

-- Insert: authenticated user, must set their own user_id
CREATE POLICY "action_comments_insert" ON public.action_comments
  FOR INSERT WITH CHECK (user_id = auth.uid());

-- Delete: own comments only
CREATE POLICY "action_comments_delete" ON public.action_comments
  FOR DELETE USING (user_id = auth.uid());

-- action_audit_log SELECT policy (trigger handles inserts via SECURITY DEFINER)
CREATE POLICY "action_audit_log_select" ON public.action_audit_log
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.improvement_actions ia
      JOIN public.assessments a ON a.id = ia.assessment_id
      WHERE ia.id = action_audit_log.action_id
        AND (
          a.user_id = auth.uid()
          OR EXISTS (
            SELECT 1 FROM public.memberships m
            WHERE m.organization_id = a.organization_id
              AND m.user_id = auth.uid()
          )
          OR EXISTS (
            SELECT 1 FROM public.coach_dealership_assignments cda
            WHERE cda.dealership_id = a.dealership_id
              AND cda.coach_user_id = auth.uid()
              AND cda.is_active = true
          )
        )
    )
  );

-- Helper: get display label for a user_id based on actor_type
CREATE OR REPLACE FUNCTION public.get_actor_label(p_user_id uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT COALESCE(
    CASE actor_type
      WHEN 'coach'    THEN 'Coach'
      WHEN 'oem'      THEN 'OEM'
      WHEN 'dealer'   THEN 'Dealer'
      WHEN 'internal' THEN 'Internal'
      ELSE 'User'
    END,
    'User'
  )
  FROM public.profiles
  WHERE user_id = p_user_id
  LIMIT 1;
$$;
