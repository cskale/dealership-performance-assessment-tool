import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

/**
 * Validate that a redirect path is safe (internal only).
 * Prevents open-redirect attacks.
 */
function isValidRedirectPath(path: string): boolean {
  // Must start with / and not contain protocol schemes or double slashes
  if (!path.startsWith('/')) return false;
  if (path.startsWith('//')) return false;
  if (/^\/[a-z]+:/i.test(path)) return false;
  return true;
}

const AuthCallback = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          toast({
            title: "Authentication Error",
            description: error.message,
            variant: "destructive",
          });
          navigate('/auth');
          return;
        }

        if (data.session) {
          const { data: roleData } = await supabase
            .from('user_roles')
            .select('role, dealer_id')
            .eq('user_id', data.session.user.id)
            .single();

          toast({
            title: "Welcome back!",
            description: "You've been successfully signed in.",
          });

          if (roleData) {
            let targetPath = '/';
            if (roleData.role === 'dealer' && roleData.dealer_id) {
              targetPath = `/dealer/${roleData.dealer_id}/actions`;
            } else if (roleData.role === 'coach') {
              targetPath = '/coach/actions';
            }

            if (isValidRedirectPath(targetPath)) {
              navigate(targetPath, { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            navigate('/', { replace: true });
          }
        } else {
          navigate('/auth');
        }
      } catch (err) {
        console.error('Callback handling error:', err);
        navigate('/auth');
      }
    };

    handleAuthCallback();
  }, [navigate, searchParams, toast]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing sign in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
