-- Protect dealership contact information by moving it to a separate table with stricter access control
-- This prevents organization viewers from harvesting sensitive contact information

-- Create separate table for sensitive dealership contact information
CREATE TABLE public.dealership_contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealership_id UUID REFERENCES public.dealerships(id) ON DELETE CASCADE NOT NULL UNIQUE,
  contact_email TEXT,
  phone TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on the new table
ALTER TABLE public.dealership_contacts ENABLE ROW LEVEL SECURITY;

-- Migrate existing contact data to new table
INSERT INTO public.dealership_contacts (dealership_id, contact_email, phone)
SELECT id, contact_email, phone 
FROM public.dealerships 
WHERE contact_email IS NOT NULL OR phone IS NOT NULL;

-- Create RLS policy: Only owners, admins, and managers can view contact information
CREATE POLICY "Only privileged users can view dealership contacts"
ON public.dealership_contacts FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.dealerships d ON d.organization_id = m.organization_id
    WHERE d.id = dealership_contacts.dealership_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'manager')
    AND m.is_active = true
  )
);

-- Allow privileged users to insert contact information
CREATE POLICY "Only privileged users can create dealership contacts"
ON public.dealership_contacts FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.dealerships d ON d.organization_id = m.organization_id
    WHERE d.id = dealership_contacts.dealership_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'manager')
    AND m.is_active = true
  )
);

-- Allow privileged users to update contact information
CREATE POLICY "Only privileged users can update dealership contacts"
ON public.dealership_contacts FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.dealerships d ON d.organization_id = m.organization_id
    WHERE d.id = dealership_contacts.dealership_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'manager')
    AND m.is_active = true
  )
);

-- Allow privileged users to delete contact information
CREATE POLICY "Only privileged users can delete dealership contacts"
ON public.dealership_contacts FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.memberships m
    JOIN public.dealerships d ON d.organization_id = m.organization_id
    WHERE d.id = dealership_contacts.dealership_id
    AND m.user_id = auth.uid()
    AND m.role IN ('owner', 'admin', 'manager')
    AND m.is_active = true
  )
);

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_dealership_contacts_updated_at
BEFORE UPDATE ON public.dealership_contacts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Remove contact columns from dealerships table (they're now in the protected table)
ALTER TABLE public.dealerships DROP COLUMN IF EXISTS contact_email;
ALTER TABLE public.dealerships DROP COLUMN IF EXISTS phone;