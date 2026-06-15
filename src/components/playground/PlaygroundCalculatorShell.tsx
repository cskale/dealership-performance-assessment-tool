import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, FileText, LucideIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';

interface KpiStat {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
}

interface PlaygroundCalculatorShellProps {
  breadcrumbLabel: string;
  icon: LucideIcon;
  category: string;
  title: string;
  versionTag?: string;
  scenario?: string;
  documentationKpiKey?: string | null;
  description: ReactNode;
  onRecalculate?: () => void;
  kpiStrip: KpiStat[];
  leftCard: ReactNode;
  rightCard: ReactNode;
  bottomStats?: KpiStat[];
}

export function PlaygroundCalculatorShell({
  breadcrumbLabel,
  icon: Icon,
  category,
  title,
  versionTag = 'v4.2',
  scenario = 'Default Scenario',
  documentationKpiKey,
  description,
  onRecalculate,
  kpiStrip,
  leftCard,
  rightCard,
  bottomStats,
}: PlaygroundCalculatorShellProps) {
  return (
    <div className="container mx-auto px-6 py-8 max-w-7xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link to="/app/playground" className="hover:text-foreground transition-colors">
          Playground
        </Link>
        <ChevronRight className="h-3.5 w-3.5" />
        <span className="text-foreground">{breadcrumbLabel}</span>
      </nav>

      {/* Header bar with left accent */}
      <div className="relative rounded-lg border bg-card mb-6 overflow-hidden">
        <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500" />
        <div className="flex items-start justify-between gap-4 px-6 py-4 pl-7">
          <div className="flex items-start gap-3">
            <div className="rounded-md bg-brand-500/10 text-brand-600 dark:text-brand-300 p-2 mt-0.5">
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-serif text-xl text-foreground">{title}</h1>
                <span className="font-mono text-xs text-muted-foreground border rounded px-1.5 py-0.5">
                  {versionTag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                <span className="uppercase tracking-wide">Scenario:</span>{' '}
                <span className="text-foreground">{scenario}</span>
              </p>
            </div>
          </div>
          {documentationKpiKey && (
            <Link
              to={`/app/knowledge/kpi/${documentationKpiKey}`}
              className="inline-flex items-center gap-1.5 text-sm text-brand-600 dark:text-brand-300 hover:underline whitespace-nowrap"
            >
              <FileText className="h-3.5 w-3.5" />
              Documentation
            </Link>
          )}
        </div>
      </div>

      {/* Intro row */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-6">
        <div className="max-w-2xl">
          <div className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600 dark:text-brand-300 mb-1.5">
            {category}
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              toast({
                title: 'Scenario saving coming soon',
                description: 'Persistent scenarios will be available in a future release.',
              })
            }
          >
            Save Model
          </Button>
          <Button size="sm" onClick={onRecalculate}>
            Recalculate
          </Button>
        </div>
      </div>

      {/* KPI summary strip */}
      <div className="rounded-lg border bg-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x">
          {kpiStrip.map((stat, i) => (
            <div key={i} className="px-6 py-5">
              <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1.5">
                {stat.label}
              </div>
              <div
                className={
                  stat.emphasis
                    ? 'font-serif text-3xl text-brand-600 dark:text-brand-300'
                    : 'font-mono text-2xl text-foreground'
                }
              >
                {stat.value}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Two-column main grid */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {leftCard}
        {rightCard}
      </div>

      {/* Bottom stats */}
      {bottomStats && bottomStats.length > 0 && (
        <div className="rounded-lg border bg-card">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x">
            {bottomStats.map((stat, i) => (
              <div key={i} className="px-6 py-4">
                <div className="text-xs uppercase tracking-[0.12em] text-muted-foreground mb-1">
                  {stat.label}
                </div>
                <div className="font-mono text-xl text-foreground">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
