import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CategoryColumn } from './CategoryColumn';
import { useAppStore } from '@/store/AppContext';

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('CategoryColumn', () => {
  const mockCategory = {
    id: 'c1',
    title: 'Grocery',
    items: [{ id: 'i1', name: 'Milk', qty: 1, unit: 'pcs', person: 'Alice', price: 10 }],
  };

  const mockStore = {
    persons: ['Alice'],
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
    addItem: vi.fn(),
    renameCategory: vi.fn(),
    deleteCategory: vi.fn(),
    copyCategoryToClipboard: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders title and items', () => {
    render(<CategoryColumn category={mockCategory as any} />);
    expect(screen.getByText('Grocery')).toBeInTheDocument();
    expect(screen.getByText('Milk')).toBeInTheDocument();
  });
});
