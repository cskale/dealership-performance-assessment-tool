# Security Policy — Dealer Diagnostic Platform

**Last reviewed:** 2 June 2026  
**Applies to:** Production deployment at `https://dealership-performance-assessment-t.vercel.app`  
**Supabase project:** `xrypgosuyfdkkqafftae`

---

## Supported Versions

| Version | Supported |
|---------|-----------|
| `main` branch (current production) | ✅ Active |
| Any prior branch or snapshot | ❌ Not supported |

All security patches are applied directly to `main` and deployed to Vercel automatically. There are no versioned release branches.

---

## Reporting a Vulnerability

**Please do not open a public GitHub issue for security findings.** Disclosing a vulnerability publicly before it is patched puts all active users at risk.

### Contact

Email: **chankale310@gmail.com**  
Subject line: `[SECURITY] Dealer Diagnostic — <brief description>`

Include in your report:
1. **Type of vulnerability** (e.g. authentication bypass, RLS bypass, data exfiltration, injection)
2. **Affected surface** (route, component, Edge Function, RPC, table)
3. **Steps to reproduce** — precise enough to confirm and replicate
4. **Proof of concept** — curl commands, screenshots, or a minimal script (where safe to include)
5. **Impact assessment** — what data or capabilities could an attacker access?
6. **Your proposed mitigation** (optional but appreciated)

### Response Commitments

| Milestone | Target |
|-----------|--------|
| Acknowledgement | Within 2 business days |
| Severity classification | Within 5 business days |
| Patch or remediation plan | Within 14 business days for CRITICAL/HIGH |
| Public disclosure | Coordinated — 90 days after acknowledgement (or sooner if patched) |

We will credit reporters in the Security section of the release notes unless you request anonymity.

---

## Scope

### In Scope

| Surface | Examples |
|---------|---------|
| Authentication flows | Login, invite acceptance, session management |
| Row Level Security (RLS) | Cross-tenant data access, actor type bypass |
| Edge Functions | Unauthenticated access, arbitrary email relay, JWT validation bypass |
| Database RPCs | SECURITY DEFINER function privilege escalation |
| Invite system | Token reuse, expiry bypass, email spoofing |
| Actor type system | `dealer → oem/coach` escalation via client-side calls |
| Input handling | SQL injection, HTML injection in email templates, reflected XSS |
| Multi-tenancy boundary | OEM admin reading another OEM's dealer data |

### Out of Scope

- Denial-of-service attacks against the Vercel or Supabase infrastructure layer
- Social engineering attacks against employees or users
- Physical security
- Issues requiring physical access to a device
- UI-only cosmetic issues with no data security impact
- Rate limiting / brute force (handled by Supabase Auth layer)
- Vulnerabilities in third-party dependencies that have no exploitable attack surface in this application
- Issues in test/dev environments that are not reproducible in production

---

## Security Architecture

### Authentication

All authentication is managed by **Supabase Auth** (GoTrue). JWTs are issued by Supabase and validated on every request. The anon key is intentionally public (standard Supabase pattern); no secrets are embedded in the frontend bundle.

```
Browser → Supabase Auth (JWT) → RLS-enforced Postgres queries
Browser → Vercel Edge → Supabase Edge Functions (verify_jwt=true)
```

### Authorisation — Row Level Security

All database tables have **Row Level Security enabled**. Direct client-to-Postgres access is restricted by RLS policies on every table. There are no tables with RLS disabled in production.

Key policy patterns:

| Pattern | Usage |
|---------|-------|
| `auth.uid() = user_id` | User reads/writes own rows |
| `auth.uid() IN (SELECT user_id FROM memberships WHERE org_id = ...)` | Org-scoped access |
| `private.caller_is_verified_oem()` | OEM cross-org access (SECURITY DEFINER guard) |
| `WITH CHECK (actor_type = actor_type)` | Prevents actor_type self-escalation |

### Cross-Organisation Queries

Cross-tenant joins are **never performed via client-side RLS policies** (which can cause infinite recursion and privilege leaks). All cross-org queries use:

1. **`SECURITY DEFINER` functions** in the `private` schema — these run as the function owner (superuser context) but validate the caller's identity internally before returning data
2. **Helper guards** such as `private.caller_is_verified_oem()` and `private.user_is_member_of_network_owner()` that check `actor_type` AND active network ownership before executing

No `SECURITY DEFINER` function returns more than the minimum required fields.

### Actor Type System

`profiles.actor_type` is the primary role field controlling portal routing and data access. Rules:

