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
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useSessionManager } from '@/hooks/useSessionManager';
import { useGDPR } from '@/hooks/useGDPR';
import { useMultiTenant } from '@/hooks/useMultiTenant';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Shield, Download, Trash2, Monitor, Smartphone, Globe, Calendar, Mail, CheckCircle, XCircle } from 'lucide-react';
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
  const [deleteConfirmStep, setDeleteConfirmStep] = useState(0);

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
        .update({ display_name: displayName.trim() })
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      setProfile((prev: any) => ({ ...prev, display_name: displayName.trim() }));
      toast({
        title: "Profile updated",
        description: "Your display name has been saved",
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
      // Account deletion function handles sign out and redirect
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
    // For IPv6, show first segment
    return ip.split(':')[0] + ':****';
  };

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary mb-2">Account Settings</h1>
        <p className="text-muted-foreground">Manage your profile, security, and privacy settings</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
          <TabsTrigger value="profile" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            Profile
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Security
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            Privacy
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and account settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="display-name">Display Name</Label>
                  <Input
                    id="display-name"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Enter your display name"
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email Address</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={user.email || ''}
                      disabled
                      className="h-11"
                    />
                    {user.email_confirmed_at ? (
                      <Badge variant="secondary" className="flex items-center gap-1">
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

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Account Created</Label>
                  <Input
                    value={user.created_at ? format(new Date(user.created_at), 'PPP') : 'Unknown'}
                    disabled
                    className="h-11"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Last Sign In</Label>
                  <Input
                    value={profile?.last_sign_in_at ? format(new Date(profile.last_sign_in_at), 'PPP p') : 'Never'}
                    disabled
                    className="h-11"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Current Role</Label>
                <Input
                  value={profile?.role || 'user'}
                  disabled
                  className="h-11 capitalize"
                />
              </div>

              <Separator />

              <div className="flex justify-between items-center">
                <div>
                  <h4 className="font-medium">Organization</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentOrganization?.name || 'No organization selected'}
                  </p>
                </div>
                {organizations.length > 1 && (
                  <Button variant="outline" onClick={() => {
                    // This would typically open an organization switcher dialog
                    toast({
                      title: "Organization Switcher",
                      description: "Organization switching is available in the main navigation",
                    });
                  }}>
                    Switch Organization
                  </Button>
                )}
              </div>

              <div className="flex justify-end">
                <Button 
                  onClick={updateProfile} 
                  disabled={saving || !displayName.trim()}
                  className="min-w-[120px]"
                >
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Active Sessions</CardTitle>
              <CardDescription>
                Manage your active login sessions across devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {sessionsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : sessions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No active sessions found</p>
              ) : (
                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {getDeviceIcon(session.device_info?.device_type)}
                        <div>
                          <div className="font-medium">
                            {session.device_info?.browser || 'Unknown Browser'} on {session.device_info?.os || 'Unknown OS'}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            IP: {maskIP(session.ip_address)} • 
                            First seen: {format(new Date(session.first_seen), 'PPP')} • 
                            Last active: {format(new Date(session.last_seen), 'PPP p')}
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleRevokeSession(session.session_id)}
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
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <div className="font-medium">Enable 2FA</div>
                  <div className="text-sm text-muted-foreground">
                    Secure your account with two-factor authentication
                  </div>
                </div>
                <Badge variant="secondary">Coming Soon</Badge>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="privacy" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Privacy Preferences</CardTitle>
              <CardDescription>
                Control how your data is used and manage your privacy settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Analytics Tracking</div>
                    <div className="text-sm text-muted-foreground">
                      Help us improve by sharing anonymous usage data
                    </div>
                  </div>
                  <Switch
                    checked={profile?.consent_analytics || false}
                    onCheckedChange={(checked) => updateConsent('analytics', checked)}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">Marketing Communications</div>
                    <div className="text-sm text-muted-foreground">
                      Receive updates about new features and improvements
                    </div>
                  </div>
                  <Switch
                    checked={profile?.consent_marketing || false}
                    onCheckedChange={(checked) => updateConsent('marketing', checked)}
                  />
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Data Management</h4>
                
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <div className="font-medium flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Export My Data
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Download all your data in JSON format
                    </div>
                  </div>
                  <Button variant="outline" onClick={handleExportData} disabled={gdprLoading}>
                    {gdprLoading ? "Exporting..." : "Export"}
                  </Button>
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg border-destructive/20">
                  <div>
                    <div className="font-medium flex items-center gap-2 text-destructive">
                      <Trash2 className="h-4 w-4" />
                      Delete Account
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Permanently delete your account and all associated data
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive">Delete Account</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription className="space-y-2">
                          <p>This action cannot be undone. This will permanently delete your account and all associated data including:</p>
                          <ul className="list-disc list-inside text-sm space-y-1 mt-2">
                            <li>Your profile and account information</li>
                            <li>All assessments and dealership data</li>
                            <li>Organization memberships and data</li>
                            <li>All improvement actions and recommendations</li>
                          </ul>
                          <p className="mt-4 font-medium">
                            {deleteConfirmStep === 0 
                              ? "Click 'Delete Account' again to confirm this action."
                              : "This is your final confirmation. Your account will be deleted immediately."
                            }
                          </p>
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel onClick={() => setDeleteConfirmStep(0)}>
                          Cancel
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDeleteAccount}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                          disabled={gdprLoading}
                        >
                          {gdprLoading ? "Deleting..." : deleteConfirmStep === 0 ? "Delete Account" : "Permanently Delete"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Account;