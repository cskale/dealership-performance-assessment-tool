export type MaturityLevel = 'foundational' | 'developing' | 'advanced' | 'leading';

export const MATURITY_LEVELS: Record<MaturityLevel, {
  label: string;
  scoreRange: [number, number];
  color: string;
  description: string;
}> = {
  foundational: { label: 'Foundational', scoreRange: [0, 44],  color: 'red',   description: 'Core processes undefined or inconsistently applied' },
  developing:   { label: 'Developing',   scoreRange: [45, 64], color: 'amber', description: 'Processes in place but execution is inconsistent' },
  advanced:     { label: 'Advanced',     scoreRange: [65, 84], color: 'blue',  description: 'Consistent execution with data-driven management' },
  leading:      { label: 'Leading',      scoreRange: [85, 100], color: 'green', description: 'Market-differentiating performance and continuous improvement' },
};

export function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 85) return 'leading';
  if (score >= 65) return 'advanced';
  if (score >= 45) return 'developing';
  return 'foundational';
}
