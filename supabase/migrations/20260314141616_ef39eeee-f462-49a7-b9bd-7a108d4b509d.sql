
-- Fix 1: Restrict over-permissive actions table RLS policies
DROP POLICY IF EXISTS "Authenticated users can view all actions" ON actions;
DROP POLICY IF EXISTS "Authenticated users can update actions" ON actions;
DROP POLICY IF EXISTS "Authenticated users can delete actions" ON actions;

CREATE POLICY "Users can view own dealer actions" ON actions FOR SELECT
  TO authenticated
  USING (dealer_id = public.get_user_dealer_id(auth.uid()) OR public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Users can update own dealer actions" ON actions FOR UPDATE
  TO authenticated
  USING (dealer_id = public.get_user_dealer_id(auth.uid()) OR public.has_role(auth.uid(), 'coach'));

CREATE POLICY "Users can delete own actions" ON actions FOR DELETE
  TO authenticated
  USING (auth.uid() = created_by OR public.has_role(auth.uid(), 'coach'));

-- Fix 2: Patch SECURITY DEFINER NULL bypass in delete_user_account
CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  DELETE FROM auth.users WHERE id = _user_id;
  RETURN true;
END;
$$;

-- Fix 3: Patch SECURITY DEFINER NULL bypass in export_user_data
CREATE OR REPLACE FUNCTION public.export_user_data(_user_id uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  user_data JSONB := '{}'::jsonb;
  profile_data JSONB;
  memberships_data JSONB;
  organizations_data JSONB;
  dealerships_data JSONB;
  assessments_data JSONB;
BEGIN
  IF auth.uid() IS NULL OR _user_id IS DISTINCT FROM auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;

  SELECT to_jsonb(p.*) INTO profile_data
  FROM profiles p WHERE p.user_id = _user_id;

  SELECT jsonb_agg(to_jsonb(m.*)) INTO memberships_data
  FROM memberships m WHERE m.user_id = _user_id;

  SELECT jsonb_agg(to_jsonb(o.*)) INTO organizations_data
  FROM organizations o
  JOIN memberships m ON o.id = m.organization_id
  WHERE m.user_id = _user_id;

  SELECT jsonb_agg(to_jsonb(d.*)) INTO dealerships_data
  FROM dealerships d
  JOIN memberships m ON d.organization_id = m.organization_id
  WHERE m.user_id = _user_id;

  SELECT jsonb_agg(to_jsonb(a.*)) INTO assessments_data
  FROM assessments a
  JOIN memberships m ON a.organization_id = m.organization_id
  WHERE m.user_id = _user_id;

  user_data := jsonb_build_object(
    'profile', profile_data,
    'memberships', COALESCE(memberships_data, '[]'::jsonb),
    'organizations', COALESCE(organizations_data, '[]'::jsonb),
    'dealerships', COALESCE(dealerships_data, '[]'::jsonb),
    'assessments', COALESCE(assessments_data, '[]'::jsonb),
    'exported_at', to_jsonb(now())
  );

  RETURN user_data;
END;
$$;
