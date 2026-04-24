import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { ItemCard } from './ItemCard';
import { useAppStore } from '@/store/AppContext';

// Mock dnd-kit hooks
vi.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}));

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('ItemCard', () => {
  const item = { id: 'i1', name: 'Milk', qty: 1, unit: 'pcs', person: 'Alice', price: 10 };
  const mockStore = {
    persons: ['Alice', 'Bob'],
    updateItem: vi.fn(),
    deleteItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
    vi.useFakeTimers();
  });

  it('renders item details correctly', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    expect(screen.getByText('Milk')).toBeInTheDocument();
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('10')).toBeInTheDocument();
  });

  it('handles name changes', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const nameSpan = screen.getByText('Milk');
    fireEvent.click(nameSpan);
    
    const input = screen.getByDisplayValue('Milk');
    fireEvent.change(input, { target: { value: 'Oat Milk' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { name: 'Oat Milk' });
  });

  it('handles quantity increment/decrement', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const addBtn = screen.getByText('add').closest('button')!;
    const removeBtn = screen.getByText('remove').closest('button')!;
    
    fireEvent.click(addBtn);
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 2 });
    
    fireEvent.click(removeBtn);
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 0 });
  });

  it('handles manual quantity entry', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    fireEvent.click(screen.getByText('1'));
    
    const input = screen.getByDisplayValue('1');
    fireEvent.change(input, { target: { value: '5' } });
    fireEvent.keyDown(input, { key: 'Enter' });
    
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 5 });
  });

  it('debounces price changes', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const priceInput = screen.getByDisplayValue('10');
    
    fireEvent.change(priceInput, { target: { value: '15' } });
    
    // Should not have called yet
    expect(mockStore.updateItem).not.toHaveBeenCalled();
    
    // Fast forward
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { price: 15 });
  });

  it('handles person change', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const select = screen.getByTitle('Alice');
    fireEvent.change(select, { target: { value: 'Bob' } });
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { person: 'Bob' });
  });

  it('handles unit change', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const select = screen.getByDisplayValue('PCS');
    fireEvent.change(select, { target: { value: 'kg' } });
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { unit: 'kg' });
  });

  it('handles delete', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const deleteBtn = screen.getByTitle('Delete Item');
    fireEvent.click(deleteBtn);
    expect(mockStore.deleteItem).toHaveBeenCalledWith('c1', 'i1');
  });
});
