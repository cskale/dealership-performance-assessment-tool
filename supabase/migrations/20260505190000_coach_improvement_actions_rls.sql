-- Additive SELECT policy: coaches can read improvement_actions for their assigned dealerships.
-- Mirrors the existing "Coaches can view assessments for assigned dealerships" policy on assessments.
CREATE POLICY "Coaches can view improvement_actions for assigned dealerships"
ON public.improvement_actions
FOR SELECT
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
);
