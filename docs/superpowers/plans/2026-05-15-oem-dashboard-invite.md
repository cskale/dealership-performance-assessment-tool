# Sprint 7 — OEM Dashboard Redesign + OEM Invite System

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship a self-service OEM invite flow (email-based, no SQL) and a redesigned OEM dashboard with tabs, dept weakness heatmap, at-risk alert section, leaderboard tier filter, and a slide-in dealer drill-down sheet.

**Architecture:** Extend `dealership_invites` + `send-invite` edge function + `accept_dealership_invite` RPC with a new `invite_type='oem'` branch. Rewrite `OemDashboard.tsx` to use `<Tabs>` + `<Sheet>` patterns from Sprint 5–6 Coach dashboard. All new utilities go in `oemDashboardUtils.ts` and are unit-tested before the UI is written.

**Tech Stack:** React 18, TypeScript, Vite, Supabase (Postgres + Edge Functions + RLS), shadcn/ui (Tabs, Sheet, Badge, Select, Table, Card), Vitest, Tailwind CSS.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `supabase/migrations/<ts>_oem_invite_nullable_dealership.sql` | Create | Make `dealership_id` nullable in `dealership_invites` |
| `supabase/functions/send-invite/index.ts` | Modify | Add `invite_type='oem'` auth + email branch |
| `src/integrations/supabase/types.ts` | Regenerate | Reflect nullable `dealership_id` |
| `src/components/shared/ScoreGauge.tsx` | Create | Extract SVG gauge from CoachDashboard — shared |
| `src/lib/oemDashboardUtils.ts` | Create | Dept score parsing, cell classes, at-risk filter |
| `src/__tests__/oemDashboardUtils.test.ts` | Create | Unit tests for all utility functions |
| `src/components/InviteOemUser.tsx` | Create | OEM invite card (mirrors InviteCoach pattern) |
| `src/pages/OemSettings.tsx` | Modify | Add `<InviteOemUser />` |
| `src/pages/AcceptInvite.tsx` | Modify | Add `oem` redirect case |
| `src/pages/OemDashboard.tsx` | Rewrite | Tabs + heatmap + at-risk + leaderboard + Sheet |

**RPC change** (`accept_dealership_invite`): applied via Supabase MCP execute_sql — see Task 5.

---

## Task 1: DB Migration — Make `dealership_id` Nullable

**Files:**
- Create: `supabase/migrations/<timestamp>_oem_invite_nullable_dealership.sql`

OEM invites don't belong to a specific dealership. The `dealership_id NOT NULL` constraint must be relaxed.

- [ ] **Step 1: Create the migration file**

Use the current UTC timestamp for `<timestamp>` (format: `YYYYMMDDHHmmss`).

```sql
-- supabase/migrations/<timestamp>_oem_invite_nullable_dealership.sql
ALTER TABLE dealership_invites
  ALTER COLUMN dealership_id DROP NOT NULL;
```

- [ ] **Step 2: Apply via Supabase MCP**

Use `mcp__claude_ai_Supabase__apply_migration` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `oem_invite_nullable_dealership`
- `query`: the SQL above

Expected output: success, no error.

- [ ] **Step 3: Regenerate TypeScript types**

Use `mcp__claude_ai_Supabase__generate_typescript_types` with `project_id: xrypgosuyfdkkqafftae`. Write output to `src/integrations/supabase/types.ts`.

- [ ] **Step 4: Commit**

```bash
git add supabase/migrations/ src/integrations/supabase/types.ts
git commit -m "feat(db): make dealership_id nullable for oem invite type"
```

---

## Task 2: Extract ScoreGauge as Shared Component

**Files:**
- Create: `src/components/shared/ScoreGauge.tsx`
- Modify: `src/pages/CoachDashboard.tsx` (remove inline definition, add import)

The `ScoreGauge` SVG component is currently defined inside `CoachDashboard.tsx`. Extract it so `OemDashboard.tsx` can use the same component.

- [ ] **Step 1: Create `src/components/shared/ScoreGauge.tsx`**

```tsx
interface ScoreGaugeProps {
  score: number;
  size?: number;
}

export function ScoreGauge({ score, size = 72 }: ScoreGaugeProps) {
  const r = size * 0.39;
  const circ = 2 * Math.PI * r;
  const filled = Math.min(Math.max(score, 0), 100) / 100 * circ;
  const cx = size / 2;
  const cy = size / 2;

  const accent =
    score >= 85 ? '#16a34a' :
    score >= 70 ? '#2563eb' :
    score >= 46 ? '#d97706' :
                  '#dc2626';

  return (
    <svg role="img" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-label={`Score ${Math.round(score)}`}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="5" />
      {filled > 0 && (
        <circle
          cx={cx} cy={cy} r={r} fill="none"
          stroke={accent} strokeWidth="5"
          strokeDasharray={`${filled} ${circ - filled}`}
          strokeLinecap="round"
          transform={`rotate(-90 ${cx} ${cy})`}
        />
      )}
      <text
        x={cx} y={cy + 5}
        textAnchor="middle"
        fontSize={size * 0.19}
        fontWeight="700"
        fill="currentColor"
        aria-hidden="true"
      >
        {Math.round(score)}
      </text>
    </svg>
  );
}
```

- [ ] **Step 2: Update CoachDashboard.tsx**

In `src/pages/CoachDashboard.tsx`:
1. Delete the `function ScoreGauge` definition (lines ~44–80 in current file).
2. Add import at top of file:
```tsx
import { ScoreGauge } from '@/components/shared/ScoreGauge';
```

- [ ] **Step 3: Verify build passes**

```bash
npm run build
```

Expected: no TypeScript errors. CoachDashboard still renders its gauges.

- [ ] **Step 4: Commit**

```bash
git add src/components/shared/ScoreGauge.tsx src/pages/CoachDashboard.tsx
git commit -m "refactor: extract ScoreGauge to shared component"
```

---

## Task 3: oemDashboardUtils.ts — Utilities + Tests (TDD)

**Files:**
- Create: `src/__tests__/oemDashboardUtils.test.ts`
- Create: `src/lib/oemDashboardUtils.ts`

Dept scores in `assessments.scores` jsonb use section IDs from `src/data/questionnaire.ts`: `new-vehicle-sales`, `used-vehicle-sales`, `service-performance`, `parts-inventory`, `financial-operations`.

- [ ] **Step 1: Write the failing tests first**

