import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGDPR } from '@/hooks/useGDPR';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { OrganizationSettings } from '@/components/OrganizationSettings';
import { InviteTeamMembers } from '@/components/InviteTeamMembers';
import { 
  User, Shield, Download, Trash2, Monitor, Smartphone, Globe, 
  Mail, CheckCircle, Building2, Users, Activity, Link2, Key,
  ChevronRight, ArrowLeft, Pencil, Save, X
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
  { permission: 'Invite members',             owner: true,  admin: true,  member: true,  viewer: false },
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
  
  const [profile, setProfile] = useState<any>(null);
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

  // New state
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
    } catch (error: any) {
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

  const calculateProfileCompletion = () => {
    let completed = 0;
    const total = 6;
    if (displayName) completed++;
    if (user?.email) completed++;
    if (jobTitle) completed++;
    if (department) completed++;
    if (bio) completed++;
    if (currentOrganization) completed++;
    return Math.round((completed / total) * 100);
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

  const canManageTeam = currentMembership && ['owner', 'admin', 'member'].includes(currentMembership.role);

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-background-secondary, #F5F5F5)' }}>
      {/* Page header */}
      <div style={{ background: 'white', borderBottom: '0.5px solid var(--color-border-tertiary)', padding: '16px 24px' }}>
        <h1 style={{ fontSize: 18, fontWeight: 600, margin: 0 }}>Account Settings</h1>
      </div>

      {/* Two-column layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: 'calc(100vh - 49px)' }}>
        {/* LEFT SIDEBAR */}
        <div style={{
          background: 'white',
          borderRight: '0.5px solid var(--color-border-tertiary)',
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100%'
        }}>
          {/* User identity block */}
          <div style={{ padding: '16px', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                background: '#185FA5', color: 'white',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 500, flexShrink: 0
              }}>
                {getInitials(displayName || user.email || '')}
              </div>
              <div style={{ overflow: 'hidden' }}>
                <div style={{ fontSize: 14, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {displayName || user.email}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {currentMembership?.role} · {currentOrganization?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav style={{ padding: '8px 0', flex: 1 }}>
            {/* GROUP: Account */}
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', padding: '8px 16px 4px' }}>Account</div>
            {[
              { value: 'profile',      icon: User,      label: 'Edit profile' },
              { value: 'organization', icon: Building2, label: 'Organization' },
              ...(canManageTeam ? [{ value: 'team', icon: Users, label: 'Team' }] : []),
              ...(hasActivityData ? [{ value: 'activity', icon: Activity, label: 'Activity' }] : []),
            ].map(item => (
              <button key={item.value} onClick={() => setActiveTab(item.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', width: '100%', border: 'none',
                  background: activeTab === item.value ? '#E6F1FB' : 'transparent',
                  borderLeft: `2px solid ${activeTab === item.value ? '#185FA5' : 'transparent'}`,
                  color: activeTab === item.value ? '#185FA5' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === item.value ? 500 : 400,
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms'
                }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </button>
            ))}

            {/* GROUP: Secure */}
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', padding: '16px 16px 4px' }}>Secure</div>
            {[
              { value: 'security',     icon: Shield, label: 'Password & security' },
              { value: 'privacy',      icon: Globe,  label: 'Privacy' },
            ].map(item => (
              <button key={item.value} onClick={() => setActiveTab(item.value)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '8px 16px', width: '100%', border: 'none',
                  background: activeTab === item.value ? '#E6F1FB' : 'transparent',
                  borderLeft: `2px solid ${activeTab === item.value ? '#185FA5' : 'transparent'}`,
                  color: activeTab === item.value ? '#185FA5' : 'var(--color-text-secondary)',
                  fontWeight: activeTab === item.value ? 500 : 400,
                  fontSize: 13, cursor: 'pointer', textAlign: 'left',
                  transition: 'all 150ms'
                }}
              >
                <item.icon style={{ width: 16, height: 16, flexShrink: 0 }} />
                {item.label}
              </button>
            ))}

            {/* GROUP: Connect */}
            <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', padding: '16px 16px 4px' }}>Connect</div>
            <button onClick={() => setActiveTab('integrations')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', width: '100%', border: 'none',
                background: activeTab === 'integrations' ? '#E6F1FB' : 'transparent',
                borderLeft: `2px solid ${activeTab === 'integrations' ? '#185FA5' : 'transparent'}`,
                color: activeTab === 'integrations' ? '#185FA5' : 'var(--color-text-secondary)',
                fontWeight: activeTab === 'integrations' ? 500 : 400,
                fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms'
              }}
            >
              <Link2 style={{ width: 16, height: 16, flexShrink: 0 }} /> Integrations
            </button>
          </nav>

          {/* Danger zone — bottom of sidebar */}
          <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', padding: '8px 0' }}>
            <button onClick={() => setActiveTab('privacy')}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 16px', width: '100%', border: 'none',
                background: 'transparent', color: '#A32D2D',
                fontSize: 13, cursor: 'pointer', textAlign: 'left', transition: 'all 150ms'
              }}
            >
              <Trash2 style={{ width: 16, height: 16, flexShrink: 0 }} /> Delete account
            </button>
          </div>
        </div>

        {/* MAIN CONTENT */}
        <div style={{ padding: 24, overflowY: 'auto' }}>
          {/* STAT ROW — always visible */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 }}>
            {[
              { label: 'Assessments',    value: String(assessments.filter(a => a.status === 'completed').length), color: undefined },
              { label: 'Latest score',   value: latestCompleted?.overall_score != null ? Math.round(latestCompleted.overall_score) + '/100' : '—', color: '#185FA5' },
              { label: 'Last assessment',value: latestCompleted?.completed_at ? format(new Date(latestCompleted.completed_at), 'MMM d, yyyy') : '—', color: undefined },
              { label: 'Organizations',  value: String(organizations.length), color: undefined },
            ].map(card => (
              <div key={card.label} style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 10, padding: '12px 14px' }}>
                <div style={{ fontSize: 20, fontWeight: 500, color: card.color || 'var(--color-text-primary)' }}>{card.value}</div>
                <div style={{ fontSize: 11, color: 'var(--color-text-secondary)', marginTop: 2 }}>{card.label}</div>
              </div>
            ))}
          </div>

          {/* ── PROFILE ── */}
          {activeTab === 'profile' && (
            <div>
              {/* Hero + Completion row */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 16, marginBottom: 16, alignItems: 'start' }}>
                {/* Hero card */}
                <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                    <div style={{ position: 'relative', flexShrink: 0 }}>
                      <div style={{
                        width: 72, height: 72, borderRadius: '50%',
                        background: '#185FA5', color: 'white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: 22, fontWeight: 500
                      }}>
                        {getInitials(displayName || user.email || '')}
                      </div>
                      <div style={{
                        position: 'absolute', bottom: 0, right: 0,
                        width: 22, height: 22, borderRadius: '50%',
                        background: '#185FA5', border: '2px solid white',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer'
                      }}>
                        <Pencil style={{ width: 11, height: 11, color: 'white' }} />
                      </div>
                    </div>
                    <div style={{ flex: 1, overflow: 'hidden' }}>
                      <div style={{ fontSize: 18, fontWeight: 500 }}>{displayName || user.email}</div>
                      <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        {currentMembership?.role} · {user.email}
                      </div>
                      <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
                        <span style={{ background: '#E6F1FB', color: '#0C447C', fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>
                          {currentMembership?.role || 'member'}
                        </span>
                        {user.email_confirmed_at && (
                          <span style={{ background: '#EAF3DE', color: '#27500A', fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>
                            ✓ Verified
                          </span>
                        )}
                        {currentOrganization && (
                          <span style={{ background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>
                            {currentOrganization.name}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Completion card */}
                <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 12 }}>Profile completion</div>
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                    <svg width="80" height="80" viewBox="0 0 80 80">
                      <circle cx="40" cy="40" r="32" fill="none" stroke="var(--color-border-tertiary)" strokeWidth="8" />
                      <circle cx="40" cy="40" r="32" fill="none" stroke="#185FA5" strokeWidth="8"
                        strokeDasharray="201"
                        strokeDashoffset={201 - (201 * calculateProfileCompletion()) / 100}
                        strokeLinecap="round"
                        transform="rotate(-90 40 40)" />
                      <text x="40" y="45" textAnchor="middle" fontSize="14" fontWeight="500" fill="var(--color-text-primary)">
                        {calculateProfileCompletion()}%
                      </text>
                    </svg>
                  </div>
                  {[
                    { label: 'Display name',  done: !!displayName },
                    { label: 'Email',         done: !!user?.email },
                    { label: 'Job title',     done: !!jobTitle },
                    { label: 'Department',    done: !!department },
                    { label: 'Organization',  done: !!currentOrganization },
                    { label: 'Bio',           done: !!bio },
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, marginBottom: 4 }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', flexShrink: 0, background: item.done ? '#639922' : '#BA7517' }} />
                      <span style={{ color: 'var(--color-text-secondary)' }}>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Personal information card — inline edit */}
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20, marginBottom: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Personal information</div>
                  {!isEditingPersonal ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingPersonal(true)} style={{ fontSize: 12 }}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="sm" onClick={() => { updateProfile(); setIsEditingPersonal(false); }} disabled={saving} style={{ fontSize: 12, background: '#185FA5' }}>
                        <Save className="h-3 w-3 mr-1" /> {saving ? 'Saving...' : 'Save'}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => { fetchProfile(); setIsEditingPersonal(false); }} style={{ fontSize: 12 }}>
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'DISPLAY NAME', value: displayName, onChange: setDisplayName, readOnly: false },
                    { label: 'EMAIL ADDRESS', value: user.email || '', onChange: () => {}, readOnly: true },
                    { label: 'JOB TITLE', value: jobTitle, onChange: setJobTitle, readOnly: false },
                    { label: 'DEPARTMENT', value: department, onChange: setDepartment, readOnly: false },
                  ].map(field => (
                    <div key={field.label}>
                      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>{field.label}</div>
                      {isEditingPersonal && !field.readOnly ? (
                        <Input value={field.value} onChange={e => field.onChange(e.target.value)} style={{ fontSize: 14 }} />
                      ) : (
                        <div style={{ fontSize: 14, color: field.readOnly ? 'var(--color-text-secondary)' : 'var(--color-text-primary)' }}>{field.value || '—'}</div>
                      )}
                    </div>
                  ))}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>BIO</div>
                    {isEditingPersonal ? (
                      <Textarea value={bio} onChange={e => setBio(e.target.value)} rows={3} style={{ fontSize: 14 }} />
                    ) : (
                      <div style={{ fontSize: 14, color: bio ? 'var(--color-text-primary)' : 'var(--color-text-secondary)' }}>{bio || '—'}</div>
                    )}
                  </div>
                </div>
              </div>

              {/* Preferences card — inline edit */}
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 500 }}>Preferences</div>
                  {!isEditingPreferences ? (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingPreferences(true)} style={{ fontSize: 12 }}>
                      <Pencil className="h-3 w-3 mr-1" /> Edit
                    </Button>
                  ) : (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <Button size="sm" onClick={() => { updateProfile(); setIsEditingPreferences(false); toast({ title: 'Preferences saved' }); }} style={{ fontSize: 12, background: '#185FA5' }}>
                        <Save className="h-3 w-3 mr-1" /> Save
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => setIsEditingPreferences(false)} style={{ fontSize: 12 }}>
                        <X className="h-3 w-3 mr-1" /> Cancel
                      </Button>
                    </div>
                  )}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>TIMEZONE</div>
                    {isEditingPreferences ? (
                      <Input value={timezone} onChange={e => setTimezone(e.target.value)} style={{ fontSize: 14 }} />
                    ) : (
                      <div style={{ fontSize: 14 }}>{timezone || 'UTC'}</div>
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--color-text-tertiary)', marginBottom: 4 }}>ACCOUNT CREATED</div>
                    <div style={{ fontSize: 14, color: 'var(--color-text-secondary)' }}>
                      {user.created_at ? format(new Date(user.created_at), 'PPP') : '—'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── SECURITY ── */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {/* Password card */}
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Password</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Manage your account password</div>
                {/* Change password row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Current password</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Last changed: account creation date</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setIsChangingPassword(!isChangingPassword)}>
                    Change password
                  </Button>
                </div>
                {isChangingPassword && (
                  <div style={{ marginTop: 16, padding: 16, background: 'var(--color-background-secondary)', borderRadius: 8 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <div>
                        <Label style={{ fontSize: 13 }}>Current password</Label>
                        <Input type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} placeholder="Enter current password" className="mt-1" />
                      </div>
                      <div>
                        <Label style={{ fontSize: 13 }}>New password</Label>
                        <Input type="password" value={newPassword} onChange={e => { setNewPassword(e.target.value); setPasswordStrength(calculatePasswordStrength(e.target.value)); }} placeholder="Min. 8 characters" className="mt-1" />
                        <div style={{ height: 4, borderRadius: 2, background: 'var(--color-border-tertiary)', marginTop: 6, overflow: 'hidden' }}>
                          <div style={{
                            height: '100%', borderRadius: 2,
                            width: `${(passwordStrength / 5) * 100}%`,
                            background: passwordStrength <= 1 ? '#E24B4A' : passwordStrength <= 2 ? '#BA7517' : passwordStrength <= 3 ? '#639922' : '#1D9E75',
                            transition: 'width 0.3s, background 0.3s'
                          }} />
                        </div>
                        <div style={{ fontSize: 11, marginTop: 3, color: passwordStrength <= 1 ? '#E24B4A' : passwordStrength <= 2 ? '#BA7517' : passwordStrength <= 3 ? '#639922' : '#1D9E75' }}>
                          {passwordStrength === 0 ? '' : passwordStrength <= 1 ? 'Weak' : passwordStrength <= 2 ? 'Fair' : passwordStrength <= 3 ? 'Strong' : 'Very strong'}
                        </div>
                      </div>
                      <div>
                        <Label style={{ fontSize: 13 }}>Confirm new password</Label>
                        <Input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="Repeat new password" className="mt-1" />
                      </div>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button onClick={handlePasswordUpdate} style={{ background: '#185FA5', color: 'white' }}>Update password</Button>
                        <Button variant="ghost" onClick={() => { setIsChangingPassword(false); setNewPassword(''); setConfirmPassword(''); setCurrentPassword(''); }}>Cancel</Button>
                      </div>
                    </div>
                  </div>
                )}
                {/* Forgot password row */}
                <div style={{ borderTop: '0.5px solid var(--color-border-tertiary)', marginTop: 16, paddingTop: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Forgot your password?</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Send a reset link to {user.email}</div>
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
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Two-factor authentication</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14 }}>Authenticator app (TOTP)</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Use Google Authenticator, Authy, or similar</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ background: 'var(--color-background-secondary)', color: 'var(--color-text-secondary)', fontSize: 12, padding: '2px 10px', borderRadius: 20 }}>Not configured</span>
                    <Button variant="outline" size="sm" onClick={() => toast({ title: 'MFA setup', description: 'Configure via your authenticator app' })}>Set up</Button>
                  </div>
                </div>
              </div>

              {/* Active sessions card */}
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Active sessions</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Devices currently signed in to your account</div>
                {sessionsLoading ? (
                  <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
                ) : sessions.length === 0 ? (
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No active sessions found</p>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {sessions.map((session: any) => (
                      <div key={session.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--color-background-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          {getDeviceIcon(session.device_info?.device_type)}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 14, fontWeight: 500 }}>{session.device_info?.browser} on {session.device_info?.os}</div>
                          <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{maskIP(session.ip_address)} · {format(new Date(session.last_seen), 'PPP')}</div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session.session_id)} style={{ fontSize: 12, borderColor: '#E24B4A', color: '#A32D2D' }}>
                          Revoke
                        </Button>
                      </div>
                    ))}
                    <div style={{ paddingTop: 8 }}>
                      <Button variant="outline" size="sm" onClick={async () => { await supabase.auth.signOut({ scope: 'others' }); toast({ title: 'All other sessions revoked' }); fetchSessions(); }} style={{ fontSize: 12, borderColor: '#E24B4A', color: '#A32D2D' }}>
                        Revoke all other sessions
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── ORGANIZATION ── */}
          {activeTab === 'organization' && currentOrganization && (
            <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
              <OrganizationSettings organizationId={currentOrganization.id} isAdmin={isOrgAdmin} />
            </div>
          )}

          {/* ── TEAM ── */}
          {activeTab === 'team' && canManageTeam && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <InviteTeamMembers />
              </div>
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Current members</div>
                {userMemberships.map((m: any) => (
                  <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#E6F1FB', color: '#0C447C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 500 }}>
                      {getInitials(m.user_id.substring(0, 4))}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14 }}>{m.user_id}</div>
                    </div>
                    <span style={{ background: '#E6F1FB', color: '#0C447C', fontSize: 11, padding: '2px 8px', borderRadius: 20 }}>{m.role}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ── ACTIVITY ── */}
          {activeTab === 'activity' && hasActivityData && (
            <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Completed assessments ({completedAssessments.length})</div>
              <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Click any assessment to view its results</div>
              {assessmentsLoading ? (
                <div className="flex justify-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary" /></div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {completedAssessments.map(assessment => (
                    <div key={assessment.id} onClick={() => navigate(`/app/results/${assessment.id}`)}
                      style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 14, borderRadius: 8, border: '0.5px solid var(--color-border-tertiary)', cursor: 'pointer' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#EAF3DE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>Completed Assessment</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{format(new Date(assessment.completed_at || assessment.created_at), 'PPP')}</div>
                      </div>
                      {assessment.overall_score != null && (
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: 18, fontWeight: 700, color: '#185FA5' }}>{Math.round(assessment.overall_score)}%</div>
                          <div style={{ fontSize: 11, color: 'var(--color-text-secondary)' }}>Score</div>
                        </div>
                      )}
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ── PRIVACY ── */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Privacy preferences</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Control how your data is used</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Analytics tracking</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Help us improve by sharing anonymous usage data</div>
                  </div>
                  <Switch checked={analyticsConsent} onCheckedChange={async (v) => { setAnalyticsConsent(v); const success = await updateConsent('analytics', v); if (!success) setAnalyticsConsent(!v); }} />
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Marketing communications</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Receive updates about new features</div>
                  </div>
                  <Switch checked={marketingConsent} onCheckedChange={async (v) => { setMarketingConsent(v); const success = await updateConsent('marketing', v); if (!success) setMarketingConsent(!v); }} />
                </div>
              </div>

              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 16 }}>Data management</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                  <div>
                    <div style={{ fontSize: 14 }}>Export your data</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Download a copy of all your data</div>
                  </div>
                  <Button variant="outline" size="sm" onClick={handleExportData} disabled={gdprLoading}>
                    <Download className="h-4 w-4 mr-1" /> Export data
                  </Button>
                </div>
              </div>

              {/* Danger zone */}
              <div style={{ background: 'white', border: '1px solid #F0D0D0', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, color: '#A32D2D', marginBottom: 4 }}>Danger zone</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Irreversible actions — proceed with care</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 500 }}>Delete account</div>
                    <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>Permanently remove your account and all data</div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" style={{ borderColor: '#E24B4A', color: '#A32D2D' }}>Delete account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete account?</AlertDialogTitle>
                        <AlertDialogDescription>This action cannot be undone. All your data will be permanently deleted.</AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} style={{ background: '#A32D2D' }}>Delete permanently</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          )}

          {/* ── INTEGRATIONS ── */}
          {activeTab === 'integrations' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>Connected platforms</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Manage your connected accounts and services</div>
                {[
                  { name: 'Google Account', desc: 'Connect your Google account', icon: Mail, bg: '#FCEBEB', iconColor: '#A32D2D' },
                  { name: 'Microsoft 365', desc: 'Connect your Microsoft account', icon: Building2, bg: '#E6F1FB', iconColor: '#185FA5' },
                ].map(p => (
                  <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '0.5px solid var(--color-border-tertiary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 40, height: 40, borderRadius: '50%', background: p.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <p.icon style={{ width: 20, height: 20, color: p.iconColor }} />
                      </div>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>{p.desc}</div>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">Connect</Button>
                  </div>
                ))}
              </div>

              <div style={{ background: 'white', border: '0.5px solid var(--color-border-tertiary)', borderRadius: 12, padding: 20 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 4 }}>API access</div>
                <div style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginBottom: 16 }}>Manage API tokens for external integrations</div>
                <div style={{ textAlign: 'center', padding: '24px 0' }}>
                  <Key className="h-10 w-10 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p style={{ fontSize: 13, color: 'var(--color-text-secondary)' }}>No API tokens configured</p>
                  <Button variant="outline" style={{ marginTop: 12 }}>Generate API token</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Account;
