CREATE TABLE public.coach_visits (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_user_id    uuid REFERENCES auth.users(id) NOT NULL,
  dealership_id    uuid REFERENCES public.dealerships(id) NOT NULL,
  visit_date       date NOT NULL,
  status           text NOT NULL DEFAULT 'proposed'
                     CHECK (status IN ('proposed','confirmed','cancelled','completed')),
  visit_notes      text,
  created_at       timestamptz DEFAULT now(),
  updated_at       timestamptz DEFAULT now()
);

ALTER TABLE public.coach_visits ENABLE ROW LEVEL SECURITY;

-- Coach: full CRUD on own rows
CREATE POLICY "coach_visits_coach_all" ON public.coach_visits
  FOR ALL
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid());

-- Dealer: read visits for their dealership
CREATE POLICY "coach_visits_dealer_select" ON public.coach_visits
  FOR SELECT
  USING (
    dealership_id = (
      SELECT active_dealership_id FROM public.profiles
      WHERE user_id = auth.uid() AND active_dealership_id IS NOT NULL
    )
  );

-- Dealer: confirm or cancel only (no insert/delete)
CREATE POLICY "coach_visits_dealer_update" ON public.coach_visits
  FOR UPDATE
  USING (
    dealership_id = (
      SELECT active_dealership_id FROM public.profiles
      WHERE user_id = auth.uid() AND active_dealership_id IS NOT NULL
    )
  )
  WITH CHECK (status IN ('confirmed', 'cancelled'));

-- OEM: read visits for their network dealers
CREATE POLICY "coach_visits_oem_select" ON public.coach_visits
  FOR SELECT
  USING (
    dealership_id IN (
      SELECT dnm.dealership_id
      FROM public.dealer_network_memberships dnm
      JOIN public.oem_networks onet ON onet.id = dnm.network_id
      WHERE onet.owner_org_id = (
        SELECT active_organization_id FROM public.profiles
        WHERE user_id = auth.uid()
      )
      AND dnm.is_active = true
    )
  );

-- Only one active (proposed/confirmed) visit per coach+dealer at a time
CREATE UNIQUE INDEX coach_visits_one_active_per_dealer
  ON public.coach_visits (coach_user_id, dealership_id)
  WHERE status IN ('proposed', 'confirmed');

-- updated_at auto-update
CREATE TRIGGER update_coach_visits_updated_at
  BEFORE UPDATE ON public.coach_visits
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
