-- Security audit 2026-09-25: tenant-isolation and privilege fixes.
-- Each block names the audit finding it closes.

-- ── Helpers ──────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION private.is_org_owner(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM memberships
    WHERE organization_id = _org_id AND user_id = auth.uid()
      AND role = 'owner' AND is_active = true);
$$;

CREATE OR REPLACE FUNCTION private.is_active_member_of_org(_org_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM memberships
    WHERE organization_id = _org_id AND user_id = auth.uid() AND is_active = true);
$$;

CREATE OR REPLACE FUNCTION private.is_active_member_of_dealership(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM dealerships d
    JOIN memberships m ON m.organization_id = d.organization_id
    WHERE d.id = _dealership_id AND m.user_id = auth.uid() AND m.is_active = true);
$$;

CREATE OR REPLACE FUNCTION private.caller_is_oem()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT actor_type = 'oem' FROM profiles WHERE user_id = auth.uid()), false);
$$;

-- Owner of the assessment, active member of its org, or its actively assigned coach.
CREATE OR REPLACE FUNCTION private.can_write_assessment_actions(_assessment_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (
    SELECT 1 FROM assessments a
    WHERE a.id = _assessment_id AND (
      a.user_id = auth.uid()
      OR EXISTS (SELECT 1 FROM memberships m WHERE m.organization_id = a.organization_id
                   AND m.user_id = auth.uid() AND m.is_active = true)
      OR EXISTS (SELECT 1 FROM coach_dealership_assignments c WHERE c.dealership_id = a.dealership_id
                   AND c.coach_user_id = auth.uid() AND c.is_active = true)));
$$;

GRANT EXECUTE ON FUNCTION private.is_org_owner(uuid), private.is_active_member_of_org(uuid),
  private.is_active_member_of_dealership(uuid), private.caller_is_oem(),
  private.can_write_assessment_actions(uuid) TO authenticated;

-- ── C3: memberships bootstrap let anyone self-insert as owner of any org ──
-- ── C13: admins could demote/delete owners ────────────────────────────────
DROP POLICY IF EXISTS memberships_insert ON public.memberships;
CREATE POLICY memberships_insert ON public.memberships FOR INSERT TO authenticated
  WITH CHECK (is_org_admin_or_owner(organization_id)
              AND (role <> 'owner' OR private.is_org_owner(organization_id)));

DROP POLICY IF EXISTS memberships_update ON public.memberships;
CREATE POLICY memberships_update ON public.memberships FOR UPDATE TO authenticated
  USING (is_org_admin_or_owner(organization_id)
         AND (role <> 'owner' OR private.is_org_owner(organization_id)))
  WITH CHECK (is_org_admin_or_owner(organization_id)
              AND (role <> 'owner' OR private.is_org_owner(organization_id)));

DROP POLICY IF EXISTS memberships_delete ON public.memberships;
CREATE POLICY memberships_delete ON public.memberships FOR DELETE TO authenticated
  USING (is_org_admin_or_owner(organization_id)
         AND (role <> 'owner' OR private.is_org_owner(organization_id)));

-- ── C1: any org owner could create a network and enroll any dealership ───
DROP POLICY IF EXISTS oem_networks_insert ON public.oem_networks;
CREATE POLICY oem_networks_insert ON public.oem_networks FOR INSERT TO authenticated
  WITH CHECK (private.caller_is_oem() AND EXISTS (SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid() AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true AND m.role IN ('owner','admin')));

DROP POLICY IF EXISTS oem_networks_update ON public.oem_networks;
CREATE POLICY oem_networks_update ON public.oem_networks FOR UPDATE TO authenticated
  USING (private.caller_is_oem() AND EXISTS (SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid() AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true AND m.role IN ('owner','admin')))
  WITH CHECK (private.caller_is_oem() AND EXISTS (SELECT 1 FROM memberships m
    WHERE m.user_id = auth.uid() AND m.organization_id = oem_networks.owner_org_id
      AND m.is_active = true AND m.role IN ('owner','admin')));

DROP POLICY IF EXISTS dnm_insert ON public.dealer_network_memberships;
CREATE POLICY dnm_insert ON public.dealer_network_memberships FOR INSERT TO authenticated
  WITH CHECK (private.caller_is_oem() AND private.user_is_admin_of_network_owner(network_id));

DROP POLICY IF EXISTS dnm_update ON public.dealer_network_memberships;
CREATE POLICY dnm_update ON public.dealer_network_memberships FOR UPDATE TO authenticated
  USING (private.caller_is_oem() AND private.user_is_admin_of_network_owner(network_id))
  WITH CHECK (private.caller_is_oem() AND private.user_is_admin_of_network_owner(network_id));

CREATE OR REPLACE FUNCTION public.user_can_access_assessment_as_oem(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT private.caller_is_oem() AND EXISTS (
    SELECT 1 FROM dealer_network_memberships dnm
    JOIN oem_networks n ON n.id = dnm.network_id
    JOIN memberships m ON m.organization_id = n.owner_org_id
    WHERE dnm.dealership_id = _dealership_id AND dnm.is_active = true
      AND n.status = 'active' AND m.user_id = auth.uid() AND m.is_active = true);
$$;

CREATE OR REPLACE FUNCTION public.user_can_access_dealership_as_oem(_dealership_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.user_can_access_assessment_as_oem(_dealership_id);
$$;

-- ── C2: policies trusted self-writable profiles.active_* ─────────────────
CREATE OR REPLACE FUNCTION private.caller_oem_org_id()
RETURNS uuid LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.active_organization_id FROM profiles p
  WHERE p.user_id = auth.uid()
    AND EXISTS (SELECT 1 FROM memberships m WHERE m.user_id = auth.uid()
                  AND m.organization_id = p.active_organization_id AND m.is_active = true);
$$;

DROP POLICY IF EXISTS coach_notes_dealer_read ON public.coach_notes;
CREATE POLICY coach_notes_dealer_read ON public.coach_notes FOR SELECT TO authenticated
  USING (private.is_active_member_of_dealership(dealership_id));

DROP POLICY IF EXISTS coach_visits_dealer_select ON public.coach_visits;
CREATE POLICY coach_visits_dealer_select ON public.coach_visits FOR SELECT TO authenticated
  USING (private.is_active_member_of_dealership(dealership_id));

DROP POLICY IF EXISTS coach_visits_dealer_update ON public.coach_visits;
CREATE POLICY coach_visits_dealer_update ON public.coach_visits FOR UPDATE TO authenticated
  USING (private.is_active_member_of_dealership(dealership_id))
  WITH CHECK (private.is_active_member_of_dealership(dealership_id)
              AND status IN ('confirmed','cancelled','counter_proposed'));

DROP POLICY IF EXISTS coach_visits_oem_select ON public.coach_visits;
CREATE POLICY coach_visits_oem_select ON public.coach_visits FOR SELECT TO authenticated
  USING (public.user_can_access_dealership_as_oem(dealership_id));

-- ── C10: coach_visits writable for any dealership; reviews unbound ───────
DROP POLICY IF EXISTS coach_visits_coach_all ON public.coach_visits;
CREATE POLICY coach_visits_coach_all ON public.coach_visits FOR ALL TO authenticated
  USING (coach_user_id = auth.uid())
  WITH CHECK (coach_user_id = auth.uid() AND EXISTS (SELECT 1 FROM coach_dealership_assignments c
    WHERE c.coach_user_id = auth.uid() AND c.dealership_id = coach_visits.dealership_id AND c.is_active = true));

DROP POLICY IF EXISTS visit_action_reviews_coach_write ON public.visit_action_reviews;
CREATE POLICY visit_action_reviews_coach_write ON public.visit_action_reviews FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM coach_visits v WHERE v.id = visit_action_reviews.visit_id AND v.coach_user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM coach_visits v
    JOIN improvement_actions ia ON ia.id = visit_action_reviews.action_id
    JOIN assessments a ON a.id = ia.assessment_id
    WHERE v.id = visit_action_reviews.visit_id AND v.coach_user_id = auth.uid()
      AND a.dealership_id = v.dealership_id));

CREATE OR REPLACE FUNCTION private.sync_action_status_from_review()
RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  NEW.updated_at := now();
  UPDATE public.improvement_actions ia
     SET status = CASE NEW.outcome WHEN 'done' THEN 'Completed' ELSE 'In Progress' END
   WHERE ia.id = NEW.action_id
     AND NEW.outcome IN ('done', 'in_progress')
     AND ia.status IS DISTINCT FROM CASE NEW.outcome WHEN 'done' THEN 'Completed' ELSE 'In Progress' END
     AND EXISTS (SELECT 1 FROM public.coach_visits v JOIN public.assessments a ON a.dealership_id = v.dealership_id
                 WHERE v.id = NEW.visit_id AND a.id = ia.assessment_id);
  RETURN NEW;
END;
$$;

-- ── C15: live-only policy let plain members self-assign as coach ─────────
DROP POLICY IF EXISTS "Privileged users manage coach assignments" ON public.coach_dealership_assignments;

-- ── C5: members could mint owner invites directly ────────────────────────
DROP POLICY IF EXISTS dealership_invites_insert ON public.dealership_invites;
CREATE POLICY dealership_invites_insert ON public.dealership_invites FOR INSERT TO authenticated
  WITH CHECK (is_org_admin_or_owner(organization_id)
              AND (membership_role <> 'owner' OR private.is_org_owner(organization_id))
              AND EXISTS (SELECT 1 FROM dealerships d WHERE d.id = dealership_invites.dealership_id
                            AND d.organization_id = dealership_invites.organization_id));

-- ── C8: assessments / KPI values not bound to caller's tenant ────────────
DROP POLICY IF EXISTS assessments_insert ON public.assessments;
CREATE POLICY assessments_insert ON public.assessments FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id
    AND (dealership_id IS NULL OR private.is_active_member_of_dealership(dealership_id))
    AND (organization_id IS NULL OR private.is_active_member_of_org(organization_id)));

