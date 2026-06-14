import { describe, it, expect } from 'vitest';
import { questionnaire } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
import {
  getScoredQuestionCount,
  getAnsweredScoredCount,
  isSectionComplete,
  getSectionProgress,
  isAssessmentComplete,
} from '@/lib/assessmentUtils';

function buildFullScoredAnswers(): Record<string, number> {
  const answers: Record<string, number> = {};
  for (const section of questionnaire.sections) {
    for (const q of getScoredQuestions(section.questions)) {
      answers[q.id] = 3;
    }
  }
  return answers;
}

describe('assessment completion helpers', () => {
  it('getScoredQuestionCount excludes data questions', () => {
    const section = questionnaire.sections.find(s => s.id === 'new-vehicle-sales')!;
    const dataCount = section.questions.filter(q => q.kind === 'data').length;
    expect(getScoredQuestionCount(section)).toBe(section.questions.length - dataCount);
  });

  it('an assessment with all scored questions answered and zero KPI answers is complete', () => {
    const answers = buildFullScoredAnswers();
    expect(isAssessmentComplete(questionnaire.sections, answers)).toBe(true);
  });

  it('a section is incomplete if any scored question is missing, regardless of KPI questions', () => {
    const answers = buildFullScoredAnswers();
    const firstSection = questionnaire.sections[0];
    const firstScored = getScoredQuestions(firstSection.questions)[0];
    delete answers[firstScored.id];

    expect(isSectionComplete(firstSection, answers)).toBe(false);
    expect(isAssessmentComplete(questionnaire.sections, answers)).toBe(false);
  });

  it('getAnsweredScoredCount and getSectionProgress ignore data questions', () => {
    const section = questionnaire.sections.find(s => s.id === 'new-vehicle-sales')!;
    const scored = getScoredQuestions(section.questions);
    const answers: Record<string, number> = {};
    answers[scored[0].id] = 5;

    expect(getAnsweredScoredCount(section, answers)).toBe(1);
    expect(getSectionProgress(section, answers)).toBe(Math.round((1 / scored.length) * 100));
  });
});
