-- Fix 1: Correct column reference in can_access_project (cda.coach_id → cda.coach_user_id)
CREATE OR REPLACE FUNCTION public.can_access_project(_project_id uuid)
 RETURNS boolean
 LANGUAGE plpgsql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  IF (SELECT auth.uid()) IS NULL THEN
    RAISE EXCEPTION 'Not authenticated' USING ERRCODE = 'insufficient_privilege';
  END IF;
  RETURN EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.memberships m ON m.organization_id = p.sponsor_organization_id
    WHERE p.id = _project_id
      AND m.user_id = (SELECT auth.uid())
      AND m.is_active = true
  )
  OR EXISTS (
    SELECT 1 FROM public.project_outlets po
    JOIN public.coach_dealership_assignments cda ON cda.dealership_id = po.outlet_id
    WHERE po.project_id = _project_id
      AND cda.coach_user_id = (SELECT auth.uid())
      AND cda.is_active = true
      AND (cda.valid_from IS NULL OR now() >= cda.valid_from)
      AND (cda.valid_to IS NULL OR now() <= cda.valid_to)
  );
END;
$function$;

-- Fix 2: Scope organization-logos storage policies to caller's org membership
DROP POLICY IF EXISTS "Authenticated users can upload organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can update organization logos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can delete organization logos" ON storage.objects;

CREATE POLICY "Members can upload their org logos"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner','admin')
      AND (storage.foldername(name))[1] = m.organization_id::text
  )
);

CREATE POLICY "Members can update their org logos"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner','admin')
      AND (storage.foldername(name))[1] = m.organization_id::text
  )
)
WITH CHECK (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner','admin')
      AND (storage.foldername(name))[1] = m.organization_id::text
  )
);

CREATE POLICY "Members can delete their org logos"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'organization-logos'
  AND EXISTS (
    SELECT 1 FROM public.memberships m
    WHERE m.user_id = auth.uid()
      AND m.is_active = true
      AND m.role IN ('owner','admin')
      AND (storage.foldername(name))[1] = m.organization_id::text
  )
);