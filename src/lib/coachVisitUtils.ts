import { questionnaire } from '@/data/questionnaire';

export type VisitStatus = 'proposed' | 'confirmed' | 'cancelled' | 'completed' | 'counter_proposed';
export type VisitType = 'in-person' | 'remote' | 'phone';

export const VISIT_MODULES: { id: string; label: string }[] = [
  { id: 'new-vehicle-sales',    label: 'New Vehicle Sales' },
  { id: 'used-vehicle-sales',   label: 'Used Vehicle Sales' },
  { id: 'service-performance',  label: 'Service' },
  { id: 'parts-inventory',      label: 'Parts & Inventory' },
  { id: 'financial-operations', label: 'Financial Operations' },
];

export const DEPT_LABEL_TO_SECTION_ID: Record<string, string> = {
  'New Vehicle Sales':     'new-vehicle-sales',
  'Used Vehicle Sales':    'used-vehicle-sales',
  'Service':               'service-performance',
  'Parts':                 'parts-inventory',
  'Parts & Inventory':     'parts-inventory',
  'Financial Operations':  'financial-operations',
};

export interface CoachVisit {
  id: string;
  coach_user_id: string;
  dealership_id: string;
  visit_date: string;
  status: VisitStatus;
  visit_notes: string | null;
  visit_type: VisitType | null;
  modules_reviewed: string[];
  summary: string | null;
  next_visit_date: string | null;
  agreed_action_ids: string[];
  created_at: string | null;
  updated_at: string | null;
  dealer_proposed_date: string | null;
  declined_by: string | null;
}

export interface OpenAction {
  id: string;
  action_title: string;
  department: string;
  priority: string;
  status: string;
}

/** Builds a map of questionId → section.id from the questionnaire. */
export function buildQuestionSectionMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const section of questionnaire.sections) {
    for (const question of section.questions) {
      map[question.id] = section.id;
    }
  }
  return map;
}

/** Builds a map of questionId → question text (truncated to 80 chars). */
export function buildQuestionLabelMap(): Record<string, string> {
  const map: Record<string, string> = {};
  for (const section of questionnaire.sections) {
    for (const question of section.questions) {
      map[question.id] =
        question.text.length > 80
          ? question.text.slice(0, 80) + '…'
          : question.text;
    }
  }
  return map;
}

/** Returns the count of non-empty notes that belong to the given sectionId. */
export function getDeptNoteCount(
  sectionId: string,
  notes: Record<string, string>,
  sectionMap: Record<string, string>
): number {
  return Object.entries(notes).filter(
    ([questionId, text]) =>
      sectionMap[questionId] === sectionId && text.trim().length > 0
  ).length;
}

/** Returns note entries belonging to the given sectionId. */
export function getDeptNotes(
  sectionId: string,
  notes: Record<string, string>,
  sectionMap: Record<string, string>
): Array<{ questionId: string; text: string }> {
  return Object.entries(notes)
    .filter(
      ([questionId, text]) =>
        sectionMap[questionId] === sectionId && text.trim().length > 0
    )
    .map(([questionId, text]) => ({ questionId, text }));
}
