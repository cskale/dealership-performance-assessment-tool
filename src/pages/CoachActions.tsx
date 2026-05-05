import { useEffect, useState } from 'react';
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

interface ActionDealership {
  name: string;
  location: string;
}

interface ActionAssessment {
  dealership_id: string;
  dealerships: ActionDealership;
}

interface Action {
  id: string;
  action_title: string;
  action_description: string | null;
  status: 'open' | 'in_progress' | 'completed';
  target_completion_date: string | null;
  created_at: string;
  assessments: ActionAssessment;
}

interface DealerStats {
  dealerId: string;
  dealerName: string;
  openCount: number;
}

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

  useEffect(() => {
    if (user) fetchActions();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [actions, filterDealer, filterStatus]);

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('improvement_actions')
        .select(`
          id,
          action_title,
          action_description,
          status,
          target_completion_date,
          created_at,
          assessments!inner (
            dealership_id,
            dealerships!inner (
              name,
              location
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      const typedData = (data || []) as unknown as Action[];
      setActions(typedData);
      calculateDealerStats(typedData);
    } catch (error) {
      console.error('Error fetching actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load actions',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateDealerStats = (actionsData: Action[]) => {
    const statsMap = new Map<string, DealerStats>();
    actionsData.forEach((action) => {
      const dealerId = action.assessments.dealership_id;
      const dealerName = action.assessments.dealerships.name;
      if (!statsMap.has(dealerId)) {
        statsMap.set(dealerId, { dealerId, dealerName, openCount: 0 });
      }
      if (action.status === 'open') {
        statsMap.get(dealerId)!.openCount++;
      }
    });
    setDealerStats(Array.from(statsMap.values()));
  };

  const applyFilters = () => {
    let filtered = [...actions];
    if (filterDealer !== 'all') {
      filtered = filtered.filter(a => a.assessments.dealership_id === filterDealer);
    }
    if (filterStatus !== 'all') {
      filtered = filtered.filter(a => a.status === filterStatus);
    }
    setFilteredActions(filtered);
  };

  const updateStatus = async (actionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('improvement_actions')
        .update({ status: newStatus })
        .eq('id', actionId);
      if (error) throw error;
      toast({ title: 'Success', description: 'Status updated' });
      fetchActions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    };
    const labels: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed',
    };
    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const uniqueDealers = Array.from(
    new Map(actions.map(a => [a.assessments.dealership_id, a.assessments.dealerships])).entries()
  );

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (actorType !== 'coach') {
    return <Navigate to="/app/dashboard" replace />;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <main>
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-foreground">All Actions</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Global view of all dealer action items
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 mb-6">
          {dealerStats.map((stat) => (
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

        <Card className="bg-card shadow-card rounded-xl">
          <CardHeader>
            <div className="flex items-center justify-between">
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
                      <SelectItem key={dealerId} value={dealerId}>
                        {dealer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-40 h-9 text-sm border-border">
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
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
                    <TableHead className="w-40">Update Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActions.map((action) => (
                    <TableRow key={action.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{action.assessments.dealerships.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {action.assessments.dealerships.location}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">{action.action_title}</div>
                          {action.action_description && (
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {action.action_description}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{getStatusBadge(action.status)}</TableCell>
                      <TableCell>
                        {action.target_completion_date ? (
                          <div className="flex items-center gap-1.5 text-sm">
                            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                            {new Date(action.target_completion_date).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-sm text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Select
                          value={action.status}
                          onValueChange={(value) => updateStatus(action.id, value)}
                        >
                          <SelectTrigger className="h-8 text-xs border-border">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="open">Open</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
