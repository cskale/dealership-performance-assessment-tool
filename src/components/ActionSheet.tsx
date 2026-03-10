import { useState, useEffect, useMemo, useCallback } from "react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CalendarIcon, Save, X, Trash2, Lightbulb, Target, TrendingUp,
  ChevronDown, ChevronUp, Clock, AlertTriangle, Zap, BookOpen
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { KPI_DEFINITIONS } from "@/lib/kpiDefinitions";
import { useLanguage } from "@/contexts/LanguageContext";
import type { ActionRecord } from "./ActionPlan";

interface ActionSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: ActionRecord | null;
  mode: 'create' | 'edit';
  onSave: (action: Partial<ActionRecord>) => void;
  onDelete?: (actionId: string) => void;
  readOnly?: boolean;
}

const RESPONSIBLE_PERSONS = [
  "Dealer Principal", "Aftersales Manager", "Parts Supervisor", "Sales Consultant",
  "Sales Manager", "Service Manager", "Finance Manager", "Marketing Manager"
];

const SUPPORT_OPTIONS = ["Coach", "IT Team", "Parts Vendor", "OEM", "Management", "Training Provider", "Consultant"];

const DEPARTMENTS = ["Parts", "Workshop", "Sales", "Aftersales", "Finance", "Marketing", "Customer Service",
  "New Vehicle Sales", "Used Vehicle Sales", "Service", "Parts & Inventory", "Financial Operations"];

const IMPACT_LABELS = ['Marginal', 'Low', 'Moderate', 'High', 'Critical'];
const EFFORT_LABELS = ['<1 day', '<1 week', '1–2 weeks', '2–4 weeks', 'Major'];
const URGENCY_LABELS = ['Monitor', 'Low', 'This quarter', 'High', 'Immediate'];

function computeTriageScore(impact: number | null, effort: number | null, urgency: number | null): number | null {
  if (impact == null || effort == null || urgency == null) return null;
  return (impact * 2) + (urgency * 2) - effort;
}

function getQuadrantLabel(impact: number, effort: number): string {
  if (impact >= 3 && effort <= 2) return 'Quick Win';
  if (impact >= 3 && effort >= 3) return 'Major Project';
  if (impact < 3 && effort <= 2) return 'Fill-in';
  return 'Time Sink';
}

function getQuadrantColor(label: string): string {
  switch (label) {
    case 'Quick Win': return 'text-success';
    case 'Major Project': return 'text-info';
    case 'Fill-in': return 'text-muted-foreground';
    case 'Time Sink': return 'text-destructive';
    default: return 'text-muted-foreground';
  }
}

