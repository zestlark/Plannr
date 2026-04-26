import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { CategoryColumn } from './CategoryColumn';
import { useAppStore } from '@/store/AppContext';

// Mock dnd-kit hooks
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
}));

vi.mock('@dnd-kit/core', () => ({
  useDroppable: () => ({
    setNodeRef: vi.fn(),
    isOver: false,
  }),
}));

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

vi.mock('./ItemCard', () => ({
  ItemCard: ({ item }: any) => <div data-testid="item-card">{item.name}</div>,
}));


describe('CategoryColumn', () => {
  const category = {
    id: 'c1',
    title: 'Groceries',
    items: [
      { id: 'i1', name: 'Milk', qty: 1, unit: 'pcs', person: '', price: 10 }
    ]
  };

  const mockStore = {
    persons: ['Alice'],
    addItem: vi.fn(),
    deleteCategory: vi.fn(),
    renameCategory: vi.fn(),
    copyCategoryToClipboard: vi.fn(),
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders category title and items', () => {
    render(<CategoryColumn category={category as any} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('handles renaming category', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Rename'));
    const input = screen.getByDisplayValue('Groceries');
    fireEvent.change(input, { target: { value: 'Food' } });
    fireEvent.click(screen.getByText('check').closest('button')!);
    expect(mockStore.renameCategory).toHaveBeenCalledWith('c1', 'Food');
  });

  it('handles renaming category via Enter key', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Rename'));
    const input = screen.getByDisplayValue('Groceries');
    fireEvent.change(input, { target: { value: 'Food' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(mockStore.renameCategory).toHaveBeenCalledWith('c1', 'Food');
  });

  it('cancels renaming category via Escape key', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Rename'));
    const input = screen.getByDisplayValue('Groceries');
    fireEvent.keyDown(input, { key: 'Escape' });
    expect(screen.queryByDisplayValue('Groceries')).not.toBeInTheDocument();
    expect(screen.getByText('Groceries')).toBeInTheDocument();
  });

  it('handles category deletion with confirmation', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Delete Category'));
    expect(screen.getByText('Delete Category')).toBeInTheDocument();
    const confirmBtn = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(confirmBtn);
    expect(mockStore.deleteCategory).toHaveBeenCalledWith('c1');
  });

  it('cancels category deletion', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Delete Category'));
    expect(screen.getByText('Delete Category')).toBeInTheDocument();
    fireEvent.click(screen.getByText('Cancel'));
    expect(screen.queryByText('Delete Category')).not.toBeInTheDocument();
  });

  it('handles copying category', () => {
    render(<CategoryColumn category={category as any} />);
    fireEvent.click(screen.getByTitle('Copy Category'));
    expect(mockStore.copyCategoryToClipboard).toHaveBeenCalledWith('c1');
  });

  it('handles adding an item', () => {
    render(<CategoryColumn category={category as any} />);
    const input = screen.getByPlaceholderText('What to buy?');
    
    // Type in input
    fireEvent.change(input, { target: { value: 'Eggs' } });
    
    // Click add button
    const addBtn = screen.getByText('add').closest('button')!;
    fireEvent.click(addBtn);
    
    expect(mockStore.addItem).toHaveBeenCalledWith('c1', 'Eggs', 'pcs');
    expect(input).toHaveValue('');
  });

  it('handles adding an item via Enter key', () => {
    render(<CategoryColumn category={category as any} />);
    const input = screen.getByPlaceholderText('What to buy?');
    
    // Type in input and hit Enter
    fireEvent.change(input, { target: { value: 'Eggs' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockStore.addItem).toHaveBeenCalledWith('c1', 'Eggs', 'pcs');
    expect(input).toHaveValue('');
  });

  it('renders empty state when no items', () => {
    const emptyCategory = { ...category, items: [] };
    render(<CategoryColumn category={emptyCategory as any} />);
    expect(screen.getByText('Empty')).toBeInTheDocument();
  });
});
