
-- ========================================
-- MIGRATION: Organization Schema Extension
-- Idempotent + Production-Safe
-- ========================================

-- 1. ENUM TYPES (snake_case, precise)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_brand_mode') THEN
    CREATE TYPE enum_brand_mode AS ENUM ('single_brand', 'multi_brand');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_oem_authorization') THEN
    CREATE TYPE enum_oem_authorization AS ENUM ('authorized', 'independent');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_network_structure') THEN
    CREATE TYPE enum_network_structure AS ENUM ('single_outlet', 'multi_outlet_group');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_business_model') THEN
    CREATE TYPE enum_business_model AS ENUM ('sales_only', 'service_only', '2s', '3s', '4s');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_positioning') THEN
    CREATE TYPE enum_positioning AS ENUM ('mass_market', 'premium', 'luxury', 'super_luxury');
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enum_default_language') THEN
    CREATE TYPE enum_default_language AS ENUM ('en', 'de', 'fr', 'es', 'it');
  END IF;
END $$;

-- 2. ADD COLUMNS (safe, idempotent)
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS brand_mode enum_brand_mode,
  ADD COLUMN IF NOT EXISTS oem_authorization enum_oem_authorization,
  ADD COLUMN IF NOT EXISTS network_structure enum_network_structure,
  ADD COLUMN IF NOT EXISTS business_model enum_business_model,
  ADD COLUMN IF NOT EXISTS positioning enum_positioning,
  ADD COLUMN IF NOT EXISTS default_language enum_default_language DEFAULT 'en'::enum_default_language,
  ADD COLUMN IF NOT EXISTS country TEXT,
  ADD COLUMN IF NOT EXISTS city TEXT,
  ADD COLUMN IF NOT EXISTS logo_url TEXT,
  ADD COLUMN IF NOT EXISTS group_name TEXT;

-- 3. ARRAYS
ALTER TABLE public.organizations 
  ADD COLUMN IF NOT EXISTS oem_brands TEXT[],
  ADD COLUMN IF NOT EXISTS product_segments TEXT[],
  ADD COLUMN IF NOT EXISTS operational_focus TEXT[];

-- 4. UPDATE TRIGGER (organizations already has updated_at)
-- Just ensure trigger exists for auto-update
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'trigger_set_updated_at_organizations'
  ) THEN
    CREATE TRIGGER trigger_set_updated_at_organizations
      BEFORE UPDATE ON public.organizations
      FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

-- 5. SAFE DEFAULT (language only)
UPDATE public.organizations 
SET default_language = COALESCE(default_language, 'en'::enum_default_language)
WHERE default_language IS NULL;

-- 6. STORAGE BUCKET for organization logos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('organization-logos', 'organization-logos', true) 
ON CONFLICT (id) DO NOTHING;

-- 7. Storage policies for organization logos
CREATE POLICY "Organization logos are publicly accessible"
ON storage.objects FOR SELECT
USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can upload organization logos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can update organization logos"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'organization-logos');

CREATE POLICY "Authenticated users can delete organization logos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'organization-logos');
