import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  ChevronDown, BarChart3, DollarSign, Clock, Package, TrendingUp,
  Percent, Wrench, Users, Calculator, Gauge, Info,
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { getDepartmentName } from "@/lib/departmentNames";
import { questionnaire, isDataQuestion, type DataQuestion } from "@/data/questionnaire";
import { getUnitLabel } from "@/components/assessment/KpiQuestionInput";
import type { AssessmentKpiValue } from "@/hooks/useKpiValues";

interface PerformanceDataPanelProps {
  kpiValues: AssessmentKpiValue[];
}

const DEPT_ORDER = [
  'new-vehicle-sales',
  'used-vehicle-sales',
  'service-performance',
  'parts-inventory',
  'financial-operations',
];

const KPI_BENCHMARKS: Record<string, { label: string }> = {
  nvs_gross_profit_per_unit:   { label: "380 – 500 €" },
  nvs_lead_response_1h_pct:   { label: "45 – 75 %" },
  uvs_days_to_sale:            { label: "18 – 35 days" },
  uvs_gross_profit_per_unit:   { label: "350 – 600 €" },
  uvs_recon_cost_per_unit:     { label: "400 – 800 €" },
  uvs_used_to_new_ratio:       { label: "0.8 – 1.5 x:1" },
  uvs_appraisal_to_buy_pct:   { label: "25 – 45 %" },
  svc_hours_per_ro:            { label: "1.5 – 2.5 hrs" },
  svc_effective_labour_rate:   { label: "90 – 140 €" },
  svc_workshop_loading_pct:    { label: "85 – 110 %" },
  prt_gross_margin_pct:        { label: "25 – 40 %" },
  prt_inventory_turns:         { label: "6 – 10 turns" },
  prt_sales_per_ro:            { label: "120 – 250 €" },
  prt_wholesale_pct:           { label: "10 – 25 %" },
  prt_backorder_days:          { label: "2 – 7 days" },
  fin_net_profit_pct:          { label: "1.5 – 4.0 %" },
  fin_total_gp_per_nv_unit:    { label: "2,500 – 5,000 €" },
  fin_floorplan_cost_pct:      { label: "0.5 – 2.0 %" },
  fin_revenue_per_employee:    { label: "250k – 500k €" },
  fin_debtor_days:             { label: "15 – 35 days" },
  fin_aftersales_gp_share_pct: { label: "45 – 70 %" },
  fin_selling_expense_pct:     { label: "3 – 8 %" },
};

const KPI_SHORT_NAMES: Record<string, { en: string; de: string }> = {
  nvs_gross_profit_per_unit:   { en: "Avg Front-end GP",         de: "Ø Frontend-Bruttoertrag" },
  nvs_lead_response_1h_pct:   { en: "Lead Response (<1hr)",      de: "Lead-Antwort (<1h)" },
  uvs_days_to_sale:            { en: "Days to Sale",             de: "Standtage" },
  uvs_gross_profit_per_unit:   { en: "UV Front-end GP",          de: "GW Frontend-Bruttoertrag" },
  uvs_recon_cost_per_unit:     { en: "Recon Cost / Unit",        de: "Aufbereitungskosten / Fzg" },
  uvs_used_to_new_ratio:       { en: "Used:New Ratio",           de: "GW:NW Verhältnis" },
  uvs_appraisal_to_buy_pct:   { en: "Appraisal-to-Buy",        de: "Bewertung-zu-Ankauf" },
  svc_hours_per_ro:            { en: "Hours / RO",               de: "Stunden / Auftrag" },
  svc_effective_labour_rate:   { en: "Effective Labour Rate",    de: "Effektiver Stundensatz" },
  svc_workshop_loading_pct:    { en: "Workshop Loading",         de: "Werkstattauslastung" },
  prt_gross_margin_pct:        { en: "Parts Gross Margin",       de: "Teile-Bruttomarge" },
  prt_inventory_turns:         { en: "Inventory Turns",          de: "Lagerumschlag" },
  prt_sales_per_ro:            { en: "Parts Sales / RO",         de: "Teile-Umsatz / Auftrag" },
  prt_wholesale_pct:           { en: "Wholesale Share",          de: "Großhandelsanteil" },
  prt_backorder_days:          { en: "Backorder Days",           de: "Rückstandstage" },
  fin_net_profit_pct:          { en: "Net Profit Margin",        de: "Nettomarge" },
  fin_total_gp_per_nv_unit:    { en: "Total GP / NV Unit",       de: "Gesamt-DB / NW-Einheit" },
  fin_floorplan_cost_pct:      { en: "Floorplan Cost",           de: "Bestandsfinanzierung" },
  fin_revenue_per_employee:    { en: "Revenue / Employee",       de: "Umsatz / Mitarbeiter" },
  fin_debtor_days:             { en: "Debtor Days",              de: "Forderungslaufzeit" },
  fin_aftersales_gp_share_pct: { en: "Aftersales GP Share",      de: "Aftersales DB-Anteil" },
  fin_selling_expense_pct:     { en: "Selling Expense Ratio",    de: "Vertriebskostenquote" },
};

