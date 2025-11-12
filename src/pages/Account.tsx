import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
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
  AlertCircle, ChevronRight, Zap, BarChart3
} from 'lucide-react';
import { format } from 'date-fns';

const Account = () => {
  const { user } = useAuth();
  const { sessions, loading: sessionsLoading, fetchSessions, revokeSession } = useSessionManager();
  const { exportUserData, deleteAccount, updateConsent, loading: gdprLoading } = useGDPR();
  const { organizations, currentOrganization, switchOrganization } = useMultiTenant();
  const { toast } = useToast();
  
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

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      setProfile(data);
      setDisplayName(data?.display_name || '');
      setJobTitle(data?.job_title || '');
      setDepartment(data?.department || '');
      setBio(data?.bio || '');
      setTimezone(data?.timezone || 'UTC');
    } catch (error: any) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setProfileLoading(false);
    }
  };

  const updateProfile = async () => {
    if (!displayName.trim()) {
      toast({
        title: "Validation Error",
        description: "Display name cannot be empty",
        variant: "destructive",
      });
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

      if (error) {
        throw error;
      }

      setProfile((prev: any) => ({ 
        ...prev, 
        display_name: displayName.trim(),
        job_title: jobTitle.trim(),
        department: department.trim(),
        bio: bio.trim(),
        timezone: timezone
      }));
      toast({
        title: "Profile updated",
        description: "Your profile has been saved successfully",
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast({
        title: "Update failed",
        description: error.message || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleRevokeSession = async (sessionId: string) => {
    const success = await revokeSession(sessionId);
    if (success) {
      toast({
        title: "Session revoked",
        description: "The session has been terminated",
      });
    } else {
      toast({
        title: "Error",
        description: "Failed to revoke session",
        variant: "destructive",
      });
    }
  };

  const handleExportData = async () => {
    await exportUserData();
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmStep === 0) {
      setDeleteConfirmStep(1);
      return;
    }

    const success = await deleteAccount();
    if (success) {
      setDeleteConfirmStep(0);
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType?.toLowerCase()) {
      case 'mobile':
        return <Smartphone className="h-4 w-4" />;
      case 'tablet':
        return <Monitor className="h-4 w-4" />;
      default:
        return <Monitor className="h-4 w-4" />;
    }
  };

  const maskIP = (ip: string) => {
    if (!ip) return 'Unknown';
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.***.**`;
    }
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
    if (user.email) completed++;
    if (jobTitle) completed++;
    if (department) completed++;
    if (bio) completed++;
    if (currentOrganization) completed++;
    
    return Math.round((completed / total) * 100);
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-dashboard-bg">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      {/* Header */}
      <div className="bg-card border-b border-border">
        <div className="container max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">Account Settings</h1>
              <p className="text-sm text-muted-foreground mt-1">Manage your profile, security, and preferences</p>
            </div>
            <Avatar className="h-12 w-12">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="bg-primary text-primary-foreground font-medium">
                {getInitials(displayName || user.email || '')}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          {/* Atlassian-style Tab Navigation */}
          <div className="bg-card rounded-lg border border-border p-1">
            <TabsList className="grid w-full grid-cols-2 lg:grid-cols-6 bg-transparent gap-1">
              <TabsTrigger 
                value="profile" 
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <User className="h-4 w-4 mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger 
                value="organization"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Building2 className="h-4 w-4 mr-2" />
                Organization
              </TabsTrigger>
              <TabsTrigger 
                value="activity"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Activity className="h-4 w-4 mr-2" />
                Activity
              </TabsTrigger>
              <TabsTrigger 
                value="security"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Shield className="h-4 w-4 mr-2" />
                Security
              </TabsTrigger>
              <TabsTrigger 
                value="privacy"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Globe className="h-4 w-4 mr-2" />
                Privacy
              </TabsTrigger>
              <TabsTrigger 
                value="integrations"
                className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
              >
                <Link2 className="h-4 w-4 mr-2" />
                Integrations
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Profile Completion Card */}
              <Card className="lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-lg">Profile Completion</CardTitle>
                  <CardDescription>Complete your profile to unlock all features</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-primary mb-2">
                      {calculateProfileCompletion()}%
                    </div>
                    <Progress value={calculateProfileCompletion()} className="h-2" />
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Display Name</span>
                      {displayName ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Email</span>
                      {user.email ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Job Title</span>
                      {jobTitle ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Department</span>
                      {department ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Bio</span>
                      {bio ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Organization</span>
                      {currentOrganization ? <CheckCircle className="h-4 w-4 text-success" /> : <XCircle className="h-4 w-4 text-muted-foreground" />}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Main Profile Form */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Personal Information</CardTitle>
                  <CardDescription>Update your personal details and preferences</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="display-name">Display Name *</Label>
                      <Input
                        id="display-name"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder="John Doe"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email Address</Label>
                      <div className="flex items-center gap-2">
                        <Input
                          id="email"
                          value={user.email || ''}
                          disabled
                          className="flex-1"
                        />
                        {user.email_confirmed_at ? (
                          <Badge variant="secondary" className="flex items-center gap-1 bg-success text-success-foreground">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="flex items-center gap-1">
                            <XCircle className="h-3 w-3" />
                            Unverified
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="job-title">Job Title</Label>
                      <Input
                        id="job-title"
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Sales Manager"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="department">Department</Label>
                      <Input
                        id="department"
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        placeholder="Sales"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Textarea
                      id="bio"
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      placeholder="Tell us about yourself..."
                      rows={4}
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="timezone">Timezone</Label>
                      <Input
                        id="timezone"
                        value={timezone}
                        onChange={(e) => setTimezone(e.target.value)}
                        placeholder="UTC"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Organization</Label>
                      <Input
                        value={currentOrganization?.name || 'No organization'}
                        disabled
                      />
                    </div>
                  </div>

                  <Separator />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Account Created</Label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Last Sign In</Label>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        {profile?.last_sign_in_at ? format(new Date(profile.last_sign_in_at), 'PPP p') : 'Never'}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Button 
                      onClick={updateProfile} 
                      disabled={saving || !displayName.trim()}
                      className="bg-primary hover:bg-primary/90"
                    >
                      {saving ? "Saving..." : "Save Changes"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary KPIs */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Account Summary
                </CardTitle>
                <CardDescription>Your account metrics at a glance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Total Assessments</p>
                    <p className="text-2xl font-bold text-primary">0</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Active Projects</p>
                    <p className="text-2xl font-bold text-primary">0</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Team Members</p>
                    <p className="text-2xl font-bold text-primary">{organizations.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Account Status</p>
                    <Badge className="bg-success text-success-foreground">Active</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Organization & Access Tab */}
          <TabsContent value="organization" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Organization Details</CardTitle>
                <CardDescription>View and manage your organization membership</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-start gap-4 p-4 rounded-lg border border-border bg-muted/30">
                  <Building2 className="h-10 w-10 text-primary" />
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{currentOrganization?.name || 'No Organization'}</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Member since {currentOrganization?.created_at ? format(new Date(currentOrganization.created_at), 'PPP') : 'Unknown'}
                    </p>
                  </div>
                  {organizations.length > 1 && (
                    <Button variant="outline">
                      Switch Organization
                    </Button>
                  )}
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Your Role & Permissions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <div className="flex items-center gap-2">
                        <Shield className="h-4 w-4 text-primary" />
                        <span className="font-medium">Current Role</span>
                      </div>
                      <Badge className="bg-primary text-primary-foreground capitalize">
                        {profile?.role || 'User'}
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
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <CheckCircle className="h-4 w-4 text-success" />
                        <span>Export reports</span>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-medium mb-4">Organization Members</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                            {getInitials(displayName || user.email || '')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-sm">{displayName || user.email}</p>
                          <p className="text-xs text-muted-foreground">You</p>
                        </div>
                      </div>
                      <Badge variant="secondary">{profile?.role || 'User'}</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Your recent actions and engagement</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-start gap-4 p-4 rounded-lg border border-border">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">Account created</p>
                      <p className="text-sm text-muted-foreground">
                        {user.created_at ? format(new Date(user.created_at), 'PPP p') : 'Unknown'}
                      </p>
                    </div>
                  </div>
                  
                  {profile?.last_sign_in_at && (
                    <div className="flex items-start gap-4 p-4 rounded-lg border border-border">
                      <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
                        <Activity className="h-5 w-5 text-accent" />
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">Last sign in</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(profile.last_sign_in_at), 'PPP p')}
                        </p>
                      </div>
                    </div>
                  )}

                  <div className="text-center py-8 text-muted-foreground">
                    <Activity className="h-12 w-12 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No additional activity to display</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Overview</CardTitle>
                <CardDescription>Your engagement metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Assessments</span>
                      <TrendingUp className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Reports</span>
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                  <div className="p-4 rounded-lg bg-muted/30">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-muted-foreground">Collaborations</span>
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                    <p className="text-2xl font-bold">0</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Security Tab */}
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
                            <div className="font-medium">
                              {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.os || 'Unknown OS'}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              IP: {maskIP(session.ip_address)} • 
                              Last active: {format(new Date(session.last_seen), 'PPP p')}
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleRevokeSession(session.session_id)}
                          className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                        >
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
                    <div className="h-10 w-10 rounded-full bg-warning/10 flex items-center justify-center">
                      <Lock className="h-5 w-5 text-warning" />
                    </div>
                    <div>
                      <div className="font-medium">Enable 2FA</div>
                      <div className="text-sm text-muted-foreground">
                        Secure your account with two-factor authentication
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-warning/10 text-warning border-warning/20">
                    Coming Soon
                  </Badge>
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

          {/* Privacy Tab */}
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
                        <div className="text-sm text-muted-foreground">
                          Help us improve by sharing anonymous usage data
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={profile?.consent_analytics || false}
                      onCheckedChange={(checked) => updateConsent('analytics', checked)}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-primary" />
                      <div>
                        <div className="font-medium">Marketing Communications</div>
                        <div className="text-sm text-muted-foreground">
                          Receive updates about new features and improvements
                        </div>
                      </div>
                    </div>
                    <Switch
                      checked={profile?.consent_marketing || false}
                      onCheckedChange={(checked) => updateConsent('marketing', checked)}
                    />
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
                      <div className="text-sm text-muted-foreground">
                        Download all your data in JSON format
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={handleExportData} 
                    disabled={gdprLoading}
                    className="border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                  >
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
                      <div className="text-sm text-muted-foreground">
                        Permanently delete your account and all data
                      </div>
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
                          <p className="mt-4 font-medium text-destructive">
                            This action is irreversible and cannot be recovered.
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive hover:bg-destructive/90"
                        >
                          {deleteConfirmStep === 0 ? "Delete Account" : "Confirm Deletion"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Connected Platforms</CardTitle>
                <CardDescription>Manage your connected accounts and services</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-red-500/10 flex items-center justify-center">
                      <Mail className="h-5 w-5 text-red-500" />
                    </div>
                    <div>
                      <div className="font-medium">Google Account</div>
                      <div className="text-sm text-muted-foreground">
                        Connect your Google account
                      </div>
                    </div>
                  </div>
                  <Button variant="outline">Connect</Button>
                </div>

                <div className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                      <Building2 className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <div className="font-medium">Microsoft 365</div>
                      <div className="text-sm text-muted-foreground">
                        Connect your Microsoft account
                      </div>
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
                  <Button variant="outline" className="mt-4">
                    Generate API Token
                  </Button>
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
                          <p className="text-sm font-medium">
                            {session.device_info?.browser || 'Unknown'} • {session.device_info?.os || 'Unknown OS'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active: {format(new Date(session.last_seen), 'PPP')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-success/10 text-success border-success/20">
                        Active
                      </Badge>
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
