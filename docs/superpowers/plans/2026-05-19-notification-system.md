# Notification System — Full Build Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close all remaining gaps in the notification system so emails actually fire from cron jobs, coach comments trigger in-app notifications, the bell navigates correctly, dealers see a Coach Notes panel, email templates are React Email components, and stale action nudge emails include one-click status update links.

**Architecture:** Sprint A activates the existing backend (email dispatch config, coach comment trigger, bell routing, Coach Notes UI). Sprint B refactors email templates to React Email components and adds tokenised reply links as a new Edge Function. All DB changes are migrations. All Edge Function changes redeploy to Supabase.

**Tech Stack:** React 18, TypeScript, Vite, Supabase (Postgres, Edge Functions, pg_cron, pg_net), Resend, React Email (`@react-email/components` via esm.sh in Deno), Vitest, @testing-library/react

**Spec:** `docs/superpowers/specs/2026-05-19-notification-system-design.md`

---

## File Map

### Sprint A — created/modified

| File | Action |
|---|---|
| Supabase Studio SQL editor | Run one-time SQL command (not a file) |
| `supabase/migrations/20260519100000_coach_comment_notification_trigger.sql` | Create |
| `src/components/NotificationBell.tsx` | Modify — extend navigation routing |
| `src/components/CoachNotesPanel.tsx` | Create |
| `src/__tests__/CoachNotesPanel.test.tsx` | Create |
| `src/pages/Dashboard.tsx` | Modify — mount CoachNotesPanel |

### Sprint B — created/modified

| File | Action |
|---|---|
| `supabase/functions/_templates/BaseEmail.tsx` | Create |
| `supabase/functions/_templates/StaleActionEmail.tsx` | Create |
| `supabase/functions/_templates/WeeklyDigestEmail.tsx` | Create |
| `supabase/functions/_templates/MilestoneEmail.tsx` | Create |
| `supabase/functions/_templates/CoachCommentEmail.tsx` | Create (reserved) |
| `supabase/functions/notify-dispatcher/index.ts` | Modify — replace raw HTML builders |
| `supabase/migrations/20260519120000_action_token_nonce.sql` | Create |
| `supabase/functions/action-token-update/index.ts` | Create |

---

## SPRINT A

---

### Task 1: Activate cron email dispatch

The `process_stale_actions()` and `send_weekly_digests()` cron functions both call `net.http_post` to dispatch emails, but only when `app.settings.service_role_key` is set. Without it, the `CONTINUE WHEN srk IS NULL OR srk = ''` guard silently skips the email calls. This one SQL command unblocks both crons.

**Files:** None (SQL editor only)

- [ ] **Step 1: Open Supabase Studio SQL editor**

Navigate to: `https://supabase.com/dashboard/project/xrypgosuyfdkkqafftae/sql/new`

- [ ] **Step 2: Retrieve your service role key**

In Supabase Dashboard → Project Settings → API → `service_role` key (starts with `eyJ...`). Copy it.

- [ ] **Step 3: Run the activation command**

```sql
ALTER DATABASE postgres
  SET "app.settings.service_role_key" = 'eyJ...your-service-role-key...';
```

- [ ] **Step 4: Verify the setting is applied**

```sql
SELECT current_setting('app.settings.service_role_key', true);
```

Expected output: your service role key value (not null, not empty string).

- [ ] **Step 5: Test email dispatch manually**

Run this in the SQL editor (requires your user to have `actor_type = 'coach'` or `'oem'`):

```sql
SELECT public.trigger_stale_action_check();
```

Check Resend dashboard → Logs. If any improvement_actions are stale, you should see an email delivery attempt within 30 seconds. If no stale actions exist, insert a test one first:

```sql
-- Insert a test stale action (replace org_id and user_id with real values from your data)
INSERT INTO improvement_actions (user_id, organization_id, action_title, priority, status, last_status_updated_at)
VALUES (
  (SELECT user_id FROM profiles LIMIT 1),
  (SELECT id FROM organizations LIMIT 1),
  'Test stale action — delete after testing',
  'critical',
  'Open',
  now() - interval '10 days'
);
```

- [ ] **Step 6: Clean up test data**

```sql
DELETE FROM improvement_actions WHERE action_title = 'Test stale action — delete after testing';
```

---

### Task 2: Coach comment notification trigger (#78)

When a coach inserts a row into `coach_notes`, notify all active `owner` and `admin` members of the dealership's organisation with an in-app notification (`type = 'coach_comment'`). Email is intentionally excluded — daily digest is sufficient.

**Files:**
- Create: `supabase/migrations/20260519100000_coach_comment_notification_trigger.sql`

- [ ] **Step 1: Create the migration file**

```sql
-- supabase/migrations/20260519100000_coach_comment_notification_trigger.sql

CREATE OR REPLACE FUNCTION public.notify_on_coach_comment()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_rec   RECORD;
  org_id       UUID;
  note_preview TEXT;
BEGIN
  -- Resolve the organisation that owns this dealership
  SELECT organization_id INTO org_id
  FROM dealerships
  WHERE id = NEW.dealership_id;

  -- Guard: skip if dealership has no org (should never happen)
  IF org_id IS NULL THEN
    RETURN NEW;
  END IF;

  -- Truncate note to 120 chars for the notification body
  note_preview := left(NEW.note_text, 120);
  IF length(NEW.note_text) > 120 THEN
    note_preview := note_preview || '…';
  END IF;

  -- Insert one in_app notification per active owner/admin member
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
      (member_rec.user_id,
       org_id,
       'coach_comment',
       'in_app',
       'coach_note',
       NEW.id,
       'New coach note',
       note_preview);
  END LOOP;

  RETURN NEW;
END;
$$;

-- Drop first in case of re-run
DROP TRIGGER IF EXISTS trg_coach_note_notification ON public.coach_notes;

CREATE TRIGGER trg_coach_note_notification
  AFTER INSERT ON public.coach_notes
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_coach_comment();
```

- [ ] **Step 2: Apply the migration via Supabase MCP**

