/**
 * Merges purpose, situationAnalysis, and benefits into a single prose paragraph
 * for display in the "Why this matters" context strip column.
 * Concatenation happens at render time — source data is untouched.
 */
export function mergeWhyThisMatters(
  purpose?: string,
  situationAnalysis?: string,
  benefits?: string
): string {
  return [purpose, situationAnalysis, benefits].filter(Boolean).join(' ');
}

/**
 * Strips trailing "Performance", "& Overall Performance", and similar suffixes
 * from section titles so they fit comfortably in the tab navigation.
 *
 * Examples:
 *   "New Vehicle Sales Performance"              → "New Vehicle Sales"
 *   "Financial Operations & Overall Performance" → "Financial Operations"
 *   "Service Performance"                        → "Service"
 *   "Parts and Inventory Performance"            → "Parts and Inventory"
 */
export function shortenSectionName(title: string): string {
  return title
    .replace(/\s*&\s*Overall\b.*$/, '')   // strip "& Overall ..." first
    .replace(/\s+Performance\s*$/, '')     // then strip trailing "Performance"
    .trim();
}

/**
 * Estimates time remaining in the assessment.
 * Assumes ~30 seconds per unanswered question.
 * Returns a human-readable string e.g. "~12 min" or "< 1 min".
 */
export function estimateTimeRemaining(
  totalQuestions: number,
  answeredQuestions: number
): string {
  const remaining = Math.max(0, totalQuestions - answeredQuestions);
  const seconds = remaining * 30;
  if (seconds < 60) return '< 1 min';
  const minutes = Math.ceil(seconds / 60);
  return `~${minutes} min`;
}
