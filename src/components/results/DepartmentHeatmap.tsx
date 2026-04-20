import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDepartmentName } from '@/lib/departmentNames';
import { SIGNAL_MAPPINGS, type RootCauseDimension } from '@/data/signalMappings';

interface HeatmapProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'financial-operations',
  'parts-inventory',
] as const;

const DEPT_ABBREV: Record<string, string> = {
  'new-vehicle-sales': 'NVS',
  'used-vehicle-sales': 'UVS',
  'service-performance': 'SVC',
  'financial-operations': 'FIN',
  'parts-inventory': 'PTS',
};

const DEPT_COLORS: Record<string, string> = {
  'new-vehicle-sales': 'hsl(217 91% 60%)',
  'used-vehicle-sales': 'hsl(263 70% 63%)',
  'service-performance': 'hsl(160 84% 39%)',
  'financial-operations': 'hsl(38 92% 50%)',
  'parts-inventory': 'hsl(215 16% 47%)',
};

const DIMENSIONS: RootCauseDimension[] = ['people', 'process', 'tools', 'structure', 'incentives'];

const DIMENSION_LABELS: Record<RootCauseDimension, { en: string; de: string }> = {
  people: { en: 'People', de: 'Personal' },
  process: { en: 'Process', de: 'Prozess' },
  tools: { en: 'Tools', de: 'Werkzeuge' },
  structure: { en: 'Structure', de: 'Struktur' },
  incentives: { en: 'Incentives', de: 'Anreize' },
};

interface Band {
  bg: string;
  label: { en: string; de: string };
  range: string;
}

const BANDS: Band[] = [
  { bg: 'hsl(0 72% 51%)', label: { en: 'Critical', de: 'Kritisch' }, range: '0–44' },
  { bg: 'hsl(38 92% 50%)', label: { en: 'Developing', de: 'Entwicklung' }, range: '45–64' },
  { bg: 'hsl(213 97% 55%)', label: { en: 'Progressing', de: 'Fortschritt' }, range: '65–79' },
  { bg: 'hsl(160 84% 39%)', label: { en: 'Strong', de: 'Stark' }, range: '80–100' },
];

function getBand(score: number): Band {
  if (score >= 80) return BANDS[3];
  if (score >= 65) return BANDS[2];
  if (score >= 45) return BANDS[1];
  return BANDS[0];
}

export function DepartmentHeatmap({ answers }: HeatmapProps) {
  const { language } = useLanguage();

  // Build a lookup: dept → dimension → answered values
  const grid = useMemo<Record<string, Record<RootCauseDimension, number | null>>>(() => {
    const buckets: Record<string, Record<RootCauseDimension, number[]>> = {};
    for (const dept of DEPT_ORDER) {
      buckets[dept] = { people: [], process: [], tools: [], structure: [], incentives: [] };
    }

    for (const mapping of SIGNAL_MAPPINGS) {
      const dim = mapping.rootCauseDimension;
      if (!dim) continue;
      const dept = mapping.moduleKey;
      if (!buckets[dept]) continue;
      const ans = answers[mapping.questionId];
      if (typeof ans === 'number' && ans >= 1 && ans <= 5) {
        buckets[dept][dim].push(ans);
      }
    }

    const result: Record<string, Record<RootCauseDimension, number | null>> = {};
    for (const dept of DEPT_ORDER) {
      result[dept] = { people: null, process: null, tools: null, structure: null, incentives: null };
      for (const dim of DIMENSIONS) {
        const vals = buckets[dept][dim];
        if (vals.length === 0) {
          result[dept][dim] = null;
        } else {
          const avg = vals.reduce((a, b) => a + b, 0) / vals.length;
          result[dept][dim] = Math.round(((avg - 1) / 4) * 100);
        }
      }
    }
    return result;
  }, [answers]);

  const allEmpty = useMemo(
    () => DEPT_ORDER.every(d => DIMENSIONS.every(dim => grid[d][dim] === null)),
    [grid]
  );

  const sectionTitle = language === 'de' ? 'Leistungsdimensionen' : 'Performance Dimensions';

  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {sectionTitle}
        </div>
      </CardHeader>
      <CardContent>
        {allEmpty ? (
          <div className="text-[13px] text-muted-foreground text-center py-8">
            {language === 'de'
              ? 'Unterkategorie-Daten für diese Bewertung nicht verfügbar.'
              : 'Sub-category data unavailable for this assessment.'}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <div
                className="inline-grid gap-1 min-w-full"
                style={{ gridTemplateColumns: '100px repeat(5, minmax(48px, 1fr))' }}
              >
                {/* Header row */}
                <div />
                {DEPT_ORDER.map(dept => (
                  <div
                    key={dept}
                    className="flex items-center justify-center gap-1.5 pb-2 text-[11px] uppercase tracking-wider text-muted-foreground font-medium"
                  >
                    <span
                      className="inline-block rounded-full"
                      style={{ width: 6, height: 6, backgroundColor: DEPT_COLORS[dept] }}
                    />
                    {DEPT_ABBREV[dept]}
                  </div>
                ))}

                {/* Data rows */}
                {DIMENSIONS.map(dim => (
                  <div key={dim} className="contents">
                    <div className="flex items-center text-[12px] font-medium text-foreground pr-2 min-w-[80px]">
                      {DIMENSION_LABELS[dim][language === 'de' ? 'de' : 'en']}
                    </div>
                    {DEPT_ORDER.map(dept => {
                      const score = grid[dept][dim];
                      const isEmpty = score === null;
                      const band = isEmpty ? null : getBand(score);
                      const bg = band ? band.bg : 'hsl(var(--muted))';
                      const tooltipText = isEmpty
                        ? `${getDepartmentName(dept, language)} — ${DIMENSION_LABELS[dim][language === 'de' ? 'de' : 'en']} — ${language === 'de' ? 'Keine Daten' : 'No data'}`
                        : `${getDepartmentName(dept, language)} — ${DIMENSION_LABELS[dim][language === 'de' ? 'de' : 'en']} — ${score} — ${band!.label[language === 'de' ? 'de' : 'en']}`;
                      return (
                        <Tooltip key={`${dept}-${dim}`}>
                          <TooltipTrigger asChild>
                            <div
                              className="flex items-center justify-center rounded-[4px] cursor-default transition-transform hover:scale-[1.03]"
                              style={{
                                backgroundColor: bg,
                                minHeight: 44,
                                padding: 4,
                              }}
                            >
                              <span
                                className="text-[12px] font-medium tabular-nums"
                                style={{ color: isEmpty ? 'hsl(var(--muted-foreground))' : 'white' }}
                              >
                                {isEmpty ? '—' : score}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-[240px]">
                            <p className="text-xs">{tooltipText}</p>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-muted-foreground">
              {BANDS.map(band => (
                <div key={band.range} className="flex items-center gap-1.5">
                  <div
                    className="rounded-sm"
                    style={{ width: 10, height: 10, backgroundColor: band.bg }}
                  />
                  <span>
                    {band.label[language === 'de' ? 'de' : 'en']} ({band.range})
                  </span>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
