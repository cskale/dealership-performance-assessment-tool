import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { mapSignalsToResources, GapCard, SignalType, DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';
import { FreshnessBadge } from '@/components/ui/FreshnessBadge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useSearchParams, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Bookmark, Play, FileText, Download, ExternalLink } from 'lucide-react';

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

function pillClass(score: number | undefined): string {
  if (score === undefined) return 'bg-slate-700/40 text-slate-300 border-slate-600';
  if (score < 50) return 'bg-red-500/20 text-red-300 border-red-500/30';
  if (score < 75) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  return 'bg-green-500/20 text-green-300 border-green-500/30';
}

function signalBadge(type: SignalType): { label: string; className: string } {
  switch (type) {
    case 'CRITICAL_GAP':
      return { label: 'Critical Gap', className: 'bg-red-100 text-red-700 border-red-200' };
    case 'HIGH_PRIORITY':
      return { label: 'High Priority', className: 'bg-amber-100 text-amber-700 border-amber-200' };
    case 'GROWTH_OPPORTUNITY':
      return { label: 'Growth Opportunity', className: 'bg-blue-100 text-blue-700 border-blue-200' };
  }
}

const TYPE_ORDER: Record<string, number> = {
  video: 0,
  article: 1,
  course: 1,
  webinar: 1,
  tool: 2,
  template: 2,
  case_study: 2,
};

function typeChip(type: string): string {
  switch (type) {
    case 'video':
    case 'webinar':
      return 'VIDEO';
    case 'template':
    case 'tool':
      return 'TEMPLATE';
    case 'case_study':
      return 'CASE STUDY';
    case 'course':
      return 'COURSE';
    default:
      return 'GUIDE';
  }
}

function ctaForType(type: string): { label: string; Icon: typeof Play } {
  switch (type) {
    case 'video':
    case 'webinar':
      return { label: 'Watch', Icon: Play };
    case 'template':
    case 'tool':
      return { label: 'Download', Icon: Download };
    default:
      return { label: 'Read', Icon: FileText };
  }
}

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  topics: string[] | null;
  is_featured: boolean | null;
}

export function RecommendedTab() {
  const { user } = useAuth();
  const [, setSearchParams] = useSearchParams();
  const { data: assessment, isLoading } = useLatestAssessment();

  const gapCards = mapSignalsToResources(assessment?.departmentScores);

  const { data: resources = [] } = useQuery({
    queryKey: ['knowledge-recommended', gapCards.map((g) => g.deptKey)],
    enabled: gapCards.length > 0,
    queryFn: async (): Promise<Resource[]> => {
      const topicFilters = gapCards.flatMap((g) => g.topicFilters);
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .overlaps('topics', topicFilters)
        .order('is_featured', { ascending: false });
      if (error) throw error;
      return (data as Resource[]) ?? [];
    },
  });

  if (isLoading) {
    return <div className="text-sm text-muted-foreground">Loading recommendations…</div>;
  }

  if (!assessment) {
    return (
      <div className="rounded-2xl border bg-card p-10 text-center">
        <h3 className="text-lg font-semibold mb-2">No assessment yet</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Complete your first assessment to get personalised recommendations.
        </p>
        <Button asChild>
          <Link to="/app/assessment">Start Assessment</Link>
        </Button>
      </div>
    );
  }

  const topGap = gapCards[0];
  const matchedResources = resources;

  const scrollToDept = (deptKey: string) => {
    const el = document.getElementById(deptKey);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div className="space-y-8">
      {/* Hero strip */}
      <div className="bg-slate-900 rounded-2xl px-8 py-6 min-h-[180px] flex flex-col gap-4">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1 min-w-0">
            <div className="mb-3">
              <FreshnessBadge completedAt={assessment.completedAt} />
            </div>
            <p className="text-xs text-slate-400 mb-1">
              {user?.email} · Assessment {new Date(assessment.completedAt).toLocaleDateString()}
            </p>
            <h2 className="text-2xl font-semibold text-white leading-tight">
              {topGap
                ? `${topGap.deptName} is your highest-priority gap — ${matchedResources.length} resource${matchedResources.length === 1 ? '' : 's'} matched.`
                : 'All departments are performing well across the board.'}
            </h2>
          </div>
          <div className="flex flex-wrap gap-2 justify-end">
            {DEPT_ORDER.map((deptKey) => {
              const score = assessment.departmentScores[deptKey];
              return (
                <button
                  key={deptKey}
                  type="button"
                  onClick={() => scrollToDept(deptKey)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${pillClass(score)}`}
                  title={DEPT_DISPLAY_NAMES[deptKey]}
                >
                  <span className="mr-2">{DEPT_DISPLAY_NAMES[deptKey]}</span>
                  <span className="font-semibold">{score !== undefined ? Math.round(score) : '—'}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Gap card groups */}
      {gapCards.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h3 className="text-lg font-semibold mb-2">Your dealership is performing well across all areas.</h3>
          <p className="text-sm text-muted-foreground mb-6">
            Keep momentum by exploring KPI deep-dives or browsing learning paths.
          </p>
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => setSearchParams({ tab: 'kpi' })}>
              KPI Encyclopedia
            </Button>
            <Button variant="outline" onClick={() => setSearchParams({ tab: 'learning' })}>
              Learning Paths
            </Button>
            <Button variant="outline" onClick={() => setSearchParams({ tab: 'downloads' })}>
              Downloads
            </Button>
          </div>
        </div>
      ) : (
        gapCards.map((gap: GapCard) => {
          const badge = signalBadge(gap.signalType);
          const groupResources = [...resources]
            .filter((r) => r.topics?.includes(gap.deptKey))
            .sort(
              (a, b) =>
                (TYPE_ORDER[a.resource_type] ?? 3) - (TYPE_ORDER[b.resource_type] ?? 3),
            );

          return (
            <section key={gap.deptKey} id={gap.deptKey} className="scroll-mt-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold">{gap.deptName}</h3>
                  <span
                    className={`px-2 py-0.5 text-xs font-medium rounded-full border ${badge.className}`}
                  >
                    {badge.label}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    Score {Math.round(gap.score)} / 100
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {groupResources.length} resource{groupResources.length === 1 ? '' : 's'}
                </span>
              </div>

              {groupResources.length === 0 ? (
                <p className="text-sm text-muted-foreground italic">
                  No resources matched for this department yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupResources.map((r) => {
                    const cta = ctaForType(r.resource_type);
                    const Icon = cta.Icon;
                    return (
                      <div
                        key={r.id}
                        className="relative rounded-xl border bg-card p-5 hover:shadow-md transition"
                      >
                        <div className="flex items-start justify-between mb-3">
                          <span className="text-[10px] font-semibold tracking-wider text-blue-700 bg-blue-100 px-2 py-0.5 rounded">
                            {typeChip(r.resource_type)}
                          </span>
                          <button
                            type="button"
                            className="text-muted-foreground hover:text-foreground"
                            aria-label="Bookmark"
                          >
                            <Bookmark className="w-4 h-4" />
                          </button>
                        </div>
                        <h4 className="font-semibold mb-2 line-clamp-2">{r.title}</h4>
                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                          {r.description}
                        </p>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
                          >
                            <Icon className="w-3.5 h-3.5" />
                            {cta.label}
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })
      )}
    </div>
  );
}
