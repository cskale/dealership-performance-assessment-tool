import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDepartmentName } from '@/lib/departmentNames';
import { BarChart3 } from 'lucide-react';
import type { DepartmentSubCategories } from '@/lib/scoringEngine';

interface HeatmapProps {
  scores: Record<string, number>;
  answers: Record<string, number>;
  subCategoryData?: Record<string, DepartmentSubCategories>;
}

interface KpiCell {
  kpiName: string;
  kpiCode: string;
  score: number;
  benchmarkBand: 'below' | 'in' | 'above';
}

interface HeatmapRow {
  department: string;
  departmentKey: string;
  kpis: KpiCell[];
}

// Department question prefix → department key mapping
const DEPT_PREFIXES: Record<string, string> = {
  nvs: 'new-vehicle-sales',
  uvs: 'used-vehicle-sales',
  svc: 'service-performance',
  pts: 'parts-inventory',
  fin: 'financial-operations',
};

// Representative KPIs per department (5 each).
// categoryKey maps to q.category in the questionnaire — used to look up
// the scoring engine's weighted sub-category score from subCategoryData.
// questionIds are kept as the raw-answer fallback for cells not covered.
const DEPT_KPIS: Record<string, { code: string; name: string; nameDE: string; questionIds: string[]; categoryKey: string }[]> = {
  'new-vehicle-sales': [
    { code: 'nvs-vol',  name: 'Volume',       nameDE: 'Volumen',        questionIds: ['nvs-1'],        categoryKey: 'volume' },
    { code: 'nvs-conv', name: 'Conversion',   nameDE: 'Konversion',     questionIds: ['nvs-2', 'nvs-5'], categoryKey: 'conversion' },
    { code: 'nvs-sat',  name: 'Satisfaction', nameDE: 'Zufriedenheit',  questionIds: ['nvs-3'],        categoryKey: 'satisfaction' },
    { code: 'nvs-prof', name: 'Profitability',nameDE: 'Profitabilität', questionIds: ['nvs-4', 'nvs-9'], categoryKey: 'profitability' },
    { code: 'nvs-dig',  name: 'Digital',      nameDE: 'Digital',        questionIds: ['nvs-6', 'nvs-10'], categoryKey: 'digital' },
  ],
  'used-vehicle-sales': [
    { code: 'uvs-turn', name: 'Turnover',     nameDE: 'Umschlag',       questionIds: ['uvs-1', 'uvs-10'], categoryKey: 'turnover' },
    { code: 'uvs-prof', name: 'Profitability',nameDE: 'Profitabilität', questionIds: ['uvs-2'],        categoryKey: 'profitability' },
    { code: 'uvs-appr', name: 'Appraisal',    nameDE: 'Bewertung',      questionIds: ['uvs-3', 'uvs-4'], categoryKey: 'accuracy' },
    { code: 'uvs-dig',  name: 'Digital',      nameDE: 'Digital',        questionIds: ['uvs-5', 'uvs-8'], categoryKey: 'digital' },
    { code: 'uvs-sat',  name: 'Satisfaction', nameDE: 'Zufriedenheit',  questionIds: ['uvs-7', 'uvs-9'], categoryKey: 'satisfaction' },
  ],
  'service-performance': [
    { code: 'svc-util', name: 'Utilisation',  nameDE: 'Auslastung',     questionIds: ['svc-1', 'svc-3'], categoryKey: 'efficiency' },
    { code: 'svc-qual', name: 'Quality',      nameDE: 'Qualität',       questionIds: ['svc-4', 'svc-6'], categoryKey: 'quality' },
    { code: 'svc-sat',  name: 'Satisfaction', nameDE: 'Zufriedenheit',  questionIds: ['svc-5', 'svc-8'], categoryKey: 'satisfaction' },
    { code: 'svc-prod', name: 'Productivity', nameDE: 'Produktivität',  questionIds: ['svc-2', 'svc-11'], categoryKey: 'productivity' },
    { code: 'svc-dig',  name: 'Digital',      nameDE: 'Digital',        questionIds: ['svc-10', 'svc-12'], categoryKey: 'digital' },
  ],
  'parts-inventory': [
    { code: 'pts-turn', name: 'Turnover',     nameDE: 'Umschlag',       questionIds: ['pts-1'],        categoryKey: 'turnover' },
    { code: 'pts-avail',name: 'Availability', nameDE: 'Verfügbarkeit',  questionIds: ['pts-2', 'pts-8'], categoryKey: 'availability' },
    { code: 'pts-prof', name: 'Profitability',nameDE: 'Profitabilität', questionIds: ['pts-3'],        categoryKey: 'profitability' },
    { code: 'pts-qual', name: 'Quality',      nameDE: 'Qualität',       questionIds: ['pts-4', 'pts-5', 'pts-7'], categoryKey: 'obsolete' },
    { code: 'pts-ops',  name: 'Operations',   nameDE: 'Betrieb',        questionIds: ['pts-6', 'pts-9', 'pts-10'], categoryKey: 'efficiency' },
  ],
  'financial-operations': [
    { code: 'fin-prof', name: 'Profitability',nameDE: 'Profitabilität', questionIds: ['fin-1'],        categoryKey: 'profitability' },
    { code: 'fin-cash', name: 'Cash Flow',    nameDE: 'Cashflow',       questionIds: ['fin-2'],        categoryKey: 'cashflow' },
    { code: 'fin-gov',  name: 'Governance',   nameDE: 'Governance',     questionIds: ['fin-3', 'fin-4'], categoryKey: 'floorplan' },
    { code: 'fin-prod', name: 'Productivity', nameDE: 'Produktivität',  questionIds: ['fin-5'],        categoryKey: 'productivity' },
    { code: 'fin-tech', name: 'Technology',   nameDE: 'Technologie',    questionIds: ['fin-6', 'fin-7', 'fin-8'], categoryKey: 'technology' },
  ],
};

