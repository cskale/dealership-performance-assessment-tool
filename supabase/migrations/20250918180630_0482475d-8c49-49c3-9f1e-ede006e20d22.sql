-- Create organizations table for multi-tenancy
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  settings JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create memberships table for RBAC
CREATE TYPE public.membership_role AS ENUM ('owner', 'admin', 'manager', 'analyst', 'viewer');

CREATE TABLE public.memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role membership_role NOT NULL DEFAULT 'viewer',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, organization_id)
);

-- Create user sessions table for session management
CREATE TABLE public.user_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT NOT NULL,
  device_info JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  first_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_seen TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN DEFAULT true
);

-- Update profiles table for GDPR and additional fields
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT,
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS last_sign_in_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS active_organization_id UUID REFERENCES public.organizations(id),
ADD COLUMN IF NOT EXISTS consent_analytics BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS consent_marketing BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS gdpr_consented_at TIMESTAMP WITH TIME ZONE;

-- Enable RLS on new tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS policies for organizations
CREATE POLICY "Users can view organizations they are members of"
  ON public.organizations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = organizations.id 
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Organization owners can update their organizations"
  ON public.organizations FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = organizations.id 
      AND m.user_id = auth.uid()
      AND m.role = 'owner'
      AND m.is_active = true
    )
  );

-- RLS policies for memberships
CREATE POLICY "Users can view memberships in their organizations"
  ON public.memberships FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = memberships.organization_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
      AND m.is_active = true
    )
  );

CREATE POLICY "Users can create memberships if they are owners/admins"
  ON public.memberships FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = memberships.organization_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
      AND m.is_active = true
    )
  );

-- RLS policies for user sessions
CREATE POLICY "Users can view their own sessions"
  ON public.user_sessions FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own sessions"
  ON public.user_sessions FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own sessions"
  ON public.user_sessions FOR UPDATE
  USING (user_id = auth.uid());

-- Update RLS policies for existing tables to include organization scoping
DROP POLICY IF EXISTS "Users can view their own dealerships" ON public.dealerships;
DROP POLICY IF EXISTS "Users can create their own dealerships" ON public.dealerships;
DROP POLICY IF EXISTS "Users can update their own dealerships" ON public.dealerships;
DROP POLICY IF EXISTS "Users can delete their own dealerships" ON public.dealerships;

-- Add organization_id to existing tables
ALTER TABLE public.dealerships 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.assessments 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

ALTER TABLE public.improvement_actions 
ADD COLUMN IF NOT EXISTS organization_id UUID REFERENCES public.organizations(id);

-- New RLS policies for dealerships with org scoping
CREATE POLICY "Users can view dealerships in their active organization"
  ON public.dealerships FOR SELECT
  USING (
    organization_id = (
      SELECT active_organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = dealerships.organization_id 
      AND m.user_id = auth.uid()
      AND m.is_active = true
    )
  );

CREATE POLICY "Users can create dealerships in their active organization"
  ON public.dealerships FOR INSERT
  WITH CHECK (
    user_id = auth.uid() AND
    organization_id = (
      SELECT active_organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = dealerships.organization_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'manager')
      AND m.is_active = true
    )
  );

CREATE POLICY "Users can update dealerships in their active organization"
  ON public.dealerships FOR UPDATE
  USING (
    organization_id = (
      SELECT active_organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = dealerships.organization_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin', 'manager')
      AND m.is_active = true
    )
  );

CREATE POLICY "Users can delete dealerships in their active organization"
  ON public.dealerships FOR DELETE
  USING (
    organization_id = (
      SELECT active_organization_id FROM public.profiles 
      WHERE user_id = auth.uid()
    )
    AND EXISTS (
      SELECT 1 FROM public.memberships m 
      WHERE m.organization_id = dealerships.organization_id 
      AND m.user_id = auth.uid()
      AND m.role IN ('owner', 'admin')
      AND m.is_active = true
    )
  );

-- Create function to auto-create organization on first login
CREATE OR REPLACE FUNCTION public.create_default_organization()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  org_id UUID;
  user_email TEXT;
  org_name TEXT;
  org_slug TEXT;
BEGIN
  -- Get user email
  user_email := NEW.email;
  
  -- Create default org name and slug
  org_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(user_email, '@', 1)) || '''s Organization';
  org_slug := lower(regexp_replace(org_name, '[^a-zA-Z0-9]', '-', 'g'));
  
  -- Ensure unique slug
  WHILE EXISTS(SELECT 1 FROM organizations WHERE slug = org_slug) LOOP
    org_slug := org_slug || '-' || floor(random() * 1000)::text;
  END LOOP;
  
  -- Create organization
  INSERT INTO public.organizations (name, slug)
  VALUES (org_name, org_slug)
  RETURNING id INTO org_id;
  
  -- Create membership as owner
  INSERT INTO public.memberships (user_id, organization_id, role, is_active)
  VALUES (NEW.id, org_id, 'owner', true);
  
  -- Update profile with active organization
  UPDATE public.profiles 
  SET active_organization_id = org_id
  WHERE user_id = NEW.id;
  
  RETURN NEW;
END;
$$;

-- Update the existing handle_new_user function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, display_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating organizations
CREATE OR REPLACE TRIGGER on_auth_user_create_org
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.create_default_organization();

-- Add triggers for updated_at
CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_memberships_updated_at
  BEFORE UPDATE ON public.memberships
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Create function for GDPR data export
CREATE OR REPLACE FUNCTION public.export_user_data(_user_id UUID)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_data JSONB := '{}'::jsonb;
  profile_data JSONB;
  memberships_data JSONB;
  organizations_data JSONB;
  dealerships_data JSONB;
  assessments_data JSONB;
BEGIN
  -- Only allow users to export their own data
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Get profile data
  SELECT to_jsonb(p.*) INTO profile_data 
  FROM profiles p WHERE p.user_id = _user_id;
  
  -- Get memberships data
  SELECT jsonb_agg(to_jsonb(m.*)) INTO memberships_data 
  FROM memberships m WHERE m.user_id = _user_id;
  
  -- Get organizations where user is a member
  SELECT jsonb_agg(to_jsonb(o.*)) INTO organizations_data 
  FROM organizations o 
  JOIN memberships m ON o.id = m.organization_id 
  WHERE m.user_id = _user_id;
  
  -- Get dealerships in user's organizations
  SELECT jsonb_agg(to_jsonb(d.*)) INTO dealerships_data 
  FROM dealerships d 
  JOIN memberships m ON d.organization_id = m.organization_id 
  WHERE m.user_id = _user_id;
  
  -- Get assessments in user's organizations
  SELECT jsonb_agg(to_jsonb(a.*)) INTO assessments_data 
  FROM assessments a 
  JOIN memberships m ON a.organization_id = m.organization_id 
  WHERE m.user_id = _user_id;
  
  -- Build final data structure
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

-- Create function for GDPR account deletion
CREATE OR REPLACE FUNCTION public.delete_user_account(_user_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only allow users to delete their own account
  IF _user_id != auth.uid() THEN
    RAISE EXCEPTION 'Access denied';
  END IF;
  
  -- Delete user data (cascading deletes will handle related records)
  DELETE FROM auth.users WHERE id = _user_id;
  
  RETURN true;
END;
$$;