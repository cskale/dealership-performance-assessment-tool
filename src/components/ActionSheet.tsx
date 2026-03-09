import { useState, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { CalendarIcon, Save, X, Trash2, Lightbulb, Target, TrendingUp } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { ActionRationale } from "@/lib/actionRationaleMap";
import { ScrollArea } from "@/components/ui/scroll-area";
import { KPI_DEFINITIONS } from "@/lib/kpiDefinitions";
import { useLanguage } from "@/contexts/LanguageContext";

interface Action {
  id: string;
  department: string;
  action_title: string;
  action_description: string;
  priority: string;
  responsible_person: string | null;
  target_completion_date: string | null;
  status: string;
  support_required_from: string[] | null;
  kpis_linked_to: string[] | null;
}

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: Action | null;
  mode: 'create' | 'edit';
  onSave: (action: Partial<Action>) => void;
  onDelete?: (actionId: string) => void;
  readOnly?: boolean;
  rationale?: ActionRationale;
  cleanDescription?: string;
}

const RESPONSIBLE_PERSONS = [
  "Dealer Principal",
  "Aftersales Manager",
  "Parts Supervisor",
  "Sales Consultant",
  "Sales Manager",
  "Service Manager",
  "Finance Manager",
  "Marketing Manager"
];

const SUPPORT_OPTIONS = ["Coach", "IT Team", "Parts Vendor", "OEM", "Management", "Training Provider", "Consultant"];

const DEPARTMENTS = ["Parts", "Workshop", "Sales", "Aftersales", "Finance", "Marketing", "Customer Service",
  "New Vehicle Sales", "Used Vehicle Sales", "Service", "Parts & Inventory", "Financial Operations"];

// Map departments to KPI keys for intelligent linking
const DEPARTMENT_KPI_MAP: Record<string, string[]> = {
  'New Vehicle Sales': ['leadResponseTime', 'leadConversion', 'showroomTrafficConversion', 'newVehicleGross', 'salesCycle', 'csiNps'],
  'Used Vehicle Sales': ['grossPerUsedRetailed', 'usedVehicleInventoryTurn', 'reconCycleDays', 'daysSupply', 'usedRetailMix'],
  'Service': ['serviceAbsorption', 'labourEfficiency', 'technicianUtilization', 'effectiveLabourRate', 'serviceRetention', 'hoursPerRo'],
  'Parts': ['partsGrossProfit', 'partsInventoryTurnover', 'partsFillRate', 'partsSalesPerRo', 'partsObsolescence'],
  'Parts & Inventory': ['partsGrossProfit', 'partsInventoryTurnover', 'partsFillRate', 'partsSalesPerRo'],
  'Workshop': ['labourEfficiency', 'technicianUtilization', 'hoursPerRo', 'serviceRetention'],
  'Financial Operations': ['netProfitMargin', 'returnOnAssets', 'variableSelling', 'inventoryTurnover'],
  'Finance': ['netProfitMargin', 'returnOnAssets', 'variableSelling'],
  'Aftersales': ['serviceAbsorption', 'serviceRetention', 'labourEfficiency', 'partsGrossProfit'],
  'Sales': ['leadConversion', 'showroomTrafficConversion', 'newVehicleGross', 'salesCycle'],
  'Marketing': ['leadConversion', 'leadResponseTime'],
  'Customer Service': ['csiNps', 'serviceRetention']
};

