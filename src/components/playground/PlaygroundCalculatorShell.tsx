import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';

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
  description: ReactNode;
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
  description,
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
        <div className="flex items-start gap-3 min-w-0">
          <div className="rounded-md bg-[#1D7AFC]/10 text-[#1D7AFC] p-2 mt-0.5 shrink-0">
            <Icon className="h-4 w-4" />
          </div>
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground mb-1">
              {category}
            </p>
            <h1 className="text-[15px] font-bold text-[#172B4D]">{title}</h1>
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