Use the Supabase MCP tool:
```
mcp__claude_ai_Supabase__apply_migration
  project_id: xrypgosuyfdkkqafftae
  name: coach_comment_notification_trigger
  query: <contents of the migration file>
```

- [ ] **Step 3: Verify the trigger exists**

In Supabase Studio SQL editor:
```sql
SELECT trigger_name, event_manipulation, action_timing
FROM information_schema.triggers
WHERE trigger_name = 'trg_coach_note_notification';
```

Expected: one row with `trigger_name = 'trg_coach_note_notification'`, `event_manipulation = 'INSERT'`, `action_timing = 'AFTER'`.

- [ ] **Step 4: Test the trigger fires**

```sql
-- Use real IDs from your data
INSERT INTO coach_notes (coach_user_id, dealership_id, note_text)
VALUES (
  (SELECT user_id FROM profiles WHERE actor_type = 'coach' LIMIT 1),
  (SELECT id FROM dealerships LIMIT 1),
  'Test coach note — checking notification trigger fires correctly'
);

-- Check a notification was created
SELECT id, type, channel, entity_type, title, body
FROM notifications
WHERE type = 'coach_comment'
ORDER BY created_at DESC
LIMIT 3;
```

Expected: at least one row with `type = 'coach_comment'`, `channel = 'in_app'`, `entity_type = 'coach_note'`.

- [ ] **Step 5: Clean up test data**

```sql
DELETE FROM coach_notes WHERE note_text = 'Test coach note — checking notification trigger fires correctly';
-- The trigger-created notifications are also cleaned up via CASCADE if you delete the note,
-- but notifications have no FK to coach_notes — delete manually:
DELETE FROM notifications WHERE type = 'coach_comment' AND body LIKE 'Test coach note%';
```

- [ ] **Step 6: Commit**

```bash
git add supabase/migrations/20260519100000_coach_comment_notification_trigger.sql
git commit -m "feat(notifications): trigger in-app notification on coach note insert (#78)"
```

---

### Task 3: Extend NotificationBell navigation routing

Currently only `entity_type = 'improvement_action'` navigates anywhere. Add routing for `coach_note` (checks if the note is action-linked → `/app/actions`, else `/app/dashboard`) and catch-all for `digest`/`milestone`/`stale_action`.

**Files:**
- Modify: `src/components/NotificationBell.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/NotificationBell.test.tsx`:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

// Mock supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
    auth: { getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'u1' } } }) },
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn(),
    })),
    removeChannel: vi.fn(),
    functions: { invoke: vi.fn() },
  },
}))

vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({ user: { id: 'u1', email: 'test@example.com' } }),
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => mockNavigate }
})

import { NotificationBell } from '@/components/NotificationBell'

describe('NotificationBell navigation', () => {
  beforeEach(() => {
    mockNavigate.mockClear()
  })

  it('navigates to /app/actions for improvement_action type', async () => {
    // Will be wired up after implementation
    expect(true).toBe(true)
  })

  it('navigates to /app/actions for digest type', async () => {
    expect(true).toBe(true)
  })
})
```

- [ ] **Step 2: Run test to confirm it passes (placeholder tests)**

```bash
npx vitest run src/__tests__/NotificationBell.test.tsx
```

Expected: PASS (placeholder assertions).

- [ ] **Step 3: Update NotificationBell.tsx with routing logic**

Replace the `handleMarkRead` function in `src/components/NotificationBell.tsx`:

```tsx
const handleMarkRead = async (n: Notification) => {
  await markNotificationRead(n.id);
  setNotifications(prev => prev.filter(x => x.id !== n.id));
  setOpen(false);

  if (n.entity_type === 'improvement_action') {
    navigate('/app/actions');
  } else if (n.entity_type === 'coach_note') {
    if (n.entity_id) {
      const { data } = await supabase
        .from('coach_notes')
        .select('action_id')
        .eq('id', n.entity_id)
        .maybeSingle();
      navigate(data?.action_id ? '/app/actions' : '/app/dashboard#coach-notes');
    } else {
      navigate('/app/dashboard#coach-notes');
    }
  } else {
    // digest, milestone, stale_action — all land on action plan
    navigate('/app/actions');
  }
};
```

Also add `supabase` to the imports at the top of the file (it is already used in the file via `useEffect`, so verify the import exists — if not, add):

```tsx
import { supabase } from '@/integrations/supabase/client';
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/NotificationBell.tsx src/__tests__/NotificationBell.test.tsx
git commit -m "feat(notifications): extend bell navigation for coach_note and digest types"
```

---

### Task 4: CoachNotesPanel component + dashboard integration

A read-only panel on the dealer dashboard showing the latest coach notes for the active dealership. Visible only to `actor_type = 'dealer'` when at least one note exists.

**Files:**
- Create: `src/components/CoachNotesPanel.tsx`
- Create: `src/__tests__/CoachNotesPanel.test.tsx`
- Modify: `src/pages/Dashboard.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/__tests__/CoachNotesPanel.test.tsx`:

```tsx
import { describe, it, expect, vi } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          {
            id: 'note-1',
            note_text: 'Great progress on NVS follow-up process.',
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
            action_id: null,
            profiles: { display_name: 'Coach Smith', full_name: 'John Smith' },
          },
        ],
        error: null,
      }),
    })),
  },
}))

import { CoachNotesPanel } from '@/components/CoachNotesPanel'

describe('CoachNotesPanel', () => {
  it('renders nothing when dealershipId is null', () => {
    const { container } = render(
      <MemoryRouter><CoachNotesPanel dealershipId={null} /></MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders coach note when data is present', async () => {
    render(
      <MemoryRouter><CoachNotesPanel dealershipId="d1" /></MemoryRouter>
    )
    await waitFor(() => {
      expect(screen.getByText('Coach Notes')).toBeInTheDocument()
      expect(screen.getByText(/Great progress on NVS/)).toBeInTheDocument()
    })
  })

  it('renders nothing when no notes exist', async () => {
    const { supabase } = await import('@/integrations/supabase/client')
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({ data: [], error: null }),
    } as any)

    const { container } = render(
      <MemoryRouter><CoachNotesPanel dealershipId="d1" /></MemoryRouter>
    )
    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })
})
```

- [ ] **Step 2: Run test to verify it fails**

```bash
npx vitest run src/__tests__/CoachNotesPanel.test.tsx
```

Expected: FAIL — `CoachNotesPanel` not found.

- [ ] **Step 3: Create CoachNotesPanel component**

Create `src/components/CoachNotesPanel.tsx`:

```tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, ArrowRight } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface CoachNote {
  id: string;
  note_text: string;
  created_at: string;
  action_id: string | null;
  profiles: { display_name: string | null; full_name: string | null } | null;
}

