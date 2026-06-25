# Port "Dealer Compass" landing page into this project

Yes — possible. Caveat: the source project uses TanStack Start + Tailwind v4 (`@theme inline`), and this project uses React Router + Vite + Tailwind v3. The **visual output and content will be 1:1**, but the underlying tokens/routing must be adapted (a literal file copy won't compile).

## Scope

Replace the current landing experience with Dealer Compass's:
- Full-bleed dark hero with its own top nav ("Dealer Diagnostic" wordmark, links, Request Demo pill)
- Floating dashboard mock with score bars
- "The Engine" 3-step section with animated connector line
- "Platform Capabilities" dark grid
- "See It In Action" ScrollShowcase (sticky scroll with 7 mock panels)
- Reveal/Counter scroll animations + float animation
- The page's own footer / CTA section as built in Dealer Compass

The existing `HomeHeader` and `Footer` will **not** be used on this page (Dealer Compass landing has its own nav/footer baked in, which is part of the 1:1 look). They remain available for other public routes.

## Files to change

1. **`src/pages/Index.tsx`** — rewrite to mirror `src/routes/index.tsx` from Dealer Compass.
   - Keep our auth redirect at the top:
     ```tsx
     const { user, loading } = useAuth();
     if (!loading && user) return <Navigate to="/app/dashboard" replace />;
     ```
   - Strip TanStack `createFileRoute` / `head()` meta. Move meta tags to `react-helmet-async` if already in project, otherwise into a `useEffect` setting `document.title` (matching how other pages here do SEO).
   - Replace `<a href="/methodology">` with React Router `<Link>`.

2. **`src/components/landing/Reveal.tsx`** — replace with Dealer Compass version (exports `Reveal` and `Counter`). IntersectionObserver-based, no library deps.

3. **`src/components/landing/ScrollShowcase.tsx`** — replace with Dealer Compass version (sticky scroll, 7 `ShowcasePanel` mocks: Diagnostic Command, Action Plan, KPI Encyclopedia, etc.).

4. **`src/index.css`** — add the Dealer Compass design tokens as Tailwind v3 CSS variables and utilities:
   - `--brand: #1D7AFC`, `--midnight`, `--fog`, `--success`, `--warning`, `--danger` (HSL where needed for opacity utilities)
   - `.reveal` / `.reveal-in` utility classes
   - `@keyframes float` + `.animate-float`
   - `@keyframes drawLine` for the connector line
   - Smooth scroll on `html`

5. **`tailwind.config.ts`** — extend `theme.colors` with `brand`, `midnight`, `fog`, `success`, `warning`, `danger` mapped to the new CSS vars so utilities like `bg-brand`, `text-midnight`, `bg-fog`, `bg-success/10` compile under Tailwind v3.

6. **`src/components/landing/ProductSneakPeek.tsx`** — leave as the empty stub it already is (or delete; not imported by the new page).

## Adaptations required (why it's not a literal copy)

| Source (Dealer Compass) | This project |
|---|---|
| TanStack `createFileRoute` + `head()` | React Router page + manual `document.title` / Helmet |
| Tailwind v4 `@theme inline { --color-brand: var(--brand) }` | Tailwind v3 `tailwind.config.ts` `extend.colors.brand` referencing CSS var |
| `bg-brand/10`, `text-success` etc. work via v4 auto-generated palette | Same classes work in v3 only after adding them to `tailwind.config.ts` |
| `font-sans: Inter` via `@theme` | Add Inter via existing font setup or `<link>` in `index.html` if not present |
| `<a href="/methodology">` | `<Link to="/methodology">` |

Logic, copy text, layout, colours, spacing, animations, and the 7 ScrollShowcase panels will be reproduced verbatim from the source.

## Out of scope

- Backend, auth, routing, or any `/app/*` page changes
- Translation of landing content (keeps English, matching source)
- Replacing the global `HomeHeader`/`Footer` for other public routes (`/methodology`, `/auth`, etc.)

## Verification

- `npm run build` clean
- `npx vitest run` clean (no existing tests touch `Index.tsx` or landing components)
- Visual check of `/` in preview at 1408px and mobile widths

Approve and I'll implement.
