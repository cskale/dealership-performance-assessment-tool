import { describe, it, expect } from 'vitest';
import { questionnaire, getTranslatedQuestion, isScoredQuestion } from '@/data/questionnaire';

describe('getTranslatedQuestion', () => {
  it('translates nvs-1 scale labels to German, matching the hardcoded DE translation', () => {
    const nvs1 = questionnaire.sections[0].questions.find(q => q.id === 'nvs-1');
    if (!nvs1) throw new Error('nvs-1 not found in questionnaire');

    const translated = getTranslatedQuestion(nvs1, 'de');

    if (!isScoredQuestion(translated)) throw new Error('nvs-1 should be a scored question');

    expect(translated.scale.labels).toEqual([
      "<4 Einheiten/Monat",
      "4–6 Einheiten/Monat",
      "7–9 Einheiten/Monat",
      "10–12 Einheiten/Monat",
      ">12 Einheiten/Monat"
    ]);
  });

  it('returns the question unchanged when no translation exists for the language', () => {
    const nvs1 = questionnaire.sections[0].questions.find(q => q.id === 'nvs-1');
    if (!nvs1) throw new Error('nvs-1 not found in questionnaire');

    // Cast through unknown: 'fr' is a valid Language but nvs-1 has no 'fr' translation entry
    const translated = getTranslatedQuestion(nvs1, 'fr' as Parameters<typeof getTranslatedQuestion>[1]);
    expect(translated).toBe(nvs1);
  });
});
