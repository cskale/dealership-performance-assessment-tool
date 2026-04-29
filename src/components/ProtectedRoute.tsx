import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useActiveRole, type ActorType } from '@/hooks/useActiveRole';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean;
  requiresActorType?: ActorType;
}

export const ProtectedRoute = ({
  children,
  requiresOnboarding = false,
  requiresActorType,
}: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { status: onboardingStatus, isLoading: onboardingLoading } = useOnboarding();
  const { actorType, loading: roleLoading } = useActiveRole();
  const location = useLocation();

  const isOnboardingRoute = location.pathname.includes('/onboarding');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    const returnTo = location.pathname + location.search;
    if (returnTo !== '/auth') {
      document.cookie = `returnTo=${encodeURIComponent(returnTo)}; path=/; max-age=300`;
    }
    return <Navigate to="/auth" replace />;
  }

  if (requiresOnboarding && !isOnboardingRoute) {
    if (onboardingLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Checking setup...</p>
          </div>
        </div>
      );
    }
    if (onboardingStatus === 'needs_organization' || onboardingStatus === 'needs_dealership') {
      return <Navigate to="/app/onboarding" replace />;
    }
  }

  // Actor-type guard: wait for role to resolve, then redirect if wrong type.
  if (requiresActorType) {
    if (roleLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
            <p className="text-muted-foreground">Checking access...</p>
          </div>
        </div>
      );
    }
    if (actorType !== requiresActorType) {
      return <Navigate to="/app/dashboard" replace />;
    }
  }

  return <>{children}</>;
};
