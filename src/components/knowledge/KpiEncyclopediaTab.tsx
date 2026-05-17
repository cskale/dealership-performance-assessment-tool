import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { useLatestAssessment } from '@/hooks/useLatestAssessment';
import { getAllKPIDefinitions } from '@/lib/kpiDefinitions';
import { DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';
import { Search } from 'lucide-react';

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

function dotColor(score: number | undefined): string {
  if (score === undefined) return 'bg-slate-300';
  if (score < 50) return 'bg-red-500';
  if (score < 65) return 'bg-amber-500';
  if (score < 75) return 'bg-blue-500';
  return 'bg-green-500';
}

function borderClass(score: number | undefined): string {
  if (score === undefined) return 'border-l-transparent';
  if (score < 50) return 'border-l-red-500';
  if (score < 65) return 'border-l-amber-500';
  return 'border-l-transparent';
}

export function KpiEncyclopediaTab() {
  const { data: assessment } = useLatestAssessment();
  const [search, setSearch] = useState('');
  const [deptFilter, setDeptFilter] = useState<string>('all');

  const allKpis = useMemo(() => getAllKPIDefinitions('en'), []);
  const entries = useMemo(() => Object.entries(allKpis), [allKpis]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return entries.filter(([key, def]) => {
      if (deptFilter !== 'all' && def.department !== deptFilter) return false;
      if (!q) return true;
      return (
        key.toLowerCase().includes(q) ||
        def.title?.toLowerCase().includes(q) ||
        def.definition?.toLowerCase().includes(q)
      );
    });
  }, [entries, search, deptFilter]);

  const totalKpis = entries.length;
  const totalDepartments = new Set(entries.map(([, d]) => d.department).filter(Boolean)).size;

  return (
    <div className="space-y-6">
      {/* Filter bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
          <div className="relative md:w-3/5">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search KPIs by name or definition…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="text-sm text-muted-foreground md:ml-auto">
            <span className="font-semibold text-foreground">Total KPIs: {totalKpis}</span>
            <span className="mx-2">·</span>
            <span className="font-semibold text-foreground">Departments: {totalDepartments || 5}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setDeptFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
              deptFilter === 'all'
                ? 'bg-blue-100 text-blue-700 border-blue-200'
                : 'bg-background text-muted-foreground border-border hover:bg-muted'
            }`}
          >
            All
          </button>
          {DEPT_ORDER.map((dept) => (
            <button
              key={dept}
              onClick={() => setDeptFilter(dept)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium border transition ${
                deptFilter === dept
                  ? 'bg-blue-100 text-blue-700 border-blue-200'
                  : 'bg-background text-muted-foreground border-border hover:bg-muted'
              }`}
            >
              {DEPT_DISPLAY_NAMES[dept]}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl border bg-card p-10 text-center text-sm text-muted-foreground">
          No KPIs match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(([key, def]) => {
            const dept = def.department ?? '';
            const deptName = DEPT_DISPLAY_NAMES[dept];
            const score = dept ? assessment?.departmentScores[dept] : undefined;
            return (
              <div
                key={key}
                className={`rounded-xl border border-l-4 bg-card p-5 flex flex-col gap-3 hover:shadow-md transition ${borderClass(score)}`}
              >
                <div className="flex items-center justify-between gap-2">
                  {deptName && (
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {deptName}
                    </span>
                  )}
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className={`w-2 h-2 rounded-full ${dotColor(score)}`} />
                    <span>{score !== undefined ? `${Math.round(score)} / 100` : '—'}</span>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{def.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{def.definition}</p>
                </div>
                <Link
                  to={`/app/knowledge/kpi/${key}`}
                  className="text-sm font-medium text-primary hover:underline mt-auto"
                >
                  View Details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
