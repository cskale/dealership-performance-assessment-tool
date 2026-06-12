import { describe, it, expect } from 'vitest';
import { questionnaire, isScoredQuestion, isDataQuestion } from '@/data/questionnaire';
import { SIGNAL_MAPPINGS } from '@/data/signalMappings';
import { validateQuestionSet } from '@/lib/questionSchema';

const allQuestions = questionnaire.sections.flatMap(s => s.questions);

describe('questionnaire integrity', () => {
  it('every scored question has a positive finite weight', () => {
    for (const q of allQuestions) {
      if (isScoredQuestion(q)) {
        expect(Number.isFinite(q.weight)).toBe(true);
        expect(q.weight).toBeGreaterThan(0);
      }
    }
  });

  it('contains no data questions yet', () => {
    const dataQuestions = allQuestions.filter(isDataQuestion);
    expect(dataQuestions.length).toBe(0);
  });

  it('no SIGNAL_MAPPINGS entry references a data question', () => {
    const byId = new Map(allQuestions.map(q => [q.id, q]));
    for (const mapping of SIGNAL_MAPPINGS) {
      const q = byId.get(mapping.questionId);
      if (q) {
        expect(isDataQuestion(q)).toBe(false);
      }
    }
  });

  it('the full questionnaire passes validateQuestionSet', () => {
    expect(() => validateQuestionSet(allQuestions)).not.toThrow();
  });
});