Create `src/__tests__/oemDashboardUtils.test.ts`:

```ts
import { describe, it, expect } from 'vitest';
import {
  parseDeptScores,
  getDeptCellClass,
  getDeptBgClass,
  getDeptTextClass,
  networkAvgByDept,
  getWeakestDept,
  AT_RISK_THRESHOLD,
  DEPT_KEYS,
} from '@/lib/oemDashboardUtils';

describe('parseDeptScores', () => {
  it('returns nulls for null input', () => {
    const result = parseDeptScores(null);
    expect(result['new-vehicle-sales']).toBeNull();
    expect(result['service-performance']).toBeNull();
  });

  it('parses all five dept keys correctly', () => {
    const input = {
      'new-vehicle-sales': 72,
      'used-vehicle-sales': 55,
      'service-performance': 40,
      'parts-inventory': 88,
      'financial-operations': 65,
    };
    const result = parseDeptScores(input);
    expect(result['new-vehicle-sales']).toBe(72);
    expect(result['used-vehicle-sales']).toBe(55);
    expect(result['service-performance']).toBe(40);
    expect(result['parts-inventory']).toBe(88);
    expect(result['financial-operations']).toBe(65);
  });

  it('ignores non-number values', () => {
    const result = parseDeptScores({ 'new-vehicle-sales': 'high', 'used-vehicle-sales': 55 });
    expect(result['new-vehicle-sales']).toBeNull();
    expect(result['used-vehicle-sales']).toBe(55);
  });

  it('ignores unrecognised keys', () => {
    const result = parseDeptScores({ unknown: 99, 'new-vehicle-sales': 70 });
    expect(result['new-vehicle-sales']).toBe(70);
  });
});

describe('getDeptCellClass', () => {
  it('returns muted class for null', () => {
    expect(getDeptCellClass(null)).toBe('text-muted-foreground');
  });
  it('returns green class for score >= 85', () => {
    expect(getDeptCellClass(85)).toContain('#16a34a');
    expect(getDeptCellClass(100)).toContain('#16a34a');
  });
  it('returns blue class for score 70–84', () => {
    expect(getDeptCellClass(70)).toContain('#2563eb');
    expect(getDeptCellClass(84)).toContain('#2563eb');
  });
  it('returns amber class for score 46–69', () => {
    expect(getDeptCellClass(46)).toContain('#d97706');
    expect(getDeptCellClass(69)).toContain('#d97706');
  });
  it('returns red class for score < 46', () => {
    expect(getDeptCellClass(45)).toContain('#dc2626');
    expect(getDeptCellClass(0)).toContain('#dc2626');
  });
});

describe('getDeptBgClass', () => {
  it('returns solid green bg for >= 85', () => {
    expect(getDeptBgClass(90)).toBe('bg-[#16a34a]');
  });
  it('returns solid red bg for < 46', () => {
    expect(getDeptBgClass(30)).toBe('bg-[#dc2626]');
  });
});

describe('getDeptTextClass', () => {
  it('returns green text for >= 85', () => {
    expect(getDeptTextClass(85)).toBe('text-[#16a34a]');
  });
  it('returns red text for < 46', () => {
    expect(getDeptTextClass(0)).toBe('text-[#dc2626]');
  });
});

describe('networkAvgByDept', () => {
  it('averages scores correctly across dealers', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': 60, 'service-performance': 40, 'parts-inventory': 70, 'financial-operations': 50 } },
      { deptScores: { 'new-vehicle-sales': 60, 'used-vehicle-sales': 80, 'service-performance': 60, 'parts-inventory': 50, 'financial-operations': 70 } },
    ];
    const avg = networkAvgByDept(dealers);
    expect(avg['new-vehicle-sales']).toBe(70);
    expect(avg['used-vehicle-sales']).toBe(70);
    expect(avg['service-performance']).toBe(50);
  });

  it('returns null when all values for a dept are null', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    expect(networkAvgByDept(dealers)['new-vehicle-sales']).toBeNull();
  });

  it('ignores null values when computing average', () => {
    const dealers = [
      { deptScores: { 'new-vehicle-sales': 80, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
      { deptScores: { 'new-vehicle-sales': null, 'used-vehicle-sales': null, 'service-performance': null, 'parts-inventory': null, 'financial-operations': null } },
    ];
    expect(networkAvgByDept(dealers)['new-vehicle-sales']).toBe(80);
  });
});

describe('getWeakestDept', () => {
  it('returns the dept with lowest score', () => {
    const scores = {
      'new-vehicle-sales': 80,
      'used-vehicle-sales': 60,
      'service-performance': 30,
      'parts-inventory': 70,
      'financial-operations': 55,
    };
    const result = getWeakestDept(scores);
    expect(result).toEqual({ key: 'service-performance', score: 30 });
  });

  it('returns null when all scores are null', () => {
    const scores = {
      'new-vehicle-sales': null,
      'used-vehicle-sales': null,
      'service-performance': null,
      'parts-inventory': null,
      'financial-operations': null,
    };
    expect(getWeakestDept(scores)).toBeNull();
  });

  it('ignores null scores when finding weakest', () => {
    const scores = {
      'new-vehicle-sales': 70,
      'used-vehicle-sales': null,
      'service-performance': null,
      'parts-inventory': 55,
      'financial-operations': null,
    };
    const result = getWeakestDept(scores);
    expect(result).toEqual({ key: 'parts-inventory', score: 55 });
  });
});

describe('AT_RISK_THRESHOLD', () => {
  it('is 46', () => {
    expect(AT_RISK_THRESHOLD).toBe(46);
  });
});

describe('DEPT_KEYS', () => {
  it('has exactly 5 dept keys', () => {
    expect(DEPT_KEYS).toHaveLength(5);
    expect(DEPT_KEYS).toContain('new-vehicle-sales');
    expect(DEPT_KEYS).toContain('financial-operations');
  });
});
```

- [ ] **Step 2: Run tests — expect all to fail**

```bash
npx vitest run src/__tests__/oemDashboardUtils.test.ts
```

Expected: `Cannot find module '@/lib/oemDashboardUtils'` or similar.

- [ ] **Step 3: Create `src/lib/oemDashboardUtils.ts`**

