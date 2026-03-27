import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  CheckCircle2, Circle, Clock, Plus, Sparkles, Loader2, Pencil,
  AlertTriangle, Target, Eye, Search, Filter, Users, X, LayoutList, GanttChart, LayoutGrid, CalendarIcon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { toast } from 'sonner';
import { questionnaire } from '@/data/questionnaire';
import { generateActionsFromAssessment, formatActionsForDatabaseInsert } from '@/lib/signalEngine';
import { cleanActionTitle, priorityDisplay, resetPatternUsage } from '@/lib/actionRationaleMap';
import { cleanDescription } from '@/lib/cleanDescription';
import { ActionSheet } from './ActionSheet';
import { OwnerLoadPanel } from './action-plan/OwnerLoadPanel';
import { TimelineView } from './action-plan/TimelineView';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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
}

function computeTriageScore(action: ActionRecord): number | null {
  if (action.impact_score == null || action.effort_score == null || action.urgency_score == null) return null;
  return (action.impact_score * 2) + (action.urgency_score * 2) - action.effort_score;
}

function getTriageBadge(score: number | null): { label: string; className: string } | null {
  if (score == null) return null;
  if (score >= 14) return { label: 'Act Now', className: 'bg-destructive/10 text-destructive border-destructive/20' };
  if (score >= 10) return { label: 'Priority', className: 'bg-amber-500/10 text-amber-600 border-amber-200' };
  if (score >= 6) return { label: 'Plan', className: 'bg-blue-500/10 text-blue-600 border-blue-200' };
  return { label: 'Backlog', className: 'bg-muted text-muted-foreground border-border' };
}

function isOverdue(action: ActionRecord): boolean {
  if (!action.target_completion_date || action.status === 'Completed') return false;
  return new Date(action.target_completion_date) < new Date(new Date().toDateString());
}

const STATUS_STRIPE: Record<string, string> = {
  'Open': 'bg-muted-foreground',
  'In Progress': 'bg-warning',
  'Completed': 'bg-success',
};

