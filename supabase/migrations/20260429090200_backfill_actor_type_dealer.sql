-- Backfill actor_type = 'dealer' for all existing users who have no actor_type set.
-- Users who registered before the invite-acceptance fix (29 Apr 2026) were never
-- assigned an actor_type. Setting them to 'dealer' is the safe default — coach and
-- OEM actor_types are provisioned separately by org owners.
UPDATE public.profiles
SET actor_type = 'dealer'
WHERE actor_type IS NULL;
