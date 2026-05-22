-- Allow dealers to set status = 'counter_proposed' when suggesting a new visit date
DROP POLICY IF EXISTS "coach_visits_dealer_update" ON public.coach_visits;

CREATE POLICY "coach_visits_dealer_update" ON public.coach_visits
  FOR UPDATE
  TO authenticated
  USING (
    dealership_id = (
      SELECT active_dealership_id FROM public.profiles
      WHERE user_id = auth.uid() AND active_dealership_id IS NOT NULL
    )
  )
  WITH CHECK (
    status IN ('confirmed', 'cancelled', 'counter_proposed')
  );
