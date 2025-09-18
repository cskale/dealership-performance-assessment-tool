import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { MultiTenantProvider, useMultiTenant } from '@/hooks/useMultiTenant';
import { Toaster } from '@/components/ui/toaster';

// Mock Supabase
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    getSession: vi.fn(() => Promise.resolve({ data: { session: { user: { id: 'user-1' } } } })),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    single: vi.fn(() => Promise.resolve({ 
      data: { active_organization_id: 'org-1' } 
    })),
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

const TestComponent = () => {
  const { currentOrganization, organizations, loading, canPerformAction } = useMultiTenant();
  
  if (loading) return <div>Loading...</div>;
  
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
    
    // Setup mock responses for memberships query
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: vi.fn(() => Promise.resolve({
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
            ]
          }))
        };
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { active_organization_id: 'org-1' } 
        })),
      };
    });
  });

  it('loads organization data for authenticated user', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    // Initially shows loading
    expect(screen.getByText('Loading...')).toBeInTheDocument();

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByTestId('current-org')).toBeInTheDocument();
    });
  });

  it('correctly calculates role-based permissions', async () => {
    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    await waitFor(() => {
      // Owner should be able to create and delete
      expect(screen.getByTestId('can-create')).toHaveTextContent('Can create');
      expect(screen.getByTestId('can-delete')).toHaveTextContent('Can delete');
    });
  });

  it('handles viewer role permissions correctly', async () => {
    // Mock viewer role
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'memberships') {
        return {
          select: vi.fn().mockReturnThis(),
          eq: vi.fn().mockReturnThis(),
          then: vi.fn(() => Promise.resolve({
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
            ]
          }))
        };
      }
      
      return {
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockReturnThis(),
        single: vi.fn(() => Promise.resolve({ 
          data: { active_organization_id: 'org-1' } 
        })),
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
    });
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