export function ActionSheet({ open, onOpenChange, action, mode, onSave, onDelete, readOnly, rationale, cleanDescription }: ActionSheetProps) {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<Partial<Action>>({
    action_title: '',
    action_description: '',
    department: '',
    priority: 'medium',
    status: 'Open',
    responsible_person: null,
    target_completion_date: null,
    support_required_from: [],
    kpis_linked_to: []
  });

  // Get relevant KPIs based on selected department
  const relevantKpis = useMemo(() => {
    const dept = formData.department || '';
    const kpiKeys = DEPARTMENT_KPI_MAP[dept] || [];
    return kpiKeys.map(key => {
      const kpi = KPI_DEFINITIONS[key];
      if (!kpi) return null;
      const localized = kpi[language as 'en' | 'de'] || kpi.en;
      return { key, title: localized.title, benchmark: localized.benchmark };
    }).filter(Boolean) as { key: string; title: string; benchmark?: string }[];
  }, [formData.department, language]);

  // Get linked KPI details for display
  const linkedKpiDetails = useMemo(() => {
    const linked = formData.kpis_linked_to || [];
    return linked.map(key => {
      const kpi = KPI_DEFINITIONS[key];
      if (!kpi) return null;
      const localized = kpi[language as 'en' | 'de'] || kpi.en;
      return { 
        key, 
        title: localized.title, 
        whyItMatters: localized.whyItMatters,
        benchmark: localized.benchmark 
      };
    }).filter(Boolean) as { key: string; title: string; whyItMatters: string; benchmark?: string }[];
  }, [formData.kpis_linked_to, language]);

  useEffect(() => {
    if (action && mode === 'edit') {
      setFormData({
        action_title: action.action_title,
        action_description: cleanDescription || action.action_description,
        department: action.department,
        priority: action.priority,
        status: action.status,
        responsible_person: action.responsible_person,
        target_completion_date: action.target_completion_date,
        support_required_from: action.support_required_from || [],
        kpis_linked_to: action.kpis_linked_to || []
      });
    } else if (mode === 'create') {
      setFormData({
        action_title: '', action_description: '', department: '', priority: 'medium',
        status: 'Open', responsible_person: null, target_completion_date: null,
        support_required_from: [], kpis_linked_to: []
      });
    }
  }, [action, mode, open, cleanDescription]);

  const toggleArrayItem = (field: 'support_required_from' | 'kpis_linked_to', item: string) => {
    const current = formData[field] || [];
    const newArray = current.includes(item) ? current.filter(i => i !== item) : [...current, item];
    setFormData(prev => ({ ...prev, [field]: newArray }));
  };

  const handleSave = () => {
    if (mode === 'edit' && action) {
      onSave({ ...formData, id: action.id });
    } else {
      onSave(formData);
    }
    onOpenChange(false);
  };

  const t = (key: string) => {
    const translations: Record<string, Record<string, string>> = {
      'viewAction': { en: 'View Action', de: 'Aktion anzeigen' },
      'createAction': { en: 'Create New Action', de: 'Neue Aktion erstellen' },
      'editAction': { en: 'Edit Action', de: 'Aktion bearbeiten' },
      'whyMatters': { en: 'Why this matters', de: 'Warum das wichtig ist' },
      'ourRecommendation': { en: 'Our recommendation', de: 'Unsere Empfehlung' },
      'actionTitle': { en: 'Action Title', de: 'Aktionstitel' },
      'titlePlaceholder': { en: 'Short, imperative action title', de: 'Kurzer, handlungsorientierter Titel' },
      'description': { en: 'Description', de: 'Beschreibung' },
      'descPlaceholder': { en: 'Describe what needs to be done and expected outcomes', de: 'Beschreiben Sie die Aufgabe und erwartete Ergebnisse' },
      'department': { en: 'Department', de: 'Abteilung' },
      'selectDept': { en: 'Select department', de: 'Abteilung wählen' },
      'priority': { en: 'Priority', de: 'Priorität' },
      'status': { en: 'Status', de: 'Status' },
      'responsiblePerson': { en: 'Responsible Person', de: 'Verantwortliche Person' },
      'assignOwner': { en: 'Assign owner', de: 'Verantwortlichen zuweisen' },
      'targetDate': { en: 'Target Completion Date', de: 'Zieldatum' },
      'pickDate': { en: 'Pick a date', de: 'Datum wählen' },
      'supportRequired': { en: 'Support Required From', de: 'Benötigte Unterstützung' },
      'linkedKpis': { en: 'Linked KPIs', de: 'Verknüpfte KPIs' },
      'kpiContext': { en: 'KPI Context', de: 'KPI-Kontext' },
      'expectedImpact': { en: 'Expected Impact', de: 'Erwartete Auswirkung' },
      'delete': { en: 'Delete', de: 'Löschen' },
      'cancel': { en: 'Cancel', de: 'Abbrechen' },
      'save': { en: 'Save', de: 'Speichern' },
      'create': { en: 'Create', de: 'Erstellen' },
      'critical': { en: 'Critical', de: 'Kritisch' },
      'high': { en: 'High', de: 'Hoch' },
      'medium': { en: 'Medium', de: 'Mittel' },
      'low': { en: 'Low', de: 'Niedrig' },
      'open': { en: 'Open', de: 'Offen' },
      'inProgress': { en: 'In Progress', de: 'In Bearbeitung' },
      'completed': { en: 'Completed', de: 'Abgeschlossen' },
      'selectKpis': { en: 'Select KPIs this action will improve', de: 'Wählen Sie KPIs, die diese Aktion verbessern wird' },
      'noDeptKpis': { en: 'Select a department to see relevant KPIs', de: 'Wählen Sie eine Abteilung, um relevante KPIs zu sehen' }
    };
    return translations[key]?.[language] || translations[key]?.en || key;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>
            {readOnly ? t('viewAction') : mode === 'create' ? t('createAction') : t('editAction')}
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-140px)] px-6">
          <div className="space-y-4 py-4">
            {/* Human rationale section */}
            {rationale && mode === 'edit' && (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Lightbulb className="h-4 w-4 text-primary" />
                  {t('whyMatters')}
                </div>
                <p className="text-sm text-muted-foreground">{rationale.summary}</p>
                <Separator />
                <div className="text-sm font-medium text-foreground">{t('ourRecommendation')}</div>
                <p className="text-sm text-muted-foreground">{rationale.recommendation}</p>
              </div>
            )}

            {/* Linked KPI Context - Show expected impact */}
            {linkedKpiDetails.length > 0 && mode === 'edit' && (
              <div className="rounded-lg border border-primary/20 bg-primary/5 p-4 space-y-3">
                <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  {t('expectedImpact')}
                </div>
                <div className="space-y-2">
                  {linkedKpiDetails.map(kpi => (
                    <div key={kpi.key} className="flex items-start gap-2 text-xs">
                      <TrendingUp className="h-3 w-3 text-success mt-0.5 shrink-0" />
                      <div>
                        <span className="font-medium text-foreground">{kpi.title}</span>
                        {kpi.benchmark && (
                          <span className="text-muted-foreground ml-1">({kpi.benchmark})</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">{t('actionTitle')}</Label>
              <Input
                id="title" disabled={readOnly}
                value={formData.action_title || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, action_title: e.target.value }))}
                placeholder={t('titlePlaceholder')}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">{t('description')}</Label>
              <Textarea
                id="description" disabled={readOnly}
                value={formData.action_description || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, action_description: e.target.value }))}
                placeholder={t('descPlaceholder')}
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>{t('department')}</Label>
              <Select disabled={readOnly} value={formData.department || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, department: value }))}>
                <SelectTrigger><SelectValue placeholder={t('selectDept')} /></SelectTrigger>
                <SelectContent>
                  {DEPARTMENTS.map(dept => (<SelectItem key={dept} value={dept}>{dept}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{t('priority')}</Label>
                <Select disabled={readOnly} value={formData.priority || 'medium'} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">{t('critical')}</SelectItem>
                    <SelectItem value="high">{t('high')}</SelectItem>
                    <SelectItem value="medium">{t('medium')}</SelectItem>
                    <SelectItem value="low">{t('low')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{t('status')}</Label>
                <Select disabled={readOnly} value={formData.status || 'Open'} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">{t('open')}</SelectItem>
                    <SelectItem value="In Progress">{t('inProgress')}</SelectItem>
                    <SelectItem value="Completed">{t('completed')}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('responsiblePerson')}</Label>
              <Select disabled={readOnly} value={formData.responsible_person || ''} onValueChange={(value) => setFormData(prev => ({ ...prev, responsible_person: value }))}>
                <SelectTrigger><SelectValue placeholder={t('assignOwner')} /></SelectTrigger>
                <SelectContent>
                  {RESPONSIBLE_PERSONS.map(person => (<SelectItem key={person} value={person}>{person}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>{t('targetDate')}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" disabled={readOnly} className={cn("w-full justify-start text-left font-normal", !formData.target_completion_date && "text-muted-foreground")}>
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.target_completion_date ? format(new Date(formData.target_completion_date), "PPP") : t('pickDate')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.target_completion_date ? new Date(formData.target_completion_date) : undefined}
                    onSelect={(date) => setFormData(prev => ({ ...prev, target_completion_date: date ? format(date, "yyyy-MM-dd") : null }))}
                    initialFocus className="pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label>{t('supportRequired')}</Label>
              <div className="grid grid-cols-2 gap-2">
                {SUPPORT_OPTIONS.map(support => (
                  <div key={support} className="flex items-center space-x-2">
                    <Checkbox id={`support-${support}`} disabled={readOnly}
                      checked={formData.support_required_from?.includes(support) || false}
                      onCheckedChange={() => toggleArrayItem('support_required_from', support)} />
                    <label htmlFor={`support-${support}`} className="text-sm cursor-pointer">{support}</label>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label>{t('linkedKpis')}</Label>
              <p className="text-xs text-muted-foreground mb-2">
                {relevantKpis.length > 0 ? t('selectKpis') : t('noDeptKpis')}
              </p>
              <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
                {relevantKpis.map(kpi => (
                  <div key={kpi.key} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`kpi-${kpi.key}`} 
                      disabled={readOnly}
                      checked={formData.kpis_linked_to?.includes(kpi.key) || false}
                      onCheckedChange={() => toggleArrayItem('kpis_linked_to', kpi.key)} 
                    />
                    <label htmlFor={`kpi-${kpi.key}`} className="text-sm cursor-pointer flex-1">
                      {kpi.title}
                      {kpi.benchmark && (
                        <span className="text-xs text-muted-foreground ml-1">({kpi.benchmark})</span>
                      )}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollArea>

        {!readOnly && (
          <DialogFooter className="flex gap-2 px-6 pb-6 pt-4 border-t">
            {mode === 'edit' && onDelete && action && (
              <Button variant="destructive" onClick={() => { onDelete(action.id); onOpenChange(false); }} className="mr-auto">
                <Trash2 className="h-4 w-4 mr-2" /> {t('delete')}
              </Button>
            )}
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              <X className="h-4 w-4 mr-2" /> {t('cancel')}
            </Button>
            <Button onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" /> {mode === 'create' ? t('create') : t('save')}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
