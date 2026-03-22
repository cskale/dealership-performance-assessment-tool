import { KPIExplorer } from "@/components/kpi-encyclopedia/KPIExplorer";
import { useLanguage } from "@/contexts/LanguageContext";
import { useEffect } from "react";

export default function KPIEncyclopediaPage() {
  const { language } = useLanguage();

  useEffect(() => {
    document.title = 'KPI Encyclopedia — Dealer Diagnostic';
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      <KPIExplorer scores={{}} />
    </div>
  );
}