export function ActionSheet({ open, onOpenChange, action, mode, onSave, onDelete, readOnly }: ActionSheetProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [contextExpanded, setContextExpanded] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showKpiAll, setShowKpiAll] = useState(false);

  const [formData, setFormData] = useState<Partial<ActionRecord>>({
    action_title: '', action_description: '', department: '', priority: 'medium',
    status: 'Open', responsible_person: null, target_completion_date: null,
    support_required_from: [], kpis_linked_to: [],
    impact_score: null, effort_score: null, urgency_score: null,
  });

  useEffect(() => {
    setIsDirty(false);
    setActiveTab('details');
    if (action && mode === 'edit') {
      setFormData({
        action_title: action.action_title,
        action_description: action.action_description,
        department: action.department,
        priority: action.priority,
        status: action.status,
        responsible_person: action.responsible_person,
        target_completion_date: action.target_completion_date,
        support_required_from: action.support_required_from || [],
        kpis_linked_to: action.kpis_linked_to || [],
        impact_score: action.impact_score ?? null,
        effort_score: action.effort_score ?? null,
        urgency_score: action.urgency_score ?? null,
      });
    } else if (mode === 'create') {
      setFormData({
        action_title: '', action_description: '', department: '', priority: 'medium',
        status: 'Open', responsible_person: null, target_completion_date: null,
        support_required_from: [], kpis_linked_to: [],
        impact_score: null, effort_score: null, urgency_score: null,
      });
    }
  }, [action, mode, open]);

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const toggleArrayItem = (field: 'support_required_from' | 'kpis_linked_to', item: string) => {
    const current = formData[field] || [];
    const newArray = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    updateField(field, newArray);
  };

  const handleSave = () => {
    if (mode === 'edit' && action) {
      onSave({ ...formData, id: action.id });
    } else {
      onSave(formData);
    }
  };

  const handleClose = () => {
    if (isDirty && !readOnly) {
      if (confirm('You have unsaved changes. Discard?')) onOpenChange(false);
    } else {
      onOpenChange(false);
    }
  };

  // KPI intelligence from linked_kpis jsonb
  const linkedKpisData = useMemo(() => {
    const data = action?.linked_kpis;
    if (!data) return [];
    if (Array.isArray(data)) return data;
    return [];
  }, [action?.linked_kpis]);

  const likelyDrivers = useMemo(() => {
    const d = action?.likely_drivers;
    if (!d) return [];
    if (Array.isArray(d)) return d;
    return [];
  }, [action?.likely_drivers]);

  const likelyConsequences = useMemo(() => {
    const c = action?.likely_consequences;
    if (!c) return [];
    if (Array.isArray(c)) return c;
    return [];
  }, [action?.likely_consequences]);

  // Fallback to kpis_linked_to (text[]) for KPI display
  const linkedKpiDetails = useMemo(() => {
    // Prefer linked_kpis jsonb, fallback to kpis_linked_to text[]
    if (linkedKpisData.length > 0) return linkedKpisData;
    const keys = formData.kpis_linked_to || [];
    return keys.map((key: string) => {
      const kpi = KPI_DEFINITIONS[key];
      if (!kpi) return { name: key, type: 'KPI', reason: '' };
      const loc = kpi[language as 'en' | 'de'] || kpi.en;
      return { name: loc.title, type: 'Performance', reason: loc.whyItMatters || '' };
    });
  }, [linkedKpisData, formData.kpis_linked_to, language]);

  const visibleKpis = showKpiAll ? linkedKpiDetails : linkedKpiDetails.slice(0, 5);

  // Triage computation
  const triageScore = computeTriageScore(
    formData.impact_score ?? null,
    formData.effort_score ?? null,
    formData.urgency_score ?? null
  );

  const triageBadgeLabel = triageScore != null
    ? (triageScore >= 14 ? 'Act Now' : triageScore >= 10 ? 'Priority' : triageScore >= 6 ? 'Plan' : 'Backlog')
    : null;

  const quadrantLabel = (formData.impact_score && formData.effort_score)
    ? getQuadrantLabel(formData.impact_score, formData.effort_score)
    : null;

  return (
    <Sheet open={open} onOpenChange={handleClose}>
      <SheetContent side="right" className="w-full sm:max-w-xl md:max-w-2xl p-0 flex flex-col">
        {/* Header */}
        <SheetHeader className="px-6 pt-6 pb-3 border-b">
          <SheetTitle className="text-base">
            {readOnly ? 'View Action' : mode === 'create' ? 'Create Action' : 'Edit Action'}
          </SheetTitle>
          {/* Tabs */}
          <div className="flex gap-4 mt-2">
            <button
              onClick={() => setActiveTab('details')}
              className={cn("text-sm pb-1 border-b-2 transition-colors",
                activeTab === 'details' ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
              )}>Details</button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn("text-sm pb-1 border-b-2 transition-colors",
                activeTab === 'history' ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground"
              )}>History</button>
          </div>
        </SheetHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          {activeTab === 'details' ? (
            <div className="px-6 py-4 space-y-6">
              {/* ZONE A — Context Intelligence */}
              {mode === 'edit' && (
                <Collapsible open={contextExpanded} onOpenChange={setContextExpanded}>
                  <CollapsibleTrigger className="flex items-center justify-between w-full text-sm font-medium text-foreground">
                    <span className="flex items-center gap-2"><Lightbulb className="h-4 w-4 text-primary" /> Context Intelligence</span>
                    {contextExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </CollapsibleTrigger>
                  <CollapsibleContent className="mt-3 space-y-3">
                    {/* Why This Action Matters */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Why This Action Matters</h4>
                      {action?.action_context ? (
                        <p className="text-sm text-foreground leading-relaxed">{action.action_context}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No context added. Regenerate this action with AI to populate full business rationale.</p>
                      )}
                    </div>

                    {/* Business Impact */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Business Impact</h4>
                      {action?.business_impact ? (
                        <p className="text-sm text-foreground leading-relaxed">{action.business_impact}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No business impact data available.</p>
                      )}
                    </div>

                    {/* Recommendation */}
                    <div className="rounded-lg border bg-primary/5 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Our Recommendation</h4>
                      {action?.recommendation ? (
                        <p className="text-sm text-foreground leading-relaxed">{action.recommendation}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No recommendation available.</p>
                      )}
                    </div>

                    {/* Expected Benefit */}
                    <div className="rounded-lg border bg-muted/30 p-4">
                      <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Expected Benefit</h4>
                      {action?.expected_benefit ? (
                        <p className="text-sm text-foreground leading-relaxed">{action.expected_benefit}</p>
                      ) : (
                        <p className="text-sm text-muted-foreground italic">No expected benefit data available.</p>
                      )}
                    </div>
                  </CollapsibleContent>
                </Collapsible>
              )}

              <Separator />

              {/* ZONE B — Edit Fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="title" className="text-xs font-medium">Action Title</Label>
                  <Input id="title" disabled={readOnly} value={formData.action_title || ''}
                    onChange={(e) => updateField('action_title', e.target.value)} placeholder="Short, imperative action title" />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="description" className="text-xs font-medium">Description</Label>
                  <Textarea id="description" disabled={readOnly} value={formData.action_description || ''}
                    onChange={(e) => updateField('action_description', e.target.value)}
                    placeholder="Describe what needs to be done" rows={3} />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Department</Label>
                  <Select disabled={readOnly} value={formData.department || ''} onValueChange={(v) => updateField('department', v)}>
                    <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                    <SelectContent>
                      {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                {/* Triage Sliders */}
                <div className="space-y-4 rounded-lg border p-4">
                  <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Triage Assessment</h4>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Impact</span>
                      <span className="text-muted-foreground">{formData.impact_score ? IMPACT_LABELS[formData.impact_score - 1] : 'Not set'}</span>
                    </div>
                    <Slider disabled={readOnly} min={1} max={5} step={1}
                      value={[formData.impact_score || 3]}
                      onValueChange={([v]) => updateField('impact_score', v)} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Effort</span>
                      <span className="text-muted-foreground">{formData.effort_score ? EFFORT_LABELS[formData.effort_score - 1] : 'Not set'}</span>
                    </div>
                    <Slider disabled={readOnly} min={1} max={5} step={1}
                      value={[formData.effort_score || 3]}
                      onValueChange={([v]) => updateField('effort_score', v)} />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="font-medium">Urgency</span>
                      <span className="text-muted-foreground">{formData.urgency_score ? URGENCY_LABELS[formData.urgency_score - 1] : 'Not set'}</span>
                    </div>
                    <Slider disabled={readOnly} min={1} max={5} step={1}
                      value={[formData.urgency_score || 3]}
                      onValueChange={([v]) => updateField('urgency_score', v)} />
                  </div>

                  {/* Triage result */}
                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2">
                      {triageBadgeLabel && (
                        <Badge variant="outline" className="text-xs">{triageBadgeLabel}</Badge>
                      )}
                      {triageScore != null && (
                        <span className="text-xs text-muted-foreground">Score: {triageScore}</span>
                      )}
                    </div>
                    {quadrantLabel && (
                      <span className={cn("text-xs font-medium", getQuadrantColor(quadrantLabel))}>{quadrantLabel}</span>
                    )}
                  </div>

                  {/* Mini Quadrant */}
                  {formData.impact_score != null && formData.effort_score != null && (
                    <div className="relative w-full aspect-square max-w-[160px] mx-auto border rounded bg-muted/20">
                      {/* Quadrant labels */}
                      <span className="absolute top-1 left-1 text-[9px] text-success/70">Quick Win</span>
                      <span className="absolute top-1 right-1 text-[9px] text-info/70 text-right">Major Project</span>
                      <span className="absolute bottom-1 left-1 text-[9px] text-muted-foreground/70">Fill-in</span>
                      <span className="absolute bottom-1 right-1 text-[9px] text-destructive/70 text-right">Time Sink</span>
                      {/* Axes */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                      <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                      {/* Dot */}
                      <div
                        className="absolute w-3 h-3 rounded-full bg-primary shadow-md transition-all duration-300"
                        style={{
                          left: `${((formData.effort_score - 1) / 4) * 100}%`,
                          bottom: `${((formData.impact_score - 1) / 4) * 100}%`,
                          transform: 'translate(-50%, 50%)',
                        }}
                      />
                    </div>
                  )}
                </div>

                {/* Priority as segmented */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Priority</Label>
                  <div className="flex rounded-lg border overflow-hidden">
                    {(['critical', 'high', 'medium', 'low'] as const).map(p => (
                      <button key={p} disabled={readOnly}
                        onClick={() => updateField('priority', p)}
                        className={cn("flex-1 py-1.5 text-xs font-medium transition-colors",
                          formData.priority === p ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                        )}>
                        {p.charAt(0).toUpperCase() + p.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Status as segmented */}
                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Status</Label>
                  <div className="flex rounded-lg border overflow-hidden">
                    {(['Open', 'In Progress', 'Completed'] as const).map(s => (
                      <button key={s} disabled={readOnly}
                        onClick={() => updateField('status', s)}
                        className={cn("flex-1 py-1.5 text-xs font-medium transition-colors",
                          formData.status === s ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Responsible Person</Label>
                  <Select disabled={readOnly} value={formData.responsible_person || ''} onValueChange={(v) => updateField('responsible_person', v)}>
                    <SelectTrigger><SelectValue placeholder="Assign owner" /></SelectTrigger>
                    <SelectContent>
                      {RESPONSIBLE_PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Support Required From</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_OPTIONS.map(s => (
                      <button key={s} disabled={readOnly}
                        onClick={() => toggleArrayItem('support_required_from', s)}
                        className={cn("px-2.5 py-1 rounded-full text-xs border transition-colors",
                          (formData.support_required_from || []).includes(s)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border text-muted-foreground hover:bg-muted"
                        )}>
                        {s}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-medium">Target Completion Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" disabled={readOnly}
                        className={cn("w-full justify-start text-left font-normal", !formData.target_completion_date && "text-muted-foreground")}>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {formData.target_completion_date ? format(new Date(formData.target_completion_date), "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar mode="single"
                        selected={formData.target_completion_date ? new Date(formData.target_completion_date) : undefined}
                        onSelect={(date) => updateField('target_completion_date', date ? format(date, "yyyy-MM-dd") : null)}
                        initialFocus className="pointer-events-auto" />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>

              <Separator />

              {/* ZONE C — KPI Intelligence */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Target className="h-4 w-4 text-primary" /> KPIs This Action Will Improve
                </h4>

                {linkedKpiDetails.length > 0 ? (
                  <div className="space-y-2">
                    {visibleKpis.map((kpi: any, i: number) => (
                      <div key={i} className="rounded-lg border p-3">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-foreground">{kpi.name || kpi.title || kpi.key}</span>
                          {kpi.type && (
                            <Badge variant="outline" className="text-[10px]">{kpi.type}</Badge>
                          )}
                        </div>
                        {kpi.reason && (
                          <p className="text-xs text-muted-foreground">{kpi.reason}</p>
                        )}
                      </div>
                    ))}
                    {linkedKpiDetails.length > 5 && !showKpiAll && (
                      <Button variant="ghost" size="sm" onClick={() => setShowKpiAll(true)} className="text-xs">
                        Show {linkedKpiDetails.length - 5} more KPIs
                      </Button>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No KPIs linked to this action.</p>
                )}

                {/* Likely Drivers */}
                {likelyDrivers.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Likely Drivers</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {likelyDrivers.map((d: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs">{typeof d === 'string' ? d : d.name || d.label}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Likely Consequences */}
                {likelyConsequences.length > 0 && (
                  <div className="space-y-1.5">
                    <h5 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Likely Consequences</h5>
                    <div className="flex flex-wrap gap-1.5">
                      {likelyConsequences.map((c: any, i: number) => (
                        <Badge key={i} variant="outline" className="text-xs text-destructive border-destructive/20">
                          {typeof c === 'string' ? c : c.name || c.label}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* History Tab Placeholder */
            <div className="px-6 py-16 text-center">
              <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">Action history will appear here after changes are saved.</p>
            </div>
          )}
        </ScrollArea>

        {/* Sticky Footer */}
        {!readOnly && (
          <SheetFooter className="flex gap-2 px-6 py-4 border-t bg-card">
            {mode === 'edit' && onDelete && action && (
              <Button variant="destructive" size="sm" onClick={() => { onDelete(action.id); onOpenChange(false); }} className="mr-auto">
                <Trash2 className="h-4 w-4 mr-1" /> Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleClose}>
              <X className="h-4 w-4 mr-1" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              <Save className="h-4 w-4 mr-1" /> {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </SheetFooter>
        )}
      </SheetContent>
    </Sheet>
  );
}
