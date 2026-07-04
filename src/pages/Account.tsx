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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useLanguage, Language } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGDPR } from '@/hooks/useGDPR';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { useActiveRole } from '@/hooks/useActiveRole';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeText } from '@/lib/sanitize';
import type { Tables } from '@/integrations/supabase/types';
import { useToast } from '@/hooks/use-toast';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { InviteTeamMembers } from '@/components/InviteTeamMembers';
import { InviteCoach } from '@/components/InviteCoach';
import { InviteOemUser } from '@/components/InviteOemUser';
import { OemModeToggle } from '@/components/OemModeToggle';
import {
  User, Shield, Download, Trash2, Monitor, Smartphone, Globe,
  Mail, CheckCircle, Building2, Users, Activity, Link2, Key,
  ChevronRight, Pencil, Save, X, Bell, Camera, ShieldAlert, AlertTriangle
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
  const { actorType } = useActiveRole();
  const { toast } = useToast();
  const { language, setLanguage } = useLanguage();
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
  const [notifPrefs, setNotifPrefs] = useState({
    email_enabled:      true,
    weekly_digest:      true,
    stale_action_nudge: true,
    milestone_alerts:   true,
  });
  const [notifPrefsLoading, setNotifPrefsLoading] = useState(false);
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
          display_name: sanitizeText(validation.data.display_name),
          job_title: sanitizeText(validation.data.job_title),
          department: sanitizeText(validation.data.department),
          bio: sanitizeText(validation.data.bio),
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
        .update({ name: sanitizeText(orgName.trim()) })
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

  // Load notification preferences
  useEffect(() => {
    if (!user) return;
    setNotifPrefsLoading(true);
    supabase
      .from('notification_preferences')
      .select('email_enabled, weekly_digest, stale_action_nudge, milestone_alerts')
      .eq('user_id', user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setNotifPrefs({
            email_enabled:      data.email_enabled,
            weekly_digest:      data.weekly_digest,
            stale_action_nudge: data.stale_action_nudge,
            milestone_alerts:   data.milestone_alerts,
          });
        }
        setNotifPrefsLoading(false);
      });
  }, [user]);

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

  const NAV_ITEMS = [
    { value: 'profile',       label: 'Profile',        icon: User },
    { value: 'organization',  label: 'Organization',   icon: Building2 },
    ...(canManageTeam    ? [{ value: 'team',     label: 'Team',        icon: Users }]    : []),
    ...(hasActivityData  ? [{ value: 'activity', label: 'Activity',    icon: Activity }] : []),
    { value: 'security',      label: 'Security',       icon: Shield },
    { value: 'privacy',       label: 'Privacy',        icon: Globe },
    { value: 'notifications', label: 'Notifications',  icon: Bell },
    { value: 'integrations',  label: 'Integrations',   icon: Link2 },
  ];

  const Section = ({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) => (
    <section className="border-b border-[hsl(var(--dd-rule))] pb-6 last:border-0 last:pb-0">
      <div className="mb-4">
        <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-muted-foreground">{title}</div>
        {description && <div className="text-xs text-muted-foreground/80 mt-1">{description}</div>}
      </div>
      {children}
    </section>
  );

  const Row = ({ label, description, children }: { label: string; description?: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-center justify-between gap-6 py-3">
      <div className="min-w-0">
        <div className="text-sm font-medium text-foreground">{label}</div>
        {description && <div className="text-xs text-muted-foreground mt-0.5">{description}</div>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[hsl(var(--dd-fog))]">
      <div className="border-b border-[hsl(var(--dd-rule))] bg-white px-6 py-4">
        <h1 className="text-lg font-semibold text-foreground">Account Settings</h1>
      </div>

      <div className="mx-auto max-w-[1200px] px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} orientation="vertical" className="flex gap-8 items-start">
          {/* Left rail */}
          <aside className="w-[240px] shrink-0 lg:w-[240px] max-lg:w-[64px] sticky top-6 self-start">
            <TabsList className="flex flex-col h-auto bg-transparent p-0 gap-0.5 w-full items-stretch">
              {NAV_ITEMS.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.value;
                return (
                  <TabsTrigger
                    key={item.value}
                    value={item.value}
                    className={`relative justify-start gap-3 h-10 px-3 rounded-md text-sm font-medium transition-colors
                      data-[state=active]:bg-[hsl(var(--dd-accent-light))]/60
                      data-[state=active]:text-[hsl(var(--dd-accent))]
                      data-[state=active]:shadow-none
                      hover:bg-[hsl(var(--dd-fog))]
                      max-lg:justify-center max-lg:px-0`}
                  >
                    {isActive && (
                      <span className="absolute left-0 top-1.5 bottom-1.5 w-[3px] rounded-r bg-[hsl(var(--dd-accent))]" />
                    )}
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    <span className="max-lg:hidden">{item.label}</span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </aside>

          {/* Content pane */}
          <div className="flex-1 min-w-0 max-w-[720px]">
            {/* Compact identity header */}
            <div className="mb-6">
              <div className="flex items-center gap-4">
                <div className="relative group shrink-0">
                  <div className="w-14 h-14 rounded-full bg-[hsl(var(--dd-accent))] text-white flex items-center justify-center text-lg font-semibold">
                    {getInitials(displayName || user.email || '')}
                  </div>
                  <button
                    type="button"
                    onClick={() => toast({ title: 'Photo upload', description: 'Avatar upload coming soon' })}
                    className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    aria-label="Change photo"
                  >
                    <Camera className="h-4 w-4 text-white" />
                  </button>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-serif text-[24px] leading-tight text-foreground truncate" style={{ fontFamily: 'var(--font-serif, "Instrument Serif", serif)' }}>
                    {displayName || user.email}
                  </div>
                  <div className="text-sm text-muted-foreground mt-0.5 truncate">
                    {(currentMembership?.role || 'member').charAt(0).toUpperCase() + (currentMembership?.role || 'member').slice(1)} · {user.email}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-2">
                    <span className="inline-flex items-center bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] text-[11px] px-2 py-0.5 rounded-full font-medium">
                      {(currentMembership?.role || 'member').charAt(0).toUpperCase() + (currentMembership?.role || 'member').slice(1)}
                    </span>
                    {user.email_confirmed_at && (
                      <span className="inline-flex items-center gap-1 bg-[hsl(var(--dd-green-light))] text-[hsl(var(--dd-green))] text-[11px] px-2 py-0.5 rounded-full font-medium">
                        <CheckCircle className="h-3 w-3" /> Verified
                      </span>
                    )}
                    {currentOrganization && (
                      <span className="inline-flex items-center bg-[hsl(var(--dd-fog))] text-muted-foreground text-[11px] px-2 py-0.5 rounded-full font-medium border border-[hsl(var(--dd-rule))]">
                        {currentOrganization.name}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Single-line meta strip (replaces 4 stat cards) */}
              <div className="mt-4 pt-4 border-t border-[hsl(var(--dd-rule))] flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                <span><span className="font-mono text-foreground tabular-nums" style={{ fontFamily: 'var(--font-mono, "DM Mono", monospace)' }}>{completedAssessments.length}</span> assessments</span>
                {latestCompleted?.overall_score != null && (
                  <span>Latest <span className="font-mono text-foreground tabular-nums" style={{ fontFamily: 'var(--font-mono, "DM Mono", monospace)' }}>{Math.round(latestCompleted.overall_score)}/100</span></span>
                )}
                {latestCompleted?.completed_at && (
                  <span>Last on <span className="text-foreground">{format(new Date(latestCompleted.completed_at), 'MMM d, yyyy')}</span></span>
                )}
                <span><span className="font-mono text-foreground tabular-nums" style={{ fontFamily: 'var(--font-mono, "DM Mono", monospace)' }}>{organizations.length}</span> {organizations.length === 1 ? 'organization' : 'organizations'}</span>
              </div>
            </div>

            {/* ── PROFILE ── */}
            <TabsContent value="profile" className="mt-0 space-y-6">
              <Section title="Personal information">
                <div className="flex justify-end mb-3 -mt-2">
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
                <div className="grid grid-cols-2 gap-4">
                  {[
                    { label: 'Display name', value: displayName, onChange: setDisplayName, readOnly: false },
                    { label: 'Email address', value: user.email || '', onChange: () => {}, readOnly: true },
                    { label: 'Job title', value: jobTitle, onChange: setJobTitle, readOnly: false },
                    { label: 'Department', value: department, onChange: setDepartment, readOnly: false },
                  ].map(field => (
                    <div key={field.label}>
                      <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">{field.label}</div>
                      {isEditingPersonal && !field.readOnly ? (
                        <Input value={field.value} onChange={e => field.onChange(e.target.value)} className="text-sm mt-1.5" />
                      ) : (
                        <div className="text-[15px] text-foreground mt-1.5">{field.value || '—'}</div>
                      )}
                    </div>
                  ))}
                  <div className="col-span-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Bio</div>
                    {isEditingPersonal ? (
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} className="text-sm mt-1.5" />
                    ) : (
                      <div className="text-[15px] text-foreground mt-1.5">{bio || '—'}</div>
                    )}
                  </div>
                </div>
              </Section>

              <Section title="Preferences">
                <div className="flex justify-end mb-3 -mt-2">
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
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Language</div>
                    <Select value={language} onValueChange={(v) => setLanguage(v as Language)}>
                      <SelectTrigger className="text-sm mt-1.5 w-full"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="de">Deutsch</SelectItem>
                        <SelectItem value="fr">Français</SelectItem>
                        <SelectItem value="es">Español</SelectItem>
                        <SelectItem value="it">Italiano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Timezone</div>
                    {isEditingPreferences ? (
                      <Input value={timezone} onChange={e => setTimezone(e.target.value)} className="text-sm mt-1.5" />
                    ) : (
                      <div className="text-[15px] text-foreground mt-1.5">{timezone || 'UTC'}</div>
                    )}
                  </div>
                  <div>
                    <div className="text-[11px] font-medium uppercase tracking-[0.04em] text-muted-foreground">Account created</div>
                    <div className="text-[15px] text-muted-foreground mt-1.5">
                      {user.created_at ? format(new Date(user.created_at), 'PPP') : '—'}
                    </div>
                  </div>
                </div>
              </Section>
            </TabsContent>

            {/* ── ORGANIZATION ── */}
            <TabsContent value="organization" className="mt-0 space-y-6">
              {currentOrganization && (
                <OrganizationSettings organizationId={currentOrganization.id} isAdmin={isOrgAdmin} />
              )}
              <OemModeToggle />
            </TabsContent>

            {/* ── TEAM ── */}
            <TabsContent value="team" className="mt-0">
              {canManageTeam && (
                <div className="space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-xl bg-[hsl(var(--dd-accent-light))] text-[hsl(var(--dd-accent))] flex items-center justify-center shrink-0">
                      <Users className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-semibold tracking-tight">Team management</h2>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        Invite colleagues, coaches, and OEM programme managers. Manage pending invites and revoke access at any time.
                      </p>
                    </div>
                  </div>
                  <InviteTeamMembers />
                  <InviteCoach />
                  {actorType === 'oem' && <InviteOemUser />}
                </div>
              )}
            </TabsContent>

            {/* ── ACTIVITY ── */}
            <TabsContent value="activity" className="mt-0">
              {hasActivityData && (
                <Section title={`Completed assessments (${completedAssessments.length})`} description="Click any assessment to view its results">
                  {assessmentsLoading ? (
                    <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                  ) : (
                    <div className="space-y-2">
                      {completedAssessments.map(assessment => (
                        <div key={assessment.id} onClick={() => navigate(`/app/results/${assessment.id}`)}
                          className="flex items-center gap-3 p-3.5 rounded-lg border border-[hsl(var(--dd-rule))] cursor-pointer hover:border-[hsl(var(--dd-accent-mid))] transition-colors bg-white">
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
                </Section>
              )}
            </TabsContent>

            {/* ── SECURITY ── */}
            <TabsContent value="security" className="mt-0 space-y-6">
              <Section title="Password" description="Manage your account password">
                <Row
                  label="Account password"
                  description={
                    <span className="inline-flex items-center gap-1 mt-0.5 text-[11px] font-medium text-[hsl(var(--dd-amber))] bg-[hsl(var(--dd-amber-light,var(--dd-fog)))] px-1.5 py-0.5 rounded">
                      <AlertTriangle className="h-3 w-3" /> Never changed
                    </span> as any
                  }
                >
                  <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                    Change password
                  </Button>
                </Row>
                {isChangingPassword && (
                  <div className="mt-3 p-4 bg-[hsl(var(--dd-fog))] rounded-lg space-y-3 border border-[hsl(var(--dd-rule))]">
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
                <div className="border-t border-[hsl(var(--dd-rule))] mt-2">
                  <Row label="Forgot your password?" description={`Send a reset link to ${user.email}`}>
                    <Button variant="outline" size="sm" onClick={async () => {
                      await supabase.auth.resetPasswordForEmail(user.email!, { redirectTo: window.location.origin + '/auth/callback' });
                      toast({ title: 'Reset link sent', description: `Check ${user.email}` });
                    }}>
                      Send reset link
                    </Button>
                  </Row>
                </div>
              </Section>

              <Section title="Two-factor authentication">
                <div className="flex items-start gap-3 p-4 rounded-lg bg-[hsl(var(--dd-amber-light,var(--dd-fog)))] border-l-4 border-[hsl(var(--dd-amber))]">
                  <ShieldAlert className="h-5 w-5 text-[hsl(var(--dd-amber))] shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <div className="text-sm font-medium text-foreground">Two-factor authentication is not set up</div>
                    <div className="text-xs text-muted-foreground mt-0.5">Add an authenticator app (Google Authenticator, Authy) to protect your account.</div>
                  </div>
                  <Button size="sm" onClick={() => toast({ title: 'MFA setup', description: 'Configure via your authenticator app' })}>
                    Set up
                  </Button>
                </div>
              </Section>

              <Section title="Active sessions" description="Devices currently signed in to your account">
                {sessionsLoading ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                ) : sessions.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No active sessions found</p>
                ) : (
                  <div>
                    {sessions.map((session: any) => (
                      <div key={session.id} className="flex items-center gap-3 py-3 border-b border-[hsl(var(--dd-rule))] last:border-0">
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
                    <div className="pt-3">
                      <Button variant="outline" size="sm" className="text-xs text-destructive border-destructive/30" onClick={async () => { await supabase.auth.signOut({ scope: 'others' }); toast({ title: 'All other sessions revoked' }); fetchSessions(); }}>
                        Revoke all other sessions
                      </Button>
                    </div>
                  </div>
                )}
              </Section>
            </TabsContent>

            {/* ── PRIVACY ── */}
            <TabsContent value="privacy" className="mt-0 space-y-6">
              <Section title="Privacy preferences" description="Control how your data is used">
                <div className="divide-y divide-[hsl(var(--dd-rule))]">
                  <Row label="Analytics tracking" description="Help us improve by sharing anonymous usage data">
                    <Switch checked={analyticsConsent} onCheckedChange={async (v) => { setAnalyticsConsent(v); const success = await updateConsent('analytics', v); if (!success) setAnalyticsConsent(!v); }} />
                  </Row>
                  <Row label="Marketing communications" description="Receive updates about new features">
                    <Switch checked={marketingConsent} onCheckedChange={async (v) => { setMarketingConsent(v); const success = await updateConsent('marketing', v); if (!success) setMarketingConsent(!v); }} />
                  </Row>
                </div>
              </Section>

              <Section title="Data management">
                <Row label="Export your data" description="Download a copy of all your data">
                  <Button variant="outline" size="sm" onClick={handleExportData} disabled={gdprLoading}>
                    <Download className="h-4 w-4 mr-1" /> Export data
                  </Button>
                </Row>
              </Section>

              <div className="rounded-xl border border-destructive/20 bg-destructive/[0.02] p-5">
                <div className="text-[11px] font-semibold uppercase tracking-[0.06em] text-destructive mb-1">Danger zone</div>
                <div className="text-xs text-muted-foreground mb-3">Irreversible actions — proceed with care</div>
                <Row label="Delete account" description="Permanently remove your account and all data">
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
                </Row>
              </div>
            </TabsContent>

            {/* ── NOTIFICATIONS ── */}
            <TabsContent value="notifications" className="mt-0">
              <Section title="Notification preferences" description="Choose which notifications you receive">
                {notifPrefsLoading ? (
                  <div className="flex items-center justify-center py-6">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary" />
                  </div>
                ) : (
                  <div className="divide-y divide-[hsl(var(--dd-rule))]">
                    {([
                      { key: 'email_enabled'      as const, label: 'Email notifications',  desc: 'Receive notifications by email' },
                      { key: 'weekly_digest'      as const, label: 'Weekly action digest', desc: 'Monday morning summary of open and overdue actions' },
                      { key: 'stale_action_nudge' as const, label: 'Stale action nudges',  desc: 'Get reminded when actions have had no update for 7+ days' },
                      { key: 'milestone_alerts'   as const, label: 'Milestone alerts',     desc: 'Notifications when action completion milestones are reached' },
                    ]).map(({ key, label, desc }) => (
                      <Row key={key} label={label} description={desc}>
                        <Switch
                          checked={notifPrefs[key]}
                          onCheckedChange={async (value) => {
                            const prev = notifPrefs[key];
                            setNotifPrefs(p => ({ ...p, [key]: value }));
                            const { error } = await supabase
                              .from('notification_preferences')
                              .upsert({ user_id: user.id, [key]: value }, { onConflict: 'user_id' });
                            if (error) {
                              setNotifPrefs(p => ({ ...p, [key]: prev }));
                              toast({ title: 'Could not save preference', variant: 'destructive' });
                            }
                          }}
                        />
                      </Row>
                    ))}
                  </div>
                )}
              </Section>
            </TabsContent>

            {/* ── INTEGRATIONS ── */}
            <TabsContent value="integrations" className="mt-0 space-y-6">
              <Section title="Connected platforms" description="Manage your connected accounts and services">
                <div className="divide-y divide-[hsl(var(--dd-rule))]">
                  {[
                    { name: 'Google Account', desc: 'Connect your Google account', icon: Mail, bg: 'bg-[hsl(var(--dd-red-light))]', iconColor: 'text-[hsl(var(--dd-red))]' },
                    { name: 'Microsoft 365', desc: 'Connect your Microsoft account', icon: Building2, bg: 'bg-[hsl(var(--dd-accent-light))]', iconColor: 'text-[hsl(var(--dd-accent))]' },
                  ].map(p => (
                    <div key={p.name} className="flex justify-between items-center py-3">
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
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  Integrations are available in enterprise configuration. Contact your administrator to enable.
                </p>
              </Section>

              <Section title="API access" description="Manage API tokens for external integrations">
                <div className="text-center py-6">
                  <Key className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-sm text-muted-foreground">No API tokens configured</p>
                  <Badge variant="outline" className="text-muted-foreground mt-2">Coming soon</Badge>
                  <div className="mt-3">
                    <Button variant="outline" disabled>Generate API token</Button>
                  </div>
                </div>
              </Section>
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
