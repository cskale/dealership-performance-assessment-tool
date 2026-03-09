import { useMemo, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import { ChevronDown, ArrowUpRight, ArrowDownRight, Lightbulb, Target, TrendingUp, BookOpen, ExternalLink } from 'lucide-react';
import { KPI_DEFINITIONS, KPIDefinition } from '@/lib/kpiDefinitions';
import { getDepartmentConfig } from '@/lib/departmentConfig';

interface KpiInsightPanelProps {
  kpiKey: string;
  language: 'en' | 'de';
  mode?: 'compact' | 'expanded';
  showDeepLink?: boolean;
  onNavigateToEncyclopedia?: (kpiKey: string) => void;
  className?: string;
}

/**
 * KpiInsightPanel - Reusable component for surfacing KPI intelligence
 * from the canonical KPI backbone (kpiDefinitions.ts).
 * 
 * Used in: Results, Analytics, Action Plan
 */
export function KpiInsightPanel({
  kpiKey,
  language,
  mode = 'compact',
  showDeepLink = true,
  onNavigateToEncyclopedia,
  className
}: KpiInsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(mode === 'expanded');

  const kpiData = useMemo(() => {
    const definition = KPI_DEFINITIONS[kpiKey];
    if (!definition) return null;
    return definition[language] || definition.en;
  }, [kpiKey, language]);

  const departmentConfig = useMemo(() => {
    if (!kpiData?.department) return null;
    return getDepartmentConfig(kpiData.department);
  }, [kpiData?.department]);

  if (!kpiData) {
    return null;
  }

  const isLowerBetter = kpiData.benchmark?.includes('<') ||
    kpiData.unitOfMeasure?.toLowerCase()?.includes('minute') ||
    kpiData.unitOfMeasure?.toLowerCase()?.includes('day');

  const DeptIcon = departmentConfig?.icon;
  const deptLabel = departmentConfig?.label[language] || departmentConfig?.label.en;

  const topImprovements = kpiData.improvementLevers?.slice(0, 3) || [];
  const topDiagnostics = kpiData.rootCauseDiagnostics 
    ? Object.entries(kpiData.rootCauseDiagnostics).slice(0, 2)
    : [];

  return (
    <Card className={cn("border border-border/40 bg-card/50", className)}>
      <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
        <CollapsibleTrigger asChild>
          <button className="w-full text-left p-4 hover:bg-muted/30 transition-colors duration-150 rounded-lg">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  {departmentConfig && DeptIcon && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-medium border px-1.5 py-0",
                        departmentConfig.bgClass,
                        departmentConfig.textClass,
                        departmentConfig.borderClass
                      )}
                    >
                      <DeptIcon className="h-2.5 w-2.5 mr-1" />
                      {deptLabel}
                    </Badge>
                  )}
                  {kpiData.benchmark && (
                    <Badge variant="secondary" className="text-[10px] font-normal bg-muted/60 text-muted-foreground px-1.5 py-0">
                      {isLowerBetter ? (
                        <ArrowDownRight className="h-2.5 w-2.5 mr-0.5 text-success" />
                      ) : (
                        <ArrowUpRight className="h-2.5 w-2.5 mr-0.5 text-success" />
                      )}
                      {kpiData.benchmark}
                    </Badge>
                  )}
                </div>
                <h4 className="text-sm font-semibold text-foreground leading-snug">
                  {kpiData.title}
                </h4>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                  {kpiData.executiveSummary || kpiData.definition}
                </p>
              </div>
              <ChevronDown className={cn(
                "h-4 w-4 text-muted-foreground shrink-0 transition-transform duration-200",
                isExpanded && "rotate-180"
              )} />
            </div>
          </button>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 pb-4 px-4 space-y-4">
            {/* Why It Matters */}
            {kpiData.whyItMatters && (
              <div className="pt-3 border-t border-border/30">
                <div className="flex items-center gap-2 mb-2">
                  <Target className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    {language === 'de' ? 'Warum es wichtig ist' : 'Why It Matters'}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  {kpiData.whyItMatters}
                </p>
              </div>
            )}

            {/* Interdependencies */}
            {kpiData.interdependencies && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {kpiData.interdependencies.upstreamDrivers?.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-3">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                      {language === 'de' ? 'Treiber' : 'Influenced By'}
                    </span>
                    <ul className="space-y-1">
                      {kpiData.interdependencies.upstreamDrivers.slice(0, 3).map((driver, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <TrendingUp className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{driver}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {kpiData.interdependencies.downstreamImpacts?.length > 0 && (
                  <div className="rounded-lg bg-muted/30 p-3">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide block mb-2">
                      {language === 'de' ? 'Beeinflusst' : 'Impacts'}
                    </span>
                    <ul className="space-y-1">
                      {kpiData.interdependencies.downstreamImpacts.slice(0, 3).map((impact, i) => (
                        <li key={i} className="text-xs text-foreground/80 flex items-start gap-1.5">
                          <ArrowUpRight className="h-3 w-3 text-muted-foreground mt-0.5 shrink-0" />
                          <span className="line-clamp-1">{impact}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Top Improvement Ideas */}
            {topImprovements.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Lightbulb className="h-3.5 w-3.5 text-warning" />
                  <span className="text-xs font-semibold text-foreground">
                    {language === 'de' ? 'Top Verbesserungsansätze' : 'Top Improvement Ideas'}
                  </span>
                </div>
                <ul className="space-y-1.5">
                  {topImprovements.map((lever, i) => (
                    <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                      <span className="flex items-center justify-center h-4 w-4 rounded-full bg-primary/10 text-primary text-[10px] font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span className="line-clamp-2">{lever}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Deep Link to Encyclopedia */}
            {showDeepLink && onNavigateToEncyclopedia && (
              <div className="pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onNavigateToEncyclopedia(kpiKey)}
                  className="h-7 px-2 text-xs text-primary hover:text-primary hover:bg-primary/10"
                >
                  <BookOpen className="h-3 w-3 mr-1.5" />
                  {language === 'de' ? 'Vollständige KPI-Details' : 'Full KPI Details'}
                  <ExternalLink className="h-2.5 w-2.5 ml-1" />
                </Button>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

/**
 * Lightweight tooltip content for KPI context
 */
export function KpiTooltipContent({
  kpiKey,
  language
}: {
  kpiKey: string;
  language: 'en' | 'de';
}) {
  const kpiData = useMemo(() => {
    const definition = KPI_DEFINITIONS[kpiKey];
    if (!definition) return null;
    return definition[language] || definition.en;
  }, [kpiKey, language]);

  if (!kpiData) return null;

  return (
    <div className="max-w-xs space-y-2">
      <p className="font-semibold text-sm">{kpiData.title}</p>
      <p className="text-xs text-muted-foreground leading-relaxed">
        {kpiData.definition}
      </p>
      {kpiData.benchmark && (
        <div className="flex items-center gap-1.5 text-xs">
          <Target className="h-3 w-3 text-primary" />
          <span className="text-muted-foreground">
            {language === 'de' ? 'Benchmark:' : 'Benchmark:'} <span className="font-medium text-foreground">{kpiData.benchmark}</span>
          </span>
        </div>
      )}
    </div>
  );
}
