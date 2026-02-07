import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiresOnboarding?: boolean; // If true, redirects to onboarding if not complete
}

export const ProtectedRoute = ({ children, requiresOnboarding = false }: ProtectedRouteProps) => {
  const { user, loading: authLoading } = useAuth();
  const { status: onboardingStatus, isLoading: onboardingLoading } = useOnboarding();
  const location = useLocation();

  // Check if current route is the onboarding page
  const isOnboardingRoute = location.pathname.includes('/onboarding');

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Set returnTo cookie for post-auth redirect
    const returnTo = location.pathname + location.search;
    if (returnTo !== '/auth') {
      document.cookie = `returnTo=${encodeURIComponent(returnTo)}; path=/; max-age=300`; // 5 minutes
    }
    return <Navigate to="/auth" replace />;
  }

  // If this route requires onboarding completion, check status
  if (requiresOnboarding && !isOnboardingRoute) {
    // Wait for onboarding check to complete
    if (onboardingLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center space-y-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="text-muted-foreground">Checking setup...</p>
          </div>
        </div>
      );
    }

    // Redirect to onboarding if not complete
    if (onboardingStatus === 'needs_organization' || onboardingStatus === 'needs_dealership') {
      return <Navigate to="/app/onboarding" replace />;
    }
  }

  return <>{children}</>;
};
