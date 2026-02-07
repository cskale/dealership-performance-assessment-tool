-- Add active_dealership_id to profiles table for persistent dealership selection
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS active_dealership_id UUID REFERENCES public.dealerships(id) ON DELETE SET NULL;

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_active_dealership_id ON public.profiles(active_dealership_id);

-- Update existing profiles policy to allow updating active_dealership_id
-- No need - existing "Users can update their own profile" policy already covers this