import { KPIExplorer } from "@/components/kpi-encyclopedia/KPIExplorer";
import { useEffect } from "react";
import { useSearchParams } from "react-router-dom";

export default function KPIEncyclopediaPage() {
  const [searchParams] = useSearchParams();
  const initialKpiKey = searchParams.get('kpi') ?? undefined;

  useEffect(() => {
    document.title = 'KPI Encyclopedia — Dealer Diagnostic';
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <KPIExplorer scores={{}} initialKpiKey={initialKpiKey} />
    </div>
  );
}
