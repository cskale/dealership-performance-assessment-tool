

## Plan: Fix QuestionCard outer grid (single-column bug)

### Root cause

The previous edit set the outer wrapper to:

```tsx
<div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '24px' }}
     className="question-card-grid">
```

…and added a `@media (min-width: 768px) { .question-card-grid { grid-template-columns: 3fr 2fr; } }` rule to `src/index.css`.

**Inline `style` always wins over stylesheet rules** (including media queries). So `gridTemplateColumns: '1fr'`永 overrides the desktop `3fr 2fr` rule, and the layout stays single-column at every viewport. That's why the right panel is rendering below the question instead of beside it.

### Fix — outer wrapper only

**File:** `src/components/assessment/QuestionCard.tsx` (line 133–134)

Replace the inline-style + custom-class wrapper with a pure Tailwind grid:

```tsx
<div className="grid grid-cols-1 md:grid-cols-[3fr_2fr] gap-6">
```

This:
- removes the inline `style` that was overriding the media query
- uses Tailwind's arbitrary-value grid syntax for the exact 60/40 split (3fr/2fr ≈ 60%/40%, same ratio as the previous CSS rule)
- matches the proven grid pattern used in ActionSheet (Edit Action modal screenshot)
- works at the project's `md` breakpoint (768px) — same as the right panel's `hidden md:block`

### Cleanup — remove dead CSS

**File:** `src/index.css` (lines 212–215)

Delete the now-unused `.question-card-grid` media-query block:

```css
@media (min-width: 768px) {
  .question-card-grid {
    grid-template-columns: 3fr 2fr;
  }
}
```

No other rule references this class.

### Not changed

- Left column content, rating tiles, notes textarea — untouched
- Right column (`hidden md:block` sticky context panel) — untouched, already correct
- Mobile context block (`md:hidden`) — untouched
- All state, logic, props, translations — untouched
- No other file modified

### Result

- Mobile (<768px): single column, context panel renders below rating tiles via the existing `md:hidden` block
- Desktop (≥768px): true two-column grid — question/tiles/notes left (60%), persistent "Why This Matters" panel right (40%), matching the Edit Action modal pattern from the reference screenshot

