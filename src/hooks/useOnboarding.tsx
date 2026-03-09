/**
 * useOnboarding Hook
 * 
 * Manages onboarding state for dealership setup.
 * Organization is auto-created by DB trigger — if missing, silently repaired.
 */

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type OnboardingStatus = 
  | 'loading'
  | 'needs_organization'
  | 'needs_dealership'
  | 'complete';

interface OnboardingContext {
  organizationId: string | null;
  organizationName: string | null;
  dealershipId: string | null;
  dealershipName: string | null;
}

interface UseOnboardingReturn {
  status: OnboardingStatus;
  context: OnboardingContext;
  isLoading: boolean;
  error: string | null;
  refreshOnboarding: () => Promise<void>;
  setActiveDealership: (dealershipId: string) => Promise<boolean>;
  createOrganization: (name: string) => Promise<{ success: boolean; organizationId?: string; error?: string }>;
  createDealership: (data: CreateDealershipData) => Promise<{ success: boolean; dealershipId?: string; error?: string }>;
}

interface CreateDealershipData {
  name: string;
  brand: string;
  country: string;
  location: string;
}

export function useOnboarding(): UseOnboardingReturn {
  const { user } = useAuth();
  const [status, setStatus] = useState<OnboardingStatus>('loading');
  const [context, setContext] = useState<OnboardingContext>({
    organizationId: null,
    organizationName: null,
    dealershipId: null,
    dealershipName: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkOnboardingStatus = useCallback(async () => {
    if (!user) {
      setStatus('loading');
      setIsLoading(false);
      return;
    }

    // Check for pending invite token FIRST
    const pendingToken = localStorage.getItem('pending_invite_token');
    if (pendingToken) {
      localStorage.removeItem('pending_invite_token');
      window.location.replace(`/invite/${pendingToken}`);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('active_organization_id, active_dealership_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) {
        console.error('[Onboarding] Profile fetch error:', profileError);
        setError('Failed to load profile');
        setStatus('needs_organization');
        setIsLoading(false);
        return;
      }

      // If no org, silently repair (DB trigger should have created one)
      if (!profile?.active_organization_id) {
        if (import.meta.env.DEV) {
          console.warn('[Onboarding] Unexpected: no org found for user, repairing...');
        }
        
        // Attempt silent repair: check if user has any membership
        const { data: existingMembership } = await supabase
          .from('memberships')
          .select('organization_id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .limit(1)
          .maybeSingle();

        if (existingMembership) {
          // Set the existing org as active
          await supabase
            .from('profiles')
            .update({ active_organization_id: existingMembership.organization_id })
            .eq('user_id', user.id);
          
          // Re-run check with updated profile
          const { data: org } = await supabase
            .from('organizations')
            .select('id, name')
            .eq('id', existingMembership.organization_id)
            .single();

          setStatus('needs_dealership');
          setContext({
            organizationId: existingMembership.organization_id,
            organizationName: org?.name || null,
            dealershipId: null,
            dealershipName: null,
          });
          setIsLoading(false);
          return;
        }

        // No membership at all — create org silently
        const result = await createOrganization(user.email?.split('@')[0] + "'s Organization" || 'My Organization');
        if (result.success) {
          // Recurse to re-check
          await checkOnboardingStatus();
          return;
        }
        
        setStatus('needs_dealership');
        setIsLoading(false);
        return;
      }

      // Fetch organization details
      const { data: org } = await supabase
        .from('organizations')
        .select('id, name')
        .eq('id', profile.active_organization_id)
        .single();

      // Check if user has an active dealership
      if (!profile?.active_dealership_id) {
        setStatus('needs_dealership');
        setContext({
          organizationId: profile.active_organization_id,
          organizationName: org?.name || null,
          dealershipId: null,
          dealershipName: null,
        });
        setIsLoading(false);
        return;
      }

      // Validate dealership belongs to the organization
      const { data: dealership, error: dealershipError } = await supabase
        .from('dealerships')
        .select('id, name, organization_id')
        .eq('id', profile.active_dealership_id)
        .single();

      if (dealershipError || !dealership) {
        await supabase
          .from('profiles')
          .update({ active_dealership_id: null })
          .eq('user_id', user.id);
        
        setStatus('needs_dealership');
        setContext({
          organizationId: profile.active_organization_id,
          organizationName: org?.name || null,
          dealershipId: null,
          dealershipName: null,
        });
        setIsLoading(false);
        return;
      }

      if (dealership.organization_id !== profile.active_organization_id) {
        await supabase
          .from('profiles')
          .update({ active_dealership_id: null })
          .eq('user_id', user.id);
        
        setStatus('needs_dealership');
        setContext({
          organizationId: profile.active_organization_id,
          organizationName: org?.name || null,
          dealershipId: null,
          dealershipName: null,
        });
        setIsLoading(false);
        return;
      }

      setStatus('complete');
      setContext({
        organizationId: profile.active_organization_id,
        organizationName: org?.name || null,
        dealershipId: dealership.id,
        dealershipName: dealership.name,
      });
      setIsLoading(false);

    } catch (err) {
      console.error('[Onboarding] Error checking status:', err);
      setError('Failed to check onboarding status');
      setStatus('needs_organization');
      setIsLoading(false);
    }
  }, [user]);

  const setActiveDealership = useCallback(async (dealershipId: string): Promise<boolean> => {
    if (!user) return false;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.active_organization_id) {
        setError('No organization set');
        return false;
      }

      const { data: dealership, error: dealershipError } = await supabase
        .from('dealerships')
        .select('id, name, organization_id')
        .eq('id', dealershipId)
        .eq('organization_id', profile.active_organization_id)
        .single();

      if (dealershipError || !dealership) {
        setError('Dealership not found or access denied');
        return false;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ active_dealership_id: dealershipId })
        .eq('user_id', user.id);

      if (updateError) {
        setError('Failed to set dealership');
        return false;
      }

      await checkOnboardingStatus();
      return true;

    } catch (err) {
      console.error('[Onboarding] Error setting dealership:', err);
      setError('Failed to set active dealership');
      return false;
    }
  }, [user, checkOnboardingStatus]);

  const createOrganization = useCallback(async (name: string): Promise<{ success: boolean; organizationId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const baseSlug = name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
      let slug = baseSlug;
      
      let attempts = 0;
      while (attempts < 10) {
        const { data: existing } = await supabase
          .from('organizations')
          .select('id')
          .eq('slug', slug)
          .maybeSingle();
        
        if (!existing) break;
        slug = `${baseSlug}-${Math.floor(Math.random() * 1000)}`;
        attempts++;
      }

      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({ name, slug })
        .select('id')
        .single();

      if (orgError) {
        return { success: false, error: orgError.message };
      }

      const { error: membershipError } = await supabase
        .from('memberships')
        .insert({
          user_id: user.id,
          organization_id: org.id,
          role: 'owner',
          is_active: true,
        });

      if (membershipError) {
        return { success: false, error: membershipError.message };
      }

      const { error: profileError } = await supabase
        .from('profiles')
        .update({ active_organization_id: org.id })
        .eq('user_id', user.id);

      if (profileError) {
        return { success: false, error: profileError.message };
      }

      await checkOnboardingStatus();
      return { success: true, organizationId: org.id };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [user, checkOnboardingStatus]);

  const createDealership = useCallback(async (data: CreateDealershipData): Promise<{ success: boolean; dealershipId?: string; error?: string }> => {
    if (!user) {
      return { success: false, error: 'User not authenticated' };
    }

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('active_organization_id')
        .eq('user_id', user.id)
        .single();

      if (!profile?.active_organization_id) {
        return { success: false, error: 'No organization set' };
      }

      const { data: dealership, error: dealershipError } = await supabase
        .from('dealerships')
        .insert({
          name: data.name,
          brand: data.brand,
          country: data.country,
          location: data.location,
          organization_id: profile.active_organization_id,
          user_id: user.id,
        })
        .select('id')
        .single();

      if (dealershipError) {
        return { success: false, error: dealershipError.message };
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({ active_dealership_id: dealership.id })
        .eq('user_id', user.id);

      if (updateError) {
        return { success: false, error: updateError.message };
      }

      await checkOnboardingStatus();
      return { success: true, dealershipId: dealership.id };

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return { success: false, error: errorMessage };
    }
  }, [user, checkOnboardingStatus]);

  useEffect(() => {
    checkOnboardingStatus();
  }, [checkOnboardingStatus]);

  return {
    status,
    context,
    isLoading,
    error,
    refreshOnboarding: checkOnboardingStatus,
    setActiveDealership,
    createOrganization,
    createDealership,
  };
}
