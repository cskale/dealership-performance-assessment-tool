import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { CalendarIcon, ClipboardList } from 'lucide-react';
import { toast } from 'sonner';
import { VISIT_MODULES, type CoachVisit, type VisitType, type OpenAction } from '@/lib/coachVisitUtils';

interface VisitLogSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  visit: CoachVisit;
  dealershipId: string;
  dealerName: string;
  onLogSaved: () => void;
}

const VISIT_TYPE_OPTIONS: { value: VisitType; label: string }[] = [
  { value: 'in-person', label: 'In-person' },
  { value: 'remote',    label: 'Remote (video)' },
  { value: 'phone',     label: 'Phone call' },
];

export function VisitLogSheet({ open, onOpenChange, visit, dealershipId, dealerName, onLogSaved }: VisitLogSheetProps) {
  const { user } = useAuth();

  // Form state — pre-fill from existing visit log if present
  const [visitType, setVisitType]           = useState<VisitType | ''>(visit.visit_type ?? '');
  const [modulesReviewed, setModulesReviewed] = useState<string[]>(visit.modules_reviewed ?? []);
  const [summary, setSummary]               = useState(visit.summary ?? '');
  const [nextVisitDate, setNextVisitDate]   = useState<Date | undefined>(
    visit.next_visit_date ? new Date(visit.next_visit_date) : undefined
  );
  const [saving, setSaving]                 = useState(false);

  // Open actions for "link existing" section
  const [openActions, setOpenActions]       = useState<OpenAction[]>([]);
  const [linkedActionIds, setLinkedActionIds] = useState<string[]>(visit.agreed_action_ids ?? []);

  // New action form
  const [newActionTitle, setNewActionTitle] = useState('');
  const [newActionDept, setNewActionDept]   = useState('');
  const [newActionPriority, setNewActionPriority] = useState<'critical' | 'high' | 'medium' | 'low'>('medium');

  useEffect(() => {
    if (open) {
      // Reset form to current visit values when sheet opens
      setVisitType(visit.visit_type ?? '');
      setModulesReviewed(visit.modules_reviewed ?? []);
      setSummary(visit.summary ?? '');
      setNextVisitDate(visit.next_visit_date ? new Date(visit.next_visit_date) : undefined);
      setLinkedActionIds(visit.agreed_action_ids ?? []);
      fetchOpenActions();
    }
  }, [open, visit]);

  const fetchOpenActions = async () => {
    // Get all assessments for this dealership
    const { data: assessments } = await supabase
      .from('assessments')
      .select('id')
      .eq('dealership_id', dealershipId);
    if (!assessments?.length) return;

    const assessmentIds = assessments.map(a => a.id);
    const { data } = await supabase
      .from('improvement_actions')
      .select('id, action_title, department, priority, status')
      .in('assessment_id', assessmentIds)
      .in('status', ['Open', 'In Progress'])
      .order('priority');
    setOpenActions((data ?? []) as OpenAction[]);
  };

  const toggleModule = (moduleId: string) => {
    setModulesReviewed(prev =>
      prev.includes(moduleId) ? prev.filter(m => m !== moduleId) : [...prev, moduleId]
    );
  };

  const toggleLinkedAction = (actionId: string) => {
    setLinkedActionIds(prev =>
      prev.includes(actionId) ? prev.filter(id => id !== actionId) : [...prev, actionId]
    );
  };

  const handleSave = async () => {
    if (!visitType) { toast.error('Select a visit type'); return; }
    setSaving(true);
    try {
      // 1. Create any new agreed action
      let newlyCreatedActionId: string | null = null;
      if (newActionTitle.trim()) {
        const { data: assessments } = await supabase
          .from('assessments')
          .select('id, organization_id')
          .eq('dealership_id', dealershipId)
          .order('created_at', { ascending: false })
          .limit(1);
        const latestAssessment = assessments?.[0];
        if (!latestAssessment) {
          toast.error('No assessment found for this dealership to attach the new action to');
          setSaving(false);
          return;
        }
        const { data: created, error: actionError } = await supabase
          .from('improvement_actions')
          .insert({
            action_title: newActionTitle.trim(),
            action_description: '',
            assessment_id: latestAssessment.id,
            organization_id: latestAssessment.organization_id,
            department: newActionDept || 'General',
            priority: newActionPriority,
            status: 'Open',
            source_visit_id: visit.id,
            user_id: user?.id ?? null,
          })
          .select('id')
          .single();
        if (actionError) throw actionError;
        newlyCreatedActionId = created.id;
      }

      // 2. Build final agreed_action_ids
      const allAgreedIds = newlyCreatedActionId
        ? [...linkedActionIds, newlyCreatedActionId]
        : linkedActionIds;

      // 3. Update coach_visits with log fields
      const { error } = await supabase
        .from('coach_visits')
        .update({
          visit_type: visitType,
          modules_reviewed: modulesReviewed,
          summary: summary.trim() || null,
          next_visit_date: nextVisitDate ? format(nextVisitDate, 'yyyy-MM-dd') : null,
          agreed_action_ids: allAgreedIds,
          updated_at: new Date().toISOString(),
        })
        .eq('id', visit.id);
      if (error) throw error;

      toast.success('Session log saved');
      setNewActionTitle('');
      setNewActionDept('');
      setNewActionPriority('medium');
      onLogSaved();
      onOpenChange(false);
    } catch {
      toast.error('Failed to save session log');
    } finally {
      setSaving(false);
    }
  };

  const PRIORITY_OPTIONS: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  const DEPT_OPTIONS = ['New Vehicle Sales', 'Used Vehicle Sales', 'Service', 'Parts & Inventory', 'Financial Operations'];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="h-4 w-4 text-[hsl(var(--brand-500))]" />
            Session Log — {dealerName}
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Visit on {format(new Date(visit.visit_date), 'dd MMM yyyy')}
          </p>
        </DialogHeader>

        <div className="mt-6 space-y-6">
          {/* Visit type */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Visit type</Label>
            <div className="flex gap-2 flex-wrap">
              {VISIT_TYPE_OPTIONS.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setVisitType(opt.value)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    visitType === opt.value
                      ? 'border-[hsl(var(--brand-500))] bg-[hsl(var(--brand-500))]/10 text-[hsl(var(--brand-500))]'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Modules reviewed */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Modules reviewed</Label>
            <div className="flex flex-wrap gap-2">
              {VISIT_MODULES.map(mod => (
                <button
                  key={mod.id}
                  type="button"
                  onClick={() => toggleModule(mod.id)}
                  className={`text-xs px-3 py-1.5 rounded-md border transition-colors ${
                    modulesReviewed.includes(mod.id)
                      ? 'border-[hsl(var(--brand-500))] bg-[hsl(var(--brand-500))]/10 text-[hsl(var(--brand-500))]'
                      : 'border-border bg-background text-muted-foreground hover:border-border/80'
                  }`}
                >
                  {mod.label}
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Session summary</Label>
            <Textarea
              placeholder="What was discussed? Key observations, decisions made, dealer's response…"
              value={summary}
              onChange={e => setSummary(e.target.value)}
              className="resize-none text-sm"
              rows={4}
              maxLength={3000}
            />
            <p className="text-xs text-muted-foreground text-right">{summary.length}/3000</p>
          </div>

          {/* Next visit date */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Next visit date (optional)</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="w-full justify-start text-sm font-normal">
                  <CalendarIcon className="h-3.5 w-3.5 mr-2 text-muted-foreground" />
                  {nextVisitDate ? format(nextVisitDate, 'dd MMM yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={nextVisitDate}
                  onSelect={setNextVisitDate}
                  disabled={{ before: new Date() }}
                />
              </PopoverContent>
            </Popover>
            {nextVisitDate && (
              <button
                type="button"
                className="text-xs text-muted-foreground underline"
                onClick={() => setNextVisitDate(undefined)}
              >
                Clear date
              </button>
            )}
          </div>

          <Separator />

          {/* Agreed actions — link existing */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Link existing open actions ({linkedActionIds.length} selected)
            </Label>
            {openActions.length === 0 ? (
              <p className="text-xs text-muted-foreground">No open actions for this dealership.</p>
            ) : (
              <div className="max-h-48 overflow-y-auto divide-y divide-border rounded-lg border">
                {openActions.map(action => (
                  <button
                    key={action.id}
                    type="button"
                    onClick={() => toggleLinkedAction(action.id)}
                    className={`w-full text-left px-3 py-2 flex items-start gap-2 transition-colors ${
                      linkedActionIds.includes(action.id) ? 'bg-[hsl(var(--brand-500))]/5' : 'hover:bg-muted/40'
                    }`}
                  >
                    <div
                      className={`mt-0.5 h-4 w-4 shrink-0 rounded border flex items-center justify-center ${
                        linkedActionIds.includes(action.id)
                          ? 'bg-[hsl(var(--brand-500))] border-[hsl(var(--brand-500))]'
                          : 'border-border'
                      }`}
                    >
                      {linkedActionIds.includes(action.id) && (
                        <svg className="h-2.5 w-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-medium leading-snug">{action.action_title}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{action.department} · {action.priority}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Agreed actions — add new */}
          <div className="space-y-2">
            <Label className="text-xs font-medium uppercase tracking-wide text-muted-foreground">Add new agreed action (optional)</Label>
            <input
              type="text"
              placeholder="Action title…"
              value={newActionTitle}
              onChange={e => setNewActionTitle(e.target.value)}
              maxLength={200}
              className="h-8 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
            />
            {newActionTitle.trim() && (
              <div className="flex gap-2">
                <select
                  value={newActionDept}
                  onChange={e => setNewActionDept(e.target.value)}
                  className="flex-1 h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
                >
                  <option value="">Department…</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
                <select
                  value={newActionPriority}
                  onChange={e => setNewActionPriority(e.target.value as typeof newActionPriority)}
                  className="h-8 rounded-md border border-input bg-background px-2 text-sm outline-none focus:ring-1 focus:ring-[hsl(var(--brand-500))]"
                >
                  {PRIORITY_OPTIONS.map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                </select>
              </div>
            )}
          </div>

          <Button
            className="w-full"
            disabled={saving || !visitType}
            onClick={handleSave}
          >
            {saving ? 'Saving…' : 'Save session log'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
