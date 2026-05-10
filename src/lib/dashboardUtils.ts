// src/lib/dashboardUtils.ts
import { getMaturityLevel } from '@/lib/maturityConfig';

// ─── Department metadata ────────────────────────────────────────────────────

export const DEPT_DISPLAY_NAMES: Record<string, string> = {
  'new-vehicle-sales':    'New Vehicle Sales',
  'used-vehicle-sales':   'Used Vehicle Sales',
  'service-performance':  'Service Operations',
  'financial-operations': 'Financial Operations',
  'parts-inventory':      'Parts & Accessories',
};

export const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

// ─── Score colour class ─────────────────────────────────────────────────────

/**
 * Returns a Tailwind text colour class based on maturity level.
 * Leading (≥85) → green. Advanced + Developing (≥45) → brand blue. Foundational (<45) → red.
 * No yellow/amber anywhere — per design system rules.
 */
export function deptScoreColour(score: number): string {
  const level = getMaturityLevel(score);
  if (level === 'leading')      return 'text-[#22c55e]';
  if (level === 'advanced')     return 'text-[#1D7AFC]';
  if (level === 'developing')   return 'text-[#1D7AFC]';
  return 'text-[#ef4444]'; // foundational
}

export function deptMaturityColour(score: number): string {
  return deptScoreColour(score); // same colour for label
}

// ─── Overdue detection ──────────────────────────────────────────────────────

/**
 * Returns true when target_completion_date is a past date (today not overdue).
 * Null/undefined dates are never overdue.
 */
export function isOverdue(targetDate: string | null | undefined): boolean {
  if (!targetDate) return false;
  const target = new Date(targetDate);
  target.setHours(23, 59, 59, 999); // end of due day
  return target < new Date();
}

// ─── Date formatting ────────────────────────────────────────────────────────

