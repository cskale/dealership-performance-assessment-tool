import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { AppHeader } from '@/components/AppHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { useRoleContext } from '@/contexts/RoleContext';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

interface Action {
  id: string;
  title: string;
  description: string | null;
  status: string;
  due_date: string | null;
  created_at: string;
  dealerships?: {
    id: string;
    name: string;
  };
}

interface Dealership {
  id: string;
  name: string;
}

export default function Actions() {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { testRole, selectedDealerId, setSelectedDealerId } = useRoleContext();
  const [actions, setActions] = useState<Action[]>([]);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newAction, setNewAction] = useState({
    title: '',
    description: '',
    due_date: '',
  });

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (user) {
      fetchDealerships();
      fetchActions();
    }
  }, [user]);

  useEffect(() => {
    fetchActions();
  }, [selectedDealerId, testRole]);

  const fetchDealerships = async () => {
    const { data, error } = await supabase
      .from('dealerships')
      .select('id, name')
      .order('name');

    if (error) {
      console.error('Error fetching dealerships:', error);
    } else {
      setDealerships(data || []);
      if (data && data.length > 0 && !selectedDealerId) {
        setSelectedDealerId(data[0].id);
      }
    }
  };

  const fetchActions = async () => {
    setLoading(true);
    let query = supabase
      .from('actions')
      .select(`
        id,
        title,
        description,
        status,
        due_date,
        created_at,
        dealerships (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    // Filter by dealer if in dealer role
    if (testRole === 'dealer' && selectedDealerId) {
      query = query.eq('dealer_id', selectedDealerId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching actions:', error);
      toast.error('Failed to load actions');
    } else {
      setActions(data || []);
    }
    setLoading(false);
  };

  const createAction = async () => {
    if (!newAction.title.trim()) {
      toast.error('Please enter a title');
      return;
    }

    if (testRole === 'dealer' && !selectedDealerId) {
      toast.error('Please select a dealership');
      return;
    }

    const { error } = await supabase.from('actions').insert({
      dealer_id: testRole === 'coach' && selectedDealerId ? selectedDealerId : selectedDealerId,
      title: newAction.title,
      description: newAction.description || null,
      due_date: newAction.due_date || null,
      created_by: user?.id,
    });

    if (error) {
      console.error('Error creating action:', error);
      toast.error('Failed to create action');
    } else {
      toast.success('Action created successfully');
      setDialogOpen(false);
      setNewAction({ title: '', description: '', due_date: '' });
      fetchActions();
    }
  };

  const updateStatus = async (actionId: string, newStatus: string) => {
    const { error } = await supabase
      .from('actions')
      .update({ status: newStatus })
      .eq('id', actionId);

    if (error) {
      console.error('Error updating status:', error);
      toast.error('Failed to update status');
    } else {
      toast.success('Status updated successfully');
      fetchActions();
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, 'default' | 'secondary' | 'outline'> = {
      open: 'default',
      in_progress: 'secondary',
      completed: 'outline',
    };
    return <Badge variant={variants[status] || 'default'}>{status.replace('_', ' ')}</Badge>;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">
              {testRole === 'coach' ? 'All Actions (Coach View)' : 'My Actions (Dealer View)'}
            </h1>
            <p className="text-muted-foreground">
              {testRole === 'coach' 
                ? 'Manage actions across all dealerships' 
                : 'Manage your dealership actions'}
            </p>
          </div>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Create Action</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Action</DialogTitle>
                <DialogDescription>Add a new action item to track.</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                {testRole === 'coach' && (
                  <div className="space-y-2">
                    <Label htmlFor="dealership">Dealership</Label>
                    <Select value={selectedDealerId || ''} onValueChange={setSelectedDealerId}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select dealership" />
                      </SelectTrigger>
                      <SelectContent>
                        {dealerships.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={newAction.title}
                    onChange={(e) => setNewAction({ ...newAction, title: e.target.value })}
                    placeholder="Action title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={newAction.description}
                    onChange={(e) => setNewAction({ ...newAction, description: e.target.value })}
                    placeholder="Action description"
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="due_date">Due Date</Label>
                  <Input
                    id="due_date"
                    type="date"
                    value={newAction.due_date}
                    onChange={(e) => setNewAction({ ...newAction, due_date: e.target.value })}
                  />
                </div>
              </div>
              <Button onClick={createAction} className="w-full">Create Action</Button>
            </DialogContent>
          </Dialog>
        </div>

        {testRole === 'dealer' && dealerships.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Select Dealership</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={selectedDealerId || ''} onValueChange={setSelectedDealerId}>
                {dealerships.map((d) => (
                  <div key={d.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={d.id} id={d.id} />
                    <Label htmlFor={d.id}>{d.name}</Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>
        )}

        {testRole === 'coach' && dealerships.length > 0 && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Filter by Dealership</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedDealerId || 'all'} onValueChange={(v) => setSelectedDealerId(v === 'all' ? null : v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Dealerships</SelectItem>
                  {dealerships.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {actions.length === 0 ? (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No actions found. Create one to get started.
              </CardContent>
            </Card>
          ) : (
            actions.map((action) => (
              <Card key={action.id}>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle>{action.title}</CardTitle>
                      {testRole === 'coach' && action.dealerships && (
                        <CardDescription className="mt-1">
                          Dealership: {action.dealerships.name}
                        </CardDescription>
                      )}
                      {action.description && (
                        <CardDescription className="mt-2">{action.description}</CardDescription>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(action.status)}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center">
                    <div className="text-sm text-muted-foreground">
                      {action.due_date && `Due: ${new Date(action.due_date).toLocaleDateString()}`}
                    </div>
                    <Select value={action.status} onValueChange={(value) => updateStatus(action.id, value)}>
                      <SelectTrigger className="w-[180px]">
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
      </div>
    </div>
  );
}
