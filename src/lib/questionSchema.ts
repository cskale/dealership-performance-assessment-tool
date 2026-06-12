import { z } from 'zod';
import type { Question } from '@/data/questionnaire';

const baseQuestionFields = {
  id: z.string(),
  text: z.string(),
  description: z.string().optional(),
  category: z.string(),
  purpose: z.string().optional(),
  situationAnalysis: z.string().optional(),
  linkedKPIs: z.array(z.string()).optional(),
  benefits: z.string().optional(),
  primarySignalCode: z.string().optional(),    // SignalCode
  secondarySignalCode: z.string().optional(),  // SignalCode
  rootCauseDimension: z.string().optional(),   // RootCauseDimension
  translations: z.record(z.string(), z.object({
    text: z.string(),
    description: z.string().optional(),
    purpose: z.string().optional(),
    situationAnalysis: z.string().optional(),
    benefits: z.string().optional(),
    scaleLabels: z.array(z.string()).optional(),
  })).optional(),
};

export const ScoredQuestionSchema = z.object({
  ...baseQuestionFields,
  kind: z.literal("scored"),
  type: z.enum(["scale", "multiple_choice", "rating"]),
  options: z.array(z.string()).optional(),
  scale: z.object({ min: z.number(), max: z.number(), labels: z.array(z.string()) }),
  weight: z.number().positive().finite(),
}).strict();

export const DataQuestionSchema = z.object({
  ...baseQuestionFields,
  kind: z.literal("data"),
  type: z.enum(["numeric", "percentage", "currency", "ratio"]),
  kpiKey: z.string(),
  unit: z.string(),
  referencePeriod: z.enum(["last_calendar_month", "last_financial_year", "current"]),
  validRange: z.object({ min: z.number(), max: z.number() }).optional(),
  formula: z.object({
    expression: z.string(),
    example: z.string().optional(),
    dataSource: z.string().optional(),
  }).optional(),
  benchmarkRef: z.string().optional(),
  subSection: z.string().optional(),
}).strict(); // rejects a stray `weight` or `scale` field

export const QuestionSchema = z.discriminatedUnion("kind", [ScoredQuestionSchema, DataQuestionSchema]);

export function validateQuestionSet(questions: unknown[]): Question[] {
  const errors: string[] = [];
  const result: Question[] = [];

  questions.forEach((q, index) => {
    const parsed = QuestionSchema.safeParse(q);
    if (!parsed.success) {
      const id = typeof q === 'object' && q !== null && 'id' in q
        ? String((q as { id: unknown }).id)
        : `index ${index}`;
      errors.push(`Question "${id}": ${parsed.error.message}`);
    } else {
      result.push(parsed.data as Question);
    }
  });

  if (errors.length > 0) {
    throw new Error(`Invalid question set:\n${errors.join('\n')}`);
  }

  return result;
}
