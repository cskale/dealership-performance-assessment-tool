import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDepartmentName } from '@/lib/departmentNames';
import { Target, ChevronDown, ChevronUp } from 'lucide-react';
import type { CeilingInsight } from '@/lib/ceilingAnalysis';

interface CeilingInsightsPanelProps {
  insights: CeilingInsight[];
}

const PREFIX_TO_DEPT: Record<string, string> = {
  nvs: 'new-vehicle-sales',
  uvs: 'used-vehicle-sales',
  svc: 'service-performance',
  fin: 'financial-operations',
  pts: 'parts-inventory',
};

const DEPT_BORDER_COLORS: Record<string, string> = {
  'new-vehicle-sales': 'border-l-[hsl(var(--chart-2))]',
  'used-vehicle-sales': 'border-l-[hsl(var(--chart-1))]',
  'service-performance': 'border-l-destructive',
  'parts-inventory': 'border-l-warning',
  'financial-operations': 'border-l-[hsl(var(--chart-5))]',
};

export function CeilingInsightsPanel({ insights }: CeilingInsightsPanelProps) {
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  if (insights.length === 0) {
    return (
      <Card className="shadow-lg shadow-card rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <Target className="h-5 w-5 text-primary" />
            {t('results.ceiling.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('results.ceiling.noInsights')}</p>
        </CardContent>
      </Card>
    );
  }

  const visibleInsights = showAll ? insights : insights.slice(0, 3);

  return (
    <Card className="shadow-lg shadow-card rounded-xl">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <Target className="h-5 w-5 text-primary" />
          {t('results.ceiling.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {visibleInsights.map((insight, i) => {
          const prefix = insight.questionId.split('-')[0];
          const deptKey = PREFIX_TO_DEPT[prefix] ?? 'new-vehicle-sales';
          const deptLabel = getDepartmentName(deptKey, language);
          const borderColor = DEPT_BORDER_COLORS[deptKey] ?? 'border-l-primary';

          return (
            <div
              key={i}
              className={`border-l-[6px] ${borderColor} rounded-r-lg border border-border p-4 transition-all`}
              style={{ animationDelay: `${i * 50}ms` }}
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{deptLabel}</span>
                <Badge className="bg-success/10 text-success border-success/20 text-xs">
                  {t('results.ceiling.badge')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {t('results.ceiling.currentScore')}: {insight.currentScore}/5
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {insight.bestInClassDescription}
              </p>

              <div className="flex items-start gap-2 bg-primary/5 rounded-md p-3">
                <span className="text-primary font-bold mt-0.5 shrink-0">→</span>
                <p className="text-sm text-foreground">{insight.nextLevelAction}</p>
              </div>
            </div>
          );
        })}

        {insights.length > 3 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll ? (
              <>
                {t('results.ceiling.showLess')} <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {t('results.ceiling.viewAll')} ({insights.length}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
