import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGDPR } from '@/hooks/useGDPR';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { InviteTeamMembers } from '@/components/InviteTeamMembers';
import { InviteCoach } from '@/components/InviteCoach';
import { OemModeToggle } from '@/components/OemModeToggle';
import { 
  User, Shield, Download, Trash2, Monitor, Smartphone, Globe, 
  Mail, CheckCircle, Building2, Users, Activity, Link2, Key,
  ChevronRight, Pencil, Save, X
} from 'lucide-react';
import { format } from 'date-fns';
import { profileSchema } from '@/lib/validationSchemas';

interface AssessmentRecord {
  id: string;
  overall_score: number | null;
  status: string;
  completed_at: string | null;
  created_at: string;
}

const ROLES_MATRIX = [
  { permission: 'View assessments & results', owner: true,  admin: true,  member: true,  viewer: true  },
  { permission: 'Create assessments',         owner: true,  admin: true,  member: true,  viewer: false },
  { permission: 'Edit action plans',          owner: true,  admin: true,  member: true,  viewer: false },
  { permission: 'Export PDF reports',         owner: true,  admin: true,  member: true,  viewer: true  },
  { permission: 'Manage organization',        owner: true,  admin: true,  member: false, viewer: false },
  { permission: 'Edit organization settings', owner: true,  admin: true,  member: false, viewer: false },
  { permission: 'Invite members',             owner: true,  admin: true,  member: false, viewer: false },
  { permission: 'Assign coaches',             owner: true,  admin: true,  member: false, viewer: false },
  { permission: 'Delete records',             owner: true,  admin: true,  member: false, viewer: false },
  { permission: 'Delete organization',        owner: true,  admin: false, member: false, viewer: false },
];

