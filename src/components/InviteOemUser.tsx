import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useActiveRole } from '@/hooks/useActiveRole';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Copy, Globe, Loader2, Send, XCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingOemInvite {
  id: string;
  invited_email: string;
  expires_at: string;
  token: string;
}

export function InviteOemUser() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const { actorType } = useActiveRole();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingOemInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id,
  );
  const canInvite =
    actorType === 'oem' &&
    currentMembership &&
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
        toast.error(data?.error || 'Failed to send OEM invite');
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
          <Button type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting
              ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
              : <><Send className="mr-2 h-4 w-4" /> Send OEM Invitation</>}
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
            <h4 className="text-sm font-semibold text-muted-foreground">Pending OEM invites</h4>
            {pendingInvites.map(invite => {
              const isExpired = new Date(invite.expires_at) <= new Date();
              return (
                <div
                  key={invite.id}
                  className={cn(
                    'flex items-center justify-between border rounded-lg p-3',
                    isExpired && 'opacity-50',
                  )}
                >
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">OEM</Badge>
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
