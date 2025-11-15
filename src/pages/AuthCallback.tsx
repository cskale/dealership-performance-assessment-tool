import { useEffect, useState } from 'react';
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
          // Check user role and redirect accordingly
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
            if (roleData.role === 'dealer' && roleData.dealer_id) {
              navigate(`/dealer/${roleData.dealer_id}/actions`, { replace: true });
            } else if (roleData.role === 'coach') {
              navigate('/coach/actions', { replace: true });
            } else {
              navigate('/', { replace: true });
            }
          } else {
            // No role assigned yet, go to home
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