const Account = () => {
  useEffect(() => { document.title = 'Account Settings — Dealer Diagnostic'; }, []);
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading, fetchSessions, revokeSession } = useSessionManager();
  const { exportUserData, deleteAccount, updateConsent, loading: gdprLoading } = useGDPR();
  const { organizations, currentOrganization, switchOrganization, userMemberships } = useMultiTenant();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [profile, setProfile] = useState<Tables<'profiles'> | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [displayName, setDisplayName] = useState('');
  const [jobTitle, setJobTitle] = useState('');
  const [department, setDepartment] = useState('');
  const [bio, setBio] = useState('');
  const [timezone, setTimezone] = useState('UTC');
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);
  const [activeTab, setActiveTab] = useState('profile');
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);
  const [orgEditing, setOrgEditing] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSaving, setOrgSaving] = useState(false);
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);

  const [isEditingPersonal, setIsEditingPersonal] = useState(false);
  const [isEditingPreferences, setIsEditingPreferences] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStrength, setPasswordStrength] = useState(0);

  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const isOrgAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';
  const currentRole = currentMembership?.role || 'viewer';

  const fetchProfile = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      setProfile(data);
      setDisplayName(data?.display_name || '');
      setJobTitle(data?.job_title || '');
      setDepartment(data?.department || '');
      setBio(data?.bio || '');
      setTimezone(data?.timezone || 'UTC');
    } catch (error: Error | unknown) {
      console.error('Error fetching profile:', error);
      toast({ title: "Error", description: "Failed to load profile data", variant: "destructive" });
    } finally {
      setProfileLoading(false);
    }
  };

  const fetchAssessments = async () => {
    if (!user) return;
    try {
      const { data, error } = await supabase
        .from('assessments')
        .select('id, overall_score, status, completed_at, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);
      if (error) throw error;
      setAssessments(data || []);
    } catch (error) {
      console.error('Error fetching assessments:', error);
    } finally {
      setAssessmentsLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!user) return;
    const validation = profileSchema.safeParse({ display_name: displayName, job_title: jobTitle, department, bio, timezone });
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: "Validation Error", description: firstError?.message || "Invalid input", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: validation.data.display_name,
          job_title: validation.data.job_title,
          department: validation.data.department,
          bio: validation.data.bio,
          timezone: validation.data.timezone,
        })
        .eq('user_id', user.id);
      if (error) throw error;
      setProfile((prev: any) => ({ ...prev, display_name: displayName.trim(), job_title: jobTitle.trim(), department: department.trim(), bio: bio.trim(), timezone }));
      toast({ title: "Profile updated", description: "Your profile has been saved successfully" });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({ title: "Update failed", description: error.message || "Failed to update profile", variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  const saveOrgName = async () => {
    if (!currentOrganization || !orgName.trim()) return;
    setOrgSaving(true);
    try {
      const { error } = await supabase
        .from('organizations')
        .update({ name: orgName.trim() })
        .eq('id', currentOrganization.id);
      if (error) throw error;
      toast({ title: "Organization updated", description: "Organization name has been saved" });
      setOrgEditing(false);
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({ title: "Update failed", description: error.message || "Failed to update organization", variant: "destructive" });
    } finally {
      setOrgSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    const success = await revokeSession(sessionId);
    toast(success 
      ? { title: "Session revoked", description: "The session has been terminated" }
      : { title: "Error", description: "Failed to revoke session", variant: "destructive" }
    );
  };

  const handleExportData = async () => { await exportUserData(); };

  const handleDeleteAccount = async () => {
    if (deleteConfirmStep === 0) { setDeleteConfirmStep(1); return; }
    const success = await deleteAccount();
    if (success) setDeleteConfirmStep(0);
  };

  const getDeviceIcon = (deviceType: string) => {
    return deviceType?.toLowerCase() === 'mobile' 
      ? <Smartphone className="h-4 w-4" /> 
      : <Monitor className="h-4 w-4" />;
  };

  const maskIP = (ip: string) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) return `${parts[0]}.${parts[1]}.***.**`;
    return ip.split(':')[0] + ':****';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    const parts = name.split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const calculatePasswordStrength = (pw: string): number => {
    let score = 0;
    if (pw.length >= 8) score++;
    if (pw.length >= 12) score++;
    if (/[A-Z]/.test(pw)) score++;
    if (/[0-9]/.test(pw)) score++;
    if (/[^A-Za-z0-9]/.test(pw)) score++;
    return score;
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match", variant: "destructive" });
      return;
    }
    if (newPassword.length < 8) {
      toast({ title: "Password too short", description: "Minimum 8 characters required", variant: "destructive" });
      return;
    }
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      if (error) throw error;
      toast({ title: "Password updated", description: "Your password has been changed successfully" });
      setIsChangingPassword(false);
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
    } catch (error: any) {
      toast({ title: "Update failed", description: error.message, variant: "destructive" });
    }
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
      fetchAssessments();
    }
  }, [user]);

  useEffect(() => {
    if (profile) {
      setAnalyticsConsent(profile.consent_analytics || false);
      setMarketingConsent(profile.consent_marketing || false);
    }
  }, [profile]);

  useEffect(() => {
    if (currentOrganization) {
      setOrgName(currentOrganization.name || '');
    }
  }, [currentOrganization]);

  if (!user) return <Navigate to="/auth" replace />;

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const hasActivityData = completedAssessments.length > 0;
  const latestCompleted = completedAssessments[0];
  const canManageTeam = currentMembership && ['owner', 'admin'].includes(currentMembership.role);

  return (
    <div className="min-h-screen bg-[hsl(var(--dd-fog))]">
      {/* Page header */}
      <div className="bg-white border-b border-[hsl(var(--dd-rule))] px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Account Settings</h1>
      </div>

      <div className="px-6 py-6">
        {/* Hero card */}
        <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-6 mb-5">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-[hsl(var(--dd-accent))] text-white flex items-center justify-center text-2xl font-medium shrink-0">
              {getInitials(displayName || user.email || '')}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xl font-semibold text-foreground">{displayName || user.email}</div>
              <div className="text-sm text-muted-foreground mt-0.5">
                {(currentMembership?.role || 'member').charAt(0).toUpperCase() + (currentMembership?.role || 'member').slice(1)} · {user.email}
              </div>
              <div className="flex gap-1.5 mt-2 flex-wrap">
                <span className="bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] text-xs px-2.5 py-0.5 rounded-full font-medium">
                  {(currentMembership?.role || 'member').charAt(0).toUpperCase() + (currentMembership?.role || 'member').slice(1)}
                </span>
                {user.email_confirmed_at && (
                  <span className="bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))] text-xs px-2.5 py-0.5 rounded-full font-medium">
                    ✓ Verified
                  </span>
                )}
                {currentOrganization && (
                  <span className="bg-[hsl(var(--dd-fog))] text-[hsl(var(--dd-muted))] text-xs px-2.5 py-0.5 rounded-full font-medium border border-[hsl(var(--dd-rule))]">
                    {currentOrganization.name}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3 mb-5">
          {[
            { label: 'Assessments', value: String(completedAssessments.length) },
            { label: 'Latest score', value: latestCompleted?.overall_score != null ? Math.round(latestCompleted.overall_score) + '/100' : '—' },
            { label: 'Last assessment', value: latestCompleted?.completed_at ? format(new Date(latestCompleted.completed_at), 'MMM d, yyyy') : '—' },
            { label: 'Organizations', value: String(organizations.length) },
          ].map(card => (
            <div key={card.label} className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-3 text-center">
              <div className="text-2xl font-semibold text-foreground">{card.value}</div>
              <div className="text-[11px] text-muted-foreground mt-0.5">{card.label}</div>
            </div>
          ))}
        </div>

        {/* Horizontal Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="h-10 bg-white border border-[hsl(var(--dd-rule))] w-full justify-evenly gap-0 rounded-xl mb-5 px-1">
            <TabsTrigger value="profile" className="gap-1.5 text-xs"><User className="h-3.5 w-3.5" />Edit Profile</TabsTrigger>
            <TabsTrigger value="organization" className="gap-1.5 text-xs"><Building2 className="h-3.5 w-3.5" />Organization</TabsTrigger>
            {canManageTeam && <TabsTrigger value="team" className="gap-1.5 text-xs"><Users className="h-3.5 w-3.5" />Team</TabsTrigger>}
            {hasActivityData && <TabsTrigger value="activity" className="gap-1.5 text-xs"><Activity className="h-3.5 w-3.5" />Activity</TabsTrigger>}
            <TabsTrigger value="security" className="gap-1.5 text-xs"><Shield className="h-3.5 w-3.5" />Password & Security</TabsTrigger>
            <TabsTrigger value="privacy" className="gap-1.5 text-xs"><Globe className="h-3.5 w-3.5" />Privacy</TabsTrigger>
            <TabsTrigger value="integrations" className="gap-1.5 text-xs"><Link2 className="h-3.5 w-3.5" />Integrations</TabsTrigger>
          </TabsList>

          {/* ── EDIT PROFILE ── */}
          <TabsContent value="profile">
            {/* Personal information card */}
            <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5 mb-3">
              <div className="flex justify-between items-center mb-4">
                <div className="text-base font-semibold text-foreground">Personal information</div>
                {!isEditingPersonal ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)} className="text-xs">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateProfile(); setIsEditingPersonal(false); }} disabled={saving} className="text-xs">
                      <Save className="h-3 w-3 mr-1" /> {saving ? 'Saving...' : 'Save'}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => { fetchProfile(); setIsEditingPersonal(false); }} className="text-xs">
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: 'DISPLAY NAME', value: displayName, onChange: setDisplayName, readOnly: false },
                  { label: 'EMAIL ADDRESS', value: user.email || '', onChange: () => {}, readOnly: true },
                  { label: 'JOB TITLE', value: jobTitle, onChange: setJobTitle, readOnly: false },
                  { label: 'DEPARTMENT', value: department, onChange: setDepartment, readOnly: false },
                ].map(field => (
                  <div key={field.label}>
                    <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{field.label}</div>
                    {isEditingPersonal && !field.readOnly ? (
                      <Input value={field.value} onChange={e => field.onChange(e.target.value)} className="text-sm mt-1" />
                    ) : (
                      <div className="text-sm font-normal text-foreground mt-1">{field.value || '—'}</div>
                    )}
                  </div>
                ))}
                <div className="col-span-2">
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">BIO</div>
                  {isEditingPersonal ? (
                    <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="text-sm mt-1" />
                  ) : (
                    <div className="text-sm font-normal text-foreground mt-1">{bio || '—'}</div>
                  )}
                </div>
              </div>
            </div>

            {/* Preferences card */}
            <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="text-base font-semibold text-foreground">Preferences</div>
                {!isEditingPreferences ? (
                  <Button variant="outline" size="sm" onClick={() => setIsEditingPreferences(true)} className="text-xs">
                    <Pencil className="h-3 w-3 mr-1" /> Edit
                  </Button>
                ) : (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => { updateProfile(); setIsEditingPreferences(false); toast({ title: 'Preferences saved' }); }} className="text-xs">
                      <Save className="h-3 w-3 mr-1" /> Save
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingPreferences(false)} className="text-xs">
                      <X className="h-3 w-3 mr-1" /> Cancel
                    </Button>
                  </div>
                )}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">TIMEZONE</div>
                  {isEditingPreferences ? (
                    <Input value={timezone} onChange={e => setTimezone(e.target.value)} className="text-sm mt-1" />
                  ) : (
                    <div className="text-sm text-foreground mt-1">{timezone || 'UTC'}</div>
                  )}
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">ACCOUNT CREATED</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {user.created_at ? format(new Date(user.created_at), 'PPP') : '—'}
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── ORGANIZATION ── */}
          <TabsContent value="organization">
            <div className="space-y-6">
              {currentOrganization && (
                <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                  <OrganizationSettings organizationId={currentOrganization.id} isAdmin={isOrgAdmin} />
                </div>
              )}
              <OemModeToggle />
            </div>
          </TabsContent>

          {/* ── TEAM ── */}
          <TabsContent value="team">
            {canManageTeam && (
              <div className="space-y-6">
                <InviteTeamMembers />
                <InviteCoach />
              </div>
            )}
          </TabsContent>

          {/* ── ACTIVITY ── */}
          <TabsContent value="activity">
            {hasActivityData && (
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">Completed assessments ({completedAssessments.length})</div>
                <div className="text-xs text-muted-foreground mb-4">Click any assessment to view its results</div>
                {assessmentsLoading ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                ) : (
                  <div className="space-y-2">
                    {completedAssessments.map(assessment => (
                      <div key={assessment.id} onClick={() => navigate(`/app/results/${assessment.id}`)}
                        className="flex items-center gap-3 p-3.5 rounded-lg border border-[hsl(var(--dd-rule))] cursor-pointer hover:border-[hsl(var(--dd-accent-mid))] transition-colors">
                        <div className="w-9 h-9 rounded-full bg-[hsl(var(--dd-green-light))] flex items-center justify-center">
                          <CheckCircle className="h-5 w-5 text-[hsl(var(--dd-green))]" />
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">Completed Assessment</div>
                          <div className="text-xs text-muted-foreground">{format(new Date(assessment.completed_at || assessment.created_at), 'PPP')}</div>
                        </div>
                        {assessment.overall_score != null && (
                          <div className="text-right">
                            <div className="text-lg font-bold text-[hsl(var(--dd-accent))]">{Math.round(assessment.overall_score)}%</div>
                            <div className="text-[11px] text-muted-foreground">Score</div>
                          </div>
                        )}
                        <ChevronRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>

          {/* ── PASSWORD & SECURITY ── */}
          <TabsContent value="security">
            <div className="space-y-3">
              {/* Password card */}
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">Password</div>
                <div className="text-xs text-muted-foreground mb-4">Manage your account password</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Current password</div>
                    <div className="text-xs text-muted-foreground">Last changed: account creation date</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                    Change password
                  </Button>
                </div>
                {isChangingPassword && (
                  <div className="mt-4 p-4 bg-[hsl(var(--dd-fog))] rounded-lg space-y-3">
                    <div>
                      <Label className="text-sm">Current password</Label>
                      <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-sm">New password</Label>
                      <Input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordStrength(calculatePasswordStrength(e.target.value)); }} placeholder="Min. 8 characters" className="mt-1" />
                      <div className="h-1 rounded bg-[hsl(var(--dd-rule))] mt-1.5 overflow-hidden">
                        <div className="h-full rounded transition-all duration-300" style={{
                          width: `${(passwordStrength / 5) * 100}%`,
                          background: passwordStrength <= 1 ? 'hsl(var(--dd-red))' : passwordStrength <= 2 ? 'hsl(var(--dd-amber))' : 'hsl(var(--dd-green))'
                        }} />
                      </div>
                      <div className="text-[11px] mt-1" style={{ color: passwordStrength <= 1 ? 'hsl(var(--dd-red))' : passwordStrength <= 2 ? 'hsl(var(--dd-amber))' : 'hsl(var(--dd-green))' }}>
                        {passwordStrength === 0 ? '' : passwordStrength <= 1 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength <= 3 ? 'Strong' : 'Very strong'}
                      </div>
                    </div>
                    <div>
                      <Label className="text-sm">Confirm new password</Label>
                      <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="mt-1" />
                    </div>
                    <div className="flex gap-2">
                      <Button onClick={handlePasswordUpdate}>Update password</Button>
                      <Button variant="ghost" onClick={() => { setIsChangingPassword(false); setNewPassword(''); setConfirmPassword(''); setCurrentPassword(''); }}>Cancel</Button>
                    </div>
                  </div>
                )}
                <div className="border-t border-[hsl(var(--dd-rule))] mt-4 pt-4 flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Forgot your password?</div>
                    <div className="text-xs text-muted-foreground">Send a reset link to {user.email}</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={async () => {
                    await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo: window.location.origin + '/auth/callback' });
                    toast({ title: 'Reset link sent', description: `Check ${user.email}` });
                  }}>
                    Send reset link
                  </Button>
                </div>
              </div>

              {/* 2FA card */}
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-4">Two-factor authentication</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm">Authenticator app (TOTP)</div>
                    <div className="text-xs text-muted-foreground">Use Google Authenticator, Authy, or similar</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-[hsl(var(--dd-fog))] text-muted-foreground text-xs px-2.5 py-0.5 rounded-full">Not configured</span>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'MFA setup', description: 'Configure via your authenticator app' })}>Set up</Button>
                  </div>
                </div>
              </div>

              {/* Active sessions */}
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">Active sessions</div>
                <div className="text-xs text-muted-foreground mb-4">Devices currently signed in to your account</div>
                {sessionsLoading ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active sessions found</p>
                ) : (
                  <div className="space-y-2">
                    {sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center gap-3 py-2.5 border-b border-[hsl(var(--dd-rule))]">
                        <div className="w-9 h-9 rounded-lg bg-[hsl(var(--dd-fog))] flex items-center justify-center shrink-0">
                          {getDeviceIcon(session.device_info?.device_type)}
                        </div>
                        <div className="flex-1">
                          <div className="text-sm font-medium">{session.device_info?.browser} on {session.device_info?.os}</div>
                          <div className="text-xs text-muted-foreground">{maskIP(session.ip_address)} · {format(new Date(session.last_seen), 'PPP')}</div>
                        </div>
                        <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30" onClick={() => handleRevokeSession(session.session_id)}>
                          Revoke
                        </Button>
                      </div>
                    ))}
                    <div className="pt-2">
                      <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30" onClick={async () => { await supabase.auth.signOut({ scope: 'others' }); toast({ title: 'All other sessions revoked' }); fetchSessions(); }}>
                        Revoke all other sessions
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>

          {/* ── PRIVACY ── */}
          <TabsContent value="privacy">
            <div className="space-y-3">
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">Privacy preferences</div>
                <div className="text-xs text-muted-foreground mb-4">Control how your data is used</div>
                <div className="flex justify-between items-center py-3 border-b border-[hsl(var(--dd-rule))]">
                  <div>
                    <div className="text-sm font-medium">Analytics tracking</div>
                    <div className="text-xs text-muted-foreground">Help us improve by sharing anonymous usage data</div>
                  </div>
                  <Switch checked={analyticsConsent} onCheckedChange={async (v) => { setAnalyticsConsent(v); const success = await updateConsent('analytics', v); if (!success) setAnalyticsConsent(!v); }} />
                </div>
                <div className="flex justify-between items-center py-3">
                  <div>
                    <div className="text-sm font-medium">Marketing communications</div>
                    <div className="text-xs text-muted-foreground">Receive updates about new features</div>
                  </div>
                  <Switch checked={marketingConsent} onCheckedChange={async (v) => { setMarketingConsent(v); const success = await updateConsent('marketing', v); if (!success) setMarketingConsent(!v); }} />
                </div>
              </div>

              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-4">Data management</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm">Export your data</div>
                    <div className="text-xs text-muted-foreground">Download a copy of all your data</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} disabled={gdprLoading}>
                    <Download className="h-4 w-4 mr-1" /> Export data
                  </Button>
                </div>
              </div>

              {/* Danger zone — Delete account lives ONLY here */}
              <div className="bg-white border border-destructive/20 rounded-xl p-5">
                <div className="text-sm font-medium text-destructive mb-1">Danger zone</div>
                <div className="text-xs text-muted-foreground mb-4">Irreversible actions — proceed with care</div>
                <div className="flex justify-between items-center">
                  <div>
                    <div className="text-sm font-medium">Delete account</div>
                    <div className="text-xs text-muted-foreground">Permanently remove your account and all data</div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-destructive border-destructive/30">Delete account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete account?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive text-destructive-foreground">Delete permanently</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ── INTEGRATIONS ── */}
          <TabsContent value="integrations">
            <div className="space-y-3">
              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">Connected platforms</div>
                <div className="text-xs text-muted-foreground mb-4">Manage your connected accounts and services</div>
                {[
                  { name: 'Google Account', desc: 'Connect your Google account', icon: Mail, bg: 'bg-[hsl(var(--dd-red-light))]', iconColor: 'text-[hsl(var(--dd-red))]' },
                  { name: 'Microsoft 365', desc: 'Connect your Microsoft account', icon: Building2, bg: 'bg-[hsl(var(--dd-accent-light))]', iconColor: 'text-[hsl(var(--dd-accent))]' },
                ].map(p => (
                  <div key={p.name} className="flex justify-between items-center py-3 border-b border-[hsl(var(--dd-rule))] last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full ${p.bg} flex items-center justify-center`}>
                        <p.icon className={`w-5 h-5 ${p.iconColor}`} />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{p.name}</div>
                        <div className="text-xs text-muted-foreground">{p.desc}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-muted-foreground">Coming soon</Badge>
                  </div>
                ))}
                <p className="text-xs text-muted-foreground mt-3">
                  Integrations are available in enterprise configuration. Contact your administrator to enable.
                </p>
              </div>

              <div className="bg-white border border-[hsl(var(--dd-rule))] rounded-xl p-5">
                <div className="text-sm font-medium mb-1">API access</div>
                <div className="text-xs text-muted-foreground mb-4">Manage API tokens for external integrations</div>
                <div className="text-center py-6">
                  <Key className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">No API tokens configured</p>
                  <Badge variant="outline" className="text-muted-foreground mt-2">Coming soon</Badge>
                  <Button variant="outline" className="mt-3" disabled>
                    Generate API token
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
