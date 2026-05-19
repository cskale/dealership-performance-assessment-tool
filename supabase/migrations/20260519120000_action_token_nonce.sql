-- supabase/migrations/20260519120000_action_token_nonce.sql

ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS token_nonce       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS token_expires_at  TIMESTAMPTZ;

COMMENT ON COLUMN public.improvement_actions.token_nonce IS
  'Single-use HMAC token for one-click email status updates. Nulled after use.';
COMMENT ON COLUMN public.improvement_actions.token_expires_at IS
  'Expiry for token_nonce. Tokens valid for 72 hours from generation.';
