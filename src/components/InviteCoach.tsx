import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Loader2, Send, UserCheck, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Dealership {
  id: string;
  name: string;
}

interface PendingCoachInvite {
  id: string;
  invited_email: string;
  expires_at: string;
  token: string;
}

export function InviteCoach() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const [email, setEmail] = useState('');
  const [selectedDealershipId, setSelectedDealershipId] = useState<string | null>(null);
  const [dealerships, setDealerships] = useState<Dealership[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingCoachInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const canInvite = currentMembership && ['owner', 'admin'].includes(currentMembership.role);

  // Fetch this org's dealerships for the picker
  useEffect(() => {
    if (!currentOrganization) return;
    supabase
      .from('dealerships')
      .select('id, name')
      .eq('organization_id', currentOrganization.id)
      .then(({ data }) => {
        if (!data) return;
        setDealerships(data);
        if (data.length === 1) setSelectedDealershipId(data[0].id);
      });
  }, [currentOrganization]);

  const loadPendingInvites = useCallback(async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data } = await supabase
        .from('dealership_invites')
        .select('id, invited_email, expires_at, token')
        .eq('organization_id', currentOrganization.id)
        .eq('invite_type', 'coach')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      setPendingInvites((data as PendingCoachInvite[]) ?? []);
    } finally {
      setLoadingInvites(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (canInvite && currentOrganization) loadPendingInvites();
  }, [canInvite, currentOrganization, loadPendingInvites]);

  const resolveDealershipId = async (): Promise<string | null> => {
    if (selectedDealershipId) return selectedDealershipId;
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('active_dealership_id')
      .eq('user_id', user.id)
      .maybeSingle();
    return data?.active_dealership_id ?? null;
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrganization || !user) return;

    const dealershipId = await resolveDealershipId();
    if (!dealershipId) {
      toast.error('Select a dealership before sending a coach invite');
      return;
    }

    setIsSubmitting(true);
    setInviteUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invited_email: email.trim().toLowerCase(),
          dealership_id: dealershipId,
          organization_id: currentOrganization.id,
          invite_type: 'coach',
        },
      });

      if (error || !data?.success) {
        toast.error(data?.error || 'Failed to send coach invite');
        return;
      }

      setInviteUrl(data.invite_url);
      if (data.email_sent) {
        toast.success(`Coach invitation sent to ${email.trim().toLowerCase()}`);
      } else {
        toast.warning('Invite created but email could not be sent — copy the link below to share manually.');
      }
      setEmail('');
      loadPendingInvites();
    } catch {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    const { error } = await supabase
      .from('dealership_invites')
      .update({ status: 'revoked' })
      .eq('id', inviteId);
    if (error) { toast.error('Failed to revoke invite'); return; }
    toast.success('Coach invite revoked');
    loadPendingInvites();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  if (!canInvite) return null;

  const needsDealershipPicker = dealerships.length > 1;
  const submitDisabled =
    isSubmitting ||
    !email.trim() ||
    (needsDealershipPicker && !selectedDealershipId);

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserCheck className="h-5 w-5" />
          Invite a Coach
        </CardTitle>
        <CardDescription>
          Coaches can view assessments and action plans for assigned dealerships without joining your organisation.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSendInvite} className="space-y-4">
          {needsDealershipPicker && (
            <div className="space-y-2">
              <Label>Assign to dealership</Label>
              <Select
                value={selectedDealershipId ?? ''}
                onValueChange={setSelectedDealershipId}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select dealership…" />
                </SelectTrigger>
                <SelectContent>
                  {dealerships.map(d => (
                    <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="coach-invite-email">Coach email address</Label>
            <Input
              id="coach-invite-email"
              type="email"
              placeholder="coach@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>

          <Button type="submit" disabled={submitDisabled}>
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send Coach Invitation</>}
          </Button>
        </form>

        {inviteUrl && (
          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <Input value={inviteUrl} readOnly className="text-xs bg-background" />
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(inviteUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Pending coach invites</h4>
            {pendingInvites.map(invite => {
              const isExpired = new Date(invite.expires_at) <= new Date();
              return (
                <div
                  key={invite.id}
                  className={cn(
                    'flex items-center justify-between border rounded-lg p-3',
                    isExpired && 'opacity-50'
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">Coach</Badge>
                      {isExpired
                        ? <Badge variant="destructive" className="text-xs">Expired</Badge>
                        : <span className="text-xs text-muted-foreground">
                            Expires {new Date(invite.expires_at).toLocaleDateString()}
                          </span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="text-destructive"
                      onClick={() => handleRevoke(invite.id)}
                    >
                      <XCircle className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
