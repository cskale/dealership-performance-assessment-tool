import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, LucideIcon } from 'lucide-react';
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
    <div className="px-6 py-8 max-w-7xl mx-auto">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/app/playground" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          Playground
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-foreground">{breadcrumbLabel}</span>
      </nav>

      {/* Header */}
      <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card mb-6 px-5 py-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 min-w-0">
            <div className="rounded-md bg-[#1D7AFC]/10 text-[#1D7AFC] p-2 mt-0.5 shrink-0">
              <Icon className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
                {category}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-[15px] font-bold text-[#172B4D]">{title}</h1>
                <span className="text-[10px] text-muted-foreground border border-[#DFE1E6] rounded px-1.5 py-0.5">
                  {versionTag}
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Scenario: <span className="text-foreground">{scenario}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {documentationKpiKey && (
              <Button asChild variant="ghost" size="sm">
                <Link to={`/app/knowledge/kpi/${documentationKpiKey}`}>
                  <FileText className="h-3.5 w-3.5 mr-1.5" />
                  Documentation
                </Link>
              </Button>
            )}
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
        {description && (
          <p className="text-xs text-muted-foreground mt-3 max-w-3xl">{description}</p>
        )}
      </div>

      {/* KPI summary strip */}
      <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#DFE1E6]">
          {kpiStrip.map((stat, i) => (
            <div key={i} className="px-5 py-4">
              <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-2">
                {stat.label}
              </p>
              <div
                className={
                  stat.emphasis
                    ? 'text-2xl font-bold text-[#1D7AFC]'
                    : 'text-2xl font-bold text-[#172B4D]'
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
        <div className="bg-white rounded-xl border border-[#DFE1E6] shadow-card">
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-[#DFE1E6]">
            {bottomStats.map((stat, i) => (
              <div key={i} className="px-5 py-4">
                <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1.5">
                  {stat.label}
                </p>
                <div className="text-lg font-bold text-[#172B4D]">{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
