import { useParams, Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { KPIExplorer } from '@/components/kpi-encyclopedia/KPIExplorer';
import { useLatestAssessment } from '@/hooks/useLatestAssessment';

export default function KpiDetailPage() {
  const { kpiKey } = useParams<{ kpiKey: string }>();
  const { data: assessment } = useLatestAssessment();

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-6">
        <Link to="/app/knowledge?tab=kpi" className="hover:text-foreground flex items-center gap-1">
          <ChevronLeft className="w-3 h-3" />
          Knowledge
        </Link>
        <span>/</span>
        <span>KPI Encyclopedia</span>
        {kpiKey && (
          <>
            <span>/</span>
            <span className="text-foreground capitalize">{kpiKey.replace(/-/g, ' ')}</span>
          </>
        )}
      </nav>
      <KPIExplorer scores={assessment?.departmentScores ?? {}} initialKpiKey={kpiKey} />
    </div>
  );
}