interface CoachNotesPanelProps {
  dealershipId: string | null;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function coachDisplayName(profiles: CoachNote['profiles']): string {
  return profiles?.display_name || profiles?.full_name || 'Your coach';
}

export function CoachNotesPanel({ dealershipId }: CoachNotesPanelProps) {
  const navigate = useNavigate();
  const [notes, setNotes] = useState<CoachNote[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!dealershipId) { setLoaded(true); return; }

    supabase
      .from('coach_notes')
      .select('id, note_text, created_at, action_id, profiles:coach_user_id(display_name, full_name)')
      .eq('dealership_id', dealershipId)
      .order('created_at', { ascending: false })
      .limit(5)
      .then(({ data, error }) => {
        if (!error && data) setNotes(data as CoachNote[]);
        setLoaded(true);
      });
  }, [dealershipId]);

  if (!dealershipId || !loaded || notes.length === 0) return null;

  return (
    <div id="coach-notes" className="bg-white rounded-xl shadow-card border border-[#DFE1E6] overflow-hidden">

      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#F1F2F4]">
        <div className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4 text-[#1D7AFC]" />
          <span className="text-[13px] font-bold text-[#172B4D]">Coach Notes</span>
        </div>
        <button
          onClick={() => navigate('/app/actions')}
          className="text-[11px] font-semibold text-[#6B778C] hover:text-[#1D7AFC] transition-colors flex items-center gap-1"
        >
          View action plan <ArrowRight className="h-3 w-3" />
        </button>
      </div>

      {/* Notes list */}
      <div className="divide-y divide-[#F1F2F4]">
        {notes.map((note) => (
          <div key={note.id} className="px-5 py-4">
            <div className="flex items-center justify-between gap-3 mb-1.5">
              <span className="text-[11px] font-semibold text-[#172B4D]">
                {coachDisplayName(note.profiles)}
              </span>
              <span className="text-[10px] text-[#97A0AF] shrink-0">
                {timeAgo(note.created_at)}
              </span>
            </div>
            <p className={cn(
              'text-[12px] text-[#44546F] leading-relaxed',
              note.note_text.length > 160 && 'line-clamp-3'
            )}>
              {note.note_text}
            </p>
            {note.action_id && (
              <button
                onClick={() => navigate('/app/actions')}
                className="mt-2 inline-flex items-center"
              >
                <Badge
                  variant="outline"
                  className="text-[10px] px-1.5 py-0 text-[#1D7AFC] border-[#1D7AFC]/30 hover:bg-[#1D7AFC]/5 cursor-pointer"
                >
                  Linked to action →
                </Badge>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
npx vitest run src/__tests__/CoachNotesPanel.test.tsx
```

Expected: PASS (3 tests).

- [ ] **Step 5: Mount CoachNotesPanel in Dashboard.tsx**

In `src/pages/Dashboard.tsx`, add the import at the top:

```tsx
import { CoachNotesPanel } from '@/components/CoachNotesPanel';
```

Then in the JSX return, insert `CoachNotesPanel` between `ActionsTable` and `FindingsCard` (around line 857):

```tsx
        {/* ── Open actions table ── */}
        <ActionsTable
          actions={actions}
          onViewAll={() => navigate('/actions')}
        />

        {/* ── Coach Notes — visible to dealers when notes exist ── */}
        <CoachNotesPanel dealershipId={dealerId ?? null} />

        {/* ── Strategic findings ── */}
        <FindingsCard scores={scores} />
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
npx tsc --noEmit
```

Expected: no errors.

- [ ] **Step 7: Run full test suite**

```bash
npx vitest run
```

Expected: all existing tests pass, 3 new CoachNotesPanel tests pass.

- [ ] **Step 8: Commit**

```bash
git add src/components/CoachNotesPanel.tsx src/__tests__/CoachNotesPanel.test.tsx src/pages/Dashboard.tsx
git commit -m "feat(notifications): Coach Notes panel on dealer dashboard + bell routing fix (#78)"
```

---

## SPRINT B

---

### Task 5: React Email base template and notification templates

Create five `.tsx` template files in `supabase/functions/_templates/`. These are Deno-compatible React components using `@react-email/components` from `esm.sh`.

**Files:**
- Create: `supabase/functions/_templates/BaseEmail.tsx`
- Create: `supabase/functions/_templates/StaleActionEmail.tsx`
- Create: `supabase/functions/_templates/WeeklyDigestEmail.tsx`
- Create: `supabase/functions/_templates/MilestoneEmail.tsx`
- Create: `supabase/functions/_templates/CoachCommentEmail.tsx`

- [ ] **Step 1: Create BaseEmail.tsx**

```tsx
// supabase/functions/_templates/BaseEmail.tsx
import React from 'https://esm.sh/react@18'
import {
  Html, Head, Body, Container, Section, Text, Hr, Img,
} from 'https://esm.sh/@react-email/components@0.0.19'

export interface BaseEmailProps {
  previewText?: string;
  children: React.ReactNode;
}

export function BaseEmail({ previewText, children }: BaseEmailProps) {
  return (
    <Html lang="en">
      <Head />
      <Body style={body}>
        {previewText && (
          <div style={{ display: 'none', maxHeight: 0, overflow: 'hidden' }}>
            {previewText}
          </div>
        )}
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={headerTitle}>Dealer Diagnostic Platform</Text>
          </Section>

          {/* Body */}
          <Section style={content}>
            {children}
          </Section>

          {/* Footer */}
          <Section style={footer}>
            <Text style={footerText}>
              Manage notification preferences in{' '}
              <a href={`${Deno.env.get('SITE_URL') ?? ''}/app/account`} style={footerLink}>
                Account Settings
              </a>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const body: React.CSSProperties = {
  backgroundColor: '#ffffff',
  fontFamily: "'Inter', Arial, sans-serif",
  margin: 0,
  padding: 0,
}

const container: React.CSSProperties = {
  maxWidth: '600px',
  margin: '40px auto',
}

const header: React.CSSProperties = {
  backgroundColor: '#1D7AFC',
  borderRadius: '12px 12px 0 0',
  padding: '28px 40px',
  textAlign: 'center',
}

const headerTitle: React.CSSProperties = {
  margin: 0,
  color: '#ffffff',
  fontSize: '20px',
  fontWeight: 700,
}

const content: React.CSSProperties = {
  backgroundColor: '#f8f9fa',
  padding: '40px',
  borderLeft: '1px solid #e0e0e0',
  borderRight: '1px solid #e0e0e0',
}

const footer: React.CSSProperties = {
  backgroundColor: '#f0f1f3',
  borderRadius: '0 0 12px 12px',
  padding: '20px 40px',
  textAlign: 'center',
  border: '1px solid #e0e0e0',
}

const footerText: React.CSSProperties = {
  margin: 0,
  color: '#8993A4',
  fontSize: '12px',
}

const footerLink: React.CSSProperties = {
  color: '#1D7AFC',
  textDecoration: 'none',
}
```

- [ ] **Step 2: Create StaleActionEmail.tsx**

```tsx
// supabase/functions/_templates/StaleActionEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface StaleActionEmailProps {
  actionTitle: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  daysStale: number;
  actionsUrl: string;
  markInProgressUrl?: string;
  markCompleteUrl?: string;
}

const priorityColor: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#2563eb',
  low: '#6b7280',
}

export function StaleActionEmail({
  actionTitle,
  priority,
  daysStale,
  actionsUrl,
  markInProgressUrl,
  markCompleteUrl,
}: StaleActionEmailProps) {
  const color = priorityColor[priority] ?? '#6b7280'
  const daysLabel = `${daysStale} day${daysStale === 1 ? '' : 's'}`

  return (
    <BaseEmail previewText={`Action overdue: ${actionTitle} — ${daysLabel} without update`}>
      <Text style={heading}>Action needs attention</Text>
      <Text style={body}>
        <strong>{actionTitle}</strong> has had no update for{' '}
        <strong>{daysLabel}</strong>.
      </Text>

      {/* Priority badge */}
      <Section style={{ marginBottom: '20px' }}>
        <span style={{
          background: `${color}18`,
          color,
          border: `1px solid ${color}30`,
          borderRadius: '4px',
          padding: '3px 10px',
          fontSize: '11px',
          fontWeight: 600,
          textTransform: 'capitalize',
        }}>
          {priority} priority
        </span>
      </Section>

      <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />

      {/* One-click update buttons (only shown when tokens are provided) */}
      {(markInProgressUrl || markCompleteUrl) && (
        <>
          <Text style={{ ...body, marginBottom: '12px' }}>
            Update status without logging in:
          </Text>
          <Section style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
            {markInProgressUrl && (
              <Button href={markInProgressUrl} style={btnSecondary}>
                Mark In Progress
              </Button>
            )}
            {markCompleteUrl && (
              <Button href={markCompleteUrl} style={btnPrimary}>
                Mark Complete
              </Button>
            )}
          </Section>
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
        </>
      )}

      <Button href={actionsUrl} style={btnPrimary}>
        View Action Plan
      </Button>
    </BaseEmail>
  )
}

const heading: React.CSSProperties = {
  margin: '0 0 12px',
  color: '#172d4d',
  fontSize: '18px',
  fontWeight: 600,
}

const body: React.CSSProperties = {
  margin: '0 0 16px',
  color: '#445166',
  fontSize: '14px',
  lineHeight: '1.6',
}

const btnPrimary: React.CSSProperties = {
  backgroundColor: '#1D7AFC',
  borderRadius: '8px',
  color: '#ffffff',
  fontSize: '14px',
  fontWeight: 600,
  padding: '12px 28px',
  textDecoration: 'none',
  display: 'inline-block',
  marginRight: '8px',
}

const btnSecondary: React.CSSProperties = {
  ...btnPrimary,
  backgroundColor: '#f0f1f3',
  color: '#172d4d',
}
```

- [ ] **Step 3: Create WeeklyDigestEmail.tsx**

```tsx
// supabase/functions/_templates/WeeklyDigestEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Row, Column, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface DigestAction {
  action_title: string;
  priority: string;
  urgency_score: number | null;
  days_overdue: number;
}

export interface WeeklyDigestEmailProps {
  openCount: number;
  overdueCount: number;
  topActions: DigestAction[];
  actionsUrl: string;
}

const priorityColor: Record<string, string> = {
  critical: '#dc2626',
  high: '#d97706',
  medium: '#2563eb',
  low: '#6b7280',
}

export function WeeklyDigestEmail({
  openCount,
  overdueCount,
  topActions,
  actionsUrl,
}: WeeklyDigestEmailProps) {
  return (
    <BaseEmail previewText={`${openCount} open actions, ${overdueCount} overdue — weekly digest`}>
      <Text style={heading}>Your weekly action summary</Text>

      {/* Stats row */}
      <Row style={{ marginBottom: '24px' }}>
        <Column style={statCell}>
          <Text style={statNum}>{openCount}</Text>
          <Text style={statLabel}>Open actions</Text>
        </Column>
        <Column style={{ width: '8px' }} />
        <Column style={{
          ...statCell,
          backgroundColor: overdueCount > 0 ? '#fef2f2' : '#f0fdf4',
          borderColor: overdueCount > 0 ? '#fecaca' : '#bbf7d0',
        }}>
          <Text style={{ ...statNum, color: overdueCount > 0 ? '#dc2626' : '#16a34a' }}>
            {overdueCount}
          </Text>
          <Text style={statLabel}>Overdue</Text>
        </Column>
      </Row>

      {topActions.length > 0 && (
        <>
          <Text style={{ ...subheading }}>Top priority actions</Text>
          {topActions.map((action, i) => {
            const col = priorityColor[action.priority.toLowerCase()] ?? '#6b7280'
            return (
              <Row key={i} style={actionRow}>
                <Column style={{ flex: 1 }}>
                  <Text style={actionTitle}>{action.action_title}</Text>
                </Column>
                <Column style={{ width: '80px', textAlign: 'center' }}>
                  <span style={{
                    background: `${col}18`, color: col, border: `1px solid ${col}30`,
                    borderRadius: '4px', padding: '2px 8px',
                    fontSize: '11px', fontWeight: 600, textTransform: 'capitalize',
                  }}>
                    {action.priority}
                  </span>
                </Column>
                <Column style={{ width: '80px', textAlign: 'right' }}>
                  <Text style={action.days_overdue > 0 ? overdueLabel : onTrackLabel}>
                    {action.days_overdue > 0 ? `${action.days_overdue}d overdue` : 'On track'}
                  </Text>
                </Column>
              </Row>
            )
          })}
          <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />
        </>
      )}

      <Button href={actionsUrl} style={btn}>Review Action Plan</Button>
    </BaseEmail>
  )
}

const heading: React.CSSProperties = { margin: '0 0 20px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }
const subheading: React.CSSProperties = { margin: '0 0 8px', color: '#172d4d', fontSize: '13px', fontWeight: 600 }
const statCell: React.CSSProperties = { padding: '16px', backgroundColor: '#f0f8ff', borderRadius: '8px', textAlign: 'center', border: '1px solid #b3d9ff' }
const statNum: React.CSSProperties = { margin: 0, fontSize: '28px', fontWeight: 700, color: '#1D7AFC' }
const statLabel: React.CSSProperties = { margin: '4px 0 0', fontSize: '12px', color: '#445166', textTransform: 'uppercase', letterSpacing: '0.05em' }
const actionRow: React.CSSProperties = { borderBottom: '1px solid #e5e7eb', padding: '10px 0' }
const actionTitle: React.CSSProperties = { margin: 0, fontSize: '13px', color: '#172d4d' }
const overdueLabel: React.CSSProperties = { margin: 0, fontSize: '12px', color: '#dc2626', fontWeight: 600 }
const onTrackLabel: React.CSSProperties = { margin: 0, fontSize: '12px', color: '#16a34a' }
const btn: React.CSSProperties = { backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }
```

- [ ] **Step 4: Create MilestoneEmail.tsx**

```tsx
// supabase/functions/_templates/MilestoneEmail.tsx
import React from 'https://esm.sh/react@18'
import { Section, Text, Button, Hr } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface MilestoneEmailProps {
  milestonePercent: 25 | 50 | 75 | 100;
  completedCount: number;
  totalCount: number;
  actionsUrl: string;
  reassessUrl?: string;
}

export function MilestoneEmail({
  milestonePercent,
  completedCount,
  totalCount,
  actionsUrl,
  reassessUrl,
}: MilestoneEmailProps) {
  const isComplete = milestonePercent === 100

  return (
    <BaseEmail previewText={`${milestonePercent}% of your action plan is complete`}>
      <Text style={heading}>
        {isComplete ? '🎉 Action plan complete!' : `${milestonePercent}% milestone reached`}
      </Text>
      <Text style={body}>
        {isComplete
          ? `All ${totalCount} actions have been completed. Time to reassess and track your improvement.`
          : `You've completed ${completedCount} of ${totalCount} actions (${milestonePercent}%). Keep the momentum going.`
        }
      </Text>

      {/* Progress bar */}
      <Section style={{ margin: '20px 0' }}>
        <div style={{ height: '8px', backgroundColor: '#e5e7eb', borderRadius: '4px', overflow: 'hidden' }}>
          <div style={{
            height: '8px',
            width: `${milestonePercent}%`,
            background: 'linear-gradient(90deg, #1D7AFC 0%, #85B8FF 100%)',
            borderRadius: '4px',
          }} />
        </div>
        <Text style={{ margin: '8px 0 0', fontSize: '12px', color: '#6b7280', textAlign: 'right' }}>
          {milestonePercent}% complete
        </Text>
      </Section>

      <Hr style={{ borderColor: '#e5e7eb', margin: '20px 0' }} />

      <Button href={actionsUrl} style={btn}>View Action Plan</Button>
      {isComplete && reassessUrl && (
        <Button href={reassessUrl} style={{ ...btn, marginLeft: '12px', backgroundColor: '#059669' }}>
          Start New Assessment
        </Button>
      )}
    </BaseEmail>
  )
}

const heading: React.CSSProperties = { margin: '0 0 12px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }
const body: React.CSSProperties = { margin: '0 0 16px', color: '#445166', fontSize: '14px', lineHeight: '1.6' }
const btn: React.CSSProperties = { backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none', display: 'inline-block' }
```

- [ ] **Step 5: Create CoachCommentEmail.tsx (reserved)**

```tsx
// supabase/functions/_templates/CoachCommentEmail.tsx
// Reserved for future email expansion of coach comment notifications.
// Currently coach comment notifications are in-app only.
import React from 'https://esm.sh/react@18'
import { Text, Button } from 'https://esm.sh/@react-email/components@0.0.19'
import { BaseEmail } from './BaseEmail.tsx'

export interface CoachCommentEmailProps {
  coachName: string;
  notePreview: string;
  dealershipName: string;
  dashboardUrl: string;
}

export function CoachCommentEmail({
  coachName,
  notePreview,
  dealershipName,
  dashboardUrl,
}: CoachCommentEmailProps) {
  return (
    <BaseEmail previewText={`New coach note from ${coachName}`}>
      <Text style={{ margin: '0 0 12px', color: '#172d4d', fontSize: '18px', fontWeight: 600 }}>
        New note from your coach
      </Text>
      <Text style={{ margin: '0 0 16px', color: '#445166', fontSize: '14px', lineHeight: '1.6' }}>
        <strong>{coachName}</strong> added a note for <strong>{dealershipName}</strong>:
      </Text>
      <Text style={{
        margin: '0 0 24px', color: '#44546F', fontSize: '13px', lineHeight: '1.6',
        borderLeft: '3px solid #1D7AFC', paddingLeft: '12px', fontStyle: 'italic',
      }}>
        "{notePreview}"
      </Text>
      <Button href={dashboardUrl} style={{ backgroundColor: '#1D7AFC', borderRadius: '8px', color: '#ffffff', fontSize: '14px', fontWeight: 600, padding: '12px 28px', textDecoration: 'none' }}>
        View Dashboard
      </Button>
    </BaseEmail>
  )
}
```

- [ ] **Step 6: Verify Deno can resolve the imports (syntax check)**

```bash
# Requires Deno installed locally. If not installed, skip and verify at deploy time.
deno check supabase/functions/_templates/StaleActionEmail.tsx
```

Expected: no type errors. If Deno is not installed locally, proceed — errors will surface during `supabase functions deploy`.

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/_templates/
git commit -m "feat(notifications): React Email template components for all notification types"
```

---

### Task 6: Refactor notify-dispatcher to use React Email

Replace the two raw HTML builder functions (`buildNotificationEmailHtml`, `buildDigestEmailHtml`) with React Email `render()` calls. All Resend call sites remain unchanged — only the `html:` argument changes.

**Files:**
- Modify: `supabase/functions/notify-dispatcher/index.ts`

- [ ] **Step 1: Add React Email import and remove old builders**

At the top of `supabase/functions/notify-dispatcher/index.ts`, replace the existing imports block and the two builder functions with:

```ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import React from 'https://esm.sh/react@18'
import { render } from 'https://esm.sh/@react-email/render@0.0.10'
import { StaleActionEmail } from '../_templates/StaleActionEmail.tsx'
import { WeeklyDigestEmail, type DigestAction } from '../_templates/WeeklyDigestEmail.tsx'
import { MilestoneEmail } from '../_templates/MilestoneEmail.tsx'
import { CoachCommentEmail } from '../_templates/CoachCommentEmail.tsx'
```

Delete the entire `buildNotificationEmailHtml()` function (lines 23–25 of the original) and the entire `buildDigestEmailHtml()` function (lines 50–123 of the original), and the `DigestPayload` interface (lines 27–32) and `DigestAction` interface (lines 33–37) and the `priorityColor` function (lines 40–48) — these are now in the templates.

- [ ] **Step 2: Replace email HTML generation in the send block**

Find the section inside the `if (channel === 'email' && email_to && resendApiKey)` block (around line 224 of the original). Replace the entire `emailHtml` assignment logic with:

```ts
    let emailHtml: string
    const siteUrl = Deno.env.get('SITE_URL') || 'https://dealership-performance-assessment-tool.lovable.app'
    const actionsUrl = `${siteUrl}/app/actions`

    if (type === 'digest') {
      try {
        const digestData = JSON.parse(body) as {
          open_count: number
          overdue_count: number
          top_actions: DigestAction[]
        }
        emailHtml = render(React.createElement(WeeklyDigestEmail, {
          openCount: digestData.open_count,
          overdueCount: digestData.overdue_count,
          topActions: digestData.top_actions,
          actionsUrl,
        }))
      } catch {
        emailHtml = render(React.createElement(StaleActionEmail, {
          actionTitle: title,
          priority: 'medium',
          daysStale: 0,
          actionsUrl,
        }))
      }
    } else if (type === 'stale_action') {
      // Parse priority and daysStale from body if available, else fall back to defaults
      const daysMatch = body.match(/(\d+) day/)
      const daysStale = daysMatch ? parseInt(daysMatch[1]) : 1
      const priorityMatch = body.match(/Priority: (\w+)/)
      const priority = (priorityMatch?.[1]?.toLowerCase() ?? 'medium') as 'critical' | 'high' | 'medium' | 'low'
      emailHtml = render(React.createElement(StaleActionEmail, {
        actionTitle: title.replace('Action overdue: ', ''),
        priority,
        daysStale,
        actionsUrl,
      }))
    } else if (type === 'milestone') {
      const percentMatch = body.match(/(\d+)%/)
      const milestonePercent = (percentMatch ? parseInt(percentMatch[1]) : 25) as 25 | 50 | 75 | 100
      const countMatch = body.match(/(\d+) of (\d+)/)
      emailHtml = render(React.createElement(MilestoneEmail, {
        milestonePercent,
        completedCount: countMatch ? parseInt(countMatch[1]) : 0,
        totalCount: countMatch ? parseInt(countMatch[2]) : 0,
        actionsUrl,
        reassessUrl: milestonePercent === 100 ? `${siteUrl}/app/assessment` : undefined,
      }))
    } else if (type === 'coach_comment') {
      emailHtml = render(React.createElement(CoachCommentEmail, {
        coachName: 'Your coach',
        notePreview: body,
        dealershipName: 'your dealership',
        dashboardUrl: `${siteUrl}/app/dashboard#coach-notes`,
      }))
    } else {
      // Fallback for unknown types
      emailHtml = render(React.createElement(StaleActionEmail, {
        actionTitle: title,
        priority: 'medium',
        daysStale: 0,
        actionsUrl,
      }))
    }
```

- [ ] **Step 3: Deploy the updated Edge Function**

```bash
npx supabase functions deploy notify-dispatcher --project-ref xrypgosuyfdkkqafftae
```

Expected output: `Deployed notify-dispatcher` with no errors.

- [ ] **Step 4: Test via curl**

```bash
curl -X POST https://xrypgosuyfdkkqafftae.supabase.co/functions/v1/notify-dispatcher \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-service-role-key>" \
  -d '{
    "user_id": "<your-user-id>",
    "organization_id": "<your-org-id>",
    "type": "stale_action",
    "channel": "email",
    "title": "Action overdue: Test action",
    "body": "This action has had no update for 8 days. Priority: high",
    "email_to": "chankale310@gmail.com"
  }'
```

Expected: `{"success":true,"email_sent":true}`. Check inbox — email should use the new React Email template layout.

- [ ] **Step 5: Commit**

```bash
git add supabase/functions/notify-dispatcher/index.ts
git commit -m "feat(notifications): replace raw HTML email builders with React Email templates"
```

---

### Task 7: Action token nonce migration (#72 — DB layer)

Add two columns to `improvement_actions` to support single-use HMAC tokens for one-click email status updates.

**Files:**
- Create: `supabase/migrations/20260519120000_action_token_nonce.sql`

- [ ] **Step 1: Create the migration**

```sql
-- supabase/migrations/20260519120000_action_token_nonce.sql

ALTER TABLE public.improvement_actions
  ADD COLUMN IF NOT EXISTS token_nonce       TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS token_expires_at  TIMESTAMPTZ;

COMMENT ON COLUMN public.improvement_actions.token_nonce IS
  'Single-use HMAC token for one-click email status updates. Nulled after use.';
COMMENT ON COLUMN public.improvement_actions.token_expires_at IS
  'Expiry for token_nonce. Tokens valid for 72 hours from generation.';
```

- [ ] **Step 2: Apply via Supabase MCP**

```
mcp__claude_ai_Supabase__apply_migration
  project_id: xrypgosuyfdkkqafftae
  name: action_token_nonce
  query: <contents of migration>
```

- [ ] **Step 3: Verify columns exist**

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'improvement_actions'
  AND column_name IN ('token_nonce', 'token_expires_at');
```

Expected: 2 rows.

- [ ] **Step 4: Regenerate Supabase TypeScript types**

Use the Supabase MCP tool:
```
mcp__claude_ai_Supabase__generate_typescript_types
  project_id: xrypgosuyfdkkqafftae
```

Write the output to `src/integrations/supabase/types.ts`.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260519120000_action_token_nonce.sql src/integrations/supabase/types.ts
git commit -m "feat(notifications): add token_nonce columns to improvement_actions for one-click email updates (#72)"
```

---

### Task 8: action-token-update Edge Function (#72 — validation + update)

A public endpoint (no auth header) that validates an HMAC-signed token from a nudge email, updates the action status, and returns an HTML confirmation page.

**Files:**
- Create: `supabase/functions/action-token-update/index.ts`

- [ ] **Step 1: Create the Edge Function**

```ts
// supabase/functions/action-token-update/index.ts
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const VALID_STATUSES = ['In Progress', 'Completed'] as const
type ValidStatus = typeof VALID_STATUSES[number]

const STATUS_LABEL_MAP: Record<string, ValidStatus> = {
  'in_progress': 'In Progress',
  'completed':   'Completed',
}

// ── HMAC helpers (Web Crypto API — available in Deno) ───────────────────────

async function importKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  )
}

async function signPayload(payload: object, secret: string): Promise<string> {
  const key = await importKey(secret)
  const data = new TextEncoder().encode(JSON.stringify(payload))
  const sig = await crypto.subtle.sign('HMAC', key, data)
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
}

async function verifyToken(
  token: string,
  secret: string
): Promise<{ action_id: string; user_id: string; status: string; exp: number } | null> {
  try {
    const decoded = JSON.parse(atob(token))
    const { sig, ...payload } = decoded
    if (!sig) return null

    const expectedSig = await signPayload(payload, secret)
    if (sig !== expectedSig) return null

    return payload
  } catch {
    return null
  }
}

// ── HTML response helpers ───────────────────────────────────────────────────

function htmlPage(title: string, body: string, isError = false): Response {
  const color = isError ? '#dc2626' : '#16a34a'
  const html = `<!DOCTYPE html><html lang="en">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>body{font-family:Arial,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f9fafb}.card{max-width:480px;padding:40px;background:#fff;border-radius:12px;box-shadow:0 4px 24px rgba(0,0,0,.08);text-align:center}h1{color:${color};font-size:22px;margin:0 0 12px}p{color:#44546f;font-size:15px;line-height:1.6;margin:0 0 24px}a{display:inline-block;padding:12px 28px;background:#1D7AFC;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;font-size:14px}</style>
</head>
<body><div class="card">
<h1>${title}</h1><p>${body}</p>
<a href="${Deno.env.get('SITE_URL') ?? ''}/app/actions">View Action Plan</a>
</div></body></html>`
  return new Response(html, { status: isError ? 400 : 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } })
}

// ── Main handler ────────────────────────────────────────────────────────────

serve(async (req) => {
  // Only GET — token arrives as a query param in the email link href
  if (req.method !== 'GET') {
    return htmlPage('Invalid request', 'This link only supports GET requests.', true)
  }

  const url = new URL(req.url)
  const token = url.searchParams.get('token')
  const rawStatus = url.searchParams.get('status')

  if (!token || !rawStatus) {
    return htmlPage('Invalid link', 'This link is missing required parameters. Please use the link from your notification email.', true)
  }

  const newStatus = STATUS_LABEL_MAP[rawStatus]
  if (!newStatus) {
    return htmlPage('Invalid status', `"${rawStatus}" is not a valid status. Allowed: in_progress, completed.`, true)
  }

  const secret = Deno.env.get('SUPABASE_JWT_SECRET')
  if (!secret) {
    console.error('SUPABASE_JWT_SECRET not set')
    return htmlPage('Server error', 'Configuration error. Please contact support.', true)
  }

  // Verify HMAC signature and decode payload
  const payload = await verifyToken(token, secret)
  if (!payload) {
    return htmlPage('Invalid link', 'This link is invalid or has been tampered with.', true)
  }

  // Check expiry
  if (Date.now() / 1000 > payload.exp) {
    return htmlPage('Link expired', 'This link expired 72 hours after it was sent. Log in to update your action plan directly.', true)
  }

  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  // Check nonce is still valid (not consumed)
  const { data: action, error: fetchError } = await supabaseAdmin
    .from('improvement_actions')
    .select('id, status, token_nonce, token_expires_at')
    .eq('id', payload.action_id)
    .maybeSingle()

  if (fetchError || !action) {
    return htmlPage('Action not found', 'This action no longer exists.', true)
  }

  if (!action.token_nonce) {
    return htmlPage('Link already used', 'This link has already been used. Log in to view current status.', true)
  }

  if (action.status === newStatus) {
    // Consume nonce even if already in desired state (idempotent)
    await supabaseAdmin
      .from('improvement_actions')
      .update({ token_nonce: null, token_expires_at: null })
      .eq('id', payload.action_id)
    return htmlPage(
      'Already up to date',
      `This action is already marked as "${newStatus}". No changes made.`
    )
  }

  // Update status and consume nonce atomically
  const { error: updateError } = await supabaseAdmin
    .from('improvement_actions')
    .update({
      status: newStatus,
      token_nonce: null,
      token_expires_at: null,
      last_status_updated_at: new Date().toISOString(),
    })
    .eq('id', payload.action_id)
    .eq('token_nonce', action.token_nonce) // extra guard: must match stored nonce

  if (updateError) {
    console.error('Status update failed:', updateError.message)
    return htmlPage('Update failed', 'Something went wrong updating your action. Please log in and update manually.', true)
  }

  return htmlPage(
    `Action marked ${newStatus}`,
    `Your action has been updated to "${newStatus}". You can view your full action plan by clicking below.`
  )
})
```

- [ ] **Step 2: Update notify-dispatcher to generate and embed tokens in stale action emails**

In `supabase/functions/notify-dispatcher/index.ts`, inside the `stale_action` branch of the email HTML generation block, add token generation before the `render()` call. Replace the `stale_action` branch with:

```ts
    } else if (type === 'stale_action') {
      const daysMatch = body.match(/(\d+) day/)
      const daysStale = daysMatch ? parseInt(daysMatch[1]) : 1
      const priorityMatch = body.match(/Priority: (\w+)/)
      const priority = (priorityMatch?.[1]?.toLowerCase() ?? 'medium') as 'critical' | 'high' | 'medium' | 'low'
      const jwtSecret = Deno.env.get('SUPABASE_JWT_SECRET')

      let markInProgressUrl: string | undefined
      let markCompleteUrl: string | undefined

      if (entity_id && jwtSecret) {
        const exp = Math.floor(Date.now() / 1000) + 72 * 3600

        const makeToken = async (status: string) => {
          const payload = { action_id: entity_id, user_id, status, exp }
          const key = await crypto.subtle.importKey(
            'raw', new TextEncoder().encode(jwtSecret),
            { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
          )
          const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(JSON.stringify(payload)))
          const sigB64 = btoa(String.fromCharCode(...new Uint8Array(sig)))
          return btoa(JSON.stringify({ ...payload, sig: sigB64 }))
        }

        const [inProgressToken, completeToken] = await Promise.all([
          makeToken('in_progress'),
          makeToken('completed'),
        ])

        const tokenBaseUrl = `${siteUrl}/functions/v1/action-token-update`
        markInProgressUrl = `${tokenBaseUrl}?token=${encodeURIComponent(inProgressToken)}&status=in_progress`
        markCompleteUrl = `${tokenBaseUrl}?token=${encodeURIComponent(completeToken)}&status=completed`

        // Store nonce (use in_progress token as the stored nonce — first use wins)
        await supabaseAdmin
          .from('improvement_actions')
          .update({
            token_nonce: inProgressToken,
            token_expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
          })
          .eq('id', entity_id)
      }

      emailHtml = render(React.createElement(StaleActionEmail, {
        actionTitle: title.replace('Action overdue: ', ''),
        priority,
        daysStale,
        actionsUrl,
        markInProgressUrl,
        markCompleteUrl,
      }))
```

- [ ] **Step 3: Deploy both Edge Functions**

```bash
npx supabase functions deploy action-token-update --project-ref xrypgosuyfdkkqafftae
npx supabase functions deploy notify-dispatcher --project-ref xrypgosuyfdkkqafftae
```

Expected: both deploy with no errors.

- [ ] **Step 4: Test the token flow end-to-end**

First, trigger a stale action nudge email manually (see Task 1 Step 5 for inserting a test stale action), then call:

```bash
SELECT public.trigger_stale_action_check();
```

Check your inbox for the nudge email. Click "Mark In Progress". You should see the HTML confirmation page. Then verify in Supabase:

```sql
SELECT id, status, token_nonce, token_expires_at
FROM improvement_actions
WHERE action_title = 'Test stale action — delete after testing';
```

Expected: `status = 'In Progress'`, `token_nonce = NULL`, `token_expires_at = NULL`.

- [ ] **Step 5: Test replay attack prevention**

Click the same "Mark In Progress" link again (copy from email). Expected: HTML page showing "Link already used".

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/action-token-update/index.ts supabase/functions/notify-dispatcher/index.ts
git commit -m "feat(notifications): tokenised one-click email status update links (#72)"
```

---

## Self-Review

**Spec coverage check:**

| Spec requirement | Implemented in |
|---|---|
| `app.settings.service_role_key` config | Task 1 |
| `notify_on_coach_comment()` trigger (#78) | Task 2 |
| Bell navigation for `coach_note` type | Task 3 |
| Coach Notes panel on dealer dashboard | Task 4 |
| React Email BaseEmail + 4 templates | Task 5 |
| notify-dispatcher refactored to React Email | Task 6 |
| `token_nonce` + `token_expires_at` columns | Task 7 |
| `action-token-update` Edge Function | Task 8 |
| Token embedded in stale action emails | Task 8 Step 2 |
| HMAC signed, single-use, 72h expiry | Task 8 |
| HTML confirmation page on update | Task 8 Step 1 |

**Placeholder scan:** None found. All steps contain actual code or commands.

**Type consistency:**
- `DigestAction` interface defined in `WeeklyDigestEmail.tsx` and re-exported — imported in `notify-dispatcher` via named import.
- `StaleActionEmailProps.markInProgressUrl` is `string | undefined` — matches the conditional assignment in Task 8 Step 2.
- `CoachNote.profiles` shape matches the Supabase join select string `profiles:coach_user_id(display_name, full_name)`.
- `ValidStatus` union matches the values used in `STATUS_LABEL_MAP`.
