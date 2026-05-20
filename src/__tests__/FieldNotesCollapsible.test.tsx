import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { FieldNotesCollapsible } from '@/components/results/FieldNotesCollapsible';

const mockNotes = [
  { questionId: 'nvs-1', text: 'Sales team needs training' },
  { questionId: 'nvs-2', text: 'Low follow-up rate observed' },
];

const mockLabels: Record<string, string> = {
  'nvs-1': 'Monthly new vehicle sales volume',
  'nvs-2': 'Lead follow-up process',
};

describe('FieldNotesCollapsible', () => {
  it('renders trigger with note count', () => {
    render(<FieldNotesCollapsible notes={mockNotes} questionLabels={mockLabels} />);
    expect(screen.getByText(/Field Notes \(2\)/i)).toBeTruthy();
  });

  it('shows notes after clicking trigger', () => {
    render(<FieldNotesCollapsible notes={mockNotes} questionLabels={mockLabels} />);
    fireEvent.click(screen.getByText(/Field Notes \(2\)/i));
    expect(screen.getByText('Sales team needs training')).toBeTruthy();
  });

  it('renders nothing when notes array is empty', () => {
    const { container } = render(
      <FieldNotesCollapsible notes={[]} questionLabels={mockLabels} />
    );
    expect(container.firstChild).toBeNull();
  });
});
