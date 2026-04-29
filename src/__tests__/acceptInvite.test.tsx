import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';

const { mockRpc } = vi.hoisted(() => ({ mockRpc: vi.fn() }));

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({
    user: { id: 'u1', email: 'coach@test.com' },
    loading: false,
    signOut: vi.fn(),
    session: null,
  })),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: mockRpc },
}));

import AcceptInvite from '@/pages/AcceptInvite';

function renderAcceptInvite(token = 'tok-abc') {
  return render(
    <MemoryRouter initialEntries={[`/invite/${token}`]}>
      <Routes>
        <Route path="/invite/:token" element={<AcceptInvite />} />
        <Route path="/app/assessment" element={<div data-testid="assessment" />} />
        <Route path="/app/coach-dashboard" element={<div data-testid="coach-dashboard" />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AcceptInvite redirect', () => {
  beforeEach(() => {
    mockRpc.mockReset();
  });

  // Error state tests run first — they resolve quickly (no 1800ms timer).
  it('shows error state for an expired token', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false, error: 'invite_invalid_or_expired' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() =>
      expect(screen.getByText(/expired or been revoked/i)).toBeInTheDocument()
    );
  });

  it('shows error state for an already accepted token', async () => {
    mockRpc.mockResolvedValue({
      data: { success: false, error: 'already_accepted' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(() =>
      expect(screen.getByText(/already been used/i)).toBeInTheDocument()
    );
  });

  // Redirect tests wait ~1800ms for the component's navigate delay.
  it('redirects to /app/assessment for a dealer invite', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, invite_type: 'dealer' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(
      () => expect(screen.getByTestId('assessment')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('redirects to /app/coach-dashboard for a coach invite', async () => {
    mockRpc.mockResolvedValue({
      data: { success: true, invite_type: 'coach' },
      error: null,
    });
    renderAcceptInvite();
    await waitFor(
      () => expect(screen.getByTestId('coach-dashboard')).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});
