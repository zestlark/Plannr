import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ItemCard } from './ItemCard';
import { useAppStore } from '@/store/AppContext';

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('ItemCard', () => {
  const item = { id: 'i1', name: 'Milk', qty: 1, unit: 'L', person: 'Alice', price: 10 };
  const mockStore = {
    persons: ['Alice', 'Bob'],
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders item details correctly', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('handles delete', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const deleteBtn = screen.getByTitle('Delete Item');
    fireEvent.click(deleteBtn);
    expect(mockStore.deleteItem).toHaveBeenCalledWith('c1', 'i1');
  });
});
