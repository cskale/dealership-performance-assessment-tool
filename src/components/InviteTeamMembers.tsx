import { useState, useEffect } from 'react';
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
import { Copy, Loader2, Send, UserPlus, XCircle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PendingInvite {
  id: string;
  invited_email: string;
  membership_role: string;
  created_at: string;
  expires_at: string;
  token: string;
}

const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
] as const;

export function InviteTeamMembers() {
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);

  // Check if current user has permission to invite
  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const canInvite = currentMembership && ['owner', 'admin', 'member'].includes(currentMembership.role);

  useEffect(() => {
    if (canInvite && currentOrganization) {
      loadPendingInvites();
    }
  }, [canInvite, currentOrganization]);

  const loadPendingInvites = async () => {
    if (!currentOrganization) return;
    setLoadingInvites(true);
    try {
      const { data, error } = await supabase
        .from('dealership_invites')
        .select('id, invited_email, membership_role, created_at, expires_at, token')
        .eq('organization_id', currentOrganization.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(100);

      if (!error && data) {
        setPendingInvites(data as PendingInvite[]);
      }
    } catch (err) {
      console.error('Error loading invites:', err);
    } finally {
      setLoadingInvites(false);
    }
  };

  const getActiveDealershipId = async (): Promise<string | null> => {
    if (!user) return null;
    const { data } = await supabase
      .from('profiles')
      .select('active_dealership_id')
      .eq('user_id', user.id)
      .single();
    return data?.active_dealership_id || null;
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrganization || !user) return;

    const dealershipId = await getActiveDealershipId();
    if (!dealershipId) {
      toast.error('No active dealership selected');
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
          role,
        },
      });

      if (error) {
        toast.error('Failed to send invite');
        return;
      }

      if (data?.success) {
        setInviteUrl(data.invite_url);
        if (data.email_sent) {
          toast.success(`Invitation email sent to ${email.trim().toLowerCase()}`);
        } else {
          toast.warning('Invite created but email could not be sent. Copy the link below to share manually.');
        }
        setEmail('');
        loadPendingInvites();
      } else {
        toast.error(data?.error || 'Failed to create invite');
      }
    } catch (err) {
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleRevoke = async (inviteId: string) => {
    try {
      const { error } = await supabase
        .from('dealership_invites')
        .update({ status: 'revoked' })
        .eq('id', inviteId);

      if (error) {
        toast.error('Failed to revoke invite');
        return;
      }

      toast.success('Invite revoked');
      loadPendingInvites();
    } catch {
      toast.error('Failed to revoke invite');
    }
  };

  const handleResend = async (invite: PendingInvite) => {
    if (!currentOrganization) return;

    const dealershipId = await getActiveDealershipId();
    if (!dealershipId) return;

    try {
      const { data, error } = await supabase.functions.invoke('send-invite', {
        body: {
          invited_email: invite.invited_email,
          dealership_id: dealershipId,
          organization_id: currentOrganization.id,
          role: invite.membership_role,
        },
      });

      if (!error && data?.success) {
        if (data.email_sent) {
          toast.success(`Invitation email resent to ${invite.invited_email}`);
        } else {
          toast.warning('Invite extended but email could not be sent');
        }
        setInviteUrl(data.invite_url);
        loadPendingInvites();
      } else {
        toast.error('Failed to resend invite');
      }
    } catch {
      toast.error('Failed to resend invite');
    }
  };

  const copyToClipboard = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Invite link copied!');
  };

  if (!canInvite) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Invite Team Members
        </CardTitle>
        <CardDescription>
          Send invite links to team members to join your dealership.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Invite Form */}
        <form onSubmit={handleSendInvite} className="space-y-4">
          <div className="flex gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email Address</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colleague@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
                required
              />
            </div>
            <div className="w-36 space-y-2">
              <Label>Role</Label>
              <Select value={role} onValueChange={setRole} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ROLE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button type="submit" disabled={isSubmitting || !email.trim()}>
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Send Invitation Email</>
            )}
          </Button>
        </form>

        {/* Copy Invite URL */}
        {inviteUrl && (
          <div className="bg-muted rounded-lg p-3 flex items-center gap-2">
            <Input value={inviteUrl} readOnly className="text-xs bg-background" />
            <Button size="sm" variant="outline" onClick={() => copyToClipboard(inviteUrl)}>
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Pending Invites */}
        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-semibold text-muted-foreground">Pending Invites</h4>
            {pendingInvites.map((invite) => {
              const isExpired = new Date(invite.expires_at) <= new Date();
              return (
                <div key={invite.id} className={cn("flex items-center justify-between border rounded-lg p-3", isExpired && "opacity-50")}>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{invite.invited_email}</p>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{invite.membership_role}</Badge>
                      {isExpired ? (
                        <Badge variant="destructive" className="text-xs">Expired</Badge>
                      ) : (
                        <span className="text-xs text-muted-foreground">
                          Expires {new Date(invite.expires_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`)}>
                      <Copy className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => handleResend(invite)}>
                      <RefreshCw className="h-3 w-3" />
                    </Button>
                    <Button size="sm" variant="ghost" className="text-destructive" onClick={() => handleRevoke(invite.id)}>
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
