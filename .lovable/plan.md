

# Implement Resend Email Delivery in send-invite Edge Function

The `RESEND_API_KEY` secret is confirmed available. Here's the implementation plan.

## Changes

### 1. `supabase/functions/send-invite/index.ts`
After the invite record is created/extended (existing logic stays), add a Resend API call:

- Fetch dealership name from `dealerships` table and inviter display name from `profiles` table
- Call `https://api.resend.com/emails` with a branded HTML email:
  - **From:** `Dealership Assessment <invites@notify.performance-assessment.com>`
  - **Subject:** `You're invited to join [Dealership Name]`
  - **Body:** Branded HTML with Atlassian Blue (`#0052CC`) header, Roboto font, "Accept Invitation" CTA button, 7-day expiry notice
  - White email body background per best practices
- If Resend call fails, the invite is still created — return `email_sent: false` so the admin can fall back to copying the link
- On success, return `email_sent: true`

### 2. `src/components/InviteTeamMembers.tsx`
- Change button label: "Send Invite" → "Send Invitation Email"
- On success when `email_sent: true`: show green toast "Invitation email sent to {email}"
- On success when `email_sent: false`: show warning toast "Invite created but email could not be sent" and display copy-link fallback
- Resend button tooltip: "Resend invitation email"
- Keep copy-link as secondary fallback action

### 3. Deploy
Deploy the updated edge function via `supabase--deploy_edge_functions`.

## Files Changed

| File | Change |
|---|---|
| `supabase/functions/send-invite/index.ts` | Add Resend API call + HTML email template |
| `src/components/InviteTeamMembers.tsx` | Update labels and success feedback |

