

## Plan: UX/UI Refinements — DESIGN.md Compliance Fixes

Both resources (ui-ux-pro-max-skill and 21st.dev) are useful as design intelligence references but cannot be installed directly into Lovable. However, several of their recommended patterns for **Enterprise SaaS / B2B dashboards** — specifically "Data-Dense Dashboard", "Executive Dashboard", and "Dimensional Layering" styles — align perfectly with what DESIGN.md already specifies but is **not yet implemented** in code.

The highest-impact improvements are features your own design system defines but the codebase does not render yet. Here are the concrete changes:

---

### Files to modify

| File | Change |
|---|---|
| `src/pages/Results.tsx` | Replace flat progress bar with SVG score ring (DESIGN.md §5.1); add staggered card entrance animations (§7.2) |
| `src/pages/Dashboard.tsx` | Add 4px department-colour top borders to section headers (§5.2); staggered KPI card animations |
| `src/components/MaturityScoring.tsx` | Fix radar chart styling: dashed grid, 20% fill opacity, shadow-card (§6.3); fix roadmap gradient anti-pattern |

---

### Change 1 — SVG Score Ring on Results Page

**DESIGN.md §5.1 specifies this. Current code uses a flat `<div>` progress bar (lines 336-353).**

Replace the Overall Score card's flat bar with an inline SVG circular ring:
- 120px diameter, `stroke-width: 8`, `neutral-200` track circle
- Score arc coloured by score band (success/warning/destructive)
- `stroke-dashoffset` animates once on mount via a `useState` + `useEffect` with `requestAnimationFrame` (300ms ease-out)
- Score number centred inside the ring using `text-metric-lg`
- Label below: `text-label uppercase tracking-wider`
- Make this card `col-span-2` on `md:grid-cols-4` to establish visual hierarchy

### Change 2 — Staggered Card Entrance Animations

**DESIGN.md §7.2 permits staggered reveals: 50ms increments, max 5 cards.**

Results page (lines 328-383): Add `opacity-0 animate-fade-in` with inline `style={{ animationDelay: '${i * 50}ms', animationFillMode: 'forwards' }}` to each of the 4 summary metric cards.

Dashboard page: Same treatment on the 4 KPI cards within each department section (delays 0/50/100/150ms).

### Change 3 — Department Colour Top Borders on Dashboard

**DESIGN.md §5.2 specifies a 4px top border in department colour. Current `SectionHeader` has none (line 88).**

Add `border-t-4 rounded-t-lg` with inline `style={{ borderTopColor: '#2563eb' }}` (NVS), `#7c3aed` (UVS), `#0891b2` (SVC) to each section's container card.

### Change 4 — Radar Chart & Roadmap Styling Fixes

**DESIGN.md §6.3 specifies dashed grid, 20% fill opacity, 11px axis labels.**

In `MaturityScoring.tsx`:
- `PolarGrid`: add `strokeDasharray="3 3"` (currently missing)
- "Your Score" `Radar`: change `fillOpacity={0.4}` → `fillOpacity={0.2}`
- All 3 `Card` components: change `shadow-lg` → `shadow-card`
- Roadmap card (line ~370): replace `bg-gradient-to-r from-slate-50 to-slate-100 border-slate-200` with `bg-muted border border-border` (hardcoded greys are an anti-pattern per §2.5)

---

### Technical notes

- Zero new packages — all inline SVG, CSS animations, existing Recharts props
- No changes to `tailwind.config.ts`, `index.css`, or `src/components/ui/`
- All animations are mount-only per §7.2 (no re-render triggers)
- The SVG ring reuses the existing `animatedScore` state already in Results.tsx

