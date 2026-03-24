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
import {
  CalendarIcon, Save, X, Trash2, Lightbulb, Target,
  Clock, Loader2, BarChart3, AlertTriangle, TrendingUp, 
  User, ArrowRight
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
  if (impact >= 3 && effort >= 3) return 'Strategic Initiative';
  if (impact < 3 && effort <= 2) return 'Maintenance';
  return 'Low Priority';
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

  // KPI intelligence
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

  const visibleKpis = showKpiAll ? linkedKpiDetails : linkedKpiDetails.slice(0, 4);

  // Triage
  const triageScore = computeTriageScore(formData.impact_score ?? null, formData.effort_score ?? null, formData.urgency_score ?? null);
  const allScoresSet = formData.impact_score != null && formData.effort_score != null && formData.urgency_score != null;

  const triageBadgeLabel = triageScore != null
    ? (triageScore >= 14 ? 'Act Now' : triageScore >= 10 ? 'Priority' : triageScore >= 6 ? 'Plan' : 'Backlog')
    : null;

  const triageBadgeColor = triageScore != null
    ? (triageScore >= 14 ? 'bg-destructive/10 text-destructive' : triageScore >= 10 ? 'bg-[hsl(var(--dd-amber-light))] text-[hsl(var(--dd-amber))]' : triageScore >= 6 ? 'bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))]' : 'bg-muted text-muted-foreground')
    : '';

  const quadrantLabel = allScoresSet ? getQuadrantLabel(formData.impact_score!, formData.effort_score!) : null;
  const quadrantColor = quadrantLabel === 'Quick Win' ? 'text-[hsl(var(--dd-green))]'
    : quadrantLabel === 'Strategic Initiative' ? 'text-[hsl(var(--dd-amber))]'
    : quadrantLabel === 'Low Priority' ? 'text-destructive'
    : 'text-muted-foreground';

  function getKpiBadgeStyle(type: string) {
    const t = (type || '').toUpperCase();
    if (t.includes('INPUT')) return 'text-[hsl(var(--dd-accent))] border-[hsl(var(--dd-accent))]/20 bg-transparent';
    if (t.includes('CORE')) return 'bg-[hsl(var(--dd-accent))] text-white border-[hsl(var(--dd-accent))]';
    if (t.includes('OUTCOME')) return 'text-[hsl(var(--dd-green))] border-[hsl(var(--dd-green))]/20 bg-transparent';
    if (t.includes('OPERATIONAL')) return 'text-[hsl(var(--dd-amber))] border-[hsl(var(--dd-amber))]/20 bg-transparent';
    if (t.includes('PROCESS')) return 'text-[hsl(var(--dd-teal))] border-[hsl(var(--dd-teal))]/20 bg-transparent';
    if (t.includes('CUSTOMER')) return 'text-[hsl(var(--dd-green))] border-[hsl(var(--dd-green))]/20 bg-[hsl(var(--dd-green-light))]';
    if (t.includes('FINANCIAL')) return 'text-[hsl(var(--dd-amber))] border-[hsl(var(--dd-amber))]/20 bg-[hsl(var(--dd-amber-light))]';
    if (t.includes('PRODUCTIVITY')) return 'text-[hsl(var(--dd-teal))] border-[hsl(var(--dd-teal))]/20 bg-transparent';
    return 'text-muted-foreground border-border bg-transparent';
  }

  function getDriverBadgeStyle(type: string) {
    const t = (type || '').toUpperCase();
    if (t.includes('PROCESS')) return 'text-[hsl(var(--dd-teal))] border-[hsl(var(--dd-teal))]/20';
    if (t.includes('OPERATIONAL')) return 'text-[hsl(var(--dd-amber))] border-[hsl(var(--dd-amber))]/20';
    if (t.includes('INPUT')) return 'text-[hsl(var(--dd-accent))] border-[hsl(var(--dd-accent))]/20';
    return 'text-muted-foreground border-border';
  }

  function getConsequenceBadgeStyle(type: string) {
    const t = (type || '').toUpperCase();
    if (t.includes('CUSTOMER')) return 'text-[hsl(var(--dd-amber))] border-[hsl(var(--dd-amber))]/20 bg-[hsl(var(--dd-amber-light))]';
    if (t.includes('FINANCIAL')) return 'text-destructive border-destructive/20 bg-destructive/5';
    if (t.includes('PRODUCTIVITY')) return 'text-[hsl(var(--dd-teal))] border-[hsl(var(--dd-teal))]/20';
    return 'text-muted-foreground border-border';
  }

  function formatHistoryDescription(entry: AuditEntry): string {
    const { field_name, old_value, new_value } = entry;
    if (field_name === 'created') return new_value;
    if (field_name === 'status') return `Status: ${old_value || '—'} → ${new_value}`;
    if (field_name === 'priority') return `Priority: ${old_value || '—'} → ${new_value}`;
    if (field_name === 'responsible_person') return `Reassigned to ${new_value}`;
    if (field_name === 'target_completion_date') return `Due date → ${new_value}`;
    if (field_name === 'impact_score') return `Impact → ${IMPACT_LABELS[parseInt(new_value) - 1] || new_value}`;
    if (field_name === 'effort_score') return `Effort → ${EFFORT_LABELS[parseInt(new_value) - 1] || new_value}`;
    if (field_name === 'urgency_score') return `Urgency → ${URGENCY_LABELS[parseInt(new_value) - 1] || new_value}`;
    return `Updated ${field_name.replace(/_/g, ' ')}`;
  }

  // Priority color helpers
  const priorityColor = (p: string) => {
    if (p === 'critical') return 'border-l-destructive';
    if (p === 'high') return 'border-l-[hsl(var(--dd-amber))]';
    if (p === 'medium') return 'border-l-[hsl(var(--dd-accent))]';
    return 'border-l-muted-foreground';
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-[1100px] w-[95vw] md:w-[85vw] lg:w-[75vw] max-h-[90vh] p-0 flex flex-col overflow-hidden">
        {/* ── HEADER ── */}
        <DialogHeader className="px-6 pt-5 pb-0 flex-shrink-0">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <DialogTitle className="text-base font-semibold text-foreground">
                {readOnly ? 'View Action' : mode === 'create' ? 'Create Action' : 'Edit Action'}
              </DialogTitle>
              {mode === 'edit' && action && (
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs font-medium">{action.department}</Badge>
                  <Badge className={cn("text-xs border",
                    action.priority === 'critical' ? 'bg-destructive/10 text-destructive border-destructive/20' :
                    action.priority === 'high' ? 'bg-[hsl(var(--dd-amber-light))] text-[hsl(var(--dd-amber))] border-[hsl(var(--dd-amber))]/20' :
                    action.priority === 'medium' ? 'bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] border-[hsl(var(--dd-accent))]/20' :
                    'bg-muted text-muted-foreground border-border'
                  )}>
                    {action.priority.charAt(0).toUpperCase() + action.priority.slice(1)}
                  </Badge>
                  {triageBadgeLabel && (
                    <Badge variant="outline" className={cn("text-xs", triageBadgeColor)}>{triageBadgeLabel}</Badge>
                  )}
                </div>
              )}
            </div>
          </div>
          {/* Tab bar */}
          <div className="flex gap-4 mt-3 border-b">
            <button
              onClick={() => setActiveTab('details')}
              className={cn("text-sm pb-2 border-b-2 transition-colors -mb-px",
                activeTab === 'details' ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>Details</button>
            <button
              onClick={() => setActiveTab('history')}
              className={cn("text-sm pb-2 border-b-2 transition-colors -mb-px",
                activeTab === 'history' ? "border-primary text-primary font-medium" : "border-transparent text-muted-foreground hover:text-foreground"
              )}>History</button>
          </div>
        </DialogHeader>

        {/* ── BODY ── */}
        <ScrollArea className="flex-1 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 160px)' }}>
          {activeTab === 'details' ? (
            <div className="px-6 py-5">
              <div className={cn("gap-6", mode === 'edit' ? "grid grid-cols-1 lg:grid-cols-[1fr_380px]" : "space-y-5")}>
                {/* ── LEFT: Form ── */}
                <div className="space-y-5">
                  {/* Title & Description */}
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="title" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Action Title</Label>
                      <Input id="title" disabled={readOnly} value={formData.action_title || ''}
                        onChange={(e) => updateField('action_title', e.target.value)} placeholder="Short, imperative action title" />
                    </div>
                    <div className="space-y-1.5">
                      <Label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Description</Label>
                      <Textarea id="description" disabled={readOnly} value={formData.action_description || ''}
                        onChange={(e) => updateField('action_description', e.target.value)}
                        placeholder="Describe what needs to be done" rows={3} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Department</Label>
                      <Select disabled={readOnly} value={formData.department || ''} onValueChange={(v) => updateField('department', v)}>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                        <SelectContent>
                          {DEPARTMENTS.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  {/* Triage Assessment — compact */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Triage Assessment</p>
                    <div className="bg-secondary/50 rounded-xl border border-border/50 p-4 space-y-3">
                      {[
                        { label: 'Impact', value: formData.impact_score, labels: IMPACT_LABELS, field: 'impact_score' },
                        { label: 'Effort', value: formData.effort_score, labels: EFFORT_LABELS, field: 'effort_score' },
                        { label: 'Urgency', value: formData.urgency_score, labels: URGENCY_LABELS, field: 'urgency_score' },
                      ].map(item => (
                        <div key={item.field} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-foreground">{item.label}</span>
                            <span className="text-muted-foreground">
                              {item.value != null ? item.labels[item.value - 1] : 'Not set'}
                            </span>
                          </div>
                          <Slider disabled={readOnly} min={1} max={5} step={1}
                            value={item.value != null ? [item.value] : []}
                            onValueChange={([v]) => updateField(item.field, v)} />
                        </div>
                      ))}

                      {/* Triage result row */}
                      <div className="flex items-center justify-between pt-2 border-t border-border/50">
                        <div className="flex items-center gap-2">
                          {triageBadgeLabel && <Badge variant="outline" className={cn("text-xs", triageBadgeColor)}>{triageBadgeLabel}</Badge>}
                          {triageScore != null && <span className="text-xs text-muted-foreground">Score: {triageScore}</span>}
                        </div>
                        {quadrantLabel && <span className={cn("text-xs font-medium", quadrantColor)}>{quadrantLabel}</span>}
                      </div>

                      {/* Mini quadrant */}
                      {allScoresSet && (
                        <div className="relative w-[160px] h-[160px] mx-auto mt-2">
                          <div className="absolute top-0 left-0 w-1/2 h-1/2 bg-[hsl(var(--dd-green-light))] rounded-tl-lg" />
                          <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-[hsl(var(--dd-amber-light))] rounded-tr-lg" />
                          <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-secondary rounded-bl-lg" />
                          <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-destructive/5 rounded-br-lg" />
                          <span className="absolute top-0.5 left-1 text-[8px] text-[hsl(var(--dd-green))]">Quick Win</span>
                          <span className="absolute top-0.5 right-1 text-[8px] text-[hsl(var(--dd-amber))] text-right">Strategic</span>
                          <span className="absolute bottom-0.5 left-1 text-[8px] text-muted-foreground">Maintenance</span>
                          <span className="absolute bottom-0.5 right-1 text-[8px] text-destructive text-right">Low Priority</span>
                          <div className="absolute left-1/2 top-0 bottom-0 w-px bg-border" />
                          <div className="absolute top-1/2 left-0 right-0 h-px bg-border" />
                          <div
                            className="absolute w-3 h-3 rounded-full bg-primary shadow-lg ring-2 ring-primary/30 transition-all"
                            style={{
                              left: `${((formData.effort_score! - 1) / 4) * 100}%`,
                              bottom: `${((formData.impact_score! - 1) / 4) * 100}%`,
                              transform: 'translate(-50%, 50%)',
                            }}
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Ownership & Timeline */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Ownership & Timeline</p>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Priority</Label>
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
                        <Label className="text-xs font-medium text-muted-foreground">Status</Label>
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
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Responsible Person</Label>
                        <Select disabled={readOnly} value={formData.responsible_person || ''} onValueChange={(v) => updateField('responsible_person', v)}>
                          <SelectTrigger className="h-9"><SelectValue placeholder="Assign owner" /></SelectTrigger>
                          <SelectContent>
                            {RESPONSIBLE_PERSONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1.5">
                        <Label className="text-xs font-medium text-muted-foreground">Target Date</Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button variant="outline" disabled={readOnly}
                              className={cn("w-full h-9 justify-start text-left font-normal text-sm", !formData.target_completion_date && "text-muted-foreground")}>
                              <CalendarIcon className="mr-2 h-3.5 w-3.5" />
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
                  </div>

                  {/* Support Required */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Support Required</p>
                    <div className="flex flex-wrap gap-1.5">
                      {SUPPORT_OPTIONS.map(s => (
                        <button key={s} disabled={readOnly}
                          onClick={() => toggleSupport(s)}
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
                </div>

                {/* ── RIGHT: Intelligence Panel ── */}
                {mode === 'edit' && (
                  <div className="space-y-4">
                    {/* Context Intelligence Card */}
                    {(action?.action_context || action?.business_impact || action?.recommendation || action?.expected_benefit) && (
                      <div className="rounded-xl border border-[hsl(var(--dd-accent))]/20 bg-[hsl(var(--dd-accent-light))] p-4 space-y-3">
                        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--dd-accent))]">
                          <Lightbulb className="h-3.5 w-3.5" /> Context Intelligence
                        </div>

                        {action?.action_context && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Why This Matters</p>
                            <p className="text-sm text-foreground leading-relaxed">{action.action_context}</p>
                          </div>
                        )}

                        {action?.business_impact && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">Business Impact</p>
                            <p className="text-sm text-foreground leading-relaxed">{action.business_impact}</p>
                          </div>
                        )}

                        {action?.recommendation && (
                          <div className="bg-[hsl(var(--dd-amber-light))] rounded-lg p-3">
                            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--dd-amber))] font-semibold mb-1">Recommendation</p>
                            <p className="text-sm text-foreground leading-relaxed">{action.recommendation}</p>
                          </div>
                        )}

                        {action?.expected_benefit && (
                          <div>
                            <p className="text-[10px] uppercase tracking-wider text-[hsl(var(--dd-green))] font-semibold mb-1">Expected Benefit</p>
                            <p className="text-sm text-foreground leading-relaxed">{action.expected_benefit}</p>
                          </div>
                        )}
                      </div>
                    )}

                    {/* KPI Intelligence */}
                    {linkedKpiDetails.length > 0 && (
                      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-3">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <BarChart3 className="h-3.5 w-3.5 text-primary" /> KPIs This Action Will Improve
                        </p>
                        <div className="space-y-2">
                          {visibleKpis.map((kpi: any, i: number) => (
                            <div key={i} className="rounded-lg border border-border/50 p-3 bg-background">
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-medium text-foreground flex items-center gap-1.5">
                                  <BarChart3 className="h-3 w-3 text-primary flex-shrink-0" />
                                  {kpi.name || kpi.title || kpi.key}
                                </span>
                                {kpi.type && (
                                  <Badge variant="outline" className={cn("text-[10px] font-medium", getKpiBadgeStyle(kpi.type))}>
                                    {kpi.type}
                                  </Badge>
                                )}
                              </div>
                              {kpi.reason && (
                                <p className="text-xs text-muted-foreground leading-relaxed ml-[18px]">{kpi.reason}</p>
                              )}
                            </div>
                          ))}
                          {linkedKpiDetails.length > 4 && !showKpiAll && (
                            <Button variant="ghost" size="sm" onClick={() => setShowKpiAll(true)} className="text-xs w-full">
                              + {linkedKpiDetails.length - 4} more KPIs
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Likely Drivers */}
                    {likelyDrivers.length > 0 && (
                      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <AlertTriangle className="h-3.5 w-3.5 text-[hsl(var(--dd-amber))]" /> Likely Drivers
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {likelyDrivers.map((d: any, i: number) => (
                            <div key={i} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs",
                              typeof d === 'object' && d.type ? getDriverBadgeStyle(d.type) : 'border-border text-muted-foreground'
                            )}>
                              <span className="text-foreground">{typeof d === 'string' ? d : d.name || d.label}</span>
                              {typeof d === 'object' && d.type && (
                                <span className="text-[9px] font-medium opacity-70">{d.type}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Likely Consequences */}
                    {likelyConsequences.length > 0 && (
                      <div className="rounded-xl border border-border/50 bg-card p-4 space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <TrendingUp className="h-3.5 w-3.5 text-destructive" /> Likely Consequences
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {likelyConsequences.map((c: any, i: number) => (
                            <div key={i} className={cn("inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs",
                              typeof c === 'object' && c.type ? getConsequenceBadgeStyle(c.type) : 'border-border text-muted-foreground'
                            )}>
                              <span className="text-foreground">{typeof c === 'string' ? c : c.name || c.label}</span>
                              {typeof c === 'object' && c.type && (
                                <span className="text-[9px] font-medium opacity-70">{c.type}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* ── HISTORY TAB ── */
            <div className="px-6 py-5">
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
                <div className="space-y-2">
                  {historyEntries.map(entry => (
                    <div key={entry.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors">
                      <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-semibold flex-shrink-0 mt-0.5">
                        {entry.changed_by?.slice(0, 2).toUpperCase() || '??'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{formatHistoryDescription(entry)}</p>
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

        {/* ── FOOTER ── */}
        {!readOnly && (
          <div className="flex items-center gap-2 px-6 py-3 border-t bg-card flex-shrink-0">
            {mode === 'edit' && onDelete && action && (
              <Button variant="destructive" size="sm" onClick={() => { onDelete(action.id); onOpenChange(false); }} className="mr-auto gap-1.5">
                <Trash2 className="h-3.5 w-3.5" /> Delete
              </Button>
            )}
            <div className="flex-1" />
            <Button variant="outline" size="sm" onClick={handleClose} className="gap-1.5">
              <X className="h-3.5 w-3.5" /> Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={saving} className="gap-1.5">
              {saving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />}
              {mode === 'create' ? 'Create' : 'Save'}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
