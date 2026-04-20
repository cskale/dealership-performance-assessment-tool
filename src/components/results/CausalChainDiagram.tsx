import { useMemo } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Users, GitBranch, Wrench, Building2, TrendingUp, CheckCircle2 } from 'lucide-react';
import { SIGNAL_MAPPINGS, type RootCauseDimension, type EnrichedSignalMapping } from '@/data/signalMappings';
import type { Signal } from '@/data/signalTypes';
import type { LucideIcon } from 'lucide-react';

interface CausalChainProps {
  signals: Signal[];
}

interface ChainNode {
  departmentKey: string;
}

interface CausalChain {
  dimension: RootCauseDimension;
  nodes: ChainNode[];
}

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

const DIMENSION_LABELS: Record<RootCauseDimension, { en: string; de: string }> = {
  people: { en: 'People', de: 'Personal' },
  process: { en: 'Process', de: 'Prozess' },
  tools: { en: 'Tools', de: 'Werkzeuge' },
  structure: { en: 'Structure', de: 'Struktur' },
  incentives: { en: 'Incentives', de: 'Anreize' },
};

const DIMENSION_ICONS: Record<RootCauseDimension, LucideIcon> = {
  people: Users,
  process: GitBranch,
  tools: Wrench,
  structure: Building2,
  incentives: TrendingUp,
};

const IMPLICATIONS: Record<RootCauseDimension, { en: string; de: string }> = {
  people: {
    en: 'Staff capability or capacity gaps are limiting performance across these areas simultaneously.',
    de: 'Personalkompetenz- oder Kapazitätslücken begrenzen die Leistung in diesen Bereichen gleichzeitig.',
  },
  process: {
    en: 'Process standardisation is the common missing layer — fixing it once will lift multiple departments.',
    de: 'Prozessstandardisierung ist die gemeinsame fehlende Ebene — eine einmalige Behebung verbessert mehrere Abteilungen.',
  },
  tools: {
    en: 'Technology or system gaps are creating consistent friction across departments.',
    de: 'Technologie- oder Systemlücken erzeugen konsistente Reibung über Abteilungen hinweg.',
  },
  structure: {
    en: 'Organisational design or role clarity is constraining these areas in parallel.',
    de: 'Organisationsdesign oder Rollenklarheit schränkt diese Bereiche parallel ein.',
  },
  incentives: {
    en: 'Misaligned incentives are producing similar underperformance patterns across departments.',
    de: 'Fehlausgerichtete Anreize erzeugen ähnliche Leistungsmuster in mehreren Abteilungen.',
  },
};

export function CausalChainDiagram({ signals }: CausalChainProps) {
  const { language } = useLanguage();

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

      const node: ChainNode = { departmentKey: signal.moduleKey };
      const existing = dimGroups.get(dimension) ?? [];
      if (!existing.some(n => n.departmentKey === signal.moduleKey)) {
        existing.push(node);
        dimGroups.set(dimension, existing);
      }
    });

    const result: CausalChain[] = [];
    dimGroups.forEach((nodes, dim) => {
      if (nodes.length >= 2) {
        result.push({ dimension: dim, nodes });
      }
    });

    return result.sort((a, b) => b.nodes.length - a.nodes.length).slice(0, 3);
  }, [signals, mappingByQuestion]);

  const sectionTitle = language === 'de' ? 'Gemeinsame Ursachen' : 'Shared Root Causes';

  if (chains.length === 0) {
    return (
      <Card className="shadow-sm border-success/30 bg-success/5">
        <CardHeader className="pb-3">
          <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
            {sectionTitle}
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-success shrink-0" />
            <p className="text-[13px] text-foreground">
              {language === 'de'
                ? 'Keine systemischen Muster erkannt — Abteilungsprobleme erscheinen isoliert.'
                : 'No systemic patterns detected — department issues appear isolated.'}
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg border">
      <CardHeader className="pb-3">
        <div className="text-[11px] uppercase tracking-wider text-muted-foreground font-medium">
          {sectionTitle}
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        {chains.map((chain, ci) => {
          const Icon = DIMENSION_ICONS[chain.dimension];
          const dimLabel = DIMENSION_LABELS[chain.dimension][language === 'de' ? 'de' : 'en'];
          const implication = IMPLICATIONS[chain.dimension][language === 'de' ? 'de' : 'en'];

          return (
            <div key={ci} className="space-y-2">
              <div className="flex items-center gap-2">
                <Icon className="h-4 w-4 text-foreground" />
                <span className="text-[14px] font-semibold text-foreground">{dimLabel}</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {chain.nodes.map((node, ni) => {
                  const color = DEPT_COLORS[node.departmentKey] ?? 'hsl(var(--muted-foreground))';
                  return (
                    <div key={ni} className="flex items-center gap-2">
                      <div
                        className="rounded-[20px] px-2.5 py-[3px] text-[11px] font-medium border"
                        style={{
                          backgroundColor: `${color.replace(')', ' / 0.10)')}`,
                          borderColor: `${color.replace(')', ' / 0.40)')}`,
                          color,
                        }}
                      >
                        {DEPT_ABBREV[node.departmentKey] ?? node.departmentKey}
                      </div>
                      {ni < chain.nodes.length - 1 && (
                        <span className="text-[12px] text-muted-foreground">→</span>
                      )}
                    </div>
                  );
                })}
              </div>

              <p className="text-[12px] text-muted-foreground leading-relaxed">{implication}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
