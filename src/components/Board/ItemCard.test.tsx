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
    expect(screen.getByTestId('price-input')).toHaveValue(10);
    expect(screen.getByTestId('total-input')).toHaveValue(10);
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
    fireEvent.blur(input);
    
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 5 });
  });

  it('debounces price changes', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const priceInput = screen.getByTestId('price-input');
    
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
    
    // Check for dialog title
    expect(screen.getByText('Delete Item')).toBeInTheDocument();
    
    // Click "Delete" button in dialog
    const confirmBtn = screen.getByRole('button', { name: /^Delete$/ });
    fireEvent.click(confirmBtn);
    
    expect(mockStore.deleteItem).toHaveBeenCalledWith('c1', 'i1');
  });

  it('calculates per-unit price from total price', () => {
    // qty is 2, price is 10, total is 20
    const itemWithQty = { ...item, qty: 2, price: 10 };
    render(<ItemCard item={itemWithQty as any} categoryId="c1" />);
    
    const totalInput = screen.getByTestId('total-input');
    fireEvent.change(totalInput, { target: { value: '100' } });
    
    // Total 100 / Qty 2 = Price 50
    const priceInput = screen.getByTestId('price-input');
    expect(priceInput).toHaveValue(50);
    
    // Advance timers to trigger the update
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { price: 50 });
  });

  it('treats zero as a placeholder (empty string) in inputs', () => {
    const zeroItem = { ...item, price: 0, qty: 5 };
    render(<ItemCard item={zeroItem as any} categoryId="c1" />);
    
    // Price input should be empty (displaying placeholder "0")
    const priceInput = screen.getByTestId('price-input') as HTMLInputElement;
    expect(priceInput.value).toBe('');
    
    // Total input (5 * 0 = 0) should also be empty
    const totalInput = screen.getByTestId('total-input') as HTMLInputElement;
    expect(totalInput.value).toBe('');
  });

  it('handles total price change to empty string', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const totalInput = screen.getByTestId('total-input');
    fireEvent.change(totalInput, { target: { value: '' } });
    expect(screen.getByTestId('price-input')).toHaveValue(null);
  });

  it('handles total price change when qty is 0', () => {
    const itemWithZeroQty = { ...item, qty: 0 };
    render(<ItemCard item={itemWithZeroQty as any} categoryId="c1" />);
    const totalInput = screen.getByTestId('total-input');
    fireEvent.change(totalInput, { target: { value: '100' } });
    // Price should not change because qty is 0
    expect(screen.getByTestId('price-input')).toHaveValue(10);
  });

  it('handles unit steps for kg/ltr/gm', () => {
    const kgItem = { ...item, unit: 'kg', qty: 1 };
    render(<ItemCard item={kgItem as any} categoryId="c1" />);
    const addBtn = screen.getByText('add').closest('button')!;
    fireEvent.click(addBtn);
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 1.5 });
  });

  it('handles person change to unassigned', () => {
    render(<ItemCard item={item as any} categoryId="c1" />);
    const select = screen.getByTitle('Alice');
    fireEvent.change(select, { target: { value: '' } });
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { person: '' });
  });

  it('stops pointer down propagation on interactive elements', () => {
    const parentPointerDown = vi.fn();
    render(
      <div onPointerDown={parentPointerDown}>
        <ItemCard item={item as any} categoryId="c1" />
      </div>
    );
    
    const elements = [
      screen.getByTitle('Delete Item'),
      screen.getByText('remove').closest('button')!,
      screen.getByText('add').closest('button')!,
      screen.getByTestId('price-input'),
      screen.getByTitle('Alice'), // person select
      screen.getByDisplayValue('PCS'), // unit select
      screen.getByTestId('total-input')
    ];

    elements.forEach(el => {
      fireEvent.pointerDown(el);
      expect(parentPointerDown).not.toHaveBeenCalled();
    });
    
    // Just to verify the parent actually catches other pointer downs
    fireEvent.pointerDown(screen.getByText('Milk'));
    expect(parentPointerDown).toHaveBeenCalled();
  });

  it('uses 0.5 step for ltr unit', () => {
    const ltrItem = { ...item, unit: 'ltr', qty: 1 };
    render(<ItemCard item={ltrItem as any} categoryId="c1" />);
    const addBtn = screen.getByText('add').closest('button')!;
    fireEvent.click(addBtn);
    expect(mockStore.updateItem).toHaveBeenCalledWith('c1', 'i1', { qty: 1.5 });
  });

  it('handles unassigned person styling and list', () => {
    const unassignedItem = { ...item, person: '' };
    render(<ItemCard item={unassignedItem as any} categoryId="c1" />);
    const select = screen.getByTitle('Unassigned');
    expect(select).toBeInTheDocument();
    
    // Verify persons list is rendered in the select options
    const options = select.querySelectorAll('option');
    const optionTexts = Array.from(options).map(o => o.textContent);
    expect(optionTexts).toContain('Alice');
    expect(optionTexts).toContain('Bob');
    expect(optionTexts).toContain('Unassigned');
  });
});