DROP POLICY IF EXISTS assessments_update ON public.assessments;
CREATE POLICY assessments_update ON public.assessments FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id
    AND (dealership_id IS NULL OR private.is_active_member_of_dealership(dealership_id))
    AND (organization_id IS NULL OR private.is_active_member_of_org(organization_id)));

DROP POLICY IF EXISTS kpi_values_insert ON public.assessment_kpi_values;
CREATE POLICY kpi_values_insert ON public.assessment_kpi_values FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_kpi_values.assessment_id
    AND a.user_id = auth.uid() AND a.dealership_id IS NOT DISTINCT FROM assessment_kpi_values.dealership_id));

DROP POLICY IF EXISTS kpi_values_update ON public.assessment_kpi_values;
CREATE POLICY kpi_values_update ON public.assessment_kpi_values FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_kpi_values.assessment_id AND a.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM assessments a WHERE a.id = assessment_kpi_values.assessment_id
    AND a.user_id = auth.uid() AND a.dealership_id IS NOT DISTINCT FROM assessment_kpi_values.dealership_id));

-- ── C11 / C16: action writes bound to the assessment's tenant; org re-derived on every update ──
DROP POLICY IF EXISTS improvement_actions_insert ON public.improvement_actions;
CREATE POLICY improvement_actions_insert ON public.improvement_actions FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id AND private.can_write_assessment_actions(assessment_id));