export function ActionPlan({ assessmentId }: { assessmentId?: string }) {
  const { user } = useAuth();
  const { currentOrganization, canPerformAction } = useMultiTenant();
  const { t, language } = useLanguage();
  const [actions, setActions] = useState<ActionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterDepartment, setFilterDepartment] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('priority');
  const [filterOpen, setFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'kanban' | 'list' | 'timeline'>('kanban');
  const [lastGenerated, setLastGenerated] = useState<number | null>(null);
  const [actionPage, setActionPage] = useState(0);
  const PAGE_SIZE = 50;

  const [editingAction, setEditingAction] = useState<ActionRecord | null>(null);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('edit');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [conflictAction, setConflictAction] = useState<ActionRecord | null>(null);
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
  const [ownerPanelOpen, setOwnerPanelOpen] = useState(false);
  const [ownerFilter, setOwnerFilter] = useState<string | null>(null);

  const canEdit = canPerformAction('update');
  const canCreate = canPerformAction('create');

  const completedCount = actions.filter(a => a.status === 'Completed').length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = actions.filter(a => isOverdue(a)).length;

  const loadActions = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      let query = supabase.from('improvement_actions').select('*').order('created_at', { ascending: false });
      if (currentOrganization?.id) {
        query = query.eq('organization_id', currentOrganization.id);
      } else {
        query = query.eq('user_id', user.id);
      }
      if (assessmentId) query = query.eq('assessment_id', assessmentId);
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
      const { data: assessment } = await supabase.from('assessments').select('answers').eq('id', targetAssessmentId).single();
      if (!assessment) { toast.error('Failed to load assessment data'); setGenerating(false); return; }
      const questionWeights: Record<string, number> = {};
      for (const section of questionnaire.sections) {
        for (const question of section.questions) questionWeights[question.id] = question.weight;
      }
      const bm = (currentOrganization as any)?.business_model as string | undefined;
      const { actions: generatedActions } = generateActionsFromAssessment(assessment.answers as Record<string, number>, questionWeights, undefined, undefined, bm);
      if (generatedActions.length === 0) { toast.success('No critical improvement areas found.'); setGenerating(false); return; }
      const actionsWithOrg = formatActionsForDatabaseInsert(generatedActions, user.id, targetAssessmentId!, currentOrganization?.id || '');

      // Insert actions
      const { data: insertedActions, error: insertError } = await supabase.from('improvement_actions').insert(actionsWithOrg as any).select();
      if (insertError) throw insertError;

      // Write audit log entries for AI-generated actions
      if (insertedActions && insertedActions.length > 0 && currentOrganization?.id) {
        const auditRows = insertedActions.map((a: any) => ({
          action_id: a.id,
          organization_id: currentOrganization.id,
          changed_by: user.id,
          field_name: 'created',
          new_value: 'Action created by AI generation',
        }));
        await supabase.from('action_audit_log').insert(auditRows);
      }

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
          action_title: formData.action_title || '',
          action_description: formData.action_description || '',
          status: formData.status || 'Open',
          responsible_person: formData.responsible_person || null,
          target_completion_date: formData.target_completion_date || null,
          support_required_from: formData.support_required_from || [],
          kpis_linked_to: formData.kpis_linked_to || [],
          impact_score: formData.impact_score ?? null,
          effort_score: formData.effort_score ?? null,
          urgency_score: formData.urgency_score ?? null,
        };
        const { data: inserted, error } = await supabase.from('improvement_actions').insert([actionData as any]).select();
        if (error) throw error;

        // Audit log for manual create
        if (inserted?.[0] && currentOrganization?.id) {
          await supabase.from('action_audit_log').insert({
            action_id: inserted[0].id,
            organization_id: currentOrganization.id,
            changed_by: user.id,
            field_name: 'created',
            new_value: 'Action created',
          });
        }

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

  const TRACKED_FIELDS = [
    'action_title', 'action_description', 'status', 'priority',
    'responsible_person', 'target_completion_date', 'department',
    'impact_score', 'effort_score', 'urgency_score', 'support_required_from'
  ];

  const performUpdate = async (formData: Partial<ActionRecord>, original: ActionRecord | null) => {
    const { error } = await supabase.from('improvement_actions').update({
      action_title: formData.action_title,
      action_description: formData.action_description,
      department: formData.department,
      priority: formData.priority,
      status: formData.status,
      responsible_person: formData.responsible_person || null,
      target_completion_date: formData.target_completion_date || null,
      support_required_from: formData.support_required_from || [],
      kpis_linked_to: formData.kpis_linked_to || [],
      impact_score: formData.impact_score ?? null,
      effort_score: formData.effort_score ?? null,
      urgency_score: formData.urgency_score ?? null,
      updated_at: new Date().toISOString()
    }).eq('id', formData.id!);
    if (error) throw error;

    // Write audit log entries for changed fields
    if (original && currentOrganization?.id && user) {
      const auditRows: any[] = [];
      for (const field of TRACKED_FIELDS) {
        const oldVal = String((original as any)[field] ?? '');
        const newVal = String((formData as any)[field] ?? '');
        if (oldVal !== newVal) {
          auditRows.push({
            action_id: formData.id,
            organization_id: currentOrganization.id,
            changed_by: user.id,
            field_name: field,
            old_value: oldVal || null,
            new_value: newVal,
          });
        }
      }
      if (auditRows.length > 0) {
        await supabase.from('action_audit_log').insert(auditRows);
      }
    }

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
      if (ownerFilter !== null) {
        const owner = action.responsible_person || 'Unassigned';
        if (owner !== ownerFilter) return false;
      }
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
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
  }, [actions, statusFilter, filterPriority, filterDepartment, searchQuery, sortBy, ownerFilter]);

  const statusTabs = [
    { key: 'all', label: 'All', count: statusCounts.all },
    { key: 'Open', label: 'Open', count: statusCounts.Open },
    { key: 'In Progress', label: 'In Progress', count: statusCounts['In Progress'] },
    { key: 'Completed', label: 'Completed', count: statusCounts.Completed },
    { key: 'Overdue', label: 'Overdue', count: statusCounts.Overdue },
  ];

  const handleOwnerFilter = (owner: string) => {
    setOwnerFilter(owner === '' ? null : owner);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
            <p className="text-muted-foreground">Loading action plan...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* View-only banner */}
      {!canEdit && (
        <Card className="bg-muted/50 border-muted">
          <CardContent className="py-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Eye className="h-4 w-4" />
              <span>Showing actions in view-only mode.</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Header bar */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="text-lg font-semibold text-foreground">Action Plan</h2>
          {totalCount > 0 && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 min-w-[180px]">
                <Progress value={progressPercent} className="h-2 flex-1" />
                <span className="text-xs text-muted-foreground whitespace-nowrap">
                  {completedCount}/{totalCount}
                </span>
              </div>
              {overdueCount > 0 && (
                <Badge variant="destructive" className="text-xs flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {overdueCount} overdue
                </Badge>
              )}
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={() => setOwnerPanelOpen(true)} title="Owner Workload">
            <Users className="h-4 w-4" />
          </Button>
          {/* View toggle */}
          <div className="flex rounded-lg border overflow-hidden">
            <button onClick={() => setViewMode('kanban')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'kanban' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="Board view">
              <LayoutGrid className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode('list')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'list' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="List view">
              <LayoutList className="h-3.5 w-3.5" />
            </button>
            <button onClick={() => setViewMode('timeline')}
              className={cn("px-2 py-1.5 transition-colors",
                viewMode === 'timeline' ? "bg-primary text-primary-foreground" : "bg-card text-muted-foreground hover:bg-muted"
              )} title="Timeline view">
              <GanttChart className="h-3.5 w-3.5" />
            </button>
          </div>
          {canEdit && (
            <Button onClick={handleGenerateClick} disabled={generating || (lastGenerated !== null && Date.now() - lastGenerated < 30000)} size="sm">
              {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
              {generating ? 'Generating...' : 'Generate Actions'}
            </Button>
          )}
          {canCreate && (
            <Button onClick={openCreatePanel} variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" /> Add Action
            </Button>
          )}
        </div>
      </div>

      {/* Command Bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-shrink-0 w-56">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search actions..."
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

        {/* Filter popover */}
        <Popover open={filterOpen} onOpenChange={setFilterOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Filter className="h-3.5 w-3.5" /> Filter
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-56 p-3 space-y-3" align="end">
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Priority</label>
              <div className="flex flex-wrap gap-1">
                {['all', 'critical', 'high', 'medium', 'low'].map(p => (
                  <button key={p} onClick={() => setFilterPriority(p)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      filterPriority === p ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>
                    {p === 'all' ? 'All' : p.charAt(0).toUpperCase() + p.slice(1)}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Department</label>
              <div className="flex flex-wrap gap-1">
                <button onClick={() => setFilterDepartment('all')}
                  className={cn("px-2 py-1 rounded text-xs border transition-colors",
                    filterDepartment === 'all' ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                  )}>All</button>
                {departments.map(d => (
                  <button key={d} onClick={() => setFilterDepartment(d)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      filterDepartment === d ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>{d}</button>
                ))}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-muted-foreground">Sort</label>
              <div className="flex flex-wrap gap-1">
                {[
                  { key: 'priority', label: 'Priority' },
                  { key: 'date_asc', label: 'Due Date ↑' },
                  { key: 'date_desc', label: 'Due Date ↓' },
                  { key: 'triage', label: 'Triage Score' },
                ].map(s => (
                  <button key={s.key} onClick={() => setSortBy(s.key)}
                    className={cn("px-2 py-1 rounded text-xs border transition-colors",
                      sortBy === s.key ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"
                    )}>{s.label}</button>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Owner filter indicator */}
      {ownerFilter !== null && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs gap-1.5">
            Filtered by: {ownerFilter}
            <button onClick={() => setOwnerFilter(null)}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        </div>
      )}

      {/* Content area: Kanban, List, or Timeline */}
      {viewMode === 'timeline' ? (
        <TimelineView actions={filteredActions} onActionClick={openEditPanel} />
      ) : viewMode === 'kanban' ? (
        /* Kanban Board */
        (() => {
          const columns: { key: string; label: string; actions: typeof filteredActions }[] = [
            { key: 'Open', label: 'Open', actions: filteredActions.filter(a => a.status === 'Open') },
            { key: 'In Progress', label: 'In Progress', actions: filteredActions.filter(a => a.status === 'In Progress') },
            { key: 'Completed', label: 'Completed', actions: filteredActions.filter(a => a.status === 'Completed') },
          ];

          if (filteredActions.length === 0) {
            return (
              <div className="text-center py-16 text-muted-foreground">
                <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
                <p className="font-medium">No actions found</p>
                <p className="text-sm mt-1">Generate actions from your assessment or add them manually.</p>
              </div>
            );
          }

          return (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[400px]">
              {columns.map(col => (
                <div key={col.key} className="bg-secondary rounded-xl p-3">
                  <div className="flex items-center justify-between mb-3 px-1">
                    <span className="text-sm font-semibold text-foreground">{col.label}</span>
                    <span className="text-xs text-muted-foreground bg-muted rounded-full px-2 py-0.5">{col.actions.length}</span>
                  </div>
                  <div className="space-y-2">
                    {col.actions.map(action => {
                      const overdue = isOverdue(action);
                      const priorityBorderColor = action.priority === 'critical' ? 'border-l-destructive'
                        : action.priority === 'high' ? 'border-l-warning'
                        : action.priority === 'medium' ? 'border-l-primary'
                        : 'border-l-muted-foreground';

                      return (
                        <div
                          key={action.id}
                          onClick={() => openEditPanel(action)}
                          className={cn(
                            "bg-white border border-border/50 rounded-lg p-3 cursor-pointer transition-all hover:shadow-md hover:-translate-y-px border-l-[3px]",
                            priorityBorderColor,
                            action.status === 'Completed' && "opacity-70"
                          )}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1.5">
                            <h4 className="text-sm font-medium text-foreground line-clamp-2 flex-1">
                              {cleanActionTitle(action.action_title)}
                            </h4>
                            <Badge variant="outline" className="text-[10px] flex-shrink-0 px-1.5 py-0">
                              {action.department}
                            </Badge>
                          </div>
                          <div className="flex items-center justify-between mt-2">
                            {action.target_completion_date ? (
                              <span className={cn("text-xs flex items-center gap-1", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                                <CalendarIcon className="h-3 w-3" />
                                {new Date(action.target_completion_date).toLocaleDateString()}
                              </span>
                            ) : <span />}
                            {action.responsible_person && (
                              <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium" title={action.responsible_person}>
                                {action.responsible_person.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          );
        })()
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
                const priorityConfig = priorityDisplay[action.priority as keyof typeof priorityDisplay] || priorityDisplay.medium;
                const displayTitle = cleanActionTitle(action.action_title);
                const displayDesc = cleanDescription(action.action_description);
                const overdue = isOverdue(action);
                const triageScore = computeTriageScore(action);
                const triageBadge = getTriageBadge(triageScore);
                const linkedKpisCount = Array.isArray(action.linked_kpis) ? action.linked_kpis.length :
                  (action.linked_kpis && typeof action.linked_kpis === 'object' ? Object.keys(action.linked_kpis).length : 0);
                const kpiCount = linkedKpisCount || (action.kpis_linked_to?.length || 0);
                const isCompleted = action.status === 'Completed';

                return (
                  <div
                    key={action.id}
                    onClick={() => openEditPanel(action)}
                    className={cn(
                      "group relative flex gap-0 rounded-lg border bg-card cursor-pointer transition-all hover:shadow-md hover:-translate-y-px",
                      isCompleted && "opacity-70"
                    )}
                  >
                    {/* Status stripe */}
                    <div className={cn("w-1 rounded-l-lg flex-shrink-0",
                      overdue ? "bg-destructive" : (STATUS_STRIPE[action.status] || 'bg-muted-foreground')
                    )} />

                    <div className="flex-1 p-4 min-w-0">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <h3 className="font-medium text-sm text-foreground truncate">{displayTitle}</h3>
                          </div>
                          <p className="text-xs text-muted-foreground line-clamp-1 mb-2">{displayDesc}</p>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs border border-border text-muted-foreground">
                              {action.department}
                            </span>
                            <Badge className={cn("text-xs", priorityConfig.color)}>{priorityConfig.label}</Badge>
                            {triageBadge && (
                              <Badge variant="outline" className={cn("text-xs", triageBadge.className)}>{triageBadge.label}</Badge>
                            )}
                            {kpiCount > 0 && (
                              <span className="text-xs text-muted-foreground flex items-center gap-1">
                                <Target className="h-3 w-3" /> {kpiCount} KPIs
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                          {action.responsible_person && (
                            <div className="flex items-center gap-1.5">
                              <div className="h-5 w-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium">
                                {action.responsible_person.split(' ').map(n => n[0]).join('').slice(0, 2)}
                              </div>
                              <span className="text-xs text-muted-foreground">{action.responsible_person}</span>
                            </div>
                          )}
                          {action.target_completion_date && (
                            <span className={cn("text-xs", overdue ? "text-destructive font-medium" : "text-muted-foreground")}>
                              {overdue && <AlertTriangle className="h-3 w-3 inline mr-1" />}
                              {new Date(action.target_completion_date).toLocaleDateString()}
                            </span>
                          )}
                          {canEdit && (
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={(e) => { e.stopPropagation(); openEditPanel(action); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
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
              Load More Actions
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
      />

      {/* Owner Load Panel */}
      <OwnerLoadPanel
        open={ownerPanelOpen}
        onOpenChange={setOwnerPanelOpen}
        actions={actions}
        onFilterByOwner={handleOwnerFilter}
        activeOwnerFilter={ownerFilter}
      />

      {/* Conflict Resolution Dialog */}
      <AlertDialog open={conflictDetected} onOpenChange={setConflictDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" /> Edit Conflict Detected
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
