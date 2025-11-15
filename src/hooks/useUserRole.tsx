import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

export type UserRole = 'coach' | 'dealer' | null;

interface UserRoleData {
  role: UserRole;
  dealerId: string | null;
  loading: boolean;
}

export const useUserRole = (): UserRoleData => {
  const { user } = useAuth();
  const [role, setRole] = useState<UserRole>(null);
  const [dealerId, setDealerId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserRole = async () => {
      if (!user) {
        setRole(null);
        setDealerId(null);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('user_roles')
          .select('role, dealer_id')
          .eq('user_id', user.id)
          .single();

        if (error) {
          console.error('Error fetching user role:', error);
          setRole(null);
          setDealerId(null);
        } else {
          setRole(data.role as UserRole);
          setDealerId(data.dealer_id);
        }
      } catch (error) {
        console.error('Error fetching user role:', error);
        setRole(null);
        setDealerId(null);
      } finally {
        setLoading(false);
      }
    };

    fetchUserRole();
  }, [user]);

  return { role, dealerId, loading };
};
