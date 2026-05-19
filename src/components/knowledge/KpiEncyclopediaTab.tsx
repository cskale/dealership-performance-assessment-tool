import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { getAllKPIDefinitions } from '@/lib/kpiDefinitions';
import { DEPT_DISPLAY_NAMES } from '@/lib/mapSignalsToResources';
import { Search } from 'lucide-react';

function toSentenceCase(str: string): string {
  return str.replace(/-/g, ' ').replace(/^./, (c) => c.toUpperCase());
}

export function KpiEncyclopediaTab() {
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

  const allDepts = useMemo(() => {
    const seen = new Set<string>();
    const result: { key: string; label: string }[] = [];
    entries.forEach(([, d]) => {
      if (d.department && !seen.has(d.department)) {
        seen.add(d.department);
        result.push({
          key: d.department,
          label: DEPT_DISPLAY_NAMES[d.department] ?? toSentenceCase(d.department),
        });
      }
    });
    return result.sort((a, b) => a.label.localeCompare(b.label));
  }, [entries]);

  return (
    <div className="space-y-6">
      {/* Filter bar — single row */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search KPIs by name or definition…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          value={deptFilter}
          onChange={(e) => setDeptFilter(e.target.value)}
          className="text-sm border border-border rounded-md px-3 py-2 bg-background md:w-56"
        >
          <option value="all">All departments</option>
          {allDepts.map((d) => (
            <option key={d.key} value={d.key}>{d.label}</option>
          ))}
        </select>
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
            const deptName = DEPT_DISPLAY_NAMES[dept] ?? toSentenceCase(dept);
            return (
              <div
                key={key}
                className="rounded-xl border border-l-4 border-l-blue-400 bg-card p-5 flex flex-col gap-3 hover:shadow-md transition"
              >
                <div className="flex items-center justify-between gap-2">
                  {deptName && (
                    <span className="text-[10px] font-semibold tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {deptName}
                    </span>
                  )}
                </div>
                <div>
                  <h4 className="font-semibold mb-1">{def.title}</h4>
                  <p className="text-sm text-muted-foreground line-clamp-2">{def.definition}</p>
                </div>
                <Link
                  to={`/app/knowledge/kpi/${key}`}
                  className="text-sm font-medium text-primary hover:underline mt-auto"
                >
                  View details →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
