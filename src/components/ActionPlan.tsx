import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, CheckCircle, Clock, Calendar as CalendarIcon, Save, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";

interface ActionPlanProps {
  scores: Record<string, number>;
  assessmentId?: string;
}

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

const SUPPORT_OPTIONS = [
  "Coach",
  "IT Team",
  "Parts Vendor",
  "OEM",
  "Management",
  "Training Provider",
  "Consultant"
];

const KPI_CATEGORIES = [
  "Parts KPIs",
  "Workshop KPIs",
  "Sales KPIs",
  "Aftersales KPIs",
  "Financial KPIs",
  "Customer Satisfaction KPIs"
];

export function ActionPlan({ scores, assessmentId }: ActionPlanProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, []);

  // Auto-generate actions when no actions exist and scores are available
  useEffect(() => {
    console.log('[ActionPlan] Auto-generate check:', { loading, actionsLength: actions.length, scoresLength: Object.keys(scores || {}).length, assessmentId });
    if (!loading && actions.length === 0 && scores && Object.keys(scores).length > 0) {
      console.log('[ActionPlan] Triggering auto-generation from scores');
      generateActionsFromScores();
    }
  }, [loading, actions.length, scores]);

  const generateActionsFromScores = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const actionsToCreate: any[] = [];
      
      Object.entries(scores).forEach(([department, score]) => {
        if (score < 75) {
          let priority = 'Medium';
          if (score < 50) priority = 'Critical';
          else if (score < 60) priority = 'High';
          
          const departmentName = department.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          
          actionsToCreate.push({
            assessment_id: assessmentId || 'temp',
            user_id: user.id,
            department: departmentName,
            priority,
            action_title: `Improve ${departmentName} Performance`,
            action_description: `Implement comprehensive improvements to enhance ${departmentName.toLowerCase()} efficiency and effectiveness.`,
            status: 'Open',
            support_required_from: ['Coach', 'Management'],
            kpis_linked_to: [`${departmentName} KPIs`]
          });
        }
      });

      if (actionsToCreate.length > 0) {
        const { data, error } = await supabase
          .from('improvement_actions')
          .insert(actionsToCreate)
          .select();

        if (error) throw error;
        setActions(data || []);
        
        toast({
          title: "Actions Generated",
          description: `${actionsToCreate.length} improvement actions created based on your assessment.`,
        });
      }
    } catch (error) {
      console.error('Error generating actions:', error);
    }
  };

  const loadActions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('improvement_actions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions(data || []);
    } catch (error) {
      console.error('Error loading actions:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateAction = async (actionId: string, updates: Partial<Action>) => {
    try {
      const { error } = await supabase
        .from('improvement_actions')
        .update(updates)
        .eq('id', actionId);

      if (error) throw error;

      setActions(prev => prev.map(action => 
        action.id === actionId ? { ...action, ...updates } : action
      ));

      toast({
        title: "Action Updated",
        description: "Changes saved successfully.",
      });
    } catch (error) {
      console.error('Error updating action:', error);
      toast({
        title: "Update Failed",
        description: "Could not save changes.",
        variant: "destructive",
      });
    }
  };

  const deleteAction = async (actionId: string) => {
    try {
      const { error } = await supabase
        .from('improvement_actions')
        .delete()
        .eq('id', actionId);

      if (error) throw error;

      setActions(prev => prev.filter(action => action.id !== actionId));

      toast({
        title: "Action Deleted",
        description: "Action removed successfully.",
      });
    } catch (error) {
      console.error('Error deleting action:', error);
      toast({
        title: "Delete Failed",
        description: "Could not delete action.",
        variant: "destructive",
      });
    }
  };

  const toggleSupport = (actionId: string, supportItem: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const currentSupport = action.support_required_from || [];
    const newSupport = currentSupport.includes(supportItem)
      ? currentSupport.filter(s => s !== supportItem)
      : [...currentSupport, supportItem];

    updateAction(actionId, { support_required_from: newSupport });
  };

  const toggleKPI = (actionId: string, kpi: string) => {
    const action = actions.find(a => a.id === actionId);
    if (!action) return;

    const currentKPIs = action.kpis_linked_to || [];
    const newKPIs = currentKPIs.includes(kpi)
      ? currentKPIs.filter(k => k !== kpi)
      : [...currentKPIs, kpi];

    updateAction(actionId, { kpis_linked_to: newKPIs });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Open': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="flex items-center gap-2 text-2xl">
            <CheckCircle className="h-6 w-6 text-primary" />
            Action Plan & Implementation Tracker
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-muted-foreground mb-4">
            Track and manage your improvement actions with detailed planning and progress monitoring.
          </p>
        </CardContent>
      </Card>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">No actions found. Click below to generate improvement actions based on your assessment.</p>
            <Button onClick={generateActionsFromScores} disabled={!scores || Object.keys(scores).length === 0}>
              Generate Action Plan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {actions.map((action) => (
            <Card key={action.id} className="border shadow-md hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={cn("text-white", getPriorityColor(action.priority))}>
                        {action.priority}
                      </Badge>
                      <Badge variant="outline">{action.department}</Badge>
                    </div>
                    <CardTitle className="text-xl">{action.action_title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-2">{action.action_description}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => deleteAction(action.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Responsible Person */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Responsible Person</Label>
                    <Select
                      value={action.responsible_person || ""}
                      onValueChange={(value) => updateAction(action.id, { responsible_person: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select person" />
                      </SelectTrigger>
                      <SelectContent>
                        {RESPONSIBLE_PERSONS.map(person => (
                          <SelectItem key={person} value={person}>{person}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select
                      value={action.status}
                      onValueChange={(value) => updateAction(action.id, { status: value })}
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

                  {/* Target Completion Date */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Target Completion Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !action.target_completion_date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {action.target_completion_date
                            ? format(new Date(action.target_completion_date), "PPP")
                            : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={action.target_completion_date ? new Date(action.target_completion_date) : undefined}
                          onSelect={(date) => updateAction(action.id, { 
                            target_completion_date: date ? format(date, "yyyy-MM-dd") : null 
                          })}
                          initialFocus
                          className="pointer-events-auto"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  {/* Priority Level (display only, already set) */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Priority Level</Label>
                    <Select
                      value={action.priority}
                      onValueChange={(value) => updateAction(action.id, { priority: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Critical">Critical</SelectItem>
                        <SelectItem value="High">High</SelectItem>
                        <SelectItem value="Medium">Medium</SelectItem>
                        <SelectItem value="Low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Support Required From */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Support Required From</Label>
                  <div className="flex flex-wrap gap-2">
                    {SUPPORT_OPTIONS.map(support => (
                      <div key={support} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${action.id}-${support}`}
                          checked={action.support_required_from?.includes(support) || false}
                          onCheckedChange={() => toggleSupport(action.id, support)}
                        />
                        <label
                          htmlFor={`${action.id}-${support}`}
                          className="text-sm cursor-pointer"
                        >
                          {support}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* KPIs Linked To */}
                <div className="space-y-2">
                  <Label className="text-sm font-medium">KPIs Linked To</Label>
                  <div className="flex flex-wrap gap-2">
                    {KPI_CATEGORIES.map(kpi => (
                      <div key={kpi} className="flex items-center space-x-2">
                        <Checkbox
                          id={`${action.id}-${kpi}`}
                          checked={action.kpis_linked_to?.includes(kpi) || false}
                          onCheckedChange={() => toggleKPI(action.id, kpi)}
                        />
                        <label
                          htmlFor={`${action.id}-${kpi}`}
                          className="text-sm cursor-pointer"
                        >
                          {kpi}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status Badge */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Badge className={cn("text-white", getStatusColor(action.status))}>
                    {action.status}
                  </Badge>
                  {action.target_completion_date && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Due {format(new Date(action.target_completion_date), "MMM d, yyyy")}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}