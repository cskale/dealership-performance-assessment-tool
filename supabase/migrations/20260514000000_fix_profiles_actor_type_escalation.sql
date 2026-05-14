-- Fix: profiles UPDATE policy had no WITH CHECK clause, allowing any user
-- to self-escalate actor_type to 'oem'/'coach'/'internal' via direct client call.
-- actor_type must be immutable via client; changes only via SECURITY DEFINER functions.

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id
  AND actor_type IS NOT DISTINCT FROM (
    SELECT actor_type FROM public.profiles
    WHERE user_id = auth.uid()
  )
);
