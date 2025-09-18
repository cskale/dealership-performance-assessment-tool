import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Assessment from "./pages/Assessment";
import Results from "./pages/Results";
import Auth from "./pages/Auth";
import AuthCallback from "./pages/AuthCallback";
import Account from "./pages/Account";
import NotFound from "./pages/NotFound";
import { AuthProvider } from "@/hooks/useAuth";
import { MultiTenantProvider } from "@/hooks/useMultiTenant";
import { ProtectedRoute } from "@/components/ProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <MultiTenantProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/auth/callback" element={<AuthCallback />} />
              <Route path="/app/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<Index />} />
                    <Route path="assessment" element={<Assessment />} />
                    <Route path="results" element={<Results />} />
                  </Routes>
                </ProtectedRoute>
              } />
              <Route path="/account/*" element={
                <ProtectedRoute>
                  <Routes>
                    <Route index element={<Account />} />
                  </Routes>
                </ProtectedRoute>
              } />
              <Route path="/" element={
                <ProtectedRoute>
                  <Index />
                </ProtectedRoute>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </MultiTenantProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
