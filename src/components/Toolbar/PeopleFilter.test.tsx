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

  it('opens dropdown and shows people', () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('People'));
    expect(screen.getByText('Alice')).toBeInTheDocument();
    expect(screen.getByText('Bob')).toBeInTheDocument();
  });

  it('selects a person', () => {
    render(<PeopleFilter selectedPersons={[]} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText('People'));
    fireEvent.click(screen.getByText('Alice'));
    expect(mockOnChange).toHaveBeenCalledWith(['Alice']);
  });

  it('clears filters', () => {
    render(<PeopleFilter selectedPersons={['Alice']} onChange={mockOnChange} />);
    fireEvent.click(screen.getByText(/People/)); // Includes the counter
    fireEvent.click(screen.getByText('Clear all'));
    expect(mockOnChange).toHaveBeenCalledWith([]);
  });
});
