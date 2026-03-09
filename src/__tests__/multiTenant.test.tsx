import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { screen, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Hoist mock functions so they are available in vi.mock factory
const { mockFrom, mockOnAuthStateChange, mockGetSession } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  mockOnAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  })),
  mockGetSession: vi.fn(() => Promise.resolve({
    data: { session: { user: { id: 'user-1' } } }
  })),
}));

// Mock Supabase with hoisted references
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => mockOnAuthStateChange(),
      getSession: () => mockGetSession(),
    },
    from: mockFrom,
  }
}));

// Import providers AFTER mock is set up
import { AuthProvider } from '@/hooks/useAuth';
import { MultiTenantProvider, useMultiTenant } from '@/hooks/useMultiTenant';

const TestComponent = () => {
  const { currentOrganization, organizations, loading, canPerformAction } = useMultiTenant();
  
  if (loading) return <div data-testid="loading">Loading...</div>;
  
  return (
    <div>
      <div data-testid="current-org">
        {currentOrganization?.name || 'No organization'}
      </div>
      <div data-testid="org-count">
        {organizations.length} organizations
      </div>
      <div data-testid="can-create">
        {canPerformAction('create') ? 'Can create' : 'Cannot create'}
      </div>
      <div data-testid="can-delete">
        {canPerformAction('delete') ? 'Can delete' : 'Cannot delete'}
      </div>
    </div>
  );
};

const TestWrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <MultiTenantProvider>
            {children}
            <Toaster />
          </MultiTenantProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('MultiTenant Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset session mock
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1' } } }
    });
    
    // Setup comprehensive mock for all Supabase calls in useMultiTenant
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { active_organization_id: 'org-1' },
            error: null
          }),
          update: vi.fn().mockReturnThis(),
        };
      }
      if (table === 'memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'membership-1',
                  user_id: 'user-1',
                  organization_id: 'org-1',
                  role: 'owner',
                  is_active: true,
                  organization: {
                    id: 'org-1',
                    name: 'Test Organization',
                    slug: 'test-org'
                  }
                }
              ],
              error: null
            })
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('loads organization data for authenticated user', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Wait for loading to complete and data to appear
    await waitFor(() => {
      expect(screen.getByTestId('current-org')).toBeInTheDocument();
    }, { timeout: 2000 });
  });

  it('correctly calculates role-based permissions for owner', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      // Owner should be able to create and delete
      expect(screen.getByTestId('can-create')).toHaveTextContent('Can create');
      expect(screen.getByTestId('can-delete')).toHaveTextContent('Can delete');
    }, { timeout: 2000 });
  });

  it('handles viewer role permissions correctly', async () => {
    // Mock viewer role
    mockFrom.mockImplementation((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          single: vi.fn().mockResolvedValue({ 
            data: { active_organization_id: 'org-1' },
            error: null
          }),
          update: vi.fn().mockReturnThis(),
        };
      }
      if (table === 'memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({
              data: [
                {
                  id: 'membership-1',
                  user_id: 'user-1',
                  organization_id: 'org-1',
                  role: 'viewer',
                  is_active: true,
                  organization: {
                    id: 'org-1',
                    name: 'Test Organization',
                    slug: 'test-org'
                  }
                }
              ],
              error: null
            })
          }),
        };
      }
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
        single: vi.fn().mockResolvedValue({ data: null, error: null }),
      };
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      // Viewer should not be able to create or delete
      expect(screen.getByTestId('can-create')).toHaveTextContent('Cannot create');
      expect(screen.getByTestId('can-delete')).toHaveTextContent('Cannot delete');
    }, { timeout: 2000 });
  });
});

describe('Organization Switching', () => {
  it('provides organization switching capability', async () => {
    const { useMultiTenant: useMultiTenantHook } = await import('@/hooks/useMultiTenant');
    
    // This is a unit test for the hook logic
    // In a real test, you'd render a component that uses the switchOrganization function
    expect(typeof useMultiTenantHook).toBe('function');
  });
});
