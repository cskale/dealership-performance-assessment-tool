import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CheckCircle, Plus, Search, MoreHorizontal, Pencil, Trash2, Filter } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ActionSheet } from "./ActionSheet";

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

export function ActionPlan({ scores, assessmentId }: ActionPlanProps) {
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<'create' | 'edit'>('create');
  const [selectedAction, setSelectedAction] = useState<Action | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadActions();
  }, []);

  useEffect(() => {
    if (!loading && actions.length === 0 && scores && Object.keys(scores).length > 0) {
      generateActionsFromScores();
    }
  }, [loading, actions.length, scores]);

  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      const matchesSearch = searchQuery === "" || 
        action.action_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.department.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = statusFilter === "all" || action.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || action.priority === priorityFilter;
      
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [actions, searchQuery, statusFilter, priorityFilter]);

  const generateActionsFromScores = async () => {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        toast({ title: "Authentication Error", description: "You must be logged in.", variant: "destructive" });
        return;
      }

      const actionsToCreate: any[] = [];
      Object.entries(scores).forEach(([department, score]) => {
        if (score < 75) {
          let priority = 'medium';
          if (score < 50) priority = 'critical';
          else if (score < 60) priority = 'high';
          
          const departmentName = department.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
          actionsToCreate.push({
            assessment_id: assessmentId || null,
            user_id: user.id,
            department: departmentName,
            priority,
            action_title: `Improve ${departmentName} Performance`,
            action_description: `Current score: ${score}/100. Implement comprehensive improvements.`,
            status: 'Open',
            support_required_from: ['Coach', 'Management'],
            kpis_linked_to: [`${departmentName} KPIs`],
            responsible_person: null,
            target_completion_date: null
          });
        }
      });

      if (actionsToCreate.length === 0) {
        toast({ title: "Great Performance!", description: "All departments scoring above 75%." });
        return;
      }

      const { data, error } = await supabase.from('improvement_actions').insert(actionsToCreate).select();
      if (error) throw error;
      setActions(data || []);
      toast({ title: "Actions Generated", description: `${actionsToCreate.length} actions created.` });
    } catch (error: any) {
      toast({ title: "Generation Failed", description: error?.message, variant: "destructive" });
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

  const createAction = async (actionData: Partial<Action>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const insertData = {
        action_title: actionData.action_title || '',
        action_description: actionData.action_description || '',
        department: actionData.department || '',
        priority: actionData.priority || 'medium',
        status: actionData.status || 'Open',
        responsible_person: actionData.responsible_person,
        target_completion_date: actionData.target_completion_date,
        support_required_from: actionData.support_required_from,
        kpis_linked_to: actionData.kpis_linked_to,
        user_id: user.id,
        assessment_id: assessmentId || null
      };

      const { data, error } = await supabase
        .from('improvement_actions')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      setActions(prev => [data, ...prev]);
      toast({ title: "Action Created", description: "New action added successfully." });
    } catch (error: any) {
      toast({ title: "Create Failed", description: error?.message, variant: "destructive" });
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
      toast({ title: "Action Updated", description: "Changes saved." });
    } catch (error) {
      toast({ title: "Update Failed", description: "Could not save changes.", variant: "destructive" });
    }
  };

  const deleteAction = async (actionId: string) => {
    try {
      const { error } = await supabase.from('improvement_actions').delete().eq('id', actionId);
      if (error) throw error;
      setActions(prev => prev.filter(action => action.id !== actionId));
      toast({ title: "Action Deleted", description: "Action removed." });
    } catch (error) {
      toast({ title: "Delete Failed", description: "Could not delete action.", variant: "destructive" });
    }
  };

  const handleRowClick = (action: Action) => {
    setSelectedAction(action);
    setSheetMode('edit');
    setSheetOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedAction(null);
    setSheetMode('create');
    setSheetOpen(true);
  };

  const handleSheetSave = (actionData: Partial<Action>) => {
    if (sheetMode === 'edit' && actionData.id) {
      updateAction(actionData.id, actionData);
    } else {
      createAction(actionData);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filteredActions.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredActions.map(a => a.id)));
    }
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500 hover:bg-red-600',
      high: 'bg-orange-500 hover:bg-orange-600',
      medium: 'bg-yellow-500 hover:bg-yellow-600',
      low: 'bg-green-500 hover:bg-green-600'
    };
    return (
      <Badge className={cn("text-white capitalize text-xs", colors[priority] || 'bg-muted')}>
        {priority}
      </Badge>
    );
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Completed': 'bg-green-500/20 text-green-700 border-green-500/30',
      'In Progress': 'bg-blue-500/20 text-blue-700 border-blue-500/30',
      'Open': 'bg-muted text-muted-foreground border-border'
    };
    return (
      <Badge variant="outline" className={cn("text-xs", colors[status] || '')}>
        {status}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <Card className="border-primary/20">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-xl">
            <CheckCircle className="h-5 w-5 text-primary" />
            Action Plan
          </CardTitle>
        </CardHeader>
      </Card>

      {actions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center space-y-4">
            <p className="text-muted-foreground">No actions found.</p>
            <div className="flex justify-center gap-3">
              {scores && Object.keys(scores).length > 0 && (
                <Button onClick={generateActionsFromScores} size="lg">
                  <CheckCircle className="h-5 w-5 mr-2" />
                  Generate Action Plan
                </Button>
              )}
              <Button variant="outline" onClick={handleCreateClick} size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Create Action
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-4">
            {/* Controls */}
            <div className="flex flex-wrap items-center gap-3 mb-4">
              <Button onClick={handleCreateClick} className="shrink-0">
                <Plus className="h-4 w-4 mr-2" />
                Create Action
              </Button>

              <div className="relative flex-1 min-w-[200px] max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search actions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
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
            </div>

            {/* Table */}
            <div className="rounded-md border">
              <Table>
                <TableHeader className="bg-muted/50 sticky top-0">
                  <TableRow>
                    <TableHead className="w-[40px]">
                      <Checkbox
                        checked={selectedIds.size === filteredActions.length && filteredActions.length > 0}
                        onCheckedChange={toggleSelectAll}
                      />
                    </TableHead>
                    <TableHead className="w-[90px]">Priority</TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead className="w-[120px]">Department</TableHead>
                    <TableHead className="w-[140px]">Assignee</TableHead>
                    <TableHead className="w-[100px]">Status</TableHead>
                    <TableHead className="w-[110px]">Due Date</TableHead>
                    <TableHead className="w-[50px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                        No actions match your filters.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredActions.map((action) => (
                      <TableRow
                        key={action.id}
                        className="h-11 cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleRowClick(action)}
                      >
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <Checkbox
                            checked={selectedIds.has(action.id)}
                            onCheckedChange={() => toggleSelect(action.id)}
                          />
                        </TableCell>
                        <TableCell>{getPriorityBadge(action.priority)}</TableCell>
                        <TableCell className="font-medium truncate max-w-[300px]">
                          {action.action_title}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {action.department}
                        </TableCell>
                        <TableCell className="text-sm">
                          {action.responsible_person || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>{getStatusBadge(action.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {action.target_completion_date 
                            ? format(new Date(action.target_completion_date), "MMM d, yyyy")
                            : "—"}
                        </TableCell>
                        <TableCell onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="bg-popover">
                              <DropdownMenuItem onClick={() => handleRowClick(action)}>
                                <Pencil className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => deleteAction(action.id)}
                                className="text-destructive focus:text-destructive"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      <ActionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        action={selectedAction}
        mode={sheetMode}
        onSave={handleSheetSave}
        onDelete={deleteAction}
      />
    </div>
  );
}
