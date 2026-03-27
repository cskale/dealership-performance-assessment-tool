import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import { useLanguage } from '@/contexts/LanguageContext';
import { getDepartmentName } from '@/lib/departmentNames';
import { GitBranch, ChevronDown, ChevronUp } from 'lucide-react';
import { SIGNAL_MAPPINGS, type RootCauseDimension, type EnrichedSignalMapping } from '@/data/signalMappings';
import type { Signal } from '@/data/signalTypes';

interface CausalChainProps {
  signals: Signal[];
}

interface ChainNode {
  signalCode: string;
  department: string;
  departmentKey: string;
  signalLabel: string;
  rootCauseDimension: RootCauseDimension;
  score: number;
}

interface CausalChain {
  dimension: RootCauseDimension;
  dimensionLabel: string;
  nodes: ChainNode[];
}

const DEPT_COLORS: Record<string, string> = {
  'new-vehicle-sales': 'bg-[hsl(var(--chart-2))]',
  'used-vehicle-sales': 'bg-[hsl(var(--chart-1))]',
  'service-performance': 'bg-destructive',
  'parts-inventory': 'bg-warning',
  'financial-operations': 'bg-[hsl(var(--chart-5))]',
};

const SIGNAL_LABELS: Record<string, Record<string, string>> = {
  PROCESS_NOT_STANDARDISED: { en: 'Process Gap', de: 'Prozesslücke' },
  PROCESS_NOT_EXECUTED: { en: 'Execution Gap', de: 'Ausführungslücke' },
  ROLE_OWNERSHIP_MISSING: { en: 'Ownership Gap', de: 'Zuständigkeitslücke' },
  KPI_NOT_DEFINED: { en: 'KPI Undefined', de: 'KPI undefiniert' },
  KPI_NOT_REVIEWED: { en: 'KPI Not Reviewed', de: 'KPI nicht überprüft' },
  CAPACITY_MISALIGNED: { en: 'Capacity Gap', de: 'Kapazitätslücke' },
  TOOL_UNDERUTILISED: { en: 'Tech Underused', de: 'Tech ungenutzt' },
  GOVERNANCE_WEAK: { en: 'Weak Governance', de: 'Schwache Governance' },
};

const DIMENSION_LABELS: Record<RootCauseDimension, Record<string, string>> = {
  people: { en: 'People', de: 'Personal' },
  process: { en: 'Process', de: 'Prozess' },
  tools: { en: 'Tools', de: 'Werkzeuge' },
  structure: { en: 'Structure', de: 'Struktur' },
  incentives: { en: 'Incentives', de: 'Anreize' },
};

export function CausalChainDiagram({ signals }: CausalChainProps) {
  const { t, language } = useLanguage();
  const [showAll, setShowAll] = useState(false);

  const mappingByQuestion = useMemo(() => {
    const map = new Map<string, EnrichedSignalMapping>();
    SIGNAL_MAPPINGS.forEach(m => map.set(m.questionId, m));
    return map;
  }, []);

  const chains = useMemo<CausalChain[]>(() => {
    const dimGroups = new Map<RootCauseDimension, ChainNode[]>();

    signals.forEach(signal => {
      const triggerIds = signal.triggeringQuestionIds ?? [];
      let dimension: RootCauseDimension | undefined;

      for (const qId of triggerIds) {
        const mapping = mappingByQuestion.get(qId);
        if (mapping?.rootCauseDimension) {
          dimension = mapping.rootCauseDimension;
          break;
        }
      }

      if (!dimension) return;

      const node: ChainNode = {
        signalCode: signal.signalCode,
        department: signal.moduleKey,
        departmentKey: signal.moduleKey,
        signalLabel: SIGNAL_LABELS[signal.signalCode]?.[language] ?? signal.signalCode,
        rootCauseDimension: dimension,
        score: 0,
      };

      const existing = dimGroups.get(dimension) ?? [];
      if (!existing.some(n => n.departmentKey === signal.moduleKey)) {
        existing.push(node);
        dimGroups.set(dimension, existing);
      }
    });

    const result: CausalChain[] = [];
    dimGroups.forEach((nodes, dim) => {
      if (nodes.length >= 2) {
        result.push({
          dimension: dim,
          dimensionLabel: DIMENSION_LABELS[dim]?.[language] ?? dim,
          nodes,
        });
      }
    });

    return result.sort((a, b) => b.nodes.length - a.nodes.length);
  }, [signals, mappingByQuestion, language]);

  if (chains.length === 0) {
    return (
      <Card className="shadow-lg border">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
            <GitBranch className="h-5 w-5 text-primary" />
            {t('results.causalChain.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{t('results.causalChain.noChains')}</p>
        </CardContent>
      </Card>
    );
  }

  const visibleChains = showAll ? chains : chains.slice(0, 2);

  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <GitBranch className="h-5 w-5 text-primary" />
          {t('results.causalChain.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {visibleChains.map((chain, ci) => (
          <div key={ci} className="space-y-2">
            <Badge variant="outline" className="text-xs font-medium">
              {t('results.causalChain.sharedCause')}: {chain.dimensionLabel}
            </Badge>

            <div className="flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-0">
              {chain.nodes.map((node, ni) => (
                <div key={ni} className="flex items-center gap-0">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div
                        className={`rounded-lg px-4 py-3 min-w-[120px] text-center cursor-default ${DEPT_COLORS[node.departmentKey] ?? 'bg-muted'} text-white`}
                      >
                        <div className="text-xs font-bold leading-tight">{node.signalLabel}</div>
                        <div className="text-[10px] opacity-80 mt-0.5">
                          {getDepartmentName(node.departmentKey, language)}
                        </div>
                      </div>
                    </TooltipTrigger>
                    <TooltipContent side="top" className="max-w-[220px]">
                      <p className="text-sm font-semibold">{node.signalLabel}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {getDepartmentName(node.departmentKey, language)}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {t('results.causalChain.rootCause')}: {chain.dimensionLabel}
                      </p>
                    </TooltipContent>
                  </Tooltip>

                  {ni < chain.nodes.length - 1 && (
                    <>
                      <div className="hidden md:flex items-center px-1">
                        <svg width="40" height="20" viewBox="0 0 40 20" className="text-muted-foreground">
                          <line x1="0" y1="10" x2="30" y2="10" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="30,5 40,10 30,15" fill="currentColor" />
                        </svg>
                      </div>
                      <div className="flex md:hidden justify-center w-full py-1">
                        <svg width="20" height="24" viewBox="0 0 20 24" className="text-muted-foreground">
                          <line x1="10" y1="0" x2="10" y2="16" stroke="currentColor" strokeWidth="1.5" />
                          <polygon points="5,16 10,24 15,16" fill="currentColor" />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {chains.length > 2 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="flex items-center gap-1 text-sm text-primary hover:text-primary/80 font-medium transition-colors"
          >
            {showAll ? (
              <>
                {t('results.causalChain.showLess')} <ChevronUp className="h-4 w-4" />
              </>
            ) : (
              <>
                {t('results.causalChain.viewAll')} ({chains.length}) <ChevronDown className="h-4 w-4" />
              </>
            )}
          </button>
        )}
      </CardContent>
    </Card>
  );
}
