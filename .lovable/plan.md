

## Plan: OEM Admin & Coach Dashboards with Role-Based Routing

### Architecture Decision

The `profiles.actor_type` enum (`dealer | coach | oem | internal`) already exists in the database and is the correct discriminator for dashboard routing. The `useActiveRole` hook currently maps membership roles to UX personas but does not read `actor_type`. We need to extend it to also expose `actor_type`, then use that for routing.

**No new DB roles are created.** We use the existing `actor_type` field on profiles.

---

### Files to Create

| File | Purpose |
|---|---|
| `src/pages/OemDashboard.tsx` | OEM Admin dashboard with network selector, leaderboard, summary cards |
| `src/pages/CoachDashboard.tsx` | Coach dashboard with assigned dealers grid, score trend chart |

### Files to Modify

| File | Change |
|---|---|
| `src/hooks/useActiveRole.tsx` | Add `actorType` field (reads `profiles.actor_type`) |
| `src/components/AppSidebar.tsx` | Add conditional nav items for OEM/Coach dashboards based on `actorType` |
| `src/App.tsx` | Add routes `/app/oem-dashboard` and `/app/coach-dashboard` |
| `src/contexts/LanguageContext.tsx` | Add i18n keys for all new strings |
| `src/i18n/en.json` | Add i18n keys (nav + dashboard labels) |
| `src/i18n/de.json` | Add German translations |

---

### Change 1 — Extend `useActiveRole` with `actorType`

Add `actorType: 'dealer' | 'coach' | 'oem' | 'internal' | null` to the return type. Read it from the existing `profiles` query (already fetches profile, just add `actor_type` to the select). No new DB queries needed.

### Change 2 — i18n Keys

Add to both `en.json` and `de.json`, and to the `LanguageContext.tsx` translations object:

```
nav.oemDashboard: "OEM Dashboard" / "OEM-Dashboard"
nav.coachDashboard: "Coach Dashboard" / "Coach-Dashboard"
oem.title: "Network Overview" / "Netzwerkübersicht"
oem.totalDealers: "Total Dealers" / "Gesamtzahl Händler"
oem.avgScore: "Average Score" / "Durchschnittliche Bewertung"
oem.highestScore: "Highest Score" / "Höchste Bewertung"
oem.lowestScore: "Lowest Score" / "Niedrigste Bewertung"
oem.leaderboard: "Dealer Leaderboard" / "Händler-Rangliste"
oem.rank: "Rank" / "Rang"
oem.dealerName: "Dealer" / "Händler"
oem.latestScore: "Latest Score" / "Letzte Bewertung"
oem.previousScore: "Previous Score" / "Vorherige Bewertung"
oem.trend: "Trend" / "Trend"
oem.benchmarkBand: "Band" / "Band"
oem.selectNetwork: "Select Network" / "Netzwerk auswählen"
oem.noNetworks: "No network memberships found" / "Keine Netzwerkmitgliedschaften"
oem.noAssessments: "No assessments yet" / "Noch keine Bewertungen"
coach.title: "Assigned Dealers" / "Zugewiesene Händler"
coach.sortByScore: "By Score" / "Nach Bewertung"
coach.sortByName: "By Name" / "Nach Name"
coach.filterAll: "All" / "Alle"
coach.filterCompleted: "Completed" / "Abgeschlossen"
coach.filterInProgress: "In Progress" / "In Bearbeitung"
coach.scoreTrend: "Score Trend" / "Bewertungsverlauf"
coach.selectDealers: "Select dealers to compare" / "Händler zum Vergleichen auswählen"
coach.noAssignments: "No assigned dealers" / "Keine zugewiesenen Händler"
coach.noAssessments: "No assessments found" / "Keine Bewertungen gefunden"
```

### Change 3 — `AppSidebar.tsx` Navigation

In the `sections` array, conditionally add items based on `actorType` from `useActiveRole`:
- If `actorType === 'oem'`: Add "OEM Dashboard" (`/app/oem-dashboard`) to Overview section with `Globe` icon
- If `actorType === 'coach'`: Add "Coach Dashboard" (`/app/coach-dashboard`) to Overview section with `Users` icon
- Both still see existing nav items (Dashboard, Assessment, etc.)

### Change 4 — `App.tsx` Routes

Add inside the `/app/*` Routes block:
```tsx
<Route path="oem-dashboard" element={<OemDashboard />} />
<Route path="coach-dashboard" element={<CoachDashboard />} />
```

Both are already behind `<ProtectedRoute>`. Access control is handled within each page component by checking `actorType` and redirecting if unauthorized.

### Change 5 — `OemDashboard.tsx`

**Guard:** If `actorType !== 'oem'`, render `<Navigate to="/app/dashboard" />`.

**Data flow:**
1. Fetch `oem_networks` where `owner_org_id = currentOrganization.id`
2. On network select, fetch `dealer_network_memberships` with joined `dealerships(name, id, location)`
3. For each dealer, fetch latest 2 `assessments` (for current + previous score, trend calc)

**Layout:**
- Network `Select` dropdown at top
- 4-card summary grid (`grid-cols-2 md:grid-cols-4`): Total Dealers, Avg Score, Highest, Lowest
- Leaderboard `Table` below with columns: Rank, Dealer Name, Latest Score, Previous Score, Trend (↑↓→), Band
- Rank 1-3: subtle gold/silver/bronze left border (4px)
- Row hover: `hover:bg-muted/50`
- Score badges colored by band (DESIGN.md §2.3)
- Staggered card animations per §7.2

**Mobile:** Table wrapped in `overflow-x-auto`, cards stack to `grid-cols-2`

**Error states:** Empty state components for no networks, no assessments, query errors

### Change 6 — `CoachDashboard.tsx`

**Guard:** If `actorType !== 'coach'`, render `<Navigate to="/app/dashboard" />`.

**Data flow:**
1. Fetch `coach_dealership_assignments` where `coach_user_id = user.id` and `is_active = true`, joined with `dealerships(name, id, location, brand)`
2. For each assigned dealer, fetch latest `assessments` (status, overall_score, created_at)

**Section 1 — Assigned Dealers Grid:**
- `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` Card layout
- Each card: Dealer name (CardTitle), brand badge, latest score (colored badge), assessment date, status badge
- Sort toggle: By Score / By Name (two buttons)
- Status filter: All / In Progress / Completed (Select dropdown)
- Card click: navigate to `/app/results/{assessmentId}`

**Section 2 — Score Trend Chart:**
- Multi-select dropdown to pick 1-3 dealers
- Recharts `LineChart` (already in bundle): X = assessment date, Y = overall score
- One line per dealer with department colors from DESIGN.md §2.4
- Tooltip with exact score + date
- Only render when dealers are selected

**Error states:** Empty state for no assignments, no assessments

---

### Technical Notes

- Zero new npm packages — Recharts already in bundle
- All text through i18n — zero hardcoded strings
- TypeScript strict — use `Tables<'oem_networks'>` etc. from types.ts
- No modifications to restricted files (ActionPlan.tsx, Assessment.tsx, scoringEngine.ts, etc.)
- Department colors from DESIGN.md §2.4, score bands from §2.3
- Staggered animations per §7.2 (50ms increments, max 5 cards)

