import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

// Mock all hooks ProtectedRoute depends on — we test the route guard
// logic, not the hooks' internal implementations.
vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('@/hooks/useOnboarding', () => ({
  useOnboarding: vi.fn(),
}));

vi.mock('@/hooks/useActiveRole', () => ({
  useActiveRole: vi.fn(),
}));

import { useAuth } from '@/hooks/useAuth';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useActiveRole } from '@/hooks/useActiveRole';
import { ProtectedRoute } from '@/components/ProtectedRoute';

const mockUser = { id: 'u1', email: 'x@x.com' };
const mockAuthActions = {
  signUp: vi.fn(),
  signIn: vi.fn(),
  signInWithMagicLink: vi.fn(),
  signInWithOAuth: vi.fn(),
};

function setupMocks(actorType: string | null, roleLoading = false) {
  vi.mocked(useAuth).mockReturnValue({
    user: mockUser as any,
    loading: false,
    signOut: vi.fn(),
    session: null as any,
    ...mockAuthActions,
  });
  vi.mocked(useOnboarding).mockReturnValue({
    status: 'complete' as any,
    isLoading: false,
  } as any);
  vi.mocked(useActiveRole).mockReturnValue({
    actorType: actorType as any,
    loading: roleLoading,
    uxRole: null,
    membershipRole: null,
    organizationId: null,
    dealerId: null,
  });
}

function renderWithRouter(actorType: string | null, requiredType: 'oem' | 'coach') {
  setupMocks(actorType);
  return render(
    <MemoryRouter initialEntries={['/protected']}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute requiresActorType={requiredType}>
              <div data-testid="protected-content">Protected</div>
            </ProtectedRoute>
          }
        />
        <Route
          path="/app/dashboard"
          element={<div data-testid="dashboard">Dashboard</div>}
        />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProtectedRoute requiresActorType', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders children when actorType matches required type', async () => {
    renderWithRouter('oem', 'oem');
    await waitFor(() => {
      expect(screen.getByTestId('protected-content')).toBeInTheDocument();
    });
  });

  it('redirects to /app/dashboard when actorType does not match', async () => {
    renderWithRouter('dealer', 'oem');
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('redirects to /app/dashboard when actorType is null', async () => {
    renderWithRouter(null, 'coach');
    await waitFor(() => {
      expect(screen.getByTestId('dashboard')).toBeInTheDocument();
    });
  });

  it('shows loading state while role is resolving', () => {
    vi.mocked(useAuth).mockReturnValue({ user: mockUser as any, loading: false, signOut: vi.fn(), session: null as any, ...mockAuthActions });
    vi.mocked(useOnboarding).mockReturnValue({ status: 'complete' as any, isLoading: false } as any);
    vi.mocked(useActiveRole).mockReturnValue({ actorType: null, loading: true, uxRole: null, membershipRole: null, organizationId: null, dealerId: null });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiresActorType="oem">
                <div data-testid="protected-content">Protected</div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText('Checking access...')).toBeInTheDocument();
  });

  it('redirects unauthenticated users to /auth', async () => {
    vi.mocked(useAuth).mockReturnValue({ user: null, loading: false, signOut: vi.fn(), session: null as any, ...mockAuthActions });
    vi.mocked(useOnboarding).mockReturnValue({ status: 'complete' as any, isLoading: false } as any);
    vi.mocked(useActiveRole).mockReturnValue({ actorType: null, loading: false, uxRole: null, membershipRole: null, organizationId: null, dealerId: null });

    render(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route
            path="/protected"
            element={
              <ProtectedRoute requiresActorType="oem">
                <div data-testid="protected-content">Protected</div>
              </ProtectedRoute>
            }
          />
          <Route path="/auth" element={<div data-testid="auth-page">Auth</div>} />
        </Routes>
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByTestId('auth-page')).toBeInTheDocument();
    });
  });
});