const KPI_ICONS: Record<string, typeof DollarSign> = {
  nvs_gross_profit_per_unit: DollarSign,
  nvs_lead_response_1h_pct: Clock,
  uvs_days_to_sale: Clock,
  uvs_gross_profit_per_unit: DollarSign,
  uvs_recon_cost_per_unit: Wrench,
  uvs_used_to_new_ratio: TrendingUp,
  uvs_appraisal_to_buy_pct: Percent,
  svc_hours_per_ro: Clock,
  svc_effective_labour_rate: DollarSign,
  svc_workshop_loading_pct: Gauge,
  prt_gross_margin_pct: Percent,
  prt_inventory_turns: Package,
  prt_sales_per_ro: DollarSign,
  prt_wholesale_pct: Percent,
  prt_backorder_days: Clock,
  fin_net_profit_pct: Percent,
  fin_total_gp_per_nv_unit: Calculator,
  fin_floorplan_cost_pct: DollarSign,
  fin_revenue_per_employee: Users,
  fin_debtor_days: Clock,
  fin_aftersales_gp_share_pct: Percent,
  fin_selling_expense_pct: Percent,
};

function formatValue(value: number, language: string): string {
  return value.toLocaleString(language === 'de' ? 'de-DE' : 'en-US', {
    maximumFractionDigits: 2,
  });
}

export function PerformanceDataPanel({ kpiValues }: PerformanceDataPanelProps) {
  const { t, language } = useLanguage();

  const moduleData = useMemo(() => {
    const questionLookup = new Map<string, { sectionId: string; question: DataQuestion }>();
    const totalsBySection: Record<string, number> = {};

    for (const section of questionnaire.sections) {
      for (const question of section.questions) {
        if (!isDataQuestion(question)) continue;
        questionLookup.set(question.id, { sectionId: section.id, question });
        totalsBySection[section.id] = (totalsBySection[section.id] ?? 0) + 1;
      }
    }

    const rowsBySection: Record<string, Array<{ row: AssessmentKpiValue; question: DataQuestion }>> = {};
    for (const row of kpiValues) {
      const entry = questionLookup.get(row.question_id);
      if (!entry) continue;
      (rowsBySection[entry.sectionId] ??= []).push({ row, question: entry.question });
    }

    return DEPT_ORDER
      .filter(sectionId => (rowsBySection[sectionId]?.length ?? 0) > 0)
      .map(sectionId => {
        const entries = rowsBySection[sectionId];
        const provided = entries.filter(e => !e.row.skipped && e.row.value !== null);
        const skipped = entries.filter(e => e.row.skipped || e.row.value === null);
        return { sectionId, total: totalsBySection[sectionId] ?? entries.length, provided, skipped };
      });
  }, [kpiValues]);

  if (moduleData.length === 0) return null;

  const lang = language as 'en' | 'de';

  return (
    <Card className="shadow-lg shadow-card rounded-xl overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold text-foreground">
          <BarChart3 className="h-5 w-5 text-primary" />
          {t('results.performanceData.title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {moduleData.map(({ sectionId, total, provided, skipped }) => (
          <div key={sectionId}>
            <div className="flex items-center justify-between px-5 py-2.5 bg-slate-900 text-white">
              <span className="text-xs font-semibold uppercase tracking-wider">
                {getDepartmentName(sectionId, language)}
              </span>
              <span className="text-xs text-slate-400 font-medium tabular-nums">
                {provided.length}/{total} {t('assessment.provided')}
              </span>
            </div>

            <div className="divide-y divide-slate-100">
              {provided.map(({ row, question }) => {
                const kpiKey = question.kpiKey;
                const benchmark = KPI_BENCHMARKS[kpiKey];
                const shortName = KPI_SHORT_NAMES[kpiKey];
                const displayName = shortName?.[lang] ?? shortName?.en ?? (question.translations?.[lang]?.text ?? question.text);
                const Icon = KPI_ICONS[kpiKey] ?? BarChart3;
                const unitLabel = getUnitLabel(question);
                const value = row.value as number;
                const formulaText = question.formula?.expression;

                return (
                  <div
                    key={row.id}
                    className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                  >
                    <div className="shrink-0 flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 text-slate-500">
                      <Icon className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium text-foreground truncate">
                          {displayName}
                        </span>
                        {formulaText && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Info className="h-3.5 w-3.5 text-muted-foreground/50 shrink-0 cursor-help" />
                            </TooltipTrigger>
                            <TooltipContent side="top" className="max-w-xs text-xs">
                              <p className="font-medium mb-1">{language === 'de' ? 'Berechnung' : 'Formula'}</p>
                              <p>{formulaText}</p>
                            </TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                      {benchmark && (
                        <span className="text-[11px] text-muted-foreground">
                          {language === 'de' ? 'Korridor' : 'Benchmark'}: {benchmark.label}
                        </span>
                      )}
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-base font-bold text-foreground tabular-nums">
                        {formatValue(value, language)}{unitLabel ? ` ${unitLabel}` : ''}
                      </span>
                      <div>
                        <Badge variant="outline" className="text-[11px] mt-1">
                          {t(`assessment.referencePeriod.${row.reference_period}`)}
                        </Badge>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {skipped.length > 0 && (
              <Collapsible className="border-t border-slate-100">
                <CollapsibleTrigger className="group flex items-center gap-1.5 px-5 py-2 text-xs font-medium text-muted-foreground hover:text-foreground bg-transparent border-none cursor-pointer w-full">
                  <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" />
                  {t('results.performanceData.notProvided')} ({skipped.length})
                </CollapsibleTrigger>
                <CollapsibleContent className="px-5 pb-3 space-y-1.5">
                  {skipped.map(({ row, question }) => {
                    const label = question.translations?.[lang]?.text ?? question.text;
                    return (
                      <div key={row.id} className="text-xs text-muted-foreground pl-1">
                        {label}
                      </div>
                    );
                  })}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
