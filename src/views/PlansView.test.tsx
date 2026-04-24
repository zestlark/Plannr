import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { PlansView } from './PlansView';
import { useAppStore } from '@/store/AppContext';
import { MemoryRouter } from 'react-router-dom';

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('PlansView', () => {
  const mockStore = {
    plans: [{ id: '1', title: 'Plan 1', created_at: '2023-01-01' }],
    initialLoading: false,
    addPlan: vi.fn(),
    deletePlan: vi.fn(),
    renamePlan: vi.fn(),
    setCurrentPlanId: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders plans correctly', () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );
    expect(screen.getByText('Plan 1')).toBeInTheDocument();
  });

  it('handles "New Plan" toggle', () => {
    render(
      <MemoryRouter>
        <PlansView />
      </MemoryRouter>
    );
    const newPlanBtn = screen.getByText('New Plan');
    fireEvent.click(newPlanBtn);
    expect(screen.getByPlaceholderText(/Summer Villa/)).toBeInTheDocument();
  });
});
