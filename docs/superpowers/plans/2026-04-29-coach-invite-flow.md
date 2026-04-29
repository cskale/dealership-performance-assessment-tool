# Coach Invite Flow — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let org owners invite external coaches by email; coaches accept via the existing `/invite/:token` page, get a `coach_dealership_assignments` row created, and land on their coach dashboard.

**Architecture:** Reuse `dealership_invites` table and `send-invite` Edge Function with a new `invite_type` column. The `accept_dealership_invite` SQL function branches on `invite_type` — dealer path unchanged, coach path creates an assignment row instead of a membership. A new `InviteCoach` component mirrors `InviteTeamMembers` and lives in Account → Team tab. One additive RLS policy on `assessments` grants coaches read access to their assigned dealerships' data.

**Tech Stack:** Supabase MCP (migrations, type generation), React 18, TypeScript, Vitest, `@testing-library/react`, Deno Edge Functions (Resend email)

---

## File Map

| Action | Path | What changes |
|--------|------|-------------|
| Create via MCP | `supabase/migrations/20260429100000_coach_invite_flow.sql` | `invite_type` column, assessments RLS, updated accept function |
| Regenerate | `src/integrations/supabase/types.ts` | New `invite_type` field in `dealership_invites` types |
| Modify | `supabase/functions/send-invite/index.ts` | Accept `invite_type` param, branch email copy |
| Modify | `src/pages/AcceptInvite.tsx` | Read `invite_type` from RPC response, redirect coach → `/app/coach-dashboard` |
| Create | `src/__tests__/acceptInvite.test.tsx` | Tests for redirect behaviour |
| Create | `src/components/InviteCoach.tsx` | New invite-coach card component |
| Modify | `src/pages/Account.tsx` | Add `<InviteCoach />` below `<InviteTeamMembers />` |

---

## Task 1 — DB migration: invite_type column + assessments RLS + updated accept function

**Files:**
- Create via MCP: `supabase/migrations/20260429100000_coach_invite_flow.sql`

### Background
Three DB changes in one migration:
1. Add `invite_type text NOT NULL DEFAULT 'dealer'` to `dealership_invites` — existing rows silently default to `'dealer'`, no data migration needed.
2. Add an additive SELECT policy on `assessments` so coaches can read assessments for their assigned dealerships (current policy only allows `user_id = auth.uid()`).
3. Replace `accept_dealership_invite` with a version that branches on `invite_type`.

- [ ] **Step 1: Apply the migration via Supabase MCP**

Call `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `coach_invite_flow`
- `query`: the full SQL below

```sql
-- ── 1. invite_type column ──────────────────────────────────────────────────
ALTER TABLE public.dealership_invites
ADD COLUMN IF NOT EXISTS invite_type text NOT NULL DEFAULT 'dealer'
  CHECK (invite_type IN ('dealer', 'coach'));

-- ── 2. Coaches can read assessments for their assigned dealerships ──────────
DROP POLICY IF EXISTS "Coaches can view assessments for assigned dealerships"
  ON public.assessments;

CREATE POLICY "Coaches can view assessments for assigned dealerships"
ON public.assessments FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.coach_dealership_assignments cda
    WHERE cda.coach_user_id = auth.uid()
      AND cda.dealership_id = assessments.dealership_id
      AND cda.is_active = true
  )
);

