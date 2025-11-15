-- Create role enum
CREATE TYPE public.app_role AS ENUM ('coach', 'dealer');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  UNIQUE(user_id, role, dealer_id)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's dealer_id
CREATE OR REPLACE FUNCTION public.get_user_dealer_id(_user_id UUID)
RETURNS UUID
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT dealer_id
  FROM public.user_roles
  WHERE user_id = _user_id
    AND role = 'dealer'
  LIMIT 1
$$;

-- Create actions table
CREATE TABLE public.actions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id UUID REFERENCES dealerships(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'open',
  due_date DATE,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  CONSTRAINT valid_status CHECK (status IN ('open', 'in_progress', 'completed'))
);

ALTER TABLE public.actions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
ON public.user_roles FOR SELECT
USING (user_id = auth.uid());

CREATE POLICY "Coaches can manage all roles"
ON public.user_roles FOR ALL
USING (public.has_role(auth.uid(), 'coach'));

-- RLS Policies for actions
CREATE POLICY "Dealers can view their own actions"
ON public.actions FOR SELECT
USING (
  dealer_id = public.get_user_dealer_id(auth.uid())
  OR public.has_role(auth.uid(), 'coach')
);

CREATE POLICY "Dealers can create actions for their dealership"
ON public.actions FOR INSERT
WITH CHECK (
  dealer_id = public.get_user_dealer_id(auth.uid())
  OR public.has_role(auth.uid(), 'coach')
);

CREATE POLICY "Dealers can update their own actions"
ON public.actions FOR UPDATE
USING (
  dealer_id = public.get_user_dealer_id(auth.uid())
  OR public.has_role(auth.uid(), 'coach')
);

CREATE POLICY "Coaches can delete any action"
ON public.actions FOR DELETE
USING (public.has_role(auth.uid(), 'coach'));

-- Add trigger for updated_at
CREATE TRIGGER update_actions_updated_at
BEFORE UPDATE ON public.actions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();