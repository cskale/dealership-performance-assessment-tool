

## Verification Summary

- **Landing file:** `src/pages/Index.tsx`
- **ProductSneakPeek:** Confirmed present at `src/components/landing/ProductSneakPeek.tsx`
- **Hero right column (A):** `<div className="mt-12 lg:mt-0">` — line 152, no inline style
- **Sneak Peek wrapper (B):** `<section ref={section.ref} className="bg-background py-20 px-6 lg:px-8">` — line 65 of ProductSneakPeek.tsx, no inline style
- **Proof Pillars wrapper (C):** `<section className="bg-background py-20 px-6 lg:px-8">` — line 288, no inline style
- **Closing CTA wrapper (D):** `<section className="bg-foreground">` — line 342, no inline style
- **VERIFICATION 4 CONFIRMED** — inline styles only, no global CSS modifications

---

## Plan: Four Background Polish Changes

### Change A — Hero right column dot grid
**File:** `src/pages/Index.tsx` line 152
Add inline style to `<div className="mt-12 lg:mt-0">`:
```
style={{ backgroundImage: 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)', backgroundSize: '20px 20px' }}
```

### Change B — Sneak Peek ruled lines
**File:** `src/components/landing/ProductSneakPeek.tsx` line 65
Add inline style to the outer `<section>` (merge with existing ref):
```
style={{ backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 39px, #f1f5f9 39px, #f1f5f9 40px)' }}
```

### Change C — Proof Pillars tone shift
**File:** `src/pages/Index.tsx` line 288
Replace `bg-background` with `bg-slate-50` in the section className.

### Change D — Closing CTA inverted dot grid
**File:** `src/pages/Index.tsx` line 342
Add inline style to `<section className="bg-foreground">`:
```
style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.07) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
```

### Files modified
| File | Lines changed |
|---|---|
| `src/pages/Index.tsx` | 3 lines (152, 288, 342) |
| `src/components/landing/ProductSneakPeek.tsx` | 1 line (65) |

No new files. No layout/copy/logic changes. No global CSS touched.