```ts
export type DeptKey =
  | 'new-vehicle-sales'
  | 'used-vehicle-sales'
  | 'service-performance'
  | 'parts-inventory'
  | 'financial-operations';

export const DEPT_KEYS: DeptKey[] = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

export const DEPT_LABELS: Record<DeptKey, string> = {
  'new-vehicle-sales': 'NVS',
  'used-vehicle-sales': 'UVS',
  'service-performance': 'SVC',
  'parts-inventory': 'PTS',
  'financial-operations': 'FIN',
};

export const AT_RISK_THRESHOLD = 46;

export function parseDeptScores(scoresJsonb: unknown): Record<DeptKey, number | null> {
  const result: Record<DeptKey, number | null> = {
    'new-vehicle-sales': null,
    'used-vehicle-sales': null,
    'service-performance': null,
    'parts-inventory': null,
    'financial-operations': null,
  };
  if (!scoresJsonb || typeof scoresJsonb !== 'object') return result;
  const scores = scoresJsonb as Record<string, unknown>;
  for (const key of DEPT_KEYS) {
    const val = scores[key];
    result[key] = typeof val === 'number' ? val : null;
  }
  return result;
}

export function getDeptCellClass(score: number | null): string {
  if (score === null) return 'text-muted-foreground';
  if (score >= 85) return 'bg-[#16a34a]/10 text-[#16a34a]';
  if (score >= 70) return 'bg-[#2563eb]/10 text-[#2563eb]';
  if (score >= 46) return 'bg-[#d97706]/10 text-[#d97706]';
  return 'bg-[#dc2626]/10 text-[#dc2626]';
}

export function getDeptBgClass(score: number): string {
  if (score >= 85) return 'bg-[#16a34a]';
  if (score >= 70) return 'bg-[#2563eb]';
  if (score >= 46) return 'bg-[#d97706]';
  return 'bg-[#dc2626]';
}

export function getDeptTextClass(score: number): string {
  if (score >= 85) return 'text-[#16a34a]';
  if (score >= 70) return 'text-[#2563eb]';
  if (score >= 46) return 'text-[#d97706]';
  return 'text-[#dc2626]';
}

export function networkAvgByDept(
  dealers: Array<{ deptScores: Record<DeptKey, number | null> }>
): Record<DeptKey, number | null> {
  const result: Record<DeptKey, number | null> = {
    'new-vehicle-sales': null,
    'used-vehicle-sales': null,
    'service-performance': null,
    'parts-inventory': null,
    'financial-operations': null,
  };
  for (const key of DEPT_KEYS) {
    const vals = dealers.map(d => d.deptScores[key]).filter((v): v is number => v !== null);
    result[key] = vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  }
  return result;
}

export function getWeakestDept(
  deptScores: Record<DeptKey, number | null>
): { key: DeptKey; score: number } | null {
  let weakest: { key: DeptKey; score: number } | null = null;
  for (const key of DEPT_KEYS) {
    const score = deptScores[key];
    if (score === null) continue;
    if (!weakest || score < weakest.score) weakest = { key, score };
  }
  return weakest;
}
```

- [ ] **Step 4: Run tests — expect all to pass**

```bash
npx vitest run src/__tests__/oemDashboardUtils.test.ts
```

Expected: all tests pass.

- [ ] **Step 5: Commit**

```bash
git add src/lib/oemDashboardUtils.ts src/__tests__/oemDashboardUtils.test.ts
git commit -m "feat(utils): add oemDashboardUtils with dept score parsing and tests"
```

---

## Task 4: send-invite Edge Function — OEM Branch

**Files:**
- Modify: `supabase/functions/send-invite/index.ts`

Add `invite_type='oem'` support: separate auth check (org owner/admin with active OEM network), skip `dealership_id` requirement, new email template.

- [ ] **Step 1: Update `buildInviteEmailHtml` to handle `'oem'` type**

In `supabase/functions/send-invite/index.ts`, change the function signature and add the OEM case:

```ts
function buildInviteEmailHtml(
  dealershipName: string,
  inviterName: string,
  inviteUrl: string,
  role: string,
  inviteType: 'dealer' | 'coach' | 'oem' = 'dealer'
): string {
  const heading =
    inviteType === 'oem'   ? "You've been invited as an OEM user" :
    inviteType === 'coach' ? "You've been invited as a coach" :
                             "You've been invited!";

  const bodyText =
    inviteType === 'oem'
      ? `<strong>${inviterName}</strong> has invited you to access the OEM dashboard and manage the dealer network.`
      : inviteType === 'coach'
      ? `<strong>${inviterName}</strong> has invited you to coach <strong>${dealershipName}</strong> on the Dealer Diagnostic platform.`
      : `<strong>${inviterName}</strong> has invited you to join <strong>${dealershipName}</strong> as a <strong>${role}</strong>.`;

  const ctaText =
    inviteType === 'oem'   ? 'Accept OEM Invitation' :
    inviteType === 'coach' ? 'Accept Coach Invitation' :
                             'Accept Invitation';

  // rest of the HTML template is unchanged — replace only heading/bodyText/ctaText
  return `<!DOCTYPE html>...`; // keep existing HTML, only the three variables above change
}
```

**Important:** keep the full existing HTML string — only replace the three `const` values used within it (`heading`, `bodyText`, `ctaText`).

- [ ] **Step 2: Update the `inviteType` type guard**

Find this line:
```ts
const inviteType: 'dealer' | 'coach' = invite_type === 'coach' ? 'coach' : 'dealer';
```

Replace with:
```ts
const inviteType: 'dealer' | 'coach' | 'oem' =
  invite_type === 'oem'   ? 'oem' :
  invite_type === 'coach' ? 'coach' :
  'dealer';
```

- [ ] **Step 3: Update the required-fields validation**

Find this block:
```ts
if (!normalizedEmail || !dealership_id || !organization_id) {
  return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, ... })
}
```

Replace with:
```ts
if (!normalizedEmail || !organization_id) {
  return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
if (inviteType !== 'oem' && !dealership_id) {
  return new Response(JSON.stringify({ error: 'Missing required fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
}
```

- [ ] **Step 4: Add OEM auth check before the existing membership check**

Find the existing membership check block:
```ts
const { data: membership } = await supabaseAdmin.from('memberships').select('role').eq('user_id', user.id).eq('organization_id', organization_id).eq('is_active', true).single()
if (!membership || !['owner', 'admin'].includes(membership.role)) {
  return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, ... })
}
```

