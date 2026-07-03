import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Send, UserCheck } from 'lucide-react';
import {
  TeamSubHeader,
  PendingInviteRow,
  InviteLinkBlock,
} from '@/components/team/TeamPrimitives';

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

          <Button type="submit" disabled={submitDisabled} className="w-full sm:w-auto">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send coach invitation</>}
          </Button>
        </form>

        {inviteUrl && <InviteLinkBlock url={inviteUrl} onCopy={() => copyToClipboard(inviteUrl)} />}

        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[hsl(var(--dd-rule))]">
            <TeamSubHeader title="Pending coach invites" count={pendingInvites.length} />
            <div className="space-y-2">
              {pendingInvites.map(invite => (
                <PendingInviteRow
                  key={invite.id}
                  email={invite.invited_email}
                  expiresAt={invite.expires_at}
                  roleLabel="Coach"
                  avatarVariant="coach"
                  onCopy={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`)}
                  onRevoke={() => handleRevoke(invite.id)}
                />
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
