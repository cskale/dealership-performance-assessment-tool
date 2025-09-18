import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
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

  return <>{children}</>;
};