
## Plan: Fix QuestionCard accordion removal + two-column layout (#46 correction)

The requested change will be applied in the real file path: `src/components/assessment/QuestionCard.tsx`. The prompt refers to `src/components/QuestionCard.tsx`, but the component currently lives under `assessment/`.

### File modified
- `src/components/assessment/QuestionCard.tsx`

### What will change

#### 1. Remove the accordion/collapsible entirely
Delete any remaining accordion-style wrapper behavior for the context area so the content is never hidden behind a toggle.

This includes:
- removing the trigger button for “Why This Question Matters”
- removing the chevron/toggle UI
- removing any accordion/collapsible wrapper elements around the context sections
- removing any open/closed state that existed only for that accordion

The context sections themselves stay exactly the same in content and order:
- Assessment Purpose
- Situation Analysis
- Linked KPIs
- Business Benefits

#### 2. Apply the exact two-column desktop layout
Replace the outer wrapper with:

```tsx
className="grid grid-cols-1 md:grid-cols-[60%_40%] gap-6"
```

Layout behavior:
- **Left column:** question header, rating tiles, selected confirmation, notes toggle, notes textarea
- **Right column:** always-visible context panel

No rating tile styling, save logic, question data, or note behavior will be changed.

#### 3. Desktop context panel
Render the desktop context panel exactly as a separate right-side block:

```tsx
<div className="hidden md:block">
  <div className="sticky top-4 rounded-[10px] border border-border bg-muted/40 p-5">
    <p className="text-[10px] uppercase tracking-[0.08em] text-muted-foreground mb-4">
      Why This Matters
    </p>
    [context sections here]
  </div>
</div>
```

Implementation details:
- keep the existing section render logic
- keep the existing icons and KPI pills
- keep the empty state when all sections are missing
- context is always visible on desktop, never collapsible

#### 4. Mobile context block
Add a separate mobile-only context block directly below the left-column content:

```tsx
<div className="md:hidden mt-4">
  [same context sections]
</div>
```

This ensures:
- desktop = side panel
- mobile = stacked below rating area
- same context content in both places
- no toggle anywhere

### What stays unchanged
- rating tiles and selected state styling
- notes toggle and textarea behavior
- question text, description, category badge
- weight label helper
- answer handling and `onChange`
- all data sources from `question`
- all other files

### Technical implementation notes
- keep `showNotes` and `notes` state
- do not add new props
- reuse the existing `sections` array render pattern so the context content remains identical
- preserve the current empty-state message when no context exists
- only restructure JSX and remove any remaining collapsible remnants

### Validation target
After implementation, `QuestionCard` should have:
- no accordion UI at all
- no chevron/toggle button
- exact `md:grid-cols-[60%_40%]` desktop layout
- desktop sticky side panel
- mobile stacked context block
- zero changes outside `src/components/assessment/QuestionCard.tsx`
