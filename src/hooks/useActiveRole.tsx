/**
 * useActiveRole — single source of truth for UI role authorization.
 *
 * Reads from memberships table (same source as useMultiTenant and RLS).
 * Replaces useUserRole which read from the legacy user_roles table.
 *
 * Maps membership roles to two UX personas:
 *   coach  → membership role is 'owner' or 'admin' (cross-dealer visibility)
 *   dealer → membership role is 'member' or 'viewer' (single-dealer)
 *
 * This hook governs UI routing and display only.
 * Actual data access security is enforced by Supabase RLS policies.
 */
import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type ActiveUXRole = 'coach' | 'dealer' | null;
export type MembershipRole = 'owner' | 'admin' | 'member' | 'viewer';
export type ActorType = 'dealer' | 'coach' | 'oem' | 'internal' | null;

interface ActiveRoleData {
  uxRole: ActiveUXRole;
  membershipRole: MembershipRole | null;
  actorType: ActorType;
  organizationId: string | null;
  dealerId: string | null;
  loading: boolean;
}

function toUXRole(membershipRole: MembershipRole): ActiveUXRole {
  if (membershipRole === 'owner' || membershipRole === 'admin') return 'coach';
  return 'dealer';
}

export function useActiveRole(): ActiveRoleData {
  const { user } = useAuth();
  const [uxRole, setUXRole] = useState<ActiveUXRole>(null);
  const [membershipRole, setMembershipRole] = useState<MembershipRole | null>(null);
  const [actorType, setActorType] = useState<ActorType>(null);
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setUXRole(null);
      setMembershipRole(null);
      setActorType(null);
      setOrganizationId(null);
      setDealerId(null);
      setLoading(false);
      return;
    }

    const fetchRole = async () => {
      setLoading(true);
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('active_organization_id, active_dealership_id, actor_type')
          .eq('user_id', user.id)
          .maybeSingle();

        const activeOrgId = profile?.active_organization_id ?? null;
        setOrganizationId(activeOrgId);
        setActorType((profile?.actor_type as ActorType) ?? null);
        // dealerId reflects the profile's active dealership directly — it must not depend on
        // membership role, since org owners/admins (toUXRole -> 'coach') are still dealers too.
        setDealerId(profile?.active_dealership_id ?? null);

        if (!activeOrgId) {
          setUXRole(null);
          setMembershipRole(null);
          return;
        }

        const { data: membership } = await supabase
          .from('memberships')
          .select('role')
          .eq('user_id', user.id)
          .eq('organization_id', activeOrgId)
          .eq('is_active', true)
          .maybeSingle();

        if (membership) {
          const mRole = membership.role as MembershipRole;
          setMembershipRole(mRole);
          setUXRole(toUXRole(mRole));
        } else {
          setUXRole(null);
          setMembershipRole(null);
        }
      } catch (err) {
        console.error('[useActiveRole] Error:', err);
        setUXRole(null);
        setMembershipRole(null);
        setDealerId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchRole();
  }, [user]);

  return { uxRole, membershipRole, actorType, organizationId, dealerId, loading };
}