/** "14 Apr 2026" */
export function formatDisplayDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** "1 Jun 2026" (for action due dates) */
export function formatDueDate(iso: string | null | undefined): string {
  if (!iso) return 'No date set';
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

/** Returns "Q2 2026" style label from a date string */
export function quarterLabel(iso: string): string {
  const d = new Date(iso);
  const q = Math.ceil((d.getMonth() + 1) / 3);
  return `Q${q} ${d.getFullYear()}`;
}

/** Returns ISO date string 90 days after the given ISO date */
export function nextAssessmentDue(completedAt: string): string {
  const d = new Date(completedAt);
  d.setDate(d.getDate() + 90);
  return d.toISOString();
}

/** Returns the last day of the current quarter as ISO string */
export function endOfCurrentQuarter(): string {
  const now = new Date();
  const q = Math.ceil((now.getMonth() + 1) / 3);
  const endMonth = q * 3; // March=3, June=6, Sep=9, Dec=12
  const d = new Date(now.getFullYear(), endMonth, 0); // day 0 = last of previous month
  return d.toISOString();
}

/** "18 days away" / "3 days ago" relative label */
export function relativeDays(iso: string): string {
  const diff = Math.round(
    (new Date(iso).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (diff === 0) return 'today';
  if (diff > 0) return `${diff} day${diff === 1 ? '' : 's'} away`;
  return `${Math.abs(diff)} day${Math.abs(diff) === 1 ? '' : 's'} ago`;
}

// ─── Departmental finding text ──────────────────────────────────────────────

/**
 * Returns a one-paragraph diagnostic finding for a department based on its
 * score. Used in the Departmental Intelligence grid when signal engine data
 * is not available.
 */
export function deptFindingText(deptKey: string, score: number): string {
  const level = getMaturityLevel(score);
  const name = DEPT_DISPLAY_NAMES[deptKey] ?? deptKey;

  const texts: Record<string, Record<string, string>> = {
    'new-vehicle-sales': {
      leading:     'Lead capture, test-drive conversion, and prospecting cadence are all performing above the network benchmark. The department represents a model for other outlets.',
      advanced:    'Core sales processes are consistently executed. Lead conversion and customer journey scores are above benchmark — prospecting cadence has room for further improvement.',
      developing:  'Sales processes are in place but execution is inconsistent. Prospecting cadence and CRM discipline need reinforcement across the team.',
      foundational:'Fundamental sales process gaps identified. Prospecting, lead management, and customer journey processes require immediate definition and implementation.',
    },
    'used-vehicle-sales': {
      leading:     'Stock management and margin control are operating at benchmark-leading levels. Disposition process and pricing discipline are both strong.',
      advanced:    'Stock ageing and margin management are broadly sound. Monitor vehicle age profile and wholesale margin floor to maintain current performance.',
      developing:  'Stock ageing is above the 45-day benchmark and margin compression is evident. A formal disposition protocol and pricing review are the recommended interventions.',
      foundational:'Critical gaps in stock management — no formal disposition gate, ageing well above benchmark, and margin below acceptable floor across all used lines.',
    },
    'service-performance': {
      leading:     'Labour utilisation and fixed-first-visit rate are both leading the network benchmark. Retention and upsell processes are functioning at the highest level.',
      advanced:    'Labour utilisation is above benchmark. Fixed-first-visit performance and customer retention are strong — minor efficiency gains available in upsell processes.',
      developing:  'Labour utilisation is below benchmark. Fixed-first-visit rate and service advisor upsell process need structured improvement.',
      foundational:'Core service delivery processes are inconsistently applied. Labour efficiency, technician productivity, and customer retention all require immediate attention.',
    },
    'parts-inventory': {
      leading:     'Fill rate on all key lines is at benchmark-leading levels. Obsolete stock is actively managed and the purchasing process is efficient.',
      advanced:    'Fill rate on fast-moving lines is strong. Obsolete stock management is adequate — a structured write-down cycle would improve the score further.',
      developing:  'Fill rate is adequate but obsolete stock is accumulating without a structured write-down cycle. This is the primary drag on the department score.',
      foundational:'Significant inventory management gaps. Fill rate, obsolete stock accumulation, and purchasing process all require immediate structured intervention.',
    },
    'financial-operations': {
      leading:     'Finance and Insurance penetration, cash cycle management, and reporting processes are all performing above the network benchmark.',
      advanced:    'Core cash management and reporting processes are well-documented. F&I penetration on primary lines is strong — ancillary product penetration has scope for improvement.',
      developing:  'F&I product penetration on ancillary lines is below standard. Core cash management processes are documented but inconsistently followed.',
      foundational:'Fundamental financial operations gaps. F&I penetration, cash cycle management, and reporting processes all require immediate definition and enforcement.',
    },
  };

  return texts[deptKey]?.[level]
    ?? `${name} scored ${score}/100 (${level}). Review department processes against the benchmark criteria.`;
}

// ─── Focus department ───────────────────────────────────────────────────────

/** Returns the department key with the lowest score from a scores record. */
export function focusDepartment(scores: Record<string, number>): string {
  const ordered = DEPT_ORDER.filter(k => k in scores);
  if (ordered.length === 0) return '';
  return ordered.reduce((worst, k) =>
    (scores[k] ?? 100) < (scores[worst] ?? 100) ? k : worst
  );
}

// ─── Critical gap count ─────────────────────────────────────────────────────

/** Count of departments with score below 45 (foundational). */
export function criticalGapCount(scores: Record<string, number>): number {
  return Object.values(scores).filter(s => s < 45).length;
}

// ─── Hero narrative ─────────────────────────────────────────────────────────

/**
 * Derives a short one-sentence executive narrative for the hero card
 * without calling the full signal engine.
 */
export function heroNarrative(
  scores: Record<string, number>,
  overallScore: number
): string {
  const level = getMaturityLevel(overallScore);
  const aboveBenchmark = DEPT_ORDER.filter(k => (scores[k] ?? 0) >= 65).map(
    k => DEPT_DISPLAY_NAMES[k]
  );
  const focusDept = DEPT_DISPLAY_NAMES[focusDepartment(scores)] ?? 'one department';

  if (level === 'leading') {
    return `All departments are performing above benchmark — ${focusDept} has the most room for further improvement.`;
  }
  if (aboveBenchmark.length >= 3) {
    return `${aboveBenchmark.slice(0, 2).join(' and ')} are above benchmark. ${focusDept} is the primary focus for improvement this quarter.`;
  }
  if (aboveBenchmark.length >= 1) {
    return `${aboveBenchmark[0]} is above benchmark. ${focusDept} requires the most urgent attention this quarter.`;
  }
  return `${focusDept} has the lowest score and requires immediate intervention. All departments are developing — structured process improvement is the priority.`;
}
