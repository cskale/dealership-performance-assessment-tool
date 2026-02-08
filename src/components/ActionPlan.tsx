import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { 
  Sheet, 
  SheetContent, 
  SheetDescription, 
  SheetHeader, 
  SheetTitle,
  SheetFooter 
} from '@/components/ui/sheet';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { 
  CheckCircle2, Circle, Clock, AlertCircle, Plus, Sparkles, 
  Loader2, Pencil, RefreshCw, AlertTriangle, Info, ChevronDown,
  ChevronUp, User, Calendar, Target
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { questionnaire } from '@/data/questionnaire';
import { 
  analyzeAssessmentAnswers, 
  generateActionsFromContext, 
  formatActionsForDatabase 
} from '@/utils/actionGenerator';
import { getHumanRationale, priorityDisplay, statusDisplay } from '@/lib/actionRationaleMap';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface Action {
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
  updated_at?: string;
  // For tracking conflicts
  _loadedAt?: string;
}

interface EditFormState {
  action_title: string;
  action_description: string;
  priority: Action['priority'];
  status: Action['status'];
  responsible_person: string;
  target_completion_date: string;
}

export function ActionPlan({ assessmentId }: { assessmentId?: string }) {
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'priority' | 'status' | 'date'>('priority');
  
  // Edit state
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [editForm, setEditForm] = useState<EditFormState>({
    action_title: '',
    action_description: '',
    priority: 'medium',
    status: 'Open',
    responsible_person: '',
    target_completion_date: ''
  });
  const [saving, setSaving] = useState(false);
  const [conflictDetected, setConflictDetected] = useState(false);
  const [conflictAction, setConflictAction] = useState<Action | null>(null);
  
  // New action form state
  const [newAction, setNewAction] = useState({
    department: '',
    priority: 'medium' as Action['priority'],
    action_title: '',
    action_description: '',
    responsible_person: '',
    target_completion_date: '',
    support_required_from: '',
    kpis_linked_to: ''
  });

  // Calculate progress stats
  const completedCount = actions.filter(a => a.status === 'Completed').length;
  const totalCount = actions.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;
  const overdueCount = actions.filter(a => {
    if (!a.target_completion_date || a.status === 'Completed') return false;
    return new Date(a.target_completion_date) < new Date();
  }).length;

  useEffect(() => {
    loadActions();
  }, [user, assessmentId]);

  const loadActions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('improvement_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      // Add load timestamp for conflict detection
      const actionsWithTimestamp = (data || []).map(a => ({
        ...a,
        _loadedAt: new Date().toISOString()
      }));
      setActions(actionsWithTimestamp as unknown as Action[]);
    } catch (error) {
      console.error('Error loading actions:', error);
      toast.error('Failed to load action plans');
    } finally {
      setLoading(false);
    }
  };

  const generateIntelligentActions = async () => {
    if (!user) return;
    
    setGenerating(true);
    try {
      let targetAssessmentId = assessmentId;
      
      if (!targetAssessmentId) {
        const { data: assessments, error: assessmentError } = await supabase
          .from('assessments')
          .select('id, answers')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        if (assessmentError || !assessments) {
          toast.error('No assessment found. Please complete an assessment first.');
          setGenerating(false);
          return;
        }
        
        targetAssessmentId = assessments.id;
      }

      const { data: assessment, error: fetchError } = await supabase
        .from('assessments')
        .select('answers')
        .eq('id', targetAssessmentId)
        .single();

      if (fetchError || !assessment) {
        toast.error('Failed to load assessment data');
        setGenerating(false);
        return;
      }

      const weakPoints = analyzeAssessmentAnswers(
        questionnaire.sections,
        assessment.answers as Record<string, number>
      );

      if (weakPoints.length === 0) {
        toast.success('Great! No critical improvement areas found.');
        setGenerating(false);
        return;
      }

      // P1.5: Dynamic action count (3-7 based on severity)
      const maxActions = Math.min(7, Math.max(3, weakPoints.length));
      const generatedActions = generateActionsFromContext(weakPoints, maxActions);
      const formattedActions = formatActionsForDatabase(
        generatedActions,
        user.id,
        targetAssessmentId
      );

      const { data: insertedActions, error: insertError } = await supabase
        .from('improvement_actions')
        .insert(formattedActions as any)
        .select();

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

  const addManualAction = async () => {
    if (!user) return;
    if (!newAction.action_title || !newAction.department) {
      toast.error('Please fill in required fields: Title and Department');
      return;
    }

    try {
      const actionData = {
        user_id: user.id,
        assessment_id: assessmentId || null,
        department: newAction.department,
        priority: newAction.priority,
        action_title: newAction.action_title,
        action_description: newAction.action_description,
        status: 'Open',
        responsible_person: newAction.responsible_person || null,
        target_completion_date: newAction.target_completion_date || null,
        support_required_from: newAction.support_required_from
          .split(',').map(s => s.trim()).filter(Boolean),
        kpis_linked_to: newAction.kpis_linked_to
          .split(',').map(s => s.trim()).filter(Boolean)
      };

      const { error } = await supabase
        .from('improvement_actions')
        .insert([actionData as any]);

      if (error) throw error;

      toast.success('Action added successfully');
      setShowAddAction(false);
      setNewAction({
        department: '',
        priority: 'medium',
        action_title: '',
        action_description: '',
        responsible_person: '',
        target_completion_date: '',
        support_required_from: '',
        kpis_linked_to: ''
      });
      loadActions();
    } catch (error) {
      console.error('Error adding action:', error);
      toast.error('Failed to add action');
    }
  };

  // P1.3: Open edit panel
  const openEditPanel = (action: Action) => {
    setEditingAction(action);
    setEditForm({
      action_title: action.action_title,
      action_description: action.action_description || '',
      priority: action.priority,
      status: action.status,
      responsible_person: action.responsible_person || '',
      target_completion_date: action.target_completion_date || ''
    });
    setConflictDetected(false);
  };

  // P1.3: Save with conflict detection
  const saveEditedAction = async (forceOverwrite = false) => {
    if (!editingAction || !user) return;
    
    setSaving(true);
    try {
      // Check for conflicts (optimistic locking)
      if (!forceOverwrite && editingAction.updated_at) {
        const { data: currentAction, error: fetchError } = await supabase
          .from('improvement_actions')
          .select('*')
          .eq('id', editingAction.id)
          .single();

        if (fetchError) throw fetchError;

        // Cast to access updated_at since types may not be updated yet
        const currentData = currentAction as unknown as { updated_at?: string };
        
        // Compare timestamps
        if (currentData?.updated_at) {
          const serverTime = new Date(currentData.updated_at).getTime();
          const loadedTime = new Date(editingAction.updated_at).getTime();
          
          if (serverTime > loadedTime) {
            // Conflict detected - reload with full data
            setConflictAction(currentAction as unknown as Action);
            setConflictDetected(true);
            setSaving(false);
            return;
          }
        }
      }

      // Perform update
      const { error: updateError } = await supabase
        .from('improvement_actions')
        .update({
          action_title: editForm.action_title,
          action_description: editForm.action_description,
          priority: editForm.priority,
          status: editForm.status,
          responsible_person: editForm.responsible_person || null,
          target_completion_date: editForm.target_completion_date || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', editingAction.id);

      if (updateError) throw updateError;

      toast.success('Action updated successfully');
      setEditingAction(null);
      setConflictDetected(false);
      setConflictAction(null);
      loadActions();
    } catch (error) {
      console.error('Error updating action:', error);
      toast.error('Failed to update action');
    } finally {
      setSaving(false);
    }
  };

  const updateActionStatus = async (actionId: string, newStatus: Action['status']) => {
    try {
      const { error } = await supabase
        .from('improvement_actions')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', actionId);

      if (error) throw error;

      setActions(actions.map(action => 
        action.id === actionId ? { ...action, status: newStatus } : action
      ));
      toast.success('Status updated');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getPriorityConfig = (priority: string) => {
    return priorityDisplay[priority as keyof typeof priorityDisplay] || priorityDisplay.medium;
  };

  const getStatusConfig = (status: string) => {
    return statusDisplay[status as keyof typeof statusDisplay] || statusDisplay.Open;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed': return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case 'In Progress': return <Clock className="h-5 w-5 text-blue-600" />;
      default: return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  // Filter and sort actions
  const filteredActions = actions
    .filter(action => {
      if (filterStatus !== 'all' && action.status !== filterStatus) return false;
      if (filterPriority !== 'all' && action.priority !== filterPriority) return false;
      return true;
    })
    .sort((a, b) => {
      const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      const statusOrder = { 'Open': 0, 'In Progress': 1, 'Completed': 2 };
      
      if (sortBy === 'priority') {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      if (sortBy === 'status') {
        return statusOrder[a.status] - statusOrder[b.status];
      }
      if (sortBy === 'date' && a.target_completion_date && b.target_completion_date) {
        return new Date(a.target_completion_date).getTime() - new Date(b.target_completion_date).getTime();
      }
      return 0;
    });

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
    <div className="space-y-6">
      {/* P3.3: Progress Summary Card */}
      {totalCount > 0 && (
        <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <span className="font-medium">
                    {completedCount} of {totalCount} actions completed
                  </span>
                </div>
                {overdueCount > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    {overdueCount} overdue
                  </Badge>
                )}
              </div>
              <div className="w-48">
                <Progress value={progressPercent} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Action Plan</CardTitle>
              <CardDescription>
                Strategic initiatives to improve dealership performance
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={generateIntelligentActions}
                disabled={generating}
                variant="default"
              >
                {generating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Generate Actions
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowAddAction(!showAddAction)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Action
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Manual Action Form */}
          {showAddAction && (
            <Card className="border-2 border-dashed border-primary/30">
              <CardHeader className="pb-4">
                <CardTitle className="text-base">Add New Action</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Department *</Label>
                    <Input
                      value={newAction.department}
                      onChange={(e) => setNewAction({ ...newAction, department: e.target.value })}
                      placeholder="e.g., New Vehicle Sales"
                    />
                  </div>
                  <div>
                    <Label>Priority</Label>
                    <Select
                      value={newAction.priority}
                      onValueChange={(value: Action['priority']) => 
                        setNewAction({ ...newAction, priority: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label>Action Title *</Label>
                  <Input
                    value={newAction.action_title}
                    onChange={(e) => setNewAction({ ...newAction, action_title: e.target.value })}
                    placeholder="Brief, actionable title"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newAction.action_description}
                    onChange={(e) => setNewAction({ ...newAction, action_description: e.target.value })}
                    placeholder="Detailed description and expected outcomes"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Responsible Person</Label>
                    <Input
                      value={newAction.responsible_person}
                      onChange={(e) => setNewAction({ ...newAction, responsible_person: e.target.value })}
                      placeholder="Person name"
                    />
                  </div>
                  <div>
                    <Label>Target Date</Label>
                    <Input
                      type="date"
                      value={newAction.target_completion_date}
                      onChange={(e) => setNewAction({ ...newAction, target_completion_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addManualAction}>Add Action</Button>
                  <Button variant="outline" onClick={() => setShowAddAction(false)}>Cancel</Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters & Sort */}
          <div className="flex flex-wrap gap-3">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={(v) => setSortBy(v as typeof sortBy)}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="priority">Priority</SelectItem>
                <SelectItem value="status">Status</SelectItem>
                <SelectItem value="date">Due Date</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions List */}
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p className="font-medium">No actions found</p>
              <p className="text-sm mt-1">Generate actions from your assessment or add them manually.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredActions.map((action) => {
                const priorityConfig = getPriorityConfig(action.priority);
                const statusConfig = getStatusConfig(action.status);
                // P1.2: Get human-readable rationale
                const rationale = getHumanRationale(action.department);

                return (
                  <Card key={action.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="py-4">
                      <div className="flex items-start gap-4">
                        {/* Status Icon */}
                        <div className="mt-1">
                          {getStatusIcon(action.status)}
                        </div>

                        {/* Main Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <h3 className="font-semibold text-foreground leading-tight">
                                {action.action_title}
                              </h3>
                              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <Badge className={priorityConfig.color}>
                                  {priorityConfig.label}
                                </Badge>
                                <Badge variant="secondary">{action.department}</Badge>
                                {action.responsible_person && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <User className="h-3 w-3" />
                                    {action.responsible_person}
                                  </span>
                                )}
                                {action.target_completion_date && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {new Date(action.target_completion_date).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => openEditPanel(action)}
                                className="h-8 w-8 p-0"
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Select
                                value={action.status}
                                onValueChange={(value) => updateActionStatus(action.id, value as Action['status'])}
                              >
                                <SelectTrigger className="w-[130px] h-8">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Open">Open</SelectItem>
                                  <SelectItem value="In Progress">In Progress</SelectItem>
                                  <SelectItem value="Completed">Completed</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>

                          {/* Description & Details */}
                          {action.action_description && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                              {action.action_description}
                            </p>
                          )}

                          {/* P1.2: Human-readable rationale */}
                          <Collapsible className="mt-3">
                            <CollapsibleTrigger className="flex items-center gap-1 text-xs text-primary hover:text-primary/80">
                              <Info className="h-3 w-3" />
                              View analysis
                              <ChevronDown className="h-3 w-3" />
                            </CollapsibleTrigger>
                            <CollapsibleContent className="mt-2 p-3 bg-muted/50 rounded-md">
                              <p className="text-sm font-medium text-foreground">{rationale.title}</p>
                              <p className="text-xs text-muted-foreground mt-1">{rationale.summary}</p>
                              <p className="text-xs text-primary mt-2">
                                <strong>Recommendation:</strong> {rationale.recommendation}
                              </p>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* P1.3: Edit Sheet */}
      <Sheet open={!!editingAction} onOpenChange={(open) => !open && setEditingAction(null)}>
        <SheetContent className="sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Edit Action</SheetTitle>
            <SheetDescription>
              Update the details for this improvement action
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 py-6">
            <div>
              <Label>Title</Label>
              <Input
                value={editForm.action_title}
                onChange={(e) => setEditForm({ ...editForm, action_title: e.target.value })}
              />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea
                value={editForm.action_description}
                onChange={(e) => setEditForm({ ...editForm, action_description: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Priority</Label>
                <Select
                  value={editForm.priority}
                  onValueChange={(v) => setEditForm({ ...editForm, priority: v as Action['priority'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Status</Label>
                <Select
                  value={editForm.status}
                  onValueChange={(v) => setEditForm({ ...editForm, status: v as Action['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Open">Open</SelectItem>
                    <SelectItem value="In Progress">In Progress</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Responsible Person</Label>
              <Input
                value={editForm.responsible_person}
                onChange={(e) => setEditForm({ ...editForm, responsible_person: e.target.value })}
                placeholder="Assign to..."
              />
            </div>

            <div>
              <Label>Target Completion Date</Label>
              <Input
                type="date"
                value={editForm.target_completion_date}
                onChange={(e) => setEditForm({ ...editForm, target_completion_date: e.target.value })}
              />
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={() => setEditingAction(null)}>
              Cancel
            </Button>
            <Button onClick={() => saveEditedAction()} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* P1.3: Conflict Resolution Dialog */}
      <AlertDialog open={conflictDetected} onOpenChange={setConflictDetected}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-warning" />
              Edit Conflict Detected
            </AlertDialogTitle>
            <AlertDialogDescription>
              This action was updated by another user since you started editing.
              Would you like to review their changes or overwrite with yours?
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          {conflictAction && (
            <div className="p-4 bg-muted rounded-md text-sm">
              <p><strong>Current version:</strong></p>
              <p className="mt-1">{conflictAction.action_title}</p>
              <p className="text-xs text-muted-foreground mt-2">
                Updated: {conflictAction.updated_at ? new Date(conflictAction.updated_at).toLocaleString() : 'Unknown'}
              </p>
            </div>
          )}

          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              // Reload with latest data
              if (conflictAction) {
                setEditingAction(conflictAction);
                setEditForm({
                  action_title: conflictAction.action_title,
                  action_description: conflictAction.action_description || '',
                  priority: conflictAction.priority,
                  status: conflictAction.status,
                  responsible_person: conflictAction.responsible_person || '',
                  target_completion_date: conflictAction.target_completion_date || ''
                });
              }
              setConflictDetected(false);
            }}>
              Review Changes
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => saveEditedAction(true)}>
              Overwrite Anyway
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
