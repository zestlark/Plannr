import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Board } from './Board';
import { useAppStore } from '@/store/AppContext';
import { Item } from '@/types';

// Mock dnd-kit
vi.mock('@dnd-kit/core', () => ({
  DndContext: ({ children, onDragStart, onDragOver, onDragEnd }: any) => (
    <div data-testid="dnd-context">
      <button 
        data-testid="drag-start" 
        onClick={(e: any) => onDragStart && onDragStart(JSON.parse(e.target.value))}
      />
      <button 
        data-testid="drag-over" 
        onClick={(e: any) => onDragOver && onDragOver(JSON.parse(e.target.value))}
      />
      <button 
        data-testid="drag-end" 
        onClick={(e: any) => onDragEnd && onDragEnd(JSON.parse(e.target.value))}
      />
      {children}
    </div>
  ),
  DragOverlay: ({ children }: any) => <div data-testid="drag-overlay">{children}</div>,
  PointerSensor: vi.fn(),
  KeyboardSensor: vi.fn(),
  useSensor: vi.fn(),
  useSensors: vi.fn(),
  closestCorners: vi.fn(),
  defaultDropAnimationSideEffects: vi.fn(),
}));

vi.mock('@dnd-kit/sortable', () => ({
  arrayMove: vi.fn((arr, from, to) => {
    const res = [...arr];
    res.splice(to, 0, res.splice(from, 1)[0]);
    return res;
  }),
  sortableKeyboardCoordinates: vi.fn(),
  SortableContext: ({ children }: any) => <div>{children}</div>,
  verticalListSortingStrategy: {},
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: vi.fn(),
    transform: null,
    transition: null,
  }),
}));

vi.mock('./CategoryColumn', () => ({
  CategoryColumn: ({ category }: any) => <div data-testid="category-col">{category.title}</div>,
}));

vi.mock('./ItemCard', () => ({
  ItemCard: ({ item }: any) => <div data-testid="item-card">{item.name}</div>,
}));

vi.mock('@/store/AppContext', () => ({
  useAppStore: vi.fn(),
}));

describe('Board', () => {
  const categories = [
    { id: 'c1', title: 'Groceries', items: [{ id: 'i1', name: 'Milk', person: 'Alice' }, { id: 'i3', name: 'Eggs', person: 'Alice' }] },
    { id: 'c2', title: 'Hardware', items: [{ id: 'i2', name: 'Nails', person: 'Bob' }] },
  ];

  const mockStore = {
    categories,
    setCategories: vi.fn((cb) => {
      if (typeof cb === 'function') {
        cb(categories);
      }
    }),
    moveItem: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAppStore as any).mockReturnValue(mockStore);
  });

  it('renders all categories', () => {
    render(<Board />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.getByText('Hardware')).toBeInTheDocument();
  });

  it('filters by search query', () => {
    render(<Board searchQuery="Milk" />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Hardware')).not.toBeInTheDocument();
  });

  it('filters by person', () => {
    render(<Board peopleFilter={['Alice']} />);
    expect(screen.getByText('Groceries')).toBeInTheDocument();
    expect(screen.queryByText('Hardware')).not.toBeInTheDocument();
  });

  it('handles drag start and shows drag overlay', () => {
    render(<Board />);
    const dragStartBtn = screen.getByTestId('drag-start');
    
    // Simulate drag start
    fireEvent.click(dragStartBtn, {
      target: {
        value: JSON.stringify({
          active: {
            id: 'i1',
            data: { current: { item: { id: 'i1', name: 'Milk' }, categoryId: 'c1' } }
          }
        })
      }
    });

    // Check if DragOverlay contains the active item
    expect(screen.getByTestId('drag-overlay')).toHaveTextContent('Milk');
  });

  it('handles drag over between different categories', () => {
    render(<Board />);
    const dragOverBtn = screen.getByTestId('drag-over');
    
    // Simulate drag over from c1 to c2
    fireEvent.click(dragOverBtn, {
      target: {
        value: JSON.stringify({
          active: {
            id: 'i1',
            data: { current: { categoryId: 'c1' } }
          },
          over: {
            id: 'c2',
            data: { current: { type: 'Category' } }
          }
        })
      }
    });

    expect(mockStore.moveItem).toHaveBeenCalledWith('i1', 'c2');
    expect(mockStore.setCategories).toHaveBeenCalled();
  });

  it('handles drag over between different categories but on an item', () => {
    render(<Board />);
    const dragOverBtn = screen.getByTestId('drag-over');
    
    // Simulate drag over from c1 to an item in c2
    fireEvent.click(dragOverBtn, {
      target: {
        value: JSON.stringify({
          active: {
            id: 'i1',
            data: { current: { categoryId: 'c1' } }
          },
          over: {
            id: 'i2',
            data: { current: { type: 'Item', categoryId: 'c2' } }
          }
        })
      }
    });

    expect(mockStore.moveItem).toHaveBeenCalledWith('i1', 'c2');
    expect(mockStore.setCategories).toHaveBeenCalled();
  });

  it('handles drag over returning early if not over anything', () => {
    render(<Board />);
    const dragOverBtn = screen.getByTestId('drag-over');
    
    fireEvent.click(dragOverBtn, {
      target: {
        value: JSON.stringify({
          active: { id: 'i1' },
          over: null
        })
      }
    });

    expect(mockStore.moveItem).not.toHaveBeenCalled();
  });

  it('handles drag over returning early if activeId is same as overId', () => {
    render(<Board />);
    const dragOverBtn = screen.getByTestId('drag-over');
    
    fireEvent.click(dragOverBtn, {
      target: {
        value: JSON.stringify({
          active: { id: 'i1' },
          over: { id: 'i1' }
        })
      }
    });

    expect(mockStore.moveItem).not.toHaveBeenCalled();
  });

  it('handles drag end to sort items in the same category', () => {
    render(<Board />);
    const dragEndBtn = screen.getByTestId('drag-end');
    
    // Simulate drag end within the same category
    fireEvent.click(dragEndBtn, {
      target: {
        value: JSON.stringify({
          active: {
            id: 'i1',
            data: { current: { categoryId: 'c1' } }
          },
          over: {
            id: 'i3',
            data: { current: { categoryId: 'c1' } }
          }
        })
      }
    });

    expect(mockStore.setCategories).toHaveBeenCalled();
  });

  it('handles drag end returning early if over is null', () => {
    render(<Board />);
    const dragEndBtn = screen.getByTestId('drag-end');
    
    fireEvent.click(dragEndBtn, {
      target: {
        value: JSON.stringify({
          active: { id: 'i1' },
          over: null
        })
      }
    });

    expect(mockStore.setCategories).not.toHaveBeenCalled();
  });

  it('handles drag end returning early if activeId is same as overId', () => {
    render(<Board />);
    const dragEndBtn = screen.getByTestId('drag-end');
    
    fireEvent.click(dragEndBtn, {
      target: {
        value: JSON.stringify({
          active: { id: 'i1' },
          over: { id: 'i1' }
        })
      }
    });

    expect(mockStore.setCategories).not.toHaveBeenCalled();
  });
});