Replace the entire block with:
```ts
// For all invite types, caller must be org owner or admin
const { data: membership } = await supabaseAdmin
  .from('memberships')
  .select('role')
  .eq('user_id', user.id)
  .eq('organization_id', organization_id)
  .eq('is_active', true)
  .single();

if (!membership || !['owner', 'admin'].includes(membership.role)) {
  return new Response(JSON.stringify({ error: 'Insufficient permissions' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
}

// OEM invites additionally require the org to own an active oem_network
if (inviteType === 'oem') {
  const { data: oemNetwork } = await supabaseAdmin
    .from('oem_networks')
    .select('id')
    .eq('owner_org_id', organization_id)
    .eq('status', 'active')
    .maybeSingle();
  if (!oemNetwork) {
    return new Response(
      JSON.stringify({ error: 'No active OEM network found for this organisation' }),
      { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
}
```

- [ ] **Step 5: Update the email send section to use network name for OEM**

In the section that fetches dealership name for the email, add an OEM path:

```ts
let dealershipName = 'your network';
let inviterName = user.email || 'A team member';

if (resendApiKey) {
  try {
    const [profileRes] = await Promise.all([
      supabaseAdmin.from('profiles').select('display_name, full_name').eq('user_id', user.id).single(),
    ]);
    inviterName = profileRes.data?.display_name || profileRes.data?.full_name || user.email || 'A team member';

    if (inviteType === 'oem') {
      const { data: network } = await supabaseAdmin
        .from('oem_networks')
        .select('name')
        .eq('owner_org_id', organization_id)
        .eq('status', 'active')
        .maybeSingle();
      dealershipName = network?.name || 'your OEM network';
    } else {
      const { data: dealershipRes } = await supabaseAdmin
        .from('dealerships')
        .select('name')
        .eq('id', dealership_id)
        .single();
      dealershipName = dealershipRes?.name || 'your dealership';
    }

    const subject =
      inviteType === 'oem'   ? `You've been invited as an OEM user for ${dealershipName}` :
      inviteType === 'coach' ? `You've been invited as a coach for ${dealershipName}` :
                               `You're invited to join ${dealershipName}`;

    const roleLabel = inviteRole.charAt(0).toUpperCase() + inviteRole.slice(1);
    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${resendApiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Dealership Assessment <invites@notify.performance-assessment.com>',
        to: [normalizedEmail],
        subject,
        html: buildInviteEmailHtml(dealershipName, inviterName, inviteUrl, roleLabel, inviteType),
      }),
    });
    if (resendRes.ok) emailSent = true;
  } catch (e) { console.error('Email error:', e); }
}
```

- [ ] **Step 6: Deploy the edge function**

Use `mcp__claude_ai_Supabase__deploy_edge_function` with:
- `project_id`: `xrypgosuyfdkkqafftae`
- `name`: `send-invite`
- Read the updated file content from `supabase/functions/send-invite/index.ts`

- [ ] **Step 7: Commit**

```bash
git add supabase/functions/send-invite/index.ts
git commit -m "feat(edge): add oem invite type to send-invite function"
```

---

## Task 5: accept_dealership_invite RPC — Add OEM Branch

**Files:**
- Applied via Supabase MCP (no local migration file needed — RPC is managed in DB)

- [ ] **Step 1: Read the current function definition**

Run via `mcp__claude_ai_Supabase__execute_sql`:
```sql
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'accept_dealership_invite';
```

Copy the output — you will need the full function body for the next step.

- [ ] **Step 2: Identify the coach branch in the function**

In the function body, find the block that handles `invite_type = 'coach'`:
```sql
-- It will look something like:
ELSIF v_invite.invite_type = 'coach' THEN
  INSERT INTO coach_dealership_assignments ...
  UPDATE profiles SET actor_type = 'coach' ...
  RETURN jsonb_build_object('invite_type', 'coach', ...);
```

- [ ] **Step 3: Add OEM branch immediately after the coach branch**

Insert this block after the coach ELSIF and before the END/ELSE:
```sql
ELSIF v_invite.invite_type = 'oem' THEN
  UPDATE profiles
    SET actor_type = 'oem'
    WHERE user_id = auth.uid();

  UPDATE profiles
    SET active_organization_id = v_invite.organization_id
    WHERE user_id = auth.uid();

  RETURN jsonb_build_object(
    'success', true,
    'invite_type', 'oem',
    'organization_id', v_invite.organization_id
  );
```

- [ ] **Step 4: Apply the updated function via Supabase MCP**

Use `mcp__claude_ai_Supabase__execute_sql` with the full updated `CREATE OR REPLACE FUNCTION accept_dealership_invite(...)` SQL including the OEM branch.

Expected output: success, function replaced.

- [ ] **Step 5: Verify via SQL**

```sql
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'accept_dealership_invite';
```

Confirm `invite_type = 'oem'` branch is present in the output.

---

## Task 6: InviteOemUser Component + Wiring

**Files:**
- Create: `src/components/InviteOemUser.tsx`
- Modify: `src/pages/OemSettings.tsx`
- Modify: `src/pages/AcceptInvite.tsx`

- [ ] **Step 1: Create `src/components/InviteOemUser.tsx`**

```tsx
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Globe, Loader2, Send, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingOemInvite {
  id: string;
  invited_email: string;
  expires_at: string;
  token: string;
}

