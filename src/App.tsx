import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import Actions from "./pages/Actions";
import ResourceHub from "./pages/ResourceHub";
import Methodology from "./pages/Methodology";
import Onboarding from "./pages/Onboarding";
import NotFound from "./pages/NotFound";
import AcceptInvite from "./pages/AcceptInvite";
import KPIEncyclopediaPage from "./pages/KPIEncyclopediaPage";
import { AuthProvider } from "@/hooks/useAuth";
import { MultiTenantProvider } from "@/hooks/useMultiTenant";
import { RoleProvider } from "@/contexts/RoleContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { PageErrorBoundary } from "@/components/shared/ErrorBoundary";
import { AuthenticatedLayout } from "@/components/AuthenticatedLayout";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MultiTenantProvider>
        <LanguageProvider>
          <RoleProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <PageErrorBoundary
                  fallbackTitle="Application Error"
                  fallbackMessage="The application encountered an unexpected error. Please refresh the page or return to the home page."
                >
                  <Routes>
                    {/* Public routes — no sidebar */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/invite/:token" element={<AcceptInvite />} />

                    {/* Authenticated routes — wrapped in sidebar layout */}
                    <Route path="/app/*" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <Routes>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="onboarding" element={<Onboarding />} />
                            <Route path="assessment" element={
                              <ProtectedRoute requiresOnboarding>
                                <Assessment />
                              </ProtectedRoute>
                            } />
                            <Route path="results" element={<Results />} />
                            <Route path="results/:assessmentId" element={<Results />} />
                          </Routes>
                        </AuthenticatedLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/account/*" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <Routes>
                            <Route index element={<Account />} />
                          </Routes>
                        </AuthenticatedLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/actions" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <Actions />
                        </AuthenticatedLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/resources" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <ResourceHub />
                        </AuthenticatedLayout>
                      </ProtectedRoute>
                    } />
                    <Route path="/kpi-encyclopedia" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <KPIEncyclopediaPage />
                        </AuthenticatedLayout>
                      </ProtectedRoute>
                    } />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </PageErrorBoundary>
              </BrowserRouter>
            </TooltipProvider>
          </RoleProvider>
        </LanguageProvider>
      </MultiTenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
