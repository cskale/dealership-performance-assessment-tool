import { supabase } from '@/integrations/supabase/client';

export interface ModuleBenchmark {
  moduleCode: string;
  meanScore: number;
  p25Score: number | null;
  p75Score: number | null;
  confidenceTier: string;
}

export const STATIC_BENCHMARKS: Record<string, ModuleBenchmark> = {
  'NVS': { moduleCode: 'NVS', meanScore: 72, p25Score: 62, p75Score: 81, confidenceTier: 'indicative' },
  'UVS': { moduleCode: 'UVS', meanScore: 70, p25Score: 60, p75Score: 79, confidenceTier: 'indicative' },
  'SVC': { moduleCode: 'SVC', meanScore: 75, p25Score: 65, p75Score: 84, confidenceTier: 'indicative' },
  'FIN': { moduleCode: 'FIN', meanScore: 68, p25Score: 58, p75Score: 77, confidenceTier: 'indicative' },
  'PTS': { moduleCode: 'PTS', meanScore: 65, p25Score: 55, p75Score: 74, confidenceTier: 'indicative' },
};

/**
 * Fetch benchmark scores for all modules matching the org's peer segment.
 * Falls back to static defaults if no matching rows found.
 */
export async function fetchModuleBenchmarks(
  positioning: string | null,
  businessModel: string | null
): Promise<Record<string, ModuleBenchmark>> {
  if (!positioning && !businessModel) return STATIC_BENCHMARKS;

  try {
    let query = supabase
      .from('benchmark_snapshots')
      .select('module_code, mean_score, p25_score, p75_score, confidence_tier')
      .neq('module_code', 'OVERALL');

    if (positioning) query = query.eq('positioning', positioning);
    if (businessModel) query = query.eq('business_model', businessModel);

    const { data, error } = await query;

    if (error || !data || data.length === 0) return STATIC_BENCHMARKS;

    const result: Record<string, ModuleBenchmark> = { ...STATIC_BENCHMARKS };
    for (const row of data) {
      result[row.module_code] = {
        moduleCode: row.module_code,
        meanScore: Number(row.mean_score) || STATIC_BENCHMARKS[row.module_code]?.meanScore || 70,
        p25Score: row.p25_score != null ? Number(row.p25_score) : null,
        p75Score: row.p75_score != null ? Number(row.p75_score) : null,
        confidenceTier: row.confidence_tier,
      };
    }
    return result;
  } catch {
    return STATIC_BENCHMARKS;
  }
}

/** Map section ID to module code */
export function sectionToModuleCode(sectionId: string): string {
  const map: Record<string, string> = {
    'new-vehicle-sales': 'NVS',
    'used-vehicle-sales': 'UVS',
    'service-performance': 'SVC',
    'financial-operations': 'FIN',
    'parts-inventory': 'PTS',
  };
  return map[sectionId] ?? 'NVS';
}

/**
 * Infer a position statement for a department based on its score
 * relative to the benchmark mean and p25/p75 range.
 */
export function inferPositionStatement(
  sectionId: string,
  score: number,
  benchmark: ModuleBenchmark,
  language: 'en' | 'de' = 'en'
): string {
  const gap = Math.round(score - benchmark.meanScore);
  const p75 = benchmark.p75Score ?? benchmark.meanScore + 9;
  const p25 = benchmark.p25Score ?? benchmark.meanScore - 10;

  if (score >= p75) {
    return language === 'de'
      ? `Mit ${score} Punkten liegt diese Abteilung im oberen Quartil (Benchmark-Ø: ${benchmark.meanScore}).`
      : `At ${score}, this department is in the top quartile (benchmark avg: ${benchmark.meanScore}).`;
  }
  if (score >= benchmark.meanScore) {
    return language === 'de'
      ? `Mit ${score} Punkten liegt diese Abteilung über dem Benchmark-Durchschnitt (${benchmark.meanScore}), Lücke zum oberen Quartil: ${Math.round(p75 - score)} Punkte.`
      : `At ${score}, this department is above the benchmark average (${benchmark.meanScore}), with ${Math.round(p75 - score)} pts to the top quartile.`;
  }
  if (score >= p25) {
    return language === 'de'
      ? `Mit ${score} Punkten liegt diese Abteilung ${Math.abs(gap)} Punkte unter dem Benchmark-Durchschnitt (${benchmark.meanScore}).`
      : `At ${score}, this department is ${Math.abs(gap)} pts below the benchmark average (${benchmark.meanScore}).`;
  }
  return language === 'de'
    ? `Mit ${score} Punkten liegt diese Abteilung im unteren Quartil — ${Math.abs(gap)} Punkte unter dem Benchmark-Durchschnitt (${benchmark.meanScore}).`
    : `At ${score}, this department is in the bottom quartile — ${Math.abs(gap)} pts below the benchmark average (${benchmark.meanScore}).`;
}