-- ── 3. Updated accept_dealership_invite ────────────────────────────────────
CREATE OR REPLACE FUNCTION public.accept_dealership_invite(p_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_invite   dealership_invites%ROWTYPE;
  v_user_id  uuid := auth.uid();
  v_email    text;
  v_deal_org uuid;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN jsonb_build_object('success', false, 'error', 'not_authenticated');
  END IF;

  SELECT * INTO v_invite
  FROM dealership_invites
  WHERE token = p_token
  FOR UPDATE;

  IF NOT FOUND THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_not_found');
  END IF;

  IF v_invite.status = 'accepted' THEN
    RETURN jsonb_build_object('success', false, 'error', 'already_accepted');
  END IF;
  IF v_invite.status IN ('revoked', 'expired') THEN
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;
  IF v_invite.expires_at <= now() THEN
    UPDATE dealership_invites SET status = 'expired' WHERE id = v_invite.id;
    RETURN jsonb_build_object('success', false, 'error', 'invite_invalid_or_expired');
  END IF;

  SELECT lower(email) INTO v_email FROM auth.users WHERE id = v_user_id;
  IF v_email != v_invite.invited_email THEN
    RETURN jsonb_build_object('success', false, 'error', 'email_mismatch');
  END IF;

  SELECT organization_id INTO v_deal_org
  FROM dealerships WHERE id = v_invite.dealership_id;
  IF v_deal_org IS DISTINCT FROM v_invite.organization_id THEN
    RETURN jsonb_build_object('success', false, 'error', 'data_integrity_error');
  END IF;

  IF v_invite.invite_type = 'coach' THEN
    -- Coach path: create assignment row, set actor_type = 'coach'.
    -- Use WHERE NOT EXISTS to be safe if no unique constraint exists.
    INSERT INTO coach_dealership_assignments (coach_user_id, dealership_id, is_active)
    SELECT v_user_id, v_invite.dealership_id, true
    WHERE NOT EXISTS (
      SELECT 1 FROM coach_dealership_assignments
      WHERE coach_user_id = v_user_id
        AND dealership_id = v_invite.dealership_id
    );

    -- Only update actor_type if not already 'coach' (second-dealership invite case).
    UPDATE profiles
    SET actor_type = 'coach'
    WHERE user_id = v_user_id
      AND (actor_type IS NULL OR actor_type != 'coach');

  ELSE
    -- Dealer path: unchanged behaviour.
    INSERT INTO memberships (user_id, organization_id, role, is_active)
    VALUES (v_user_id, v_invite.organization_id, v_invite.membership_role, true)
    ON CONFLICT (user_id, organization_id) DO NOTHING;

    UPDATE profiles
    SET
      active_organization_id = v_invite.organization_id,
      active_dealership_id   = v_invite.dealership_id,
      actor_type             = 'dealer'
    WHERE user_id = v_user_id;
  END IF;

  UPDATE dealership_invites
  SET
    status      = 'accepted',
    accepted_by = v_user_id,
    accepted_at = now()
  WHERE id = v_invite.id;

  RETURN jsonb_build_object(
    'success',         true,
    'invite_type',     v_invite.invite_type,
    'organization_id', v_invite.organization_id,
    'dealership_id',   v_invite.dealership_id,
    'role',            v_invite.membership_role
  );
END;
$$;
```

- [ ] **Step 2: Confirm migration applied**

Check MCP response for `success: true`. If you see "column already exists", it applied cleanly (the `ADD COLUMN IF NOT EXISTS` is idempotent).

- [ ] **Step 3: Write the migration SQL to a local file**

```bash
# Already written by the MCP tool — verify it exists:
ls supabase/migrations/ | grep coach_invite
```

If not created automatically, write the exact SQL from Step 1 to `supabase/migrations/20260429100000_coach_invite_flow.sql`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/20260429100000_coach_invite_flow.sql
git commit -m "feat(db): add invite_type to dealership_invites, coach assessment RLS, update accept function"
```

---

## Task 2 — Regenerate TypeScript types

**Files:**
- Modify: `src/integrations/supabase/types.ts`

### Background
The `invite_type` column added in Task 1 is not yet in the TypeScript types. `InviteCoach.tsx` will filter on this column — without regenerating, TypeScript will error.

- [ ] **Step 1: Regenerate types via Supabase MCP**

Call `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id: "xrypgosuyfdkkqafftae"`. The tool returns the full TypeScript type definitions as a string.

- [ ] **Step 2: Write the output to the types file**

Write the returned content exactly to `src/integrations/supabase/types.ts`. Do not hand-edit this file.

- [ ] **Step 3: Verify the new field is present**

```bash
grep "invite_type" src/integrations/supabase/types.ts
```

Expected output includes lines like:
```
invite_type: string
invite_type?: string
```

- [ ] **Step 4: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 5: Commit**

```bash
git add src/integrations/supabase/types.ts
git commit -m "chore: regenerate supabase types after invite_type column"
```

---

## Task 3 — Update send-invite Edge Function

**Files:**
- Modify: `supabase/functions/send-invite/index.ts`

### Background
The Edge Function needs to accept `invite_type: 'coach' | 'dealer'` in the request body, store it in the `dealership_invites` insert, and branch the email subject/body/CTA for coach invites. All existing callers omit `invite_type` and default to `'dealer'` — no breaking change.

- [ ] **Step 1: Replace `supabase/functions/send-invite/index.ts` with the updated version**

```typescript
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://dealership-performance-assessment-t.vercel.app',
  'https://dealership-performance-assessment-tool.lovable.app',
  'https://dealership-performance-assessment-tool-cskales-projects.vercel.app',
  'https://775c0250-c831-4186-9520-28df4d940ca2.lovableproject.com',
  'http://localhost:8080',
  'http://localhost:3000',
];

function getCorsHeaders(origin: string) {
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin': allowedOrigin,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Vary': 'Origin',
  };
}

function buildInviteEmailHtml(
  dealershipName: string,
  inviterName: string,
  inviteUrl: string,
  role: string,
  inviteType: 'dealer' | 'coach' = 'dealer'
): string {
  const isCoach = inviteType === 'coach';
  const heading = isCoach
    ? `You've been invited as a coach`
    : `You've been invited!`;
  const bodyText = isCoach
    ? `<strong>${inviterName}</strong> has invited you to coach <strong>${dealershipName}</strong> on the Dealer Diagnostic platform.`
    : `<strong>${inviterName}</strong> has invited you to join <strong>${dealershipName}</strong> as a <strong>${role}</strong>.`;
  const ctaText = isCoach ? 'Accept Coach Invitation' : 'Accept Invitation';

  return `<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><title>${heading}</title></head><body style="margin:0;padding:0;background-color:#ffffff;font-family:'Roboto',Arial,sans-serif;"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:40px 20px;"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;"><tr><td style="background-color:#0052CC;border-radius:12px 12px 0 0;padding:32px 40px;text-align:center;"><h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:700;">Dealership Performance Assessment</h1></td></tr><tr><td style="background-color:#f8f9fa;padding:40px;border-left:1px solid #e0e0e0;border-right:1px solid #e0e0e0;"><h2 style="margin:0 0 16px;color:#172B4D;font-size:20px;font-weight:600;">${heading}</h2><p style="margin:0 0 24px;color:#44546F;font-size:15px;line-height:1.6;">${bodyText}</p><table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;"><tr><td style="background-color:#0052CC;border-radius:8px;"><a href="${inviteUrl}" target="_blank" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:600;text-decoration:none;">${ctaText}</a></td></tr></table></td></tr><tr><td style="background-color:#f0f1f3;border-radius:0 0 12px 12px;padding:24px 40px;text-align:center;border:1px solid #e0e0e0;"><p style="margin:0;color:#8993A4;font-size:12px;">This invitation expires in 7 days. If you didn't expect this, ignore this email.</p></td></tr></table></td></tr></table></body></html>`;
}

