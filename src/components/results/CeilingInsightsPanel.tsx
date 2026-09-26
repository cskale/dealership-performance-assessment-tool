import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export function CeilingInsightsPanel({ insights }: CeilingInsightsPanelProps) {
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  if (insights.length === 0) return null;

  const visibleInsights = showAll ? insights : insights.slice(0, 3);

  return (
    <Card className="border-border shadow-sm">
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
          return (
            <div
              key={i}
              className="rounded-md border border-border border-l-2 border-l-primary bg-card p-4 transition-colors"
            >
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-sm font-semibold text-foreground">{deptLabel}</span>
                <Badge variant="outline" className="border-primary/20 bg-primary/5 text-primary text-xs">
                  {t('results.ceiling.badge')}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {t('results.ceiling.currentScore')}: {insight.currentScore}/5
                </Badge>
              </div>

              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {insight.bestInClassDescription}
              </p>

              <div className="flex items-start gap-2 rounded-md bg-primary/5 p-3">
                <span className="text-primary font-bold mt-0.5 shrink-0">→</span>
                <p className="text-sm text-foreground">{insight.nextLevelAction}</p>
              </div>
            </div>
          );
        })}

        {insights.length > 3 && (
          <Button
            variant="link"
            onClick={() => setShowAll(!showAll)}
            className="h-auto gap-1 p-0 text-sm"
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
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
