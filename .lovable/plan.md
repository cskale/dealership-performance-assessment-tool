

## Verification Summary

- **Brand token:** `brand-500` (with scale 50–700). Primary is `primary` (same HSL as brand-500). Will use `brand-500` for accent elements and `primary` for Button variants.
- **Background token:** `bg-background` (maps to `0 0% 100%` = white). Neutral lightest is `bg-neutral-50`.
- **Landing file:** `src/pages/Index.tsx` — renders at route `/`
- **Navbar:** Present — `HomeHeader` component imported. Will keep it.
- **Footer:** Present — `Footer` component imported. Will keep it.
- **Button variants:** `default`, `destructive`, `outline`, `secondary`, `ghost`, `link`. Sizes: `default`, `sm`, `lg`, `icon`.
- **Badge variants:** Present with many variants including `default`, `secondary`, `outline`, etc.
- **Methodology route:** Exists at `/methodology`. Will use `href="/methodology"`.

---

## Plan: Rebuild Hero Landing Page

**Single file change:** `src/pages/Index.tsx` — complete rewrite of the page body while preserving `HomeHeader` and `Footer` imports and the auth redirect logic.

### Structure (7 sections in order)

1. **Navbar** — Keep existing `<HomeHeader>` as-is
2. **Hero** — Two-column split (copy left, product preview card right). Eyebrow chip with `bg-brand-500/10 text-brand-500 border-brand-500/20`. Headline with "Auditable" in `text-brand-500`. Two CTAs using Button `default` + `outline` variants. Trust strip below.
3. **Pipeline Visual** — 6-step horizontal grid on `bg-white border-y border-border`. Steps: Assessment Answers → Scoring Engine → Signal Engine → Template Lookup → Context Intelligence → Action Plan.
4. **Three Proof Pillars** — On `bg-background`. Three cards with TrendingUp, Shield, Lock icons. Exact copy from prompt.
5. **Metrics Trust Bar** — 5 metrics on `bg-white border-y border-border` with vertical separators.
6. **Closing CTA Strip** — Dark background (`bg-foreground`), white text, two CTAs with className overrides.
7. **Footer** — Keep existing `<Footer>` as-is

### Key decisions
- Font: Roboto is already imported in `index.css` line 1. The `font-sans` in tailwind uses DM Sans — will add `font-[Roboto]` inline classes to the hero page sections OR since the prompt says "Roboto only", will apply it to the page wrapper.
- All Lucide icons: `ArrowRight`, `TrendingUp`, `Shield`, `Lock`
- No new packages needed
- No modifications to `tailwind.config.ts`, `index.css`, or any `src/components/ui/` files
- Product preview card uses exact strings from prompt (SERVICE DEPARTMENT, 68/100, DEVELOPING, Capacity Misalignment, etc.)
- `pt-16` on main content to account for fixed navbar height

### Files modified
- `src/pages/Index.tsx` — full rewrite (only file changed)

