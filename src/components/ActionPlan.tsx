import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CheckCircle2, Circle, Clock, AlertCircle, Plus, Sparkles, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { questionnaire } from '@/data/questionnaire';
import { 
  analyzeAssessmentAnswers, 
  generateActionsFromContext, 
  formatActionsForDatabase 
} from '@/utils/actionGenerator';

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
}

export function ActionPlan({ assessmentId }: { assessmentId?: string }) {
  const { user } = useAuth();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [showAddAction, setShowAddAction] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
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

  useEffect(() => {
    loadActions();
  }, [user, assessmentId]);

  const loadActions = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('action_plans')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      // If assessmentId provided, filter by it
      if (assessmentId) {
        query = query.eq('assessment_id', assessmentId);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActions(data || []);
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
      // Get the latest assessment or use provided assessmentId
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

      // Get assessment data
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

      // Analyze answers and generate actions
      const weakPoints = analyzeAssessmentAnswers(
        questionnaire.sections,
        assessment.answers as Record<string, number>
      );

      if (weakPoints.length === 0) {
        toast.success('Great! No critical improvement areas found.');
        setGenerating(false);
        return;
      }

      const generatedActions = generateActionsFromContext(weakPoints, 10);
      const formattedActions = formatActionsForDatabase(
        generatedActions,
        user.id,
        targetAssessmentId
      );

      // Insert actions into database
      const { data: insertedActions, error: insertError } = await supabase
        .from('action_plans')
        .insert(formattedActions)
        .select();

      if (insertError) throw insertError;

      toast.success(`Generated ${insertedActions?.length || 0} intelligent action items!`);
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
          .split(',')
          .map(s => s.trim())
          .filter(Boolean),
        kpis_linked_to: newAction.kpis_linked_to
          .split(',')
          .map(s => s.trim())
          .filter(Boolean)
      };

      const { error } = await supabase
        .from('action_plans')
        .insert([actionData]);

      if (error) throw error;

      toast.success('Action added successfully!');
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

  const updateActionStatus = async (actionId: string, newStatus: Action['status']) => {
    try {
      const { error } = await supabase
        .from('action_plans')
        .update({ status: newStatus })
        .eq('id', actionId);

      if (error) throw error;

      setActions(actions.map(action => 
        action.id === actionId ? { ...action, status: newStatus } : action
      ));
      toast.success('Status updated successfully');
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critical':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      case 'medium':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <Clock className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'Completed':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'In Progress':
        return <Clock className="h-5 w-5 text-blue-500" />;
      default:
        return <Circle className="h-5 w-5 text-gray-400" />;
    }
  };

  const filteredActions = actions.filter(action => {
    if (filterStatus !== 'all' && action.status !== filterStatus) return false;
    if (filterPriority !== 'all' && action.priority !== filterPriority) return false;
    return true;
  });

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Action Plan</CardTitle>
              <CardDescription>
                Strategic initiatives to improve your dealership performance
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
                    Generate AI Actions
                  </>
                )}
              </Button>
              <Button
                onClick={() => setShowAddAction(!showAddAction)}
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Manual Action
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Add Manual Action Form */}
          {showAddAction && (
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle>Add New Action</CardTitle>
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
                    <Label>Priority *</Label>
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
                    placeholder="Brief action title"
                  />
                </div>

                <div>
                  <Label>Description</Label>
                  <Textarea
                    value={newAction.action_description}
                    onChange={(e) => setNewAction({ ...newAction, action_description: e.target.value })}
                    placeholder="Detailed action description"
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
                    <Label>Target Completion Date</Label>
                    <Input
                      type="date"
                      value={newAction.target_completion_date}
                      onChange={(e) => setNewAction({ ...newAction, target_completion_date: e.target.value })}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Support Required From</Label>
                    <Input
                      value={newAction.support_required_from}
                      onChange={(e) => setNewAction({ ...newAction, support_required_from: e.target.value })}
                      placeholder="Comma-separated names"
                    />
                  </div>
                  <div>
                    <Label>Linked KPIs</Label>
                    <Input
                      value={newAction.kpis_linked_to}
                      onChange={(e) => setNewAction({ ...newAction, kpis_linked_to: e.target.value })}
                      placeholder="Comma-separated KPIs"
                    />
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button onClick={addManualAction}>Add Action</Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddAction(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters */}
          <div className="flex gap-4">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Open">Open</SelectItem>
                <SelectItem value="In Progress">In Progress</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="critical">Critical</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions List */}
          {filteredActions.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p>No actions found. Generate AI actions or add manually.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredActions.map((action) => (
                <Card key={action.id}>
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {getStatusIcon(action.status)}
                          <h3 className="font-semibold text-lg">{action.action_title}</h3>
                          <Badge variant="outline" className="flex items-center gap-1">
                            {getPriorityIcon(action.priority)}
                            {action.priority}
                          </Badge>
                          <Badge variant="secondary">{action.department}</Badge>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-4">
                          {action.action_description}
                        </p>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {action.responsible_person && (
                            <div>
                              <span className="font-medium">Responsible:</span>
                              <span className="ml-2">{action.responsible_person}</span>
                            </div>
                          )}
                          {action.target_completion_date && (
                            <div>
                              <span className="font-medium">Target Date:</span>
                              <span className="ml-2">
                                {new Date(action.target_completion_date).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          {action.support_required_from?.length > 0 && (
                            <div>
                              <span className="font-medium">Support From:</span>
                              <span className="ml-2">
                                {action.support_required_from.join(', ')}
                              </span>
                            </div>
                          )}
                          {action.kpis_linked_to?.length > 0 && (
                            <div>
                              <span className="font-medium">KPIs:</span>
                              <span className="ml-2">
                                {action.kpis_linked_to.join(', ')}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      <Select
                        value={action.status}
                        onValueChange={(value) => updateActionStatus(action.id, value as Action['status'])}
                      >
                        <SelectTrigger className="w-[150px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Open">Open</SelectItem>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