- The `profiles` UPDATE policy includes a `WITH CHECK` clause preventing any client-side update from modifying `actor_type`
- `actor_type` changes are only permitted through named SECURITY DEFINER RPCs (`accept_dealership_invite`)
- The invite flow validates token ownership and email match (DB-level, with `FOR UPDATE` lock) before setting actor type

### Edge Functions

All production Edge Functions use `verify_jwt = true` in `supabase/config.toml`. Edge Functions that need to perform admin operations use the `SUPABASE_SERVICE_ROLE_KEY` environment variable (set in Vercel / Supabase secrets — never committed to the repository).

The one exception is `action-token-update` (tokenised one-click email reply), which is intentionally public (`verify_jwt=false`) with HMAC-SHA-256 signed single-use nonce tokens. Token validation: `action_id + user_id + 72h expiry`, verified before any DB write.

### Secrets Management

| Secret | Location | Status |
|--------|----------|--------|
| `VITE_SUPABASE_ANON_KEY` | Vercel env + `.env` (not committed) | Public by design (Supabase standard) |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel env + Supabase secrets only | Never committed — confirmed via git history audit (May 2026) |
| `RESEND_API_KEY` | Supabase Edge Function secrets | Never committed — confirmed via git history audit (May 2026) |
| Cron anon key (hardcoded in SQL) | `cron_use_anon_key.sql` | Accepted low risk (anon key is public by design) |

### Transport Security

- All traffic served over HTTPS via Vercel (automatic TLS)
- Supabase connections use TLS in transit
- No plain-HTTP endpoints

---

## Security Patch History

Documented in full in [CHANGELOG.md](CHANGELOG.md). Summary of all patched findings:

### May 2026 — Security Audit Sprint (#50)

| Severity | Finding | Fix | Commit |
|----------|---------|-----|--------|
| **HIGH** | `send-notification` Edge Function had no authentication — any external caller could send arbitrary emails via the Resend account | Added `verify_jwt=true` to `config.toml` + explicit `role === 'service_role'` check inside the function | `a841a22` |
| **HIGH** | `notify-dispatcher` accepted arbitrary `email_to` values — enabled spam relay to any address | `verify_jwt=true` added; `email_to` now validated against the recipient's registered email via `supabaseAdmin.auth.admin.getUserById()` before sending | `a841a22` |
| **MEDIUM** | HTML injection in invite emails — `inviterName`, `dealershipName`, `roleLabel` interpolated into HTML without escaping | `escapeHtml()` helper added; all user-controlled values escaped before template interpolation | `a841a22` |
| **MEDIUM** | `lookup_dealer_by_email` RPC returned `organization_id` — OEM admin could map competitor email addresses to org identities | `organization_id` removed from RPC response (migration `20260519140000`) | `a841a22` |

### May 2026 — Sprint 4 (#55)

| Severity | Finding | Fix | Migration |
|----------|---------|-----|-----------|
| **HIGH** | `profiles` UPDATE policy lacked `WITH CHECK` — any authenticated user could escalate their own `actor_type` to `'oem'` via direct client call | `WITH CHECK` added: `actor_type` changes blocked at policy level; changes must go through SECURITY DEFINER functions | `20260514000000` |

### Cleared as False Positives (May 2026 Audit)

- **Invite token reuse** — email match enforced at DB level, `FOR UPDATE` lock, 7-day expiry, single-use status flag. Well-hardened.
- **`action_audit_log` 403** — RLS correctly returns 403 on client inserts; inserts happen via DB trigger only. No data leak — functional limitation only.
- **CoachDashboard actor_type enforcement** — client-side check is defence-in-depth; RLS on `coach_dealership_assignments` provides server-side enforcement.

---

## Known Non-Security Issues

The following are known functional issues that do not constitute security vulnerabilities:

| Issue | Why Not a Security Issue |
|-------|--------------------------|
| `useOnboarding` RLS false negatives on first load | Timing race; no data leak — hook preserves the locally stored value, does not expose other orgs' data |
| `DialogContent` accessibility warnings (missing `DialogTitle`) | Accessibility UX issue; no auth or data impact |
| `action_audit_log` client 403 | By design — inserts go via trigger; RLS correctly rejects direct client writes |

---

## Security Roadmap

| Item | Priority | Notes |
|------|----------|-------|
| Content Security Policy (CSP) headers | Medium | Add via Vercel `vercel.json` headers config |
| Supabase Audit Logs review cadence | Medium | Monthly review of auth events for anomalous patterns |
| Rate limiting on invite flow | Low | Supabase Auth handles brute force; invite token design is single-use |
| Penetration test (external) | Low — defer to Series A / OEM enterprise contract requirement | Full audit pre-OEM network launch |
| SOC 2 Type I | Planned — OEM enterprise requirement | Requires formal process documentation; target: 12 months |
