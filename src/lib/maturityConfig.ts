export type MaturityLevel = 'foundational' | 'developing' | 'performing' | 'advanced';

export const MATURITY_LEVELS: Record<MaturityLevel, {
  label: string;
  scoreRange: [number, number];
  color: string;
  description: string;
}> = {
  foundational: { label: 'Foundational', scoreRange: [0, 45],   color: 'red',   description: 'Core processes undefined or inconsistently applied' },
  developing:   { label: 'Developing',   scoreRange: [46, 69],  color: 'amber', description: 'Processes in place but execution is inconsistent' },
  performing:   { label: 'Performing',   scoreRange: [70, 84],  color: 'blue',  description: 'Consistent execution with data-driven management' },
  advanced:     { label: 'Advanced',     scoreRange: [85, 100], color: 'green', description: 'Market-differentiating performance and continuous improvement' },
};

export function getMaturityLevel(score: number): MaturityLevel {
  if (score >= 85) return 'advanced';
  if (score >= 70) return 'performing';
  if (score >= 46) return 'developing';
  return 'foundational';
}
