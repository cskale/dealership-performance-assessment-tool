import { useEffect, useState, useCallback } from 'react';
import { Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { Calendar, Filter } from 'lucide-react';
import { ActionSheet } from '@/components/ActionSheet';
import type { ActionRecord } from '@/components/ActionPlan';

interface ActionDealership {
  name: string;
  location: string;
}

interface ActionAssessment {
  dealership_id: string;
  organization_id: string | null;
  dealerships: ActionDealership;
}

interface Action {
  id: string;
  action_title: string;
  action_description: string | null;
  status: 'Open' | 'In Progress' | 'Completed';
  priority: 'critical' | 'high' | 'medium' | 'low';
  department: string | null;
  responsible_person: string | null;
  target_completion_date: string | null;
  support_required_from: string[] | null;
  kpis_linked_to: string[] | null;
  impact_score: number | null;
  effort_score: number | null;
  urgency_score: number | null;
  assessment_id: string;
  created_at: string;
  assessments: ActionAssessment;
}

interface DealerStats {
  dealerId: string;
  dealerName: string;
  openCount: number;
}

const STATUS_STYLES: Record<string, string> = {
  'Open':        'bg-blue-50 text-blue-700 border-blue-200',
  'In Progress': 'bg-amber-50 text-amber-700 border-amber-200',
  'Completed':   'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export default function CoachActions() {
  const { user } = useAuth();
  const { actorType, loading: roleLoading } = useActiveRole();
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [dealerStats, setDealerStats] = useState<DealerStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDealer, setFilterDealer] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  // ActionSheet state
  const [sheetOpen, setSheetOpen] = useState(false);
  const [selectedAction, setSelectedAction] = useState<ActionRecord | null>(null);

  const fetchActions = useCallback(async () => {
    if (!user) return;

    try {
      const { data: assignments } = await supabase
        .from('coach_dealership_assignments')
        .select('dealership_id')
        .eq('coach_user_id', user.id)
        .eq('is_active', true);

      if (!assignments?.length) {
        setActions([]);
        setDealerStats([]);
        return;
      }

      const dealershipIds = assignments.map(a => a.dealership_id);

      const { data: assessments } = await supabase
        .from('assessments')
        .select('id, dealership_id, organization_id, dealerships!inner(name, location)')
        .in('dealership_id', dealershipIds)
        .eq('status', 'completed')
        .order('completed_at', { ascending: false });

      if (!assessments?.length) {
        setActions([]);
        setDealerStats([]);
        return;
      }

      // Latest completed assessment per dealer
      const latestByDealer = new Map<string, { id: string; orgId: string | null }>();
      (assessments as any[]).forEach(a => {
        if (!latestByDealer.has(a.dealership_id)) {
          latestByDealer.set(a.dealership_id, { id: a.id, orgId: a.organization_id });
        }
      });

      const latestAssessmentIds = Array.from(latestByDealer.values()).map(v => v.id);

      const { data, error } = await supabase
        .from('improvement_actions')
        .select(`
          id,
          action_title,
          action_description,
          status,
          priority,
          department,
          responsible_person,
          target_completion_date,
          support_required_from,
          kpis_linked_to,
          impact_score,
          effort_score,
          urgency_score,
          assessment_id,
          created_at,
          assessments!inner (
            dealership_id,
            organization_id,
            dealerships!inner (name, location)
          )
        `)
        .in('assessment_id', latestAssessmentIds)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const typedData = (data || []) as unknown as Action[];
      setActions(typedData);

      // Open count = anything not Completed
      const statsMap = new Map<string, DealerStats>();
      typedData.forEach(a => {
        const dealerId = a.assessments.dealership_id;
        const dealerName = a.assessments.dealerships.name;
        if (!statsMap.has(dealerId)) {
          statsMap.set(dealerId, { dealerId, dealerName, openCount: 0 });
        }
        if (a.status !== 'Completed') {
          statsMap.get(dealerId)!.openCount++;
        }
      });
      setDealerStats(Array.from(statsMap.values()));
    } catch (err) {
      console.error('Error fetching actions:', err);
      toast({ title: 'Error', description: 'Failed to load actions', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Initial fetch
  useEffect(() => {
    if (user) fetchActions();
  }, [user, fetchActions]);

  // Apply filters
  useEffect(() => {
    let filtered = [...actions];
    if (filterDealer !== 'all') {
      filtered = filtered.filter(a => a.assessments.dealership_id === filterDealer);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    setFilteredActions(filtered);
  }, [actions, filterDealer, filterStatus]);

  // Real-time subscription — re-fetch when any improvement_action changes
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel('coach-actions-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'improvement_actions' },
        () => { fetchActions(); }
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user, fetchActions]);

  const handleRowClick = (action: Action) => {
    const record: ActionRecord = {
      id: action.id,
      action_title: action.action_title,
      action_description: action.action_description ?? '',
      status: action.status,
      priority: action.priority ?? 'medium',
      department: action.department ?? '',
      responsible_person: action.responsible_person ?? null,
      target_completion_date: action.target_completion_date ?? null,
      support_required_from: action.support_required_from ?? [],
      kpis_linked_to: action.kpis_linked_to ?? [],
      impact_score: action.impact_score ?? null,
      effort_score: action.effort_score ?? null,
      urgency_score: action.urgency_score ?? null,
      assessment_id: action.assessment_id,
      organization_id: (action.assessments as any).organization_id ?? null,
      user_id: null,
    };
    setSelectedAction(record);
    setSheetOpen(true);
  };

  const handleSave = async (updated: Partial<ActionRecord>) => {
    if (!selectedAction) return;
    const { error } = await supabase
      .from('improvement_actions')
      .update({
        action_title: updated.action_title,
        action_description: updated.action_description,
        status: updated.status,
        priority: updated.priority,
        department: updated.department,
        responsible_person: updated.responsible_person,
        target_completion_date: updated.target_completion_date,
        support_required_from: updated.support_required_from,
        kpis_linked_to: updated.kpis_linked_to,
        impact_score: updated.impact_score,
        effort_score: updated.effort_score,
        urgency_score: updated.urgency_score,
      })
      .eq('id', selectedAction.id);
    if (!error) {
      toast({ title: 'Action updated' });
      setSheetOpen(false);
      fetchActions();
    }
  };

  const uniqueDealers = Array.from(
    new Map(actions.map(a => [a.assessments.dealership_id, a.assessments.dealerships])).entries()
  );

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    );
  }

  if (actorType !== 'coach') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-foreground">All Actions</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Global view of all dealer action items
        </p>
      </div>

      {/* Per-dealer open action counts */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {dealerStats.map(stat => (
          <Card key={stat.dealerId} className="bg-card shadow-card rounded-xl">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.dealerName}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-semibold">{stat.openCount}</div>
              <p className="text-xs text-muted-foreground mt-1">Open actions</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions table */}
      <Card className="bg-card shadow-card rounded-xl">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <CardTitle className="text-base font-medium">Action Items</CardTitle>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={filterDealer} onValueChange={setFilterDealer}>
                <SelectTrigger className="w-48 h-9 text-sm border-border">
                  <SelectValue placeholder="All Dealers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealers</SelectItem>
                  {uniqueDealers.map(([dealerId, dealer]) => (
                    <SelectItem key={dealerId} value={dealerId}>{dealer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-40 h-9 text-sm border-border">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          {filteredActions.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-muted-foreground">No actions found</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dealer</TableHead>
                  <TableHead>Action Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Due Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredActions.map(action => (
                  <TableRow
                    key={action.id}
                    className="cursor-pointer hover:bg-muted/40 transition-colors"
                    onClick={() => handleRowClick(action)}
                  >
                    <TableCell>
                      <div className="font-medium text-sm">{action.assessments.dealerships.name}</div>
                      <div className="text-xs text-muted-foreground">{action.assessments.dealerships.location}</div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-sm">{action.action_title}</div>
                      {action.action_description && (
                        <div className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {action.action_description}
                        </div>
                      )}
                    </TableCell>
                    <TableCell onClick={e => e.stopPropagation()}>
                      <Badge variant="outline" className={STATUS_STYLES[action.status] ?? ''}>
                        {action.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {action.target_completion_date ? (
                        <div className="flex items-center gap-1.5 text-sm">
                          <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                          {new Date(action.target_completion_date).toLocaleDateString()}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">—</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Same ActionSheet the dealer uses */}
      <ActionSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        action={selectedAction}
        mode="edit"
        onSave={handleSave}
      />
    </div>
  );
}
