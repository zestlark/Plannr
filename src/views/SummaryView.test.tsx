import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SummaryView } from './SummaryView';
import { useAppStore } from '../store/AppContext';

vi.mock('../store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('SummaryView', () => {
  const mockStore = {
    categories: [
      { 
        id: 'c1', 
        title: 'Food', 
        items: [
          { id: 'i1', name: 'Milk', qty: 2, price: 10, unit: 'pcs', person: 'Alice' }
        ] 
      }
    ],
    persons: ['Alice'],
    activePlan: { title: 'Summer Trip' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders stats summary correctly', () => {
    render(<SummaryView />);
    expect(screen.getByText('₹20')).toBeInTheDocument();
  });

  it('toggles sub-tabs correctly', () => {
    render(<SummaryView />);
    
    const productsTab = screen.getByRole('button', { name: /Product Details/i });
    const peopleTab = screen.getByRole('button', { name: /Person-wise Totals/i });

    // Initially products tab is active
    expect(productsTab).toHaveClass('bg-primary');
    expect(peopleTab).not.toHaveClass('bg-primary');

    // Click people tab
    fireEvent.click(peopleTab);
    expect(peopleTab).toHaveClass('bg-primary');
    expect(productsTab).not.toHaveClass('bg-primary');

    // Click products tab again
    fireEvent.click(productsTab);
    expect(productsTab).toHaveClass('bg-primary');
    expect(peopleTab).not.toHaveClass('bg-primary');
  });
});
