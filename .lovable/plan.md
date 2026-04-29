I’m currently in read-only plan mode, so I cannot make the edits yet. Once approved, I will implement the requested visual-only changes with the following guardrails.

## Scope

Update only the two requested files:

1. `src/components/OemModeToggle.tsx`
2. `src/pages/OemDashboard.tsx`

No Supabase files, hooks, integrations, scoring, state logic, data-fetching logic, or routes will be changed.

## Important constraint note

Your prompt lists `src/components/OemModeToggle.tsx` and `src/pages/OemDashboard.tsx` under “Do not touch”, but Tasks 1 and 2 explicitly require changes in those exact files. I will treat the task-specific instructions as explicit permission to edit only the requested JSX/styling blocks in those two files, while preserving all handlers, queries, RPC calls, state, and data flow unchanged.

## Implementation plan

### 1. OemModeToggle enterprise styling

In `src/components/OemModeToggle.tsx`, I will make a visual-only pass:

- Keep the existing `useState`, `useNavigate`, `useActiveRole`, `useMultiTenant`, `supabase.rpc`, `toast`, `handleActivate`, and `handleDeactivate` logic unchanged.
- Add only the icon import needed for the inactive feature preview, likely `Check` from `lucide-react`.
- Change the card shell to:
  - inactive: `border-[hsl(var(--neutral-200))]` with no `shadow-card`
  - active: `border-[hsl(var(--brand-300))] shadow-card` plus subtle `bg-[hsl(var(--brand-050))]` tint
- Replace the current green active `Badge` with an active programme row:
  - filled/brand `Globe` icon in `text-[hsl(var(--brand-500))]`
  - “OEM Programme Active” in `text-sm font-medium`
- Restyle the title to `text-sm font-semibold text-[hsl(var(--neutral-900))]`.
- Add the inactive 3-column preview row below the description:
  - “Network leaderboard”
  - “Dealer score tracking”
  - “Programme tier management”
  - each with a small checkmark in `text-[hsl(var(--brand-400))]` and label `text-xs text-[hsl(var(--neutral-600))]`
- Restyle the activate button to stay `variant="default"`, include a `Globe` icon, and keep `onClick={handleActivate}` / `disabled={loading}` unchanged.
- Replace the deactivate ghost button chrome with a minimal text-style control:
  - `text-xs text-[hsl(var(--neutral-500))] hover:text-destructive`
  - same `onClick={handleDeactivate}` and `disabled={loading}` behavior

### 2. OEM Dashboard “No network yet” empty state

In `src/pages/OemDashboard.tsx`, I will modify only the `if (networks.length === 0)` return block:

- Replace the plain `SharedEmptyState` with a centered `Card` using existing shadcn primitives already present or imported as needed.
- Layout:
  - wrapper: `p-6`
  - card: `max-w-md mx-auto mt-16`
  - centered content with existing spacing scale only
- Add a large `Globe` icon:
  - `h-12 w-12 text-[hsl(var(--brand-300))]`
- Add heading:
  - “Set up your OEM network”
  - `text-xl font-semibold text-[hsl(var(--neutral-900))]`
- Add body copy:
  - “Create your dealer network in Network Settings to start tracking performance across your pilot dealerships.”
  - `text-sm text-[hsl(var(--neutral-600))]`
- Add a primary button:
  - Settings icon
  - “Go to Network Settings”
  - `onClick={() => navigate('/app/oem-settings')}`
- Leave every other dashboard branch, query, calculation, and rendering path unchanged.

## DESIGN.md compliance

The changes will use only existing DESIGN.md / tokenized values:

- Brand colours: `--brand-050`, `--brand-300`, `--brand-400`, `--brand-500`
- Neutral colours: `--neutral-200`, `--neutral-500`, `--neutral-600`, `--neutral-900`
- Existing semantic destructive token for the deactivate hover state
- Existing spacing scale: `p-4`, `p-6`, `gap-2`, `gap-3`, `gap-4`, `mt-16`
- Existing components: `Card`, `CardHeader`, `CardContent`, `Button`
- Existing Lucide icon system

## Acceptance checks after implementation

After the edits, I will ensure:

- No new npm packages are installed.
- No new routes are added.
- Supabase calls, RPC calls, state hooks, handlers, and data fetching remain unchanged.
- TypeScript remains valid; the automatic harness/build check should cover `tsc --noEmit` equivalent validation.