-- First, add user_id columns to tables that need them
ALTER TABLE public.dealerships ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.assessments ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;
ALTER TABLE public.improvement_actions ADD COLUMN user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Create profiles table for user management
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing overly permissive policies
DROP POLICY IF EXISTS "Dealerships are publicly accessible" ON public.dealerships;
DROP POLICY IF EXISTS "Assessments are publicly accessible" ON public.assessments;
DROP POLICY IF EXISTS "Improvement actions are publicly accessible" ON public.improvement_actions;

-- Create secure RLS policies for dealerships
CREATE POLICY "Users can view their own dealerships" 
ON public.dealerships FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dealerships" 
ON public.dealerships FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dealerships" 
ON public.dealerships FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dealerships" 
ON public.dealerships FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for assessments
CREATE POLICY "Users can view their own assessments" 
ON public.assessments FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own assessments" 
ON public.assessments FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own assessments" 
ON public.assessments FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own assessments" 
ON public.assessments FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for improvement actions
CREATE POLICY "Users can view their own improvement actions" 
ON public.improvement_actions FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own improvement actions" 
ON public.improvement_actions FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own improvement actions" 
ON public.improvement_actions FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own improvement actions" 
ON public.improvement_actions FOR DELETE 
USING (auth.uid() = user_id);

-- Create secure RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger for automatic profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Add triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();