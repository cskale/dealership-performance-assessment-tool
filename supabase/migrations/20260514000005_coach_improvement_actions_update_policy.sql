-- Coaches need UPDATE access to improvement_actions for their assigned dealerships.
-- The existing policy only covers user_id = auth.uid() (dealer/owner).
-- Without this, coach updates are silent no-ops (RLS returns 0 rows, no error).

CREATE POLICY "Coaches can update improvement_actions for assigned dealerships"
ON public.improvement_actions
FOR UPDATE
USING (
  EXISTS (
    SELECT 1
    FROM public.assessments a
    JOIN public.coach_dealership_assignments cda
      ON cda.dealership_id = a.dealership_id
    WHERE a.id = improvement_actions.assessment_id
      AND cda.coach_user_id = auth.uid()
      AND cda.is_active = true
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.assessments a
    JOIN public.coach_dealership_assignments cda
      ON cda.dealership_id = a.dealership_id
    WHERE a.id = improvement_actions.assessment_id
      AND cda.coach_user_id = auth.uid()
      AND cda.is_active = true
  )
);
