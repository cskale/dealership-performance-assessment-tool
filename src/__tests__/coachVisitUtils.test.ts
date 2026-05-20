import { describe, it, expect } from 'vitest';
import { buildQuestionSectionMap, buildQuestionLabelMap, getDeptNoteCount } from '@/lib/coachVisitUtils';

describe('buildQuestionSectionMap', () => {
  it('maps each question id to its parent section id', () => {
    const map = buildQuestionSectionMap();
    const entries = Object.entries(map);
    expect(entries.length).toBeGreaterThan(0);
    // Every value should be one of the known section IDs
    const knownSections = ['new-vehicle-sales', 'used-vehicle-sales', 'service-performance', 'parts-inventory', 'financial-operations'];
    for (const [, sectionId] of entries) {
      expect(knownSections).toContain(sectionId);
    }
  });
});

describe('buildQuestionLabelMap', () => {
  it('maps each question id to its text label', () => {
    const map = buildQuestionLabelMap();
    const entries = Object.entries(map);
    expect(entries.length).toBeGreaterThan(0);
    for (const [, label] of entries) {
      expect(typeof label).toBe('string');
      expect(label.length).toBeGreaterThan(0);
    }
  });
});

describe('getDeptNoteCount', () => {
  it('counts notes belonging to the given section', () => {
    const sectionMap = buildQuestionSectionMap();
    // Find any question in new-vehicle-sales
    const nvsQuestion = Object.entries(sectionMap).find(([, s]) => s === 'new-vehicle-sales')?.[0];
    if (!nvsQuestion) return; // skip if no questions found
    const notes: Record<string, string> = { [nvsQuestion]: 'test note' };
    expect(getDeptNoteCount('new-vehicle-sales', notes, sectionMap)).toBe(1);
    expect(getDeptNoteCount('service-performance', notes, sectionMap)).toBe(0);
  });

  it('returns 0 when notes is empty', () => {
    const sectionMap = buildQuestionSectionMap();
    expect(getDeptNoteCount('new-vehicle-sales', {}, sectionMap)).toBe(0);
  });
});
