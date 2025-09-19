import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';

interface UserSession {
  id: string;
  session_id: string;
  device_info: any;
  ip_address: string | null;
  user_agent: string | null;
  first_seen: string;
  last_seen: string;
  is_active: boolean;
}

export const useSessionManager = () => {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSessions = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const { data } = await supabase
        .from('user_sessions')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .order('last_seen', { ascending: false });

        setSessions((data || []).map(session => ({
          ...session,
          ip_address: session.ip_address ? String(session.ip_address) : null
        })));
    } catch (error) {
      console.error('Error fetching sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    try {
      await supabase
        .from('user_sessions')
        .update({ is_active: false })
        .eq('session_id', sessionId)
        .eq('user_id', user?.id);

      // Refresh sessions list
      await fetchSessions();
      
      return true;
    } catch (error) {
      console.error('Error revoking session:', error);
      return false;
    }
  };

  const trackCurrentSession = async () => {
    if (!user) return;

    try {
      const currentSession = await supabase.auth.getSession();
      if (!currentSession.data.session) return;

      const sessionId = currentSession.data.session.access_token.substring(0, 10);
      const userAgent = navigator.userAgent;
      
      // Get device info
      const deviceInfo = {
        browser: getBrowserInfo(),
        os: getOSInfo(),
        device_type: getDeviceType(),
      };

      // Check if session already exists
      const { data: existingSession } = await supabase
        .from('user_sessions')
        .select('id')
        .eq('session_id', sessionId)
        .eq('user_id', user.id)
        .single();

      if (existingSession) {
        // Update last seen
        await supabase
          .from('user_sessions')
          .update({ 
            last_seen: new Date().toISOString(),
            is_active: true 
          })
          .eq('id', existingSession.id);
      } else {
        // Create new session record
        await supabase
          .from('user_sessions')
          .insert({
            user_id: user.id,
            session_id: sessionId,
            device_info: deviceInfo,
            user_agent: userAgent,
          });
      }
    } catch (error) {
      console.error('Error tracking session:', error);
    }
  };

  useEffect(() => {
    if (user) {
      trackCurrentSession();
      fetchSessions();
    }
  }, [user]);

  return {
    sessions,
    loading,
    fetchSessions,
    revokeSession,
    trackCurrentSession,
  };
};

// Helper functions
const getBrowserInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Chrome')) return 'Chrome';
  if (userAgent.includes('Firefox')) return 'Firefox';
  if (userAgent.includes('Safari')) return 'Safari';
  if (userAgent.includes('Edge')) return 'Edge';
  return 'Unknown';
};

const getOSInfo = (): string => {
  const userAgent = navigator.userAgent;
  if (userAgent.includes('Windows')) return 'Windows';
  if (userAgent.includes('Mac')) return 'macOS';
  if (userAgent.includes('Linux')) return 'Linux';
  if (userAgent.includes('Android')) return 'Android';
  if (userAgent.includes('iOS')) return 'iOS';
  return 'Unknown';
};

const getDeviceType = (): string => {
  const userAgent = navigator.userAgent;
  if (/Mobi|Android/i.test(userAgent)) return 'Mobile';
  if (/Tablet|iPad/i.test(userAgent)) return 'Tablet';
  return 'Desktop';
};