serve(async (req) => {
  const origin = req.headers.get('Origin') || '';
  const corsHeaders = getCorsHeaders(origin);

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const contentLength = req.headers.get('content-length');
  if (contentLength && parseInt(contentLength) > 50000) {
    return new Response(JSON.stringify({ error: 'Request payload too large' }), {
      status: 413, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let body: {
      invited_email?: string;
      dealership_id?: string;
      organization_id?: string;
      role?: string;
      invite_type?: string;
    };
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid JSON payload' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { invited_email, dealership_id, organization_id, role } = body;
    // Validate and default invite_type — any unknown value falls back to 'dealer'
    const inviteType: 'dealer' | 'coach' =
      body.invite_type === 'coach' ? 'coach' : 'dealer';

    const normalizedEmail = invited_email?.toLowerCase()?.trim();

    if (!normalizedEmail || !dealership_id || !organization_id) {
      return new Response(JSON.stringify({ error: 'Missing required fields' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail) || normalizedEmail.length > 255) {
      return new Response(JSON.stringify({ error: 'Invalid email address' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { data: membership } = await supabaseAdmin
      .from('memberships')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .single();
    if (!membership || !['owner', 'admin'].includes(membership.role)) {
      return new Response(JSON.stringify({ error: 'Insufficient permissions' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // For coach invites, membership_role is 'viewer' (required column, unused in coach accept path)
    const validRoles = ['owner', 'admin', 'member', 'viewer'];
    const inviteRole = inviteType === 'coach'
      ? 'viewer'
      : (role && validRoles.includes(role) ? role : 'viewer');

    const { data: existingInvite } = await supabaseAdmin
      .from('dealership_invites')
      .select('id, token')
      .eq('dealership_id', dealership_id)
      .eq('invited_email', normalizedEmail)
      .eq('invite_type', inviteType)
      .eq('status', 'pending')
      .maybeSingle();

    let inviteToken: string;
    if (existingInvite) {
      await supabaseAdmin
        .from('dealership_invites')
        .update({ expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() })
        .eq('id', existingInvite.id);
      inviteToken = existingInvite.token;
    } else {
      const { data: newInvite, error: insertError } = await supabaseAdmin
        .from('dealership_invites')
        .insert({
          dealership_id,
          organization_id,
          invited_email: normalizedEmail,
          invited_by: user.id,
          membership_role: inviteRole,
          invite_type: inviteType,
        })
        .select('token')
        .single();
      if (insertError) {
        console.error('Invite insert failed:', insertError.message);
        return new Response(JSON.stringify({ error: 'Failed to create invitation. Please try again.' }), {
          status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      inviteToken = newInvite.token;
    }

    const siteUrl = Deno.env.get('SITE_URL') || 'https://dealership-performance-assessment-tool.lovable.app';
    const inviteUrl = `${siteUrl}/invite/${inviteToken}`;

    let emailSent = false;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    if (resendApiKey) {
      try {
        const [dealershipRes, profileRes] = await Promise.all([
          supabaseAdmin.from('dealerships').select('name').eq('id', dealership_id).single(),
          supabaseAdmin.from('profiles').select('display_name, full_name').eq('user_id', user.id).single(),
        ]);
        const dealershipName = dealershipRes.data?.name || 'your dealership';
        const inviterName = profileRes.data?.display_name || profileRes.data?.full_name || user.email || 'A team member';
        const roleLabel = inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1);

        const subjectLine = inviteType === 'coach'
          ? `You've been invited as a coach for ${dealershipName}`
          : `You're invited to join ${dealershipName}`;

        const resendRes = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: 'Dealership Assessment <invites@notify.performance-assessment.com>',
            to: [normalizedEmail],
            subject: subjectLine,
            html: buildInviteEmailHtml(dealershipName, inviterName, inviteUrl, roleLabel, inviteType),
          }),
        });
        if (resendRes.ok) emailSent = true;
      } catch (e) {
        console.error('Email error:', e);
      }
    }

    return new Response(JSON.stringify({ success: true, invite_url: inviteUrl, email_sent: emailSent }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/send-invite/index.ts
git commit -m "feat(edge): support invite_type='coach' in send-invite function"
```

---

## Task 4 — AcceptInvite.tsx redirect update (TDD)

**Files:**
- Create: `src/__tests__/acceptInvite.test.tsx`
- Modify: `src/pages/AcceptInvite.tsx`

### Background
After a successful invite acceptance, `AcceptInvite.tsx` currently always navigates to `/app/assessment`. The RPC now returns `invite_type` in its response. Coach invites should redirect to `/app/coach-dashboard` instead. Tests cover all four scenarios.

- [ ] **Step 1: Write the failing tests**

Create `src/__tests__/acceptInvite.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock hooks before importing the component
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'u1', email: 'coach@test.com' },
    loading: false,
    signOut: vi.fn(),
    session: null,
  })),
}));

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: mockRpc },
}));

import AcceptInvite from '@/pages/AcceptInvite';

function renderAcceptInvite(token = 'tok-abc') {
  return render(
    <MemoryRouter initialEntries={[`/invite/${token}`]}>
      <Routes>
        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="/app/assessment" element={<div data-testid="assessment" />} />
        <Route path="/app/coach-dashboard" element={<div data-testid="coach-dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AcceptInvite redirect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    mockRpc.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('redirects to /app/assessment for a dealer invite', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, invite_type: 'dealer' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() => expect(screen.getByText("You're in!")).toBeInTheDocument());
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.getByTestId('assessment')).toBeInTheDocument());
  });

  it('redirects to /app/coach-dashboard for a coach invite', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, invite_type: 'coach' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() => expect(screen.getByText("You're in!")).toBeInTheDocument());
    vi.advanceTimersByTime(2000);
    await waitFor(() => expect(screen.getByTestId('coach-dashboard')).toBeInTheDocument());
  });

  it('shows error state for an expired token', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false, error: 'invite_invalid_or_expired' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() =>
      expect(screen.getByText(/expired or been revoked/i)).toBeInTheDocument()
    );
  });

  it('shows error state for an already accepted token', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false, error: 'already_accepted' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() =>
      expect(screen.getByText(/already been used/i)).toBeInTheDocument()
    );
  });
});
```

- [ ] **Step 2: Run tests — confirm they fail**

```bash
npx vitest run src/__tests__/acceptInvite.test.tsx
```

Expected: tests 1 and 2 fail (both redirect to `/app/assessment`, so test 2 can't find `coach-dashboard`). Tests 3 and 4 may pass already.

- [ ] **Step 3: Update `src/pages/AcceptInvite.tsx` — change only the redirect line**

Find the `acceptInvite` function. The current success block is:

```ts
localStorage.removeItem('pending_invite_token');
setState('success');
setTimeout(() => navigate('/app/assessment', { replace: true }), 1800);
```

Replace it with:

```ts
localStorage.removeItem('pending_invite_token');
setState('success');
const inviteType = (result as { success: boolean; error?: string; invite_type?: string } | null)?.invite_type;
const destination = inviteType === 'coach' ? '/app/coach-dashboard' : '/app/assessment';
setTimeout(() => navigate(destination, { replace: true }), 1800);
```

No other changes to this file.

- [ ] **Step 4: Run tests — confirm all pass**

```bash
npx vitest run src/__tests__/acceptInvite.test.tsx
```

Expected: 4/4 pass.

- [ ] **Step 5: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass, zero regressions.

- [ ] **Step 6: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 7: Commit**

```bash
git add src/pages/AcceptInvite.tsx src/__tests__/acceptInvite.test.tsx
git commit -m "feat(invite): redirect coach invites to coach-dashboard after acceptance"
```

---

## Task 5 — InviteCoach.tsx component

**Files:**
- Create: `src/components/InviteCoach.tsx`

### Background
This component is a close sibling of `InviteTeamMembers.tsx`. Key differences: no role selector; sends `invite_type: 'coach'`; shows a dealership picker when the org has more than one dealership; filters the pending invites list to `invite_type = 'coach'`; badge label is "Coach". Renders `null` for non-owner/admin users.

- [ ] **Step 1: Create `src/components/InviteCoach.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Loader2, Send, UserCheck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dealership {
  id: string;
  name: string;
}

