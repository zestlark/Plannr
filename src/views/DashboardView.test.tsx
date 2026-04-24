import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DashboardView } from './DashboardView';
import { useAppStore } from '../store/AppContext';

vi.mock('../store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('DashboardView', () => {
  const mockStore = {
    categories: [{ id: 'c1', title: 'Food', items: [] }],
    persons: ['Alice'],
    loading: false,
    initialLoading: false,
    activePlan: { title: 'Summer Trip' },
    addCategory: vi.fn(),
    sortAllItems: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders active plan title', () => {
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText('Summer Trip')).toBeInTheDocument();
  });

  it('shows syncing indicator when loading', () => {
    (useAppStore as any).mockReturnValue({ ...mockStore, loading: true });
    render(<DashboardView searchQuery="" />);
    expect(screen.getByText(/Syncing.../i)).toBeInTheDocument();
  });
});
