import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'

const mockFrom = vi.hoisted(() => vi.fn())

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: mockFrom,
  },
}))

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return { ...actual, useNavigate: () => vi.fn() }
})

import { CoachNotesPanel } from '@/components/CoachNotesPanel'

function makeSupabaseChain(resolvedValue: { data: unknown; error: unknown }) {
  const chain = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockResolvedValue(resolvedValue),
  }
  return chain
}

describe('CoachNotesPanel', () => {
  beforeEach(() => {
    mockFrom.mockReset()
  })

  it('renders nothing when dealershipId is null', () => {
    const { container } = render(
      <MemoryRouter><CoachNotesPanel dealershipId={null} /></MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders coach note when data is present', async () => {
    mockFrom.mockReturnValue(makeSupabaseChain({
      data: [
        {
          id: 'note-1',
          note_text: 'Great progress on NVS follow-up process.',
          created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
          action_id: null,
          profiles: { display_name: 'Coach Smith', full_name: 'John Smith' },
        },
      ],
      error: null,
    }))

    render(<MemoryRouter><CoachNotesPanel dealershipId="d1" /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText('Coach Notes')).toBeInTheDocument()
      expect(screen.getByText(/Great progress on NVS/)).toBeInTheDocument()
      expect(screen.getByText('Coach Smith')).toBeInTheDocument()
    })
  })

  it('renders nothing when no notes exist', async () => {
    mockFrom.mockReturnValue(makeSupabaseChain({ data: [], error: null }))

    const { container } = render(
      <MemoryRouter><CoachNotesPanel dealershipId="d1" /></MemoryRouter>
    )

    await waitFor(() => {
      expect(container.firstChild).toBeNull()
    })
  })

  it('shows Linked to action badge when action_id is set', async () => {
    mockFrom.mockReturnValue(makeSupabaseChain({
      data: [
        {
          id: 'note-2',
          note_text: 'Follow up on pricing action.',
          created_at: new Date().toISOString(),
          action_id: 'action-uuid-123',
          profiles: { display_name: null, full_name: 'Jane Coach' },
        },
      ],
      error: null,
    }))

    render(<MemoryRouter><CoachNotesPanel dealershipId="d1" /></MemoryRouter>)

    await waitFor(() => {
      expect(screen.getByText(/Linked to action/)).toBeInTheDocument()
    })
  })
})
