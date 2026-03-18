import { useState, useEffect, useMemo, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  CalendarIcon, Save, X, Trash2, Lightbulb, Target,
  ChevronDown, ChevronUp, Clock, Loader2, BarChart3
} from "lucide-react";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import { KPI_DEFINITIONS } from "@/lib/kpiDefinitions";
import { cleanDescription } from "@/lib/cleanDescription";
import { sanitizeFormData } from "@/lib/sanitize";
import { actionSchema } from "@/lib/validationSchemas";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
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
  "Sales Manager", "Service Manager", "Finance Manager", "Marketing Manager",
  "General Manager", "Operations Manager", "BDC Manager", "F&I Director",
  "Used Vehicle Manager", "IT Manager", "HR Manager", "Customer Experience Manager"
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

interface AuditEntry {
  id: string;
  field_name: string;
  old_value: string | null;
  new_value: string;
  changed_at: string;
  changed_by: string;
}

export function ActionSheet({ open, onOpenChange, action, mode, onSave, onDelete, readOnly }: ActionSheetProps) {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<'details' | 'history'>('details');
  const [contextExpanded, setContextExpanded] = useState(true);
  const [isDirty, setIsDirty] = useState(false);
  const [showKpiAll, setShowKpiAll] = useState(false);
  const [saving, setSaving] = useState(false);

  // History state
  const [historyEntries, setHistoryEntries] = useState<AuditEntry[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);

  const [formData, setFormData] = useState<Partial<ActionRecord>>({
    action_title: '', action_description: '', department: '', priority: 'medium',
    status: 'Open', responsible_person: null, target_completion_date: null,
    support_required_from: [], kpis_linked_to: [],
    impact_score: null, effort_score: null, urgency_score: null,
  });

  useEffect(() => {
    setIsDirty(false);
    setActiveTab('details');
    setHistoryLoaded(false);
    setHistoryEntries([]);
    setShowKpiAll(false);
    if (action && mode === 'edit') {
      setFormData({
        action_title: action.action_title,
        action_description: cleanDescription(action.action_description),
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

  // Load history when tab is clicked
  useEffect(() => {
    if (activeTab === 'history' && !historyLoaded && action?.id) {
      loadHistory(action.id);
    }
  }, [activeTab, historyLoaded, action?.id]);

  const loadHistory = async (actionId: string) => {
    setHistoryLoading(true);
    setHistoryError(false);
    try {
      const { data, error } = await supabase
        .from('action_audit_log')
        .select('*')
        .eq('action_id', actionId)
        .order('changed_at', { ascending: false })
        .limit(50);
      if (error) throw error;
      setHistoryEntries((data || []) as unknown as AuditEntry[]);
      setHistoryLoaded(true);
    } catch {
      setHistoryError(true);
    } finally {
      setHistoryLoading(false);
    }
  };

  const updateField = useCallback((field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setIsDirty(true);
  }, []);

  const toggleSupport = (item: string) => {
    const current = formData.support_required_from || [];
    const newArray = current.includes(item) ? current.filter((i: string) => i !== item) : [...current, item];
    updateField('support_required_from', newArray);
  };

  const handleSave = async () => {
    // Validate with Zod schema
    const result = actionSchema.safeParse(formData);
    if (!result.success) {
      const firstError = result.error.errors[0];
      toast.error(firstError?.message || 'Validation failed');
      return;
    }
    setSaving(true);
    try {
      const sanitizedData = sanitizeFormData(formData as Record<string, unknown>) as Partial<ActionRecord>;
      if (mode === 'edit' && action) {
        await onSave({ ...sanitizedData, id: action.id });
      } else {
        await onSave(sanitizedData);
      }
    } finally {
      setSaving(false);
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
    if (linkedKpisData.length > 0) return linkedKpisData;
    const keys = formData.kpis_linked_to || [];
    return keys.map((key: string) => {
      const kpi = KPI_DEFINITIONS[key];
      if (!kpi) return { name: key, type: 'KPI', reason: '' };
      const loc = kpi[language as 'en' | 'de'] || kpi.en;
      return { name: loc.title, type: 'CORE KPI', reason: loc.whyItMatters || '' };
    });
  }, [linkedKpisData, formData.kpis_linked_to, language]);

  const visibleKpis = showKpiAll ? linkedKpiDetails : linkedKpiDetails.slice(0, 5);

  // Triage computation
  const triageScore = computeTriageScore(
    formData.impact_score ?? null,
    formData.effort_score ?? null,
    formData.urgency_score ?? null
  );

  const allScoresSet = formData.impact_score != null && formData.effort_score != null && formData.urgency_score != null;

  const triageBadgeLabel = triageScore != null
    ? (triageScore >= 14 ? 'Act Now' : triageScore >= 10 ? 'Priority' : triageScore >= 6 ? 'Plan' : 'Backlog')
    : null;

  const triageBadgeColor = triageScore != null
    ? (triageScore >= 14 ? 'bg-destructive/10 text-destructive' : triageScore >= 10 ? 'bg-amber-500/10 text-amber-600' : triageScore >= 6 ? 'bg-blue-500/10 text-blue-600' : 'bg-muted text-muted-foreground')
    : '';

  const quadrantLabel = allScoresSet
    ? getQuadrantLabel(formData.impact_score!, formData.effort_score!)
    : null;

  const quadrantColor = quadrantLabel === 'Quick Win' ? 'text-green-600'
    : quadrantLabel === 'Major Project' ? 'text-amber-600'
    : quadrantLabel === 'Time Sink' ? 'text-destructive'
    : 'text-muted-foreground';

  function getKpiBadgeStyle(type: string) {
    const t = (type || '').toUpperCase();
    if (t.includes('INPUT')) return 'text-blue-700 border-blue-200 bg-transparent';
    if (t.includes('CORE')) return 'bg-indigo-600 text-white border-indigo-600';
    if (t.includes('OUTCOME')) return 'text-green-700 border-green-200 bg-transparent';
    return 'text-muted-foreground border-border bg-transparent';
  }

  function formatHistoryDescription(entry: AuditEntry): string {
    const { field_name, old_value, new_value } = entry;
    if (field_name === 'created') return new_value;
    if (field_name === 'status') return `changed Status: ${old_value || '—'} → ${new_value}`;
    if (field_name === 'priority') return `changed Priority: ${old_value || '—'} → ${new_value}`;
    if (field_name === 'responsible_person') return `reassigned to ${new_value}`;
    if (field_name === 'target_completion_date') return `updated Due Date to ${new_value}`;
    if (field_name === 'impact_score') {
      const idx = parseInt(new_value) - 1;
      return `set Impact to ${IMPACT_LABELS[idx] || new_value}`;
    }
    if (field_name === 'effort_score') {
      const idx = parseInt(new_value) - 1;
      return `set Effort to ${EFFORT_LABELS[idx] || new_value}`;
    }
    if (field_name === 'urgency_score') {
      const idx = parseInt(new_value) - 1;
      return `set Urgency to ${URGENCY_LABELS[idx] || new_value}`;
    }
    return `updated ${field_name.replace(/_/g, ' ')}`;
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1200px] w-[80vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-3 border-b flex-shrink-0">
          <DialogTitle className="text-xl font-semibold">
            {readOnly ? 'View Action' : mode === 'create' ? 'Create Action' : 'Edit Action'}
          </DialogTitle>
          {mode === 'edit' && action && (
            <div className="flex items-center gap-2 mt-1">
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">
                {action.department}
              </span>
              <Badge className={cn("text-xs",
                action.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                action.priority === 'high' ? 'bg-orange-500/10 text-orange-600 border-orange-200' :
                action.priority === 'medium' ? 'bg-yellow-500/10 text-yellow-600 border-yellow-200' :
                'bg-blue-500/10 text-blue-600 border-blue-200'
              )}>
                {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
              </Badge>
            </div>
          )}
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
        </DialogHeader>

        {/* Body */}
        <ScrollArea className="flex-1">
          {activeTab === 'details' ? (
            <div className="px-6 py-4">
              <div className={cn("gap-6", mode === 'edit' ? "grid grid-cols-1 lg:grid-cols-2" : "space-y-6")}>
                {/* LEFT COLUMN — Form Fields */}
                <div className="space-y-6">
                  <div className="space-y-5">
                    {/* Group 1 — Basic */}
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
                          placeholder="Describe what needs to be done" rows={4} />
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
                    </div>

                    {/* Group 2 — Triage Assessment */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Triage Assessment</p>
                      <div className="bg-muted/30 rounded-lg border p-4 space-y-4">
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Impact</span>
                            <span className="text-muted-foreground">
                              {formData.impact_score != null ? IMPACT_LABELS[formData.impact_score - 1] : 'Not set'}
                            </span>
                          </div>
                          <Slider disabled={readOnly} min={1} max={5} step={1}
                            value={formData.impact_score != null ? [formData.impact_score] : []}
                            onValueChange={([v]) => updateField('impact_score', v)} />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Effort</span>
                            <span className="text-muted-foreground">
                              {formData.effort_score != null ? EFFORT_LABELS[formData.effort_score - 1] : 'Not set'}
                            </span>
                          </div>
                          <Slider disabled={readOnly} min={1} max={5} step={1}
                            value={formData.effort_score != null ? [formData.effort_score] : []}
                            onValueChange={([v]) => updateField('effort_score', v)} />
                        </div>

                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium">Urgency</span>
                            <span className="text-muted-foreground">
                              {formData.urgency_score != null ? URGENCY_LABELS[formData.urgency_score - 1] : 'Not set'}
                            </span>
                          </div>
                          <Slider disabled={readOnly} min={1} max={5} step={1}
                            value={formData.urgency_score != null ? [formData.urgency_score] : []}
                            onValueChange={([v]) => updateField('urgency_score', v)} />
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t">
                          <div className="flex items-center gap-2">
                            {triageBadgeLabel && (
                              <Badge variant="outline" className={cn("text-xs", triageBadgeColor)}>{triageBadgeLabel}</Badge>
                            )}
                            {triageScore != null && (
                              <span className="text-xs text-muted-foreground">Score: {triageScore}</span>
                            )}
                          </div>
                          {quadrantLabel && (
                            <span className={cn("text-xs font-medium", quadrantColor)}>{quadrantLabel}</span>
                          )}
                        </div>

                        {allScoresSet ? (
                          <div className="relative w-[200px] h-[200px] mx-auto">
                            <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-green-50 dark:bg-green-950/20 rounded-tl-lg" />
                            <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-amber-50 dark:bg-amber-950/20 rounded-tr-lg" />
                            <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-slate-50 dark:bg-slate-950/20 rounded-bl-lg" />
                            <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-red-50 dark:bg-red-950/20 rounded-br-lg" />
                            <span className="absolute top-1 left-1 text-[9px] text-green-600">Quick Win</span>
                            <span className="absolute top-1 right-1 text-[9px] text-amber-600 text-right">Major Project</span>
                            <span className="absolute bottom-1 left-1 text-[9px] text-muted-foreground">Fill-in</span>
                            <span className="absolute bottom-1 right-1 text-[9px] text-destructive text-right">Time Sink</span>
                            <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                            <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                            <div
                              className="absolute w-3.5 h-3.5 rounded-full bg-primary shadow-lg transition-all duration-300 ring-2 ring-primary/30"
                              style={{
                                left: `${((formData.effort_score! - 1) / 4) * 100}%`,
                                bottom: `${((formData.impact_score! - 1) / 4) * 100}%`,
                                transform: 'translate(-50%, 50%)',
                              }}
                            />
                          </div>
                        ) : (
                          <p className="text-xs text-muted-foreground italic text-center py-4">
                            Set all three triage scores to see quadrant.
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Group 3 — Ownership & Timeline */}
                    <div className="space-y-4">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Ownership & Timeline</p>

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
                              initialFocus className="p-3 pointer-events-auto" />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>

                    {/* Group 4 — Support Required */}
                    <div className="space-y-3">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-semibold">Support Required</p>
                      <div className="flex flex-wrap gap-2">
                        {SUPPORT_OPTIONS.map(s => (
                          <button key={s} disabled={readOnly}
                            onClick={() => toggleSupport(s)}
                            className={cn("px-3 py-1 rounded-full text-xs border transition-colors",
                              (formData.support_required_from || []).includes(s)
                                ? "bg-primary text-primary-foreground border-primary"
                                : "border-border text-muted-foreground hover:bg-muted"
                            )}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN — Context Intelligence & KPI (edit mode) / inline (create mode) */}
                <div className="space-y-6">
                  {/* Context Intelligence */}
                  {mode === 'edit' && (
                    <Collapsible open={contextExpanded} onOpenChange={setContextExpanded}>
                      <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-xl p-5">
                        <CollapsibleTrigger className="flex items-center justify-between w-full">
                          <span className="flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-400">
                            <Lightbulb className="h-4 w-4" /> Context Intelligence
                          </span>
                          {contextExpanded ? <ChevronUp className="h-4 w-4 text-blue-600" /> : <ChevronDown className="h-4 w-4 text-blue-600" />}
                        </CollapsibleTrigger>
                        <CollapsibleContent className="mt-4 space-y-4">
                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                              Why This Action Matters
                            </p>
                            {action?.action_context ? (
                              <p className="text-sm text-foreground leading-relaxed">{action.action_context}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No rationale available. Regenerate this action to populate full business context.</p>
                            )}
                          </div>

                          <Separator className="bg-blue-200 dark:bg-blue-800" />

                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-2 font-semibold">
                              Business Impact
                            </p>
                            {action?.business_impact ? (
                              <p className="text-sm text-foreground leading-relaxed">{action.business_impact}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No business impact data available.</p>
                            )}
                          </div>

                          <Separator className="bg-blue-200 dark:bg-blue-800" />

                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-amber-700 dark:text-amber-400 mb-2 font-semibold">
                              Our Recommendation
                            </p>
                            <div className="bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                              {action?.recommendation ? (
                                <p className="text-sm text-foreground leading-relaxed">{action.recommendation}</p>
                              ) : (
                                <p className="text-sm text-muted-foreground italic">No recommendation available.</p>
                              )}
                            </div>
                          </div>

                          <Separator className="bg-blue-200 dark:bg-blue-800" />

                          <div>
                            <p className="text-[10px] uppercase tracking-widest text-green-700 dark:text-green-400 mb-2 font-semibold">
                              Expected Benefit
                            </p>
                            {action?.expected_benefit ? (
                              <p className="text-sm text-foreground leading-relaxed">{action.expected_benefit}</p>
                            ) : (
                              <p className="text-sm text-muted-foreground italic">No expected benefit data available.</p>
                            )}
                          </div>
                        </CollapsibleContent>
                      </div>
                    </Collapsible>
                  )}

                  <Separator />

                  {/* KPI Intelligence */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-foreground flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-primary" /> KPIs This Action Will Improve
                    </h4>

                    {linkedKpiDetails.length > 0 ? (
                      <div className="space-y-2">
                        {visibleKpis.map((kpi: any, i: number) => (
                          <div key={i} className="rounded-lg border p-3">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                📊 {kpi.name || kpi.title || kpi.key}
                              </span>
                              {kpi.type && (
                                <Badge variant="outline" className={cn("text-[10px]", getKpiBadgeStyle(kpi.type))}>
                                  {kpi.type}
                                </Badge>
                              )}
                            </div>
                            {kpi.reason && (
                              <p className="text-sm text-muted-foreground">{kpi.reason}</p>
                            )}
                          </div>
                        ))}
                        {linkedKpiDetails.length > 5 && !showKpiAll && (
                          <Button variant="ghost" size="sm" onClick={() => setShowKpiAll(true)} className="text-xs">
                            + {linkedKpiDetails.length - 5} more
                          </Button>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">No KPI linkage configured.</p>
                    )}

                    {likelyDrivers.length > 0 && (
                      <div className="mt-4">
                        <h5 className="text-sm font-semibold mb-2">Likely Drivers</h5>
                        <div className="flex flex-wrap gap-2">
                          {likelyDrivers.map((d: any, i: number) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs">
                              <span>{typeof d === 'string' ? d : d.name || d.label}</span>
                              {typeof d === 'object' && d.type && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0">{d.type}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {likelyConsequences.length > 0 && (
                      <div className="mt-3">
                        <h5 className="text-sm font-semibold mb-2">Likely Consequences</h5>
                        <div className="flex flex-wrap gap-2">
                          {likelyConsequences.map((c: any, i: number) => (
                            <div key={i} className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full border text-xs">
                              <span>{typeof c === 'string' ? c : c.name || c.label}</span>
                              {typeof c === 'object' && c.type && (
                                <Badge variant="outline" className="text-[9px] px-1 py-0 text-destructive border-destructive/20">{c.type}</Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* History Tab */
            <div className="px-6 py-4">
              {historyLoading ? (
                <div className="flex items-center justify-center py-16">
                  <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              ) : historyError ? (
                <p className="text-sm text-destructive text-center py-16">Could not load history.</p>
              ) : historyEntries.length === 0 ? (
                <div className="text-center py-16">
                  <Clock className="h-8 w-8 mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No history yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyEntries.map(entry => (
                    <div key={entry.id} className="flex items-start gap-3">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                        {entry.changed_by?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-muted-foreground">
                          {formatHistoryDescription(entry)}
                        </p>
                      </div>
                      <span className="text-xs text-muted-foreground flex-shrink-0">
                        {formatDistanceToNow(new Date(entry.changed_at), { addSuffix: true })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </ScrollArea>

        {/* Sticky Footer */}
        {!readOnly && (
          <div className="flex gap-2 px-6 py-4 border-t bg-card flex-shrink-0">
            {mode === 'edit' && onDelete && action && (
              <Button variant="destructive" size="sm" onClick={() => { onDelete(action.id); onOpenChange(false); }} className="mr-auto">
                🗑 Delete
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleClose}>
              × Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : '💾'}{' '}
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
