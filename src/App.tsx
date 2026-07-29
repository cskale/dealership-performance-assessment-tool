import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { lazy, Suspense } from "react";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Assessment = lazy(() => import("./pages/Assessment"));
const Results = lazy(() => import("./pages/Results"));
const Auth = lazy(() => import("./pages/Auth"));
const AuthCallback = lazy(() => import("./pages/AuthCallback"));
const Account = lazy(() => import("./pages/Account"));
const Actions = lazy(() => import("./pages/Actions"));
const KnowledgeHub = lazy(() => import("./pages/KnowledgeHub"));
const KpiDetailPage = lazy(() => import("./pages/KpiDetailPage"));
const Methodology = lazy(() => import("./pages/Methodology"));
const Onboarding = lazy(() => import("./pages/Onboarding"));
const AcceptInvite = lazy(() => import("./pages/AcceptInvite"));
const OemDashboard = lazy(() => import("./pages/OemDashboard"));
const OemSettings = lazy(() => import("./pages/OemSettings"));
const CoachDashboard = lazy(() => import("./pages/CoachDashboard"));
const CoachActions = lazy(() => import("./pages/CoachActions"));
const CoachDealerPage = lazy(() => import("./pages/CoachDealerPage"));
const Playground = lazy(() => import("./pages/Playground"));
const ReverseSalesFunnelPage = lazy(() => import("./pages/ReverseSalesFunnelPage"));
const MarketingRoiPage = lazy(() => import("./pages/MarketingRoiPage"));
const AbsorptionRateModelerPage = lazy(() => import("./pages/AbsorptionRateModelerPage"));
const TechUtilizationPage = lazy(() => import("./pages/TechUtilizationPage"));
const VehicleStockTurnPage = lazy(() => import("./pages/VehicleStockTurnPage"));
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
                  <Suspense fallback={null}>
                  <Routes>
                    {/* Public routes — no sidebar */}
                    <Route path="/" element={<Index />} />
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/auth/callback" element={<AuthCallback />} />
                    <Route path="/methodology" element={<Methodology />} />
                    <Route path="/invite/:token" element={<AcceptInvite />} />

                    {/* Coach dealer full-page view — no AppSidebar, has own internal nav */}
                    <Route path="/app/coach/dealer/:dealershipId" element={
                      <ProtectedRoute requiresActorType="coach">
                        <CoachDealerPage />
                      </ProtectedRoute>
                    } />


                    {/* Authenticated routes — wrapped in sidebar layout */}
                    <Route path="/app/*" element={
                      <ProtectedRoute>
                        <AuthenticatedLayout>
                          <Routes>
                            <Route path="dashboard" element={<Dashboard />} />
                            <Route path="oem-dashboard" element={
                              <ProtectedRoute requiresActorType="oem">
                                <OemDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="oem-settings" element={
                              <ProtectedRoute requiresActorType="oem">
                                <OemSettings />
                              </ProtectedRoute>
                            } />
                            <Route path="coach-dashboard" element={
                              <ProtectedRoute requiresActorType="coach">
                                <CoachDashboard />
                              </ProtectedRoute>
                            } />
                            <Route path="coach-actions" element={
                              <ProtectedRoute requiresActorType="coach">
                                <CoachActions />
                              </ProtectedRoute>
                            } />
                            <Route path="onboarding" element={<Onboarding />} />
                            <Route path="assessment" element={
                              <ProtectedRoute requiresOnboarding>
                                <Assessment />
                              </ProtectedRoute>
                            } />
                            <Route path="results" element={<Results />} />
                            <Route path="results/:assessmentId" element={<Results />} />
                            <Route path="knowledge" element={<KnowledgeHub />} />
                            <Route path="knowledge/kpi/:kpiKey" element={<KpiDetailPage />} />
                            <Route path="playground" element={<Playground />} />
                            <Route path="playground/reverse-sales-funnel" element={<ReverseSalesFunnelPage />} />
                            <Route path="playground/marketing-roi" element={<MarketingRoiPage />} />
                            <Route path="playground/absorption-rate" element={<AbsorptionRateModelerPage />} />
                            <Route path="playground/tech-utilization" element={<TechUtilizationPage />} />
                            <Route path="playground/vehicle-stock-turn" element={<VehicleStockTurnPage />} />
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
                    <Route path="/resources" element={<Navigate to="/app/knowledge" replace />} />
                    <Route path="/kpi-encyclopedia" element={<Navigate to="/app/knowledge?tab=kpi" replace />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                  </Suspense>
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
