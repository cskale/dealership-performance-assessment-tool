// Classifies an improvement lever by what the action actually says, not its
// position in the list. Returns a stable category; the UI owns labels + styling.
//
// ponytail: keyword heuristic, not a curated per-lever field. It reads the real
// action text (far more honest than the old index-based tag) and degrades to
// 'quick-win' when nothing matches. Upgrade path if a specific lever is mis-tagged:
// add an explicit override to LEVER_OVERRIDES below, or promote improvementLevers
// to objects with a `category` field.

export type LeverCategory = "quick-win" | "structural" | "capability";

// People / skill / culture / incentive work — changes that land through behaviour.
const CAPABILITY = /\b(train|training|coach|coaching|skill|certif|culture|mindset|incentiv|compensat|commission|bonus|reward|enablement|onboard|accountab|gamif)/i;

// Building or reorganising something — changes that need structure stood up.
const STRUCTURAL = /\b(dedicated|department|division|hire|recruit|headcount|restructur|reorganis|reorganiz|redesign|integrat|platform|infrastructure|centrali[sz]e|overhaul)/i;

// Explicit overrides for the rare lever the heuristic gets wrong. key = exact lever text.
const LEVER_OVERRIDES: Record<string, LeverCategory> = {};

export function categorizeImprovementLever(text: string): LeverCategory {
  if (LEVER_OVERRIDES[text]) return LEVER_OVERRIDES[text];
  if (CAPABILITY.test(text)) return "capability";
  if (STRUCTURAL.test(text)) return "structural";
  return "quick-win"; // SLAs, dashboards, alerts, automations, scripts, tracking…
}
