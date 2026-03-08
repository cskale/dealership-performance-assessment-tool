import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, BookOpen, ArrowRight, ChevronRight } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { KPI_DEFINITIONS, KPIDefinition } from "@/lib/kpiDefinitions";
import { ORDERED_DEPARTMENTS, getDepartmentConfig } from "./departmentConfig";
import { KPIStudio } from "./KPIStudio";

interface KPIExplorerProps {
  scores: Record<string, number>;
}

export interface KPIListItem {
  key: string;
  kpi: KPIDefinition;
  departmentKey: string;
}

function highlightMatch(text: string, search: string) {
  if (!search || search.length < 2) return text;
  const idx = text.toLowerCase().indexOf(search.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="bg-primary/15 text-foreground rounded-sm px-0.5">{text.slice(idx, idx + search.length)}</mark>
      {text.slice(idx + search.length)}
    </>
  );
}

export function KPIExplorer({ scores }: KPIExplorerProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("all");
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);

  // Build flat list
  const allItems: KPIListItem[] = useMemo(() => {
    const items: KPIListItem[] = [];
    for (const [key, value] of Object.entries(KPI_DEFINITIONS)) {
      const enDef = value.en;
      const localizedDef = value[language as 'en' | 'de'] || value.en;
      items.push({
        key,
        kpi: localizedDef,
        departmentKey: enDef.department || 'other',
      });
    }
    const deptOrder = new Map(ORDERED_DEPARTMENTS.map((d, i) => [d, i]));
    items.sort((a, b) => (deptOrder.get(a.departmentKey) ?? 99) - (deptOrder.get(b.departmentKey) ?? 99));
    return items;
  }, [language]);

  // Filter
  const filteredItems = useMemo(() => {
    let result = allItems;
    if (activeDepartment !== "all") {
      result = result.filter((i) => i.departmentKey === activeDepartment);
    }
    if (searchTerm.length >= 2) {
      const s = searchTerm.toLowerCase();
      result = result.filter(
        (i) =>
          i.kpi.title.toLowerCase().includes(s) ||
          i.kpi.definition.toLowerCase().includes(s) ||
          (i.kpi.formula?.toLowerCase().includes(s) ?? false)
      );
    }
    return result;
  }, [allItems, activeDepartment, searchTerm]);

  // Department chips with counts
  const departmentChips = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of allItems) {
      counts[item.departmentKey] = (counts[item.departmentKey] || 0) + 1;
    }
    return ORDERED_DEPARTMENTS.filter((d) => counts[d]).map((d) => ({
      key: d,
      config: getDepartmentConfig(d),
      count: counts[d],
    }));
  }, [allItems]);

  // Selected KPI data
  const selectedItem = useMemo(() => {
    if (!selectedKpiKey) return null;
    return allItems.find((i) => i.key === selectedKpiKey) || null;
  }, [selectedKpiKey, allItems]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKpiKey(key);
  }, []);

  const handleCloseStudio = useCallback(() => {
    setSelectedKpiKey(null);
  }, []);

  // Navigate to related KPI by name
  const handleNavigateToKpi = useCallback((name: string) => {
    const found = allItems.find(
      (i) => i.kpi.title.toLowerCase() === name.toLowerCase()
    );
    if (found) setSelectedKpiKey(found.key);
  }, [allItems]);

  const resultCount = filteredItems.length;

  // If a KPI is selected, show Studio
  if (selectedKpiKey && selectedItem) {
    return (
      <KPIStudio
        kpiKey={selectedKpiKey}
        kpi={selectedItem.kpi}
        departmentKey={selectedItem.departmentKey}
        language={language}
        onBack={handleCloseStudio}
        onNavigateToKpi={handleNavigateToKpi}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Band */}
      <div className="relative">
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
            </h2>
          </div>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed max-w-2xl">
            {language === 'de'
              ? 'Erkunden Sie Autohaus-KPIs, Benchmark-Logik, Ursachen, kommerzielle Auswirkungen und Verbesserungshebel über alle Geschäftsfunktionen hinweg.'
              : 'Explore dealership KPIs, benchmark logic, root causes, commercial impact, and improvement levers across all business functions.'}
          </p>
        </div>

        {/* Search */}
        <div className="mt-5 max-w-md">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={language === 'de' ? 'KPIs durchsuchen...' : 'Search KPIs by name, formula, or keyword...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-11 rounded-xl border-border/60 bg-background shadow-sm"
            />
          </div>
        </div>
      </div>

      {/* Department chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide -mt-2">
        <button
          onClick={() => setActiveDepartment("all")}
          className={cn(
            "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 border",
            activeDepartment === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background text-muted-foreground border-border hover:bg-muted/60"
          )}
        >
          {language === 'de' ? 'Alle' : 'All'} ({allItems.length})
        </button>
        {departmentChips.map((chip) => {
          const isActive = activeDepartment === chip.key;
          const label = chip.config.label[language as 'en' | 'de'] || chip.config.label.en;
          const ChipIcon = chip.config.icon;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveDepartment(chip.key)}
              className={cn(
                "shrink-0 rounded-full px-4 py-2 text-xs font-medium transition-all duration-200 border flex items-center gap-1.5",
                isActive
                  ? cn(chip.config.bgClass, chip.config.textClass, chip.config.borderClass, "shadow-sm")
                  : "bg-background text-muted-foreground border-border hover:bg-muted/60"
              )}
            >
              <ChipIcon className="h-3 w-3" />
              {label} ({chip.count})
            </button>
          );
        })}
      </div>

      {/* Result count */}
      {(searchTerm.length >= 2 || activeDepartment !== "all") && (
        <p className="text-xs text-muted-foreground -mt-4">
          {resultCount} {language === 'de' ? 'KPIs gefunden' : 'KPIs found'}
        </p>
      )}

      {/* KPI Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground/50" />
          </div>
          <p className="text-sm text-muted-foreground max-w-xs">
            {language === 'de'
              ? 'Keine KPIs gefunden. Versuchen Sie einen anderen Suchbegriff oder Filter.'
              : 'No KPIs matched your search. Try another keyword or clear filters.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filteredItems.map((item) => {
            const config = getDepartmentConfig(item.departmentKey);
            const DeptIcon = config.icon;
            const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;
            const hasDeepDive = !!item.kpi.rootCauseDiagnostics;

            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className="group text-left rounded-2xl border border-border/60 bg-card p-5 transition-all duration-200 hover:border-border hover:shadow-md hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Department + badges row */}
                <div className="flex items-center gap-2 mb-3">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-medium border px-2 py-0.5",
                      config.bgClass, config.textClass, config.borderClass
                    )}
                  >
                    <DeptIcon className="h-2.5 w-2.5 mr-1" />
                    {deptLabel}
                  </Badge>
                  {item.kpi.benchmark && (
                    <Badge variant="outline" className="text-[10px] font-normal border-border/60 text-muted-foreground">
                      {item.kpi.benchmark}
                    </Badge>
                  )}
                  {hasDeepDive && (
                    <Badge variant="secondary" className="text-[10px] font-normal bg-primary/5 text-primary border-0 ml-auto">
                      Studio
                    </Badge>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-sm font-semibold text-foreground leading-snug mb-1.5 group-hover:text-primary transition-colors duration-200">
                  {highlightMatch(item.kpi.title, searchTerm)}
                </h3>

                {/* Summary */}
                <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed mb-3">
                  {item.kpi.executiveSummary
                    ? highlightMatch(item.kpi.executiveSummary.slice(0, 120) + '...', searchTerm)
                    : highlightMatch(item.kpi.definition.slice(0, 120) + '...', searchTerm)}
                </p>

                {/* Open affordance */}
                <div className="flex items-center text-xs text-muted-foreground/60 group-hover:text-primary/70 transition-colors duration-200">
                  <span className="mr-1">{language === 'de' ? 'Öffnen' : 'Open'}</span>
                  <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
