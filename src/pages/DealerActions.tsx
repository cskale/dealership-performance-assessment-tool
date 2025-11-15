import { useEffect, useState } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Plus, Calendar } from 'lucide-react';
import { AppHeader } from '@/components/AppHeader';

interface Action {
  id: string;
  title: string;
  description: string | null;
  status: 'open' | 'in_progress' | 'completed';
  due_date: string | null;
  created_at: string;
}

export default function DealerActions() {
  const { dealerId } = useParams<{ dealerId: string }>();
  const { user } = useAuth();
  const { role, dealerId: userDealerId, loading: roleLoading } = useUserRole();
  const { toast } = useToast();
  const [actions, setActions] = useState<Action[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    due_date: ''
  });

  useEffect(() => {
    if (user && dealerId) {
      fetchActions();
    }
  }, [user, dealerId]);

  const fetchActions = async () => {
    try {
      const { data, error } = await supabase
        .from('actions')
        .select('*')
        .eq('dealer_id', dealerId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setActions((data || []) as Action[]);
    } catch (error) {
      console.error('Error fetching actions:', error);
      toast({
        title: 'Error',
        description: 'Failed to load actions',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const createAction = async () => {
    if (!newAction.title.trim()) {
      toast({
        title: 'Error',
        description: 'Title is required',
        variant: 'destructive'
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('actions')
        .insert({
          dealer_id: dealerId,
          title: newAction.title,
          description: newAction.description || null,
          due_date: newAction.due_date || null,
          created_by: user?.id,
          status: 'open'
        });

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Action created successfully'
      });

      setNewAction({ title: '', description: '', due_date: '' });
      setIsDialogOpen(false);
      fetchActions();
    } catch (error) {
      console.error('Error creating action:', error);
      toast({
        title: 'Error',
        description: 'Failed to create action',
        variant: 'destructive'
      });
    }
  };

  const updateStatus = async (actionId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('actions')
        .update({ status: newStatus })
        .eq('id', actionId);

      if (error) throw error;

      toast({
        title: 'Success',
        description: 'Status updated'
      });

      fetchActions();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive'
      });
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, string> = {
      open: 'bg-blue-50 text-blue-700 border-blue-200',
      in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
      completed: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    };
    
    const labels: Record<string, string> = {
      open: 'Open',
      in_progress: 'In Progress',
      completed: 'Completed'
    };

    return (
      <Badge variant="outline" className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  if (roleLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (role !== 'dealer' || userDealerId !== dealerId) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="min-h-screen bg-neutral-bg">
      <AppHeader />
      
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Action Items</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Manage your dealership action items
            </p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                New Action
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-card">
              <DialogHeader>
                <DialogTitle>Create New Action</DialogTitle>
                <DialogDescription>
                  Add a new action item to track
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    placeholder="Action title"
                  />
                </div>
                
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    placeholder="Optional description"
                    rows={3}
                  />
                </div>
                
                <div>
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newAction.due_date}
                    onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createAction}>Create Action</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="space-y-3">
          {actions.length === 0 ? (
            <Card className="border-border bg-card">
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">No action items yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Create your first action to get started
                </p>
              </CardContent>
            </Card>
          ) : (
            actions.map((action) => (
              <Card key={action.id} className="border-border bg-card">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <CardTitle className="text-base font-medium">
                        {action.title}
                      </CardTitle>
                      {action.description && (
                        <CardDescription className="mt-1.5">
                          {action.description}
                        </CardDescription>
                      )}
                    </div>
                    {getStatusBadge(action.status)}
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {action.due_date && (
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          {new Date(action.due_date).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                    
                    <Select
                      value={action.status}
                      onValueChange={(value) => updateStatus(action.id, value)}
                    >
                      <SelectTrigger className="w-40 h-8 text-xs border-border">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="in_progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
