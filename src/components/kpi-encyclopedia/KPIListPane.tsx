import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDepartmentConfig } from "./departmentConfig";
import type { KPIDefinition } from "@/lib/kpiDefinitions";
import { ChevronRight } from "lucide-react";

export interface KPIListItem {
  key: string;
  kpi: KPIDefinition;
  departmentKey: string;
}

interface KPIListPaneProps {
  items: KPIListItem[];
  selectedKey: string | null;
  onSelect: (key: string) => void;
  language: string;
  searchTerm: string;
  className?: string;
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

export function KPIListPane({ items, selectedKey, onSelect, language, searchTerm, className }: KPIListPaneProps) {
  // Group by department
  const grouped: Record<string, KPIListItem[]> = {};
  for (const item of items) {
    const dept = item.departmentKey;
    if (!grouped[dept]) grouped[dept] = [];
    grouped[dept].push(item);
  }

  return (
    <div className={cn("overflow-y-auto", className)}>
      {Object.entries(grouped).map(([deptKey, kpis]) => {
        const config = getDepartmentConfig(deptKey);
        const DeptIcon = config.icon;
        const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;

        return (
          <div key={deptKey} className="mb-1">
            {/* Department section header */}
            <div className="flex items-center gap-2 px-4 py-2.5 sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b border-border/40">
              <div className={cn("p-1 rounded-md", config.bgClass)}>
                <DeptIcon className={cn("h-3.5 w-3.5", config.textClass)} />
              </div>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{deptLabel}</span>
              <span className="text-[10px] text-muted-foreground/60 ml-auto">{kpis.length}</span>
            </div>

            {/* KPI rows */}
            {kpis.map((item) => {
              const isSelected = selectedKey === item.key;
              const hasDeepDive = !!item.kpi.rootCauseDiagnostics;

              return (
                <button
                  key={item.key}
                  onClick={() => onSelect(item.key)}
                  className={cn(
                    "w-full text-left px-4 py-3 transition-colors duration-150 border-l-2 group",
                    isSelected
                      ? "bg-primary/5 border-l-primary"
                      : "border-l-transparent hover:bg-muted/40"
                  )}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className={cn(
                      "text-sm font-medium leading-snug",
                      isSelected ? "text-primary" : "text-foreground"
                    )}>
                      {highlightMatch(item.kpi.title, searchTerm)}
                    </span>
                    <ChevronRight className={cn(
                      "h-3.5 w-3.5 shrink-0 transition-colors",
                      isSelected ? "text-primary" : "text-muted-foreground/40 group-hover:text-muted-foreground"
                    )} />
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5 pr-4">
                    {highlightMatch(item.kpi.definition, searchTerm)}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    {item.kpi.benchmark && (
                      <Badge variant="outline" className="text-[10px] h-5 px-1.5 font-normal border-border/60">
                        {item.kpi.benchmark}
                      </Badge>
                    )}
                    {hasDeepDive && (
                      <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-normal bg-primary/5 text-primary border-0">
                        {language === 'de' ? 'Deep Dive' : 'Deep Dive'}
                      </Badge>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}

      {items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
          <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center mb-3">
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm text-muted-foreground">
            {language === 'de'
              ? 'Keine KPIs gefunden. Versuchen Sie einen anderen Suchbegriff oder Filter.'
              : 'No KPIs matched your search. Try another keyword or clear filters.'}
          </p>
        </div>
      )}
    </div>
  );
}
