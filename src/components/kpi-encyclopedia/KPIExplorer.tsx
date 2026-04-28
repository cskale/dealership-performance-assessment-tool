import { useMemo, useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Search, BookOpen, ArrowRight, ChevronDown } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { KPI_DEFINITIONS, KPIDefinition } from "@/lib/kpiDefinitions";
import { ORDERED_DEPARTMENTS, getDepartmentConfig } from "@/lib/departmentConfig";
import { KPIStudio } from "./KPIStudio";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";

interface KPIExplorerProps {
  scores: Record<string, number>;
  initialKpiKey?: string;
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

// Primary visible chips (max 6) + overflow into dropdown
const PRIMARY_CHIP_COUNT = 6;

export function KPIExplorer({ initialKpiKey }: KPIExplorerProps) {
  const { language } = useLanguage();

  const [searchTerm, setSearchTerm] = useState("");
  const [activeDepartment, setActiveDepartment] = useState<string>("all");
  const [selectedKpiKey, setSelectedKpiKey] = useState<string | null>(initialKpiKey ?? null);

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

  const primaryChips = departmentChips.slice(0, PRIMARY_CHIP_COUNT);
  const overflowChips = departmentChips.slice(PRIMARY_CHIP_COUNT);

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

  const resultCount = filteredItems.length;

  // Detail view opens in a centered modal (rendered at bottom of component)


  // Check if active department is in overflow
  const activeInOverflow = overflowChips.some(c => c.key === activeDepartment);
  const activeOverflowLabel = activeInOverflow
    ? (getDepartmentConfig(activeDepartment).label[language as 'en' | 'de'] || getDepartmentConfig(activeDepartment).label.en)
    : null;

  return (
    <div className="space-y-6">
      {/* Hero Band */}
      <div>
        <div className="max-w-3xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <BookOpen className="h-4.5 w-4.5 text-primary" />
            </div>
            <h2 className="text-h3 text-foreground">
              {language === 'de' ? 'KPI-Enzyklopädie' : 'KPI Encyclopedia'}
            </h2>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed max-w-2xl">
            {language === 'de'
              ? 'Erkunden Sie Autohaus-KPIs, Benchmark-Logik, Ursachendiagnostik und Verbesserungshebel über alle Geschäftsfunktionen hinweg.'
              : 'Explore dealership KPIs, benchmark logic, root cause diagnostics, and improvement levers across all business functions.'}
          </p>
        </div>

        {/* Search */}
        <div className="mt-4 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder={language === 'de' ? 'KPIs durchsuchen...' : 'Search KPIs by name, formula, or keyword...'}
               value={searchTerm}
               onChange={(e) => setSearchTerm(e.target.value)}
               className="pl-9 h-11 rounded-lg border-border/60 bg-background focus-visible:ring-primary/30"
             />
          </div>
        </div>
      </div>

      {/* Category navigation — wrapping chips + "More" dropdown */}
      <div className="flex flex-wrap items-center gap-2">
        <button
          onClick={() => setActiveDepartment("all")}
          className={cn(
            "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border",
            activeDepartment === "all"
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-background text-muted-foreground border-border hover:bg-muted/60"
          )}
        >
          {language === 'de' ? 'Alle' : 'All'} ({allItems.length})
        </button>
        {primaryChips.map((chip) => {
          const isActive = activeDepartment === chip.key;
          const label = chip.config.label[language as 'en' | 'de'] || chip.config.label.en;
          return (
            <button
              key={chip.key}
              onClick={() => setActiveDepartment(chip.key)}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-xs font-medium transition-all duration-200 border",
                isActive
                  ? cn(chip.config.bgClass, chip.config.textClass, chip.config.borderClass, "shadow-sm")
                  : "bg-background text-muted-foreground border-border hover:bg-muted/60"
              )}
            >
              {label}
            </button>
          );
        })}

        {/* Overflow dropdown */}
        {overflowChips.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={activeInOverflow ? "secondary" : "outline"}
                size="sm"
                className={cn(
                  "rounded-full h-auto px-3.5 py-1.5 text-xs font-medium gap-1",
                  activeInOverflow && "bg-muted text-foreground"
                )}
              >
                {activeOverflowLabel || (language === 'de' ? 'Mehr Filter' : 'More filters')}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="min-w-[180px]">
              {overflowChips.map((chip) => {
                const label = chip.config.label[language as 'en' | 'de'] || chip.config.label.en;
                return (
                  <DropdownMenuItem
                    key={chip.key}
                    onClick={() => setActiveDepartment(chip.key)}
                    className={cn(
                      "text-xs",
                      activeDepartment === chip.key && "font-semibold"
                    )}
                  >
                    {label} ({chip.count})
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      {/* Result count */}
      {(searchTerm.length >= 2 || activeDepartment !== "all") && (
        <p className="text-sm text-muted-foreground -mt-2">
          {resultCount} {language === 'de' ? 'KPIs gefunden' : 'KPIs found'}
        </p>
      )}

      {/* KPI Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
            <Search className="h-5 w-5 text-muted-foreground/50" />
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

            return (
              <button
                key={item.key}
                onClick={() => handleSelect(item.key)}
                className="group text-left bg-card rounded-xl border border-border/50 p-4 transition-all duration-200 hover:border-primary/40 hover:shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:-translate-y-px focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                {/* Department badge */}
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
                </div>

                {/* Title */}
                <h3 className="text-base font-semibold text-foreground leading-snug mb-1.5 line-clamp-2 group-hover:text-primary transition-colors duration-200">
                  {highlightMatch(item.kpi.title, searchTerm)}
                </h3>

                {/* Definition excerpt */}
                <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed mb-3 mt-2">
                  {item.kpi.executiveSummary
                    ? highlightMatch(item.kpi.executiveSummary.slice(0, 140) + '…', searchTerm)
                    : highlightMatch(item.kpi.definition.slice(0, 140) + '…', searchTerm)}
                </p>

                {/* Bottom row */}
                <div className="flex items-center justify-end">
                  <span className="text-sm text-primary font-medium group-hover:text-primary/80 transition-colors duration-200 flex items-center gap-1">
                    {language === 'de' ? 'Erkunden' : 'Explore'}
                    <ArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* KPI Detail Modal */}
      <Dialog open={!!selectedKpiKey && !!selectedItem} onOpenChange={(open) => { if (!open) handleCloseStudio(); }}>
        <DialogContent className="max-w-3xl max-h-[85vh] p-0 gap-0 overflow-hidden rounded-xl bg-card shadow-xl">
          {selectedKpiKey && selectedItem && (
            <KPIStudio
              kpiKey={selectedKpiKey}
              kpi={selectedItem.kpi}
              departmentKey={selectedItem.departmentKey}
              language={language}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
