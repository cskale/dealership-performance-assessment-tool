import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';
import { Play } from 'lucide-react';

interface Resource {
  id: string;
  title: string;
  description: string | null;
  resource_type: string;
  url: string | null;
  thumbnail_url: string | null;
  duration: string | null;
  topics: string[] | null;
  is_featured: boolean | null;
}

interface ProgressRow {
  resource_id: string;
  modules_completed: number;
  total_modules: number;
}

type FilterTab = 'all' | 'strategic' | 'operational';

function deptLabel(topics: string[] | null | undefined): string | null {
  if (!topics) return null;
  for (const t of topics) {
    if (DEPT_DISPLAY_NAMES[t]) return DEPT_DISPLAY_NAMES[t];
  }
  return null;
}

export function LearningPathsTab() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterTab>('all');

  const { data: paths = [] } = useQuery({
    queryKey: ['learning-paths'],
    queryFn: async (): Promise<Resource[]> => {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .eq('resource_type', 'course')
        .order('is_featured', { ascending: false });
      if (error) throw error;
      return (data as Resource[]) ?? [];
    },
  });

  const { data: progress = [] } = useQuery({
    queryKey: ['learning-progress', user?.id],
    enabled: !!user?.id,
    queryFn: async (): Promise<ProgressRow[]> => {
      const { data, error } = await supabase
        .from('user_learning_progress')
        .select('*')
        .eq('user_id', user!.id);
      if (error) throw error;
      return (data as ProgressRow[]) ?? [];
    },
  });

  const startPath = useMutation({
    mutationFn: async (resourceId: string) => {
      if (!user) return;
      const { error } = await supabase.from('user_learning_progress').upsert(
        {
          user_id: user.id,
          resource_id: resourceId,
          last_accessed_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,resource_id' },
      );
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['learning-progress'] }),
  });

  const progressByResource = useMemo(() => {
    const map = new Map<string, ProgressRow>();
    progress.forEach((p) => map.set(p.resource_id, p));
    return map;
  }, [progress]);

  function progressPct(resourceId: string): number {
    const entry = progressByResource.get(resourceId);
    if (!entry || entry.total_modules === 0) return 0;
    return Math.round((entry.modules_completed / entry.total_modules) * 100);
  }

  const featured = paths.find((p) => p.is_featured) ?? paths[0];
  const activePaths = paths.filter((p) => progressByResource.has(p.id));

  const filteredAll = useMemo(() => {
    if (filter === 'all') return paths;
    return paths.filter((p) => p.topics?.includes(filter));
  }, [paths, filter]);

  const handleStart = (id: string) => {
    startPath.mutate(id);
  };

  return (
    <div className="space-y-10">
      {/* Featured hero */}
      {featured ? (
        <div
          className="relative rounded-2xl overflow-hidden min-h-[320px] flex items-end p-8 text-white"
          style={{
            backgroundImage: featured.thumbnail_url
              ? `linear-gradient(180deg, rgba(15,23,42,0.4) 0%, rgba(15,23,42,0.92) 100%), url(${featured.thumbnail_url})`
              : 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute top-6 left-6 flex gap-2">
            {deptLabel(featured.topics) && (
              <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700">
                {deptLabel(featured.topics)}
              </span>
            )}
            <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-white/15 text-white border border-white/20">
              LEARNING PATH
            </span>
          </div>
          <div className="relative max-w-2xl">
            <h2 className="text-3xl font-semibold leading-tight mb-2">{featured.title}</h2>
            <p className="text-sm text-slate-200 mb-5 line-clamp-2">{featured.description}</p>
            {progressByResource.has(featured.id) && (
              <div className="mb-4 max-w-sm">
                <Progress value={progressPct(featured.id)} className="h-1.5" />
                <p className="text-xs text-slate-300 mt-1.5">{progressPct(featured.id)}% complete</p>
              </div>
            )}
            <Button
              onClick={() => handleStart(featured.id)}
              className="bg-white text-slate-900 hover:bg-slate-100"
            >
              <Play className="w-4 h-4 mr-2" />
              {progressByResource.has(featured.id) ? 'Resume' : 'Start Learning Path'}
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-2xl border bg-card p-10 text-center">
          <h3 className="text-lg font-semibold mb-2">Start your first learning path</h3>
          <p className="text-sm text-muted-foreground">No learning paths are available yet.</p>
        </div>
      )}

      {/* Active paths */}
      {activePaths.length > 0 && (
        <section>
          <h3 className="text-lg font-semibold mb-4">Continue learning</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePaths.map((p) => (
              <PathCard
                key={p.id}
                path={p}
                pct={progressPct(p.id)}
                onStart={() => handleStart(p.id)}
                ctaLabel="Continue Path"
              />
            ))}
          </div>
        </section>
      )}

      {/* All paths */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">All learning paths</h3>
          <div className="flex gap-2">
            {(['all', 'strategic', 'operational'] as FilterTab[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                  filter === f
                    ? 'bg-blue-100 text-blue-700 border-blue-200'
                    : 'bg-background text-muted-foreground border-border hover:bg-muted'
                }`}
              >
                {f === 'all' ? 'All Modules' : f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {filteredAll.length === 0 ? (
          <p className="text-sm text-muted-foreground">No paths match this filter.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAll.map((p) => {
              const started = progressByResource.has(p.id);
              return (
                <PathCard
                  key={p.id}
                  path={p}
                  pct={started ? progressPct(p.id) : null}
                  onStart={() => handleStart(p.id)}
                  ctaLabel={started ? 'Continue Path' : 'Start Path'}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

interface PathCardProps {
  path: Resource;
  pct: number | null;
  onStart: () => void;
  ctaLabel: string;
}

function PathCard({ path, pct, onStart, ctaLabel }: PathCardProps) {
  const dept = deptLabel(path.topics);
  return (
    <div className="rounded-xl border bg-card p-5 flex flex-col gap-3 hover:shadow-md transition">
      <div className="flex items-center gap-2">
        {dept && (
          <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
            {dept}
          </span>
        )}
        <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
          COURSE
        </span>
      </div>
      <div>
        <h4 className="font-semibold mb-1 line-clamp-2">{path.title}</h4>
        <p className="text-sm text-muted-foreground line-clamp-3">{path.description}</p>
      </div>
      {pct !== null && (
        <div className="mt-1">
          <Progress value={pct} className="h-1.5" />
          <p className="text-xs text-muted-foreground mt-1">{pct}% complete</p>
        </div>
      )}
      <Button variant="outline" size="sm" onClick={onStart} className="mt-auto self-start">
        {ctaLabel}
      </Button>
    </div>
  );
}