DROP POLICY IF EXISTS improvement_actions_update ON public.improvement_actions;
CREATE POLICY improvement_actions_update ON public.improvement_actions FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND private.can_write_assessment_actions(assessment_id));

DROP TRIGGER IF EXISTS trg_improvement_actions_sync_org ON public.improvement_actions;
CREATE TRIGGER trg_improvement_actions_sync_org
  BEFORE INSERT OR UPDATE OF assessment_id, organization_id ON public.improvement_actions
  FOR EACH ROW EXECUTE FUNCTION public.sync_improvement_action_org();

-- ── C12: comments on any action ──────────────────────────────────────────
DROP POLICY IF EXISTS action_comments_insert ON public.action_comments;
CREATE POLICY action_comments_insert ON public.action_comments FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (
    SELECT 1 FROM improvement_actions ia JOIN assessments a ON a.id = ia.assessment_id
    WHERE ia.id = action_comments.action_id AND private.can_write_assessment_actions(a.id)));

-- ── C4: GDPR export returned other members' assessments ──────────────────
CREATE OR REPLACE FUNCTION public.export_user_data(_user_id uuid)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF (SELECT auth.uid()) IS NULL OR _user_id IS DISTINCT FROM (SELECT auth.uid()) THEN
    RAISE EXCEPTION 'Access denied' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN jsonb_build_object(
    'profile', (SELECT to_jsonb(p.*) FROM profiles p WHERE p.user_id = _user_id),
    'memberships', COALESCE((SELECT jsonb_agg(to_jsonb(m.*)) FROM memberships m WHERE m.user_id = _user_id), '[]'::jsonb),
    'organizations', COALESCE((SELECT jsonb_agg(to_jsonb(o.*)) FROM organizations o
        JOIN memberships m ON o.id = m.organization_id WHERE m.user_id = _user_id AND m.is_active), '[]'::jsonb),
    'dealerships', COALESCE((SELECT jsonb_agg(to_jsonb(d.*)) FROM dealerships d
        JOIN memberships m ON d.organization_id = m.organization_id WHERE m.user_id = _user_id AND m.is_active), '[]'::jsonb),
    'assessments', COALESCE((SELECT jsonb_agg(to_jsonb(a.*)) FROM assessments a WHERE a.user_id = _user_id), '[]'::jsonb),
    'exported_at', to_jsonb(now()));
END;
$$;
