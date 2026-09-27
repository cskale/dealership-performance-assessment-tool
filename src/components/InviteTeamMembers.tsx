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
import { List, Loader2, Network, Send, UserPlus } from 'lucide-react';
import {
  TeamSubHeader,
  PendingInviteRow,
  MemberRow,
  InviteLinkBlock,
} from '@/components/team/TeamPrimitives';
import { useLanguage } from '@/contexts/LanguageContext';

interface PendingInvite {
  id: string;
  invited_email: string;
  membership_role: string;
  created_at: string;
  expires_at: string;
  token: string;
}

interface OrgMember {
  id: string;
  user_id: string;
  role: string;
  displayName: string;
  initials: string;
  actorType: string | null;
}

function getInitials(name: string): string {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0][0].toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

// owner role is not assignable via invite — ownership transfer is handled separately
const ROLE_OPTIONS = [
  { value: 'viewer', label: 'Viewer' },
  { value: 'member', label: 'Member' },
  { value: 'admin', label: 'Admin' },
] as const;

export function InviteTeamMembers() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const { currentOrganization, userMemberships } = useMultiTenant();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string>('viewer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteUrl, setInviteUrl] = useState<string | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loadingInvites, setLoadingInvites] = useState(true);
  const [orgMembers, setOrgMembers] = useState<OrgMember[]>([]);
  const [externalCoaches, setExternalCoaches] = useState<OrgMember[]>([]);
  const [memberView, setMemberView] = useState<'list' | 'chart'>('list');

  // Check if current user has permission to invite
  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const canInvite = currentMembership && ['owner', 'admin'].includes(currentMembership.role);

  const loadPendingInvites = useCallback(async () => {
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
  }, [currentOrganization]);

  const fetchOrgMembers = useCallback(async () => {
    if (!currentOrganization) return;
    const { data: memberships } = await supabase
      .from('memberships')
      .select('id, user_id, role')
      .eq('organization_id', currentOrganization.id)
      .eq('is_active', true);

    if (!memberships || memberships.length === 0) { setOrgMembers([]); return; }

    // profiles RLS is own-row only; this RPC returns names for members of the caller's org
    const { data: profiles } = await supabase.rpc('get_org_member_profiles', { p_org_id: currentOrganization.id });

    const profileMap = new Map((profiles || []).map(p => [p.user_id, p]));

    setOrgMembers(memberships.map(m => {
      const p = profileMap.get(m.user_id);
      const name = p?.display_name || `${m.user_id.slice(0, 8)}…`;
      return { id: m.id, user_id: m.user_id, role: m.role, displayName: name, initials: getInitials(name), actorType: p?.actor_type ?? null };
    }));
    // the RPC also returns assigned coaches, who aren't members; they only appear in the chart's External lane
    const memberIds = new Set(memberships.map(m => m.user_id));
    setExternalCoaches((profiles || []).filter(p => !memberIds.has(p.user_id)).map(p => ({
      id: p.user_id, user_id: p.user_id, role: 'coach', displayName: p.display_name, initials: getInitials(p.display_name), actorType: p.actor_type,
    })));
  }, [currentOrganization]);

  useEffect(() => {
    if (canInvite && currentOrganization) {
      loadPendingInvites();
      fetchOrgMembers();
    }
  }, [canInvite, currentOrganization, loadPendingInvites, fetchOrgMembers]);

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
    <Card className="shadow-card rounded-xl">
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
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 space-y-2">
              <Label htmlFor="invite-email">Email address</Label>
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
            <div className="w-full sm:w-40 space-y-2">
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
          <Button type="submit" disabled={isSubmitting || !email.trim()} className="w-full sm:w-auto">
            {isSubmitting ? (
              <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…</>
            ) : (
              <><Send className="mr-2 h-4 w-4" /> Send invitation</>
            )}
          </Button>
        </form>

        {inviteUrl && <InviteLinkBlock url={inviteUrl} onCopy={() => copyToClipboard(inviteUrl)} />}

        {!loadingInvites && pendingInvites.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[hsl(var(--dd-rule))]">
            <TeamSubHeader title="Pending invites" count={pendingInvites.length} />
            <div className="space-y-2">
              {pendingInvites.map((invite) => (
                <PendingInviteRow
                  key={invite.id}
                  email={invite.invited_email}
                  expiresAt={invite.expires_at}
                  roleLabel={invite.membership_role}
                  avatarVariant="accent"
                  onCopy={() => copyToClipboard(`${window.location.origin}/invite/${invite.token}`)}
                  onResend={() => handleResend(invite)}
                  onRevoke={() => handleRevoke(invite.id)}
                />
              ))}
            </div>
          </div>
        )}

        {orgMembers.length > 0 && (
          <div className="space-y-2 pt-2 border-t border-[hsl(var(--dd-rule))]">
            <TeamSubHeader title="Current members" count={orgMembers.length} action={(
              <div className="flex rounded-md border border-border bg-muted/30 p-0.5" role="group" aria-label={t('team.view')}>
                <Button type="button" variant="ghost" size="sm" className={`h-7 rounded px-2 text-xs ${memberView === 'list' ? 'bg-background shadow-sm' : ''}`} onClick={() => setMemberView('list')}><List className="h-3.5 w-3.5" />{t('team.list')}</Button>
                <Button type="button" variant="ghost" size="sm" className={`h-7 rounded px-2 text-xs ${memberView === 'chart' ? 'bg-background shadow-sm' : ''}`} onClick={() => setMemberView('chart')}><Network className="h-3.5 w-3.5" />{t('team.chart')}</Button>
              </div>
            )} />
            {memberView === 'list' ? <div>
              {orgMembers.map((member) => (
                <MemberRow
                  key={member.id}
                  name={member.displayName}
                  initials={member.initials}
                  roleLabel={member.role}
                />
              ))}
            </div> : (
              <div className="overflow-x-auto rounded-lg border border-border bg-muted/20 p-5">
                {[
                  { label: t('team.owner'), members: orgMembers.filter(member => member.role === 'owner') },
                  { label: t('team.leadership'), members: orgMembers.filter(member => ['admin', 'manager'].includes(member.role)) },
                  { label: t('team.internal'), members: orgMembers.filter(member => ['member', 'viewer'].includes(member.role) && member.actorType !== 'coach') },
                  { label: t('team.external'), members: [...orgMembers.filter(member => member.actorType === 'coach' && ['member', 'viewer'].includes(member.role)), ...externalCoaches] },
                ].filter(lane => lane.members.length > 0).map((lane, index, lanes) => (
                  <div key={lane.label} className="relative pb-7 last:pb-0">
                    {index < lanes.length - 1 && <span className="absolute left-1/2 top-full h-7 w-px -translate-y-7 bg-border" aria-hidden />}
                    <p className="mb-2 text-center text-[10px] font-semibold uppercase text-muted-foreground">{lane.label}</p>
                    <div className="flex min-w-max justify-center gap-3">
                      {lane.members.map(member => (
                        <div key={member.id} className="flex w-44 items-center gap-2 rounded-lg border border-border bg-background p-3 shadow-sm">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{member.initials}</div>
                          <div className="min-w-0"><p className="truncate text-xs font-semibold text-foreground">{member.displayName}</p><span className="mt-1 inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[10px] capitalize text-muted-foreground">{member.actorType === 'coach' ? t('team.coach') : member.role}</span></div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

