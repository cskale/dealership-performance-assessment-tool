import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
          // Clear any returnTo cookie and get the redirect path
          const returnTo = searchParams.get('returnTo') || getCookieValue('returnTo') || '/';
          
          // Clear the cookie
          document.cookie = 'returnTo=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
          
          // Ensure it's a safe internal path
          const safePath = isInternalPath(returnTo) ? returnTo : '/';
          
          toast({
            title: "Welcome back!",
            description: "You've been successfully signed in.",
          });
          
          navigate(safePath, { replace: true });
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

// Helper functions
const getCookieValue = (name: string): string | null => {
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${name}=`));
  return cookie ? decodeURIComponent(cookie.split('=')[1]) : null;
};

const isInternalPath = (path: string): boolean => {
  try {
    const url = new URL(path, window.location.origin);
    return url.origin === window.location.origin && !path.includes('//');
  } catch {
    // If it's not a valid URL, check if it's a relative path
    return path.startsWith('/') && !path.startsWith('//') && !path.includes('.');
  }
};

export default AuthCallback;