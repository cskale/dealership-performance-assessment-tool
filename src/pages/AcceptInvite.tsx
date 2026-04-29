import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

type InviteState = 'loading' | 'accepting' | 'success' | 'error';

const ERROR_MESSAGES: Record<string, string> = {
  invite_not_found: 'This invite link is invalid.',
  already_accepted: 'This invite has already been used.',
  invite_invalid_or_expired: 'This invite link has expired or been revoked. Ask your admin to send a new one.',
  email_mismatch: 'This invite was sent to a different email address. Please sign in with the correct account.',
  profile_not_found: 'Your user profile is incomplete. Please contact support.',
  data_integrity_error: 'Something went wrong with this invite. Please contact your admin.',
  not_authenticated: 'You must be signed in to accept this invite.',
};

export default function AcceptInvite() {
  const { token } = useParams<{ token: string }>();
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [state, setState] = useState<InviteState>('loading');
  const [errorKey, setErrorKey] = useState('');

  useEffect(() => {
    if (!token) {
      setState('error');
      setErrorKey('invite_not_found');
      return;
    }

    if (!user) {
      localStorage.setItem('pending_invite_token', token);
      navigate(`/auth?returnTo=${encodeURIComponent(location.pathname)}`, { replace: true });
      return;
    }

    acceptInvite();
  }, [token, user]);

  const acceptInvite = async () => {
    setState('accepting');
    try {
      const { data, error } = await supabase.rpc('accept_dealership_invite', { p_token: token! });

      const result = data as { success: boolean; error?: string; invite_type?: string } | null;

      if (error || !result?.success) {
        setErrorKey(result?.error || 'invite_not_found');
        setState('error');
        return;
      }

      localStorage.removeItem('pending_invite_token');
      setState('success');
      const destination = result?.invite_type === 'coach' ? '/app/coach-dashboard' : '/app/assessment';
      setTimeout(() => navigate(destination, { replace: true }), 1800);
    } catch {
      setErrorKey('invite_not_found');
      setState('error');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted p-4">
      <Card className="w-full max-w-md shadow-card rounded-xl">
        <CardHeader className="text-center">
          <CardTitle>Dealership Invite</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4 py-8">
          {(state === 'loading' || state === 'accepting') && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="text-muted-foreground">
                {state === 'loading' ? 'Validating invite…' : 'Joining dealership…'}
              </p>
            </>
          )}
          {state === 'success' && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="text-lg font-semibold">You're in!</p>
              <p className="text-sm text-muted-foreground">Taking you to your dashboard…</p>
            </>
          )}
          {state === 'error' && (
            <>
              <XCircle className="h-12 w-12 text-destructive" />
              <p className="text-lg font-semibold">Could not accept invite</p>
              <p className="text-sm text-muted-foreground text-center">
                {ERROR_MESSAGES[errorKey] || 'An unexpected error occurred.'}
              </p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Home
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
