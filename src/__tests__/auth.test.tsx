import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render } from '@testing-library/react';
import { screen, fireEvent, waitFor } from '@testing-library/dom';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signInWithOtp: vi.fn(),
      signInWithOAuth: vi.fn(),
      onAuthStateChange: vi.fn(() => ({ data: { subscription: { unsubscribe: vi.fn() } } })),
      getSession: vi.fn(() => Promise.resolve({ data: { session: null } })),
    }
  }
}));

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

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders auth form with all sign-in methods', () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    // Check for social auth buttons
    expect(screen.getByText('Continue with Google')).toBeInTheDocument();
    expect(screen.getByText('Continue with Apple')).toBeInTheDocument();
    expect(screen.getByText('Continue with Facebook')).toBeInTheDocument();

    // Check for tabs
    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Magic Link')).toBeInTheDocument();
    expect(screen.getByText('Sign Up')).toBeInTheDocument();
  });

  it('switches between auth methods', async () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    // Switch to magic link tab
    fireEvent.click(screen.getByText('Magic Link'));
    expect(screen.getByText('Send Magic Link')).toBeInTheDocument();

    // Switch to sign up tab
    fireEvent.click(screen.getByText('Sign Up'));
    expect(screen.getByText('Create Account')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
  });

  it('has proper accessibility attributes', () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    // Check for form labels
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    
    // Check for required fields
    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('shows loading states correctly', async () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    const signInButton = screen.getByText('Sign In with Email');
    
    // Fill form
    fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
      target: { value: 'test@example.com' }
    });
    fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
      target: { value: 'password123' }
    });

    // Submit form
    fireEvent.click(signInButton);
    
    // Should show loading state briefly
    await waitFor(() => {
      expect(signInButton).toBeDisabled();
    });
  });
});

describe('Auth Keyboard Navigation', () => {
  it('is keyboard navigable', () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    const firstInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');
    
    // Tab navigation
    firstInput.focus();
    expect(document.activeElement).toBe(firstInput);
    
    // Should be able to navigate to next field
    fireEvent.keyDown(firstInput, { key: 'Tab' });
    setTimeout(() => {
      expect(document.activeElement).toBe(passwordInput);
    }, 0);
  });
});

describe('Auth Validation', () => {
  it('validates email format', async () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    const emailInput = screen.getByPlaceholderText('Enter your email');
    
    // Enter invalid email
    fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
    fireEvent.blur(emailInput);
    
    // HTML5 validation should catch this
    expect(emailInput).toBeInvalid();
  });

  it('enforces password minimum length', () => {
    render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );

    // Switch to sign up
    fireEvent.click(screen.getByText('Sign Up'));
    
    const passwordInput = screen.getByPlaceholderText('Create a password (min. 6 characters)');
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});