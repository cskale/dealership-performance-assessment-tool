# Changelog

All notable changes to the Dealer Diagnostic & Performance Assessment Tool are documented here.

Format: `[Layer] Action — Notes`
Layers: `Database` · `Frontend` · `Security` · `UX/UI` · `Dev Env`
Statuses: `Deployed` · `Ready to Apply` · `Designed`

---

## [Sprint 2] — In Progress

### Designed
- `[UX/UI]` 5-screen onboarding welcome flow — Replaces direct-to-assessment experience. Screens: role identification → value preview (blurred sample output) → baseline framing → module intro → first action CTA.
- `[UX/UI]` Results section — Coaching Hub redesign — Redundant CTA card removed. Tab renamed to "Coaching Hub". Three sub-tabs replaced with stacked sections: Priority Improvement Areas → KPI Reference → Templates & Downloads. Lovable prompt produced targeting `UsefulResources.tsx` and `Results.tsx`.
- `[UX/UI]` Interactive onboarding architecture — Role-differentiated first-run paths for Dealer Owner, Coach, and OEM Admin. Getting Started checklist, coached empty states, and outcome-framed progress language specified. Must be built simultaneously with role architecture fix.

### Ready to Apply
- `[Frontend]` 6 TypeScript fix files — Zero Lovable credits required. Covers: (1) Lucide icon replacement for all emoji, (2) human-readable weight labels replacing internal notation, (3) constructive triage quadrant label renaming, (4) complete narrative templates system, (5) formula-driven triage scoring function, (6) business model filters with role-addressed implementation steps for all action templates.

---

## [Sprint 1] — 20–21 March 2026

### Deployed

#### 21 March 2026
- `[Frontend]` `useActiveRole.tsx` — MembershipRole type fix — TypeScript type corrected from 5-role model (`owner/admin/manager/analyst/viewer`) to 4-role model (`owner/admin/member/viewer`) matching current DB enum. Applied via Claude Code, committed to `main`. Resolves 3-way conflict between DB enum, `useMultiTenant`, and `useActiveRole` — role system now consistent across all layers for the first time.

#### 20 March 2026
- `[Database]` Legacy role system teardown — Dropped `user_roles` table, `app_role` enum, `has_role()` function, and `get_user_dealer_id()` function via Supabase MCP migrations. Removed ghost `analyst` role confirmed to have zero RLS policy backing. Eliminates silent permission failures in production.
- `[Database]` Role enum unified to 4-role model — `membership_role` compressed from 5-role model (`owner/admin/manager/analyst/viewer`) to `owner/admin/member/viewer`. 26+ RLS policies recreated across 9 tables including storage. Single source of truth for roles across entire auth layer.
- `[Database]` Assessment data integrity constraints — Score range constraints (0–100) and assessment status constraints added at DB level. Prevents corrupt assessment records and protects scoring integrity for exports and benchmarking.
- `[Security]` `actor_type` self-edit block — Trigger `trg_prevent_actor_type_self_edit` deployed. Blocked escalation attempts automatically logged to `access_audit_log` with timestamp. Closes privilege escalation path; begins OEM-grade audit trail.
- `[Security]` All 20 public functions hardened — `SET search_path = public` added to all functions. `export_user_data` and `delete_user_account` patched with `(SELECT auth.uid())` subquery pattern. Closes SQL injection vector via search_path manipulation.
- `[Security]` `send-invite` Edge Function hardened — Rate limiting (10 invites/hour per org), duplicate invite prevention, owner-role invite blocking, and UUID validation added. Prevents invite spam and blocks role-elevation exploit path.
- `[Security]` `check-anon-key` diagnostic endpoint neutered — Edge function now returns 404 unconditionally. Removes a public endpoint that was exposing deployment diagnostics.
- `[Security]` Auth hardening: MFA, captcha, invite-only — MFA/TOTP confirmed enabled. hCaptcha configured with secret key. Open signups disabled — tool is now invite-only. Required baseline for any OEM or enterprise deployment.
- `[UX/UI]` Account/Profile page redesign — Horizontal tabs replaced with vertical sidebar layout. Inline edit sections, password change/reset flow, profile completion ring, and stat cards added. UUID display in team members replaced with real display names from `profiles` table.
- `[Frontend]` Primary blue corrected to `#0052CC` — Colour corrected throughout Account page to match Export PDF button. Previously inconsistent `#185FA5` value removed. Eliminates visual inconsistency flagged as a prototype signal in OEM demo contexts.

---

## [Sprint 0] — Foundation — 21 March 2026

### Deployed
- `[Dev Env]` VS Code + Claude Code local environment — Stale branch (`revert-to-21afbe`) corrected to `main`. Dependencies installed. Claude Code v2.1.81 installed via npm, authenticated with Claude Pro on Sonnet 4.6 model. `CLAUDE.md` auto-generated via `/init` capturing project structure, dev commands, and testing setup. Committed and pushed to `main`. Enables zero-credit code changes bypassing Lovable's per-edit credit model.
- `[Dev Env]` Sprint backlog classified and sequenced — 53 improvement items catalogued across 9 categories with implementation status tracking. Items split into two tracks: zero-UI fixes (no Lovable required) and UI-centric (Lovable required). 7 existing Lovable implementation prompts confirmed ready to run.

---

## Backlog Snapshot

| Status | Count |
|---|---|
| Deployed | 13 |
| Ready to Apply | 1 (6 fix files) |
| Designed (Lovable prompt ready) | 3 |
| **Total logged** | **17** |

---

## How to update this file

At the end of each working session, say **"log today's session"** in Claude.
Claude Code will append new entries under the correct sprint heading using the format above.

For weekly exports: open Claude, upload this file, say **"generate Excel changelog"**.
