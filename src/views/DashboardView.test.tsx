import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from './DashboardView';
import { useAppStore } from '@/store/AppContext';

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('DashboardView', () => {
  const mockStore = {
    categories: [
      { id: 'c1', title: 'Cat 1', items: [{ id: 'i1', name: 'Item 1', qty: 2, price: 10, unit: 'pcs' }] }
    ],
    persons: ['Alice'],
    loading: false,
    activePlan: { title: 'Test Plan' },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders summary and charts', () => {
    render(<DashboardView searchQuery="" />);
    // Check if total matches
    // Check if total matches
    expect(screen.getByText(/20/)).toBeInTheDocument();
  });
});
