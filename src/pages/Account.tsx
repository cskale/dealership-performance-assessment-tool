import { useState, useEffect } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGDPR } from '@/hooks/useGDPR';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, Shield, Download, Trash2, Monitor, Smartphone, Globe, Calendar, 
  Mail, CheckCircle, XCircle, Building2, Users, Activity, Link2, Key,
  MapPin, Clock, TrendingUp, FileText, Settings, Lock, Eye, EyeOff,
  AlertCircle, ChevronRight, Zap, BarChart3, ArrowLeft, Pencil, Save, X
} from 'lucide-react';
import { format } from 'date-fns';

interface AssessmentRecord {
  id: string;
  overall_score: number | null;
  status: string;
  completed_at: string | null;
  created_at: string;
}

const Account = () => {
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
  
  // Privacy consent states for optimistic UI (P0.3)
  const [analyticsConsent, setAnalyticsConsent] = useState(false);
  const [marketingConsent, setMarketingConsent] = useState(false);

  // P1.4 - Organization edit state
  const [orgEditing, setOrgEditing] = useState(false);
  const [orgName, setOrgName] = useState('');
  const [orgSaving, setOrgSaving] = useState(false);

  // P2.3 - Assessment history
  const [assessments, setAssessments] = useState<AssessmentRecord[]>([]);
  const [assessmentsLoading, setAssessmentsLoading] = useState(true);

  // P1.4: Determine if user is admin/owner in current org
  const currentMembership = userMemberships.find(
    m => m.organization_id === currentOrganization?.id
  );
  const isOrgAdmin = currentMembership?.role === 'owner' || currentMembership?.role === 'admin';

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

  // P2.3: Fetch assessment history
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
    if (!user || !displayName.trim()) {
      toast({ title: "Validation Error", description: "Display name cannot be empty", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ 
          display_name: displayName.trim(),
          job_title: jobTitle.trim(),
          department: department.trim(),
          bio: bio.trim(),
          timezone: timezone
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

  // P1.4: Save organization name
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

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const completedAssessments = assessments.filter(a => a.status === 'completed');
  const hasActivityData = assessments.length > 0;

  // Build tabs dynamically — P2.3: remove Activity if no data
  const tabs = [
    { value: 'profile', label: 'Profile', icon: User },
    { value: 'organization', label: 'Organization', icon: Building2 },
    ...(hasActivityData ? [{ value: 'activity', label: 'Activity', icon: Activity }] : []),
    { value: 'security', label: 'Security', icon: Shield },
    { value: 'privacy', label: 'Privacy', icon: Globe },
    { value: 'integrations', label: 'Integrations', icon: Link2 },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* P2.2: Uplifted header with hero summary */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="flex items-center gap-3 mb-6">
            <Button variant="ghost" size="sm" onClick={() => navigate('/')} className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4" />
              Back to Dashboard
            </Button>
          </div>
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-primary/20">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-medium">
                {getInitials(displayName || user.email || '')}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-semibold text-foreground truncate">{displayName || user.email}</h1>
              <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-muted-foreground">
                {jobTitle && <span>{jobTitle}</span>}
                {jobTitle && currentOrganization && <span>•</span>}
                {currentOrganization && (
                  <span className="flex items-center gap-1">
                    <Building2 className="h-3.5 w-3.5" />
                    {currentOrganization.name}
                  </span>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs text-muted-foreground">Profile completion</p>
                <p className="text-lg font-semibold text-primary">{calculateProfileCompletion()}%</p>
              </div>
              <div className="w-16">
                <Progress value={calculateProfileCompletion()} className="h-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {/* P2.2: Quick summary cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Assessments</p>
              <p className="text-2xl font-bold text-foreground">{assessments.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-foreground">{completedAssessments.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Organizations</p>
              <p className="text-2xl font-bold text-foreground">{organizations.length}</p>
            </CardContent>
          </Card>
          <Card className="border-border">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">Status</p>
              <Badge className="bg-success/10 text-success border-success/20 mt-1">Active</Badge>
            </CardContent>
          </Card>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <div className="bg-card rounded-lg border border-border p-1">
            <TabsList className={`grid w-full bg-transparent gap-1`} style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
              {tabs.map(tab => (
                <TabsTrigger 
                  key={tab.value}
                  value={tab.value} 
                  className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground text-xs sm:text-sm"
                >
                  <tab.icon className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          {/* ===================== PROFILE TAB (P2.2 uplift) ===================== */}
          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personal Information</CardTitle>
                <CardDescription>Update your personal details and preferences</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="display-name">Display Name *</Label>
                    <Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="flex items-center gap-2">
                      <Input id="email" value={user.email || ''} disabled className="flex-1" />
                      {user.email_confirmed_at ? (
                        <Badge variant="secondary" className="bg-success/10 text-success border-success/20 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> Verified
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <XCircle className="h-3 w-3" /> Unverified
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="Sales Manager" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="department">Department</Label>
                    <Input id="department" value={department} onChange={(e) => setDepartment(e.target.value)} placeholder="Sales" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea id="bio" value={bio} onChange={(e) => setBio(e.target.value)} placeholder="Tell us about yourself..." rows={3} />
                </div>

                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Input id="timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)} placeholder="UTC" />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Created</Label>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground pt-2">
                      <Calendar className="h-4 w-4" />
                      {user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <Button onClick={updateProfile} disabled={saving || !displayName.trim()}>
                    {saving ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== ORGANIZATION TAB (P1.4) ===================== */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Organization Details</CardTitle>
                    <CardDescription>
                      {isOrgAdmin ? 'Manage your organization settings' : 'View your organization membership'}
                    </CardDescription>
                  </div>
                  {isOrgAdmin && currentOrganization && !orgEditing && (
                    <Button variant="outline" size="sm" onClick={() => { setOrgName(currentOrganization.name); setOrgEditing(true); }}>
                      <Pencil className="h-4 w-4 mr-2" /> Edit
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Building2 className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    {orgEditing ? (
                      <div className="space-y-3">
                        <div className="space-y-1">
                          <Label htmlFor="org-name">Organization Name</Label>
                          <Input id="org-name" value={orgName} onChange={(e) => setOrgName(e.target.value)} placeholder="Organization name" />
                        </div>
                        <div className="flex items-center gap-2">
                          <Button size="sm" onClick={saveOrgName} disabled={orgSaving || !orgName.trim()}>
                            <Save className="h-4 w-4 mr-1" /> {orgSaving ? 'Saving...' : 'Save'}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={() => { setOrgEditing(false); setOrgName(currentOrganization?.name || ''); }}>
                            <X className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-lg">{currentOrganization?.name || 'No Organization'}</h3>
                        {currentOrganization?.slug && (
                          <p className="text-sm text-muted-foreground">Slug: {currentOrganization.slug}</p>
                        )}
                        <p className="text-sm text-muted-foreground mt-1">
                          Member since {currentOrganization?.created_at ? format(new Date(currentOrganization.created_at), 'PPP') : 'Unknown'}
                        </p>
                      </>
                    )}
                  </div>
                </div>

                {!isOrgAdmin && currentOrganization && (
                  <div className="flex items-center gap-2 p-3 rounded-lg bg-muted/50 text-sm text-muted-foreground">
                    <Eye className="h-4 w-4 flex-shrink-0" />
                    <span>You don't have permission to edit organization details.</span>
                  </div>
                )}

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Your Role & Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">Membership Role</span>
                      </div>
                      <Badge className="bg-primary/10 text-primary border-primary/20 capitalize">
                        {currentMembership?.role || 'Member'}
                      </Badge>
                    </div>
                    <div className="grid gap-2 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>View assessments and results</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Create and edit assessments</span>
                      </div>
                      {isOrgAdmin && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <CheckCircle className="h-4 w-4 text-success" />
                          <span>Manage organization settings</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {organizations.length > 1 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="font-medium mb-4">Your Organizations</h4>
                      <div className="space-y-2">
                        {organizations.map(org => (
                          <div key={org.id} className="flex items-center justify-between p-3 rounded-lg border border-border">
                            <div className="flex items-center gap-3">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="font-medium text-sm">{org.name}</span>
                            </div>
                            {org.id === currentOrganization?.id ? (
                              <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Active</Badge>
                            ) : (
                              <Button variant="ghost" size="sm" onClick={() => switchOrganization(org.id)}>Switch</Button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== ACTIVITY TAB (P2.3) ===================== */}
          {hasActivityData && (
            <TabsContent value="activity" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Assessment History</CardTitle>
                  <CardDescription>Your assessment runs and results</CardDescription>
                </CardHeader>
                <CardContent>
                  {assessmentsLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {assessments.map(assessment => (
                        <div key={assessment.id} className="flex items-center gap-4 p-4 rounded-lg border border-border hover:bg-muted/30 transition-colors">
                          <div className="h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: assessment.status === 'completed' ? 'hsl(var(--success) / 0.1)' : 'hsl(var(--warning) / 0.1)' }}>
                            {assessment.status === 'completed' 
                              ? <CheckCircle className="h-5 w-5 text-success" />
                              : <Clock className="h-5 w-5 text-warning" />
                            }
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm">
                              {assessment.status === 'completed' ? 'Completed Assessment' : 'Assessment In Progress'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(assessment.completed_at || assessment.created_at), 'PPP')}
                            </p>
                          </div>
                          {assessment.overall_score !== null && (
                            <div className="text-right flex-shrink-0">
                              <p className="text-lg font-bold text-primary">{Math.round(assessment.overall_score)}%</p>
                              <p className="text-xs text-muted-foreground">Score</p>
                            </div>
                          )}
                          <Badge variant="secondary" className={
                            assessment.status === 'completed' 
                              ? 'bg-success/10 text-success border-success/20' 
                              : 'bg-warning/10 text-warning border-warning/20'
                          }>
                            {assessment.status === 'completed' ? 'Completed' : 'In Progress'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )}

          {/* ===================== SECURITY TAB ===================== */}
          <TabsContent value="security" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Sessions</CardTitle>
                <CardDescription>Manage your active login sessions across devices</CardDescription>
              </CardHeader>
              <CardContent>
                {sessionsLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  </div>
                ) : sessions.length === 0 ? (
                  <div className="text-center py-8">
                    <Monitor className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-20" />
                    <p className="text-muted-foreground">No active sessions found</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {sessions.map((session) => (
                      <div key={session.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                            {getDeviceIcon(session.device_info?.device_type)}
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.os || 'Unknown OS'}
                            </div>
                            <div className="text-xs text-muted-foreground">
                              IP: {maskIP(session.ip_address)} • Last active: {format(new Date(session.last_seen), 'PPP p')}
                            </div>
                          </div>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => handleRevokeSession(session.session_id)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground">
                          Revoke
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Two-Factor Authentication</CardTitle>
                <CardDescription>Add an extra layer of security to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">Two-Factor Authentication</div>
                      <div className="text-sm text-muted-foreground">Not configured</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Not Enabled</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Login History</CardTitle>
                <CardDescription>Recent authentication events</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.slice(0, 5).map((session) => (
                    <div key={session.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/30">
                      <CheckCircle className="h-4 w-4 text-success" />
                      <div className="flex-1">
                        <p className="text-sm font-medium">Successful login</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(session.first_seen), 'PPP p')} • {maskIP(session.ip_address)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== PRIVACY TAB ===================== */}
          <TabsContent value="privacy" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Privacy Preferences</CardTitle>
                <CardDescription>Control how your data is used</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Analytics Tracking</div>
                        <div className="text-sm text-muted-foreground">Help us improve by sharing anonymous usage data</div>
                      </div>
                    </div>
                    <Switch checked={analyticsConsent} onCheckedChange={async (checked) => {
                      setAnalyticsConsent(checked);
                      const success = await updateConsent('analytics', checked);
                      if (!success) setAnalyticsConsent(!checked);
                    }} />
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Marketing Communications</div>
                        <div className="text-sm text-muted-foreground">Receive updates about new features and improvements</div>
                      </div>
                    </div>
                    <Switch checked={marketingConsent} onCheckedChange={async (checked) => {
                      setMarketingConsent(checked);
                      const success = await updateConsent('marketing', checked);
                      if (!success) setMarketingConsent(!checked);
                    }} />
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Data Region</h4>
                  <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/30">
                    <Globe className="h-5 w-5 text-primary" />
                    <div>
                      <p className="font-medium">European Union</p>
                      <p className="text-sm text-muted-foreground">Your data is stored in EU data centers</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Export or delete your account data</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Download className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Export My Data</div>
                      <div className="text-sm text-muted-foreground">Download all your data in JSON format</div>
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={gdprLoading}>
                    {gdprLoading ? "Exporting..." : "Export"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-destructive/20 rounded-lg bg-destructive/5">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Trash2 className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="font-medium text-destructive">Delete Account</div>
                      <div className="text-sm text-muted-foreground">Permanently delete your account and all data</div>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle className="flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 text-destructive" />
                          Are you absolutely sure?
                        </AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>This action cannot be undone. This will permanently delete:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 mt-2 ml-2">
                            <li>Your profile and account information</li>
                            <li>All assessments and dealership data</li>
                            <li>Organization memberships and data</li>
                            <li>All improvement actions and recommendations</li>
                          </ul>
                          <p className="mt-4 font-medium text-destructive">This action is irreversible and cannot be recovered.</p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleDeleteAccount} className="bg-destructive hover:bg-destructive/90">
                          {deleteConfirmStep === 0 ? "Delete Account" : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ===================== INTEGRATIONS TAB ===================== */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>Manage your connected accounts and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-destructive" />
                    </div>
                    <div>
                      <div className="font-medium">Google Account</div>
                      <div className="text-sm text-muted-foreground">Connect your Google account</div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">Microsoft 365</div>
                      <div className="text-sm text-muted-foreground">Connect your Microsoft account</div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>API Access</CardTitle>
                <CardDescription>Manage API tokens for external integrations</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Key className="h-12 w-12 mx-auto mb-2 text-muted-foreground opacity-20" />
                  <p className="text-muted-foreground text-sm">No API tokens configured</p>
                  <Button variant="outline" className="mt-4">Generate API Token</Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Connected Devices</CardTitle>
                <CardDescription>Devices with access to your account</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {sessions.slice(0, 3).map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.device_info?.device_type)}
                        <div>
                          <p className="text-sm font-medium">{session.device_info?.browser || 'Unknown'} • {session.device_info?.os || 'Unknown OS'}</p>
                          <p className="text-xs text-muted-foreground">Last active: {format(new Date(session.last_seen), 'PPP')}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">Active</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Account;
