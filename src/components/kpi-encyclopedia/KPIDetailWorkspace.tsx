import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { getDepartmentConfig } from "./departmentConfig";
import { KPIBenchmarkBar } from "./KPIBenchmarkBar";
import { KPIRootCauseTiles } from "./KPIRootCauseTiles";
import { KPIImprovementLevers } from "./KPIImprovementLevers";
import { ArrowUpRight, ArrowDownRight, CheckCircle } from "lucide-react";
import type { KPIDefinition } from "@/lib/kpiDefinitions";

interface KPIDetailWorkspaceProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kpi: KPIDefinition | null;
  departmentKey: string;
  language: string;
}

export function KPIDetailWorkspace({ open, onOpenChange, kpi, departmentKey, language }: KPIDetailWorkspaceProps) {
  if (!kpi) return null;

  const config = getDepartmentConfig(departmentKey);
  const DeptIcon = config.icon;
  const deptLabel = config.label[language as 'en' | 'de'] || config.label.en;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-2xl overflow-y-auto p-0">
        {/* Hero */}
        <div className="p-6 pb-4 border-b border-border/40">
          <SheetHeader className="space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={cn("text-xs font-normal border", config.bgClass, config.textClass, config.borderClass)} variant="outline">
                <DeptIcon className="h-3 w-3 mr-1" />
                {deptLabel}
              </Badge>
              {kpi.benchmark && (
                <Badge variant="outline" className="text-xs font-normal">
                  {kpi.benchmark}
                </Badge>
              )}
              {kpi.unitOfMeasure && (
                <Badge variant="secondary" className="text-xs font-normal">
                  {kpi.unitOfMeasure}
                </Badge>
              )}
            </div>
            <SheetTitle className="text-xl font-bold">{kpi.title}</SheetTitle>
            <SheetDescription className="text-sm leading-relaxed">
              {kpi.executiveSummary || kpi.definition}
            </SheetDescription>
          </SheetHeader>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="flex-1">
          <div className="border-b border-border/40 px-6">
            <TabsList className="h-10 bg-transparent p-0 gap-4">
              <TabsTrigger value="overview" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2.5 pt-2">
                {language === 'de' ? 'Übersicht' : 'Overview'}
              </TabsTrigger>
              <TabsTrigger value="diagnose" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2.5 pt-2">
                {language === 'de' ? 'Diagnose' : 'Diagnose'}
              </TabsTrigger>
              <TabsTrigger value="improve" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2.5 pt-2">
                {language === 'de' ? 'Verbessern' : 'Improve'}
              </TabsTrigger>
              <TabsTrigger value="related" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none px-1 pb-2.5 pt-2">
                {language === 'de' ? 'Verknüpft' : 'Related'}
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            {/* Overview Tab */}
            <TabsContent value="overview" className="mt-0 space-y-5">
              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {language === 'de' ? 'Definition' : 'Definition'}
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{kpi.definition}</p>
              </div>

              {kpi.formula && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    {language === 'de' ? 'Formel' : 'Formula'}
                  </h4>
                  <div className="bg-muted/50 rounded-xl p-3">
                    <code className="text-xs font-mono text-foreground">{kpi.formula}</code>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                {kpi.unitOfMeasure && (
                  <div className="bg-muted/30 rounded-xl p-3">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{language === 'de' ? 'Einheit' : 'Unit'}</span>
                    <p className="text-sm font-medium mt-0.5">{kpi.unitOfMeasure}</p>
                  </div>
                )}
                {kpi.benchmark && (
                  <div className="bg-muted/30 rounded-xl p-3">
                    <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Benchmark</span>
                    <p className="text-sm font-medium mt-0.5">{kpi.benchmark}</p>
                  </div>
                )}
              </div>

              <KPIBenchmarkBar benchmark={kpi.benchmark} unit={kpi.unitOfMeasure} />

              {kpi.inclusions && kpi.inclusions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    {language === 'de' ? 'Einschlüsse' : 'Includes'}
                  </h4>
                  <ul className="space-y-1">
                    {kpi.inclusions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {kpi.exclusions && kpi.exclusions.length > 0 && (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                    {language === 'de' ? 'Ausschlüsse' : 'Excludes'}
                  </h4>
                  <ul className="space-y-1">
                    {kpi.exclusions.map((item, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {item}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div>
                <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5">
                  {language === 'de' ? 'Warum wichtig' : 'Why It Matters'}
                </h4>
                <p className="text-sm text-foreground leading-relaxed">{kpi.whyItMatters}</p>
              </div>
            </TabsContent>

            {/* Diagnose Tab */}
            <TabsContent value="diagnose" className="mt-0 space-y-5">
              {kpi.rootCauseDiagnostics ? (
                <>
                  <div>
                    <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      {language === 'de' ? 'Ursachendiagnostik' : 'Root Cause Diagnostics'}
                    </h4>
                    <KPIRootCauseTiles diagnostics={kpi.rootCauseDiagnostics} language={language} mode="expanded" />
                  </div>
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {language === 'de'
                    ? 'Für diesen KPI ist noch keine erweiterte Diagnostik verfügbar.'
                    : 'Extended diagnostics not yet available for this KPI.'}
                </div>
              )}
            </TabsContent>

            {/* Improve Tab */}
            <TabsContent value="improve" className="mt-0 space-y-5">
              {kpi.improvementLevers && kpi.improvementLevers.length > 0 ? (
                <div>
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                    {language === 'de' ? 'Verbesserungshebel' : 'Improvement Levers'}
                  </h4>
                  <KPIImprovementLevers levers={kpi.improvementLevers} language={language} mode="full" />
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {language === 'de'
                    ? 'Noch keine Verbesserungshebel für diesen KPI dokumentiert.'
                    : 'No improvement levers documented for this KPI yet.'}
                </div>
              )}
            </TabsContent>

            {/* Related Tab */}
            <TabsContent value="related" className="mt-0 space-y-5">
              {kpi.interdependencies ? (
                <>
                  {kpi.interdependencies.upstreamDrivers.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <ArrowUpRight className="h-3.5 w-3.5 text-blue-500" />
                        {language === 'de' ? 'Vorgelagerte Treiber' : 'Upstream Drivers'}
                      </h4>
                      <div className="space-y-1.5">
                        {kpi.interdependencies.upstreamDrivers.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-blue-50/50 rounded-lg px-3 py-2 border border-blue-100/60">
                            <ArrowUpRight className="h-3 w-3 text-blue-400 shrink-0" />
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  {kpi.interdependencies.downstreamImpacts.length > 0 && (
                    <div>
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2 flex items-center gap-1.5">
                        <ArrowDownRight className="h-3.5 w-3.5 text-orange-500" />
                        {language === 'de' ? 'Nachgelagerte Auswirkungen' : 'Downstream Impacts'}
                      </h4>
                      <div className="space-y-1.5">
                        {kpi.interdependencies.downstreamImpacts.map((d, i) => (
                          <div key={i} className="flex items-center gap-2 text-sm text-foreground bg-orange-50/50 rounded-lg px-3 py-2 border border-orange-100/60">
                            <ArrowDownRight className="h-3 w-3 text-orange-400 shrink-0" />
                            {d}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-12 text-muted-foreground text-sm">
                  {language === 'de'
                    ? 'Keine Abhängigkeiten für diesen KPI dokumentiert.'
                    : 'No interdependencies documented for this KPI yet.'}
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
}
