import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/hooks/useAuth';
import { useGDPR } from '@/hooks/useGDPR';
import { Toaster } from '@/components/ui/toaster';

// Mock Supabase
const mockSupabase = {
  auth: {
    onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
    getSession: vi.fn(() => Promise.resolve({ 
      data: { session: { user: { id: 'user-1', email: 'test@example.com' } } } 
    })),
  },
  rpc: vi.fn(),
  from: vi.fn(() => ({
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
  }))
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase
}));

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
  });

  it('exports user data successfully', async () => {
    const mockExportData = {
      profile: { id: 'user-1', email: 'test@example.com' },
      exported_at: new Date().toISOString()
    };

    mockSupabase.rpc.mockResolvedValue({ data: mockExportData, error: null });

    // Mock document.createElement for download link
    const mockLink = {
      href: '',
      download: '',
      click: vi.fn(),
    };
    vi.spyOn(document, 'createElement').mockReturnValue(mockLink as any);
    vi.spyOn(document.body, 'appendChild').mockImplementation(() => mockLink as any);
    vi.spyOn(document.body, 'removeChild').mockImplementation(() => mockLink as any);

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const exportButton = screen.getByText('Export Data');
    fireEvent.click(exportButton);

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('export_user_data', {
        _user_id: 'user-1'
      });
    });

    // Check that download was triggered
    expect(mockLink.click).toHaveBeenCalled();
    expect(mockLink.download).toContain('user-data-export-');
  });

  it('updates consent preferences', async () => {
    mockSupabase.from.mockReturnValue({
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
      expect(mockSupabase.from).toHaveBeenCalledWith('profiles');
    });
  });

  it('handles account deletion with confirmation', async () => {
    mockSupabase.rpc.mockResolvedValue({ data: true, error: null });

    render(
      <TestWrapper>
        <TestComponent />
      </TestWrapper>
    );

    const deleteButton = screen.getByText('Delete Account');
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(mockSupabase.rpc).toHaveBeenCalledWith('delete_user_account', {
        _user_id: 'user-1'
      });
    });
  });

  it('shows loading states correctly', async () => {
    // Make RPC call hang to test loading state
    mockSupabase.rpc.mockReturnValue(new Promise(() => {}));

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
    mockSupabase.rpc.mockResolvedValue({ 
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
      expect(mockSupabase.rpc).toHaveBeenCalled();
    });

    // Error should be handled gracefully (toast notification)
    expect(exportButton).not.toBeDisabled();
  });
});

describe('GDPR Compliance', () => {
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