

## Landing Page Animation & Engagement Upgrade

**Goal:** Transform the static white landing page into an engaging, interactive experience — no new packages, no external animation libraries, fully enterprise-appropriate.

### Changes (2 files only)

**`src/pages/Index.tsx`** and **`src/components/landing/ProductSneakPeek.tsx`**

---

### 1. Scroll-triggered reveal animations
- Sections fade up (`opacity 0→1`, `translateY 16px→0`) as they enter viewport
- Uses native `IntersectionObserver` — no library
- Staggered delays per element (e.g., proof pillar cards reveal left-to-right)

### 2. Animated counters on Metrics Trust Bar
- Numbers count up from 0 to target value when scrolled into view
- Uses `requestAnimationFrame` — no library
- Replace "355KB KPI Definitions Library" with "111 KPIs Tracked"

### 3. Enhanced hover interactions
- Cards lift slightly on hover (`-translate-y-0.5`, `shadow-elevated`)
- Pipeline steps get `hover:shadow-soft`
- Smooth `transition-all duration-300`

### 4. Hero product card sequential reveal
- The 3 mini-panels animate in one after another (200ms stagger)

### 5. Pipeline connector animation
- `ChevronRight` arrows fade in following the card stagger sequence

---

### What stays the same
- All copy, structure, sections 1–7 layout unchanged
- No new npm packages
- No framer-motion or GSAP
- No changes to `tailwind.config.ts`, `index.css`, or `src/components/ui/`
- No Claude Code-owned files touched

