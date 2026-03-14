/**
 * SECURITY BOUNDARY — DO NOT USE THE SUPABASE SERVICE ROLE KEY IN CLIENT CODE.
 *
 * The following operations must only be called via Supabase Edge Functions:
 *   - generateActions()      → /functions/v1/generate-actions  (implemented)
 *   - createInvite()         → /functions/v1/create-invite      (pending)
 *   - deleteAccount()        → /functions/v1/delete-account     (pending)
 *   - writeAssessmentScore() → /functions/v1/score-assessment   (pending)
 *
 * The client-side anon key is intentionally public per Supabase's security model.
 * It is safe when Row Level Security (RLS) policies are correctly configured.
 */
export const ADMIN_OPERATIONS_NOTE =
  'All privileged ops must go through Edge Functions. See comments above.';
