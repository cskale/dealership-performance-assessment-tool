import { ReactNode, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronLeft, ChevronRight, LucideIcon } from 'lucide-react';
import { AnimatedNumber } from '@/components/playground/AnimatedNumber';
import type { MetricStatus } from '@/components/playground/CalculatorPrimitives';
import { cn } from '@/lib/utils';
import { PLAYGROUND_GUIDES } from '@/data/playgroundGuides';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';

interface KpiStat {
  label: string;
  value: ReactNode;
  emphasis?: boolean;
  caption?: string;
  status?: MetricStatus;
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
  guideId?: string;
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
  guideId,
}: PlaygroundCalculatorShellProps) {
  const { t } = useLanguage();
  const guide = guideId ? PLAYGROUND_GUIDES[guideId] : undefined;
  const storageKey = guideId ? `playground-guide:${guideId}:open` : '';
  const [guideOpen, setGuideOpen] = useState(() => {
    if (!storageKey) return false;
    try { return localStorage.getItem(storageKey) !== 'false'; } catch { return true; }
  });
  const toggleGuide = () => {
    const next = !guideOpen;
    setGuideOpen(next);
    try { localStorage.setItem(storageKey, String(next)); } catch { /* storage can be unavailable */ }
  };
  return (
    <div className="playground-calculator w-full max-w-7xl mx-auto overflow-x-hidden px-4 py-6 sm:px-6 sm:py-8">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-5 flex min-w-0 items-center gap-1.5 text-xs text-muted-foreground animate-in fade-in slide-in-from-bottom-1 duration-300">
        <Link to="/app/playground" className="flex shrink-0 items-center gap-1 transition-colors duration-200 hover:text-primary">
          <ChevronLeft className="w-3 h-3" />
          Playground
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="truncate text-foreground">{breadcrumbLabel}</span>
      </nav>

      {/* Header */}
      <header className="relative mb-5 overflow-hidden rounded-lg border border-border bg-card px-4 py-5 shadow-card animate-in fade-in slide-in-from-bottom-2 duration-300 sm:px-6 sm:py-6">
        <div className="absolute inset-y-0 left-0 w-1 bg-primary" aria-hidden />
        <div className="flex items-start gap-3.5 min-w-0">
          <div className="mt-0.5 shrink-0 rounded-md border border-primary/15 bg-primary/10 p-2.5 text-primary">
            <Icon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <p className="mb-1 text-[10px] font-semibold uppercase text-muted-foreground">
              {category}
            </p>
            <h1 className="text-xl font-bold text-foreground sm:text-2xl">{title}</h1>
          </div>
        </div>
        {description && (
          <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">{description}</p>
        )}
      </header>

      {guide && (
        <section className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card">
          <Button variant="ghost" className="h-auto w-full justify-between rounded-none px-5 py-4 text-left" onClick={toggleGuide} aria-expanded={guideOpen}>
            <span className="whitespace-normal font-semibold text-foreground">{guide.question}</span>
            <ChevronDown className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200', guideOpen && 'rotate-180')} />
          </Button>
          {guideOpen && (
            <div className="border-t border-border px-5 py-5">
              <div className="grid gap-5 md:grid-cols-3">
                {[
                  [t('playground.guide.when'), guide.useWhen],
                  [t('playground.guide.what'), guide.youGet],
                  [t('playground.guide.how'), guide.howToAct],
                ].map(([heading, items]) => (
                  <div key={heading as string}>
                    <h2 className="text-xs font-semibold uppercase text-muted-foreground">{heading as string}</h2>
                    <ul className="mt-2 space-y-2 text-sm leading-6 text-foreground">
                      {(items as string[]).map(item => <li key={item} className="flex gap-2"><span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-primary" />{item}</li>)}
                    </ul>
                  </div>
                ))}
              </div>
              <p className="mt-5 border-t border-border pt-4 text-xs text-muted-foreground"><span className="font-semibold text-foreground">{t('playground.guide.sources')}</span> {guide.dataSources}</p>
            </div>
          )}
        </section>
      )}

      {/* KPI summary strip */}
      <section aria-label="Key results" className="mb-5 overflow-hidden rounded-lg border border-border bg-card shadow-card animate-in fade-in slide-in-from-bottom-2 duration-500">
        <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
          {kpiStrip.map((stat, i) => (
            <div key={i} className="relative min-w-0 px-5 py-4 transition-colors duration-200 hover:bg-muted/50">
              <span className={cn(
                'absolute inset-y-4 left-0 w-0.5 rounded-r-full',
                stat.status === 'good' && 'bg-success',
                stat.status === 'watch' && 'bg-warning',
                stat.status === 'risk' && 'bg-destructive',
                (!stat.status || stat.status === 'neutral') && (stat.emphasis ? 'bg-primary' : 'bg-border'),
              )} aria-hidden />
              <p className="mb-2 text-[10px] font-semibold uppercase text-muted-foreground">{stat.label}</p>
              <div className={cn('min-w-0 break-words text-[26px] font-bold leading-8 numeric', stat.emphasis ? 'text-primary' : 'text-foreground')}>
                <AnimatedNumber value={stat.value} />
              </div>
              <p className="mt-1 min-h-4 text-[11px] leading-4 text-muted-foreground">
                {stat.caption ?? `Current ${stat.label.toLocaleLowerCase()}`}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Two-column main grid */}
      <div className="mb-5 grid min-w-0 gap-5 lg:grid-cols-2">
        <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-500">{leftCard}</div>
        <div className="min-w-0 animate-in fade-in slide-in-from-bottom-3 duration-700">{rightCard}</div>
      </div>

      {/* Bottom stats */}
      {bottomStats && bottomStats.length > 0 && (
        <div className="overflow-hidden rounded-lg border border-border bg-card shadow-card animate-in fade-in slide-in-from-bottom-2 duration-700">
          <div className="grid grid-cols-1 divide-y divide-border md:grid-cols-2 md:divide-x md:divide-y-0">
            {bottomStats.map((stat, i) => (
              <div key={i} className="px-5 py-4">
                <p className="mb-1.5 text-[10px] font-semibold uppercase text-muted-foreground">
                  {stat.label}
                </p>
                <div className="text-lg font-bold text-foreground numeric"><AnimatedNumber value={stat.value} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
