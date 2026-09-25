-- Follow-up to the 2026-09-25 security audit.

-- Coach-invite bug: the actor_type guard raised on every change, including the
-- SECURITY DEFINER accept_dealership_invite path. Run the guard as the caller so
-- only direct client writes (current_user = authenticated/anon) are blocked;
-- trusted definer functions and service_role pass.
CREATE OR REPLACE FUNCTION public.prevent_actor_type_self_edit()
RETURNS trigger LANGUAGE plpgsql SECURITY INVOKER SET search_path = public AS $$
BEGIN
  IF NEW.actor_type IS NOT DISTINCT FROM OLD.actor_type THEN
    RETURN NEW;
  END IF;
  IF current_user IN ('authenticated', 'anon') THEN
    RAISE EXCEPTION 'actor_type cannot be changed directly. Use the admin API.'
      USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN NEW;
END;
$$;

-- toggle_oem_mode lets any org owner become OEM. With the guard above no longer
-- blocking definer paths it would re-open OEM self-enrolment, so remove access.
REVOKE EXECUTE ON FUNCTION public.toggle_oem_mode(boolean) FROM PUBLIC, anon, authenticated;

-- anon never writes directly; RLS was the only barrier.
REVOKE INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA public REVOKE INSERT, UPDATE, DELETE ON TABLES FROM anon;

-- Logo bucket: raster images only (no SVG), 2 MB, matching the client check.
UPDATE storage.buckets
   SET allowed_mime_types = ARRAY['image/png','image/jpeg','image/webp','image/gif'],
       file_size_limit = 2097152
 WHERE id = 'organization-logos';

-- Legacy duplicates of org_logos_admin_* / org_logos_owner_delete.
DROP POLICY IF EXISTS "Members can upload their org logos" ON storage.objects;
DROP POLICY IF EXISTS "Members can update their org logos" ON storage.objects;
DROP POLICY IF EXISTS "Members can delete their org logos" ON storage.objects;

-- get_dealership_details returned any dealership id to any verified OEM;
-- scope it to the caller's own networks.
CREATE OR REPLACE FUNCTION public.get_dealership_details(p_ids uuid[])
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
BEGIN
  IF auth.uid() IS NULL OR NOT private.caller_is_verified_oem() THEN
    RETURN '[]'::jsonb;
  END IF;
  RETURN COALESCE((
    SELECT jsonb_agg(jsonb_build_object('id', d.id, 'name', d.name, 'location', d.location))
    FROM dealerships d
    WHERE d.id = ANY(p_ids)
      AND EXISTS (SELECT 1 FROM dealer_network_memberships dnm
                  JOIN oem_networks n ON n.id = dnm.network_id
                  WHERE dnm.dealership_id = d.id
                    AND n.owner_org_id = private.caller_oem_org_id())
  ), '[]'::jsonb);
END;
$$;