function getScoreBand(score: number): { bg: string; text: string; label: string } {
  if (score >= 85) return { bg: 'bg-success', text: 'text-white', label: '85-100' };
  if (score >= 70) return { bg: 'bg-info', text: 'text-white', label: '70-84' };
  if (score >= 46) return { bg: 'bg-warning', text: 'text-foreground', label: '46-69' };
  return { bg: 'bg-destructive', text: 'text-white', label: '0-45' };
}

function getBenchmarkBand(score: number): 'below' | 'in' | 'above' {
  if (score >= 75) return 'above';
  if (score >= 55) return 'in';
  return 'below';
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

const DEPT_ABBREV: Record<string, string> = {
  'new-vehicle-sales': 'NVS',
  'used-vehicle-sales': 'UVS',
  'service-performance': 'SVC',
  'parts-inventory': 'PTS',
  'financial-operations': 'FIN',
};

export function DepartmentHeatmap({ scores, answers, subCategoryData }: HeatmapProps) {
  const { t, language } = useLanguage();

  const rows = useMemo<HeatmapRow[]>(() => {
    return DEPT_ORDER.map(deptKey => {
      const kpiDefs = DEPT_KPIS[deptKey] || [];
      const kpis: KpiCell[] = kpiDefs.map(kpiDef => {
        // Prefer the scoring engine's weighted sub-category score when available.
        // Fall back to raw answer averaging for cells not covered by subCategoryData.
        const subCatScore = subCategoryData?.[deptKey]?.subCategories
          .find(sc => sc.category === kpiDef.categoryKey)?.score;

        let finalScore: number;
        let hasData: boolean;

        if (subCatScore !== undefined) {
          finalScore = Math.max(0, Math.min(100, subCatScore));
          hasData = true;
        } else {
          const relevantScores = kpiDef.questionIds
            .map(qId => answers[qId])
            .filter((v): v is number => v != null);
          hasData = relevantScores.length > 0;
          const rawScore = hasData
            ? relevantScores.reduce((a, b) => a + b, 0) / relevantScores.length
            : 0;
          // Normalize 1-5 scale to 0-100
          finalScore = Math.max(0, Math.min(100, Math.round(((rawScore - 1) / 4) * 100)));
        }

        return {
          kpiName: language === 'de' ? kpiDef.nameDE : kpiDef.name,
          kpiCode: kpiDef.code,
          score: hasData ? finalScore : -1,
          benchmarkBand: getBenchmarkBand(hasData ? finalScore : 0),
        };
      });

      return {
        department: DEPT_ABBREV[deptKey],
        departmentKey: deptKey,
        kpis,
      };
    });
  }, [answers, language, subCategoryData]);

  // Get column headers from first row
  const columnHeaders = rows[0]?.kpis.map(k => k.kpiName) ?? [];

  return (
    <Card className="shadow-lg shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t('results.kpiMatrix.title')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-grid gap-1" style={{ gridTemplateColumns: `80px repeat(5, 1fr)` }}>
            {/* Header row */}
            <div className="h-12" />
            {columnHeaders.map((header, i) => (
              <div
                key={i}
                className="h-12 flex items-end justify-center pb-1 text-xs font-medium text-muted-foreground text-center px-1"
              >
                <span className="md:rotate-0 -rotate-45 origin-bottom-left md:origin-center whitespace-nowrap md:whitespace-normal">
                  {header}
                </span>
              </div>
            ))}

            {/* Data rows */}
            {rows.map((row, ri) => (
              <>
                {/* Row label */}
                <div
                  key={`label-${ri}`}
                  className="h-12 md:h-12 flex items-center text-xs font-semibold text-foreground"
                >
                  <span className="hidden md:inline">{getDepartmentName(row.departmentKey, language)}</span>
                  <span className="md:hidden">{row.department}</span>
                </div>

                {/* KPI cells */}
                {row.kpis.map((kpi, ci) => {
                  const band = kpi.score >= 0 ? getScoreBand(kpi.score) : null;
                  return (
                    <Tooltip key={`${ri}-${ci}`}>
                      <TooltipTrigger asChild>
                        <div
                          className={`h-12 w-full min-w-[48px] md:min-w-[48px] rounded-md flex items-center justify-center cursor-default transition-transform hover:scale-105 ${
                            band ? `${band.bg} ${band.text}` : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          <span className="text-xs font-bold tabular-nums">
                            {kpi.score >= 0 ? kpi.score : '—'}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="max-w-[200px]">
                        <div className="space-y-1">
                          <p className="font-semibold text-sm">{kpi.kpiName}</p>
                          <p className="text-xs">
                            {t('results.kpiMatrix.score')}: {kpi.score >= 0 ? `${kpi.score}%` : 'N/A'}
                          </p>
                          {kpi.score >= 0 && (
                            <Badge variant="outline" className="text-xs">
                              {kpi.benchmarkBand === 'above'
                                ? t('results.kpiMatrix.aboveBenchmark')
                                : kpi.benchmarkBand === 'in'
                                ? t('results.kpiMatrix.atBenchmark')
                                : t('results.kpiMatrix.belowBenchmark')}
                            </Badge>
                          )}
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </>
            ))}
          </div>
        </div>

        {/* Color Legend */}
        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="font-medium">{t('results.kpiMatrix.legend')}:</span>
          {[
            { bg: 'bg-destructive', label: '0–45' },
            { bg: 'bg-warning', label: '46–69' },
            { bg: 'bg-info', label: '70–84' },
            { bg: 'bg-success', label: '85–100' },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5">
              <div className={`w-4 h-3 rounded-sm ${item.bg}`} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
