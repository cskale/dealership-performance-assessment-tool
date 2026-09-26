import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
// Tabs no longer used after view-toggle redesign
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Plus, Loader2, Pencil, ChevronDown,
  AlertTriangle, Target, Eye, Search, Filter, LayoutGrid, List as ListIcon,
  Info, X, StickyNote, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { toast } from 'sonner';
import { questionnaire } from '@/data/questionnaire';
import { getScoredQuestions } from '@/lib/scoringEngine';
import { generateActionsFromAssessment, formatActionsForDatabaseInsert, SignalEngineConfig } from '@/lib/signalEngine';
import { loadBenchmarks, type KpiBenchmark } from '@/lib/kpiBenchmarks';
import { cleanActionTitle, resetPatternUsage } from '@/lib/actionRationaleMap';
import { cleanDescription } from '@/lib/cleanDescription';
import { buildQuestionSectionMap, DEPT_LABEL_TO_SECTION_ID } from '@/lib/coachVisitUtils';
import { ActionSheet } from './ActionSheet';
import { KanbanBoard } from './action-plan/KanbanBoard';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useKpiTimelines } from '@/hooks/useKpiTimeline';
import { isTrackedKpi, trackedKpisFor, type DepartmentKey } from '@/data/trackedKpis';
import { LinkedKpiChip } from './action-plan/LinkedKpiChip';

export interface ActionRecord {
  id: string;
  department: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  action_title: string;
  action_description: string;
  status: 'Open' | 'In Progress' | 'Completed';
  responsible_person: string | null;
  target_completion_date: string | null;
  support_required_from: string[];
  kpis_linked_to: string[];
  assessment_id: string | null;
  organization_id: string | null;
  user_id: string | null;
  updated_at?: string;
  created_at?: string;
  _loadedAt?: string;
  impact_score?: number | null;
  effort_score?: number | null;
  urgency_score?: number | null;
  action_context?: string | null;
  business_impact?: string | null;
  recommendation?: string | null;
  expected_benefit?: string | null;
  linked_kpis?: string[] | null;
  likely_drivers?: string[] | null;
  likely_consequences?: string[] | null;
  expected_impact?: string | null;
  estimated_effort?: string | null;
  source_visit_id?: string | null;
  rank?: number | null;
  is_quick_win?: boolean | null;
}

function computeTriageScore(action: ActionRecord): number | null {
  if (action.impact_score == null || action.effort_score == null || action.urgency_score == null) return null;
  return (action.impact_score * 2) + (action.urgency_score * 2) - action.effort_score;
}

function isOverdue(action: ActionRecord): boolean {
  if (!action.target_completion_date || action.status === 'Completed') return false;
  return new Date(action.target_completion_date) < new Date(new Date().toDateString());
}

function getPriorityBorderClass(priority: ActionRecord['priority']): string {
  if (priority === 'critical') return 'border-l-destructive';
  if (priority === 'high') return 'border-l-warning';
  if (priority === 'medium') return 'border-l-info';
  return 'border-l-neutral-400';
}

const DEPARTMENT_KEYS: Record<string, DepartmentKey> = {
  'New Vehicle Sales': 'nvs',
  'Used Vehicle Sales': 'uvs',
  'Service': 'svc',
  'Parts & Inventory': 'prt',
  'Financial Operations': 'fin',
};

function linkedTrackedKpi(action: ActionRecord): string | undefined {
  const departmentKey = DEPARTMENT_KEYS[action.department];
  if (!departmentKey) return undefined;
  const departmentKpis = trackedKpisFor(departmentKey);
  return action.kpis_linked_to?.find((key) => isTrackedKpi(key) && departmentKpis.includes(key));
}

