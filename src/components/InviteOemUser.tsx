import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Globe, Loader2, Send } from 'lucide-react';
import {
  TeamSubHeader,
  PendingInviteRow,
  InviteLinkBlock,
} from '@/components/team/TeamPrimitives';

interface PendingOemInvite {
  id: string;
  invited_email: string;
  expires_at: string;
  token: string;
}

export function InviteOemUser() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingOemInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id,
  );
  const canInvite =
    currentMembership != null &&
    ['owner', 'admin'].includes(currentMembership.role);

  const loadPendingInvites = useCallback(async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data } = await supabase
        .from('dealership_invites')
        .select('id, invited_email, expires_at, token')
        .eq('organization_id', currentOrganization.id)
        .eq('invite_type', 'oem')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(50);
      setPendingInvites((data as PendingOemInvite[]) ?? []);
    } finally {
      setLoadingInvites(false);
    }
  }, [currentOrganization]);

  useEffect(() => {
    if (canInvite && currentOrganization) loadPendingInvites();
  }, [canInvite, currentOrganization, loadPendingInvites]);

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrganization || !user) return;
    setIsSubmitting(true);
    setInviteUrl(null);
    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invited_email: email.trim().toLowerCase(),
          organization_id: currentOrganization.id,
          invite_type: 'oem',
        },
      });
      if (error || !data?.success) {
        let message = data?.error || 'Failed to send OEM invite';
        if (error && 'context' in error && error.context instanceof Response) {
          const body = await error.context.json().catch(() => null);
          if (body?.error) message = body.error;
        }
        toast.error(message);
        return;
      }
      setInviteUrl(data.invite_url);
      if (data.email_sent) {
        toast.success(`OEM invitation sent to ${email.trim().toLowerCase()}`);
      } else {
        toast.warning('Invite created but email could not be sent — copy the link below.');
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
    toast.success('OEM invite revoked');
    loadPendingInvites();
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  if (!canInvite) return null;

  return (
    <Card className="shadow-card rounded-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Invite OEM User
        </CardTitle>
        <CardDescription>
          OEM users can access the network dashboard and manage all enrolled dealerships.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="oem-invite-email">Email address</Label>
            <Input
              id="oem-invite-email"
              type="email"
              placeholder="manager@oem.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              disabled={isSubmitting}
              required
            />
          </div>
          <Button type="submit" disabled={isSubmitting || !email.trim()} className="w-full sm:w-auto">
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send OEM invitation</>}
          </Button>
        </form>

        {inviteUrl && <InviteLinkBlock url={inviteUrl} onCopy={() => copyToClipboard(inviteUrl)} />}

        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[hsl(var(--dd-rule))]">
            <TeamSubHeader title="Pending OEM invites" count={pendingInvites.length} />
            <div className="space-y-2">
              {pendingInvites.map(invite => (
                <PendingInviteRow
                  key={invite.id}
                  email={invite.invited_email}
                  expiresAt={invite.expires_at}
                  roleLabel="OEM"
                  avatarVariant="oem"
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
