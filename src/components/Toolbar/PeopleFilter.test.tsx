import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PeopleFilter } from './PeopleFilter';
import { useAppStore } from '@/store/AppContext';

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('PeopleFilter', () => {
  const persons = ['Alice', 'Bob'];
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue({ persons });
  });

  it('renders correctly', () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    expect(screen.getByText('People')).toBeInTheDocument();
  });

  it('opens dropdown and shows people', async () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('People'));
    expect(await screen.findByText('Alice')).toBeInTheDocument();
    expect(await screen.findByText('Bob')).toBeInTheDocument();
  });

  it('selects a person', async () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('People'));
    const item = await screen.findByText('Alice');
    fireEvent.click(item);
    expect(mockOnChange).toHaveBeenCalledWith(['Alice']);
  });

  it('clears filters', async () => {
    render(<PeopleFilter selectedPersons={['Alice']} onChange={mockOnChange} />);
    fireEvent.click(screen.getByRole('button', { name: /People/i }));
    const clearBtn = await screen.findByText('Clear filters');
    fireEvent.click(clearBtn);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('deselects a person', async () => {
    render(<PeopleFilter selectedPersons={['Alice']} onChange={mockOnChange} />);
    // Open the popover
    fireEvent.click(screen.getByRole('button', { name: /People/i }));
    // Find 'Alice' in the CommandGroup, not the badge in the trigger
    const items = await screen.findAllByText('Alice');
    // The item in the dropdown is usually the one inside a CommandItem (role="option" or similar)
    // Let's find the one that is NOT the trigger badge. 
    // Or just click the last one found which is likely in the dropdown.
    fireEvent.click(items[items.length - 1]);
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });

  it('selects unassigned', async () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('People'));
    const item = await screen.findByText('Unassigned');
    fireEvent.click(item);
    expect(mockOnChange).toHaveBeenCalledWith(['']);
  });

  it('shows "X selected" badge when more than 2 persons selected', () => {
    (useAppStore as any).mockReturnValue({ persons: ['Alice', 'Bob', 'Charlie'] });
    render(<PeopleFilter selectedPersons={['Alice', 'Bob', 'Charlie']} onChange={mockOnChange} />);
    expect(screen.getByText('3 selected')).toBeInTheDocument();
  });

  it('shows individual badges when 2 or fewer persons selected', () => {
    render(<PeopleFilter selectedPersons={['Alice', 'Bob']} onChange={mockOnChange} />);
    // The trigger should show individual badges for each selected person (in the lg:flex div)
    const aliceBadges = screen.getAllByText('Alice');
    expect(aliceBadges.length).toBeGreaterThanOrEqual(1);
    const bobBadges = screen.getAllByText('Bob');
    expect(bobBadges.length).toBeGreaterThanOrEqual(1);
  });
});
