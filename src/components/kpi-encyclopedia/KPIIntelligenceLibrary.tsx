import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, BookOpen } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { KPI_DEFINITIONS, KPIDefinition } from "@/lib/kpiDefinitions";
import { DEPARTMENT_CONFIG, ORDERED_DEPARTMENTS, getDepartmentConfig } from "@/lib/departmentConfig";
import { KPIListPane, KPIListItem } from "./KPIListPane";
import { KPIDetailPreview } from "./KPIDetailPreview";
import { KPIDetailWorkspace } from "./KPIDetailWorkspace";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";

interface KPIIntelligenceLibraryProps {
  scores: Record<string, number>;
}

export function KPIIntelligenceLibrary({ scores }: KPIIntelligenceLibraryProps) {
  const { language } = useLanguage();
  const isMobile = useIsMobile();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("all");
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);

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
    // Sort by department order
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

  // Selected KPI data
  const selectedKpi = useMemo(() => {
    if (!selectedKpiKey) return null;
    const item = allItems.find((i) => i.key === selectedKpiKey);
    return item || null;
  }, [selectedKpiKey, allItems]);

  const handleSelect = useCallback((key: string) => {
    setSelectedKpiKey(key);
    if (isMobile) setMobilePreviewOpen(true);
  }, [isMobile]);

  const handleOpenDetail = useCallback(() => {
    setDetailOpen(true);
    if (isMobile) setMobilePreviewOpen(false);
  }, [isMobile]);

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

  // A-Z letters
  const letters = useMemo(() => {
    const available = new Set(filteredItems.map((i) => i.kpi.title[0].toUpperCase()));
    return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((l) => ({
      letter: l,
      available: available.has(l),
    }));
  }, [filteredItems]);

  const resultCount = filteredItems.length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">
              {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">
            {language === 'de'
              ? 'Erkunden Sie Autohaus-KPIs, Benchmark-Logik, Ursachen und Verbesserungshebel.'
              : 'Explore dealership KPIs, benchmark logic, root causes, and improvement levers across all business functions.'}
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={language === 'de' ? 'KPIs durchsuchen...' : 'Search KPIs...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
      </div>

      {/* Department chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => setActiveDepartment("all")}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 border",
            activeDepartment === "all"
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-border hover:bg-muted"
          )}
        >
          {language === 'de' ? 'Alle' : 'All'} ({allItems.length})
        </button>
        {departmentChips.map((chip) => {
          const isActive = activeDepartment === chip.key;
          const label = chip.config.label[language as 'en' | 'de'] || chip.config.label.en;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveDepartment(chip.key)}
              className={cn(
                "shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-colors duration-150 border",
                isActive
                  ? cn(chip.config.bgClass, chip.config.textClass, chip.config.borderClass)
                  : "bg-background text-muted-foreground border-border hover:bg-muted"
              )}
            >
              {label} ({chip.count})
            </button>
          );
        })}
      </div>

      {/* Search result count */}
      {(searchTerm.length >= 2 || activeDepartment !== "all") && (
        <p className="text-xs text-muted-foreground">
          {resultCount} {language === 'de' ? 'KPIs gefunden' : 'KPIs found'}
        </p>
      )}

      {/* Split pane: desktop vs mobile */}
      {isMobile ? (
        <>
          <div className="border rounded-2xl overflow-hidden bg-card">
            <KPIListPane
              items={filteredItems}
              selectedKey={selectedKpiKey}
              onSelect={handleSelect}
              language={language}
              searchTerm={searchTerm}
              className="max-h-[60vh]"
            />
          </div>
          {/* Mobile preview sheet */}
          <Sheet open={mobilePreviewOpen} onOpenChange={setMobilePreviewOpen}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-2xl p-0">
              <KPIDetailPreview
                kpiKey={selectedKpiKey}
                kpi={selectedKpi?.kpi || null}
                departmentKey={selectedKpi?.departmentKey || ''}
                language={language}
                onOpenDetail={handleOpenDetail}
                onSelectKpi={handleSelect}
                className="h-full"
              />
            </SheetContent>
          </Sheet>
        </>
      ) : (
        <div className="border rounded-2xl overflow-hidden bg-card" style={{ height: 'calc(100vh - 380px)', minHeight: '500px' }}>
          <ResizablePanelGroup direction="horizontal">
            <ResizablePanel defaultSize={40} minSize={30} maxSize={50}>
              <KPIListPane
                items={filteredItems}
                selectedKey={selectedKpiKey}
                onSelect={handleSelect}
                language={language}
                searchTerm={searchTerm}
                className="h-full"
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={60}>
              <KPIDetailPreview
                kpiKey={selectedKpiKey}
                kpi={selectedKpi?.kpi || null}
                departmentKey={selectedKpi?.departmentKey || ''}
                language={language}
                onOpenDetail={handleOpenDetail}
                onSelectKpi={handleSelect}
                className="h-full"
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      )}

      {/* Detail workspace sheet */}
      <KPIDetailWorkspace
        open={detailOpen}
        onOpenChange={setDetailOpen}
        kpi={selectedKpi?.kpi || null}
        departmentKey={selectedKpi?.departmentKey || ''}
        language={language}
      />
    </div>
  );
}
