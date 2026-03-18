

# Convert Action Sheet from Side Drawer to Centered Dialog

## Problem
The action editor currently slides in from the right as a 520px-wide `Sheet`. This constrains the content (Context Intelligence, triage sliders, KPI details) and feels cramped, especially on wider screens.

## Solution
Replace the `Sheet` wrapper with a `Dialog` component, centered on screen with a max-width of ~900px. This gives roughly 70% more horizontal space for content while keeping the same internal layout and all existing functionality.

## Changes

### `src/components/ActionSheet.tsx`
1. **Replace imports**: Swap `Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter` with `Dialog, DialogContent, DialogHeader, DialogTitle` from `@/components/ui/dialog`
2. **Outer wrapper**: Change `<Sheet>` → `<Dialog>`, `<SheetContent>` → `<DialogContent>` with class `max-w-[900px] w-[95vw] max-h-[90vh] p-0 flex flex-col`
3. **Header**: `<SheetHeader>` → `<DialogHeader>`, `<SheetTitle>` → `<DialogTitle>` — preserve all tab buttons, badges, department display
4. **Footer**: `<SheetFooter>` → a plain `<div>` with the same sticky footer styling (border-t, flex layout) since DialogFooter has different defaults
5. **Remove `side="right"`** — Dialog is naturally centered
6. **Keep all internal content identical** — Context Intelligence, triage sliders, KPI panel, history tab, form fields, save/delete handlers — nothing changes inside

### Layout approach
- Two-column layout inside the dialog when in edit mode on wider screens: left column for editable form fields (title, description, status, priority, owner, date, triage sliders), right column for read-only Context Intelligence and KPI linkage
- Single column on narrower viewports via responsive classes (`grid grid-cols-1 lg:grid-cols-2`)
- This maximizes the wider dialog space rather than just stretching a single column

### No other files change
The `ActionSheet` is already used as a self-contained component called from `ActionPlan.tsx` with the same props interface (`open`, `onOpenChange`, `action`, `mode`, `onSave`, `onDelete`, `readOnly`). The `Dialog` component accepts identical `open`/`onOpenChange` props, so no caller changes are needed.

