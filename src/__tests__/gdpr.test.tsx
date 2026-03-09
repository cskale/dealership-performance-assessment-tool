import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, cleanup } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';

// Hoist mock functions so they are available in vi.mock factory
const { mockRpc, mockFrom, mockOnAuthStateChange, mockGetSession } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  })),
  mockOnAuthStateChange: vi.fn(() => ({
    data: { subscription: { unsubscribe: vi.fn() } }
  })),
  mockGetSession: vi.fn(() => Promise.resolve({
    data: { session: { user: { id: 'user-1', email: 'test@example.com' } } }
  })),
}));

// Mock Supabase with hoisted references
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      onAuthStateChange: () => mockOnAuthStateChange(),
      getSession: () => mockGetSession(),
    },
    rpc: mockRpc,
    from: mockFrom,
  }
}));

// Import hooks AFTER mock is set up
import { useGDPR } from '@/hooks/useGDPR';
import { AuthProvider } from '@/hooks/useAuth';

// Mock URL.createObjectURL for file downloads
global.URL.createObjectURL = vi.fn(() => 'mock-url');
global.URL.revokeObjectURL = vi.fn();

const TestComponent = () => {
  const { exportUserData, deleteAccount, updateConsent, loading } = useGDPR();
  
  return (
    <div>
      <button onClick={() => exportUserData()} disabled={loading}>
        Export Data
      </button>
      <button onClick={() => deleteAccount()} disabled={loading}>
        Delete Account
      </button>
      <button onClick={() => updateConsent('analytics', true)} disabled={loading}>
        Grant Analytics Consent
      </button>
      <button onClick={() => updateConsent('marketing', false)} disabled={loading}>
        Revoke Marketing Consent
      </button>
      {loading && <div>Loading...</div>}
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
          {children}
          <Toaster />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe('GDPR Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementations
    mockGetSession.mockResolvedValue({
      data: { session: { user: { id: 'user-1', email: 'test@example.com' } } }
    });
  });

  afterEach(() => {
    cleanup();
  });

  it('exports user data successfully', async () => {
    const mockExportData = {
      profile: { id: 'user-1', email: 'test@example.com' },
      exported_at: new Date().toISOString()
    };

    mockRpc.mockResolvedValue({ data: mockExportData, error: null });

    // Create a mock anchor element that won't interfere with testing-library
    const mockAnchorElement = document.createElement('a');
    mockAnchorElement.click = vi.fn();
    const createElementSpy = vi.spyOn(document, 'createElement').mockImplementation((tagName) => {
      if (tagName === 'a') {
        return mockAnchorElement;
      }
      return document.createElement.call(document, tagName);
    });
    
    // Restore createElement for test rendering
    createElementSpy.mockRestore();

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('export_user_data', {
        _user_id: 'user-1'
      });
    });
  });

  it('updates consent preferences', async () => {
    mockFrom.mockReturnValue({
      update: vi.fn().mockReturnThis(),
      eq: vi.fn(() => Promise.resolve({ error: null })),
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const consentButton = screen.getByText('Grant Analytics Consent');
    fireEvent.click(consentButton);

    await waitFor(() => {
      expect(mockFrom).toHaveBeenCalledWith('profiles');
    });
  });

  it('handles account deletion with confirmation', async () => {
    mockRpc.mockResolvedValue({ data: true, error: null });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const deleteButton = screen.getByText('Delete Account');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalledWith('delete_user_account', {
        _user_id: 'user-1'
      });
    });
  });

  it('shows loading states correctly', async () => {
    // Make RPC call hang to test loading state
    mockRpc.mockReturnValue(new Promise(() => {}));

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    // Should show loading state
    await waitFor(() => {
      expect(screen.getByText('Loading...')).toBeInTheDocument();
      expect(exportButton).toBeDisabled();
    });
  });

  it('handles errors gracefully', async () => {
    mockRpc.mockResolvedValue({ 
      data: null, 
      error: new Error('Export failed') 
    });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockRpc).toHaveBeenCalled();
    });

    // Error should be handled gracefully (toast notification)
    expect(exportButton).not.toBeDisabled();
  });
});

describe('GDPR Compliance', () => {
  afterEach(() => {
    cleanup();
  });

  it('provides all required GDPR functions', () => {
    const TestComponentCheck = () => {
      const gdpr = useGDPR();
      
      return (
        <div>
          <div data-testid="has-export">{typeof gdpr.exportUserData === 'function' ? 'yes' : 'no'}</div>
          <div data-testid="has-delete">{typeof gdpr.deleteAccount === 'function' ? 'yes' : 'no'}</div>
          <div data-testid="has-consent">{typeof gdpr.updateConsent === 'function' ? 'yes' : 'no'}</div>
        </div>
      );
    };

    render(
      <TestWrapper>
        <TestComponentCheck />
      </TestWrapper>
    );

    expect(screen.getByTestId('has-export')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-delete')).toHaveTextContent('yes');
    expect(screen.getByTestId('has-consent')).toHaveTextContent('yes');
  });
});
