# Premium Playground calculator upgrade

## Goal
Make the full Playground area feel like a calm, precise financial workspace while preserving every existing calculation, formatter, prefill path, and route.

## Shared foundation
- Add a reusable `AnimatedNumber` that parses the existing formatted values, animates only the numeric portion over about 400ms, preserves currency/percentage/unit formatting, and respects reduced-motion preferences.
- Upgrade `PlaygroundCalculatorShell` with a stronger header, larger animated KPI numerals, status accents, one-line metric captions, refined card framing, staggered entrance motion, and responsive one-column behavior.
- Add shared presentation primitives for premium calculator cards, status-aware insight callouts, headline metric output, what-if slider rows, and accessible chart framing. Existing calculator data remains the source of truth.
- Restyle `ScaleGauge` without changing `niceScaleMax`, target positioning, or scale calculations: slimmer track, semantic gradient fill, target pin/label, smooth motion, and overflow cue.

## Calculator pages
- Apply shared card, field, output, stat-row, and insight treatments across the ten live calculators: Reverse Sales Funnel, Sales Velocity, Lead Quality, Marketing ROI, CAC Payback, Technician Utilization, Vehicle Stock Turn, Absorption Rate, Appointment Density, and F&I Penetration.
- Preserve each page’s existing status thresholds and use them for KPI/insight status colors where available; neutral status is used where no threshold exists.
- Add compact Recharts visuals to Absorption Rate and Technician Utilization using their existing calculated outputs, with screen-reader summaries.
- Upgrade Absorption Rate’s existing what-if sliders with live baseline-to-adjusted delta chips and a Reset action.
- Keep all existing chart values, tables, funnel values, and formatted output unchanged.

## Catalog and mobile
- Give the Playground catalog the same premium visual language for a cohesive eleven-page area.
- Ensure 390px layouts have full-width inputs, stacked KPI rows and cards, responsive tables/charts, and no horizontal page overflow.

## Verification
- Run the TypeScript check and project build/test command.
- Inspect the live Playground catalog and representative calculator pages at desktop and 390px widths.
- Confirm the protected calculation, mapping, and prefill files remain untouched.
