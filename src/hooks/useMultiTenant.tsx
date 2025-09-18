import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

interface Organization {
  id: string;
  name: string;
  slug: string;
  settings: any;
  created_at: string;
  updated_at: string;
}

interface Membership {
  id: string;
  user_id: string;
  organization_id: string;
  role: 'owner' | 'admin' | 'manager' | 'analyst' | 'viewer';
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface MultiTenantContextType {
  currentOrganization: Organization | null;
  userMemberships: Membership[];
  organizations: Organization[];
  loading: boolean;
  switchOrganization: (orgId: string) => Promise<void>;
  refreshMemberships: () => Promise<void>;
  canPerformAction: (action: 'create' | 'read' | 'update' | 'delete', resource?: string) => boolean;
}

const MultiTenantContext = createContext<MultiTenantContextType | undefined>(undefined);

export const MultiTenantProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [userMemberships, setUserMemberships] = useState<Membership[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUserData = async () => {
    if (!user) {
      setCurrentOrganization(null);
      setUserMemberships([]);
      setOrganizations([]);
      setLoading(false);
      return;
    }

    try {
      // Fetch user profile to get active organization
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_organization_id')
        .eq('user_id', user.id)
        .single();

      // Fetch user memberships
      const { data: memberships } = await supabase
        .from('memberships')
        .select(`
          *,
          organization:organizations(*)
        `)
        .eq('user_id', user.id)
        .eq('is_active', true);

      if (memberships) {
        setUserMemberships(memberships);
        const orgs = memberships.map(m => m.organization).filter(Boolean);
        setOrganizations(orgs);

        // Set current organization
        if (profile?.active_organization_id) {
          const activeOrg = orgs.find(org => org.id === profile.active_organization_id);
          setCurrentOrganization(activeOrg || orgs[0] || null);
        } else if (orgs.length > 0) {
          setCurrentOrganization(orgs[0]);
          // Update profile with first org as active
          await supabase
            .from('profiles')
            .update({ active_organization_id: orgs[0].id })
            .eq('user_id', user.id);
        }
      }
    } catch (error) {
      console.error('Error fetching user data:', error);
      toast({
        title: "Error",
        description: "Failed to load organization data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const switchOrganization = async (orgId: string) => {
    if (!user) return;

    try {
      const org = organizations.find(o => o.id === orgId);
      if (!org) return;

      // Update user profile with new active organization
      await supabase
        .from('profiles')
        .update({ active_organization_id: orgId })
        .eq('user_id', user.id);

      setCurrentOrganization(org);

      toast({
        title: "Organization switched",
        description: `Now viewing ${org.name}`,
      });
    } catch (error) {
      console.error('Error switching organization:', error);
      toast({
        title: "Error",
        description: "Failed to switch organization",
        variant: "destructive",
      });
    }
  };

  const refreshMemberships = async () => {
    await fetchUserData();
  };

  const canPerformAction = (action: 'create' | 'read' | 'update' | 'delete', resource?: string): boolean => {
    if (!currentOrganization || !user) return false;

    const membership = userMemberships.find(m => 
      m.organization_id === currentOrganization.id && m.user_id === user.id
    );
    
    if (!membership || !membership.is_active) return false;

    const { role } = membership;

    // Role-based permissions
    switch (action) {
      case 'read':
        return ['owner', 'admin', 'manager', 'analyst', 'viewer'].includes(role);
      
      case 'create':
        return ['owner', 'admin', 'manager'].includes(role);
      
      case 'update':
        if (resource === 'organization') return ['owner'].includes(role);
        return ['owner', 'admin', 'manager'].includes(role);
      
      case 'delete':
        if (resource === 'organization') return ['owner'].includes(role);
        return ['owner', 'admin'].includes(role);
      
      default:
        return false;
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [user]);

  const value = {
    currentOrganization,
    userMemberships,
    organizations,
    loading,
    switchOrganization,
    refreshMemberships,
    canPerformAction,
  };

  return (
    <MultiTenantContext.Provider value={value}>
      {children}
    </MultiTenantContext.Provider>
  );
};

export const useMultiTenant = () => {
  const context = useContext(MultiTenantContext);
  if (context === undefined) {
    throw new Error('useMultiTenant must be used within a MultiTenantProvider');
  }
  return context;
};