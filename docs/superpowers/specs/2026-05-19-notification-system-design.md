# Notification System — Full Build Design

**Date:** 2026-05-19  
**Scope:** Complete the notification infrastructure across dealer, coach, and OEM roles  
**Approach:** Two sequential sprints — Sprint A (quick wins, visible value) → Sprint B (template polish, tokenised links)

---

## Context

The notification backend is largely built. What exists:

| Piece | Status |
|---|---|
| `notifications` table + RLS | Done |
| `notification_preferences` table + RLS | Done |
| `notify-dispatcher` Edge Function (Resend + preference check) | Done |
| `process_stale_actions()` + pg_cron daily 08:00 UTC | Done |
| `send_weekly_digests()` + pg_cron Monday 07:00 UTC | Done |
| `stale_nudge_sent_at` / `last_status_updated_at` on `improvement_actions` | Done |
| `NotificationBell.tsx` with Realtime subscription | Done |
| `notifications.ts` utility library | Done |
| Notification preferences UI (Account → Notifications tab) | Done |
| `coach_notes` table + RLS (coach/dealer/OEM visibility) | Done |

**Gaps this design closes:**

| Gap | Sprint |
|---|---|
| `app.settings.service_role_key` not set → cron emails silently skipped | A |
| No trigger on `coach_notes` INSERT → no notification fired (#78) | A |
| Bell navigation only wired for `improvement_action` type | A |
| No Coach Notes panel on dealer dashboard | A |
| Email templates are raw HTML strings — unmaintainable at scale | B |
| No tokenised email reply links (#72) | B |

---

## Sprint A

### 1. Email dispatch config (5-minute fix)

Run once in Supabase Studio SQL editor:

```sql
ALTER DATABASE postgres
  SET "app.settings.service_role_key" = '<service-role-key>';
```

This unblocks both existing cron jobs from dispatching emails via `net.http_post` to `notify-dispatcher`. No code change required.

**Verification:** After setting, manually call `SELECT public.trigger_stale_action_check();` (already exists as a coach/OEM-gated RPC) and confirm an email is dispatched via Resend logs.

---

### 2. Coach comment notification trigger (#78)

**New migration:** `20260519100000_coach_comment_notification_trigger.sql`

```sql
CREATE OR REPLACE FUNCTION public.notify_on_coach_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_rec  RECORD;
  org_id      UUID;
  note_preview TEXT;
BEGIN
  -- Resolve org from dealership
  SELECT organization_id INTO org_id
  FROM dealerships
  WHERE id = NEW.dealership_id;

  RETURN NEW IF org_id IS NULL;

  note_preview := left(NEW.note_text, 120);

  -- Notify all active owner/admin members of the dealership org
  FOR member_rec IN
    SELECT user_id
    FROM memberships
    WHERE organization_id = org_id
      AND is_active = true
      AND role IN ('owner', 'admin')
  LOOP
    INSERT INTO notifications
      (user_id, organization_id, type, channel, entity_type, entity_id, title, body)
    VALUES
      (member_rec.user_id, org_id,
       'coach_comment', 'in_app',
       'coach_note', NEW.id,
       'New coach note added',
       note_preview);
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_coach_note_notification
  AFTER INSERT ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_coach_comment();
```

**Scope:** In-app only. Email for coach comments is intentionally excluded — batched daily digest is sufficient and avoids notification fatigue. Email expansion can be added later via `notification_preferences` if user demand warrants it.

**RLS note:** Function is `SECURITY DEFINER` in `public` schema — follows same pattern as `process_stale_actions()`. No RLS recursion risk (no join back to `notifications` in the policy).

---

### 3. Bell notification navigation

**File:** [src/components/NotificationBell.tsx](src/components/NotificationBell.tsx)

Extend `handleMarkRead` routing logic:

```ts
const handleMarkRead = async (n: Notification) => {
  await markNotificationRead(n.id);
  setNotifications(prev => prev.filter(x => x.id !== n.id));
  setOpen(false);

  if (n.entity_type === 'improvement_action') {
    navigate('/app/actions');
  } else if (n.entity_type === 'coach_note') {
    // If the note is linked to an action, go to action plan
    // Otherwise go to dashboard Coach Notes panel
    const { data } = await supabase
      .from('coach_notes')
      .select('action_id')
      .eq('id', n.entity_id)
      .maybeSingle();
    navigate(data?.action_id ? '/app/actions' : '/app/dashboard');
  } else {
    // digest, milestone, stale_action without entity
    navigate('/app/actions');
  }
};
```

The dashboard navigation scrolls to `#coach-notes` anchor via `navigate('/app/dashboard#coach-notes')` — the Coach Notes panel registers this anchor via `id="coach-notes"` on its container.

---

### 4. Coach Notes panel (dealer dashboard)

**New file:** `src/components/CoachNotesPanel.tsx`

**Visibility rules:**
- Renders only when `actorType === 'dealer'`
- Hidden when no notes exist for the active dealership
- Read-only (dealers cannot edit or delete coach notes)

**Data:** Query `coach_notes` where `dealership_id = activeDealershipId`, ordered `created_at DESC`, limit 10. Join to `profiles` for coach display name.

**UI structure:**
```
Coach Notes                           [See all →]
─────────────────────────────────────────────────
[Coach avatar] Coach Name · 2h ago
  Note text preview (truncated to 2 lines)
  [Action: Fix follow-up process]  ← badge if action_id set

[Coach avatar] Coach Name · 3d ago
  Note text preview...
```

Badge links directly to `/app/actions` when `action_id` is present.

**Placement:** Below the score gauge on the dealer dashboard, above the action plan summary card. Only visible to `actor_type = 'dealer'`.

---

## Sprint B

### 5. React Email template refactor

**New folder:** `supabase/functions/_templates/`

**Files:**

```
_templates/
  BaseEmail.tsx          — shared wrapper: header (blue bar + logo), footer (unsubscribe text)
  StaleActionEmail.tsx   — overdue action nudge with priority badge + days overdue
  WeeklyDigestEmail.tsx  — open/overdue counts + top 3 action table + CTA button
  MilestoneEmail.tsx     — completion % milestone reached + reassess CTA
  CoachCommentEmail.tsx  — reserved for future email expansion of #78
```

**Deno import in `notify-dispatcher`:**
```ts
import { render } from 'https://esm.sh/@react-email/render@0.0.10'
import { StaleActionEmail } from '../_templates/StaleActionEmail.tsx'
```

**Migration path:** Delete `buildNotificationEmailHtml()` and `buildDigestEmailHtml()` from `notify-dispatcher/index.ts`. Replace with `render(<TemplateComponent {...typedProps} />)`. All existing Resend call sites remain unchanged — only the `html:` argument changes.

**Typed props per template — example:**
```ts
// StaleActionEmail.tsx
interface StaleActionEmailProps {
  actionTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysStale: number;
  actionsUrl: string;
}
```

No string interpolation. TypeScript catches missing variables at build time (via `deno check`).

---

### 6. Tokenised email reply links (#72)

**DB migration:** `20260519120000_action_token_nonce.sql`

```sql
ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS token_nonce TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS token_expires_at TIMESTAMPTZ;
```

**Token generation (in `notify-dispatcher`):**

When sending a stale action nudge email, generate a signed token:

```ts
const payload = { action_id, user_id, exp: Math.floor(Date.now()/1000) + 72*3600 };
const token = await signHMAC(payload, Deno.env.get('SUPABASE_JWT_SECRET')!);
// Store nonce in improvement_actions
await supabaseAdmin.from('improvement_actions')
  .update({ token_nonce: token, token_expires_at: new Date(Date.now() + 72*3600*1000) })
  .eq('id', action_id);
```

**Email buttons (in `StaleActionEmail.tsx`):**
- `[Mark In Progress]` → `{SITE_URL}/api/action-update?token=xxx&status=in_progress`
- `[Mark Complete]` → `{SITE_URL}/api/action-update?token=xxx&status=completed`
- `[View in app →]` → `/app/actions` (requires login, no token)

**New Edge Function:** `supabase/functions/action-token-update/index.ts`

- Public endpoint — no `Authorization` header required
- Validates HMAC signature against `SUPABASE_JWT_SECRET`
- Checks `token_expires_at > now()`
- Checks `token_nonce` still exists on the row (single-use: cleared after use)
- Updates `improvement_actions.status`
- Nulls out `token_nonce` + `token_expires_at` (consumed)
- Returns a plain HTML confirmation page: "Action marked [status]. [View your action plan →]"
- On invalid/expired token: returns HTML error page — no stack traces exposed

**Security:** HMAC-SHA256, single-use nonce, 72h expiry. No session cookie required. Token grants update rights to exactly one action row for exactly one status transition.

---

## Cross-cutting concerns

### Unsubscribe
Existing email footers already say "Manage preferences in Account Settings." No one-click unsubscribe link is added in this sprint — GDPR transactional email exemption applies for operational notifications (action status, coach notes). Review after first mid-market pilot if required.

### Notification types check constraint
`notifications.type` CHECK constraint already includes `'coach_comment'`. No migration needed for the trigger.

### Actor-scoped behaviour
| Actor | Receives |
|---|---|
| Dealer (owner/admin) | stale_action nudges, weekly digest, milestone alerts, coach_comment in-app |
| Coach | stale_action nudges for their assigned dealers' actions (future: scope cron by coach assignment) |
| OEM | weekly digest (future: network-level digest variant) |

Coach and OEM digest scoping is noted as future — current cron sends to all org members, which is correct for dealer orgs. Coach and OEM orgs have no `improvement_actions` rows so the digest cron naturally skips them.

---

## Files changed

### Sprint A
| File | Change |
|---|---|
| Supabase Studio (SQL editor) | Set `app.settings.service_role_key` |
| `supabase/migrations/20260519100000_coach_comment_notification_trigger.sql` | New |
| [src/components/NotificationBell.tsx](src/components/NotificationBell.tsx) | Extend navigation routing |
| `src/components/CoachNotesPanel.tsx` | New |
| Dealer dashboard page | Mount `CoachNotesPanel` |

### Sprint B
| File | Change |
|---|---|
| `supabase/functions/_templates/BaseEmail.tsx` | New |
| `supabase/functions/_templates/StaleActionEmail.tsx` | New |
| `supabase/functions/_templates/WeeklyDigestEmail.tsx` | New |
| `supabase/functions/_templates/MilestoneEmail.tsx` | New |
| `supabase/functions/_templates/CoachCommentEmail.tsx` | New (reserved) |
| `supabase/functions/notify-dispatcher/index.ts` | Replace raw HTML builders with React Email render |
| `supabase/migrations/20260519120000_action_token_nonce.sql` | New |
| `supabase/functions/action-token-update/index.ts` | New Edge Function |

---

## Out of scope for these sprints
- #75 Google Reviews monitoring alert (depends on #76)
- #76 Google Reviews integration (needs `google_place_id` per dealership)
- OEM or coach-specific digest variants (current cron correctly skips non-dealer orgs)
- One-click email unsubscribe endpoint
- Push notifications (web push API — future phase)
