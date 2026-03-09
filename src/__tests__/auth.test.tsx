import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act, cleanup } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Auth from '@/pages/Auth';
import { AuthProvider } from '@/hooks/useAuth';
import { Toaster } from '@/components/ui/toaster';
import { supabase } from '@/integrations/supabase/client';

// Mock Supabase with synchronous getSession to avoid act() warnings
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

const activateTab = async (name: RegExp) => {
  const tab = screen.getByRole('tab', { name });
  await act(async () => {
    fireEvent.mouseDown(tab, { button: 0 });
    fireEvent.mouseUp(tab, { button: 0 });
    fireEvent.click(tab);
  });
  return tab;
};

// Helper to render and wait for auth state to settle
const renderAuth = async () => {
  let result: ReturnType<typeof render>;
  await act(async () => {
    result = render(
      <TestWrapper>
        <Auth />
      </TestWrapper>
    );
    // Allow initial auth state promises to resolve
    await Promise.resolve();
  });
  return result!;
};

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.signUp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOtp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it('renders auth form with all sign-in methods', async () => {
    await renderAuth();

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
    await renderAuth();

    // Switch to magic link tab
    const magicTab = await activateTab(/magic link/i);
    await waitFor(() => {
      expect(magicTab).toHaveAttribute('data-state', 'active');
    });
    await waitFor(() => {
      // Use role+name to avoid brittle text matching when icons are present
      expect(screen.getByRole('button', { name: /send magic link/i })).toBeInTheDocument();
    });

    // Switch to sign up tab
    const signupTab = await activateTab(/sign up/i);
    await waitFor(() => {
      expect(signupTab).toHaveAttribute('data-state', 'active');
    });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /create account/i })).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Enter your full name')).toBeInTheDocument();
    });
  });

  it('has proper accessibility attributes', async () => {
    await renderAuth();

    // Check for form labels
    expect(screen.getByLabelText('Email')).toBeInTheDocument();

    // Check for required fields
    const emailInput = screen.getByPlaceholderText('Enter your email');
    expect(emailInput).toHaveAttribute('required');
    expect(emailInput).toHaveAttribute('type', 'email');
  });

  it('shows loading states correctly', async () => {
    // Make the sign-in mutation stay pending so we can reliably observe the loading UI
    let resolveSignIn: ((value: any) => void) | undefined;
    const pendingSignIn = new Promise((resolve) => {
      resolveSignIn = resolve;
    });
    (supabase.auth.signInWithPassword as any).mockReturnValueOnce(pendingSignIn);

    await renderAuth();

    const signInButton = screen.getByRole('button', { name: /sign in with email/i });

    // Fill form
    await act(async () => {
      fireEvent.change(screen.getByPlaceholderText('Enter your email'), {
        target: { value: 'test@example.com' }
      });
      fireEvent.change(screen.getByPlaceholderText('Enter your password'), {
        target: { value: 'password123' }
      });
    });

    // Submit form
    await act(async () => {
      fireEvent.click(signInButton);
    });

    await waitFor(() => {
      expect(signInButton).toBeDisabled();
    });

    await act(async () => {
      resolveSignIn?.({ error: null });
    });

    await waitFor(() => {
      expect(signInButton).not.toBeDisabled();
    });
  });
});

describe('Auth Keyboard Navigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.signUp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOtp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it('is keyboard navigable', async () => {
    await renderAuth();

    const firstInput = screen.getByPlaceholderText('Enter your email');
    const passwordInput = screen.getByPlaceholderText('Enter your password');

    await act(async () => {
      firstInput.focus();
    });
    expect(document.activeElement).toBe(firstInput);

    // jsdom doesn't implement native focus traversal on Tab, so we verify both fields are focusable.
    await act(async () => {
      fireEvent.keyDown(firstInput, { key: 'Tab' });
      passwordInput.focus();
    });
    expect(document.activeElement).toBe(passwordInput);
  });
});

describe('Auth Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (supabase.auth.signUp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithPassword as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOtp as any).mockResolvedValue({ error: null });
    (supabase.auth.signInWithOAuth as any).mockResolvedValue({ error: null });
  });

  afterEach(() => {
    cleanup();
  });

  it('validates email format', async () => {
    await renderAuth();

    const emailInput = screen.getByPlaceholderText('Enter your email');

    // Enter invalid email
    await act(async () => {
      fireEvent.change(emailInput, { target: { value: 'invalid-email' } });
      fireEvent.blur(emailInput);
    });

    // HTML5 validation should catch this
    expect(emailInput).toBeInvalid();
  });

  it('enforces password minimum length', async () => {
    await renderAuth();

    // Switch to sign up
    await activateTab(/sign up/i);

    const passwordInput = await screen.findByPlaceholderText('Create a password (min. 6 characters)');
    expect(passwordInput).toHaveAttribute('minLength', '6');
  });
});