interface PendingCoachInvite {
  id: string;
  invited_email: string;
  expires_at: string;
  token: string;
}

export function InviteCoach() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const [email, setEmail] = useState('');
  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingCoachInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const canInvite = currentMembership && ['owner', 'admin'].includes(currentMembership.role);

  // Fetch this org's dealerships for the picker
  useEffect(() => {
    if (!currentOrganization) return;
    supabase
      .from('dealerships')
      .select('id, name')
      .eq('organization_id', currentOrganization.id)
      .then(({ data }) => {
        if (!data) return;
        setDealerships(data);
        // Auto-select when there is only one dealership
        if (data.length === 1) setSelectedDealershipId(data[0].id);
      });
  }, [currentOrganization]);

  const loadPendingInvites = useCallback(async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data } = await supabase
        .from('dealership_invites')
        .select('id, invited_email, expires_at, token')
        .eq('organization_id', currentOrganization.id)
        .eq('invite_type', 'coach')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      setPendingInvites((data as PendingCoachInvite[]) ?? []);
    } finally {
      setLoadingInvites(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (canInvite && currentOrganization) loadPendingInvites();
  }, [canInvite, currentOrganization, loadPendingInvites]);

  // Resolve which dealership to invite to: picker selection or profile's active_dealership_id
  const resolveDealershipId = async (): Promise<string | null> => {
    if (selectedDealershipId) return selectedDealershipId;
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('active_dealership_id')
      .eq('user_id', user.id)
      .maybeSingle();
    return data?.active_dealership_id ?? null;
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrganization || !user) return;

    const dealershipId = await resolveDealershipId();
    if (!dealershipId) {
      toast.error('Select a dealership before sending a coach invite');
      return;
    }

    setIsSubmitting(true);
    setInviteUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invited_email: email.trim().toLowerCase(),
          dealership_id: dealershipId,
          organization_id: currentOrganization.id,
          invite_type: 'coach',
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to send coach invite');
        return;
      }

      setInviteUrl(data.invite_url);
      if (data.email_sent) {
        toast.success(`Coach invitation sent to ${email.trim().toLowerCase()}`);
      } else {
        toast.warning('Invite created but email could not be sent — copy the link below to share manually.');
      }
      setEmail('');
      loadPendingInvites();
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    const { error } = await supabase
      .from('dealership_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId);
    if (error) { toast.error('Failed to revoke invite'); return; }
    toast.success('Coach invite revoked');
    loadPendingInvites();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  // Only owners and admins can invite coaches
  if (!canInvite) return null;

  const needsDealershipPicker = dealerships.length > 1;
  const submitDisabled =
    isSubmitting ||
    !email.trim() ||
    (needsDealershipPicker && !selectedDealershipId);

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Invite a Coach
        </CardTitle>
        <CardDescription>
          Coaches can view assessments and action plans for assigned dealerships without joining your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSendInvite} className="space-y-4">
          {needsDealershipPicker && (
            <div className="space-y-2">
              <Label>Assign to dealership</Label>
              <Select
                value={selectedDealershipId ?? ''}
                onValueChange={setSelectedDealershipId}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dealership…" />
                </SelectTrigger>
                <SelectContent>
                  {dealerships.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coach-invite-email">Coach email address</Label>
            <Input
              id="coach-invite-email"
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <Button type="submit" disabled={submitDisabled}>
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send Coach Invitation</>}
          </Button>
        </form>

        {inviteUrl && (
          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <Input value={inviteUrl} readOnly className="text-xs bg-background" />
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(inviteUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Pending coach invites</h4>
            {pendingInvites.map(invite => {
              const isExpired = new Date(invite.expires_at) <= new Date();
              return (
                <div
                  key={invite.id}
                  className={cn(
                    'flex items-center justify-between border rounded-lg p-3',
                    isExpired && 'opacity-50'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Coach</Badge>
                      {isExpired
                        ? <Badge variant="destructive" className="text-xs">Expired</Badge>
                        : <span className="text-xs text-muted-foreground">
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRevoke(invite.id)}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 2: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors. If you see `Property 'invite_type' does not exist on type`, Task 2 (type regeneration) was not completed first — go back and regenerate types.

- [ ] **Step 3: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 4: Commit**

```bash
git add src/components/InviteCoach.tsx
git commit -m "feat(ui): add InviteCoach component"
```

---

## Task 6 — Wire InviteCoach into Account.tsx

**Files:**
- Modify: `src/pages/Account.tsx`

### Background
`InviteCoach` renders `null` for non-admin users, so it is safe to unconditionally add it below `InviteTeamMembers` inside the existing `canManageTeam` guard. No conditional wrapper needed.

- [ ] **Step 1: Add the import**

Find this line in `src/pages/Account.tsx`:

```ts
import { InviteTeamMembers } from '@/components/InviteTeamMembers';
```

Add the new import directly below it:

```ts
import { InviteCoach } from '@/components/InviteCoach';
```

- [ ] **Step 2: Add the component below InviteTeamMembers**

Find this block (around line 444):

```tsx
<TabsContent value="team">
  {canManageTeam && (
    <InviteTeamMembers />
  )}
</TabsContent>
```

Replace it with:

```tsx
<TabsContent value="team">
  {canManageTeam && (
    <div className="space-y-6">
      <InviteTeamMembers />
      <InviteCoach />
    </div>
  )}
</TabsContent>
```

- [ ] **Step 3: TypeScript check**

```bash
npx tsc --noEmit
```

Expected: zero errors.

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass.

- [ ] **Step 5: Commit and push**

```bash
git add src/pages/Account.tsx
git commit -m "feat(account): add InviteCoach to team settings tab"
git push origin main
```

---

## Post-implementation verification

- [ ] In Supabase Studio: confirm `dealership_invites` has an `invite_type` column defaulting to `'dealer'`
- [ ] In Supabase Studio: confirm the policy "Coaches can view assessments for assigned dealerships" appears on the `assessments` table
- [ ] In the app: log in as an org owner → Account → Team tab → confirm "Invite a Coach" card appears below "Invite Team Members"
- [ ] Send a coach invite to a test email → confirm the invite URL works → accept it → confirm redirect to `/app/coach-dashboard`
- [ ] Query `coach_dealership_assignments` in Supabase Studio → confirm the new row was created on acceptance
- [ ] Query `profiles` for the coach user → confirm `actor_type = 'coach'`

---

## Out of scope

- OEM-admin-initiated coach invites — no OEM admin UI exists yet; when built, it calls `send-invite` with `invite_type: 'coach'` and selects from network dealerships
- Coach assignment management UI — no UI to view or revoke assignments from the dealer side; future Account settings extension
- `improvement_actions` / `actions` table RLS for coaches — `CoachActions.tsx` reads from a legacy table; separate task