export function ActionPlan({ assessmentId, dealershipId, notes, focusActionId }: { assessmentId?: string; dealershipId?: string | null; notes?: Record<string, string>; focusActionId?: string | null }) {
  const { user } = useAuth();
  const { currentOrganization, canPerformAction } = useMultiTenant();
  const { t, language } = useLanguage();
  const { data: kpiTimelines = {} } = useKpiTimelines(dealershipId);
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearchQuery = useDebouncedValue(searchQuery);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'roadmap'>('list');
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);
  const [actionPage, setActionPage] = useState(0);
  const PAGE_SIZE = 50;

  const [editingAction, setEditingAction] = useState<ActionRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('edit');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [conflictAction, setConflictAction] = useState<ActionRecord | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [dismissedMilestone, setDismissedMilestone] = useState<number | null>(null);
  const lastFocusedId = useRef<string | null>(null);

  const canEdit = canPerformAction('update');
  const canCreate = canPerformAction('create');

  const completedCount = actions.filter(a => a.status === 'Completed').length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = actions.filter(a => isOverdue(a)).length;
  const openCount = actions.filter(a => a.status === 'Open').length;
  const inProgressCount = actions.filter(a => a.status === 'In Progress').length;

  const currentMilestone = useMemo(() => {
    if (totalCount === 0) return null;
    const pct = progressPercent;
    if (pct >= 100) return { pct: 100, message: 'All actions complete — ready for your next assessment.', cta: true };
    if (pct >= 75) return { pct: 75, message: '75% complete — excellent pace. Time to reassess which remaining actions have highest impact.', cta: false };
    if (pct >= 50) return { pct: 50, message: 'Halfway there. Keep the momentum — the second half drives the score improvement.', cta: false };
    if (pct >= 25) return { pct: 25, message: 'Good start — 25% complete. Consistency now will compound into score gains.', cta: false };
    return null;
  }, [progressPercent, totalCount]);

  const showMilestoneBanner = currentMilestone !== null && currentMilestone.pct !== dismissedMilestone;

  const loadActions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('improvement_actions').select('*').order('rank', { ascending: true, nullsFirst: false }).order('created_at', { ascending: false });
      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      } else if (currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        query = query.eq('user_id', user.id);
      }
      query = query.range(0, (actionPage + 1) * PAGE_SIZE - 1);
      const { data, error } = await query;
      if (error) throw error;
      setActions((data || []).map(a => ({ ...a, _loadedAt: new Date().toISOString() })) as unknown as ActionRecord[]);
    } catch (error) {
      console.error('Error loading actions:', error);
      toast.error('Failed to load action plans');
    } finally {
      setLoading(false);
    }
  }, [user, assessmentId, currentOrganization, actionPage]);

  useEffect(() => { loadActions(); }, [loadActions]);

  useEffect(() => {
    if (loading || !focusActionId || lastFocusedId.current === focusActionId) return;
    const action = actions.find((candidate) => candidate.id === focusActionId);
    if (!action) return;
    lastFocusedId.current = focusActionId;
    setStatusFilter('all');
    setFilterPriority('all');
    setFilterDepartment('all');
    setSearchQuery('');
    setViewMode('list');
    const frame = requestAnimationFrame(() => {
      document.getElementById(`action-${focusActionId}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
    return () => cancelAnimationFrame(frame);
  }, [actions, focusActionId, loading]);

  // Real-time: re-fetch when any action is updated (e.g. coach changes status)
  useEffect(() => {
    if (!assessmentId) return;
    const channel = supabase
      .channel(`action-plan-realtime-${assessmentId}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'improvement_actions', filter: `assessment_id=eq.${assessmentId}` },
        () => { loadActions(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [assessmentId, loadActions]);

  const handleKanbanStatusChange = useCallback(async (
    actionId: string,
    newStatus: 'Open' | 'In Progress' | 'Completed'
  ) => {
    const { error } = await supabase
      .from('improvement_actions')
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq('id', actionId);
    if (error) throw error;
    await loadActions();
  }, [loadActions]);

  const handleGenerateClick = () => {
    const now = Date.now();
    if (lastGenerated && now - lastGenerated < 30000) {
      const secondsLeft = Math.ceil((30000 - (now - lastGenerated)) / 1000);
      toast.info(`Please wait ${secondsLeft} seconds before generating again.`);
      return;
    }
    const hasAutoGenerated = actions.some(a => a.assessment_id === assessmentId);
    if (hasAutoGenerated) setShowRegenerateConfirm(true);
    else {
      setLastGenerated(now);
      generateIntelligentActions(false);
    }
  };

  const generateIntelligentActions = async (replaceExisting: boolean) => {
    if (!user) return;
    setGenerating(true);
    setShowRegenerateConfirm(false);
    try {
      // Server-side rate limit check via Edge Function
      const { data: sessionData } = await supabase.auth.getSession();
      const rateLimitResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/generate-actions`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${sessionData.session?.access_token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            assessmentId: assessmentId || null,
            organizationId: currentOrganization?.id || null,
          }),
        }
      );
      if (!rateLimitResponse.ok) {
        const errData = await rateLimitResponse.json();
        toast.error(errData.error ?? 'Action generation temporarily limited. Please try again later.');
        setGenerating(false);
        return;
      }

      let targetAssessmentId = assessmentId;
      if (!targetAssessmentId) {
        const { data: assessments } = await supabase.from('assessments').select('id, answers')
          .eq('user_id', user.id).order('created_at', { ascending: false }).limit(1).single();
        if (!assessments) { toast.error('No assessment found.'); setGenerating(false); return; }
        targetAssessmentId = assessments.id;
      }
      if (replaceExisting && targetAssessmentId) {
        const existingAuto = actions.filter(a => a.assessment_id === targetAssessmentId);
        if (existingAuto.length > 0) {
          await supabase.from('improvement_actions').delete().in('id', existingAuto.map(a => a.id));
        }
      }
      const { data: assessment } = await supabase.from('assessments').select('answers, overall_score').eq('id', targetAssessmentId).single();
      if (!assessment) { toast.error('Failed to load assessment data'); setGenerating(false); return; }
      const questionWeights: Record<string, number> = {};
      for (const section of questionnaire.sections) {
        for (const question of getScoredQuestions(section.questions)) questionWeights[question.id] = question.weight;
      }
      const bm = (currentOrganization as any)?.business_model as string | undefined;

      let kpiValues: Record<string, number> = {};
      let benchmarks: Record<string, KpiBenchmark> = {};
      try {
        const { data: kpiRows, error: kpiError } = await supabase.from('assessment_kpi_values')
          .select('kpi_key, value').eq('assessment_id', targetAssessmentId).eq('skipped', false);
        if (kpiError) console.error('[ActionPlan] KPI values fetch error:', kpiError);
        kpiValues = Object.fromEntries((kpiRows ?? []).filter(r => r.value != null).map(r => [r.kpi_key, r.value as number]));
        if (Object.keys(kpiValues).length) benchmarks = await loadBenchmarks();
      } catch (kpiFetchErr) {
        console.error('[ActionPlan] KPI values fetch failed:', kpiFetchErr);
        kpiValues = {};
        benchmarks = {};
      }

      const config: SignalEngineConfig = {
        enableAutoActions: true,
        weakScoreThreshold: 3,
        criticalScoreThreshold: 2,
        overallScore: assessment.overall_score ?? undefined,
      };
      const { actions: generatedActions } = generateActionsFromAssessment(
        assessment.answers as Record<string, number>, questionWeights, config, undefined, bm, undefined, kpiValues, benchmarks
      );
      if (generatedActions.length === 0) { toast.success('No critical improvement areas found.'); setGenerating(false); return; }
      const actionsWithOrg = formatActionsForDatabaseInsert(generatedActions, user.id, targetAssessmentId!, currentOrganization?.id || '');

      // Insert actions
      const { data: insertedActions, error: insertError } = await supabase.from('improvement_actions').insert(actionsWithOrg as any).select();
      if (insertError) throw insertError;

      toast.success(`Generated ${insertedActions?.length || 0} targeted action items`);
      loadActions();
    } catch (error) {
      console.error('Error generating actions:', error);
      toast.error('Failed to generate action plans');
    } finally {
      setGenerating(false);
    }
  };

  const openEditPanel = (action: ActionRecord) => {
    if (!canEdit) { toast.info('You have view-only access.'); return; }
    setEditingAction(action);
    setSheetMode('edit');
    setSheetOpen(true);
  };

  const openCreatePanel = () => {
    setEditingAction(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const handleSheetSave = async (formData: Partial<ActionRecord>) => {
    if (!user) return;
    if (sheetMode === 'create') {
      try {
        const actionData = {
          user_id: user.id,
          assessment_id: assessmentId || null,
          organization_id: currentOrganization?.id || null,
          department: formData.department || 'General',
          priority: formData.priority || 'medium',
          action_title: sanitizeText(formData.action_title) || '',
          action_description: sanitizeText(formData.action_description) || '',
          status: formData.status || 'Open',
          responsible_person: sanitizeText(formData.responsible_person) || null,
          target_completion_date: formData.target_completion_date || null,
          support_required_from: formData.support_required_from || [],
          kpis_linked_to: formData.kpis_linked_to || [],
          impact_score: formData.impact_score ?? null,
          effort_score: formData.effort_score ?? null,
          urgency_score: formData.urgency_score ?? null,
        };
        const { data: inserted, error } = await supabase.from('improvement_actions').insert([actionData as any]).select();
        if (error) throw error;

        toast.success('Action added successfully');
        loadActions();
      } catch (error) {
        console.error('Error adding action:', error);
        toast.error('Failed to add action');
      }
    } else if (sheetMode === 'edit' && formData.id) {
      try {
        const original = actions.find(a => a.id === formData.id);
        if (original?.updated_at) {
          const { data: currentAction } = await supabase.from('improvement_actions').select('*').eq('id', formData.id).single();
          if (currentAction) {
            const currentData = currentAction as unknown as { updated_at?: string };
            if (currentData?.updated_at) {
              const serverTime = new Date(currentData.updated_at).getTime();
              const loadedTime = new Date(original.updated_at).getTime();
              if (serverTime > loadedTime) {
                setConflictAction(currentAction as unknown as ActionRecord);
                setConflictDetected(true);
                return;
              }
            }
          }
        }
        await performUpdate(formData, original || null);
      } catch (error) {
        console.error('Error updating action:', error);
        toast.error('Failed to update action');
      }
    }
  };

  const performUpdate = async (formData: Partial<ActionRecord>, original: ActionRecord | null) => {
    const { error } = await supabase.from('improvement_actions').update({
      action_title: sanitizeText(formData.action_title),
      action_description: sanitizeText(formData.action_description),
      department: formData.department,
      priority: formData.priority,
      status: formData.status,
      responsible_person: sanitizeText(formData.responsible_person) || null,
      target_completion_date: formData.target_completion_date || null,
      support_required_from: formData.support_required_from || [],
      kpis_linked_to: formData.kpis_linked_to || [],
      impact_score: formData.impact_score ?? null,
      effort_score: formData.effort_score ?? null,
      urgency_score: formData.urgency_score ?? null,
      updated_at: new Date().toISOString()
    }).eq('id', formData.id!);
    if (error) throw error;

    toast.success('Action updated successfully');
    setSheetOpen(false);
    setConflictDetected(false);
    loadActions();
  };

  const handleDelete = async (actionId: string) => {
    try {
      const { error } = await supabase.from('improvement_actions').delete().eq('id', actionId);
      if (error) throw error;
      toast.success('Action deleted');
      loadActions();
    } catch (error) {
      console.error('Error deleting action:', error);
      toast.error('Failed to delete action');
    }
  };

  const departments = useMemo(() => {
    const set = new Set(actions.map(a => a.department).filter(Boolean));
    return Array.from(set).sort();
  }, [actions]);

  const questionSectionMap = useMemo(() => buildQuestionSectionMap(), []);

  const statusCounts = useMemo(() => {
    const counts = { all: actions.length, Open: 0, 'In Progress': 0, Completed: 0, Overdue: 0 };
    actions.forEach(a => {
      if (a.status === 'Open') counts.Open++;
      else if (a.status === 'In Progress') counts['In Progress']++;
      else if (a.status === 'Completed') counts.Completed++;
      if (isOverdue(a)) counts.Overdue++;
    });
    return counts;
  }, [actions]);

  const filteredActions = useMemo(() => {
    resetPatternUsage();
    const result = actions.filter(action => {
      if (statusFilter === 'Overdue') {
        if (!isOverdue(action)) return false;
      } else if (statusFilter !== 'all' && action.status !== statusFilter) return false;
      if (filterPriority !== 'all' && action.priority !== filterPriority) return false;
      if (filterDepartment !== 'all' && action.department !== filterDepartment) return false;
      if (debouncedSearchQuery) {
        const q = debouncedSearchQuery.toLowerCase();
        if (!action.action_title.toLowerCase().includes(q) && !action.action_description.toLowerCase().includes(q) && !action.department.toLowerCase().includes(q)) return false;
      }
      return true;
    });

    const priorityOrder: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3 };
    result.sort((a, b) => {
      if (sortBy === 'priority') return (priorityOrder[a.priority] ?? 9) - (priorityOrder[b.priority] ?? 9);
      if (sortBy === 'date_asc') return (a.target_completion_date || '9999').localeCompare(b.target_completion_date || '9999');
      if (sortBy === 'date_desc') return (b.target_completion_date || '').localeCompare(a.target_completion_date || '');
      if (sortBy === 'triage') {
        const sa = computeTriageScore(a) ?? -99;
        const sb = computeTriageScore(b) ?? -99;
        return sb - sa;
      }
      return 0;
    });
    return result;
  }, [actions, statusFilter, filterPriority, filterDepartment, debouncedSearchQuery, sortBy]);

  const roadmapColumns = useMemo(() => {
    const columns = [
      { key: 'quick', title: 'Quick Wins (0–30 days)', actions: [] as ActionRecord[] },
      { key: 'process', title: 'Process Changes (31–60 days)', actions: [] as ActionRecord[] },
      { key: 'governance', title: 'Governance & Systems (61–90 days)', actions: [] as ActionRecord[] },
    ];

    filteredActions.forEach((action) => {
      const effort = action.effort_score;
      const impact = action.impact_score;
      if (effort == null || impact == null) columns[1].actions.push(action);
      else if (effort >= 4) columns[2].actions.push(action);
      else if (effort <= 2 && impact >= 3) columns[0].actions.push(action);
      else columns[1].actions.push(action);
    });

    return columns;
  }, [filteredActions]);

  const statusTabs = [
    { key: 'all', label: t('actionPlan.all'), count: statusCounts.all },
    { key: 'Open', label: t('actionPlan.open'), count: statusCounts.Open },
    { key: 'In Progress', label: t('actionPlan.inProgress'), count: statusCounts['In Progress'] },
    { key: 'Completed', label: t('actionPlan.completed'), count: statusCounts.Completed },
    { key: 'Overdue', label: t('actionPlan.overdue'), count: statusCounts.Overdue },
  ];

  if (loading) {
    return (
      <Card className="shadow-card rounded-xl">
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">{t('actionPlan.loading')}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View-only banner */}
      {!canEdit && (
        <Card className="bg-muted/50 shadow-card rounded-xl">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>{t('actionPlan.viewOnly')}</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header bar */}
      <div className="flex flex-wrap items-center gap-3 border-b border-border pb-4">
        <div className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full" style={{ background: `conic-gradient(hsl(var(--brand-600)) ${progressPercent * 3.6}deg, hsl(var(--neutral-200)) 0deg)` }}>
          <div className="grid h-12 w-12 place-items-center rounded-full bg-background text-center">
            <span className="text-sm font-semibold text-foreground leading-none">{completedCount}/{totalCount}</span>
            <span className="text-[10px] text-muted-foreground">{progressPercent}%</span>
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-semibold text-foreground">{t('actionPlan.title')}</h2>
          <p className="text-xs text-muted-foreground">{t('actionPlan.actionsComplete').replace('{completed}', String(completedCount)).replace('{total}', String(totalCount))}</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {[
            { label: t('actionPlan.open'), value: openCount },
            { label: t('actionPlan.inProgress'), value: inProgressCount },
            { label: t('actionPlan.done'), value: completedCount },
            { label: t('actionPlan.overdue'), value: overdueCount, overdue: true },
          ].map((stat) => (
            <div key={stat.label} className={cn('rounded-md border border-border bg-muted/40 px-3 py-2', stat.overdue && 'border-destructive/30 bg-destructive/5')}>
              <span className={cn('text-[11px] text-muted-foreground', stat.overdue && 'text-destructive')}>{stat.label}</span>
              <span className={cn('ml-2 text-sm font-semibold text-foreground', stat.overdue && 'text-destructive')}>{stat.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Command Bar */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="relative flex-shrink-0 w-full max-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={t('actionPlan.search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9 text-sm"
          />
        </div>

        {/* Segmented status tabs */}
        <div className="flex items-center border-b border-border flex-1 min-w-0 overflow-x-auto">
          {statusTabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setStatusFilter(tab.key)}
              className={cn(
                "px-3 py-2 text-sm whitespace-nowrap border-b-2 transition-colors",
                statusFilter === tab.key
                  ? "border-primary text-primary font-medium"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.label} <span className="text-xs ml-1 opacity-70">({tab.count})</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 ml-auto flex-shrink-0">
          <div className="inline-flex h-9 items-center rounded-xl bg-card border p-0.5">
            {([
              { key: 'list', label: t('actionPlan.list'), Icon: ListIcon },
              { key: 'kanban', label: t('actionPlan.kanban'), Icon: LayoutGrid },
              { key: 'roadmap', label: t('actionPlan.roadmap'), Icon: Target },
            ] as const).map(({ key, label, Icon }) => (
              <button
                key={key}
                onClick={() => setViewMode(key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2.5 h-8 rounded-lg text-xs transition-colors",
                  viewMode === key
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                )}
                aria-pressed={viewMode === key}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            ))}
          </div>
          {canCreate && (
            <Button onClick={openCreatePanel} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> {t('actionPlan.addAction')}
            </Button>
          )}

          {/* Filter popover */}
          <Popover open={filterOpen} onOpenChange={setFilterOpen}>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Filter className="h-3.5 w-3.5" /> {t('actionPlan.filter')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-56 p-2 space-y-1" align="end">
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none px-2 py-1.5 rounded hover:bg-muted transition-colors">
                <span className="text-xs font-medium text-foreground">{t('actionPlan.priority')}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-wrap gap-1 px-2 py-1.5">
                {['all', 'critical', 'high', 'medium', 'low'].map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      filterPriority === p ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>
                    {p === 'all' ? t('actionPlan.all') : t(`actionPlan.${p}`)}
                  </button>
                ))}
              </div>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none px-2 py-1.5 rounded hover:bg-muted transition-colors">
                <span className="text-xs font-medium text-foreground">{t('actionPlan.department')}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-wrap gap-1 px-2 py-1.5">
                <button onClick={() => setFilterDepartment('all')}
                  className={cn("px-2 py-1 rounded text-xs border transition-colors",
                    filterDepartment === 'all' ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                  )}>{t('actionPlan.all')}</button>
                {departments.map(d => (
                  <button key={d} onClick={() => setFilterDepartment(d)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      filterDepartment === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>{d}</button>
                ))}
              </div>
            </details>
            <details className="group">
              <summary className="flex items-center justify-between cursor-pointer list-none px-2 py-1.5 rounded hover:bg-muted transition-colors">
                <span className="text-xs font-medium text-foreground">{t('actionPlan.sort')}</span>
                <ChevronDown className="h-3 w-3 text-muted-foreground transition-transform group-open:rotate-180" />
              </summary>
              <div className="flex flex-wrap gap-1 px-2 py-1.5">
                {[
                   { key: 'priority', label: t('actionPlan.priority') },
                   { key: 'date_asc', label: `${t('actionPlan.dueDate')} ↑` },
                   { key: 'date_desc', label: `${t('actionPlan.dueDate')} ↓` },
                   { key: 'triage', label: t('actionPlan.triageScore') },
                ].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      sortBy === s.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>{s.label}</button>
                ))}
              </div>
            </details>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {/* Milestone Banner */}
      {showMilestoneBanner && currentMilestone && (
        <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3 mb-3">
          <div className="flex items-center">
            <Info size={16} className="text-info" />
            <span className="text-[13px] text-foreground font-medium ml-2.5">
              {currentMilestone.message}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {currentMilestone.cta && (
              <button
                type="button"
                onClick={() => window.location.assign('/app/assessment')}
                className="text-xs text-brand-700 border border-brand-700 bg-transparent px-2.5 py-1 rounded-md cursor-pointer font-medium hover:bg-brand-50 transition-colors"
              >
                Schedule Reassessment
              </button>
            )}
            <button
              type="button"
              aria-label="Dismiss milestone"
              onClick={() => setDismissedMilestone(currentMilestone.pct)}
              className="bg-transparent border-none p-1 cursor-pointer text-neutral-500 inline-flex hover:text-neutral-700 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Content area: Kanban, List, or Timeline */}
      {viewMode === 'roadmap' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {roadmapColumns.map((column) => (
            <div key={column.key} className="bg-[hsl(var(--neutral-050))] rounded-xl p-3">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-[hsl(var(--neutral-900))]">{column.title}</h3>
                <span className="text-xs bg-[hsl(var(--brand-100))] text-[hsl(var(--brand-700))] rounded-full px-2 py-0.5">
                  {column.actions.length}
                </span>
              </div>
              <div className="space-y-2">
                {column.actions.length === 0 ? (
                  <p className="text-xs text-[hsl(var(--neutral-500))] text-center py-4">{t('actionPlan.noPhaseActions')}</p>
                ) : column.actions.map((action) => {
                  const linkedKpi = dealershipId ? linkedTrackedKpi(action) : undefined;
                  const roadmapHasDeptNotes = notes && action.department
                    ? Object.entries(notes).some(([qId, text]) =>
                        text.trim() && questionSectionMap[qId] === DEPT_LABEL_TO_SECTION_ID[action.department]
                      )
                    : false;
                  return (
                    <div
                      key={action.id}
                      onClick={() => openEditPanel(action)}
                      className={cn('rounded-lg border border-border border-l-[3px] bg-card p-3 cursor-pointer transition-all shadow-card hover:shadow-elevated space-y-2', getPriorityBorderClass(action.priority))}
                    >
                      <h4 className="text-body-md font-medium text-[hsl(var(--neutral-900))] line-clamp-2">
                        {cleanActionTitle(action.action_title)}
                      </h4>
                      <div className="flex flex-wrap gap-1.5 items-center text-[11px] text-muted-foreground">
                        <span>{action.department}</span>
                        {action.responsible_person && <><span aria-hidden="true">·</span><span>{action.responsible_person}</span></>}
                        {action.target_completion_date && <><span aria-hidden="true">·</span><span>{new Date(action.target_completion_date).toLocaleDateString(language)}</span></>}
                        {isOverdue(action) && <span className="inline-flex items-center gap-1 text-destructive"><Clock className="h-3 w-3" />{t('actionPlan.overdue')}</span>}
                        {action.is_quick_win && (
                          <Badge variant="secondary" className="text-[10px]">
                            {t('actionPlan.quickWin')}
                          </Badge>
                        )}
                        {action.source_visit_id && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {t('actionPlan.fromCoachingVisit')}
                          </Badge>
                        )}
                        {roadmapHasDeptNotes && (
                          <span title={t('actionPlan.fieldNotes')}>
                            <StickyNote className="h-3 w-3 text-warning" />
                          </span>
                        )}
                      </div>
                      <LinkedKpiChip kpiKey={linkedKpi} history={linkedKpi ? kpiTimelines[linkedKpi] : undefined} />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'kanban' ? (
        <KanbanBoard
          actions={filteredActions}
          onStatusChange={handleKanbanStatusChange}
          onActionClick={openEditPanel}
          dealershipId={dealershipId}
          kpiTimelines={kpiTimelines}
        />
      ) : (
        <>
          {filteredActions.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No actions found</p>
              <p className="text-sm mt-1">Generate actions from your assessment or add them manually.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filteredActions.map((action) => {
                const displayTitle = cleanActionTitle(action.action_title);
                const displayDesc = cleanDescription(action.action_description);
                const isCompleted = action.status === 'Completed';
                const linkedKpi = dealershipId ? linkedTrackedKpi(action) : undefined;

                const hasDeptNotes = notes && action.department
                  ? Object.entries(notes).some(([qId, text]) =>
                      text.trim() && questionSectionMap[qId] === DEPT_LABEL_TO_SECTION_ID[action.department]
                    )
                  : false;

                return (
                  <div
                    key={action.id}
                    id={`action-${action.id}`}
                    onClick={() => openEditPanel(action)}
                    className={cn(
                      'group rounded-lg border border-border border-l-[3px] bg-card shadow-card hover:shadow-elevated transition-shadow cursor-pointer',
                      getPriorityBorderClass(action.priority),
                      isCompleted && "opacity-70",
                      focusActionId === action.id && "ring-2 ring-primary ring-offset-2"
                    )}
                  >
                    <div className="flex-1 min-w-0 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <h3 className="text-sm font-semibold text-neutral-900 line-clamp-2 flex-1">{displayTitle}</h3>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {canEdit && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); openEditPanel(action); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      </div>
                      {displayDesc && (
                        <p className="text-xs text-neutral-500 leading-relaxed line-clamp-2 mt-1">{displayDesc}</p>
                      )}
                      <div className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span>{action.department}</span>
                        {action.responsible_person && <><span aria-hidden="true">·</span><span>{action.responsible_person}</span></>}
                        {action.target_completion_date && <><span aria-hidden="true">·</span><span>{new Date(action.target_completion_date).toLocaleDateString(language)}</span></>}
                        {isOverdue(action) && <span className="inline-flex items-center gap-1 text-destructive"><Clock className="h-3 w-3" />{t('actionPlan.overdue')}</span>}
                        {action.is_quick_win && (
                          <Badge variant="secondary" className="text-[10px]">
                            {t('actionPlan.quickWin')}
                          </Badge>
                        )}
                        {action.source_visit_id && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground">
                            {t('actionPlan.fromCoachingVisit')}
                          </Badge>
                        )}
                        {hasDeptNotes && (
                          <span title={t('actionPlan.fieldNotes')}>
                            <StickyNote className="h-3 w-3 text-warning" />
                          </span>
                        )}
                        <LinkedKpiChip kpiKey={linkedKpi} history={linkedKpi ? kpiTimelines[linkedKpi] : undefined} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          {actions.length === PAGE_SIZE * (actionPage + 1) && (
            <Button
              variant="outline"
              onClick={() => setActionPage(p => p + 1)}
              className="w-full mt-4"
            >
              {t('actionPlan.loadMore')}
            </Button>
          )}
        </>
      )}

      {/* Right-side Drawer */}
      <ActionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        action={editingAction}
        mode={sheetMode}
        onSave={handleSheetSave}
        onDelete={canEdit ? handleDelete : undefined}
        readOnly={!canEdit}
        notes={notes}
      />

      {/* Conflict Resolution Dialog */}
      <AlertDialog open={conflictDetected} onOpenChange={setConflictDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" /> Edit Conflict Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action has been modified since you started editing. Review the latest version or overwrite.
            </AlertDialogDescription>
          </AlertDialogHeader>
          {conflictAction && (
            <div className="p-4 bg-muted rounded-md text-sm">
              <p><strong>Latest version:</strong></p>
              <p className="mt-1">{cleanActionTitle(conflictAction.action_title)}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated: {conflictAction.updated_at ? new Date(conflictAction.updated_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
          )}
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setConflictDetected(false); if (conflictAction) setEditingAction(conflictAction); loadActions(); }}>
              Review Latest
            </AlertDialogCancel>
            <AlertDialogAction onClick={async () => {
              if (editingAction) {
                try {
                  await performUpdate(editingAction, null);
                } catch (error) {
                  // Overwrite attempt error handled by performUpdate
                  console.error('Overwrite failed:', error);
                }
              }
              setConflictDetected(false);
            }}>Overwrite</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Regeneration confirmation */}
      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Regenerate Actions?</AlertDialogTitle>
            <AlertDialogDescription>
              Auto-generated actions will be replaced. Manually created actions will be preserved.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setLastGenerated(Date.now()); generateIntelligentActions(true); }}>Regenerate</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
