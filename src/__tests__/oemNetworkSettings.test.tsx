import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('@/hooks/useAuth', () => ({
  useAuth: vi.fn(() => ({ user: { id: 'u1' }, loading: false, signOut: vi.fn(), session: null })),
}));

vi.mock('@/hooks/useMultiTenant', () => ({
  useMultiTenant: vi.fn(() => ({
    currentOrganization: { id: 'org-1', name: 'Audi HQ' },
    userMemberships: [{ organization_id: 'org-1', role: 'owner', is_active: true }],
  })),
}));

const { mockRpc, mockFrom } = vi.hoisted(() => ({
  mockRpc: vi.fn(),
  mockFrom: vi.fn(),
}));

vi.mock('@/integrations/supabase/client', () => ({
  supabase: { rpc: mockRpc, from: mockFrom },
}));

import { OemNetworkSettings } from '@/components/OemNetworkSettings';

const MOCK_NETWORK = {
  id: 'net-1',
  name: 'Audi Germany Pilot',
  oem_brand: 'Audi',
  country_scope: ['Germany'],
  owner_org_id: 'org-1',
  status: 'active',
  settings: {},
  programme_code: null,
  created_at: '2026-04-29T00:00:00Z',
  updated_at: '2026-04-29T00:00:00Z',
};

function setupFromMock(networkData: typeof MOCK_NETWORK | null = MOCK_NETWORK) {
  mockFrom.mockImplementation((table: string) => {
    if (table === 'oem_networks') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              maybeSingle: () => Promise.resolve({ data: networkData, error: null }),
            }),
          }),
        }),
      };
    }
    if (table === 'dealer_network_memberships') {
      return {
        select: () => ({
          eq: () => ({
            eq: () => ({
              order: () => Promise.resolve({ data: [], error: null }),
            }),
          }),
        }),
      };
    }
    return {
      select: () => ({
        eq: () => ({ maybeSingle: () => Promise.resolve({ data: null }) }),
      }),
    };
  });
}

describe('OemNetworkSettings — dealer lookup', () => {
  beforeEach(() => {
    mockRpc.mockReset();
    mockFrom.mockReset();
    setupFromMock();
  });

  it('shows dealer name and location when lookup finds a match', async () => {
    mockRpc.mockResolvedValue({
      data: {
        found: true,
        dealership_id: 'd-1',
        dealership_name: 'Audi München',
        location: 'München',
        organization_id: 'org-dealer-1',
      },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(
      () => expect(screen.getByLabelText(/dealer contact email/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );

    fireEvent.change(screen.getByLabelText(/dealer contact email/i), {
      target: { value: 'manager@audimunich.de' },
    });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(
      () => expect(screen.getByText('Audi München')).toBeInTheDocument(),
      { timeout: 3000 }
    );
    expect(screen.getAllByText(/münchen/i).length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /add to network/i })).toBeInTheDocument();
  });

  it('shows no_account message when email is not registered', async () => {
    mockRpc.mockResolvedValue({
      data: { found: false, reason: 'no_account' },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(
      () => expect(screen.getByLabelText(/dealer contact email/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );

    fireEvent.change(screen.getByLabelText(/dealer contact email/i), {
      target: { value: 'unknown@nobody.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(
      () => expect(screen.getByText(/no account found/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });

  it('shows no_dealership message when user has not completed onboarding', async () => {
    mockRpc.mockResolvedValue({
      data: { found: false, reason: 'no_dealership' },
      error: null,
    });

    render(<OemNetworkSettings />);
    await waitFor(
      () => expect(screen.getByLabelText(/dealer contact email/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );

    fireEvent.change(screen.getByLabelText(/dealer contact email/i), {
      target: { value: 'incomplete@dealer.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /look up/i }));

    await waitFor(
      () => expect(screen.getByText(/hasn't completed/i)).toBeInTheDocument(),
      { timeout: 3000 }
    );
  });
});
