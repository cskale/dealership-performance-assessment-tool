

## Revised Plan: Dark-Light-Dark Colour Rhythm

Same as the approved plan with **one modification**: Change 5 keeps the existing metrics content exactly as-is.

---

### Change 5 — Metrics Bar: Dark navy background only (content unchanged)

**Target:** Lines 317–337

**What changes:**
- Section wrapper: remove `bg-white border-y border-border`, add inline style `backgroundColor: '#0A0F1E'` + dot grid
- Border separators: `lg:border-border` → `lg:border-white/10`
- Number text: `text-foreground` → `text-white`
- Label text: `text-muted-foreground` → `text-white/60`

**What stays exactly the same:**
- All 5 metrics: 5 (Departments Assessed), 111 (KPIs Tracked), 27 (Tiered Action Templates), 22 (Signal Codes), 18 (Fields per Action Record)
- Grid layout, AnimatedCounter, scroll-reveal animation
- METRICS constant array — zero edits

### All other changes (1, 2, 3, 4, 6, 7) remain identical to the approved plan

| Change | Target | Summary |
|--------|--------|---------|
| 1 | Hero section | Dark navy #0A0F1E + crosshatch grid + all text → white |
| 2 | Pipeline | Pure white (already correct) |
| 3 | Sneak Peek | backgroundColor: #F0F4F8, remove ruled lines |
| 4 | Proof Pillars | bg-slate-50 → bg-white |
| 5 | Metrics Bar | Dark navy background only — keep all 5 existing metrics |
| 6 | Closing CTA | backgroundColor: #0A0F1E, merge dot grid |
| 7 | Hero headline | "Diagnose. Prioritise. Improve." + new subline |

**Files:** `src/pages/Index.tsx`, `src/components/landing/ProductSneakPeek.tsx`