export function InviteOemUser() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const { actorType } = useActiveRole();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingOemInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id,
  );
  const canInvite =
    actorType === 'oem' &&
    currentMembership &&
    ['owner', 'admin'].includes(currentMembership.role);

  const loadPendingInvites = useCallback(async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data } = await supabase
        .from('dealership_invites')
        .select('id, invited_email, expires_at, token')
        .eq('organization_id', currentOrganization.id)
        .eq('invite_type', 'oem')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      setPendingInvites((data as PendingOemInvite[]) ?? []);
    } finally {
      setLoadingInvites(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (canInvite && currentOrganization) loadPendingInvites();
  }, [canInvite, currentOrganization, loadPendingInvites]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrganization || !user) return;
    setIsSubmitting(true);
    setInviteUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invited_email: email.trim().toLowerCase(),
          organization_id: currentOrganization.id,
          invite_type: 'oem',
        },
      });
      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to send OEM invite');
        return;
      }
      setInviteUrl(data.invite_url);
      if (data.email_sent) {
        toast.success(`OEM invitation sent to ${email.trim().toLowerCase()}`);
      } else {
        toast.warning('Invite created but email could not be sent — copy the link below.');
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
    toast.success('OEM invite revoked');
    loadPendingInvites();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  if (!canInvite) return null;

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Invite OEM User
        </CardTitle>
        <CardDescription>
          OEM users can access the network dashboard and manage all enrolled dealerships.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oem-invite-email">Email address</Label>
            <Input
              id="oem-invite-email"
              type="email"
              placeholder="manager@oem.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send OEM Invitation</>}
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
            <h4 className="text-sm font-semibold text-muted-foreground">Pending OEM invites</h4>
            {pendingInvites.map(invite => {
              const isExpired = new Date(invite.expires_at) <= new Date();
              return (
                <div
                  key={invite.id}
                  className={cn(
                    'flex items-center justify-between border rounded-lg p-3',
                    isExpired && 'opacity-50',
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">OEM</Badge>
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

- [ ] **Step 2: Update `src/pages/OemSettings.tsx`**

```tsx
import { useActiveRole } from '@/hooks/useActiveRole';
import { OemNetworkSettings } from '@/components/OemNetworkSettings';
import { InviteOemUser } from '@/components/InviteOemUser';

export default function OemSettings() {
  const { actorType } = useActiveRole();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Network Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Configure your OEM network and manage enrolled dealerships.
        </p>
      </div>
      <OemNetworkSettings />
      {actorType === 'oem' && <InviteOemUser />}
    </div>
  );
}
```

- [ ] **Step 3: Update `src/pages/AcceptInvite.tsx` — add oem redirect**

Find line (~60):
```ts
const destination = result?.invite_type === 'coach' ? '/app/coach-dashboard' : '/app/assessment';
```

Replace with:
```ts
const destination =
  result?.invite_type === 'coach' ? '/app/coach-dashboard' :
  result?.invite_type === 'oem'   ? '/app/oem-dashboard' :
  '/app/assessment';
```

- [ ] **Step 4: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/InviteOemUser.tsx src/pages/OemSettings.tsx src/pages/AcceptInvite.tsx
git commit -m "feat(oem): add OEM invite flow — InviteOemUser component + accept redirect"
```

---

## Task 7: OemDashboard — Full Rewrite

**Files:**
- Rewrite: `src/pages/OemDashboard.tsx`

Replace the entire file with the new tabs-based layout. This is a complete rewrite — delete the current content and write the new version below.

- [ ] **Step 1: Verify Sheet component is available**

```bash
ls src/components/ui/sheet.tsx
```

If missing: `npx shadcn@latest add sheet` (confirm before running — check bundle size impact first).

- [ ] **Step 2: Rewrite `src/pages/OemDashboard.tsx`**

```tsx
import { useState, useEffect, useMemo } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { useActiveRole } from '@/hooks/useActiveRole';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useLanguage } from '@/contexts/LanguageContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { SharedLoadingState } from '@/components/shared/SharedLoadingState';
import { SharedEmptyState } from '@/components/shared/SharedEmptyState';
import { TierBadge } from '@/components/shared/TierBadge';
import { ScoreGauge } from '@/components/shared/ScoreGauge';
import {
  DEPT_KEYS, DEPT_LABELS, AT_RISK_THRESHOLD,
  parseDeptScores, getDeptCellClass, getDeptBgClass, getDeptTextClass,
  networkAvgByDept, getWeakestDept,
} from '@/lib/oemDashboardUtils';
import type { DeptKey } from '@/lib/oemDashboardUtils';
import {
  Globe, TrendingUp, TrendingDown, Minus, Users, Award, ArrowDown, ArrowUp,
  Settings, ClipboardList, Trophy, AlertTriangle, CheckCircle, MapPin,
} from 'lucide-react';
import type { Tables } from '@/integrations/supabase/types';

type OemNetwork = Tables<'oem_networks'>;

interface DealerScore {
  dealershipId: string;
  dealerName: string;
  location: string;
  programmeTier: string | null;
  latestScore: number | null;
  previousScore: number | null;
  latestAssessmentId: string | null;
  deptScores: Record<DeptKey, number | null>;
}

function getScoreBand(score: number): { label: string; className: string } {
  if (score >= 85) return { label: 'Advanced',     className: 'bg-[#16a34a]/10 text-[#16a34a] border-[#16a34a]/20' };
  if (score >= 70) return { label: 'Performing',   className: 'bg-[#2563eb]/10 text-[#2563eb] border-[#2563eb]/20' };
  if (score >= 46) return { label: 'Developing',   className: 'bg-[#d97706]/10 text-[#d97706] border-[#d97706]/20' };
  return             { label: 'Foundational', className: 'bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20' };
}

function getTrendIcon(latest: number | null, previous: number | null) {
  if (latest == null || previous == null) return <Minus className="w-4 h-4 text-muted-foreground" />;
  if (latest > previous) return <TrendingUp className="w-4 h-4 text-[#16a34a]" />;
  if (latest < previous) return <TrendingDown className="w-4 h-4 text-[#dc2626]" />;
  return <Minus className="w-4 h-4 text-muted-foreground" />;
}

function getRankStyle(rank: number): string {
  if (rank === 1) return 'border-l-4 border-l-[#d4a017]';
  if (rank === 2) return 'border-l-4 border-l-[#9ca3af]';
  if (rank === 3) return 'border-l-4 border-l-[#b87333]';
  return '';
}

function getRankBadgeClass(rank: number): string | null {
  if (rank === 1) return 'bg-[#d4a017]/10 text-[#d4a017] border-[#d4a017]/30';
  if (rank === 2) return 'bg-[#9ca3af]/10 text-[#9ca3af] border-[#9ca3af]/30';
  if (rank === 3) return 'bg-[#b87333]/10 text-[#b87333] border-[#b87333]/30';
  return null;
}

export default function OemDashboard() {
  const { actorType, loading: roleLoading } = useActiveRole();
  const { currentOrganization } = useMultiTenant();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const [networks, setNetworks] = useState<OemNetwork[]>([]);
  const [selectedNetworkId, setSelectedNetworkId] = useState<string | null>(null);
  const [dealerScores, setDealerScores] = useState<DealerScore[]>([]);
  const [loadingNetworks, setLoadingNetworks] = useState(true);
  const [loadingDealers, setLoadingDealers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [selectedDealer, setSelectedDealer] = useState<DealerScore | null>(null);

  useEffect(() => {
    if (!currentOrganization?.id) return;
    const fetchNetworks = async () => {
      setLoadingNetworks(true);
      const { data, error: err } = await supabase
        .from('oem_networks')
        .select('*')
        .eq('owner_org_id', currentOrganization.id)
        .eq('status', 'active');
      if (err) { setError(t('oem.loadError')); setLoadingNetworks(false); return; }
      setNetworks(data || []);
      if (data && data.length > 0) setSelectedNetworkId(data[0].id);
      setLoadingNetworks(false);
    };
    fetchNetworks();
  }, [currentOrganization?.id, t]);

  useEffect(() => {
    if (!selectedNetworkId) return;
    const fetchDealerScores = async () => {
      setLoadingDealers(true);
      setError(null);

      const { data: memberships, error: memErr } = await supabase
        .from('dealer_network_memberships')
        .select('dealership_id, programme_tier')
        .eq('network_id', selectedNetworkId)
        .eq('is_active', true);

      if (memErr || !memberships?.length) { setDealerScores([]); setLoadingDealers(false); return; }

      const tierByDealer = new Map<string, string | null>();
      for (const m of memberships) {
        if (m.dealership_id) tierByDealer.set(m.dealership_id, m.programme_tier ?? null);
      }

      const dealershipIds = memberships.map(m => m.dealership_id).filter((id): id is string => id != null);
      if (dealershipIds.length === 0) { setDealerScores([]); setLoadingDealers(false); return; }

      const { data: dealerships } = await supabase
        .from('dealerships')
        .select('id, name, location')
        .in('id', dealershipIds);

      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, overall_score, scores, created_at, dealership_id')
        .in('dealership_id', dealershipIds)
        .eq('status', 'completed')
        .order('created_at', { ascending: false });

      const dealerMap = new Map<string, DealerScore>();
      for (const d of dealerships || []) {
        dealerMap.set(d.id, {
          dealershipId: d.id,
          dealerName: d.name,
          location: d.location,
          programmeTier: tierByDealer.get(d.id) ?? null,
          latestScore: null,
          previousScore: null,
          latestAssessmentId: null,
          deptScores: parseDeptScores(null),
        });
      }

      const countMap = new Map<string, number>();
      for (const a of assessments || []) {
        const count = countMap.get(a.dealership_id) ?? 0;
        if (count >= 2) continue;
        const dealer = dealerMap.get(a.dealership_id);
        if (!dealer) continue;
        if (count === 0) {
          dealer.latestScore = a.overall_score ? Number(a.overall_score) : null;
          dealer.latestAssessmentId = a.id;
          dealer.deptScores = parseDeptScores(a.scores);
        } else {
          dealer.previousScore = a.overall_score ? Number(a.overall_score) : null;
        }
        countMap.set(a.dealership_id, count + 1);
      }

      setDealerScores(Array.from(dealerMap.values()));
      setLoadingDealers(false);
    };
    fetchDealerScores();
  }, [selectedNetworkId]);

  const sortedDealers = useMemo(() =>
    [...dealerScores].sort((a, b) => (b.latestScore ?? 0) - (a.latestScore ?? 0)),
    [dealerScores],
  );

  const filteredDealers = useMemo(() =>
    tierFilter === 'all' ? sortedDealers : sortedDealers.filter(d => d.programmeTier === tierFilter),
    [sortedDealers, tierFilter],
  );

  const atRiskDealers = useMemo(() =>
    sortedDealers.filter(d => (d.latestScore ?? 100) < AT_RISK_THRESHOLD),
    [sortedDealers],
  );

  const networkAvg = useMemo(() => networkAvgByDept(sortedDealers), [sortedDealers]);

  const stats = useMemo(() => {
    const scored = sortedDealers.filter(d => d.latestScore != null);
    const scores = scored.map(d => d.latestScore!);
    return {
      total: sortedDealers.length,
      avg:     scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0,
      highest: scores.length ? Math.max(...scores) : 0,
      lowest:  scores.length ? Math.min(...scores) : 0,
    };
  }, [sortedDealers]);

  if (roleLoading) return <SharedLoadingState />;
  if (actorType !== 'oem') return <Navigate to="/app/dashboard" replace />;
  if (loadingNetworks) return <SharedLoadingState />;
  if (error) return <div className="p-6"><SharedEmptyState title={t('oem.loadError')} description={error} /></div>;

  if (networks.length === 0) {
    return (
      <div className="p-6">
        <Card className="mx-auto mt-16 max-w-md rounded-xl border border-[hsl(var(--neutral-200))] shadow-card">
          <CardContent className="flex flex-col items-center gap-4 p-6 text-center">
            <Globe className="h-12 w-12 text-[hsl(var(--brand-300))]" />
            <div className="space-y-2">
              <h2 className="text-xl font-semibold text-[hsl(var(--neutral-900))]">Set up your OEM network</h2>
              <p className="text-sm text-[hsl(var(--neutral-600))]">
                Create your dealer network in Network Settings to start tracking performance.
              </p>
            </div>
            <Button onClick={() => navigate('/app/oem-settings')}>
              <Settings className="mr-2 h-4 w-4" />
              Go to Network Settings
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const summaryCards = [
    { label: t('oem.totalDealers'), value: stats.total,   icon: Users },
    { label: t('oem.avgScore'),     value: stats.avg,     icon: Award },
    { label: t('oem.highestScore'), value: stats.highest, icon: ArrowUp },
    { label: t('oem.lowestScore'),  value: stats.lowest,  icon: ArrowDown },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">{t('oem.title')}</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {networks.find(n => n.id === selectedNetworkId)?.oem_brand ?? ''}
          </p>
        </div>
        {networks.length > 1 && (
          <Select value={selectedNetworkId ?? ''} onValueChange={setSelectedNetworkId}>
            <SelectTrigger className="w-64">
              <Globe className="w-4 h-4 mr-2 shrink-0" />
              <SelectValue placeholder={t('oem.selectNetwork')} />
            </SelectTrigger>
            <SelectContent>
              {networks.map(n => (
                <SelectItem key={n.id} value={n.id}>{n.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-6">
          {/* Stat cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {summaryCards.map((card, i) => (
              <Card
                key={card.label}
                className="opacity-0 animate-fade-in shadow-card rounded-xl"
                style={{ animationDelay: `${i * 50}ms`, animationFillMode: 'forwards' }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <card.icon className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground uppercase tracking-wider">{card.label}</p>
                      <p className="text-2xl font-semibold text-foreground">{card.value}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Dept Weakness Heatmap */}
          {loadingDealers ? (
            <Card className="shadow-card rounded-xl">
              <CardContent className="p-6"><SharedLoadingState /></CardContent>
            </Card>
          ) : sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">Department Performance</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-4 font-medium text-muted-foreground w-48">Dealer</th>
                        {DEPT_KEYS.map(key => (
                          <th key={key} className="text-center py-2 px-2 font-medium text-muted-foreground w-16">
                            {DEPT_LABELS[key]}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {sortedDealers.map(dealer => (
                        <tr
                          key={dealer.dealershipId}
                          className="border-b last:border-0 hover:bg-muted/30 transition-colors cursor-pointer"
                          onClick={() => setSelectedDealer(dealer)}
                        >
                          <td className="py-2 px-4">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-sm truncate max-w-[160px]">{dealer.dealerName}</span>
                              <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                            </div>
                          </td>
                          {DEPT_KEYS.map(key => {
                            const score = dealer.deptScores[key];
                            return (
                              <td key={key} className="py-2 px-2 text-center">
                                {score !== null ? (
                                  <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                                    {Math.round(score)}
                                  </span>
                                ) : (
                                  <span className="text-muted-foreground text-xs">—</span>
                                )}
                              </td>
                            );
                          })}
                        </tr>
                      ))}
                      <tr className="bg-muted/30">
                        <td className="py-2 px-4 text-sm italic text-muted-foreground">Network avg</td>
                        {DEPT_KEYS.map(key => {
                          const score = networkAvg[key];
                          return (
                            <td key={key} className="py-2 px-2 text-center">
                              {score !== null ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(score)}`}>
                                  {score}
                                </span>
                              ) : (
                                <span className="text-muted-foreground text-xs">—</span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* At-Risk Dealers */}
          {!loadingDealers && sortedDealers.length > 0 && (
            <Card className="shadow-card rounded-xl">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-semibold">At-Risk Dealers</CardTitle>
              </CardHeader>
              <CardContent>
                {atRiskDealers.length === 0 ? (
                  <div className="flex items-center gap-3 p-4 bg-[#16a34a]/5 rounded-lg border border-[#16a34a]/20">
                    <CheckCircle className="h-5 w-5 text-[#16a34a] shrink-0" />
                    <p className="text-sm text-[#16a34a] font-medium">
                      All dealers performing above Foundational threshold
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-[#dc2626] mb-1">
                      <AlertTriangle className="h-4 w-4" />
                      <span className="text-sm font-medium">
                        {atRiskDealers.length} dealer{atRiskDealers.length > 1 ? 's' : ''} in Foundational band (score &lt; {AT_RISK_THRESHOLD})
                      </span>
                    </div>
                    {atRiskDealers.map(dealer => (
                      <div key={dealer.dealershipId} className="flex items-center justify-between border rounded-lg p-3">
                        <div className="flex items-center gap-3">
                          <div>
                            <p className="text-sm font-medium">{dealer.dealerName}</p>
                            <p className="text-xs text-muted-foreground">{dealer.location}</p>
                          </div>
                          <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                        </div>
                        <div className="flex items-center gap-2">
                          {dealer.latestScore !== null && (
                            <Badge variant="outline" className="bg-[#dc2626]/10 text-[#dc2626] border-[#dc2626]/20 text-xs">
                              {Math.round(dealer.latestScore)}
                            </Badge>
                          )}
                          <Button size="sm" variant="outline" onClick={() => setSelectedDealer(dealer)}>
                            View
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Leaderboard Tab ── */}
        <TabsContent value="leaderboard" className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {filteredDealers.length} dealer{filteredDealers.length !== 1 ? 's' : ''}
              {tierFilter !== 'all' ? ` · ${tierFilter}` : ''}
            </p>
            <Select value={tierFilter} onValueChange={setTierFilter}>
              <SelectTrigger className="w-44">
                <SelectValue placeholder="Filter by tier" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All tiers</SelectItem>
                <SelectItem value="Standard">Standard</SelectItem>
                <SelectItem value="Silver">Silver</SelectItem>
                <SelectItem value="Gold">Gold</SelectItem>
                <SelectItem value="Platinum">Platinum</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Card className="shadow-card rounded-xl">
            <CardContent className="p-0">
              {loadingDealers ? (
                <div className="p-6"><SharedLoadingState /></div>
              ) : filteredDealers.length === 0 ? (
                <div className="py-12 space-y-3 text-center">
                  <ClipboardList className="mx-auto h-8 w-8 text-[hsl(var(--neutral-400))]" />
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold text-[hsl(var(--neutral-900))]">
                      {tierFilter !== 'all' ? `No ${tierFilter} tier dealers` : 'No assessments yet'}
                    </h3>
                    <p className="mx-auto max-w-md text-sm text-[hsl(var(--neutral-600))]">
                      {tierFilter !== 'all'
                        ? 'Try a different tier filter or check Network Settings.'
                        : "Enrolled dealers haven't completed an assessment yet."}
                    </p>
                  </div>
                  {tierFilter !== 'all' && (
                    <Button variant="outline" size="sm" onClick={() => setTierFilter('all')}>
                      Clear filter
                    </Button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-16">{t('oem.rank')}</TableHead>
                        <TableHead>{t('oem.dealerName')}</TableHead>
                        <TableHead className="text-center hidden md:table-cell">Weakest Dept</TableHead>
                        <TableHead className="text-right">{t('oem.latestScore')}</TableHead>
                        <TableHead className="text-right hidden sm:table-cell">{t('oem.previousScore')}</TableHead>
                        <TableHead className="text-center hidden sm:table-cell">{t('oem.trend')}</TableHead>
                        <TableHead className="text-center">{t('oem.benchmarkBand')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDealers.map(dealer => {
                        const rank = sortedDealers.indexOf(dealer) + 1;
                        const band = dealer.latestScore != null ? getScoreBand(dealer.latestScore) : null;
                        const rankBadgeClass = getRankBadgeClass(rank);
                        const weakest = getWeakestDept(dealer.deptScores);
                        return (
                          <TableRow
                            key={dealer.dealershipId}
                            className={`cursor-pointer hover:bg-muted/50 transition-colors ${getRankStyle(rank)}`}
                            onClick={() => setSelectedDealer(dealer)}
                          >
                            <TableCell className="font-medium">
                              {rankBadgeClass ? (
                                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold ${rankBadgeClass}`}>
                                  {rank === 1 && <Trophy className="h-3 w-3" />}
                                  {rank}
                                </span>
                              ) : (
                                <span className="text-[hsl(var(--neutral-500))]">{rank}</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-medium text-foreground">{dealer.dealerName}</span>
                                <span className="text-xs text-muted-foreground">{dealer.location}</span>
                                <TierBadge tier={dealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                              </div>
                            </TableCell>
                            <TableCell className="text-center hidden md:table-cell">
                              {weakest ? (
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-semibold ${getDeptCellClass(weakest.score)}`}>
                                  {DEPT_LABELS[weakest.key]} {Math.round(weakest.score)}
                                </span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {dealer.latestScore != null ? (
                                <span className="font-semibold text-foreground">{Math.round(dealer.latestScore)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right hidden sm:table-cell">
                              {dealer.previousScore != null ? (
                                <span className="text-muted-foreground">{Math.round(dealer.previousScore)}</span>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center hidden sm:table-cell">
                              {getTrendIcon(dealer.latestScore, dealer.previousScore)}
                            </TableCell>
                            <TableCell className="text-center">
                              {band ? (
                                <Badge variant="outline" className={band.className}>{band.label}</Badge>
                              ) : (
                                <span className="text-muted-foreground">—</span>
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      <TableRow className="bg-[hsl(var(--neutral-050))] hover:bg-[hsl(var(--neutral-050))]">
                        <TableCell className="text-[hsl(var(--neutral-500))]">—</TableCell>
                        <TableCell><span className="italic text-[hsl(var(--neutral-600))]">Network average</span></TableCell>
                        <TableCell className="hidden md:table-cell" />
                        <TableCell className="text-right font-semibold text-foreground">{stats.avg}</TableCell>
                        <TableCell className="text-right hidden sm:table-cell text-muted-foreground">—</TableCell>
                        <TableCell className="text-center hidden sm:table-cell text-muted-foreground">—</TableCell>
                        <TableCell className="text-center">
                          <Badge variant="outline" className={getScoreBand(stats.avg).className}>
                            {getScoreBand(stats.avg).label}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dealer Drill-down Sheet */}
      <Sheet open={!!selectedDealer} onOpenChange={open => { if (!open) setSelectedDealer(null); }}>
        <SheetContent side="right" className="w-[480px] sm:w-[540px] overflow-y-auto">
          {selectedDealer && (
            <>
              <SheetHeader className="pb-4 border-b">
                <div className="flex items-start justify-between pr-6">
                  <div>
                    <SheetTitle className="text-lg font-semibold">{selectedDealer.dealerName}</SheetTitle>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      {selectedDealer.location}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <ScoreGauge score={selectedDealer.latestScore ?? 0} size={64} />
                    <TierBadge tier={selectedDealer.programmeTier as 'Standard' | 'Silver' | 'Gold' | 'Platinum' | null} size="sm" />
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6 pt-4">
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Department Scores</h3>
                  <div className="space-y-2">
                    {DEPT_KEYS.map(key => {
                      const score = selectedDealer.deptScores[key];
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <span className="w-10 text-xs font-medium text-muted-foreground">{DEPT_LABELS[key]}</span>
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            {score !== null && (
                              <div
                                className={`h-2 rounded-full ${getDeptBgClass(score)}`}
                                style={{ width: `${score}%` }}
                              />
                            )}
                          </div>
                          <span className={`text-xs font-semibold w-8 text-right ${score !== null ? getDeptTextClass(score) : 'text-muted-foreground'}`}>
                            {score !== null ? Math.round(score) : '—'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-3">Score History</h3>
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-xs text-muted-foreground">Latest</p>
                      <p className="text-2xl font-semibold text-foreground">
                        {selectedDealer.latestScore !== null ? Math.round(selectedDealer.latestScore) : '—'}
                      </p>
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon(selectedDealer.latestScore, selectedDealer.previousScore)}
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Previous</p>
                      <p className="text-lg font-medium text-muted-foreground">
                        {selectedDealer.previousScore !== null ? Math.round(selectedDealer.previousScore) : '—'}
                      </p>
                    </div>
                  </div>
                </div>

                {selectedDealer.latestAssessmentId && (
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => navigate(`/app/results/${selectedDealer.latestAssessmentId}`)}
                  >
                    Open Full Report →
                  </Button>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
```

- [ ] **Step 3: Build check**

```bash
npm run build
```

Expected: no TypeScript errors.

- [ ] **Step 4: Run full test suite**

```bash
npx vitest run
```

Expected: all tests pass including `oemDashboardUtils.test.ts`.

- [ ] **Step 5: Commit**

```bash
git add src/pages/OemDashboard.tsx
git commit -m "feat(oem): redesign OEM dashboard — tabs, dept heatmap, at-risk, leaderboard + drill-down sheet"
```

---

## Task 8: Smoke Test Checklist

Manual checks before marking Sprint 7 done. No code changes — verification only.

- [ ] **OEM Invite flow**
  - Log in as org owner with active `oem_network`
  - Go to `/app/oem-settings` → "Invite OEM User" card visible
  - Enter a test email → "Send OEM Invitation" → invite created, copy link visible
  - Open invite link in a different browser/incognito
  - Sign up / log in → redirected to `/app/oem-dashboard` ✓
  - Check `profiles` table: `actor_type = 'oem'` set for new user ✓

- [ ] **OEM Dashboard — Overview tab**
  - Load `/app/oem-dashboard` → Overview tab shown by default ✓
  - Stat cards render (Total / Avg / Highest / Lowest) ✓
  - Dept heatmap shows 5 columns (NVS / UVS / SVC / PTS / FIN) with colour-coded scores ✓
  - Network avg row at bottom of heatmap ✓
  - At-Risk card: if any dealer score < 46, shows alert list; else shows green "all clear" ✓
  - Clicking a heatmap row opens drill-down Sheet ✓

- [ ] **OEM Dashboard — Leaderboard tab**
  - Tier filter Select works — filters table client-side ✓
  - Leaderboard table shows Weakest Dept column ✓
  - Clicking a row opens Sheet (not navigate away) ✓
  - Sheet shows: dealer name, location, ScoreGauge, TierBadge, dept score bars, history, "Open Full Report" button ✓
  - "Open Full Report" navigates to `/app/results/:id` ✓

- [ ] **CoachDashboard still works**
  - Log in as coach → ScoreGauge renders correctly (now from shared component) ✓

- [ ] **Final commit if any smoke-test fixes were needed**

```bash
git add -p
git commit -m "fix(oem): smoke test corrections"
```
