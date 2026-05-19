import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { mapSignalsToResources } from '@/lib/mapSignalsToResources';
import { BookOpen, Download } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  duration: string | null;
  topics: string[] | null;
  is_featured: boolean | null;
  created_at: string;
}

type TypeFilter = 'all' | 'article' | 'template' | 'case_study';
type SortOrder = 'recent' | 'az';

const TYPE_LABEL: Record<string, string> = {
  article: 'GUIDES',
  template: 'TEMPLATES',
  case_study: 'CASE STUDIES',
};

export function DownloadsTab() {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [sortOrder, setSortOrder] = useState<SortOrder>('recent');

  const { data: assessment } = useLatestAssessment();
  const gapCards = mapSignalsToResources(assessment?.departmentScores);

  const { data: downloads = [] } = useQuery({
    queryKey: ['downloads'],
    queryFn: async (): Promise<Resource[]> => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .in('resource_type', ['article', 'template', 'case_study'])
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data as Resource[]) ?? [];
    },
  });

  const filtered = useMemo(() => {
    let list = downloads;
    if (typeFilter !== 'all') list = list.filter((r) => r.resource_type === typeFilter);
    if (sortOrder === 'az') list = [...list].sort((a, b) => a.title.localeCompare(b.title));
    return list;
  }, [downloads, typeFilter, sortOrder]);

  const recommended = useMemo(() => {
    if (gapCards.length === 0) return [];
    return downloads
      .filter((d) => d.topics?.some((t) => gapCards[0].topicFilters.includes(t)))
      .slice(0, 3);
  }, [downloads, gapCards]);

  return (
    <div className="space-y-8">
      {/* Recommended strip */}
      {recommended.length > 0 && (
        <section>
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Recommended Downloads
          </h3>
          <div className="flex gap-4 overflow-x-auto pb-2">
            {recommended.map((r) => (
              <div key={r.id} className="min-w-[300px] flex-shrink-0">
                <DownloadCard resource={r} />
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-2">
        {([
          { value: 'all', label: 'All' },
          { value: 'template', label: 'Templates' },
          { value: 'article', label: 'Guides' },
          { value: 'case_study', label: 'Case Studies' },
        ] as { value: TypeFilter; label: string }[]).map((t) => (
          <button
            key={t.value}
            onClick={() => setTypeFilter(t.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              typeFilter === t.value
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {t.label}
          </button>
        ))}
        <div className="w-px h-4 bg-border mx-1" />
        {([
          { value: 'recent', label: 'Most Recent' },
          { value: 'az', label: 'A–Z' },
        ] as { value: SortOrder; label: string }[]).map((s) => (
          <button
            key={s.value}
            onClick={() => setSortOrder(s.value)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              sortOrder === s.value
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            {s.label}
          </button>
        ))}
        <span className="text-xs text-muted-foreground ml-auto">
          {filtered.length} result{filtered.length === 1 ? '' : 's'}
        </span>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No downloads match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <DownloadCard key={r.id} resource={r} />
          ))}
        </div>
      )}
    </div>
  );
}

function DownloadCard({ resource }: { resource: Resource }) {
  const isFeatured = resource.is_featured;
  return (
    <div
      className={`relative rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition h-full ${
        isFeatured ? 'border-blue-200 ring-1 ring-blue-100' : ''
      }`}
    >
      {isFeatured && (
        <span className="absolute -top-2 left-4 text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-600 text-white">
          FEATURED
        </span>
      )}
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-blue-100 text-blue-700">
          <BookOpen className="w-4 h-4" />
        </div>
        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground">
          {TYPE_LABEL[resource.resource_type] ?? 'RESOURCE'}
        </span>
      </div>
      <div className="flex-1">
        <h4 className="font-semibold mb-1.5 line-clamp-2">{resource.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-2">{resource.description}</p>
      </div>
      <div className="flex items-center justify-between pt-2">
        {resource.duration && (
          <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
            {resource.duration}
          </span>
        )}
        {resource.url && (
          <Button asChild size="sm" variant="outline" className="ml-auto">
            <a href={resource.url} target="_blank" rel="noopener noreferrer">
              <Download className="w-3.5 h-3.5 mr-1.5" />
              Download
            </a>
          </Button>
        )}
      </div>
    </div>
  );
}
