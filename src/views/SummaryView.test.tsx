import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
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


});
